import { NextRequest, NextResponse } from 'next/server'
import { InputValidator, logSecurityEvent } from '@/lib/security-audit'
import {
  sanitizeMedicalFormData,
  validateEmail,
  isValidPhone,
} from '@/lib/security'
import { getTodayISO, getTimestampISO } from '@/lib/date-utils'
import { 
  getAllMedicalPatients,
  createMedicalPatient,
  updateMedicalPatient,
  deleteMedicalPatient,
  MedicalPatient,
  getCommunicationContactById
} from '@/lib/unified-patient-system'

// Interface para compatibilidade com o sistema antigo
interface Patient {
  id: string
  name: string
  email?: string
  phone: string
  whatsapp: string
  birthDate: string
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
  }
  status?: 'aguardando' | 'atendido' | 'cancelado'
  createdAt: string
  updatedAt: string
}

// Função para converter pacientes médicos em formato antigo (compatibilidade)
async function convertMedicalPatientsToOldFormat(medicalPatients: MedicalPatient[]): Promise<Patient[]> {
  const patients: Patient[] = []
  
  for (const mp of medicalPatients) {
    const communicationContact = await getCommunicationContactById(mp.communicationContactId)
    
    patients.push({
      id: mp.id,
      name: mp.fullName,
      email: communicationContact?.email,
      phone: communicationContact?.whatsapp || '(00) 00000-0000',
      whatsapp: communicationContact?.whatsapp || '(00) 00000-0000',
      birthDate: communicationContact?.birthDate || '',
      insurance: {
        type: mp.insurance?.type as 'particular' | 'unimed' | 'outro' || 'particular',
        plan: mp.insurance?.plan
      },
      status: 'aguardando',
      createdAt: mp.createdAt,
      updatedAt: mp.updatedAt
    })
  }
  
  return patients
}

// Função para limpar dados antigos automaticamente
function cleanupOldData() {
  const today = getTodayISO()

  console.log('=== LIMPEZA AUTOMÁTICA PACIENTES ===')
  console.log('Data atual (Brasília):', today)
  console.log('Pacientes antes da limpeza:', memoryPatients.length)

  // Remover pacientes antigos (mais de 30 dias)
  const initialLength = memoryPatients.length
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0] || ''

  memoryPatients = memoryPatients.filter(patient => {
    return (
      patient.createdAt &&
      thirtyDaysAgoStr &&
      patient.createdAt >= thirtyDaysAgoStr
    )
  })

  const removedCount = initialLength - memoryPatients.length
  console.log(`Removidos ${removedCount} pacientes antigos`)
  console.log('Pacientes após limpeza:', memoryPatients.length)
  console.log('====================================')
}

// Função para carregar pacientes do arquivo JSON
function loadPatientsFromFile(): Patient[] {
  try {
    const patientsFile = path.join(process.cwd(), 'data', 'patients.json')
    if (fs.existsSync(patientsFile)) {
      const data = fs.readFileSync(patientsFile, 'utf8')
      const filePatients = JSON.parse(data)
      console.log(
        `📁 Carregados ${filePatients.length} pacientes do arquivo patients.json`
      )
      return filePatients
    }
    return []
  } catch (error) {
    console.error('Erro ao carregar pacientes do arquivo:', error)
    return []
  }
}

// Armazenamento em memória (em produção, usar banco de dados)
let memoryPatients: Patient[] = [
  // Pacientes com consultas de hoje
  {
    id: 'patient_2',
    name: 'João Santos',
    phone: '(11) 88888-2222',
    whatsapp: '(11) 88888-2222',
    birthDate: '1978-07-22',
    insurance: {
      type: 'particular',
    },
    status: 'aguardando',
    createdAt: getTimestampISO(),
    updatedAt: getTimestampISO(),
  },
  {
    id: 'patient_3',
    name: 'Ana Costa',
    phone: '(11) 77777-3333',
    whatsapp: '(11) 77777-3333',
    birthDate: '1990-12-08',
    insurance: {
      type: 'unimed',
      plan: 'Unimed Premium',
    },
    status: 'aguardando',
    createdAt: getTimestampISO(),
    updatedAt: getTimestampISO(),
  },
  // Paciente com consulta futura (deve ser mantido)
  {
    id: 'patient_5',
    name: 'Carla Oliveira',
    phone: '(11) 55555-5555',
    whatsapp: '(11) 55555-5555',
    birthDate: '1982-09-30',
    insurance: {
      type: 'unimed',
      plan: 'Unimed Executivo',
    },
    status: 'aguardando',
    createdAt: getTimestampISO(),
    updatedAt: getTimestampISO(),
  },
]

// Executar limpeza a cada hora (sem execução imediata para evitar problemas de inicialização)
setInterval(cleanupOldData, 60 * 60 * 1000) // 1 hora

// Função para buscar consultas da API de consultas
async function getConsultations() {
  // Importar diretamente as consultas para evitar problemas de autenticação
  const { consultations } = await import('../consultations/data')
  console.log('=== CONSULTATIONS IMPORTED ===')
  console.log('Total consultas importadas:', consultations.length)
  console.log(
    'Consultas:',
    consultations.map(c => ({
      id: c.id,
      patientId: c.patientId,
      date: c.date,
      status: c.status,
    }))
  )
  console.log('==============================')
  return consultations
}

// Função para verificar autenticação
function verifyAuth(_request: NextRequest): boolean {
  // Temporariamente permitir acesso sem autenticação para debug
  return true
}

// GET - Listar pacientes
export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const id = searchParams.get('id')

    // Obter pacientes médicos do sistema unificado
    const medicalPatients = await getAllMedicalPatients()
    const patients = await convertMedicalPatientsToOldFormat(medicalPatients)

    console.log(`📊 Total de pacientes médicos: ${patients.length}`)

    let filteredPatients = patients

    // Se solicitado um paciente específico por ID
    if (id) {
      const patient = patients.find(p => p.id === id)
      if (!patient) {
        return NextResponse.json(
          { error: 'Paciente não encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(patient)
    }

    // Filtrar por busca (nome, telefone, CPF)
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPatients = filteredPatients.filter(
        patient =>
          patient.name.toLowerCase().includes(searchLower) ||
          patient.phone.includes(search) ||
          patient.whatsapp.includes(search)
      )
    }

    // Se solicitado pacientes para uma data específica
    if (date) {
      const allConsultations = await getConsultations()
      let dateConsultations

      // Filtrar por status se especificado
      if (status === 'concluida') {
        dateConsultations = allConsultations.filter(
          c => c.date === date && c.status === 'completed'
        )
        console.log('=== FILTRANDO PACIENTES ATENDIDOS ===')
        console.log('Data solicitada:', date)
        console.log('Status solicitado:', status)
        console.log('Total de consultas:', allConsultations.length)
        console.log(
          'Consultas da data:',
          allConsultations.filter(c => c.date === date).length
        )
        console.log('Consultas concluídas da data:', dateConsultations.length)
        console.log('Consultas concluídas:', dateConsultations)
        console.log('=====================================')
      } else {
        dateConsultations = allConsultations.filter(
          c => c.date === date && c.status === 'scheduled'
        )
      }

      const patientIds = dateConsultations.map(c => c.patientId)
      filteredPatients = filteredPatients.filter(p => patientIds.includes(p.id))

      // Adicionar informações da consulta
      const patientsWithConsultations = filteredPatients.map(patient => {
        const consultation = dateConsultations.find(
          c => c.patientId === patient.id
        )
        return {
          ...patient,
          consultation,
        }
      })

      return NextResponse.json({
        patients: patientsWithConsultations,
        total: patientsWithConsultations.length,
      })
    }

    return NextResponse.json({
      patients: filteredPatients,
      total: filteredPatients.length,
    })
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo paciente
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const patientData = await request.json()

    // Obter IP do cliente para auditoria
    const clientIP =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''

    // Validação de segurança dos dados médicos
    const medicalValidation = InputValidator.validateMedicalData(patientData)
    if (!medicalValidation.isValid) {
      logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        ip: clientIP,
        userAgent,
        path: '/api/patients',
        payload: {
          errors: medicalValidation.errors,
          originalData: patientData,
        },
        severity: 'MEDIUM',
      })

      return NextResponse.json(
        {
          error: 'Dados do paciente contêm informações inválidas',
          details: medicalValidation.errors,
        },
        { status: 400 }
      )
    }

    // Usar dados sanitizados
    const sanitizedData = medicalValidation.sanitized

    // Validações básicas
    if (!sanitizedData['name'] || !sanitizedData['phone']) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Validações adicionais de segurança
    if (sanitizedData['email'] && !validateEmail(sanitizedData['email'])) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    if (!isValidPhone(sanitizedData['phone'])) {
      return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 })
    }

    // Criar paciente no sistema unificado
    const medicalPatientData = {
      fullName: sanitizedData['name'],
      communicationContactId: '', // Será criado automaticamente
      insurance: {
        type: sanitizedData['insurance']?.type || 'particular',
        plan: sanitizedData['insurance']?.plan
      },
      createdBy: 'api-patients'
    }

    // Dados do contato de comunicação
    const communicationData = {
      email: sanitizedData['email'],
      whatsapp: sanitizedData['phone'] || sanitizedData['whatsapp'],
      birthDate: sanitizedData['birthDate']
    }

    const result = await createMedicalPatient(medicalPatientData, communicationData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Converter para formato antigo para compatibilidade
    const patients = await convertMedicalPatientsToOldFormat([result.patient!])
    const newPatient = patients[0]

    return NextResponse.json({
      success: true,
      message: 'Paciente cadastrado com sucesso',
      patient: newPatient,
    })
  } catch (error) {
    console.error('Erro ao criar paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar paciente
export async function PUT(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('id')

    if (!patientId) {
      return NextResponse.json(
        { error: 'ID do paciente é obrigatório' },
        { status: 400 }
      )
    }

    const updateData = await request.json()

    // Preparar dados para atualização no sistema unificado
    const medicalPatientUpdate: Partial<MedicalPatient> = {}
    
    if (updateData.name) {
      medicalPatientUpdate.fullName = updateData.name
    }
    
    if (updateData.insurance) {
      medicalPatientUpdate.insurance = {
        type: updateData.insurance.type,
        plan: updateData.insurance.plan
      }
    }

    const result = await updateMedicalPatient(patientId, medicalPatientUpdate)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Paciente médico não encontrado' ? 404 : 400 }
      )
    }

    // Converter para formato antigo para compatibilidade
    const patients = await convertMedicalPatientsToOldFormat([result.patient!])
    const updatedPatient = patients[0]

    return NextResponse.json({
      success: true,
      message: 'Paciente atualizado com sucesso',
      patient: updatedPatient,
    })
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover paciente
export async function DELETE(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('id')

    if (!patientId) {
      return NextResponse.json(
        { error: 'ID do paciente é obrigatório' },
        { status: 400 }
      )
    }

    const result = await deleteMedicalPatient(patientId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Paciente médico não encontrado' ? 404 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Paciente removido com sucesso',
    })
  } catch (error) {
    console.error('Erro ao remover paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
