import { NextRequest, NextResponse } from 'next/server'
import { redisCache } from '@/lib/redis-cache'
import {
  getAllMedicalRecords,
  getMedicalRecordsByPatient,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  type MedicalRecord,
} from '@/lib/unified-patient-system-prisma'

// GET - Buscar prontuários por paciente
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API medical-records GET iniciada')
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const recordId = searchParams.get('id')

    console.log('🔍 Parâmetros recebidos:', { patientId, recordId })

    if (recordId) {
      console.log('🔍 Buscando registro específico:', recordId)
      // Cache individual de prontuário
      const cacheKey = `medical-record:${recordId}`
      const cachedRecord = await redisCache.get(cacheKey)
      if (cachedRecord) {
        console.log('🔍 Registro encontrado no cache')
        return NextResponse.json(cachedRecord)
      }

      console.log('🔍 Carregando todos os registros para buscar específico')
      const records = getAllMedicalRecords()
      console.log('🔍 Total de registros carregados:', records.length)

      const record = records.find(r => r.id === recordId)
      if (!record) {
        console.log('🔍 Registro não encontrado')
        return NextResponse.json(
          { error: 'Prontuário não encontrado' },
          { status: 404 }
        )
      }

      // Cache por 10 minutos
      await redisCache.set(cacheKey, record, {
        ttl: 5 * 60 * 1000, // 5 minutos
        tags: ['medical-records', `patient:${record.medicalPatientId}`],
      })

      console.log('🔍 Registro específico encontrado e retornado')
      return NextResponse.json(record)
    }

    if (patientId) {
      console.log('🔍 Buscando registros por paciente:', patientId)
      // Cache de prontuários por paciente
      const cacheKey = `medical-records:patient:${patientId}`
      const cachedRecords = await redisCache.get(cacheKey)
      if (cachedRecords && Array.isArray(cachedRecords)) {
        console.log(
          '🔍 Registros do paciente encontrados no cache:',
          cachedRecords.length
        )
        return NextResponse.json(cachedRecords)
      }

      console.log('🔍 Carregando registros do paciente do arquivo')
      const patientRecords = getMedicalRecordsByPatient(patientId)
      console.log(
        '🔍 Registros encontrados para o paciente:',
        patientRecords.length
      )

      // Ordenar por data mais recente primeiro
      patientRecords.sort(
        (a, b) =>
          new Date(b.consultationDate).getTime() -
          new Date(a.consultationDate).getTime()
      )

      // Cache por 5 minutos
      await redisCache.set(cacheKey, patientRecords, {
        ttl: 5 * 60 * 1000, // 5 minutos
        tags: ['medical-records', `patient:${patientId}`],
      })

      console.log('🔍 Retornando registros do paciente:', patientRecords.length)
      return NextResponse.json(patientRecords)
    }

    console.log('🔍 Buscando todos os registros')
    // Cache de todos os prontuários
    const cacheKey = 'medical-records:all'
    const cachedAllRecords = await redisCache.get(cacheKey)
    if (cachedAllRecords) {
      console.log('🔍 Todos os registros encontrados no cache')
      return NextResponse.json(cachedAllRecords)
    }

    // Retornar todos os prontuários se não houver filtro
    const allRecords = getAllMedicalRecords()
    console.log('🔍 Total de registros carregados:', allRecords.length)

    // Cache por 3 minutos
    await redisCache.set(cacheKey, allRecords, {
      ttl: 3 * 60 * 1000,
      tags: ['medical-records'],
    })

    console.log('🔍 Retornando todos os registros')
    return NextResponse.json(allRecords)
  } catch (error) {
    console.error('❌ Erro detalhado na API medical-records:', error)
    console.error(
      '❌ Stack trace:',
      error instanceof Error ? error.stack : 'Stack não disponível'
    )
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// POST - Criar novo prontuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 API medical-records POST - Dados recebidos:', body)

    const {
      medicalPatientId,
      consultationDate,
      consultationTime,
      anamnesis,
      physicalExamination,
      diagnosis,
      treatment,
      prescription,
      observations,
      doctorName,
      doctorCrm,
      calculatorResults,
      attachments,
      diagnosticHypotheses,
    } = body

    // Validação básica
    if (!medicalPatientId || !anamnesis) {
      console.log('🔍 API medical-records POST - Erro de validação:', {
        medicalPatientId,
        anamnesis,
      })
      return NextResponse.json(
        { error: 'medicalPatientId e anamnesis são obrigatórios' },
        { status: 400 }
      )
    }

    // Usar data/hora atual se não fornecidas
    const now = new Date()
    const brasiliaTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    )

    const recordData = {
      medicalPatientId,
      consultationDate:
        consultationDate || brasiliaTime.toISOString().split('T')[0],
      consultationTime:
        consultationTime ||
        brasiliaTime.toTimeString().split(' ')[0].substring(0, 5),
      anamnesis,
      physicalExamination: physicalExamination || '',
      diagnosis: diagnosis || '',
      treatment: treatment || '',
      prescription: prescription || '',
      observations: observations || '',
      doctorName: doctorName || '',
      doctorCrm: doctorCrm || '',
      calculatorResults: calculatorResults || [],
      attachments: attachments || [],
      diagnosticHypotheses: diagnosticHypotheses || [],
    }

    console.log(
      '🔍 API medical-records POST - Dados para createMedicalRecord:',
      recordData
    )

    const result = createMedicalRecord(recordData)

    console.log(
      '🔍 API medical-records POST - Resultado de createMedicalRecord:',
      result
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    // Invalidar cache relacionado aos prontuários médicos
    await redisCache.invalidateByTags([
      'medical-records',
      `patient:${medicalPatientId}`,
    ])

    return NextResponse.json(result.record, { status: 201 })
  } catch (error) {
    console.error('🔍 API medical-records POST - Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar prontuário existente
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const body = await request.json()

    const result = updateMedicalRecord(id, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        {
          status:
            result.message === 'Prontuário médico não encontrado' ? 404 : 400,
        }
      )
    }

    // Invalidar cache relacionado aos prontuários médicos
    await redisCache.invalidateByTags([
      'medical-records',
      `patient:${result.record?.medicalPatientId}`,
      `medical-record:${id}`,
    ])

    return NextResponse.json(result.record)
  } catch (error) {
    console.error('Erro ao atualizar prontuário médico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir prontuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const result = deleteMedicalRecord(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        {
          status:
            result.message === 'Prontuário médico não encontrado' ? 404 : 400,
        }
      )
    }

    // Invalidar cache relacionado aos prontuários médicos
    await redisCache.invalidateByTags([
      'medical-records',
      `medical-record:${id}`,
    ])

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error('Erro ao deletar prontuário médico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
