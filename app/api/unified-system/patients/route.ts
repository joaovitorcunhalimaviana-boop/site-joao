import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllMedicalPatients,
  getAllCommunicationContacts,
  getCommunicationContactById,
  MedicalPatient,
  CommunicationContact
} from '@/lib/unified-patient-system'

// Interface para paciente unificado (combinando dados médicos e de comunicação)
interface UnifiedPatientData {
  id: string
  name: string
  fullName: string
  email?: string
  phone?: string
  whatsapp?: string
  birthDate?: string
  cpf: string
  medicalRecordNumber: number
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
    cardNumber?: string
    validUntil?: string
  }
  address?: string
  city?: string
  state?: string
  zipCode?: string
  rg?: string
  medicalInfo: {
    allergies?: string[]
    medications?: string[]
    conditions?: string[]
    emergencyContact?: string
    emergencyPhone?: string
    bloodType?: string
    notes?: string
  }
  consents: {
    dataProcessing: boolean
    dataProcessingDate?: string
    medicalTreatment: boolean
    medicalTreatmentDate?: string
    imageUse: boolean
    imageUseDate?: string
  }
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
  registrationSources: ('newsletter' | 'public_appointment' | 'doctor_area' | 'secretary_area' | 'review')[]
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// GET - Listar todos os pacientes do sistema unificado
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const search = searchParams.get('search')
    const active = searchParams.get('active')
    const insurance = searchParams.get('insurance')
    
    if (action === 'all-patients') {
      // Obter todos os pacientes médicos
      const medicalPatients = getAllMedicalPatients()
      
      // Combinar com dados de comunicação
      const unifiedPatients: UnifiedPatientData[] = medicalPatients.map(medicalPatient => {
        const communicationContact = getCommunicationContactById(medicalPatient.communicationContactId)
        
        return {
          id: medicalPatient.id,
          name: communicationContact?.name || medicalPatient.fullName,
          fullName: medicalPatient.fullName,
          email: communicationContact?.email,
          phone: communicationContact?.whatsapp, // Para compatibilidade
          whatsapp: communicationContact?.whatsapp,
          birthDate: communicationContact?.birthDate,
          cpf: medicalPatient.cpf,
          medicalRecordNumber: medicalPatient.medicalRecordNumber,
          insurance: medicalPatient.insurance,
          address: medicalPatient.address,
          city: medicalPatient.city,
          state: medicalPatient.state,
          zipCode: medicalPatient.zipCode,
          rg: medicalPatient.rg,
          medicalInfo: medicalPatient.medicalInfo,
          consents: medicalPatient.consents,
          emailPreferences: communicationContact?.emailPreferences || {
            newsletter: false,
            healthTips: false,
            appointments: true,
            promotions: false,
            subscribed: false
          },
          whatsappPreferences: communicationContact?.whatsappPreferences || {
            appointments: true,
            reminders: true,
            promotions: false,
            subscribed: true
          },
          registrationSources: communicationContact?.registrationSources || ['doctor_area'],
          createdAt: medicalPatient.createdAt,
          updatedAt: medicalPatient.updatedAt,
          isActive: medicalPatient.isActive
        }
      })
      
      // Aplicar filtros se fornecidos
      let filteredPatients = unifiedPatients
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredPatients = filteredPatients.filter(patient =>
          patient.name.toLowerCase().includes(searchLower) ||
          patient.fullName.toLowerCase().includes(searchLower) ||
          patient.cpf.includes(search) ||
          patient.whatsapp?.includes(search) ||
          patient.email?.toLowerCase().includes(searchLower)
        )
      }
      
      if (active !== null) {
        const isActive = active === 'true'
        filteredPatients = filteredPatients.filter(patient => patient.isActive === isActive)
      }
      
      if (insurance) {
        filteredPatients = filteredPatients.filter(patient => patient.insurance.type === insurance)
      }
      
      return NextResponse.json({
        success: true,
        patients: filteredPatients,
        count: filteredPatients.length,
        message: `${filteredPatients.length} pacientes encontrados`
      }, { status: 200 })
    }
    
    // Ação padrão - retornar todos os pacientes
    const medicalPatients = getAllMedicalPatients()
    const unifiedPatients: UnifiedPatientData[] = medicalPatients.map(medicalPatient => {
      const communicationContact = getCommunicationContactById(medicalPatient.communicationContactId)
      
      return {
        id: medicalPatient.id,
        name: communicationContact?.name || medicalPatient.fullName,
        fullName: medicalPatient.fullName,
        email: communicationContact?.email,
        phone: communicationContact?.whatsapp,
        whatsapp: communicationContact?.whatsapp,
        birthDate: communicationContact?.birthDate,
        cpf: medicalPatient.cpf,
        medicalRecordNumber: medicalPatient.medicalRecordNumber,
        insurance: medicalPatient.insurance,
        address: medicalPatient.address,
        city: medicalPatient.city,
        state: medicalPatient.state,
        zipCode: medicalPatient.zipCode,
        rg: medicalPatient.rg,
        medicalInfo: medicalPatient.medicalInfo,
        consents: medicalPatient.consents,
        emailPreferences: communicationContact?.emailPreferences || {
          newsletter: false,
          healthTips: false,
          appointments: true,
          promotions: false,
          subscribed: false
        },
        whatsappPreferences: communicationContact?.whatsappPreferences || {
          appointments: true,
          reminders: true,
          promotions: false,
          subscribed: true
        },
        registrationSources: communicationContact?.registrationSources || ['doctor_area'],
        createdAt: medicalPatient.createdAt,
        updatedAt: medicalPatient.updatedAt,
        isActive: medicalPatient.isActive
      }
    })
    
    return NextResponse.json({
      success: true,
      patients: unifiedPatients,
      count: unifiedPatients.length,
      message: `${unifiedPatients.length} pacientes encontrados`
    }, { status: 200 })
    
  } catch (error) {
    console.error('❌ Erro ao buscar pacientes do sistema unificado:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        message: 'Erro ao buscar pacientes'
      },
      { status: 500 }
    )
  }
}