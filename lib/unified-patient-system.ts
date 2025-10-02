// Sistema Unificado de Pacientes e ComunicaÃ§Ã£o
// Integra todos os cadastros em duas camadas: ComunicaÃ§Ã£o e Pacientes MÃ©dicos

import * as fs from 'fs'
import * as path from 'path'
import { getBrasiliaTimestamp } from './date-utils'
import { sendTelegramAppointmentNotification, AppointmentNotificationData } from './telegram-notifications'

// ==================== INTERFACES UNIFICADAS ====================

// CAMADA 1: Sistema de ComunicaÃ§Ã£o (mais amplo)
export interface CommunicationContact {
  id: string
  name: string
  email?: string
  whatsapp?: string
  birthDate?: string // Para emails de aniversÃ¡rio
  
  // Rastreamento de fontes de cadastro
  registrationSources: ('newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review')[]
  
  // PreferÃªncias de comunicaÃ§Ã£o
  emailPreferences: {
    newsletter: boolean
    healthTips: boolean
    appointments: boolean
    promotions: boolean
    subscribed: boolean
    subscribedAt?: string
    unsubscribedAt?: string
  }
  
  // WhatsApp preferences
  whatsappPreferences: {
    appointments: boolean
    reminders: boolean
    promotions: boolean
    subscribed: boolean
    subscribedAt?: string
  }
  
  // Dados de avaliaÃ§Ã£o/review (opcional)
  reviewData?: {
    rating: number // 1-5 estrelas
    comment: string
    reviewDate: string
    verified: boolean
    approved: boolean
  }
  
  // Metadados
  createdAt: string
  updatedAt: string
  lastContactAt?: string
}

// CAMADA 2: Sistema de Pacientes MÃ©dicos (restrito - com CPF)
export interface MedicalPatient {
  id: string
  
  // Dados bÃ¡sicos (herda do sistema de comunicaÃ§Ã£o)
  communicationContactId: string // ReferÃªncia ao contato de comunicaÃ§Ã£o
  
  // Dados mÃ©dicos obrigatÃ³rios
  cpf: string // OBRIGATÃ“RIO para pacientes mÃ©dicos
  medicalRecordNumber: number // NÃºmero do prontuÃ¡rio (sequencial)
  
  // Dados complementares
  fullName: string // Nome completo (pode ser diferente do nome de comunicaÃ§Ã£o)
  rg?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  
  // Plano de saÃºde
  insurance: {
    type: 'unimed' | 'particular' | 'outro'
    plan?: string
    cardNumber?: string
    validUntil?: string
  }
  
  // Dados mÃ©dicos bÃ¡sicos
  medicalInfo: {
    allergies?: string[]
    medications?: string[]
    conditions?: string[]
    emergencyContact?: string
    emergencyPhone?: string
    bloodType?: string
    notes?: string
  }
  
  // Consentimentos e LGPD
  consents: {
    dataProcessing: boolean
    dataProcessingDate?: string
    medicalTreatment: boolean
    medicalTreatmentDate?: string
    imageUse: boolean
    imageUseDate?: string
  }
  
  // Metadados
  createdAt: string
  updatedAt: string
  createdBy?: string // ID do usuÃ¡rio que criou (mÃ©dico/secretÃ¡ria)
  isActive: boolean
}

// Interface para Agendamentos (mantÃ©m estrutura atual mas referencia os novos sistemas)
export interface UnifiedAppointment {
  id: string
  
  // ReferÃªncias aos sistemas unificados
  communicationContactId: string
  medicalPatientId?: string // Opcional - pode ser apenas contato de comunicaÃ§Ã£o
  
  // Backward compatibility - deprecated but maintained for existing code
  patientId?: string // Deprecated: use communicationContactId instead
  
  // Dados do agendamento
  appointmentDate: string // YYYY-MM-DD
  appointmentTime: string // HH:MM
  appointmentType: 'consulta' | 'retorno' | 'urgencia' | 'teleconsulta' | 'visita_domiciliar'
  
  status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'reagendada'
  source: 'public_appointment' | 'doctor_area' | 'secretary_area'
  
  // Dados copiados no momento do agendamento (para performance)
  patientName: string
  patientPhone: string
  patientWhatsapp: string
  patientEmail?: string
  patientCpf?: string // Apenas se for paciente mÃ©dico
  patientMedicalRecordNumber?: number // NÃºmero do prontuÃ¡rio se for paciente mÃ©dico
  
  // Insurance information for backward compatibility
  insuranceType?: 'unimed' | 'particular' | 'outro'
  insurancePlan?: string
  
  // InformaÃ§Ãµes do agendamento
  notes?: string
  duration?: number // em minutos
  
  // Metadados
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// Interface para Slots de HorÃ¡rios
export interface ScheduleSlot {
  id: string
  date: string // YYYY-MM-DD format
  time: string // HH:MM format
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// Interface para ProntuÃ¡rios MÃ©dicos (dados crÃ­ticos - armazenamento permanente)
export interface MedicalRecord {
  id: string
  medicalPatientId: string // OBRIGATÃ“RIO - apenas pacientes mÃ©dicos tÃªm prontuÃ¡rios
  
  // Dados da consulta
  consultationDate: string
  consultationTime: string
  
  // ConteÃºdo mÃ©dico (dados crÃ­ticos)
  anamnesis: string
  physicalExamination: string
  diagnosis: string
  treatment: string
  prescription: string
  observations: string
  
  // Dados do mÃ©dico
  doctorName: string
  doctorCrm: string
  
  // Anexos e resultados
  attachments?: {
    id: string
    fileName: string
    originalName: string
    fileType: string
    category: 'exame' | 'foto' | 'documento' | 'receita' | 'atestado'
    description: string
    filePath: string
    uploadedAt: string
  }[]
  
  calculatorResults?: {
    calculatorName: string
    result: any
    timestamp: string
  }[]
  
  diagnosticHypotheses?: string[]
  
  // Assinatura digital e seguranÃ§a
  digitalSignature?: string
  signedAt?: string
  checksum: string // Para verificar integridade
  
  // Metadados (NUNCA podem ser alterados apÃ³s criaÃ§Ã£o)
  createdAt: string
  readonly: boolean // ProntuÃ¡rios sÃ£o readonly apÃ³s criaÃ§Ã£o
}

// Interface para Cirurgias
export interface Surgery {
  id: string
  
  // ReferÃªncias aos sistemas unificados
  communicationContactId: string
  medicalPatientId?: string // Opcional - pode ser apenas contato de comunicaÃ§Ã£o
  
  // Dados bÃ¡sicos da cirurgia
  patientName: string // Copiado no momento da criaÃ§Ã£o
  patientCpf?: string // Apenas se for paciente mÃ©dico
  surgeryType: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  hospital: string
  
  // InformaÃ§Ãµes de pagamento
  paymentType: 'particular' | 'plano'
  insurancePlan?: string
  
  // Valores para particulares
  totalValue?: number
  hospitalValue?: number
  anesthesiologistValue?: number
  instrumentalistValue?: number
  auxiliaryValue?: number
  doctorValue?: number
  doctorAmount?: number
  totalAmount?: number
  hospitalAmount?: number
  assistantAmount?: number
  expectedAmount?: number
  
  // CÃ³digos para planos
  procedureCodes?: string
  
  // Status e observaÃ§Ãµes
  status: 'agendada' | 'confirmada' | 'concluida' | 'cancelada'
  notes?: string
  
  // Metadados
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// ==================== CONFIGURAÃ‡Ã•ES ====================

const DATA_DIR = path.join(process.cwd(), 'data', 'unified-system')
const COMMUNICATION_CONTACTS_FILE = path.join(DATA_DIR, 'communication-contacts.json')
const MEDICAL_PATIENTS_FILE = path.join(DATA_DIR, 'medical-patients.json')
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json')
const SCHEDULE_SLOTS_FILE = path.join(DATA_DIR, 'schedule-slots.json')
const MEDICAL_RECORDS_FILE = path.join(DATA_DIR, 'medical-records.json')
const SURGERIES_FILE = path.join(DATA_DIR, 'surgeries.json')

// ==================== FUNÃ‡Ã•ES UTILITÃRIAS ====================

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Função para obter agenda diária com cirurgias
export async function getDailyAgendaWithSurgeries(date: string): Promise<{
  appointments: UnifiedAppointment[]
  surgeries: Surgery[]
  totalItems: number
}> {
  try {
    const appointments = getAppointmentsByDate(date)
    const surgeries = getSurgeriesByDate(date)
    
    return {
      appointments,
      surgeries,
      totalItems: appointments.length + surgeries.length
    }
  } catch (error) {
    console.error('⚠ Erro ao obter agenda diária com cirurgias:', error)
    return {
      appointments: [],
      surgeries: [],
      totalItems: 0
    }
  }
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function loadFromStorage<T>(filePath: string): T[] {
  ensureDataDirectory()
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2))
    return []
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`âŒ Erro ao carregar dados de ${filePath}:`, error)
    return []
  }
}

function saveToStorage<T>(filePath: string, data: T[]): void {
  ensureDataDirectory()
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`âŒ Erro ao salvar dados em ${filePath}:`, error)
    throw error
  }
}

// ==================== FUNÃ‡Ã•ES DO SISTEMA DE COMUNICAÃ‡ÃƒO ====================

export function getAllCommunicationContacts(): CommunicationContact[] {
  return loadFromStorage<CommunicationContact>(COMMUNICATION_CONTACTS_FILE)
}

export function getCommunicationContactById(id: string): CommunicationContact | null {
  const contacts = getAllCommunicationContacts()
  return contacts.find(contact => contact.id === id) || null
}

export function getCommunicationContactByEmail(email: string): CommunicationContact | null {
  const contacts = getAllCommunicationContacts()
  return contacts.find(contact => contact.email?.toLowerCase() === email.toLowerCase()) || null
}

export function createOrUpdateCommunicationContact(
  contactData: Partial<CommunicationContact> & { 
    name: string
    source: 'newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review'
  }
): { success: boolean; contact: CommunicationContact; message: string } {
  try {
    const contacts = getAllCommunicationContacts()
    const now = getBrasiliaTimestamp()
    
    // Buscar contato existente por email ou WhatsApp
    let existingContact: CommunicationContact | null = null
    
    if (contactData.email) {
      existingContact = getCommunicationContactByEmail(contactData.email)
    }
    
    if (!existingContact && contactData.whatsapp) {
      existingContact = contacts.find(c => c.whatsapp === contactData.whatsapp) || null
    }
    
    if (existingContact) {
      // Atualizar contato existente
      const updatedSources = Array.from(new Set([...existingContact.registrationSources, contactData.source]))
      
      const updatedContact: CommunicationContact = {
        ...existingContact,
        name: contactData.name || existingContact.name,
        email: contactData.email || existingContact.email,
        whatsapp: contactData.whatsapp || existingContact.whatsapp,
        birthDate: contactData.birthDate || existingContact.birthDate,
        registrationSources: updatedSources,
        emailPreferences: {
          ...existingContact.emailPreferences,
          ...contactData.emailPreferences
        },
        whatsappPreferences: {
          ...existingContact.whatsappPreferences,
          ...contactData.whatsappPreferences
        },
        reviewData: contactData.reviewData || existingContact.reviewData,
        updatedAt: now,
        lastContactAt: now
      }
      
      const contactIndex = contacts.findIndex(c => c.id === existingContact!.id)
      contacts[contactIndex] = updatedContact
      
      saveToStorage(COMMUNICATION_CONTACTS_FILE, contacts)
      
      return {
        success: true,
        contact: updatedContact,
        message: 'Contato de comunicaÃ§Ã£o atualizado com sucesso'
      }
    } else {
      // Criar novo contato
      const newContact: CommunicationContact = {
        id: generateId('comm'),
        name: contactData.name,
        email: contactData.email,
        whatsapp: contactData.whatsapp,
        birthDate: contactData.birthDate,
        registrationSources: [contactData.source],
        emailPreferences: {
          newsletter: contactData.source === 'newsletter',
          healthTips: false,
          appointments: true,
          promotions: false,
          subscribed: contactData.source === 'newsletter',
          subscribedAt: contactData.source === 'newsletter' ? now : undefined,
          ...contactData.emailPreferences
        },
        whatsappPreferences: {
          appointments: true,
          reminders: true,
          promotions: false,
          subscribed: true,
          subscribedAt: now,
          ...contactData.whatsappPreferences
        },
        reviewData: contactData.reviewData,
        createdAt: now,
        updatedAt: now,
        lastContactAt: now
      }
      
      contacts.push(newContact)
      saveToStorage(COMMUNICATION_CONTACTS_FILE, contacts)

      // Email de boas-vindas removido - sistema agora usa apenas Telegram
      
      return {
        success: true,
        contact: newContact,
        message: 'Novo contato de comunicaÃ§Ã£o criado com sucesso'
      }
    }
  } catch (error) {
    console.error('âŒ Erro ao criar/atualizar contato de comunicaÃ§Ã£o:', error)
    return {
      success: false,
      contact: {} as CommunicationContact,
      message: 'Erro interno do servidor'
    }
  }
}

// ==================== FUNÃ‡Ã•ES DO SISTEMA DE PACIENTES MÃ‰DICOS ====================

export function getAllMedicalPatients(): MedicalPatient[] {
  return loadFromStorage<MedicalPatient>(MEDICAL_PATIENTS_FILE)
}

export function getMedicalPatientById(id: string): MedicalPatient | null {
  const patients = getAllMedicalPatients()
  return patients.find(patient => patient.id === id) || null
}

export function getMedicalPatientByCpf(cpf: string): MedicalPatient | null {
  const patients = getAllMedicalPatients()
  return patients.find(patient => patient.cpf === cpf) || null
}

export function getNextMedicalRecordNumber(): number {
  const patients = getAllMedicalPatients()
  
  if (patients.length === 0) {
    return 1
  }
  
  const maxRecordNumber = patients
    .filter(patient => patient.medicalRecordNumber && typeof patient.medicalRecordNumber === 'number')
    .reduce((max, patient) => {
      return Math.max(max, patient.medicalRecordNumber)
    }, 0)
  
  return maxRecordNumber + 1
}

export function createMedicalPatient(
  patientData: Partial<MedicalPatient> & {
    cpf: string
    fullName: string
    communicationContactId: string
  },
  createdBy?: string
): { success: boolean; patient: MedicalPatient; message: string } {
  try {
    const patients = getAllMedicalPatients()
    const now = getBrasiliaTimestamp()
    
    // Verificar se CPF jÃ¡ existe
    const existingPatient = getMedicalPatientByCpf(patientData.cpf)
    if (existingPatient) {
      return {
        success: false,
        patient: {} as MedicalPatient,
        message: 'Paciente com este CPF jÃ¡ existe'
      }
    }
    
    // Verificar se o contato de comunicaÃ§Ã£o existe
    const communicationContact = getCommunicationContactById(patientData.communicationContactId)
    if (!communicationContact) {
      return {
        success: false,
        patient: {} as MedicalPatient,
        message: 'Contato de comunicaÃ§Ã£o nÃ£o encontrado'
      }
    }
    
    const newPatient: MedicalPatient = {
      id: generateId('med'),
      communicationContactId: patientData.communicationContactId,
      cpf: patientData.cpf,
      medicalRecordNumber: getNextMedicalRecordNumber(),
      fullName: patientData.fullName,
      rg: patientData.rg,
      address: patientData.address,
      city: patientData.city,
      state: patientData.state,
      zipCode: patientData.zipCode,
      insurance: {
        type: 'particular',
        ...patientData.insurance
      },
      medicalInfo: {
        allergies: [],
        medications: [],
        conditions: [],
        ...patientData.medicalInfo
      },
      consents: {
        dataProcessing: false,
        medicalTreatment: false,
        imageUse: false,
        ...patientData.consents
      },
      createdAt: now,
      updatedAt: now,
      createdBy,
      isActive: true
    }
    
    patients.push(newPatient)
    saveToStorage(MEDICAL_PATIENTS_FILE, patients)
    
    return {
      success: true,
      patient: newPatient,
      message: 'Paciente mÃ©dico criado com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao criar paciente mÃ©dico:', error)
    return {
      success: false,
      patient: {} as MedicalPatient,
      message: 'Erro interno do servidor'
    }
  }
}

// ==================== FUNÃ‡Ã•ES DE AGENDAMENTOS ====================

export function getAllAppointments(): UnifiedAppointment[] {
  return loadFromStorage<UnifiedAppointment>(APPOINTMENTS_FILE)
}

export function getAppointmentsByDate(date: string): UnifiedAppointment[] {
  const appointments = getAllAppointments()
  return appointments.filter(apt => apt.appointmentDate === date)
}

  export function createAppointment(
  appointmentData: Partial<UnifiedAppointment> & {
    communicationContactId: string
    appointmentDate: string
    appointmentTime: string
    appointmentType: UnifiedAppointment['appointmentType']
    source: UnifiedAppointment['source']
  },
  createdBy?: string
): { success: boolean; appointment: UnifiedAppointment; message: string } {
  try {
    const appointments = getAllAppointments()
    const now = getBrasiliaTimestamp()
    
    // Verificar se o contato existe
    const contact = getCommunicationContactById(appointmentData.communicationContactId)
    if (!contact) {
      return {
        success: false,
        appointment: {} as UnifiedAppointment,
        message: 'Contato nÃ£o encontrado'
      }
    }
    
    // Buscar paciente mÃ©dico se existir
    let medicalPatient: MedicalPatient | null = null
    if (appointmentData.medicalPatientId) {
      medicalPatient = getMedicalPatientById(appointmentData.medicalPatientId)
    }
    
    const newAppointment: UnifiedAppointment = {
      id: generateId('apt'),
      communicationContactId: appointmentData.communicationContactId,
      medicalPatientId: appointmentData.medicalPatientId,
      
      // Backward compatibility
      patientId: appointmentData.communicationContactId,
      
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      appointmentType: appointmentData.appointmentType,
      status: 'agendada',
      source: appointmentData.source,
      
      // Dados copiados para performance
      patientName: contact.name,
      patientPhone: contact.whatsapp || '',
      patientWhatsapp: contact.whatsapp || '',
      patientEmail: contact.email,
      patientCpf: medicalPatient?.cpf,
      patientMedicalRecordNumber: medicalPatient?.medicalRecordNumber,
      
      // Insurance information for backward compatibility
      insuranceType: medicalPatient?.insurance.type,
      insurancePlan: medicalPatient?.insurance.plan,
      
      notes: appointmentData.notes,
      duration: appointmentData.duration || 30,
      
      createdAt: now,
      updatedAt: now,
      createdBy
    }
    
    appointments.push(newAppointment)
    saveToStorage(APPOINTMENTS_FILE, appointments)
    
    console.log(
      `✅ Agendamento criado: ${newAppointment.patientName} - ${newAppointment.appointmentDate} ${newAppointment.appointmentTime}`
    )

    // Enviar notificação via Telegram
    try {
      const notificationData: AppointmentNotificationData = {
        patientName: newAppointment.patientName,
        patientEmail: newAppointment.patientEmail,
        patientPhone: newAppointment.patientPhone,
        patientWhatsapp: newAppointment.patientWhatsapp || newAppointment.patientPhone,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        insuranceType: (newAppointment.insuranceType as 'unimed' | 'particular' | 'outro') || 'particular',
        appointmentType: newAppointment.appointmentType,
        source: newAppointment.source,
        notes: newAppointment.notes,
      }

      // Enviar notificação de forma assíncrona para não bloquear o agendamento
      sendTelegramAppointmentNotification(notificationData)
        .then(() => {
          console.log('✅ Notificação Telegram enviada com sucesso')
        })
        .catch((telegramError) => {
          console.warn('⚠️ Erro ao enviar notificação Telegram:', telegramError)
          // Não falhar o agendamento por causa da notificação
        })
    } catch (telegramError) {
      console.warn('⚠️ Erro ao preparar notificação Telegram:', telegramError)
      // Não falhar o agendamento por causa da notificação
    }

    // Email de boas-vindas removido - sistema agora usa apenas Telegram
    
    return {
      success: true,
      appointment: newAppointment,
      message: 'Agendamento criado com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error)
    return {
      success: false,
      appointment: {} as UnifiedAppointment,
      message: 'Erro interno do servidor'
    }
  }
}

// ==================== FUNÃ‡Ã•ES DE SCHEDULE SLOTS ====================

export function getAllScheduleSlots(): ScheduleSlot[] {
  return loadFromStorage<ScheduleSlot>(SCHEDULE_SLOTS_FILE)
}

export function getScheduleSlotsByDate(date: string): ScheduleSlot[] {
  const slots = getAllScheduleSlots()
  return slots.filter(slot => slot.date === date && slot.isActive)
}

export function createScheduleSlot(
  slotData: Partial<ScheduleSlot> & {
    date: string
    time: string
  },
  createdBy?: string
): { success: boolean; slot: ScheduleSlot; message: string } {
  try {
    const slots = getAllScheduleSlots()
    const now = getBrasiliaTimestamp()
    
    // Verificar se jÃ¡ existe slot para a mesma data e horÃ¡rio
    const existingSlot = slots.find(
      slot => slot.date === slotData.date && slot.time === slotData.time
    )
    
    if (existingSlot) {
      return {
        success: false,
        slot: {} as ScheduleSlot,
        message: 'JÃ¡ existe um slot para esta data e horÃ¡rio'
      }
    }
    
    const newSlot: ScheduleSlot = {
      id: generateId('slot'),
      date: slotData.date,
      time: slotData.time,
      isActive: slotData.isActive !== undefined ? slotData.isActive : true,
      createdAt: now,
      updatedAt: now,
      createdBy
    }
    
    slots.push(newSlot)
    saveToStorage(SCHEDULE_SLOTS_FILE, slots)
    
    return {
      success: true,
      slot: newSlot,
      message: 'Slot de horÃ¡rio criado com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao criar slot de horÃ¡rio:', error)
    return {
      success: false,
      slot: {} as ScheduleSlot,
      message: 'Erro interno do servidor'
    }
  }
}

export function updateScheduleSlot(
  slotId: string,
  updateData: Partial<ScheduleSlot>
): { success: boolean; slot: ScheduleSlot; message: string } {
  try {
    const slots = getAllScheduleSlots()
    const slotIndex = slots.findIndex(slot => slot.id === slotId)
    
    if (slotIndex === -1) {
      return {
        success: false,
        slot: {} as ScheduleSlot,
        message: 'Slot nÃ£o encontrado'
      }
    }
    
    const updatedSlot: ScheduleSlot = {
      ...slots[slotIndex],
      ...updateData,
      updatedAt: getBrasiliaTimestamp()
    }
    
    slots[slotIndex] = updatedSlot
    saveToStorage(SCHEDULE_SLOTS_FILE, slots)
    
    return {
      success: true,
      slot: updatedSlot,
      message: 'Slot atualizado com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao atualizar slot:', error)
    return {
      success: false,
      slot: {} as ScheduleSlot,
      message: 'Erro interno do servidor'
    }
  }
}

export function deleteScheduleSlot(slotId: string): { success: boolean; message: string } {
  try {
    const slots = getAllScheduleSlots()
    const slotIndex = slots.findIndex(slot => slot.id === slotId)
    
    if (slotIndex === -1) {
      return {
        success: false,
        message: 'Slot nÃ£o encontrado'
      }
    }
    
    slots.splice(slotIndex, 1)
    saveToStorage(SCHEDULE_SLOTS_FILE, slots)
    
    return {
      success: true,
      message: 'Slot removido com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao remover slot:', error)
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

export function getAllMedicalRecords(): MedicalRecord[] {
  return loadFromStorage<MedicalRecord>(MEDICAL_RECORDS_FILE)
}

export function getMedicalRecordsByPatient(medicalPatientId: string): MedicalRecord[] {
  const records = getAllMedicalRecords()
  return records.filter(record => record.medicalPatientId === medicalPatientId)
}

export function createMedicalRecord(
  recordData: Partial<MedicalRecord> & {
    medicalPatientId: string
    consultationDate: string
    consultationTime: string
    anamnesis: string
    physicalExamination: string
    diagnosis: string
    treatment: string
    doctorName: string
    doctorCrm: string
  }
): { success: boolean; record: MedicalRecord; message: string } {
  try {
    const records = getAllMedicalRecords()
    const now = getBrasiliaTimestamp()
    
    // Verificar se o paciente mÃ©dico existe
    const patient = getMedicalPatientById(recordData.medicalPatientId)
    if (!patient) {
      return {
        success: false,
        record: {} as MedicalRecord,
        message: 'Paciente mÃ©dico nÃ£o encontrado'
      }
    }
    
    // Gerar checksum para integridade
    const recordContent = JSON.stringify({
      medicalPatientId: recordData.medicalPatientId,
      consultationDate: recordData.consultationDate,
      consultationTime: recordData.consultationTime,
      anamnesis: recordData.anamnesis,
      physicalExamination: recordData.physicalExamination,
      diagnosis: recordData.diagnosis,
      treatment: recordData.treatment,
      doctorName: recordData.doctorName,
      doctorCrm: recordData.doctorCrm,
      createdAt: now
    })
    
    const checksum = Buffer.from(recordContent).toString('base64')
    
    const newRecord: MedicalRecord = {
      id: generateId('rec'),
      medicalPatientId: recordData.medicalPatientId,
      consultationDate: recordData.consultationDate,
      consultationTime: recordData.consultationTime,
      anamnesis: recordData.anamnesis,
      physicalExamination: recordData.physicalExamination,
      diagnosis: recordData.diagnosis,
      treatment: recordData.treatment,
      prescription: recordData.prescription || '',
      observations: recordData.observations || '',
      doctorName: recordData.doctorName,
      doctorCrm: recordData.doctorCrm,
      attachments: recordData.attachments || [],
      calculatorResults: recordData.calculatorResults || [],
      diagnosticHypotheses: recordData.diagnosticHypotheses || [],
      digitalSignature: recordData.digitalSignature,
      signedAt: recordData.signedAt,
      checksum,
      createdAt: now,
      readonly: true // ProntuÃ¡rios sÃ£o sempre readonly
    }
    
    records.push(newRecord)
    saveToStorage(MEDICAL_RECORDS_FILE, records)
    
    return {
      success: true,
      record: newRecord,
      message: 'ProntuÃ¡rio mÃ©dico criado com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao criar prontuÃ¡rio mÃ©dico:', error)
    return {
      success: false,
      record: {} as MedicalRecord,
      message: 'Erro interno do servidor'
    }
  }
}

// ==================== FUNÃ‡Ã•ES DE CIRURGIAS ====================

export function getAllSurgeries(): Surgery[] {
  return loadFromStorage<Surgery>(SURGERIES_FILE)
}

export function getSurgeryById(id: string): Surgery | null {
  const surgeries = getAllSurgeries()
  return surgeries.find(surgery => surgery.id === id) || null
}

export function getSurgeriesByDate(date: string): Surgery[] {
  const surgeries = getAllSurgeries()
  return surgeries.filter(surgery => surgery.date === date)
}

export function createSurgery(
  surgeryData: Partial<Surgery> & {
    communicationContactId: string
    patientName: string
    surgeryType: string
    date: string
    time: string
    hospital: string
    paymentType: 'particular' | 'plano'
  },
  createdBy?: string
): { success: boolean; surgery: Surgery; message: string } {
  try {
    const surgeries = getAllSurgeries()
    const now = getBrasiliaTimestamp()
    
    // Verificar se o contato existe
    const contact = getCommunicationContactById(surgeryData.communicationContactId)
    if (!contact) {
      return {
        success: false,
        surgery: {} as Surgery,
        message: 'Contato nÃ£o encontrado'
      }
    }
    
    // Buscar paciente mÃ©dico se existir
    let medicalPatient: MedicalPatient | null = null
    if (surgeryData.medicalPatientId) {
      medicalPatient = getMedicalPatientById(surgeryData.medicalPatientId)
    }
    
    const newSurgery: Surgery = {
      id: generateId('surg'),
      communicationContactId: surgeryData.communicationContactId,
      medicalPatientId: surgeryData.medicalPatientId,
      patientName: surgeryData.patientName,
      patientCpf: medicalPatient?.cpf,
      surgeryType: surgeryData.surgeryType,
      date: surgeryData.date,
      time: surgeryData.time,
      hospital: surgeryData.hospital,
      paymentType: surgeryData.paymentType,
      insurancePlan: surgeryData.insurancePlan,
      totalValue: surgeryData.totalValue,
      hospitalValue: surgeryData.hospitalValue,
      anesthesiologistValue: surgeryData.anesthesiologistValue,
      instrumentalistValue: surgeryData.instrumentalistValue,
      auxiliaryValue: surgeryData.auxiliaryValue,
      doctorValue: surgeryData.doctorValue,
      doctorAmount: surgeryData.doctorAmount,
      totalAmount: surgeryData.totalAmount,
      hospitalAmount: surgeryData.hospitalAmount,
      assistantAmount: surgeryData.assistantAmount,
      expectedAmount: surgeryData.expectedAmount,
      procedureCodes: surgeryData.procedureCodes,
      status: 'agendada',
      notes: surgeryData.notes,
      createdAt: now,
      updatedAt: now,
      createdBy
    }
    
    surgeries.push(newSurgery)
    saveToStorage(SURGERIES_FILE, surgeries)
    
    return {
      success: true,
      surgery: newSurgery,
      message: 'Cirurgia criada com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao criar cirurgia:', error)
    return {
      success: false,
      surgery: {} as Surgery,
      message: 'Erro interno do servidor'
    }
  }
}

export function updateSurgery(
  surgeryId: string,
  updateData: Partial<Surgery>
): { success: boolean; surgery: Surgery; message: string } {
  try {
    const surgeries = getAllSurgeries()
    const surgeryIndex = surgeries.findIndex(surgery => surgery.id === surgeryId)
    
    if (surgeryIndex === -1) {
      return {
        success: false,
        surgery: {} as Surgery,
        message: 'Cirurgia nÃ£o encontrada'
      }
    }
    
    const updatedSurgery: Surgery = {
      ...surgeries[surgeryIndex],
      ...updateData,
      updatedAt: getBrasiliaTimestamp()
    }
    
    surgeries[surgeryIndex] = updatedSurgery
    saveToStorage(SURGERIES_FILE, surgeries)
    
    return {
      success: true,
      surgery: updatedSurgery,
      message: 'Cirurgia atualizada com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao atualizar cirurgia:', error)
    return {
      success: false,
      surgery: {} as Surgery,
      message: 'Erro interno do servidor'
    }
  }
}

export function deleteSurgery(surgeryId: string): { success: boolean; message: string } {
  try {
    const surgeries = getAllSurgeries()
    const surgeryIndex = surgeries.findIndex(surgery => surgery.id === surgeryId)
    
    if (surgeryIndex === -1) {
      return {
        success: false,
        message: 'Cirurgia nÃ£o encontrada'
      }
    }
    
    surgeries.splice(surgeryIndex, 1)
    saveToStorage(SURGERIES_FILE, surgeries)
    
    return {
      success: true,
      message: 'Cirurgia removida com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao remover cirurgia:', error)
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

// ==================== FUNÃ‡Ã•ES DE MIGRAÃ‡ÃƒO E LIMPEZA ====================

export function migrateFromOldSystems(): {
  success: boolean
  stats: {
    communicationContacts: number
    medicalPatients: number
    appointments: number
    medicalRecords: number
  }
  message: string
} {
  // Esta funÃ§Ã£o serÃ¡ implementada para migrar dados dos sistemas antigos
  // para o novo sistema unificado
  
  return {
    success: true,
    stats: {
      communicationContacts: 0,
      medicalPatients: 0,
      appointments: 0,
      medicalRecords: 0
    },
    message: 'MigraÃ§Ã£o serÃ¡ implementada'
  }
}

export function validateDataIntegrity(): {
  success: boolean
  issues: string[]
  message: string
} {
  const issues: string[] = []
  
  try {
    // Verificar integridade dos contatos de comunicaÃ§Ã£o
    const contacts = getAllCommunicationContacts()
    
    // Verificar integridade dos pacientes mÃ©dicos
    const patients = getAllMedicalPatients()
    
    // Verificar se todos os pacientes mÃ©dicos tÃªm contatos de comunicaÃ§Ã£o vÃ¡lidos
    for (const patient of patients) {
      const contact = getCommunicationContactById(patient.communicationContactId)
      if (!contact) {
        issues.push(`Paciente mÃ©dico ${patient.id} nÃ£o tem contato de comunicaÃ§Ã£o vÃ¡lido`)
      }
    }
    
    // Verificar integridade dos agendamentos
    const appointments = getAllAppointments()
    
    for (const appointment of appointments) {
      const contact = getCommunicationContactById(appointment.communicationContactId)
      if (!contact) {
        issues.push(`Agendamento ${appointment.id} nÃ£o tem contato de comunicaÃ§Ã£o vÃ¡lido`)
      }
      
      if (appointment.medicalPatientId) {
        const patient = getMedicalPatientById(appointment.medicalPatientId)
        if (!patient) {
          issues.push(`Agendamento ${appointment.id} referencia paciente mÃ©dico inexistente`)
        }
      }
    }
    
    // Verificar integridade dos prontuÃ¡rios
    const records = getAllMedicalRecords()
    
    for (const record of records) {
      const patient = getMedicalPatientById(record.medicalPatientId)
      if (!patient) {
        issues.push(`ProntuÃ¡rio ${record.id} referencia paciente mÃ©dico inexistente`)
      }
    }
    
    return {
      success: issues.length === 0,
      issues,
      message: issues.length === 0 ? 'Integridade dos dados verificada com sucesso' : `${issues.length} problemas encontrados`
    }
  } catch (error) {
    console.error('âŒ Erro ao validar integridade dos dados:', error)
    return {
      success: false,
      issues: ['Erro interno ao validar dados'],
      message: 'Erro interno do servidor'
    }
  }
}


export function updateMedicalRecord(
  recordId: string,
  updateData: Partial<MedicalRecord>
): { success: boolean; record?: MedicalRecord; message: string } {
  try {
    const records = getAllMedicalRecords()
    const recordIndex = records.findIndex(record => record.id === recordId)
    
    if (recordIndex === -1) {
      return {
        success: false,
        message: 'ProntuÃ¡rio mÃ©dico nÃ£o encontrado'
      }
    }
    
    // ProntuÃ¡rios sÃ£o readonly por padrÃ£o, mas permitir atualizaÃ§Ãµes especÃ­ficas
    const currentRecord = records[recordIndex]
    const now = getBrasiliaTimestamp()
    
    // Campos que podem ser atualizados
    const updatedRecord: MedicalRecord = {
      ...currentRecord,
      prescription: updateData.prescription ?? currentRecord.prescription,
      observations: updateData.observations ?? currentRecord.observations,
      attachments: updateData.attachments ?? currentRecord.attachments,
      calculatorResults: updateData.calculatorResults ?? currentRecord.calculatorResults,
      diagnosticHypotheses: updateData.diagnosticHypotheses ?? currentRecord.diagnosticHypotheses,
      digitalSignature: updateData.digitalSignature ?? currentRecord.digitalSignature,
      signedAt: updateData.signedAt ?? currentRecord.signedAt
    }
    
    // Recalcular checksum se dados crÃ­ticos foram alterados
    if (updateData.prescription || updateData.observations) {
      const recordContent = JSON.stringify({
        medicalPatientId: updatedRecord.medicalPatientId,
        consultationDate: updatedRecord.consultationDate,
        consultationTime: updatedRecord.consultationTime,
        anamnesis: updatedRecord.anamnesis,
        physicalExamination: updatedRecord.physicalExamination,
        diagnosis: updatedRecord.diagnosis,
        treatment: updatedRecord.treatment,
        prescription: updatedRecord.prescription,
        observations: updatedRecord.observations,
        doctorName: updatedRecord.doctorName,
        doctorCrm: updatedRecord.doctorCrm,
        updatedAt: now
      })
      
      updatedRecord.checksum = Buffer.from(recordContent).toString('base64')
    }
    
    records[recordIndex] = updatedRecord
    saveToStorage(MEDICAL_RECORDS_FILE, records)
    
    return {
      success: true,
      record: updatedRecord,
      message: 'ProntuÃ¡rio mÃ©dico atualizado com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao atualizar prontuÃ¡rio mÃ©dico:', error)
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

export function deleteMedicalRecord(recordId: string): { success: boolean; message: string } {
  try {
    const records = getAllMedicalRecords()
    const recordIndex = records.findIndex(record => record.id === recordId)
    
    if (recordIndex === -1) {
      return {
        success: false,
        message: 'ProntuÃ¡rio mÃ©dico nÃ£o encontrado'
      }
    }
    
    // Remover o prontuÃ¡rio
    records.splice(recordIndex, 1)
    saveToStorage(MEDICAL_RECORDS_FILE, records)
    
    return {
      success: true,
      message: 'ProntuÃ¡rio mÃ©dico deletado com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao deletar prontuÃ¡rio mÃ©dico:', error)
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

export function updateAppointment(
  appointmentId: string,
  updateData: Partial<UnifiedAppointment>
): { success: boolean; appointment?: UnifiedAppointment; message: string } {
  try {
    const appointments = getAllAppointments()
    const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId)
    
    if (appointmentIndex === -1) {
      return {
        success: false,
        message: 'Agendamento nÃ£o encontrado'
      }
    }
    
    const currentAppointment = appointments[appointmentIndex]
    const now = getBrasiliaTimestamp()
    
    // Se mudou o contato, atualizar dados copiados
    let updatedContactData = {}
    if (updateData.communicationContactId && updateData.communicationContactId !== currentAppointment.communicationContactId) {
      const contact = getCommunicationContactById(updateData.communicationContactId)
      if (!contact) {
        return {
          success: false,
          message: 'Contato nÃ£o encontrado'
        }
      }
      
      updatedContactData = {
        patientName: contact.name,
        patientPhone: contact.whatsapp || '',
        patientWhatsapp: contact.whatsapp || '',
        patientEmail: contact.email,
        // Backward compatibility
        patientId: updateData.communicationContactId
      }
    }
    
    // Se mudou o paciente mÃ©dico, atualizar dados mÃ©dicos
    let updatedPatientData = {}
    if (updateData.medicalPatientId !== undefined) {
      if (updateData.medicalPatientId) {
        const medicalPatient = getMedicalPatientById(updateData.medicalPatientId)
        if (medicalPatient) {
          updatedPatientData = {
            patientCpf: medicalPatient.cpf,
            patientMedicalRecordNumber: medicalPatient.medicalRecordNumber,
            insuranceType: medicalPatient.insurance.type,
            insurancePlan: medicalPatient.insurance.plan
          }
        }
      } else {
        updatedPatientData = {
          patientCpf: undefined,
          patientMedicalRecordNumber: undefined,
          insuranceType: undefined,
          insurancePlan: undefined
        }
      }
    }
    
    const updatedAppointment: UnifiedAppointment = {
      ...currentAppointment,
      ...updateData,
      ...updatedContactData,
      ...updatedPatientData,
      updatedAt: now
    }
    
    appointments[appointmentIndex] = updatedAppointment
    saveToStorage(APPOINTMENTS_FILE, appointments)
    
    return {
      success: true,
      appointment: updatedAppointment,
      message: 'Agendamento atualizado com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao atualizar agendamento:', error)
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

export function deleteAppointment(appointmentId: string): { success: boolean; message: string } {
  try {
    const appointments = getAllAppointments()
    const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId)
    
    if (appointmentIndex === -1) {
      return {
        success: false,
        message: 'Agendamento nÃ£o encontrado'
      }
    }
    
    appointments.splice(appointmentIndex, 1)
    saveToStorage(APPOINTMENTS_FILE, appointments)
    
    return {
      success: true,
      message: 'Agendamento deletado com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao deletar agendamento:', error)
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

export function deleteMedicalPatient(patientId: string): { success: boolean; message: string } {
  try {
    const patients = getAllMedicalPatients()
    const patientIndex = patients.findIndex(patient => patient.id === patientId)
    
    if (patientIndex === -1) {
      return {
        success: false,
        message: 'Paciente mÃ©dico nÃ£o encontrado'
      }
    }
    
    // Verificar se existem prontuÃ¡rios mÃ©dicos associados
    const medicalRecords = getMedicalRecordsByPatient(patientId)
    if (medicalRecords.length > 0) {
      return {
        success: false,
        message: 'NÃ£o Ã© possÃ­vel deletar paciente com prontuÃ¡rios mÃ©dicos associados'
      }
    }
    
    // Verificar se existem agendamentos associados
    const appointments = getAllAppointments()
    const associatedAppointments = appointments.filter(apt => 
      apt.medicalPatientId === patientId || apt.patientId === patientId
    )
    if (associatedAppointments.length > 0) {
      console.log('🔍 Agendamentos associados encontrados:', associatedAppointments.map(apt => ({
        id: apt.id,
        patientName: apt.patientName,
        date: apt.appointmentDate,
        status: apt.status
      })))
      return {
        success: false,
        message: 'NÃ£o Ã© possÃ­vel deletar paciente com agendamentos associados'
      }
    }
    
    // Remover o paciente mÃ©dico
    patients.splice(patientIndex, 1)
    saveToStorage(MEDICAL_PATIENTS_FILE, patients)
    
    return {
      success: true,
      message: 'Paciente mÃ©dico deletado com sucesso'
    }
  } catch (error) {
    console.error('âŒ Erro ao deletar paciente mÃ©dico:', error)
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}



