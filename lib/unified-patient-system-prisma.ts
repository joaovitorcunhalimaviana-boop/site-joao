// Sistema Unificado de Pacientes e Comunicação - Versão Prisma
// Integra todos os cadastros em duas camadas: Comunicação e Pacientes Médicos

import { prisma } from './prisma-service'
import { getBrasiliaTimestamp } from './date-utils'
import { sendTelegramAppointmentNotification, AppointmentNotificationData } from './telegram-notifications'
import { validateCPF } from './validation-schemas'
import { MedicalAttachment } from './medical-attachments-temp'
import { 
  CommunicationContact as PrismaCommunicationContact,
  MedicalPatient as PrismaMedicalPatient,
  Appointment as PrismaAppointment,
  AppointmentStatus,
  AppointmentSource,
  AppointmentType,
  InsuranceType
} from '@prisma/client'

// ==================== INTERFACES UNIFICADAS ====================

// CAMADA 1: Sistema de Comunicação (mais amplo)
export interface CommunicationContact {
  id: string
  name: string
  email?: string
  whatsapp?: string
  phone?: string // Alias for whatsapp for compatibility
  birthDate?: string // Para emails de aniversário
  
  // Rastreamento de fontes de cadastro
  registrationSources: ('newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review')[]
  
  // Preferências de comunicação
  emailPreferences: {
    newsletter: boolean
    appointments: boolean
    birthday: boolean
    promotions: boolean
  }
  
  whatsappPreferences: {
    appointments: boolean
    reminders: boolean
    promotions: boolean
  }
  
  // Dados específicos de avaliações (quando aplicável)
  reviewData?: {
    rating: number
    comment: string
    reviewDate: string
    isPublic: boolean
  }
  
  // Metadados
  createdAt: string
  updatedAt: string
  lastContactAt?: string
}

// CAMADA 2: Sistema de Pacientes Médicos (mais específico)
export interface MedicalPatient {
  id: string
  communicationContactId: string // FK para CommunicationContact
  
  // Dados pessoais específicos médicos
  fullName: string
  cpf: string
  rg?: string
  birthDate: string
  gender?: 'M' | 'F' | 'Other'
  maritalStatus?: string
  profession?: string
  
  // Dados de contato de emergência
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  
  // Informações de seguro
  insurance: {
    type: 'unimed' | 'particular' | 'outro'
    cardNumber?: string
    planType?: string
  }
  
  // Informações médicas básicas
  medicalInfo: {
    allergies?: string[]
    medications?: string[]
    medicalHistory?: string
    observations?: string
  }
  
  // Consentimentos e termos
  consents: {
    lgpd: boolean
    lgpdDate: string
    medicalTreatment: boolean
    imageUse?: boolean
    dataSharing?: boolean
  }
  
  // Metadados
  createdAt: string
  updatedAt: string
  recordNumber: number // Número sequencial do prontuário
}

// CAMADA 3: Sistema de Agendamentos Unificado
export interface UnifiedAppointment {
  id: string
  communicationContactId: string // FK obrigatória
  medicalPatientId?: string // FK opcional (nem todo agendamento vira paciente médico)
  patientName?: string // Nome do paciente para exibição
  patientCpf?: string // CPF do paciente (apenas se for paciente médico)
  patientPhone?: string // Telefone do paciente
  patientWhatsapp?: string // WhatsApp do paciente
  patientEmail?: string // Email do paciente
  
  // Dados do agendamento
  appointmentDate: string // YYYY-MM-DD
  appointmentTime: string // HH:MM
  duration?: number // em minutos
  
  // Tipo e status
  type: 'consultation' | 'return' | 'exam' | 'procedure' | 'surgery' | 'emergency'
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  
  // Detalhes médicos
  specialty?: string
  doctorName?: string
  reason?: string
  observations?: string
  
  // Informações de seguro para o agendamento
  insuranceType?: 'unimed' | 'particular' | 'outro'
  insurancePlan?: string // Plano do convênio
  
  // Origem do agendamento
  source: 'phone' | 'whatsapp' | 'website' | 'walk_in' | 'referral' | 'return'
  
  // Notificações
  reminderSent?: boolean
  confirmationSent?: boolean
  
  // Metadados
  createdAt: string
  updatedAt: string
}

// ==================== FUNÇÕES DO SISTEMA DE COMUNICAÇÃO ====================

export async function getAllCommunicationContacts(): Promise<CommunicationContact[]> {
  try {
    const contacts = await prisma.communicationContact.findMany({
      orderBy: { name: 'asc' }
    })
    
    return contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email || undefined,
      whatsapp: contact.whatsapp || undefined,
      phone: contact.whatsapp || undefined, // Alias for compatibility
      birthDate: contact.birthDate || undefined,
      registrationSources: (contact.registrationSources as string[]) || [],
      emailPreferences: contact.emailPreferences as any || {
        newsletter: false,
        appointments: false,
        birthday: false,
        promotions: false
      },
      whatsappPreferences: contact.whatsappPreferences as any || {
        appointments: false,
        reminders: false,
        promotions: false
      },
      reviewData: contact.reviewData as any || undefined,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('Erro ao buscar contatos de comunicação:', error)
    return []
  }
}

export async function createOrUpdateCommunicationContact(
  contactData: Partial<CommunicationContact> & {
    name: string
    source: 'newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review'
  }
): Promise<{ success: boolean; contact?: CommunicationContact; message: string }> {
  try {
    // Validar formato de email se fornecido
    if (contactData.email) {
      const emailTrimmed = contactData.email.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
        return {
          success: false,
          message: 'Formato de email inválido'
        }
      }
      contactData.email = emailTrimmed
    }

    // Validar telefone/WhatsApp se fornecido
    if (contactData.whatsapp) {
      const whatsappClean = contactData.whatsapp.replace(/\D/g, '')
      if (whatsappClean.length < 10 || whatsappClean.length > 11) {
        return {
          success: false,
          message: 'Número de WhatsApp inválido'
        }
      }
      contactData.whatsapp = whatsappClean
    }

    // Buscar contato existente por email ou WhatsApp
    let existingContact = null

    if (contactData.email) {
      existingContact = await prisma.communicationContact.findFirst({
        where: { email: contactData.email }
      })
    }

    if (!existingContact && contactData.whatsapp) {
      existingContact = await prisma.communicationContact.findFirst({
        where: { whatsapp: contactData.whatsapp }
      })
    }

    let updatedContact
    
    if (existingContact) {
      // Atualizar contato existente
      updatedContact = await prisma.communicationContact.update({
        where: { id: existingContact.id },
        data: {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          whatsapp: contactData.whatsapp,
          birthDate: contactData.birthDate,
          // Update individual preference fields based on the actual schema
          emailSubscribed: contactData.emailPreferences?.subscribed ?? true,
          emailNewsletter: contactData.emailPreferences?.newsletter ?? false,
          emailHealthTips: contactData.emailPreferences?.healthTips ?? true,
          emailAppointments: contactData.emailPreferences?.appointments ?? true,
          emailPromotions: contactData.emailPreferences?.promotions ?? false,
          whatsappSubscribed: contactData.whatsappPreferences?.subscribed ?? true,
          whatsappAppointments: contactData.whatsappPreferences?.appointments ?? true,
          whatsappReminders: contactData.whatsappPreferences?.reminders ?? true,
          whatsappPromotions: contactData.whatsappPreferences?.promotions ?? false,
          emailSubscribedAt: contactData.email ? new Date() : undefined,
          whatsappSubscribedAt: contactData.whatsapp ? new Date() : undefined
        }
      })
    } else {
      // Criar novo contato
      updatedContact = await prisma.communicationContact.create({
        data: {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          whatsapp: contactData.whatsapp,
          birthDate: contactData.birthDate,
          // Set individual preference fields based on the actual schema
          emailSubscribed: contactData.emailPreferences?.subscribed ?? true,
          emailNewsletter: contactData.emailPreferences?.newsletter ?? false,
          emailHealthTips: contactData.emailPreferences?.healthTips ?? true,
          emailAppointments: contactData.emailPreferences?.appointments ?? true,
          emailPromotions: contactData.emailPreferences?.promotions ?? false,
          whatsappSubscribed: contactData.whatsappPreferences?.subscribed ?? true,
          whatsappAppointments: contactData.whatsappPreferences?.appointments ?? true,
          whatsappReminders: contactData.whatsappPreferences?.reminders ?? true,
          whatsappPromotions: contactData.whatsappPreferences?.promotions ?? false,
          emailSubscribedAt: contactData.email ? new Date() : undefined,
          whatsappSubscribedAt: contactData.whatsapp ? new Date() : undefined
        }
      })
    }

    // Create registration source entry separately
    if (updatedContact.id) {
      await prisma.registrationSource.create({
        data: {
          contactId: updatedContact.id,
          source: contactData.source.toUpperCase() as any
        }
      })
    }

    const formattedContact: CommunicationContact = {
      id: updatedContact.id,
      name: updatedContact.name,
      email: updatedContact.email || undefined,
      phone: updatedContact.phone || undefined,
      whatsapp: updatedContact.whatsapp || undefined,
      birthDate: updatedContact.birthDate || undefined,
      registrationSources: [contactData.source] as any,
      emailPreferences: {
        subscribed: updatedContact.emailSubscribed,
        newsletter: updatedContact.emailNewsletter,
        healthTips: updatedContact.emailHealthTips,
        appointments: updatedContact.emailAppointments,
        promotions: updatedContact.emailPromotions
      } as any,
      whatsappPreferences: {
        subscribed: updatedContact.whatsappSubscribed,
        appointments: updatedContact.whatsappAppointments,
        reminders: updatedContact.whatsappReminders,
        promotions: updatedContact.whatsappPromotions
      } as any,
      createdAt: updatedContact.createdAt.toISOString(),
      updatedAt: updatedContact.updatedAt.toISOString()
    }

    return {
      success: true,
      contact: formattedContact,
      message: existingContact ? 'Contato atualizado com sucesso' : 'Contato criado com sucesso'
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar contato de comunicação:', error)
    return {
      success: false,
      message: 'Erro ao processar contato de comunicação'
    }
  }
}

export async function getCommunicationContactById(id: string): Promise<CommunicationContact | null> {
  try {
    const contact = await prisma.communicationContact.findUnique({
      where: { id }
    })
    
    if (!contact) return null
    
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email || undefined,
      whatsapp: contact.whatsapp || undefined,
      phone: contact.whatsapp || undefined,
      birthDate: contact.birthDate || undefined,
      registrationSources: contact.registrationSources as ('newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review')[],
      emailPreferences: contact.emailPreferences as any,
      whatsappPreferences: contact.whatsappPreferences as any,
      reviewData: contact.reviewData as any,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    }
  } catch (error) {
    console.error('❌ Erro ao buscar contato por ID:', error)
    return null
  }
}

export async function getCommunicationContactByEmail(email: string): Promise<CommunicationContact | null> {
  try {
    const contact = await prisma.communicationContact.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    })
    
    if (!contact) return null
    
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email || undefined,
      whatsapp: contact.whatsapp || undefined,
      phone: contact.whatsapp || undefined,
      birthDate: contact.birthDate || undefined,
      registrationSources: contact.registrationSources as ('newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review')[],
      emailPreferences: contact.emailPreferences as any,
      whatsappPreferences: contact.whatsappPreferences as any,
      reviewData: contact.reviewData as any,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('❌ Erro ao buscar contato por email:', error)
    return null
  }
}

export async function getCommunicationContactByPhone(phone: string): Promise<CommunicationContact | null> {
  try {
    const phoneClean = phone.replace(/\D/g, '')
    const contact = await prisma.communicationContact.findFirst({
      where: { 
        whatsapp: {
          contains: phoneClean
        }
      }
    })
    
    if (!contact) return null
    
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email || undefined,
      whatsapp: contact.whatsapp || undefined,
      phone: contact.whatsapp || undefined,
      birthDate: contact.birthDate || undefined,
      registrationSources: contact.registrationSources as ('newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review')[],
      emailPreferences: contact.emailPreferences as any,
      whatsappPreferences: contact.whatsappPreferences as any,
      reviewData: contact.reviewData as any,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('❌ Erro ao buscar contato por telefone:', error)
    return null
  }
}

// ==================== FUNÇÕES DO SISTEMA DE PACIENTES MÉDICOS ====================

export async function getAllMedicalPatients(): Promise<MedicalPatient[]> {
  try {
    const patients = await prisma.medicalPatient.findMany({
      where: {
        isActive: true
      },
      include: {
        communicationContact: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return patients.map(patient => ({
      id: patient.id,
      communicationContactId: patient.communicationContactId,
      fullName: patient.fullName,
      cpf: patient.cpf,
      rg: patient.rg || undefined,
      birthDate: patient.birthDate,
      gender: patient.gender as 'M' | 'F' | 'Other' | undefined,
      maritalStatus: patient.maritalStatus || undefined,
      profession: patient.profession || undefined,
      emergencyContact: patient.emergencyContact as any,
      insuranceType: patient.insuranceType,
      insurancePlan: patient.insurancePlan,
      medicalInfo: patient.medicalInfo as any,
      consents: patient.consents as any,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
      medicalRecordNumber: patient.medicalRecordNumber
    }))
  } catch (error) {
    console.error('❌ Erro ao buscar pacientes médicos:', error)
    return []
  }
}

export async function getMedicalPatientById(id: string): Promise<MedicalPatient | null> {
  try {
    const patient = await prisma.medicalPatient.findUnique({
      where: { id },
      include: {
        communicationContact: true
      }
    })
    
    if (!patient) {
      return null
    }
    
    console.log('🏥 Dados do paciente do banco:', {
      id: patient.id,
      fullName: patient.fullName,
      insuranceType: patient.insuranceType,
      insurancePlan: patient.insurancePlan
    })
    
    return {
      id: patient.id,
      communicationContactId: patient.communicationContactId,
      fullName: patient.fullName,
      cpf: patient.cpf,
      rg: patient.rg || undefined,
      birthDate: patient.communicationContact?.birthDate,
      phone: patient.communicationContact?.whatsapp,
      whatsapp: patient.communicationContact?.whatsapp,
      gender: patient.gender as 'M' | 'F' | 'Other' | undefined,
      maritalStatus: patient.maritalStatus || undefined,
      profession: patient.profession || undefined,
      emergencyContact: patient.emergencyContact as any,
      insurance: {
        type: patient.insuranceType?.toLowerCase() as 'unimed' | 'particular' | 'outro' || 'particular',
        plan: patient.insurancePlan || undefined,
        originalType: patient.insuranceType // Manter o tipo original para debug
      },
      medicalInfo: patient.medicalNotes ? { notes: patient.medicalNotes } : undefined,
      consents: {
        dataProcessing: patient.consentDataProcessing,
        medicalTreatment: patient.consentMedicalTreatment,
        imageUse: patient.consentImageUse
      },
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
      recordNumber: patient.medicalRecordNumber
    }
  } catch (error) {
    console.error('❌ Erro ao buscar paciente médico por ID:', error)
    return null
  }
}

export async function updateMedicalPatient(id: string, updates: Partial<MedicalPatient>): Promise<{ success: boolean; patient?: MedicalPatient; message: string }> {
  // TODO: Implement medical patient update with Prisma
  console.log('⚠️ updateMedicalPatient não implementado ainda')
  return {
    success: false,
    message: 'Função não implementada'
  }
}

export async function deleteMedicalPatient(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const existingPatient = await prisma.medicalPatient.findUnique({
      where: { id },
      include: {
        appointments: true,
        medicalRecords: true
      }
    })

    if (!existingPatient) {
      return {
        success: false,
        message: 'Paciente médico não encontrado'
      }
    }

    // Verificar se há agendamentos associados
    if (existingPatient.appointments && existingPatient.appointments.length > 0) {
      console.log(`⚠️ Paciente ${id} possui ${existingPatient.appointments.length} agendamentos associados`)
      // Opcional: deletar agendamentos em cascata ou retornar erro
      // Por enquanto, vamos deletar os agendamentos primeiro
      await prisma.appointment.deleteMany({
        where: { medicalPatientId: id }
      })
    }

    // Verificar se há prontuários médicos associados
    if (existingPatient.medicalRecords && existingPatient.medicalRecords.length > 0) {
      console.log(`⚠️ Paciente ${id} possui ${existingPatient.medicalRecords.length} prontuários associados`)
      // Deletar prontuários em cascata
      await prisma.medicalRecord.deleteMany({
        where: { medicalPatientId: id }
      })
    }

    // Marcar o paciente médico como inativo (soft delete)
    await prisma.medicalPatient.update({
      where: { id },
      data: { isActive: false }
    })

    console.log(`🗑️ Paciente médico ${id} foi marcado como inativo`)
    
    return {
      success: true,
      message: 'Paciente médico excluído com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao deletar paciente médico:', error)
    return {
      success: false,
      message: 'Erro ao excluir paciente médico'
    }
  }
}

// ==================== FUNÇÕES DO SISTEMA DE AGENDAMENTOS ====================

export async function getAllAppointments(): Promise<UnifiedAppointment[]> {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        communicationContact: true,
        medicalPatient: true
      },
      orderBy: { appointmentDate: 'desc' }
    })
    
    return appointments.map(appointment => ({
      id: appointment.id,
      communicationContactId: appointment.communicationContactId,
      medicalPatientId: appointment.medicalPatientId || undefined,
      patientName: appointment.medicalPatient?.fullName || appointment.communicationContact?.name || 'Paciente não identificado',
      patientCpf: appointment.medicalPatient?.cpf || undefined,
      patientPhone: appointment.communicationContact?.whatsapp || '',
      patientWhatsapp: appointment.communicationContact?.whatsapp || '',
      patientEmail: appointment.communicationContact?.email || '',
      insuranceType: appointment.medicalPatient?.insurance?.type || appointment.insuranceType as 'unimed' | 'particular' | 'outro' | undefined,
      insurancePlan: appointment.medicalPatient?.insurance?.planType || undefined,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      duration: appointment.duration || undefined,
      type: mapAppointmentTypeFromPrisma(appointment.type),
      status: mapAppointmentStatusFromPrisma(appointment.status),
      specialty: appointment.specialty || undefined,
      doctorName: appointment.doctorName || undefined,
      reason: appointment.reason || undefined,
      observations: appointment.observations || undefined,
      insuranceType: (appointment.medicalPatient?.insuranceType?.toLowerCase() || appointment.insuranceType || 'particular') as 'unimed' | 'particular' | 'outro',
      insurancePlan: appointment.medicalPatient?.insurancePlan || undefined,
      source: mapAppointmentSourceFromPrisma(appointment.source),
      reminderSent: appointment.reminderSent || undefined,
      confirmationSent: appointment.confirmationSent || undefined,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos:', error)
    return []
  }
}

export async function getAppointmentsByDate(date: string): Promise<UnifiedAppointment[]> {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { appointmentDate: date },
      include: {
        communicationContact: true,
        medicalPatient: true
      },
      orderBy: { appointmentTime: 'asc' }
    })
    
    return appointments.map(appointment => ({
      id: appointment.id,
      communicationContactId: appointment.communicationContactId,
      medicalPatientId: appointment.medicalPatientId || undefined,
      patientName: appointment.medicalPatient?.fullName || appointment.communicationContact?.name || 'Paciente não identificado',
      patientCpf: appointment.medicalPatient?.cpf || undefined,
      patientPhone: appointment.communicationContact?.whatsapp || '',
      patientWhatsapp: appointment.communicationContact?.whatsapp || '',
      patientEmail: appointment.communicationContact?.email || '',
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      duration: appointment.duration || undefined,
      type: mapAppointmentTypeFromPrisma(appointment.type),
      status: mapAppointmentStatusFromPrisma(appointment.status),
      specialty: appointment.specialty || undefined,
      doctorName: appointment.doctorName || undefined,
      reason: appointment.reason || undefined,
      observations: appointment.observations || undefined,
      source: mapAppointmentSourceFromPrisma(appointment.source),
      reminderSent: appointment.reminderSent || undefined,
      confirmationSent: appointment.confirmationSent || undefined,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos por data:', error)
    return []
  }
}

export async function getAppointmentById(id: string): Promise<UnifiedAppointment | null> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    })
    
    if (!appointment) return null
    
    return {
      id: appointment.id,
      communicationContactId: appointment.communicationContactId,
      medicalPatientId: appointment.medicalPatientId || undefined,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      duration: appointment.duration || undefined,
      type: mapAppointmentTypeFromPrisma(appointment.type),
      status: mapAppointmentStatusFromPrisma(appointment.status),
      specialty: appointment.specialty || undefined,
      doctorName: appointment.doctorName || undefined,
      reason: appointment.reason || undefined,
      observations: appointment.observations || undefined,
      insuranceType: appointment.insuranceType as 'unimed' | 'particular' | 'outro' | undefined,
      source: mapAppointmentSourceFromPrisma(appointment.source),
      reminderSent: appointment.reminderSent || undefined,
      confirmationSent: appointment.confirmationSent || undefined,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString()
    }
  } catch (error) {
    console.error('❌ Erro ao buscar agendamento por ID:', error)
    return null
  }
}

// Helper functions for mapping Prisma enums
function mapAppointmentTypeFromPrisma(type: AppointmentType): string {
  switch (type) {
    case 'CONSULTATION': return 'consultation'
    case 'RETURN': return 'return'
    case 'EXAM': return 'exam'
    case 'PROCEDURE': return 'procedure'
    case 'SURGERY': return 'surgery'
    case 'EMERGENCY': return 'emergency'
    default: return 'consultation'
  }
}

function mapAppointmentStatusFromPrisma(status: AppointmentStatus): string {
  switch (status) {
    case 'SCHEDULED': return 'agendada'
    case 'CONFIRMED': return 'confirmada'
    case 'IN_PROGRESS': return 'em_andamento'
    case 'COMPLETED': return 'concluida'
    case 'CANCELLED': return 'cancelada'
    case 'NO_SHOW': return 'cancelada'
    default: return 'agendada'
  }
}

function mapAppointmentSourceFromPrisma(source: AppointmentSource): string {
  switch (source) {
    case 'PHONE': return 'phone'
    case 'WHATSAPP': return 'whatsapp'
    case 'WEBSITE': return 'website'
    case 'WALK_IN': return 'walk_in'
    case 'REFERRAL': return 'referral'
    case 'RETURN': return 'return'
    default: return 'phone'
  }
}

// ==================== FUNÇÕES DO SISTEMA DE HORÁRIOS ====================

export interface SCHEDULESlot {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  duration: number // em minutos
  isAvailable: boolean
  doctorName?: string
  specialty?: string
  appointmentId?: string // Se ocupado
  createdAt: string
  updatedAt: string
}

export async function getAllSCHEDULESlots(): Promise<SCHEDULESlot[]> {
  try {
    const slots = await prisma.scheduleSlot.findMany({
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    })

    return slots.map(slot => ({
      id: slot.id,
      date: slot.date,
      time: slot.time,
      duration: 30, // Duração padrão de 30 minutos
      isAvailable: slot.isActive,
      isActive: slot.isActive,
      doctorName: 'Dr. João Vitor Viana',
      specialty: 'Coloproctologia',
      createdAt: slot.createdAt.toISOString(),
      updatedAt: slot.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('❌ Erro ao buscar slots:', error)
    return []
  }
}

export async function createSCHEDULESlot(slotData: Partial<SCHEDULESlot>): Promise<{ success: boolean; slot?: SCHEDULESlot; message: string }> {
  try {
    const { date, time } = slotData

    if (!date || !time) {
      return {
        success: false,
        message: 'Data e horário são obrigatórios'
      }
    }

    // Verificar se já existe um slot para esta data e horário
    const existingSlot = await prisma.scheduleSlot.findFirst({
      where: {
        date: date,
        time: time,
        isActive: true
      }
    })

    if (existingSlot) {
      return {
        success: false,
        message: 'Já existe um horário para esta data e hora'
      }
    }

    // Criar o novo slot
    const newSlot = await prisma.scheduleSlot.create({
      data: {
        date: date,
        time: time,
        isActive: true
      }
    })

    const slot: SCHEDULESlot = {
      id: newSlot.id,
      date: newSlot.date,
      time: newSlot.time,
      duration: 30,
      isAvailable: newSlot.isActive,
      doctorName: 'Dr. João Vitor Viana',
      specialty: 'Coloproctologia',
      createdAt: newSlot.createdAt.toISOString(),
      updatedAt: newSlot.updatedAt.toISOString()
    }

    return {
      success: true,
      slot: slot,
      message: 'Horário criado com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao criar slot:', error)
    return {
      success: false,
      message: 'Erro ao criar horário'
    }
  }
}

export async function updateSCHEDULESlot(id: string, updates: Partial<SCHEDULESlot>): Promise<{ success: boolean; slot?: SCHEDULESlot; message: string }> {
  try {
    const existingSlot = await prisma.scheduleSlot.findUnique({
      where: { id }
    })

    if (!existingSlot) {
      return {
        success: false,
        message: 'Horário não encontrado'
      }
    }

    const updatedSlot = await prisma.scheduleSlot.update({
      where: { id },
      data: {
        isActive: updates.isAvailable !== undefined ? updates.isAvailable : existingSlot.isActive,
        updatedAt: new Date()
      }
    })

    const slot: SCHEDULESlot = {
      id: updatedSlot.id,
      date: updatedSlot.date,
      time: updatedSlot.time,
      duration: 30,
      isAvailable: updatedSlot.isActive,
      doctorName: 'Dr. João Vitor Viana',
      specialty: 'Coloproctologia',
      createdAt: updatedSlot.createdAt.toISOString(),
      updatedAt: updatedSlot.updatedAt.toISOString()
    }

    return {
      success: true,
      slot: slot,
      message: 'Horário atualizado com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar slot:', error)
    return {
      success: false,
      message: 'Erro ao atualizar horário'
    }
  }
}

export async function deleteSCHEDULESlot(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const existingSlot = await prisma.scheduleSlot.findUnique({
      where: { id }
    })

    if (!existingSlot) {
      return {
        success: false,
        message: 'Horário não encontrado'
      }
    }

    // Soft delete - marcar como inativo ao invés de deletar
    await prisma.scheduleSlot.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      message: 'Horário removido com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao deletar slot:', error)
    return {
      success: false,
      message: 'Erro ao remover horário'
    }
  }
}

// ==================== FUNÇÕES DO SISTEMA DE CIRURGIAS ====================

export async function getSurgeriesByDate(date: string): Promise<any[]> {
  // TODO: Implement surgeries by date with Prisma
  console.log('⚠️ getSurgeriesByDate não implementado ainda')
  return []
}

// ==================== INTERFACES PARA PRONTUÁRIOS E CIRURGIAS ====================

export interface MedicalRecord {
  id: string
  patientId: string
  date: string
  time?: string
  type: string
  anamnesis: string
  examination?: string
  diagnosis?: string
  treatment?: string
  prescription?: string
  observations?: string
  calculatorResults?: any[]
  diagnosticHypotheses?: any[]
  attachments?: MedicalAttachment[]
  medications?: string[]
  notes?: string
  doctorName?: string
  createdAt: string
  updatedAt: string
}

export interface Surgery {
  id: string
  communicationContactId: string
  medicalPatientId?: string
  surgeryDate: string
  surgeryTime: string
  type: string
  description: string
  surgeon: string
  anesthesiologist?: string
  duration?: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  preOpNotes?: string
  postOpNotes?: string
  complications?: string
  createdAt: string
  updatedAt: string
}

// ==================== FUNÇÕES DE PRONTUÁRIOS MÉDICOS ====================

export async function getMedicalRecordsByPatientId(patientId: string): Promise<MedicalRecord[]> {
  try {
    console.log('📋 Buscando prontuários médicos para paciente:', patientId)
    
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        medicalPatientId: patientId
      },
      include: {
        consultation: true,
        doctor: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📋 Encontrados ${medicalRecords.length} prontuários para o paciente ${patientId}`)

    const formattedRecords: MedicalRecord[] = medicalRecords.map(record => {
      let parsedContent: any = {}
      try {
        parsedContent = JSON.parse(record.content || '{}')
      } catch (error) {
        console.warn('⚠️ Erro ao parsear conteúdo do prontuário:', error)
        parsedContent = {}
      }

      return {
        id: record.id,
        patientId: record.medicalPatientId || '',
        date: record.consultation?.startTime ? 
          record.consultation.startTime.toISOString().split('T')[0] : 
          record.createdAt.toISOString().split('T')[0],
        time: record.consultation?.startTime ? 
          record.consultation.startTime.toTimeString().split(' ')[0].substring(0, 5) : 
          record.createdAt.toTimeString().split(' ')[0].substring(0, 5),
        type: 'consultation',
        anamnesis: parsedContent.anamnesis || '',
        examination: parsedContent.physicalExamination || '',
        diagnosis: parsedContent.diagnosis || '',
        treatment: parsedContent.treatment || '',
        prescription: parsedContent.prescription || '',
        observations: parsedContent.observations || '',
        calculatorResults: parsedContent.calculatorResults || [],
        diagnosticHypotheses: parsedContent.diagnosticHypotheses || [],
        doctorName: record.doctor?.name || 'Dr. João Vitor Viana',
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      }
    })

    console.log('📋 Prontuários formatados:', formattedRecords.length)
    return formattedRecords
  } catch (error) {
    console.error('❌ Erro ao buscar prontuários médicos:', error)
    return []
  }
}

export async function createMedicalRecord(recordData: any): Promise<{ success: boolean; record?: MedicalRecord; message: string }> {
  try {
    console.log('📋 Criando prontuário médico:', recordData)

    // Buscar o ID do médico ativo
    const doctor = await prisma.user.findFirst({
      where: {
        role: 'DOCTOR',
        isActive: true
      }
    })

    if (!doctor) {
      throw new Error('Nenhum médico ativo encontrado no sistema')
    }

    // Primeiro, criar uma consulta se não existir
    let consultationId = recordData.consultationId
    if (!consultationId) {
      const consultation = await prisma.consultation.create({
        data: {
          medicalPatientId: recordData.medicalPatientId,
          doctorId: doctor.id,
          startTime: new Date(`${recordData.consultationDate}T${recordData.consultationTime}:00`),
          status: 'COMPLETED',
          anamnese: recordData.anamnesis
        },
      })
      consultationId = consultation.id
    }

    // Criar o prontuário médico
    const content = JSON.stringify({
      anamnesis: recordData.anamnesis,
      physicalExamination: recordData.physicalExamination || '',
      diagnosis: recordData.diagnosis || '',
      treatment: recordData.treatment || '',
      prescription: recordData.prescription || '',
      observations: recordData.observations || '',
      calculatorResults: recordData.calculatorResults || [],
      diagnosticHypotheses: recordData.diagnosticHypotheses || [],
      attachments: recordData.attachments || []
    })

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        consultationId: consultationId,
        medicalPatientId: recordData.medicalPatientId,
        doctorId: doctor.id,
        content: content,
        summary: recordData.diagnosis || recordData.anamnesis?.substring(0, 200) || '',
        category: 'consultation',
      },
    })

    // Vincular anexos existentes à consulta se fornecidos
    if (recordData.attachments && recordData.attachments.length > 0) {
      console.log('📎 Vinculando anexos à consulta:', recordData.attachments.length)
      
      // Atualizar anexos para vincular à consulta
      for (const attachment of recordData.attachments) {
        if (attachment.id) {
          await prisma.medicalAttachment.update({
            where: { id: attachment.id },
            data: { consultationId: consultationId }
          })
        }
      }
    }

    const result: MedicalRecord = {
      id: medicalRecord.id,
      patientId: medicalRecord.medicalPatientId || '',
      date: recordData.consultationDate,
      type: 'consultation',
      description: recordData.anamnesis,
      diagnosis: recordData.diagnosis,
      treatment: recordData.treatment,
      medications: [],
      notes: recordData.observations,
      doctorName: recordData.doctorName,
      createdAt: medicalRecord.createdAt.toISOString(),
      updatedAt: medicalRecord.updatedAt.toISOString(),
    }

    console.log('✅ Prontuário médico criado com sucesso:', result.id)
    return { success: true, record: result, message: 'Prontuário criado com sucesso' }
  } catch (error) {
    console.error('❌ Erro ao criar prontuário médico:', error)
    return { success: false, message: `Erro ao criar prontuário médico: ${error}` }
  }
}

export async function updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): Promise<{ success: boolean; record?: MedicalRecord; message: string }> {
  // TODO: Implement medical record update with Prisma
  console.log('⚠️ updateMedicalRecord não implementado ainda')
  return {
    success: false,
    message: 'Função não implementada'
  }
}

export async function deleteMedicalRecord(id: string): Promise<{ success: boolean; message: string }> {
  // TODO: Implement medical record deletion with Prisma
  console.log('⚠️ deleteMedicalRecord não implementado ainda')
  return {
    success: false,
    message: 'Função não implementada'
  }
}

// ==================== FUNÇÕES DE CIRURGIAS ====================

export async function getAllSurgeries(): Promise<Surgery[]> {
  // TODO: Implement surgeries with Prisma
  console.log('⚠️ getAllSurgeries não implementado ainda')
  return []
}

export async function getSurgeryById(id: string): Promise<Surgery | null> {
  // TODO: Implement surgery by ID with Prisma
  console.log('⚠️ getSurgeryById não implementado ainda')
  return null
}

export async function createSurgery(surgery: Omit<Surgery, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; surgery?: Surgery; message: string }> {
  // TODO: Implement surgery creation with Prisma
  console.log('⚠️ createSurgery não implementado ainda')
  return {
    success: false,
    message: 'Função não implementada'
  }
}

export async function updateSurgery(id: string, updates: Partial<Surgery>): Promise<{ success: boolean; surgery?: Surgery; message: string }> {
  // TODO: Implement surgery update with Prisma
  console.log('⚠️ updateSurgery não implementado ainda')
  return {
    success: false,
    message: 'Função não implementada'
  }
}

export async function deleteSurgery(id: string): Promise<{ success: boolean; message: string }> {
  // TODO: Implement surgery deletion with Prisma
  console.log('⚠️ deleteSurgery não implementado ainda')
  return {
    success: false,
    message: 'Função não implementada'
  }
}

export async function getMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
  try {
    console.log('🔍 Buscando registros médicos para paciente:', patientId)
    
    // Buscar todos os anexos do paciente de todas as suas consultas
    const patientAttachments = await prisma.medicalAttachment.findMany({
      where: {
        consultation: {
          medicalPatientId: patientId
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })
    
    // Buscar registros médicos através das consultas do paciente
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        medicalPatientId: patientId
      },
      include: {
        consultation: {
          include: {
            attachments: true,
            prescriptions: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`✅ Encontrados ${medicalRecords.length} registros médicos para o paciente ${patientId}`)
    
    // Mapear para o formato esperado pela interface
    const mappedRecords: MedicalRecord[] = medicalRecords.map(record => {
      // Parse do conteúdo JSON se existir
      let parsedContent: any = {}
      try {
        if (record.content) {
          parsedContent = JSON.parse(record.content)
        }
      } catch (error) {
        console.warn('⚠️ Erro ao fazer parse do content JSON:', error)
        parsedContent = {}
      }

      return {
        id: record.id,
        patientId: record.medicalPatientId || '',
        doctorId: record.doctorId,
        doctorName: record.doctor.name || 'Dr. João Vitor Viana',
        doctorCrm: '', // CRM não está no modelo atual
        date: record.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
        time: record.createdAt.toTimeString().split(' ')[0], // HH:MM:SS
        anamnesis: parsedContent.anamnesis || record.consultation?.anamnese || '',
        physicalExamination: parsedContent.physicalExamination || '',
        diagnosis: parsedContent.diagnosis || '',
        treatment: parsedContent.treatment || '',
        prescription: parsedContent.prescription || record.consultation?.prescriptions?.[0]?.medications || '',
        observations: parsedContent.observations || '',
        attachments: parsedContent.attachments || patientAttachments.map(att => ({
          id: att.id,
          fileName: att.path.split('\\').pop() || att.path.split('/').pop() || att.filename,
          originalName: att.originalName,
          fileType: att.mimeType,
          fileSize: att.size,
          category: att.category.toLowerCase() as 'exame' | 'foto' | 'documento' | 'outro',
          description: att.description || '',
          uploadedAt: att.uploadedAt.toISOString(),
          filePath: att.path
        })) || [],
        calculatorResults: parsedContent.calculatorResults || [],
        diagnosticHypotheses: parsedContent.diagnosticHypotheses || [],
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString()
      }
    })
    
    return mappedRecords
    
  } catch (error) {
    console.error('❌ Erro ao buscar registros médicos:', error)
    return []
  }
}

// ==================== FUNÇÕES ADICIONAIS PARA COMPATIBILIDADE COM API ROUTES ====================

export async function getAllPatients(): Promise<MedicalPatient[]> {
  return getAllMedicalPatients()
}

export async function getPatientById(id: string): Promise<MedicalPatient | null> {
  return getMedicalPatientById(id)
}

export async function createOrUpdatePatient(patientData: any): Promise<{ success: boolean; patient?: MedicalPatient; message: string }> {
  try {
    // Check if patient already exists by CPF
    if (patientData.cpf) {
      const existingPatient = await prisma.medicalPatient.findFirst({
        where: { cpf: patientData.cpf }
      })
      
      if (existingPatient) {
        // Update existing patient and reactivate if it was inactive
        const updatedPatient = await prisma.medicalPatient.update({
          where: { id: existingPatient.id },
          data: {
            fullName: patientData.fullName || patientData.name,
            rg: patientData.rg,
            birthDate: patientData.birthDate,
            gender: patientData.gender,
            maritalStatus: patientData.maritalStatus,
            profession: patientData.profession,
            emergencyContact: patientData.medicalInfo?.emergencyContact,
            emergencyPhone: patientData.medicalInfo?.emergencyPhone,
            insuranceType: patientData.insurance?.type?.toUpperCase() === 'UNIMED' ? 'UNIMED' : 
                          patientData.insurance?.type?.toUpperCase() === 'PARTICULAR' ? 'PARTICULAR' : 'OUTRO',
            insurancePlan: patientData.insurance?.plan,
            insuranceCardNumber: patientData.insurance?.cardNumber,
            insuranceValidUntil: patientData.insurance?.validUntil ? new Date(patientData.insurance.validUntil) : null,
            allergies: Array.isArray(patientData.medicalInfo?.allergies) ? patientData.medicalInfo.allergies.join(', ') : null,
            medications: Array.isArray(patientData.medicalInfo?.medications) ? patientData.medicalInfo.medications.join(', ') : null,
            conditions: Array.isArray(patientData.medicalInfo?.conditions) ? patientData.medicalInfo.conditions.join(', ') : null,
            bloodType: patientData.medicalInfo?.bloodType,
            medicalNotes: patientData.medicalInfo?.notes,
            consentDataProcessing: patientData.consents?.dataProcessing ?? true,
            consentDataProcessingDate: patientData.consents?.dataProcessing ? new Date() : null,
            consentMedicalTreatment: patientData.consents?.medicalTreatment ?? true,
            consentMedicalTreatmentDate: patientData.consents?.medicalTreatment ? new Date() : null,
            consentImageUse: patientData.consents?.imageUse ?? false,
            consentImageUseDate: patientData.consents?.imageUse ? new Date() : null,
            isActive: true, // Reativar o paciente quando for atualizado
            updatedAt: new Date()
          }
        })
        
        return {
          success: true,
          patient: {
            id: updatedPatient.id,
            communicationContactId: updatedPatient.communicationContactId,
            fullName: updatedPatient.fullName,
            cpf: updatedPatient.cpf,
            rg: updatedPatient.rg || undefined,
            birthDate: updatedPatient.birthDate,
            gender: updatedPatient.gender as 'M' | 'F' | 'Other' | undefined,
            maritalStatus: updatedPatient.maritalStatus || undefined,
            profession: updatedPatient.profession || undefined,
            emergencyContact: updatedPatient.emergencyContact,
            emergencyPhone: updatedPatient.emergencyPhone,
            insuranceType: updatedPatient.insuranceType,
            insurancePlan: updatedPatient.insurancePlan,
            insuranceCardNumber: updatedPatient.insuranceCardNumber,
            insuranceValidUntil: updatedPatient.insuranceValidUntil?.toISOString(),
            allergies: updatedPatient.allergies,
            medications: updatedPatient.medications,
            conditions: updatedPatient.conditions,
            bloodType: updatedPatient.bloodType,
            medicalNotes: updatedPatient.medicalNotes,
            consentDataProcessing: updatedPatient.consentDataProcessing,
            consentDataProcessingDate: updatedPatient.consentDataProcessingDate?.toISOString(),
            consentMedicalTreatment: updatedPatient.consentMedicalTreatment,
            consentMedicalTreatmentDate: updatedPatient.consentMedicalTreatmentDate?.toISOString(),
            consentImageUse: updatedPatient.consentImageUse,
            consentImageUseDate: updatedPatient.consentImageUseDate?.toISOString(),
            createdAt: updatedPatient.createdAt.toISOString(),
            updatedAt: updatedPatient.updatedAt.toISOString(),
            recordNumber: updatedPatient.recordNumber
          },
          message: 'Paciente atualizado com sucesso'
        }
      }
    }
    
    // Create new patient
    // First, create or find communication contact
    let communicationContactId = patientData.communicationContactId
    
    if (!communicationContactId) {
      // Create communication contact
      const communicationContact = await prisma.communicationContact.create({
        data: {
          name: patientData.fullName || patientData.name,
          email: patientData.email,
          whatsapp: patientData.phone || patientData.whatsapp,
          birthDate: patientData.birthDate,
          // Individual boolean fields for email preferences
          emailNewsletter: false,
          emailAppointments: true,
          emailPromotions: false,
          // Individual boolean fields for WhatsApp preferences
          whatsappAppointments: true,
          whatsappReminders: true,
          whatsappPromotions: false
        }
      })
      
      // Create registration source entry
      await prisma.registrationSource.create({
        data: {
          contactId: communicationContact.id,
          source: 'DOCTOR_AREA'
        }
      })
      communicationContactId = communicationContact.id
    }
    
    // Get next record number
    const lastPatient = await prisma.medicalPatient.findFirst({
      orderBy: { medicalRecordNumber: 'desc' }
    })
    const nextRecordNumber = (lastPatient?.medicalRecordNumber || 0) + 1
    
    const newPatient = await prisma.medicalPatient.create({
      data: {
        communicationContactId,
        fullName: patientData.fullName || patientData.name,
        cpf: patientData.cpf,
        medicalRecordNumber: nextRecordNumber,
        rg: patientData.rg,
        address: patientData.address || patientData.endereco,
        city: patientData.city || patientData.cidade,
        state: patientData.state || patientData.estado,
        zipCode: patientData.zipCode || patientData.cep,
        insuranceType: patientData.insurance?.type?.toUpperCase() === 'UNIMED' ? 'UNIMED' : 
                      patientData.insurance?.type?.toUpperCase() === 'PARTICULAR' ? 'PARTICULAR' : 'OUTRO',
        insurancePlan: patientData.insurance?.plan,
        insuranceCardNumber: patientData.insurance?.cardNumber,
        insuranceValidUntil: patientData.insurance?.validUntil ? new Date(patientData.insurance.validUntil) : null,
        allergies: Array.isArray(patientData.medicalInfo?.allergies) ? patientData.medicalInfo.allergies.join(', ') : null,
        medications: Array.isArray(patientData.medicalInfo?.medications) ? patientData.medicalInfo.medications.join(', ') : null,
        conditions: Array.isArray(patientData.medicalInfo?.conditions) ? patientData.medicalInfo.conditions.join(', ') : null,
        emergencyContact: patientData.medicalInfo?.emergencyContact,
        emergencyPhone: patientData.medicalInfo?.emergencyPhone,
        bloodType: patientData.medicalInfo?.bloodType,
        medicalNotes: patientData.medicalInfo?.notes,
        consentDataProcessing: patientData.consents?.dataProcessing ?? true,
        consentDataProcessingDate: patientData.consents?.dataProcessing ? new Date() : null,
        consentMedicalTreatment: patientData.consents?.medicalTreatment ?? true,
        consentMedicalTreatmentDate: patientData.consents?.medicalTreatment ? new Date() : null,
        consentImageUse: patientData.consents?.imageUse ?? false,
        consentImageUseDate: patientData.consents?.imageUse ? new Date() : null,
        isActive: true
      }
    })
    
    // Buscar dados do contato de comunicação para incluir telefone e whatsapp corretos
    const communicationContact = await prisma.communicationContact.findUnique({
      where: { id: newPatient.communicationContactId }
    })
    
    return {
          success: true,
          patient: {
            id: newPatient.id,
            communicationContactId: newPatient.communicationContactId,
            fullName: newPatient.fullName,
            cpf: newPatient.cpf,
            rg: newPatient.rg || undefined,
            address: newPatient.address,
            city: newPatient.city,
            state: newPatient.state,
            zipCode: newPatient.zipCode,
            telefone: communicationContact?.phone || communicationContact?.whatsapp || '',
            whatsapp: communicationContact?.whatsapp || communicationContact?.phone || '',
            email: communicationContact?.email || patientData.email,
            birthDate: communicationContact?.birthDate || patientData.birthDate,
            insurance: {
              type: newPatient.insuranceType.toLowerCase(),
              plan: newPatient.insurancePlan,
              cardNumber: newPatient.insuranceCardNumber,
              validUntil: newPatient.insuranceValidUntil?.toISOString()
            },
            medicalInfo: {
              allergies: newPatient.allergies ? newPatient.allergies.split(', ') : [],
              medications: newPatient.medications ? newPatient.medications.split(', ') : [],
              conditions: newPatient.conditions ? newPatient.conditions.split(', ') : [],
              emergencyContact: newPatient.emergencyContact,
              emergencyPhone: newPatient.emergencyPhone,
              bloodType: newPatient.bloodType,
              notes: newPatient.medicalNotes
            },
            consents: {
              dataProcessing: newPatient.consentDataProcessing,
              dataProcessingDate: newPatient.consentDataProcessingDate?.toISOString(),
              medicalTreatment: newPatient.consentMedicalTreatment,
              medicalTreatmentDate: newPatient.consentMedicalTreatmentDate?.toISOString(),
              imageUse: newPatient.consentImageUse,
              imageUseDate: newPatient.consentImageUseDate?.toISOString()
            },
            insuranceType: newPatient.insuranceType,
            createdAt: newPatient.createdAt.toISOString(),
            updatedAt: newPatient.updatedAt.toISOString(),
            medicalRecordNumber: newPatient.medicalRecordNumber
          },
          message: 'Paciente criado com sucesso'
        }
  } catch (error) {
    console.error('❌ Erro ao criar/atualizar paciente:', error)
    console.error('❌ Stack trace:', error.stack)
    return {
      success: false,
      message: `Erro ao criar/atualizar paciente: ${error.message}`
    }
  }
}

export async function createAppointment(appointmentData: any): Promise<{ success: boolean; appointment?: UnifiedAppointment; message: string }> {
  try {
    // Map appointment type to Prisma enum
    const mapAppointmentTypeToPrisma = (type: string): AppointmentType => {
      switch (type.toLowerCase()) {
        case 'consultation': case 'consulta': return 'CONSULTATION'
        case 'return': case 'retorno': return 'RETURN'
        case 'exam': case 'exame': return 'EXAM'
        case 'procedure': case 'procedimento': return 'PROCEDURE'
        case 'surgery': case 'cirurgia': return 'SURGERY'
        case 'emergency': case 'emergencia': return 'EMERGENCY'
        default: return 'CONSULTATION'
      }
    }
    
    // Map appointment status to Prisma enum
    const mapAppointmentStatusToPrisma = (status: string): AppointmentStatus => {
      switch (status.toLowerCase()) {
        case 'scheduled': case 'agendada': return 'SCHEDULED'
        case 'confirmed': case 'confirmada': return 'CONFIRMED'
        case 'in_progress': case 'em_andamento': return 'IN_PROGRESS'
        case 'completed': case 'concluida': return 'COMPLETED'
        case 'cancelled': case 'cancelada': return 'CANCELLED'
        case 'no_show': case 'nao_compareceu': return 'NO_SHOW'
        default: return 'SCHEDULED'
      }
    }
    
    // Map appointment source to Prisma enum
    const mapAppointmentSourceToPrisma = (source: string): AppointmentSource => {
      switch (source.toLowerCase()) {
        case 'phone': case 'telefone': return 'PHONE'
        case 'whatsapp': return 'WHATSAPP'
        case 'website': case 'site': case 'public_appointment': return 'ONLINE'
        case 'manual': return 'MANUAL'
        default: return 'ONLINE'
      }
    }
    
    // Map insurance type to valid enum value
    const mapInsuranceType = (type: string): InsuranceType => {
      switch (type?.toLowerCase()) {
        case 'particular': return 'PARTICULAR'
        case 'unimed': return 'UNIMED'
        default: return 'OUTRO'
      }
    }
    
    const newAppointment = await prisma.appointment.create({
      data: {
        communicationContactId: appointmentData.communicationContactId,
        medicalPatientId: appointmentData.medicalPatientId,
        appointmentDate: appointmentData.appointmentDate || appointmentData.date,
        appointmentTime: appointmentData.appointmentTime || appointmentData.time,
        duration: appointmentData.duration || 30,
        type: mapAppointmentTypeToPrisma(appointmentData.type || 'consultation'),
        status: mapAppointmentStatusToPrisma(appointmentData.status || 'scheduled'),
        specialty: appointmentData.specialty || 'Coloproctologia',
        doctorName: appointmentData.doctorName || 'Dr. João Vitor Viana',
        reason: appointmentData.reason,
        observations: appointmentData.observations || appointmentData.notes,
        insuranceType: mapInsuranceType(appointmentData.insuranceType),
        source: mapAppointmentSourceToPrisma(appointmentData.source || 'website'),
        reminderSent: appointmentData.reminderSent || false,
        confirmationSent: appointmentData.confirmationSent || false
      }
    })

    // Enviar notificação Telegram
    try {
      const notificationData: AppointmentNotificationData = {
        patientName: appointmentData.fullName || appointmentData.name || 'Paciente',
        patientEmail: appointmentData.email,
        patientPhone: appointmentData.phone || appointmentData.whatsapp,
        patientWhatsapp: appointmentData.whatsapp || appointmentData.phone,
        appointmentDate: appointmentData.appointmentDate || appointmentData.date,
        appointmentTime: appointmentData.appointmentTime || appointmentData.time,
        insuranceType: (appointmentData.insuranceType || 'particular') as 'unimed' | 'particular' | 'outro',
        appointmentType: appointmentData.type || 'consultation',
        source: appointmentData.source || 'website',
      }

      await sendTelegramAppointmentNotification(notificationData)
      console.log('✅ [createAppointment] Notificação Telegram enviada')
    } catch (notifError) {
      console.error('⚠️ [createAppointment] Erro ao enviar notificação Telegram:', notifError)
      // Não bloqueia criação do agendamento
    }

    return {
      success: true,
      appointment: {
        id: newAppointment.id,
        communicationContactId: newAppointment.communicationContactId,
        medicalPatientId: newAppointment.medicalPatientId || undefined,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        duration: newAppointment.duration || undefined,
        type: mapAppointmentTypeFromPrisma(newAppointment.type),
        status: mapAppointmentStatusFromPrisma(newAppointment.status),
        specialty: newAppointment.specialty || undefined,
        doctorName: newAppointment.doctorName || undefined,
        reason: newAppointment.reason || undefined,
        observations: newAppointment.observations || undefined,
        insuranceType: newAppointment.insuranceType as 'unimed' | 'particular' | 'outro' | undefined,
        source: mapAppointmentSourceFromPrisma(newAppointment.source),
        reminderSent: newAppointment.reminderSent || undefined,
        confirmationSent: newAppointment.confirmationSent || undefined,
        createdAt: newAppointment.createdAt.toISOString(),
        updatedAt: newAppointment.updatedAt.toISOString()
      },
      message: 'Agendamento criado com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error)
    console.error('❌ Stack trace:', error.stack)
    return {
      success: false,
      message: `Erro ao criar agendamento: ${error.message}`
    }
  }
}

export async function updateAppointment(id: string, updates: any): Promise<{ success: boolean; appointment?: UnifiedAppointment; message: string }> {
  try {
    // Map appointment type to Prisma enum
    const mapAppointmentTypeToPrisma = (type: string): AppointmentType => {
      switch (type.toLowerCase()) {
        case 'consultation': case 'consulta': return 'CONSULTATION'
        case 'return': case 'retorno': return 'RETURN'
        case 'exam': case 'exame': return 'EXAM'
        case 'procedure': case 'procedimento': return 'PROCEDURE'
        case 'surgery': case 'cirurgia': return 'SURGERY'
        case 'emergency': case 'emergencia': return 'EMERGENCY'
        default: return 'CONSULTATION'
      }
    }
    
    // Map appointment status to Prisma enum
    const mapAppointmentStatusToPrisma = (status: string): AppointmentStatus => {
      switch (status.toLowerCase()) {
        case 'scheduled': case 'agendada': return 'SCHEDULED'
        case 'confirmed': case 'confirmada': return 'CONFIRMED'
        case 'in_progress': case 'em_andamento': return 'IN_PROGRESS'
        case 'completed': case 'concluida': return 'COMPLETED'
        case 'cancelled': case 'cancelada': return 'CANCELLED'
        case 'no_show': case 'nao_compareceu': return 'NO_SHOW'
        default: return 'SCHEDULED'
      }
    }
    
    // Map appointment source to Prisma enum
    const mapAppointmentSourceToPrisma = (source: string): AppointmentSource => {
      switch (source.toLowerCase()) {
        case 'phone': case 'telefone': return 'PHONE'
        case 'whatsapp': return 'WHATSAPP'
        case 'website': case 'site': case 'public_appointment': return 'ONLINE'
        case 'manual': return 'MANUAL'
        default: return 'ONLINE'
      }
    }
    
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (updates.appointmentDate || updates.date) {
      updateData.appointmentDate = updates.appointmentDate || updates.date
    }
    if (updates.appointmentTime || updates.time) {
      updateData.appointmentTime = updates.appointmentTime || updates.time
    }
    if (updates.duration) {
      updateData.duration = updates.duration
    }
    if (updates.type) {
      updateData.type = mapAppointmentTypeToPrisma(updates.type)
    }
    if (updates.status) {
      updateData.status = mapAppointmentStatusToPrisma(updates.status)
    }
    if (updates.specialty) {
      updateData.specialty = updates.specialty
    }
    if (updates.doctorName) {
      updateData.doctorName = updates.doctorName
    }
    if (updates.reason) {
      updateData.reason = updates.reason
    }
    if (updates.observations || updates.notes) {
      updateData.observations = updates.observations || updates.notes
    }
    if (updates.insuranceType) {
      updateData.insuranceType = updates.insuranceType
    }
    if (updates.source) {
      updateData.source = mapAppointmentSourceToPrisma(updates.source)
    }
    if (updates.reminderSent !== undefined) {
      updateData.reminderSent = updates.reminderSent
    }
    if (updates.confirmationSent !== undefined) {
      updateData.confirmationSent = updates.confirmationSent
    }
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData
    })
    
    return {
      success: true,
      appointment: {
        id: updatedAppointment.id,
        communicationContactId: updatedAppointment.communicationContactId,
        medicalPatientId: updatedAppointment.medicalPatientId || undefined,
        appointmentDate: updatedAppointment.appointmentDate,
        appointmentTime: updatedAppointment.appointmentTime,
        duration: updatedAppointment.duration || undefined,
        type: mapAppointmentTypeFromPrisma(updatedAppointment.type),
        status: mapAppointmentStatusFromPrisma(updatedAppointment.status),
        specialty: updatedAppointment.specialty || undefined,
        doctorName: updatedAppointment.doctorName || undefined,
        reason: updatedAppointment.reason || undefined,
        observations: updatedAppointment.observations || undefined,
        insuranceType: updatedAppointment.insuranceType as 'unimed' | 'particular' | 'outro' | undefined,
        source: mapAppointmentSourceFromPrisma(updatedAppointment.source),
        reminderSent: updatedAppointment.reminderSent || undefined,
        confirmationSent: updatedAppointment.confirmationSent || undefined,
        createdAt: updatedAppointment.createdAt.toISOString(),
        updatedAt: updatedAppointment.updatedAt.toISOString()
      },
      message: 'Agendamento atualizado com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error)
    return {
      success: false,
      message: 'Erro ao atualizar agendamento'
    }
  }
}

export async function deleteAppointment(appointmentId: string): Promise<{ success: boolean; message: string }> {
  try {
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    })

    if (!existingAppointment) {
      return {
        success: false,
        message: 'Agendamento não encontrado'
      }
    }

    await prisma.appointment.delete({
      where: { id: appointmentId }
    })

    console.log(`🗑️ Agendamento ${appointmentId} foi excluído com sucesso`)
    
    return {
      success: true,
      message: 'Agendamento excluído com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao deletar agendamento:', error)
    return {
      success: false,
      message: 'Erro ao excluir agendamento'
    }
  }
}

// Generate ID function
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}export async function getAllMedicalRecords(): Promise<MedicalRecord[]> {
  try {
    const records = await prisma.medicalRecord.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return records.map(record => ({
      id: record.id,
      patientId: record.medicalPatientId || '',
      date: record.createdAt.toISOString().split('T')[0],
      type: record.category || 'consultation',
      description: record.content,
      diagnosis: record.summary || undefined,
      treatment: undefined,
      medications: [],
      notes: record.content,
      doctorName: undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('❌ Erro ao buscar todos os prontuários:', error)
    return []
  }
}

export async function getMedicalPatientByCpf(cpf: string): Promise<MedicalPatient | null> {
  try {
    const patient = await prisma.medicalPatient.findUnique({
      where: { cpf }
    })
    
    if (!patient) return null
    
    return {
      id: patient.id,
      communicationContactId: patient.communicationContactId,
      fullName: patient.fullName,
      cpf: patient.cpf,
      rg: patient.rg || undefined,
      birthDate: patient.birthDate,
      gender: patient.gender as 'M' | 'F' | 'Other' | undefined,
      maritalStatus: patient.maritalStatus || undefined,
      profession: patient.profession || undefined,
      emergencyContact: patient.emergencyContact as any,
      insurance: patient.insurance as any,
      medicalInfo: patient.medicalInfo as any,
      consents: patient.consents as any,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
      recordNumber: patient.recordNumber
    }
  } catch (error) {
    console.error('❌ Erro ao buscar paciente por CPF:', error)
    return null
  }
}

export async function createMedicalPatient(patientData: any): Promise<{ success: boolean; patient?: MedicalPatient; message: string }> {
  return createOrUpdatePatient(patientData)
}

export function validateDataIntegrity(): any {
  console.log('⚠️ validateDataIntegrity não implementado ainda')
  return { valid: true, errors: [] }
}

// ============================================================================
// APPOINTMENT VALIDATION
// ============================================================================

export async function canPatientScheduleNewAppointment(patientCpf: string): Promise<{ canSchedule: boolean; reason?: string }> {
  try {
    console.log('🔍 Verificando se paciente pode agendar nova consulta:', patientCpf)
    
    // Buscar paciente médico pelo CPF
    const medicalPatient = await getMedicalPatientByCpf(patientCpf)
    if (!medicalPatient) {
      console.log('✅ Paciente não encontrado no sistema médico - pode agendar')
      return { canSchedule: true }
    }

    // Buscar consultas ativas do paciente
    const activeAppointments = await prisma.appointment.findMany({
      where: {
        medicalPatientId: medicalPatient.id,
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS']
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    })

    if (activeAppointments.length > 0) {
      const activeAppointment = activeAppointments[0]
      console.log('❌ Paciente possui consulta ativa:', activeAppointment.id)
      return {
        canSchedule: false,
        reason: 'Você já possui uma consulta agendada. Uma nova consulta só pode ser marcada após a consulta anterior ser concluída pelo médico.'
      }
    }

    console.log('✅ Paciente pode agendar nova consulta')
    return { canSchedule: true }
    
  } catch (error) {
    console.error('❌ Erro ao verificar se paciente pode agendar:', error)
    return {
      canSchedule: false,
      reason: 'Erro interno do sistema. Tente novamente.'
    }
  }
}