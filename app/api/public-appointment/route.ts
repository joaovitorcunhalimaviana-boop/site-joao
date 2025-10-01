import { NextRequest, NextResponse } from 'next/server'
import { 
  createOrUpdateCommunicationContact,
  createMedicalPatient,
  createAppointment
} from '@/lib/unified-patient-system'

// Cache simples para reduzir consultas repetidas
const cache = new Map<string, any>()
const CACHE_TTL = 30000 // 30 segundos

function getCacheKey(data: any): string {
  return `${data.cpf}-${data.selectedDate}-${data.selectedTime}`
}

function getFromCache(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

// POST - Criar agendamento público através do formulário
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API PUBLIC-APPOINTMENT: Recebendo requisição...')

    const body = await request.json()
    console.log('📋 Dados recebidos:', body)

    const {
      fullName,
      cpf,
      email,
      phone,
      whatsapp,
      birthDate,
      insuranceType,
      selectedDate,
      selectedTime,
    } = body

    // Validar campos obrigatórios
    if (
      !fullName ||
      !cpf ||
      !phone ||
      !whatsapp ||
      !birthDate ||
      !insuranceType ||
      !selectedDate ||
      !selectedTime
    ) {
      console.log('❌ Campos obrigatórios faltando')
      return NextResponse.json(
        {
          success: false,
          error:
            'Campos obrigatórios: fullName, cpf, phone, whatsapp, birthDate, insuranceType, selectedDate, selectedTime',
        },
        { status: 400 }
      )
    }

    // Verificar cache para evitar duplicações rápidas
    const cacheKey = getCacheKey({ cpf, selectedDate, selectedTime })
    const cachedResult = getFromCache(cacheKey)
    
    if (cachedResult) {
      console.log('📦 Retornando resultado do cache')
      return NextResponse.json(cachedResult)
    }

    console.log('💾 Criando contato de comunicação e paciente médico...')

    try {
      // 1. Criar ou atualizar contato de comunicação
      const communicationContact = createOrUpdateCommunicationContact({
        name: fullName,
        email: email || undefined,
        whatsapp,
        birthDate,
        source: 'public_appointment'
      })

      if (!communicationContact.success) {
        throw new Error(communicationContact.message)
      }

      // 2. Criar paciente médico
      const medicalPatient = createMedicalPatient({
        communicationContactId: communicationContact.contact.id,
        cpf,
        fullName,
        insurance: {
          type: insuranceType,
          plan: undefined
        },
        consents: {
          dataProcessing: true,
          medicalTreatment: true,
          imageUse: true
        }
      })

      if (!medicalPatient.success) {
        throw new Error(medicalPatient.message)
      }

      // 3. Criar agendamento unificado
      const appointmentResult = createAppointment({
        communicationContactId: communicationContact.contact.id,
        medicalPatientId: medicalPatient.patient.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        appointmentType: 'consulta',
        source: 'public_appointment'
      })

      if (!appointmentResult.success) {
        throw new Error(appointmentResult.message)
      }

      console.log('✅ Agendamento público criado com sucesso!')
      
      const successResponse = {
        success: true,
        appointment: appointmentResult.appointment,
        patient: medicalPatient.patient,
        communicationContact: communicationContact.contact,
        message: 'Agendamento criado com sucesso!',
      }

      // Cachear resultado de sucesso
      setCache(cacheKey, successResponse)
      
      return NextResponse.json(successResponse)

    } catch (creationError) {
      console.log('❌ Falha ao criar agendamento:', creationError)
      return NextResponse.json(
        {
          success: false,
          error: creationError instanceof Error ? creationError.message : 'Erro ao criar agendamento',
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('❌ Erro na API public-appointment:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
