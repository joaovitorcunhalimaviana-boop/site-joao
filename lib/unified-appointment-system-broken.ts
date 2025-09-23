// Sistema Unificado de Agendamentos
// Integra agendamentos de pacientes, médicos e secretárias em uma agenda única
// Versão compatível com browser usando localStorage

// Interfaces principais
export interface UnifiedAppointment {
  id: string
  patientId: string
  patientName: string
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
  source: 'public_form' | 'doctor_area' | 'secretary_area' // Origem do agendamento
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy?: string // ID do usuário que criou (médico/secretária)
}

export interface Patient {
  id: string
  name: string
  phone: string
  whatsapp: string
  email?: string
  birthDate?: string
  cpf?: string
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
  createdAt: string
  updatedAt: string
}

export interface DailyAgenda {
  date: string // YYYY-MM-DD
  appointments: UnifiedAppointment[]
  totalAppointments: number
  confirmedAppointments: number
  pendingAppointments: number
}

// Chaves para localStorage
const APPOINTMENTS_KEY = 'unified_appointments'
const PATIENTS_KEY = 'unified_patients'
const AGENDA_KEY = 'daily_agenda'

// Função para ler dados do localStorage com fallback
function loadFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    console.log(
      `📱 localStorage não disponível (servidor) - retornando array vazio para [${key}]`
    )
    return []
  }

  try {
    console.log(`📖 Lendo dados do localStorage [${key}]`)
    const item = localStorage.getItem(key)
    if (!item) {
      console.log(
        `📭 Nenhum dado encontrado no localStorage [${key}], tentando recuperar do backup`
      )

      // Se for a chave de pacientes e não houver dados, tentar recuperar do backup
      if (key === PATIENTS_KEY) {
        loadPatientBackup().then(patients => {
          if (patients.length > 0) {
            console.log(
              `🔄 Backup de pacientes carregado: ${patients.length} pacientes`
            )
            saveToStorage(PATIENTS_KEY, patients)
          }
        })
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

// Função para salvar dados no localStorage
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') {
    console.log('⚠️ Window não disponível, pulando salvamento no localStorage')
    return
  }

  try {
    console.log(
      `🔄 Iniciando salvamento no localStorage [${key}]:`,
      Array.isArray(data) ? `${(data as any[]).length} itens` : 'objeto'
    )
    const jsonData = JSON.stringify(data)
    console.log(`📝 JSON gerado (${jsonData.length} caracteres)`)

    localStorage.setItem(key, jsonData)
    console.log(`✅ Dados salvos no localStorage [${key}]`)

    // Backup adicional: salvar também via API para persistência
    if (key === PATIENTS_KEY) {
      savePatientBackup(data as Patient[])
    }
  } catch (error) {
    console.error(`❌ Erro ao salvar ${key} no localStorage:`, error)
  }
}

// Função para backup de pacientes via API
export async function savePatientBackup(patients: Patient[]): Promise<void> {
  try {
    const response = await fetch('/api/backup-patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patients }),
    })

    if (response.ok) {
      console.log('✅ Backup de pacientes salvo com sucesso')
    } else {
      console.error(
        '❌ Erro ao salvar backup de pacientes:',
        response.statusText
      )
    }
  } catch (error) {
    console.error('❌ Erro na requisição de backup:', error)
  }
}

// Função para carregar backup de pacientes
export async function loadPatientBackup(): Promise<Patient[]> {
  try {
    const response = await fetch('/api/backup-patients')
    if (response.ok) {
      const data = await response.json()
      return data.patients || []
    }
  } catch (error) {
    console.error('❌ Erro ao carregar backup de pacientes:', error)
  }
  return []
}

// Funções de utilidade para IDs
export function generateAppointmentId(): string {
  return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generatePatientId(): string {
  return `pat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Função para criar agendamento público
export function createPublicAppointment(appointmentData: {
  patientName: string
  patientPhone: string
  patientWhatsapp: string
  patientEmail?: string
  patientBirthDate?: string
  insuranceType: 'unimed' | 'particular' | 'outro'
  insurancePlan?: string
  appointmentDate: string
  appointmentTime: string
  appointmentType:
    | 'consulta'
    | 'retorno'
    | 'urgencia'
    | 'teleconsulta'
    | 'visita_domiciliar'
  notes?: string
}): UnifiedAppointment {
  const appointments = loadFromStorage<UnifiedAppointment>(APPOINTMENTS_KEY)
  const patients = loadFromStorage<Patient>(PATIENTS_KEY)

  // Verificar se o paciente já existe
  let patient = patients.find(
    p =>
      p.phone === appointmentData.patientPhone ||
      p.whatsapp === appointmentData.patientWhatsapp ||
      (appointmentData.patientEmail && p.email === appointmentData.patientEmail)
  )

  // Se não existe, criar novo paciente
  if (!patient) {
    patient = {
      id: generatePatientId(),
      name: appointmentData.patientName,
      phone: appointmentData.patientPhone,
      whatsapp: appointmentData.patientWhatsapp,
      email: appointmentData.patientEmail,
      birthDate: appointmentData.patientBirthDate,
      insurance: {
        type: appointmentData.insuranceType,
        plan: appointmentData.insurancePlan,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    patients.push(patient)
    saveToStorage(PATIENTS_KEY, patients)
  }

  // Criar o agendamento
  const appointment: UnifiedAppointment = {
    id: generateAppointmentId(),
    patientId: patient.id,
    patientName: appointmentData.patientName,
    patientPhone: appointmentData.patientPhone,
    patientWhatsapp: appointmentData.patientWhatsapp,
    patientEmail: appointmentData.patientEmail,
    patientBirthDate: appointmentData.patientBirthDate,
    insuranceType: appointmentData.insuranceType,
    insurancePlan: appointmentData.insurancePlan,
    appointmentDate: appointmentData.appointmentDate,
    appointmentTime: appointmentData.appointmentTime,
    appointmentType: appointmentData.appointmentType,
    status: 'agendada',
    source: 'public_form',
    notes: appointmentData.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  appointments.push(appointment)
  saveToStorage(APPOINTMENTS_KEY, appointments)

  return appointment
}

// Função para obter todos os agendamentos
export function getAllAppointments(): UnifiedAppointment[] {
  return loadFromStorage<UnifiedAppointment>(APPOINTMENTS_KEY)
}

// Função para obter agendamentos por data
export function getAppointmentsByDate(date: string): UnifiedAppointment[] {
  const appointments = loadFromStorage<UnifiedAppointment>(APPOINTMENTS_KEY)
  return appointments.filter(apt => apt.appointmentDate === date)
}

// Função para obter agenda diária
export function getDailyAgenda(date: string): DailyAgenda {
  const appointments = getAppointmentsByDate(date)

  return {
    date,
    appointments,
    totalAppointments: appointments.length,
    confirmedAppointments: appointments.filter(
      apt => apt.status === 'confirmada'
    ).length,
    pendingAppointments: appointments.filter(apt => apt.status === 'agendada')
      .length,
  }
}

// Função para atualizar status do agendamento
export function updateAppointmentStatus(
  appointmentId: string,
  status: UnifiedAppointment['status']
): boolean {
  const appointments = loadFromStorage<UnifiedAppointment>(APPOINTMENTS_KEY)
  const appointmentIndex = appointments.findIndex(
    apt => apt.id === appointmentId
  )

  if (appointmentIndex === -1) {
    return false
  }

  appointments[appointmentIndex].status = status
  appointments[appointmentIndex].updatedAt = new Date().toISOString()

  saveToStorage(APPOINTMENTS_KEY, appointments)
  return true
}

// Função para criar ou atualizar paciente
export function createOrUpdatePatient(patientData: {
  name: string
  phone: string
  whatsapp: string
  email?: string
  birthDate?: string
  cpf?: string
  insuranceType: 'unimed' | 'particular' | 'outro'
  insurancePlan?: string
}): Patient {
  console.log('🔄 Iniciando criação/atualização de paciente:', patientData.name)

  const patients = loadFromStorage<Patient>(PATIENTS_KEY)

  // Verificar se o paciente já existe (por telefone, whatsapp ou email)
  const existingPatient = patients.find(
    p =>
      p.phone === patientData.phone ||
      p.whatsapp === patientData.whatsapp ||
      (patientData.email && p.email === patientData.email)
  )

  if (existingPatient) {
    console.log('📝 Atualizando paciente existente:', existingPatient.id)
    // Atualizar dados do paciente existente
    existingPatient.name = patientData.name
    existingPatient.phone = patientData.phone
    existingPatient.whatsapp = patientData.whatsapp
    existingPatient.email = patientData.email
    existingPatient.birthDate = patientData.birthDate
    existingPatient.cpf = patientData.cpf
    existingPatient.insurance = {
      type: patientData.insuranceType,
      plan: patientData.insurancePlan,
    }
    existingPatient.updatedAt = new Date().toISOString()

    saveToStorage(PATIENTS_KEY, patients)
    return existingPatient
  } else {
    console.log('➕ Criando novo paciente')
    // Criar novo paciente
    const newPatient: Patient = {
      id: generatePatientId(),
      name: patientData.name,
      phone: patientData.phone,
      whatsapp: patientData.whatsapp,
      email: patientData.email,
      birthDate: patientData.birthDate,
      cpf: patientData.cpf,
      insurance: {
        type: patientData.insuranceType,
        plan: patientData.insurancePlan,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log('✅ Novo paciente criado:', newPatient.id)
    patients.push(newPatient)
    saveToStorage(PATIENTS_KEY, patients)

    return newPatient
  }
}

// Função para obter todos os pacientes
export function getAllPatients(): Patient[] {
  return loadFromStorage<Patient>(PATIENTS_KEY)
}

// Função para buscar pacientes por nome ou telefone
export function searchPatients(query: string): Patient[] {
  const patients = loadFromStorage<Patient>(PATIENTS_KEY)
  const lowerQuery = query.toLowerCase()

  return patients.filter(
    patient =>
      patient.name.toLowerCase().includes(lowerQuery) ||
      patient.phone.includes(query) ||
      patient.whatsapp.includes(query)
  )
}

// Função para obter paciente por ID
export function getPatientById(patientId: string): Patient | undefined {
  const patients = loadFromStorage<Patient>(PATIENTS_KEY)
  return patients.find(p => p.id === patientId)
}

// Função para deletar paciente
export function deletePatient(patientId: string): boolean {
  const patients = loadFromStorage<Patient>(PATIENTS_KEY)
  const patientIndex = patients.findIndex(p => p.id === patientId)

  if (patientIndex === -1) {
    return false
  }

  patients.splice(patientIndex, 1)
  saveToStorage(PATIENTS_KEY, patients)
  return true
}

// Função para sincronizar dados entre diferentes áreas
export function syncData(): void {
  console.log('🔄 Sincronizando dados entre áreas...')

  // Recarregar dados do localStorage
  const appointments = loadFromStorage<UnifiedAppointment>(APPOINTMENTS_KEY)
  const patients = loadFromStorage<Patient>(PATIENTS_KEY)

  console.log(
    `📊 Dados sincronizados: ${appointments.length} agendamentos, ${patients.length} pacientes`
  )
}

// Função para limpar todos os dados (usar com cuidado)
export function clearAllData(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(APPOINTMENTS_KEY)
    localStorage.removeItem(PATIENTS_KEY)
    localStorage.removeItem(AGENDA_KEY)
    console.log('🗑️ Todos os dados foram limpos')
  }
}

// Função para exportar dados
export function exportData(): {
  appointments: UnifiedAppointment[]
  patients: Patient[]
} {
  return {
    appointments: loadFromStorage<UnifiedAppointment>(APPOINTMENTS_KEY),
    patients: loadFromStorage<Patient>(PATIENTS_KEY),
  }
}

// Função para importar dados
export function importData(data: {
  appointments?: UnifiedAppointment[]
  patients?: Patient[]
}): void {
  if (data.appointments) {
    saveToStorage(APPOINTMENTS_KEY, data.appointments)
  }

  if (data.patients) {
    saveToStorage(PATIENTS_KEY, data.patients)
  }

  console.log('📥 Dados importados com sucesso')
}
