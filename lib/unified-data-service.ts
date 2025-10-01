// Serviço Unificado de Dados
// Centraliza todas as operações de pacientes e e-mails em um só lugar

import fs from 'fs'
import path from 'path'

// Interfaces unificadas
export interface UnifiedPatient {
  id: string
  name: string
  cpf?: string
  medicalRecordNumber?: number
  phone: string
  whatsapp: string
  email?: string
  birthDate?: string
  insurance: {
    type: 'unimed' | 'particular' | 'outro'
    plan?: string
  }
  registrationSources: string[]
  emailPreferences: {
    healthTips: boolean
    appointments: boolean
    promotions: boolean
    subscribed: boolean
    subscribedAt?: string
    newsletter?: boolean // Newsletter subscription preference
  }
  birthdayEmailLogs?: Array<{
    sentAt: string
    year: number
  }>
  createdAt: string
  updatedAt: string
}

export interface UnifiedAppointment {
  id: string
  patientId: string
  patientName: string
  patientCpf?: string
  patientMedicalRecordNumber?: number
  patientPhone: string
  patientWhatsapp: string
  patientEmail?: string
  patientBirthDate?: string
  insuranceType: 'unimed' | 'particular' | 'outro'
  insurancePlan?: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: 'consulta' | 'retorno' | 'urgencia' | 'teleconsulta' | 'visita_domiciliar'
  status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'reagendada'
  source: 'public_appointment' | 'doctor_area' | 'secretary_area'
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// Caminhos dos arquivos
const DATA_DIR = path.join(process.cwd(), 'data')
const UNIFIED_PATIENTS_FILE = path.join(DATA_DIR, 'unified-patients.json')
const UNIFIED_APPOINTMENTS_FILE = path.join(DATA_DIR, 'unified-appointments.json')

// Funções auxiliares para leitura/escrita de arquivos
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error)
  }
  return defaultValue
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    // Garantir que o diretório existe
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error(`Erro ao escrever arquivo ${filePath}:`, error)
    throw error
  }
}

// Funções para pacientes
export function getAllPatients(): UnifiedPatient[] {
  return readJsonFile<UnifiedPatient[]>(UNIFIED_PATIENTS_FILE, [])
}

export function saveAllPatients(patients: UnifiedPatient[]): void {
  writeJsonFile(UNIFIED_PATIENTS_FILE, patients)
}

export function getPatientById(id: string): UnifiedPatient | null {
  const patients = getAllPatients()
  return patients.find(p => p.id === id) || null
}

export function createOrUpdatePatient(patientData: Partial<UnifiedPatient> & { 
  name: string
  phone: string
  whatsapp: string
}): UnifiedPatient {
  const patients = getAllPatients()
  
  // Procurar paciente existente por telefone, whatsapp ou email
  let existingPatient = patients.find(p => 
    p.phone === patientData.phone ||
    p.whatsapp === patientData.whatsapp ||
    (patientData.email && p.email === patientData.email)
  )

  if (existingPatient) {
    // Atualizar paciente existente
    existingPatient.name = patientData.name
    existingPatient.phone = patientData.phone
    existingPatient.whatsapp = patientData.whatsapp
    if (patientData.email) existingPatient.email = patientData.email
    if (patientData.birthDate) existingPatient.birthDate = patientData.birthDate
    if (patientData.cpf) existingPatient.cpf = patientData.cpf
    if (patientData.insurance) existingPatient.insurance = patientData.insurance
    
    // Adicionar nova fonte de registro se não existir
    if (patientData.registrationSources) {
      patientData.registrationSources.forEach(source => {
        if (!existingPatient!.registrationSources.includes(source)) {
          existingPatient!.registrationSources.push(source)
        }
      })
    }
    
    existingPatient.updatedAt = new Date().toISOString()
    
    saveAllPatients(patients)
    return existingPatient
  } else {
    // Criar novo paciente
    const newPatient: UnifiedPatient = {
      id: patientData.id || `pat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: patientData.name,
      cpf: patientData.cpf,
      medicalRecordNumber: patientData.medicalRecordNumber || patients.length + 1,
      phone: patientData.phone,
      whatsapp: patientData.whatsapp,
      email: patientData.email,
      birthDate: patientData.birthDate,
      insurance: patientData.insurance || { type: 'particular' },
      registrationSources: patientData.registrationSources || ['unknown'],
      emailPreferences: patientData.emailPreferences || {
        healthTips: true,
        appointments: true,
        promotions: false,
        subscribed: !!patientData.email,
        subscribedAt: patientData.email ? new Date().toISOString() : undefined
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    patients.push(newPatient)
    saveAllPatients(patients)
    return newPatient
  }
}

// Funções para agendamentos
export function getAllAppointments(): UnifiedAppointment[] {
  return readJsonFile<UnifiedAppointment[]>(UNIFIED_APPOINTMENTS_FILE, [])
}

export function saveAllAppointments(appointments: UnifiedAppointment[]): void {
  writeJsonFile(UNIFIED_APPOINTMENTS_FILE, appointments)
}

export function getAppointmentById(id: string): UnifiedAppointment | null {
  const appointments = getAllAppointments()
  return appointments.find(a => a.id === id) || null
}

export function createAppointment(appointmentData: Omit<UnifiedAppointment, 'id' | 'createdAt' | 'updatedAt'>): UnifiedAppointment {
  const appointments = getAllAppointments()
  
  const newAppointment: UnifiedAppointment = {
    ...appointmentData,
    id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  appointments.push(newAppointment)
  saveAllAppointments(appointments)
  return newAppointment
}

export function updateAppointment(id: string, updates: Partial<UnifiedAppointment>): UnifiedAppointment | null {
  const appointments = getAllAppointments()
  const appointmentIndex = appointments.findIndex(a => a.id === id)
  
  if (appointmentIndex === -1) return null
  
  appointments[appointmentIndex] = {
    ...appointments[appointmentIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  saveAllAppointments(appointments)
  return appointments[appointmentIndex]
}

// Funções de migração e limpeza
export function migrateOldData(): void {
  console.log('🔄 Iniciando migração de dados antigos...')
  
  // Migrar dados de appointments.json
  const oldAppointmentsPath = path.join(DATA_DIR, 'appointments.json')
  if (fs.existsSync(oldAppointmentsPath)) {
    const oldAppointments = readJsonFile<any[]>(oldAppointmentsPath, [])
    const currentAppointments = getAllAppointments()
    
    oldAppointments.forEach(oldApt => {
      // Verificar se já existe
      const exists = currentAppointments.find(a => a.id === oldApt.id)
      if (!exists) {
        const unifiedApt: UnifiedAppointment = {
          id: oldApt.id,
          patientId: oldApt.patientId,
          patientName: oldApt.patientName,
          patientCpf: oldApt.patientCpf,
          patientMedicalRecordNumber: oldApt.patientMedicalRecordNumber,
          patientPhone: oldApt.patientPhone,
          patientWhatsapp: oldApt.patientWhatsapp,
          patientEmail: oldApt.patientEmail,
          patientBirthDate: oldApt.patientBirthDate,
          insuranceType: oldApt.insuranceType,
          insurancePlan: oldApt.insurancePlan,
          appointmentDate: oldApt.appointmentDate,
          appointmentTime: oldApt.appointmentTime,
          appointmentType: oldApt.appointmentType,
          status: oldApt.status,
          source: oldApt.source,
          notes: oldApt.notes,
          createdAt: oldApt.createdAt,
          updatedAt: oldApt.updatedAt,
          createdBy: oldApt.createdBy
        }
        currentAppointments.push(unifiedApt)
      }
    })
    
    saveAllAppointments(currentAppointments)
  }
  
  // Migrar dados de integrated-emails.json e newsletter.json
  const integratedEmailsPath = path.join(DATA_DIR, 'integrated-emails.json')
  const newsletterPath = path.join(DATA_DIR, 'newsletter.json')
  
  const currentPatients = getAllPatients()
  
  // Migrar integrated-emails
  if (fs.existsSync(integratedEmailsPath)) {
    const integratedEmails = readJsonFile<any[]>(integratedEmailsPath, [])
    
    integratedEmails.forEach(emailData => {
      createOrUpdatePatient({
        id: emailData.patientId,
        name: emailData.name,
        phone: emailData.whatsapp || '(00) 00000-0000',
        whatsapp: emailData.whatsapp || '(00) 00000-0000',
        email: emailData.email,
        birthDate: emailData.birthDate,
        registrationSources: emailData.registrationSources || ['integrated_emails'],
        emailPreferences: {
          healthTips: emailData.preferences?.healthTips || true,
          appointments: emailData.preferences?.appointments || true,
          promotions: emailData.preferences?.promotions || false,
          subscribed: emailData.subscribed,
          subscribedAt: emailData.subscribedAt
        }
      })
    })
  }
  
  // Migrar newsletter
  if (fs.existsSync(newsletterPath)) {
    const newsletter = readJsonFile<any>(newsletterPath, { subscribers: [] })
    
    newsletter.subscribers?.forEach((subscriber: any) => {
      createOrUpdatePatient({
        id: subscriber.id,
        name: subscriber.name,
        phone: subscriber.whatsapp || '(00) 00000-0000',
        whatsapp: subscriber.whatsapp || '(00) 00000-0000',
        email: subscriber.email,
        birthDate: subscriber.birthDate,
        registrationSources: ['newsletter'],
        emailPreferences: {
          healthTips: subscriber.preferences?.healthTips || true,
          appointments: subscriber.preferences?.appointments || true,
          promotions: subscriber.preferences?.promotions || false,
          subscribed: subscriber.subscribed,
          subscribedAt: subscriber.subscribedAt
        }
      })
    })
  }
  
  console.log('✅ Migração de dados concluída')
}

// Função para limpar arquivos antigos após migração
export function cleanupOldFiles(): void {
  console.log('🧹 Limpando arquivos antigos...')
  
  const filesToRemove = [
    'appointments.json',
    'integrated-emails.json',
    'newsletter.json',
    'birthday-emails.json',
    'welcome-email-logs.json'
  ]
  
  filesToRemove.forEach(filename => {
    const filePath = path.join(DATA_DIR, filename)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
        console.log(`✅ Removido: ${filename}`)
      } catch (error) {
        console.error(`❌ Erro ao remover ${filename}:`, error)
      }
    }
  })
  
  console.log('✅ Limpeza concluída')
}

// Newsletter data management functions
export function readNewslettersData(): any[] {
  const newsletterPath = path.join(DATA_DIR, 'newsletters.json')
  return readJsonFile<any[]>(newsletterPath, [])
}

export function saveNewslettersData(newsletters: any[]): void {
  const newsletterPath = path.join(DATA_DIR, 'newsletters.json')
  writeJsonFile(newsletterPath, newsletters)
}