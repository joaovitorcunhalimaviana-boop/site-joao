import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { InputValidator, logSecurityEvent } from '@/lib/security-audit'
import { sanitizeMedicalFormData, validateEmail, isValidPhone } from '@/lib/security'
import { withRateLimit, RATE_LIMIT_CONFIGS, getClientIP } from '@/lib/rate-limiter'

// Interface para dados do paciente
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



// Função para limpar dados antigos automaticamente
function cleanupOldData() {
  const today = new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-')
  
  console.log('=== LIMPEZA AUTOMÁTICA PACIENTES ===')
  console.log('Data atual (Brasília):', today)
  console.log('Pacientes antes da limpeza:', memoryPatients.length)
  
  // Remover pacientes antigos (mais de 30 dias)
  const initialLength = memoryPatients.length
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0] || ''
  
  memoryPatients = memoryPatients.filter(patient => {
    return patient.createdAt && thirtyDaysAgoStr && patient.createdAt >= thirtyDaysAgoStr
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
      console.log(`📁 Carregados ${filePatients.length} pacientes do arquivo patients.json`)
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
      type: 'particular'
    },
    status: 'aguardando',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'patient_3',
    name: 'Ana Costa',
    phone: '(11) 77777-3333',
    whatsapp: '(11) 77777-3333',
    birthDate: '1990-12-08',
    insurance: {
      type: 'unimed',
      plan: 'Unimed Premium'
    },
    status: 'aguardando',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
      plan: 'Unimed Executivo'
    },
    status: 'aguardando',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Executar limpeza a cada hora (sem execução imediata para evitar problemas de inicialização)
setInterval(cleanupOldData, 60 * 60 * 1000) // 1 hora

// Função para buscar consultas da API de consultas
async function getConsultations() {
  // Importar diretamente as consultas para evitar problemas de autenticação
  const { consultations } = await import('../consultations/data')
  console.log('=== CONSULTATIONS IMPORTED ===')
  console.log('Total consultas importadas:', consultations.length)
  console.log('Consultas:', consultations.map(c => ({ id: c.id, patientId: c.patientId, date: c.date, status: c.status })))
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
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.PATIENTS,
    async () => {
      if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }

      try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const id = searchParams.get('id')

    // Combinar pacientes do arquivo JSON com pacientes em memória
    const filePatients = loadPatientsFromFile()
    const allPatients = [...filePatients, ...memoryPatients]
    
    // Remover duplicatas baseado no ID
    const uniquePatients = allPatients.filter((patient, index, self) => 
      index === self.findIndex(p => p.id === patient.id)
    )
    
    console.log(`📊 Total de pacientes: ${uniquePatients.length} (${filePatients.length} do arquivo + ${memoryPatients.length} em memória)`)
    
    let filteredPatients = uniquePatients

    // Se solicitado um paciente específico por ID
    if (id) {
      const patient = uniquePatients.find(p => p.id === id)
      if (!patient) {
        return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
      }
      return NextResponse.json(patient)
    }

    // Filtrar por busca (nome, telefone, CPF)
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPatients = filteredPatients.filter(patient => 
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
        dateConsultations = allConsultations.filter(c =>
          c.date === date && c.status === 'completed'
        )
        console.log('=== FILTRANDO PACIENTES ATENDIDOS ===')
        console.log('Data solicitada:', date)
        console.log('Status solicitado:', status)
        console.log('Total de consultas:', allConsultations.length)
        console.log('Consultas da data:', allConsultations.filter(c => c.date === date).length)
        console.log('Consultas concluídas da data:', dateConsultations.length)
        console.log('Consultas concluídas:', dateConsultations)
        console.log('=====================================')
      } else {
        dateConsultations = allConsultations.filter(c =>
          c.date === date && c.status === 'scheduled'
        )
      }
      
      const patientIds = dateConsultations.map(c => c.patientId)
      filteredPatients = filteredPatients.filter(p => patientIds.includes(p.id))
      
      // Adicionar informações da consulta
      const patientsWithConsultations = filteredPatients.map(patient => {
        const consultation = dateConsultations.find(c => c.patientId === patient.id)
        return {
          ...patient,
          consultation
        }
      })
      
      return NextResponse.json({
        patients: patientsWithConsultations,
        total: patientsWithConsultations.length
      })
    }

        return NextResponse.json({
          patients: filteredPatients,
          total: filteredPatients.length
        })

      } catch (error) {
        console.error('Erro ao buscar pacientes:', error)
        return NextResponse.json(
          { error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'PATIENTS_LIST_ACCESS',
      resourceName: 'Patients API'
    }
  )
}

// POST - Criar novo paciente
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.PATIENTS,
    async () => {
      if (!verifyAuth(request)) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }

      try {
    const patientData = await request.json()
    
    // Obter IP do cliente para auditoria
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
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
        payload: { errors: medicalValidation.errors, originalData: patientData },
        severity: 'MEDIUM'
      })
      
      return NextResponse.json(
        { error: 'Dados do paciente contêm informações inválidas', details: medicalValidation.errors },
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
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }
    
    if (!isValidPhone(sanitizedData['phone'])) {
      return NextResponse.json(
        { error: 'Telefone inválido' },
        { status: 400 }
      )
    }

    const newPatient: Patient = {
      id: Date.now().toString(),
      ...(sanitizedData as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    memoryPatients.push(newPatient)

        return NextResponse.json({
          success: true,
          message: 'Paciente cadastrado com sucesso',
          patient: newPatient
        })

      } catch (error) {
        console.error('Erro ao criar paciente:', error)
        return NextResponse.json(
          { error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'PATIENT_CREATE',
      resourceName: 'Patients API'
    }
  )
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
    
    // Primeiro tentar encontrar em memoryPatients
    let patientIndex = memoryPatients.findIndex(p => p.id === patientId)
    
    if (patientIndex !== -1) {
      memoryPatients[patientIndex] = {
        ...memoryPatients[patientIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      }
      
      return NextResponse.json({
        success: true,
        message: 'Paciente atualizado com sucesso',
        patient: memoryPatients[patientIndex]
      })
    }
    
    // Se não encontrou em memória, verificar se existe no arquivo
    const filePatients = loadPatientsFromFile()
    const filePatientIndex = filePatients.findIndex(p => p.id === patientId)
    
    if (filePatientIndex === -1) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }
    
    // Atualizar paciente do arquivo movendo para memória
    const updatedPatient = {
      ...filePatients[filePatientIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    memoryPatients.push(updatedPatient)

    return NextResponse.json({
      success: true,
      message: 'Paciente atualizado com sucesso',
      patient: updatedPatient
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

    // Tentar remover de memoryPatients primeiro
    const memoryPatientIndex = memoryPatients.findIndex(p => p.id === patientId)
    
    if (memoryPatientIndex !== -1) {
      const deletedPatient = memoryPatients.splice(memoryPatientIndex, 1)[0]
      return NextResponse.json({
        success: true,
        message: 'Paciente removido com sucesso',
        patient: deletedPatient
      })
    }
    
    // Se não encontrou em memória, verificar se existe no arquivo
    const filePatients = loadPatientsFromFile()
    const filePatientExists = filePatients.some(p => p.id === patientId)
    
    if (!filePatientExists) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }
    
    // Paciente existe no arquivo mas não pode ser removido diretamente
    // Em um sistema real, você implementaria a remoção do arquivo aqui
    return NextResponse.json(
      { error: 'Paciente do arquivo não pode ser removido via API' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erro ao remover paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}