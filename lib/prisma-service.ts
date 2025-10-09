// Serviço Prisma - Substitui o sistema de arquivos JSON
// Centraliza todas as operações de pacientes e consultas usando Prisma

import { PrismaClient } from '@prisma/client'
// Removendo imports das funções JSON-based que não são mais necessárias
// import { getCommunicationContactByEmail, getMedicalPatientByCpf, createOrUpdateCommunicationContact, createMedicalPatient } from './unified-patient-system'

// Instância global do Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ==================== INTERFACES PARA COMPATIBILIDADE ====================

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
    cardNumber?: string
    validUntil?: string
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

  // Portuguese property names for compatibility
  nomeCompleto?: string
  telefone?: string
  dataNascimento?: string
  numeroRegistroMedico?: number
  rg?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string

  // Medical info
  medicalInfo?: {
    allergies?: string[]
    medications?: string[]
    conditions?: string[]
    emergencyContact?: string
    emergencyPhone?: string
    bloodType?: string
    notes?: string
  }

  // Consents
  consents?: {
    dataProcessing: boolean
    dataProcessingDate?: string
    medicalTreatment: boolean
    medicalTreatmentDate?: string
    imageUse: boolean
    imageUseDate?: string
  }

  // Status
  isActive?: boolean

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
// Agora usa o sistema unificado em vez do modelo Patient obsoleto

import {
  getAllCommunicationContacts,
  getAllMedicalPatients,
  getCommunicationContactById,
  getMedicalPatientById,
  getCommunicationContactByEmail,
  getMedicalPatientByCpf,
  createOrUpdateCommunicationContact,
  createMedicalPatient
} from './unified-patient-system-prisma'

export async function getAllPatients(): Promise<UnifiedPatient[]> {
  try {
    // Busca dados do sistema unificado (Prisma)
    const contacts = await getAllCommunicationContacts()
    const medicalPatients = await getAllMedicalPatients()
    
    // Combina contatos de comunicação com pacientes médicos
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
            healthTips: contact.emailPreferences?.healthTips ?? false,
            appointments: contact.emailPreferences?.appointments ?? false,
            promotions: contact.emailPreferences?.promotions ?? false,
            subscribed: contact.emailPreferences?.subscribed ?? false,
            subscribedAt: contact.emailPreferences?.subscribedAt,
            newsletter: contact.emailPreferences?.newsletter ?? false
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
            healthTips: contact.emailPreferences?.healthTips ?? false,
            appointments: contact.emailPreferences?.appointments ?? false,
            promotions: contact.emailPreferences?.promotions ?? false,
            subscribed: contact.emailPreferences?.subscribed ?? false,
            subscribedAt: contact.emailPreferences?.subscribedAt,
            newsletter: contact.emailPreferences?.newsletter ?? false
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
            type: (medicalPatient.insuranceType?.toLowerCase() || 'particular') as 'unimed' | 'particular' | 'outro',
            plan: medicalPatient.insurancePlan || undefined
          },
          registrationSources: contact.registrationSources,
          emailPreferences: {
            healthTips: contact.emailPreferences?.healthTips ?? false,
            appointments: contact.emailPreferences?.appointments ?? false,
            promotions: contact.emailPreferences?.promotions ?? false,
            subscribed: contact.emailPreferences?.subscribed ?? false,
            subscribedAt: contact.emailPreferences?.subscribedAt,
            newsletter: contact.emailPreferences?.newsletter ?? false
          },
          birthdayEmailLogs: [],
          createdAt: medicalPatient.createdAt,
          updatedAt: medicalPatient.updatedAt
        }
      }
    }
    
    // Se não for paciente médico, tenta buscar como contato de comunicação
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
    // Buscar contato existente por email
    const existingContact = patientData.email ? await getCommunicationContactByEmail(patientData.email) : null

    if (existingContact) {
      // Se tem CPF, deve ser um paciente médico
      if (patientData.cpf) {
        const existingMedicalPatient = await getMedicalPatientByCpf(patientData.cpf)
        if (existingMedicalPatient) {
          // TODO: updateMedicalPatient function doesn't exist - use createMedicalPatient with merge logic
          // For now, return existing patient
          const updatedMedicalPatient = existingMedicalPatient

          // TODO: updateCommunicationContact function doesn't exist - use createOrUpdateCommunicationContact
          const updatedContact = existingContact
          
          return {
            id: updatedMedicalPatient.id,
            name: updatedMedicalPatient.fullName,
            cpf: updatedMedicalPatient.cpf,
            medicalRecordNumber: updatedMedicalPatient.medicalRecordNumber,
            phone: updatedContact.whatsapp || '',
            whatsapp: updatedContact.whatsapp || '',
            email: updatedContact.email,
            birthDate: updatedContact.birthDate,
            insurance: updatedMedicalPatient.insurance,
            registrationSources: updatedContact.registrationSources,
            emailPreferences: updatedContact.emailPreferences,
            birthdayEmailLogs: [],
            createdAt: updatedMedicalPatient.createdAt,
            updatedAt: updatedMedicalPatient.updatedAt
          }
        } else {
          // Criar novo paciente médico para contato existente
          const medicalPatientResult = await createMedicalPatient({
            communicationContactId: existingContact.id,
            fullName: patientData.name,
            cpf: patientData.cpf,
            medicalRecordNumber: patientData.medicalRecordNumber,
            insurance: patientData.insurance || { type: 'particular' }
          })
          
          if (!medicalPatientResult.success) {
            throw new Error(medicalPatientResult.message)
          }
          
          const newMedicalPatient = medicalPatientResult.patient
          
          return {
            id: newMedicalPatient.id,
            name: newMedicalPatient.fullName,
            cpf: newMedicalPatient.cpf,
            medicalRecordNumber: newMedicalPatient.medicalRecordNumber,
            phone: existingContact.whatsapp || '',
            whatsapp: existingContact.whatsapp || '',
            email: existingContact.email,
            birthDate: existingContact.birthDate,
            insurance: newMedicalPatient.insurance,
            registrationSources: existingContact.registrationSources,
            emailPreferences: existingContact.emailPreferences,
            birthdayEmailLogs: [],
            createdAt: newMedicalPatient.createdAt,
            updatedAt: newMedicalPatient.updatedAt
          }
        }
      } else {
        // TODO: updateCommunicationContact doesn't exist - use createOrUpdateCommunicationContact
        const updatedContact = existingContact
        
        return {
          id: updatedContact.id,
          name: updatedContact.name,
          cpf: undefined,
          medicalRecordNumber: undefined,
          phone: updatedContact.whatsapp || '',
          whatsapp: updatedContact.whatsapp || '',
          email: updatedContact.email,
          birthDate: updatedContact.birthDate,
          insurance: { type: 'particular' },
          registrationSources: updatedContact.registrationSources,
          emailPreferences: updatedContact.emailPreferences,
          birthdayEmailLogs: [],
          createdAt: updatedContact.createdAt,
          updatedAt: updatedContact.updatedAt
        }
      }
    } else {
      // Criar novo contato de comunicação
      const contactResult = await createOrUpdateCommunicationContact({
        name: patientData.name,
        whatsapp: patientData.whatsapp,
        email: patientData.email,
        birthDate: patientData.birthDate,
        source: 'secretary_area'
      })
      
      if (!contactResult.success) {
        throw new Error(contactResult.message)
      }
      
      const newContact = contactResult.contact
      
      if (patientData.cpf) {
        // Criar também paciente médico
        const medicalPatientResult = await createMedicalPatient({
          communicationContactId: newContact.id,
          fullName: patientData.name,
          cpf: patientData.cpf,
          medicalRecordNumber: patientData.medicalRecordNumber,
          insurance: patientData.insurance || { type: 'particular' }
        })
        
        if (!medicalPatientResult.success) {
          throw new Error(medicalPatientResult.message)
        }
        
        const newMedicalPatient = medicalPatientResult.patient
        
        return {
          id: newMedicalPatient.id,
          name: newMedicalPatient.fullName,
          cpf: newMedicalPatient.cpf,
          medicalRecordNumber: newMedicalPatient.medicalRecordNumber,
          phone: newContact.whatsapp || '',
          whatsapp: newContact.whatsapp || '',
          email: newContact.email,
          birthDate: newContact.birthDate,
          insurance: newMedicalPatient.insurance,
          registrationSources: newContact.registrationSources,
          emailPreferences: newContact.emailPreferences,
          birthdayEmailLogs: [],
          createdAt: newMedicalPatient.createdAt,
          updatedAt: newMedicalPatient.updatedAt
        }
      } else {
        // Apenas contato de comunicação
        return {
          id: newContact.id,
          name: newContact.name,
          cpf: undefined,
          medicalRecordNumber: undefined,
          phone: newContact.whatsapp || '',
          whatsapp: newContact.whatsapp || '',
          email: newContact.email,
          birthDate: newContact.birthDate,
          insurance: { type: 'particular' },
          registrationSources: newContact.registrationSources,
          emailPreferences: newContact.emailPreferences,
          birthdayEmailLogs: [],
          createdAt: newContact.createdAt,
          updatedAt: newContact.updatedAt
        }
      }
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar paciente:', error)
    throw error
  }
}

// ==================== FUNÇÕES PARA CONSULTAS/AGENDAMENTOS ====================

export async function getAllAppointments(): Promise<UnifiedAppointment[]> {
  try {
    const consultations = await prisma.consultation.findMany({
      include: {
        patient: true
      },
      orderBy: { scheduledDate: 'desc' }
    })

    return consultations.map(consultation => ({
      id: consultation.id,
      patientId: consultation.patientId,
      patientName: consultation.patient.name,
      patientCpf: consultation.patient.cpf || undefined,
      patientMedicalRecordNumber: undefined, // Patient model doesn't have this field
      patientPhone: consultation.patient.phone,
      patientWhatsapp: consultation.patient.whatsapp,
      patientEmail: consultation.patient.email || undefined,
      patientBirthDate: consultation.patient.birthDate?.toISOString().split('T')[0],
      insuranceType: (consultation.patient.insuranceType as 'unimed' | 'particular' | 'outro') || 'particular',
      insurancePlan: consultation.patient.insurancePlan || undefined,
      appointmentDate: consultation.scheduledDate.toISOString().split('T')[0],
      appointmentTime: consultation.scheduledDate.toTimeString().split(' ')[0].substring(0, 5),
      appointmentType: (consultation.type as 'consulta' | 'retorno' | 'urgencia' | 'teleconsulta' | 'visita_domiciliar') || 'consulta',
      status: (consultation.status as 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'reagendada') || 'agendada',
      source: 'public_appointment',
      notes: consultation.notes || undefined,
      createdAt: consultation.createdAt.toISOString(),
      updatedAt: consultation.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('Erro ao buscar consultas:', error)
    return []
  }
}

export async function getAppointmentsByDate(date: string): Promise<UnifiedAppointment[]> {
  try {
    const consultations = await prisma.consultation.findMany({
      where: {
        scheduledDate: new Date(date)
      },
      include: {
        patient: true
      }
    })

    return consultations.map(consultation => ({
      id: consultation.id,
      patientId: consultation.patientId,
      patientName: consultation.patient.name,
      patientCpf: consultation.patient.cpf || undefined,
      patientMedicalRecordNumber: undefined, // Patient model doesn't have this field
      patientPhone: consultation.patient.phone,
      patientWhatsapp: consultation.patient.whatsapp,
      patientEmail: consultation.patient.email || undefined,
      patientBirthDate: consultation.patient.birthDate?.toISOString().split('T')[0],
      insuranceType: (consultation.patient.insuranceType as 'unimed' | 'particular' | 'outro') || 'particular',
      insurancePlan: consultation.patient.insurancePlan || undefined,
      appointmentDate: consultation.scheduledDate.toISOString().split('T')[0],
      appointmentTime: consultation.scheduledDate.toTimeString().split(' ')[0].substring(0, 5),
      appointmentType: (consultation.type as 'consulta' | 'retorno' | 'urgencia' | 'teleconsulta' | 'visita_domiciliar') || 'consulta',
      status: (consultation.status as 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'reagendada') || 'agendada',
      source: 'public_appointment',
      notes: consultation.notes || undefined,
      createdAt: consultation.createdAt.toISOString(),
      updatedAt: consultation.updatedAt.toISOString()
    }))
  } catch (error) {
    console.error('Erro ao buscar consultas por data:', error)
    return []
  }
}

export async function createAppointment(appointmentData: Omit<UnifiedAppointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{
  success: boolean
  appointment?: UnifiedAppointment
  message: string
}> {
  try {
    // Verificar se o paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: appointmentData.patientId }
    })

    if (!patient) {
      return {
        success: false,
        message: 'Paciente não encontrado'
      }
    }

    // Criar nova consulta
    const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`)
    
    const newConsultation = await prisma.consultation.create({
      data: {
        id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId: appointmentData.patientId,
        scheduledDate: appointmentDateTime,
        type: appointmentData.appointmentType,
        status: appointmentData.status || 'agendada',
        notes: appointmentData.notes
      },
      include: {
        patient: true
      }
    })

    const appointment: UnifiedAppointment = {
      id: newConsultation.id,
      patientId: newConsultation.patientId,
      patientName: newConsultation.patient.name,
      patientCpf: newConsultation.patient.cpf || undefined,
      patientMedicalRecordNumber: undefined, // Patient model doesn't have this field
      patientPhone: newConsultation.patient.phone,
      patientWhatsapp: newConsultation.patient.whatsapp,
      patientEmail: newConsultation.patient.email || undefined,
      patientBirthDate: newConsultation.patient.birthDate?.toISOString().split('T')[0],
      insuranceType: (newConsultation.patient.insuranceType as 'unimed' | 'particular' | 'outro') || 'particular',
      insurancePlan: newConsultation.patient.insurancePlan || undefined,
      appointmentDate: newConsultation.scheduledDate.toISOString().split('T')[0],
      appointmentTime: newConsultation.scheduledDate.toTimeString().split(' ')[0].substring(0, 5),
      appointmentType: (newConsultation.type as 'consulta' | 'retorno' | 'urgencia' | 'teleconsulta' | 'visita_domiciliar') || 'consulta',
      status: (newConsultation.status as 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'reagendada') || 'agendada',
      source: appointmentData.source || 'public_appointment',
      notes: newConsultation.notes || undefined,
      createdAt: newConsultation.createdAt.toISOString(),
      updatedAt: newConsultation.updatedAt.toISOString()
    }

    return {
      success: true,
      appointment,
      message: 'Consulta criada com sucesso'
    }
  } catch (error) {
    console.error('Erro ao criar consulta:', error)
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

export async function updateAppointment(id: string, updateData: Partial<UnifiedAppointment>): Promise<{
  success: boolean
  appointment?: UnifiedAppointment
  message: string
}> {
  try {
    const existingConsultation = await prisma.consultation.findUnique({
      where: { id },
      include: { patient: true }
    })

    if (!existingConsultation) {
      return {
        success: false,
        message: 'Consulta não encontrada'
      }
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id },
      data: {
        scheduledDate: updateData.appointmentDate ? new Date(updateData.appointmentDate) : undefined,
        type: updateData.appointmentType,
        status: updateData.status,
        notes: updateData.notes,
        updatedAt: new Date()
      },
      include: {
        patient: true
      }
    })

    const appointment: UnifiedAppointment = {
      id: updatedConsultation.id,
      patientId: updatedConsultation.patientId,
      patientName: updatedConsultation.patient.name,
      patientCpf: updatedConsultation.patient.cpf || undefined,
      patientMedicalRecordNumber: undefined, // Patient model doesn't have this field
      patientPhone: updatedConsultation.patient.phone,
      patientWhatsapp: updatedConsultation.patient.whatsapp,
      patientEmail: updatedConsultation.patient.email || undefined,
      patientBirthDate: updatedConsultation.patient.birthDate?.toISOString().split('T')[0],
      insuranceType: (updatedConsultation.patient.insuranceType as 'unimed' | 'particular' | 'outro') || 'particular',
      insurancePlan: updatedConsultation.patient.insurancePlan || undefined,
      appointmentDate: updatedConsultation.scheduledDate.toISOString().split('T')[0],
      appointmentTime: updatedConsultation.scheduledDate.toTimeString().split(' ')[0].substring(0, 5),
      appointmentType: (updatedConsultation.type as 'consulta' | 'retorno' | 'urgencia' | 'teleconsulta' | 'visita_domiciliar') || 'consulta',
      status: (updatedConsultation.status as 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'reagendada') || 'agendada',
      source: updateData.source || 'public_appointment',
      notes: updatedConsultation.notes || undefined,
      createdAt: updatedConsultation.createdAt.toISOString(),
      updatedAt: updatedConsultation.updatedAt.toISOString()
    }

    return {
      success: true,
      appointment,
      message: 'Consulta atualizada com sucesso'
    }
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error)
    return {
      success: false,
      message: 'Erro interno do servidor'
    }
  }
}

// ==================== FUNÇÕES DE COMPATIBILIDADE ====================

// Função para obter agenda diária com cirurgias (versão Prisma)
export async function getDailyAgendaWithSurgeries(date: string): Promise<{
  appointments: UnifiedAppointment[]
  surgeries: any[] // TODO: Define Surgery interface when surgeries are migrated to Prisma
  totalItems: number
}> {
  try {
    const appointments = await getAppointmentsByDate(date)
    // TODO: Implement getSurgeriesByDate when surgeries are migrated to Prisma
    const surgeries: any[] = []
    
    return {
      appointments,
      surgeries,
      totalItems: appointments.length + surgeries.length
    }
  } catch (error) {
    console.error('❌ [PrismaService] Error getting daily agenda with surgeries:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      date,
      timestamp: new Date().toISOString()
    })
    return {
      appointments: [],
      surgeries: [],
      totalItems: 0
    }
  }
}

// Funções para manter compatibilidade com o código existente
export function saveAllPatients(patients: UnifiedPatient[]): void {
  console.warn('saveAllPatients: Esta função não é mais necessária com Prisma. Use createOrUpdatePatient para cada paciente.')
}

export function getAllAppointmentsSync(): UnifiedAppointment[] {
  console.warn('getAllAppointmentsSync: Use getAllAppointments (async) em vez desta função síncrona.')
  return []
}

export function saveAllAppointments(appointments: UnifiedAppointment[]): void {
  console.warn('saveAllAppointments: Esta função não é mais necessária com Prisma. Use createAppointment para cada consulta.')
}

// Função para limpar recursos do Prisma
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}