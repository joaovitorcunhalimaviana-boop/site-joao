// Sistema Unificado de Agendamentos
// Integra agendamentos de pacientes, médicos e secretárias em uma agenda única
// Versão compatível com browser usando localStorage

import { getTodayISO, getBrasiliaTimestamp } from './date-utils'
import {
  sendTelegramAppointmentNotification,
  type AppointmentNotificationData,
} from './telegram-notifications'
import { addEmailToIntegratedSystem } from './email-integration'

// Interfaces principais
export interface UnifiedAppointment {
  id: string
  patientId: string
  patientName: string
  patientCpf: string
  patientMedicalRecordNumber: number
  patientPhone: string
  patientWhatsapp: string
  patientEmail?: string
  patientBirthDate?: string
  insuranceType: 'unimed' | 'particular' | 'outro'
  insurancePlan?: string
  appointmentDate: string // YYYY-MM-DD
  appointmentTime: string // HH:MM
  appointmentType:
    | 'consulta'
    | 'retorno'
    | 'urgencia'
    | 'teleconsulta'
    | 'visita_domiciliar'
  status:
    | 'agendada'
    | 'confirmada'
    | 'em_andamento'
    | 'concluida'
    | 'cancelada'
    | 'reagendada'
  source: 'public_appointment' | 'doctor_area' | 'secretary_area' // Origem do agendamento
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy?: string // ID do usuário que criou (médico/secretária)
}

export interface Patient {
  id: string
  name: string
  cpf: string
  medicalRecordNumber: number
  phone: string
  whatsapp: string
  email?: string
  birthDate?: string
  insurance: {
    type: 'unimed' | 'particular' | 'outro'
    plan?: string
  }
  medicalRecord?: {
    allergies?: string[]
    medications?: string[]
    conditions?: string[]
    notes?: string
  }
  source?: 'medical_area' | 'secretary_area' | 'public_appointment' // Origem do cadastro
  createdAt: string
  updatedAt: string
}

export interface DailyAgenda {
  date: string // YYYY-MM-DD
  appointments: UnifiedAppointment[]
  totalPatients: number
  confirmedAppointments: number
  pendingAppointments: number
  completedAppointments: number
}

// Chaves do localStorage
const APPOINTMENTS_KEY = 'unified-appointments'
const PATIENTS_KEY = 'unified-patients'

// Função para validar CPF
export function validateCPF(cpf: string): boolean {
  // Verifica se o CPF é válido antes de processar
  if (!cpf || typeof cpf !== 'string') return false
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '')

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

// Função para formatar CPF
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '')
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Função para ler dados do arquivo (servidor) ou localStorage (cliente)
async function loadFromStorage<T>(key: string): Promise<T[]> {
  // Se estiver no servidor, usar a API de backup para ler do arquivo
  if (typeof window === 'undefined') {
    console.log(`📱 Servidor: carregando dados do arquivo para [${key}]`)
    try {
      const fs = await import('fs/promises')
      const path = await import('path')

      const dataDir = path.join(process.cwd(), 'data')
      let fileName: string

      if (key === PATIENTS_KEY) {
        fileName = 'patients.json'
      } else if (key === APPOINTMENTS_KEY) {
        fileName = 'appointments.json'
      } else {
        fileName = `${key}.json`
      }

      const filePath = path.join(dataDir, fileName)

      // Verificar se o arquivo existe
      try {
        await fs.access(filePath)
      } catch {
        console.log(`📭 Arquivo não encontrado [${key}]: ${fileName}`)
        return []
      }

      // Ler dados do arquivo
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(fileContent)
      console.log(
        `✅ Dados carregados do arquivo [${key}]: ${Array.isArray(data) ? data.length : 'objeto'} itens`
      )
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error(`❌ Erro ao carregar do arquivo [${key}]:`, error)
      return []
    }
  }

  // Se estiver no cliente, usar localStorage
  try {
    console.log(`📖 Cliente: lendo dados do localStorage [${key}]`)
    const item = localStorage.getItem(key)
    if (!item) {
      console.log(
        `📭 Nenhum dado encontrado no localStorage [${key}], tentando recuperar do backup`
      )

      // Se for a chave de pacientes e não houver dados, tentar recuperar do backup
      if (key === PATIENTS_KEY) {
        const patients = await loadPatientBackup()
        if (patients.length > 0) {
          console.log(
            `🔄 Backup de pacientes carregado: ${patients.length} pacientes`
          )
          await saveToStorage(PATIENTS_KEY, patients)
          return patients as T[]
        }
      }

      return []
    }

    const parsed = JSON.parse(item)
    console.log(
      `✅ Dados carregados do localStorage [${key}]:`,
      Array.isArray(parsed) ? `${parsed.length} itens` : 'objeto'
    )
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`❌ Erro ao ler ${key} do localStorage:`, error)
    return []
  }
}

// Funções de utilidade para localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue

  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.log(
        `📱 localStorage não disponível (servidor) - retornando valor padrão para [${key}]`
      )
      return defaultValue
    }

    console.log(`📖 Lendo dados do localStorage [${key}]`)
    const item = localStorage.getItem(key)
    if (!item) {
      console.log(
        `📭 Nenhum dado encontrado no localStorage [${key}], tentando recuperar do backup`
      )

      // Se for a chave de pacientes e não houver dados, tentar recuperar do backup
      if (key === PATIENTS_KEY) {
        loadPatientBackup()
          .then(async patients => {
            if (patients.length > 0) {
              console.log(
                `🔄 Recuperando ${patients.length} pacientes do backup`
              )
              await saveToStorage(key, patients as T)
            }
          })
          .catch(backupError => {
            console.error('❌ Erro ao carregar backup:', backupError)
          })
      }

      return defaultValue
    }
    const parsed = JSON.parse(item)
    console.log(
      `✅ Dados carregados do localStorage [${key}]:`,
      Array.isArray(parsed) ? `${parsed.length} itens` : 'objeto'
    )
    return parsed
  } catch (error) {
    console.error(`❌ Erro ao ler ${key} do localStorage:`, error)
    return defaultValue
  }
}

// Função para carregar backup de pacientes
async function loadPatientBackup(): Promise<Patient[]> {
  try {
    // Se estiver no servidor, ler diretamente do arquivo
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises')
      const path = await import('path')

      const PATIENTS_FILE = path.join(process.cwd(), 'data', 'patients.json')

      try {
        const data = await fs.readFile(PATIENTS_FILE, 'utf-8')
        const patients = JSON.parse(data)
        console.log(
          '✅ Backup de pacientes carregado do arquivo:',
          patients.length,
          'pacientes'
        )
        return patients
      } catch (fileError) {
        console.log(
          '📁 Arquivo de backup não encontrado, retornando array vazio'
        )
        return []
      }
    } else {
      // Se estiver no cliente, usar fetch
      const response = await fetch('/api/backup-patients')

      if (response.ok) {
        const data = await response.json()
        console.log(
          '✅ Backup de pacientes carregado via API:',
          data.count,
          'pacientes'
        )
        return data.patients || []
      } else {
        console.warn('⚠️ Falha ao carregar backup via API')
        return []
      }
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar backup:', error)
    return []
  }
}

async function saveToStorage<T>(key: string, data: T): Promise<void> {
  // Se estiver no servidor, salvar diretamente no arquivo
  if (typeof window === 'undefined') {
    console.log('📁 Servidor: salvando dados no arquivo')
    if (Array.isArray(data)) {
      try {
        const fs = await import('fs/promises')
        const path = await import('path')

        const dataDir = path.join(process.cwd(), 'data')
        let fileName: string

        if (key === PATIENTS_KEY) {
          fileName = 'patients.json'
        } else if (key === APPOINTMENTS_KEY) {
          fileName = 'appointments.json'
        } else {
          fileName = `${key}.json`
        }

        const filePath = path.join(dataDir, fileName)

        // Criar diretório se não existir
        try {
          await fs.mkdir(dataDir, { recursive: true })
        } catch (mkdirError) {
          // Diretório já existe
        }

        // Salvar dados no arquivo
        await fs.writeFile(filePath, JSON.stringify(data, null, 2))
        console.log(
          `✅ Dados salvos no arquivo [${key}]: ${(data as any[]).length} itens`
        )
      } catch (error) {
        console.error(`❌ Erro ao salvar no arquivo [${key}]:`, error)
      }
    }
    return
  }

  // Se estiver no cliente, salvar no localStorage

  try {
    console.log(
      `🔄 Iniciando salvamento no localStorage [${key}]:`,
      Array.isArray(data) ? `${(data as any[]).length} itens` : 'objeto'
    )
    const jsonData = JSON.stringify(data)
    console.log(`📝 JSON gerado (${jsonData.length} caracteres)`)

    localStorage.setItem(key, jsonData)
    console.log(`✅ Dados salvos no localStorage [${key}]`)

    // Verificar se foi salvo corretamente (apenas no browser)
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(key)
      if (!saved) {
        console.error(
          `❌ Falha ao verificar dados salvos no localStorage [${key}]`
        )
      } else {
        const parsedSaved = JSON.parse(saved)
        console.log(
          `✅ Verificação confirmada: ${Array.isArray(parsedSaved) ? parsedSaved.length : 'objeto'} no localStorage [${key}]`
        )

        // Para pacientes, verificar se o último adicionado está lá
        if (
          key === PATIENTS_KEY &&
          Array.isArray(data) &&
          Array.isArray(parsedSaved)
        ) {
          const originalCount = (data as any[]).length
          const savedCount = parsedSaved.length
          console.log(
            `📊 Contagem: Original=${originalCount}, Salvo=${savedCount}`
          )

          if (originalCount > 0) {
            const lastOriginal = (data as any[])[originalCount - 1]
            const lastSaved = parsedSaved.find(
              (p: any) => p.id === lastOriginal.id
            )
            if (lastSaved) {
              console.log(
                `✅ Último paciente confirmado no localStorage: ${lastSaved.id}`
              )
            } else {
              console.error(
                `❌ Último paciente NÃO encontrado no localStorage: ${lastOriginal.id}`
              )
            }
          }
        }
      }
    }

    // Backup adicional: salvar também via API para persistência
    if (key === PATIENTS_KEY) {
      savePatientBackup(data as Patient[])
    } else if (key === APPOINTMENTS_KEY) {
      saveAppointmentBackup(data as UnifiedAppointment[])
    }
  } catch (error) {
    console.error(`❌ Erro ao salvar ${key} no localStorage:`, error)
  }
}

// Função para backup de pacientes via API
async function savePatientBackup(patients: Patient[]): Promise<void> {
  try {
    const response = await fetch('/api/backup-patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patients }),
    })

    if (response.ok) {
      console.log('✅ Backup de pacientes salvo via API')
    } else {
      console.warn('⚠️ Falha ao salvar backup via API')
    }
  } catch (error) {
    console.warn('⚠️ Erro ao salvar backup via API:', error)
  }
}

// Função para backup de agendamentos via API
async function saveAppointmentBackup(appointments: UnifiedAppointment[]): Promise<void> {
  try {
    const response = await fetch('/api/backup-appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appointments }),
    })

    if (response.ok) {
      console.log('✅ Backup de agendamentos salvo via API')
    } else {
      console.warn('⚠️ Falha ao salvar backup de agendamentos via API')
    }
  } catch (error) {
    console.warn('⚠️ Erro ao salvar backup de agendamentos via API:', error)
  }
}

// Funções de utilidade para IDs
export function generateAppointmentId(): string {
  return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generatePatientId(): string {
  return `pat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Função para obter o próximo número de prontuário médico
export async function getNextMedicalRecordNumber(): Promise<number> {
  try {
    const patients = await getAllPatients()
    
    if (patients.length === 0) {
      return 1
    }
    
    // Encontrar o maior número de prontuário existente
    const maxRecordNumber = patients
      .filter(patient => patient.medicalRecordNumber && typeof patient.medicalRecordNumber === 'number')
      .reduce((max, patient) => {
        return Math.max(max, patient.medicalRecordNumber)
      }, 0)
    
    return maxRecordNumber + 1
  } catch (error) {
    console.error('❌ Erro ao obter próximo número de prontuário:', error)
    return 1
  }
}

// === FUNÇÕES DE AGENDAMENTO ===

// Criar novo agendamento
export async function createAppointment(
  appointmentData: Omit<UnifiedAppointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{
  success: boolean
  appointment?: UnifiedAppointment
  error?: string
}> {
  try {
    // Verificar se já existe agendamento para o mesmo paciente na mesma data/hora
    const existingAppointments = await getAllAppointments()
    const conflictingAppointment = existingAppointments.find(
      apt =>
        apt.patientId === appointmentData.patientId &&
        apt.appointmentDate === appointmentData.appointmentDate &&
        apt.appointmentTime === appointmentData.appointmentTime &&
        apt.status !== 'cancelada'
    )

    if (conflictingAppointment) {
      return {
        success: false,
        error:
          'Já existe um agendamento para este paciente nesta data e horário',
      }
    }

    const newAppointment: UnifiedAppointment = {
      ...appointmentData,
      id: generateAppointmentId(),
      createdAt: getBrasiliaTimestamp(),
      updatedAt: getBrasiliaTimestamp(),
    }

    // Salvar agendamento
    const appointments = await getAllAppointments()
    appointments.push(newAppointment)

    await saveToStorage(APPOINTMENTS_KEY, appointments)

    console.log(
      `✅ Agendamento criado: ${newAppointment.patientName} - ${newAppointment.appointmentDate} ${newAppointment.appointmentTime}`
    )

    // Enviar notificação via Telegram
    try {
      const notificationData: AppointmentNotificationData = {
        patientName: newAppointment.patientName,
        patientEmail: newAppointment.patientEmail,
        patientPhone: newAppointment.patientPhone,
        patientWhatsapp:
          newAppointment.patientWhatsapp || newAppointment.patientPhone,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        insuranceType: newAppointment.insuranceType as
          | 'unimed'
          | 'particular'
          | 'outro',
        appointmentType: newAppointment.appointmentType,
        source: newAppointment.source,
        notes: newAppointment.notes,
      }

      await sendTelegramAppointmentNotification(notificationData)
      console.log('✅ Notificação Telegram enviada com sucesso')
    } catch (telegramError) {
      console.warn('⚠️ Erro ao enviar notificação Telegram:', telegramError)
      // Não falhar o agendamento por causa da notificação
    }

    return { success: true, appointment: newAppointment }
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Obter todos os agendamentos
export async function getAllAppointments(): Promise<UnifiedAppointment[]> {
  try {
    let appointments = await loadFromStorage<UnifiedAppointment>(APPOINTMENTS_KEY)
    
    // Se não há dados no localStorage, tentar carregar do arquivo JSON
    if (appointments.length === 0 && typeof window === 'undefined') {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const filePath = path.join(process.cwd(), 'data', 'appointments.json')
        
        if (fs.existsSync(filePath)) {
          const fileData = fs.readFileSync(filePath, 'utf8')
          const fileAppointments = JSON.parse(fileData) as UnifiedAppointment[]
          
          console.log('📁 Carregando agendamentos do arquivo:', fileAppointments.length)
          
          // Salvar no storage para próximas consultas
          await saveToStorage(APPOINTMENTS_KEY, fileAppointments)
          appointments = fileAppointments
        }
      } catch (fileError) {
        console.log('📁 Nenhum arquivo de dados encontrado, usando dados vazios')
      }
    }
    
    console.log('📅 Total de agendamentos carregados:', appointments.length)
    return appointments
  } catch (error) {
    console.error('❌ Erro ao obter agendamentos:', error)
    return []
  }
}

// Obter agendamentos por data
// Cache para operações frequentes
const appointmentCache = new Map<string, UnifiedAppointment[]>()
const patientCache = new Map<string, Patient>()
const CACHE_TTL = 60000 // 1 minuto

function getCacheKey(date: string): string {
  return `appointments-${date}`
}

function getPatientCacheKey(cpf: string): string {
  return `patient-${cpf}`
}

function clearExpiredCache() {
  // Limpar cache de agendamentos periodicamente
  if (appointmentCache.size > 50) {
    appointmentCache.clear()
  }
  
  // Limpar cache de pacientes periodicamente
  if (patientCache.size > 100) {
    patientCache.clear()
  }
}

export async function getAppointmentsByDate(
  date: string
): Promise<UnifiedAppointment[]> {
  // Verificar cache primeiro
  const cacheKey = getCacheKey(date)
  const cached = appointmentCache.get(cacheKey)
  
  if (cached) {
    return cached
  }

  const appointments = await loadFromStorage<UnifiedAppointment>(APPOINTMENTS_KEY)
  const dayAppointments = appointments.filter(apt => apt.appointmentDate === date)
  
  // Cachear resultado
  appointmentCache.set(cacheKey, dayAppointments)
  
  return dayAppointments
}

export async function createOrUpdatePatient(
  patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; patient?: Patient; error?: string }> {
  try {
    console.log('👤 INICIANDO createOrUpdatePatient:', patientData.name)

    // Verificar cache primeiro
    const cacheKey = getPatientCacheKey(patientData.cpf)
    let existingPatient = patientCache.get(cacheKey)
    
    if (!existingPatient) {
      // Se não estiver no cache, buscar no storage
      const patients = await loadFromStorage<Patient>(PATIENTS_KEY)
      existingPatient = patients.find(p => p.cpf === patientData.cpf)
      
      if (existingPatient) {
        patientCache.set(cacheKey, existingPatient)
      }
    }

    const now = getBrasiliaTimestamp()

    if (existingPatient) {
      console.log('👤 Paciente existente encontrado, atualizando...')
      
      // Atualizar dados do paciente existente
      const updatedPatient: Patient = {
        ...existingPatient,
        name: patientData.name,
        phone: patientData.phone,
        whatsapp: patientData.whatsapp,
        email: patientData.email || existingPatient.email,
        birthDate: patientData.birthDate || existingPatient.birthDate,
        insurance: patientData.insurance,
        updatedAt: now,
      }

      // Atualizar no storage
      const patients = await loadFromStorage<Patient>(PATIENTS_KEY)
      const updatedPatients = patients.map(p =>
        p.id === existingPatient!.id ? updatedPatient : p
      )

      await saveToStorage(PATIENTS_KEY, updatedPatients)
      
      // Atualizar cache
      patientCache.set(cacheKey, updatedPatient)
      
      console.log('👤 Paciente atualizado com sucesso!')
      return { success: true, patient: updatedPatient }
    } else {
      console.log('👤 Criando novo paciente...')
      
      // Gerar número de prontuário apenas se necessário
      const medicalRecordNumber = patientData.medicalRecordNumber || await getNextMedicalRecordNumber()

      const newPatient: Patient = {
        id: generatePatientId(),
        name: patientData.name,
        cpf: patientData.cpf,
        medicalRecordNumber,
        phone: patientData.phone,
        whatsapp: patientData.whatsapp,
        email: patientData.email,
        birthDate: patientData.birthDate,
        insurance: patientData.insurance,
        source: patientData.source || 'public_appointment',
        createdAt: now,
        updatedAt: now,
      }

      // Salvar no storage
      const patients = await loadFromStorage<Patient>(PATIENTS_KEY)
      patients.push(newPatient)
      await saveToStorage(PATIENTS_KEY, patients)
      
      // Adicionar ao cache
      patientCache.set(cacheKey, newPatient)
      
      console.log('👤 Novo paciente criado com sucesso!')
      return { success: true, patient: newPatient }
    }
  } catch (error) {
    console.error('❌ Erro ao criar/atualizar paciente:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

export async function createPublicAppointment(formData: {
  fullName: string
  cpf: string
  email: string
  phone: string
  whatsapp: string
  birthDate: string
  insuranceType: 'unimed' | 'particular' | 'outro'
  selectedDate: Date
  selectedTime: string
}): Promise<{
  success: boolean
  appointment?: UnifiedAppointment
  patient?: Patient
  error?: string
  existingAppointment?: UnifiedAppointment
}> {
  try {
    console.log('🚀 INICIANDO createPublicAppointment:', {
      fullName: formData.fullName,
      date: formData.selectedDate.toISOString().split('T')[0],
      time: formData.selectedTime,
    })

    // Otimização: Verificar apenas conflitos de horário no mesmo dia
    const appointmentDate = formData.selectedDate.toISOString().split('T')[0]
    console.log('🔍 Verificando conflitos para:', appointmentDate, formData.selectedTime)

    // Buscar apenas agendamentos da data específica (com cache)
    const dayAppointments = await getAppointmentsByDate(appointmentDate)
    
    // Verificar se já existe uma consulta no MESMO HORÁRIO (otimizado)
    const existingAppointment = dayAppointments.find(
      apt =>
        apt.status !== 'cancelada' &&
        apt.appointmentTime === formData.selectedTime &&
        (apt.patientCpf === formData.cpf ||
         apt.patientPhone === formData.phone ||
         apt.patientWhatsapp === formData.whatsapp)
    )

    if (existingAppointment) {
      console.log('❌ Conflito encontrado:', existingAppointment)
      return {
        success: false,
        error: 'existing_appointment',
        existingAppointment: existingAppointment,
      }
    }

    console.log('✅ Nenhum conflito encontrado, prosseguindo...')

    // Primeiro, criar ou atualizar o paciente (com cache)
    console.log('👤 Criando/atualizando paciente...')
    const patientResult = await createOrUpdatePatient({
      name: formData.fullName,
      cpf: formData.cpf,
      medicalRecordNumber: 0, // Será gerado automaticamente se for novo paciente
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      birthDate: formData.birthDate,
      insurance: {
        type: formData.insuranceType,
      },
    })

    console.log(
      '👤 Resultado do paciente:',
      patientResult.success ? 'SUCESSO' : 'FALHA',
      patientResult.error
    )

    if (!patientResult.success || !patientResult.patient) {
      console.log('❌ Falha ao criar paciente:', patientResult.error)
      return { success: false, error: patientResult.error }
    }

    // Depois, criar o agendamento
    console.log('📅 Criando agendamento...')
    const appointmentResult = await createAppointment({
      patientId: patientResult.patient.id,
      patientName: formData.fullName,
      patientCpf: formData.cpf,
      patientMedicalRecordNumber: patientResult.patient.medicalRecordNumber,
      patientPhone: formData.phone,
      patientWhatsapp: formData.whatsapp,
      patientEmail: formData.email,
      patientBirthDate: formData.birthDate,
      insuranceType: formData.insuranceType,
      appointmentDate: appointmentDate,
      appointmentTime: formData.selectedTime,
      appointmentType: 'consulta',
      status: 'agendada',
      source: 'public_appointment',
    })

    console.log(
      '📅 Resultado do agendamento:',
      appointmentResult.success ? 'SUCESSO' : 'FALHA',
      appointmentResult.error
    )

    // Limpar cache de agendamentos para a data
    if (appointmentResult.success) {
      appointmentCache.delete(getCacheKey(appointmentDate))
      clearExpiredCache()

      // Integrar email ao sistema após agendamento bem-sucedido
      if (formData.email && formData.email.trim()) {
        try {
          console.log('📧 Integrando email ao sistema:', formData.email)
          await addEmailToIntegratedSystem(
            formData.email,
            formData.fullName,
            'appointment',
            {
              whatsapp: formData.whatsapp,
              birthDate: formData.birthDate,
              patientId: patientResult.patient?.id
            }
          )
          console.log('✅ Email integrado com sucesso ao sistema')

          // Enviar email de boas-vindas automaticamente
          try {
            console.log('📧 Enviando email de boas-vindas automaticamente...')
            
            // Usar API route para enviar email
            const response = await fetch('/api/send-welcome-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: formData.fullName,
                email: formData.email,
                source: 'appointment'
              })
            })
            
            const result = await response.json()
            if (response.ok && result.success) {
              console.log('✅ Email de boas-vindas enviado automaticamente')
            } else {
              console.log('⚠️ Falha ao enviar email de boas-vindas automaticamente:', result.error)
            }
          } catch (welcomeEmailError) {
            console.error('❌ Erro ao enviar email de boas-vindas:', welcomeEmailError)
            // Não falhar o agendamento por erro de email
          }
        } catch (emailError) {
          console.error('❌ Erro ao integrar email:', emailError)
          // Não falhar o agendamento por erro de email
        }
      }
    }

    return {
      success: appointmentResult.success,
      appointment: appointmentResult.appointment,
      patient: patientResult.patient,
      error: appointmentResult.error,
    }
  } catch (error) {
    console.error('❌ Erro ao criar agendamento público:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Obter estatísticas do sistema
export async function cancelAppointment(
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const appointments = await getAllAppointments()
    const appointmentIndex = appointments.findIndex(
      apt => apt.id === appointmentId
    )

    if (appointmentIndex === -1) {
      return { success: false, error: 'Agendamento não encontrado' }
    }

    appointments[appointmentIndex].status = 'cancelada'
    appointments[appointmentIndex].updatedAt = getBrasiliaTimestamp()

    await saveToStorage(APPOINTMENTS_KEY, appointments)

    console.log(
      `✅ Agendamento cancelado: ${appointments[appointmentIndex].patientName}`
    )

    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao cancelar agendamento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

export async function getAllPatients(): Promise<Patient[]> {
  try {
    return await loadFromStorage<Patient>(PATIENTS_KEY)
  } catch (error) {
    console.error('Erro ao carregar todos os pacientes:', error)
    return []
  }
}

export async function getSystemStats(): Promise<{
  totalAppointments: number
  totalPatients: number
  todayAppointments: number
  pendingAppointments: number
  completedAppointments: number
}> {
  const appointments = await getAllAppointments()
  const patients = await getAllPatients()

  // Usar função do date-utils para obter a data correta no fuso horário do Brasil
  const today = getTodayISO()

  console.log('Data atual (Brasil):', today)
  console.log(
    'Agendamentos encontrados:',
    appointments.map(apt => ({
      date: apt.appointmentDate,
      patient: apt.patientName,
    }))
  )

  // Filtrar apenas agendamentos do dia atual
  const todayAppointments = appointments.filter(
    apt => apt.appointmentDate === today
  )

  return {
    totalAppointments: appointments.length,
    totalPatients: patients.length,
    todayAppointments: todayAppointments.length,
    pendingAppointments: todayAppointments.filter(
      apt => apt.status === 'agendada'
    ).length,
    completedAppointments: todayAppointments.filter(
      apt => apt.status === 'concluida'
    ).length,
  }
}

// Inicializar sistema de cron job diário (apenas no servidor)
if (typeof window === 'undefined') {
  console.log('🚀 Inicializando sistema de agendamento automático...')

  // Importação dinâmica para evitar dependência circular
  import('./daily-cron-scheduler').then(module => {
    module.startDailyCronScheduler()
  })

  // Inicializar sistema de aniversários
  import('./birthday-cron-scheduler').then(module => {
    console.log('🎂 Sistema de aniversários automático inicializado')
  })
}

// === FUNÇÕES DE CIRURGIAS ===

interface Surgery {
  id: string
  patientName: string
  surgeryType: string
  date: string // DD/MM/YYYY
  time: string // HH:MM
  hospital: string
  paymentType: 'particular' | 'plano'
  status: 'agendada' | 'confirmada' | 'concluida' | 'cancelada'
  notes?: string
  insurancePlan?: string
}

// Buscar cirurgias por data
export async function getSurgeriesByDate(date: string): Promise<Surgery[]> {
  try {
    console.log(`🔍 Buscando cirurgias para a data: ${date}`)

    // Converter formato de data de YYYY-MM-DD para DD/MM/YYYY para a API de cirurgias
    const [year, month, day] = date.split('-')
    const surgeryDateFormat = `${day}/${month}/${year}`

    // Usar URL absoluta no servidor
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.joaovitorviana.com.br'
    const url = `${baseUrl}/api/surgeries?date=${encodeURIComponent(surgeryDateFormat)}`

    console.log(`📡 Fazendo requisição para: ${url}`)

    const response = await fetch(url)
    if (!response.ok) {
      console.error('Erro ao buscar cirurgias:', response.status)
      return []
    }

    const data = await response.json()
    console.log(`🏥 Cirurgias encontradas: ${data.surgeries?.length || 0}`)

    return data.surgeries || []
  } catch (error) {
    console.error('Erro ao buscar cirurgias por data:', error)
    return []
  }
}

// Obter agenda diária
export async function getDailyAgenda(date: string): Promise<DailyAgenda> {
  const appointments = await getAppointmentsByDate(date)

  return {
    date,
    appointments,
    totalPatients: appointments.length,
    confirmedAppointments: appointments.filter(
      apt => apt.status === 'confirmada'
    ).length,
    pendingAppointments: appointments.filter(apt => apt.status === 'agendada')
      .length,
    completedAppointments: appointments.filter(
      apt => apt.status === 'concluida'
    ).length,
  }
}

// Obter agenda diária incluindo consultas e cirurgias
export async function getDailyAgendaWithSurgeries(
  date: string
): Promise<DailyAgenda & { surgeries: Surgery[] }> {
  const appointments = await getAppointmentsByDate(date)
  const surgeries = await getSurgeriesByDate(date)

  return {
    date,
    appointments,
    surgeries,
    totalPatients: appointments.length,
    confirmedAppointments: appointments.filter(
      apt => apt.status === 'confirmada'
    ).length,
    pendingAppointments: appointments.filter(apt => apt.status === 'agendada')
      .length,
    completedAppointments: appointments.filter(
      apt => apt.status === 'concluida'
    ).length,
  }
}

// Obter paciente por ID
export async function getPatientById(patientId: string): Promise<Patient | undefined> {
  try {
    const patients = await getAllPatients()
    return patients.find(p => p.id === patientId)
  } catch (error) {
    console.error('Erro ao buscar paciente por ID:', error)
    return undefined
  }
}

// Atualizar status do agendamento
export async function updateAppointmentStatus(
  appointmentId: string,
  status: UnifiedAppointment['status']
): Promise<boolean> {
  try {
    const appointments = await getAllAppointments()
    const appointmentIndex = appointments.findIndex(
      apt => apt.id === appointmentId
    )

    if (appointmentIndex === -1) {
      return false
    }

    appointments[appointmentIndex].status = status
    appointments[appointmentIndex].updatedAt = getBrasiliaTimestamp()

    // Salvar no localStorage (browser) ou arquivo (servidor)
    if (typeof window !== 'undefined') {
      localStorage.setItem('unified_appointments', JSON.stringify(appointments))
    }

    return true
  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error)
    return false
  }
}

// Atualizar agendamento completo
export async function updateAppointment(
  appointmentId: string,
  updateData: Partial<UnifiedAppointment>
): Promise<boolean> {
  try {
    const appointments = await getAllAppointments()
    const appointmentIndex = appointments.findIndex(
      apt => apt.id === appointmentId
    )

    if (appointmentIndex === -1) {
      return false
    }

    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...updateData,
      updatedAt: getBrasiliaTimestamp(),
    }

    // Salvar no localStorage (browser) ou arquivo (servidor)
    if (typeof window !== 'undefined') {
      localStorage.setItem('unified_appointments', JSON.stringify(appointments))
    }

    return true
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return false
  }
}
