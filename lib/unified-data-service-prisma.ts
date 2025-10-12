// Serviço Unificado de Dados - Versão Prisma
// Substitui as funções JSON por operações Prisma

import { prisma } from './prisma-service'
import { 
  getAllCommunicationContacts, 
  getAllMedicalPatients,
  createOrUpdateCommunicationContact,
  createMedicalPatient,
  getCommunicationContactById,
  getMedicalPatientById,
  type CommunicationContact,
  type MedicalPatient
} from './unified-patient-system-prisma'

// Interfaces unificadas (mantidas para compatibilidade)
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
    newsletter?: boolean
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

// ==================== FUNÇÕES PARA PACIENTES ====================

export async function getAllPatients(): Promise<UnifiedPatient[]> {
  try {
    const contacts = await getAllCommunicationContacts()
    const medicalPatients = await getAllMedicalPatients()
    
    const unifiedPatients: UnifiedPatient[] = []
    
    // Adiciona pacientes médicos (que têm CPF)
    for (const medPatient of medicalPatients) {
      const contact = await getCommunicationContactById(medPatient.communicationContactId)
      if (contact) {
        unifiedPatients.push({
          id: medPatient.id,
          name: medPatient.fullName,
          cpf: medPatient.cpf,
          medicalRecordNumber: medPatient.medicalRecordNumber,
          phone: contact.whatsapp || '',
          whatsapp: contact.whatsapp || '',
          email: contact.email,
          birthDate: contact.birthDate,
          insurance: {
            type: (medPatient.insuranceType?.toLowerCase() || 'particular') as 'unimed' | 'particular' | 'outro',
            plan: medPatient.insurancePlan || undefined
          },
          registrationSources: contact.registrationSources,
          emailPreferences: {
            healthTips: contact.emailPreferences.healthTips,
            appointments: contact.emailPreferences.appointments,
            promotions: contact.emailPreferences.promotions,
            subscribed: contact.emailPreferences.subscribed,
            subscribedAt: contact.emailPreferences.subscribedAt,
            newsletter: contact.emailPreferences.newsletter
          },
          birthdayEmailLogs: [],
          createdAt: medPatient.createdAt,
          updatedAt: medPatient.updatedAt
        })
      }
    }
    
    // Adiciona contatos de comunicação que não são pacientes médicos
    for (const contact of contacts) {
      const isAlreadyMedicalPatient = medicalPatients.some(mp => mp.communicationContactId === contact.id)
      if (!isAlreadyMedicalPatient) {
        unifiedPatients.push({
          id: contact.id,
          name: contact.name,
          cpf: undefined,
          medicalRecordNumber: undefined,
          phone: contact.whatsapp || '',
          whatsapp: contact.whatsapp || '',
          email: contact.email,
          birthDate: contact.birthDate,
          insurance: {
            type: 'particular',
            plan: undefined
          },
          registrationSources: contact.registrationSources,
          emailPreferences: {
            healthTips: contact.emailPreferences.healthTips,
            appointments: contact.emailPreferences.appointments,
            promotions: contact.emailPreferences.promotions,
            subscribed: contact.emailPreferences.subscribed,
            subscribedAt: contact.emailPreferences.subscribedAt,
            newsletter: contact.emailPreferences.newsletter
          },
          birthdayEmailLogs: [],
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt
        })
      }
    }
    
    return unifiedPatients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    return []
  }
}

export async function getPatientById(id: string): Promise<UnifiedPatient | null> {
  try {
    // Primeiro tenta buscar como paciente médico
    const medicalPatient = await getMedicalPatientById(id)
    if (medicalPatient) {
      const contact = await getCommunicationContactById(medicalPatient.communicationContactId)
      if (contact) {
        return {
          id: medicalPatient.id,
          name: medicalPatient.fullName,
          cpf: medicalPatient.cpf,
          medicalRecordNumber: medicalPatient.medicalRecordNumber,
          phone: contact.whatsapp || '',
          whatsapp: contact.whatsapp || '',
          email: contact.email,
          birthDate: contact.birthDate,
          insurance: {
            type: medicalPatient.insurance.type as 'unimed' | 'particular' | 'outro',
            plan: medicalPatient.insurance.plan
          },
          registrationSources: contact.registrationSources,
          emailPreferences: {
            healthTips: contact.emailPreferences.healthTips,
            appointments: contact.emailPreferences.appointments,
            promotions: contact.emailPreferences.promotions,
            subscribed: contact.emailPreferences.subscribed,
            subscribedAt: contact.emailPreferences.subscribedAt,
            newsletter: contact.emailPreferences.newsletter
          },
          birthdayEmailLogs: [],
          createdAt: medicalPatient.createdAt,
          updatedAt: medicalPatient.updatedAt
        }
      }
    }
    
    // Se não encontrou como paciente médico, busca como contato de comunicação
    const contact = await getCommunicationContactById(id)
    if (contact) {
      return {
        id: contact.id,
        name: contact.name,
        cpf: undefined,
        medicalRecordNumber: undefined,
        phone: contact.whatsapp || '',
        whatsapp: contact.whatsapp || '',
        email: contact.email,
        birthDate: contact.birthDate,
        insurance: {
          type: 'particular',
          plan: undefined
        },
        registrationSources: contact.registrationSources,
        emailPreferences: {
          healthTips: contact.emailPreferences.healthTips,
          appointments: contact.emailPreferences.appointments,
          promotions: contact.emailPreferences.promotions,
          subscribed: contact.emailPreferences.subscribed,
          subscribedAt: contact.emailPreferences.subscribedAt,
          newsletter: contact.emailPreferences.newsletter
        },
        birthdayEmailLogs: [],
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    }
    
    return null
  } catch (error) {
    console.error('Erro ao buscar paciente por ID:', error)
    return null
  }
}

export async function createOrUpdatePatient(patientData: Partial<UnifiedPatient> & { 
  name: string
  phone: string
  whatsapp: string
}): Promise<UnifiedPatient> {
  try {
    // Criar ou atualizar contato de comunicação
    const contactData = {
      name: patientData.name,
      whatsapp: patientData.whatsapp,
      email: patientData.email,
      birthDate: patientData.birthDate,
      registrationSources: patientData.registrationSources || ['unknown'],
      emailPreferences: patientData.emailPreferences || {
        healthTips: true,
        appointments: true,
        promotions: false,
        subscribed: !!patientData.email,
        subscribedAt: patientData.email ? new Date().toISOString() : undefined,
        newsletter: false
      }
    }
    
    const contact = await createOrUpdateCommunicationContact(contactData)
    
    // Se tem CPF, criar ou atualizar paciente médico
    if (patientData.cpf) {
      const medicalPatientData = {
        fullName: patientData.name,
        cpf: patientData.cpf,
        communicationContactId: contact.id,
        medicalRecordNumber: patientData.medicalRecordNumber,
        insurance: patientData.insurance || { type: 'particular' }
      }
      
      const medicalPatient = await createMedicalPatient(medicalPatientData)
      
      return {
        id: medicalPatient.id,
        name: medicalPatient.fullName,
        cpf: medicalPatient.cpf,
        medicalRecordNumber: medicalPatient.medicalRecordNumber,
        phone: contact.whatsapp || '',
        whatsapp: contact.whatsapp || '',
        email: contact.email,
        birthDate: contact.birthDate,
        insurance: {
          type: medicalPatient.insurance.type as 'unimed' | 'particular' | 'outro',
          plan: medicalPatient.insurance.plan
        },
        registrationSources: contact.registrationSources,
        emailPreferences: {
          healthTips: contact.emailPreferences.healthTips,
          appointments: contact.emailPreferences.appointments,
          promotions: contact.emailPreferences.promotions,
          subscribed: contact.emailPreferences.subscribed,
          subscribedAt: contact.emailPreferences.subscribedAt,
          newsletter: contact.emailPreferences.newsletter
        },
        birthdayEmailLogs: [],
        createdAt: medicalPatient.createdAt,
        updatedAt: medicalPatient.updatedAt
      }
    }
    
    // Retornar apenas como contato de comunicação
    return {
      id: contact.id,
      name: contact.name,
      cpf: undefined,
      medicalRecordNumber: undefined,
      phone: contact.whatsapp || '',
      whatsapp: contact.whatsapp || '',
      email: contact.email,
      birthDate: contact.birthDate,
      insurance: {
        type: 'particular',
        plan: undefined
      },
      registrationSources: contact.registrationSources,
      emailPreferences: {
        healthTips: contact.emailPreferences.healthTips,
        appointments: contact.emailPreferences.appointments,
        promotions: contact.emailPreferences.promotions,
        subscribed: contact.emailPreferences.subscribed,
        subscribedAt: contact.emailPreferences.subscribedAt,
        newsletter: contact.emailPreferences.newsletter
      },
      birthdayEmailLogs: [],
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar paciente:', error)
    throw error
  }
}

// ==================== FUNÇÕES PARA AGENDAMENTOS ====================

export async function getAllAppointments(): Promise<UnifiedAppointment[]> {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        medicalPatient: {
          include: {
            communicationContact: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return appointments.map(appointment => ({
      id: appointment.id,
      patientId: appointment.medicalPatientId,
      patientName: appointment.patientName,
      patientCpf: appointment.patientCpf,
      patientMedicalRecordNumber: appointment.patientMedicalRecordNumber,
      patientPhone: appointment.medicalPatient?.communicationContact?.whatsapp || '',
      patientWhatsapp: appointment.medicalPatient?.communicationContact?.whatsapp || '',
      patientEmail: appointment.medicalPatient?.communicationContact?.email,
      patientBirthDate: appointment.medicalPatient?.communicationContact?.birthDate,
      insuranceType: appointment.medicalPatient?.insurance?.type as 'unimed' | 'particular' | 'outro' || 'particular',
      insurancePlan: appointment.medicalPatient?.insurance?.plan,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      appointmentType: mapAppointmentTypeFromPrisma(appointment.type),
      status: mapAppointmentStatusFromPrisma(appointment.status),
      source: mapAppointmentSourceFromPrisma(appointment.source),
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      createdBy: appointment.createdBy
    }))
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return []
  }
}

export async function getAppointmentById(id: string): Promise<UnifiedAppointment | null> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        medicalPatient: {
          include: {
            communicationContact: true
          }
        }
      }
    })
    
    if (!appointment) return null
    
    return {
      id: appointment.id,
      patientId: appointment.medicalPatientId,
      patientName: appointment.patientName,
      patientCpf: appointment.patientCpf,
      patientMedicalRecordNumber: appointment.patientMedicalRecordNumber,
      patientPhone: appointment.medicalPatient?.communicationContact?.whatsapp || '',
      patientWhatsapp: appointment.medicalPatient?.communicationContact?.whatsapp || '',
      patientEmail: appointment.medicalPatient?.communicationContact?.email,
      patientBirthDate: appointment.medicalPatient?.communicationContact?.birthDate,
      insuranceType: appointment.medicalPatient?.insurance?.type as 'unimed' | 'particular' | 'outro' || 'particular',
      insurancePlan: appointment.medicalPatient?.insurance?.plan,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      appointmentType: mapAppointmentTypeFromPrisma(appointment.type),
      status: mapAppointmentStatusFromPrisma(appointment.status),
      source: mapAppointmentSourceFromPrisma(appointment.source),
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      createdBy: appointment.createdBy
    }
  } catch (error) {
    console.error('Erro ao buscar agendamento por ID:', error)
    return null
  }
}

// ==================== FUNÇÕES DE MAPEAMENTO ====================

function mapAppointmentTypeFromPrisma(type: string): 'consulta' | 'retorno' | 'urgencia' | 'teleconsulta' | 'visita_domiciliar' {
  switch (type) {
    case 'CONSULTATION': return 'consulta'
    case 'FOLLOW_UP': return 'retorno'
    case 'EMERGENCY': return 'urgencia'
    case 'TELEMEDICINE': return 'teleconsulta'
    case 'PROCEDURE': return 'consulta'
    default: return 'consulta'
  }
}

function mapAppointmentTypeToPrisma(type: 'consulta' | 'retorno' | 'urgencia' | 'teleconsulta' | 'visita_domiciliar'): string {
  switch (type) {
    case 'consulta': return 'CONSULTATION'
    case 'retorno': return 'FOLLOW_UP'
    case 'urgencia': return 'EMERGENCY'
    case 'teleconsulta': return 'TELEMEDICINE'
    case 'visita_domiciliar': return 'PROCEDURE'
    default: return 'CONSULTATION'
  }
}

function mapAppointmentStatusFromPrisma(status: string): 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'reagendada' {
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

function mapAppointmentStatusToPrisma(status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'reagendada'): string {
  switch (status) {
    case 'agendada': return 'SCHEDULED'
    case 'confirmada': return 'CONFIRMED'
    case 'em_andamento': return 'IN_PROGRESS'
    case 'concluida': return 'COMPLETED'
    case 'cancelada': return 'CANCELLED'
    case 'reagendada': return 'SCHEDULED'
    default: return 'SCHEDULED'
  }
}

function mapAppointmentSourceFromPrisma(source: string): 'public_appointment' | 'doctor_area' | 'secretary_area' {
  switch (source) {
    case 'MANUAL': return 'secretary_area'
    case 'ONLINE': return 'public_appointment'
    case 'PHONE': return 'secretary_area'
    case 'WHATSAPP': return 'secretary_area'
    case 'SYSTEM': return 'doctor_area'
    default: return 'public_appointment'
  }
}

function mapAppointmentSourceToPrisma(source: 'public_appointment' | 'doctor_area' | 'secretary_area'): string {
  switch (source) {
    case 'public_appointment': return 'ONLINE'
    case 'doctor_area': return 'SYSTEM'
    case 'secretary_area': return 'MANUAL'
    default: return 'ONLINE'
  }
}

// ==================== FUNÇÕES DE MIGRAÇÃO E LIMPEZA ====================

export async function migrateOldData(): Promise<void> {
  console.log('🔄 Migração já foi realizada para PostgreSQL. Dados estão no banco de dados.')
}

export async function cleanupOldFiles(): Promise<void> {
  console.log('🧹 Arquivos JSON antigos podem ser movidos para backup após confirmação.')
}

// Newsletter data management functions (mantidas para compatibilidade)
export async function readNewslettersData(): Promise<any[]> {
  try {
    const contacts = await getAllCommunicationContacts()
    return contacts.filter(contact => contact.emailPreferences.newsletter)
  } catch (error) {
    console.error('Erro ao ler dados de newsletter:', error)
    return []
  }
}

export async function saveNewslettersData(newsletters: any[]): Promise<void> {
  console.log('Newsletter data is now managed through CommunicationContact records')
}