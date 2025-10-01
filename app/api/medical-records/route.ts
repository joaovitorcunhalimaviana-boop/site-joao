import { NextRequest, NextResponse } from 'next/server'
import {
  getAllMedicalRecords,
  getMedicalRecordsByPatient,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  type MedicalRecord
} from '@/lib/unified-patient-system'

// GET - Buscar prontuários por paciente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const recordId = searchParams.get('id')

    if (recordId) {
      const records = getAllMedicalRecords()
      const record = records.find(r => r.id === recordId)
      if (!record) {
        return NextResponse.json(
          { error: 'Prontuário não encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(record)
    }

    if (patientId) {
      const patientRecords = getMedicalRecordsByPatient(patientId)
      // Ordenar por data mais recente primeiro
      patientRecords.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      return NextResponse.json(patientRecords)
    }

    // Retornar todos os prontuários se não houver filtro
    const allRecords = getAllMedicalRecords()
    return NextResponse.json(allRecords)
  } catch (error) {
    console.error('Erro ao buscar prontuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo prontuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
      doctorCrm 
    } = body

    // Validação básica
    if (!medicalPatientId || !anamnesis) {
      return NextResponse.json(
        { error: 'medicalPatientId e anamnesis são obrigatórios' },
        { status: 400 }
      )
    }

    // Usar data/hora atual se não fornecidas
    const now = new Date()
    const brasiliaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}))
    
    const recordData = {
      medicalPatientId,
      consultationDate: consultationDate || brasiliaTime.toISOString().split('T')[0],
      consultationTime: consultationTime || brasiliaTime.toTimeString().split(' ')[0].substring(0, 5),
      anamnesis,
      physicalExamination: physicalExamination || '',
      diagnosis: diagnosis || '',
      treatment: treatment || '',
      prescription: prescription || '',
      observations: observations || '',
      doctorName: doctorName || '',
      doctorCrm: doctorCrm || ''
    }

    const result = createMedicalRecord(recordData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result.record, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar prontuário médico:', error)
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
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const result = updateMedicalRecord(id, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.message === 'Prontuário médico não encontrado' ? 404 : 400 }
      )
    }

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
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    const result = deleteMedicalRecord(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.message === 'Prontuário médico não encontrado' ? 404 : 400 }
      )
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error('Erro ao deletar prontuário médico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
