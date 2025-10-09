// Tipos e interfaces do Sistema Unificado de Pacientes
// Separado para uso em componentes client-side sem importar fs

// ==================== INTERFACES UNIFICADAS ====================

// CAMADA 1: Sistema de Comunicação (mais amplo)
export interface CommunicationContact {
  id: string
  name: string
  email?: string
  whatsapp?: string
  birthDate?: string // Para emails de aniversário
  
  // Rastreamento de fontes de cadastro
  registrationSources: ('newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review')[]
  
  // Preferências de comunicação
  emailPreferences: {
    newsletter: boolean
    healthTips: boolean
    appointments: boolean
    promotions: boolean
    subscribed: boolean
    subscribedAt?: string
    unsubscribedAt?: string
  }
  
  whatsappPreferences: {
    appointments: boolean
    reminders: boolean
    promotions: boolean
    subscribed: boolean
    subscribedAt?: string
  }
  
  // Dados de avaliação (se aplicável)
  reviewData?: {
    rating: number
    comment: string
    reviewDate: string
    verified: boolean
    approved: boolean
  }
  
  // Metadados
  source: 'newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review'
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// CAMADA 2: Pacientes Médicos (subconjunto mais específico)
export interface MedicalPatient {
  id: string
  communicationContactId: string
  cpf: string
  medicalRecordNumber: number
  fullName: string
  rg?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  insuranceType: 'PARTICULAR' | 'UNIMED' | 'OTHER'
  insurancePlan?: string
  insuranceCardNumber?: string
  insuranceValidUntil?: Date | string
  allergies?: string
  medications?: string
  conditions?: string
  emergencyContact?: string
  emergencyPhone?: string
  bloodType?: string
  medicalNotes?: string
  consentDataProcessing: boolean
  consentDataProcessingDate?: Date | string
  consentMedicalTreatment: boolean
  consentMedicalTreatmentDate?: Date | string
  consentImageUse: boolean
  consentImageUseDate?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
  createdBy?: string
  isActive: boolean
}

// Interface para compatibilidade com código legado
export interface UnifiedPatient {
  id: string
  nomeCompleto: string
  cpf: string
  numeroRegistroMedico: number
  telefone?: string
  dataNascimento?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  tipoPlano: 'PARTICULAR' | 'UNIMED' | 'OTHER'
  planoSaude?: string
  numeroCartao?: string
  validadeCartao?: string
  alergias?: string
  medicamentos?: string
  condicoes?: string
  contatoEmergencia?: string
  telefoneEmergencia?: string
  tipoSanguineo?: string
  observacoesMedicas?: string
  consentimentos: {
    processamentoDados: boolean
    dataProcessamentoDados?: string
    tratamentoMedico: boolean
    dataTratamentoMedico?: string
    usoImagem: boolean
    dataUsoImagem?: string
  }
  criadoEm: string
  atualizadoEm: string
  criadoPor?: string
  isActive: boolean
  medicalInfo?: {
    allergies?: string[]
    medications?: string[]
    conditions?: string[]
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
    }
  }
}

// ==================== AGENDAMENTOS ====================

export interface UnifiedAppointment {
  id: string
  patientId: string // Referência ao MedicalPatient
  communicationContactId?: string // Referência opcional ao CommunicationContact
  
  // Dados do agendamento
  date: string // YYYY-MM-DD
  time: string // HH:MM
  duration: number // em minutos
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'PROCEDURE' | 'TELEMEDICINE' | 'EMERGENCY'
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  
  // Dados do paciente (desnormalizado para performance)
  patientName: string
  patientEmail?: string
  patientPhone?: string
  patientWhatsapp?: string
  
  // Informações médicas
  specialty?: string
  doctor?: string
  notes?: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  
  // Dados de plano
  insuranceType: 'PARTICULAR' | 'UNIMED' | 'OTHER'
  insuranceDetails?: string
  
  // Notificações
  reminderSent: boolean
  confirmationSent: boolean
  
  // Origem do agendamento
  source: 'MANUAL' | 'ONLINE' | 'PHONE' | 'WHATSAPP' | 'SYSTEM'
  
  // Metadados
  createdAt: string
  updatedAt: string
  createdBy: 'system' | 'doctor' | 'secretary' | 'patient'
}

// ==================== CIRURGIAS ====================

export interface Surgery {
  id: string
  patientId: string
  
  // Dados da cirurgia
  date: string // YYYY-MM-DD
  time: string // HH:MM
  duration: number // em minutos
  type: string
  description: string
  status: 'scheduled' | 'completed' | 'cancelled'
  
  // Dados do paciente (desnormalizado)
  patientName: string
  patientCpf: string
  
  // Informações médicas
  surgeon: string
  anesthesiologist?: string
  hospital: string
  room?: string
  notes?: string
  
  // Metadados
  createdAt: string
  updatedAt: string
}

// ==================== PRONTUÁRIOS ====================

export interface MedicalRecord {
  id: string
  patientId: string
  appointmentId?: string
  
  // Dados da consulta
  date: string
  type: 'consultation' | 'return' | 'procedure' | 'exam'
  
  // Informações clínicas
  chiefComplaint: string
  historyOfPresentIllness: string
  physicalExamination: string
  diagnosis: string
  treatment: string
  prescription?: string
  followUpInstructions?: string
  
  // Exames solicitados
  requestedExams?: string[]
  
  // Próxima consulta
  nextAppointment?: {
    date: string
    type: string
    notes?: string
  }
  
  // Metadados
  doctor: string
  createdAt: string
  updatedAt: string
}

// ==================== TIPOS DE RESPOSTA ====================

export interface OperationResult<T = any> {
  success: boolean
  message: string
  data?: T
  contact?: CommunicationContact
  patient?: MedicalPatient
  appointment?: UnifiedAppointment
  error?: string
}

// ==================== TIPOS DE DADOS PARA CRIAÇÃO ====================

export interface CreateCommunicationContactData {
  name: string
  email?: string
  whatsapp?: string
  birthDate?: string
  source: 'newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review'
  emailPreferences?: Partial<CommunicationContact['emailPreferences']>
  whatsappPreferences?: Partial<CommunicationContact['whatsappPreferences']>
  reviewData?: CommunicationContact['reviewData']
}

export interface CreateMedicalPatientData {
  name: string
  cpf: string
  email?: string
  phone?: string
  whatsapp?: string
  birthDate?: string
  address?: string
  medicalInfo?: Partial<MedicalPatient['medicalInfo']>
  insuranceInfo?: MedicalPatient['insuranceInfo']
}

export interface CreateAppointmentData {
  patientId: string
  date: string
  time: string
  duration?: number
  type: UnifiedAppointment['type']
  specialty?: string
  doctor?: string
  notes?: string
  symptoms?: string
  insuranceType: UnifiedAppointment['insuranceType']
  insuranceDetails?: string
  createdBy?: UnifiedAppointment['createdBy']
}