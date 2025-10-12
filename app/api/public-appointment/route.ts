import { NextRequest, NextResponse } from 'next/server'
import {
  createOrUpdateCommunicationContact,
  createMedicalPatient,
  createAppointment,
  getMedicalPatientByCpf,
  getCommunicationContactByEmail,
  canPatientScheduleNewAppointment,
} from '@/lib/unified-patient-system-prisma'
import { validateCPF, formatCPF } from '@/lib/validation-schemas'
import { sendTelegramAppointmentNotification, convertPrismaToNotificationData } from '@/lib/telegram-notifications'

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

    // Validar CPF
    if (!validateCPF(cpf)) {
      console.log('❌ CPF inválido:', cpf)
      return NextResponse.json(
        {
          success: false,
          error: 'CPF inválido. Verifique o número digitado.',
        },
        { status: 400 }
      )
    }

    // Limpar CPF (remover formatação)
    const cpfClean = cpf.replace(/\D/g, '')

    // Validar email (se fornecido)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('❌ Email inválido:', email)
      return NextResponse.json(
        {
          success: false,
          error: 'Email inválido.',
        },
        { status: 400 }
      )
    }

    // Validar telefone
    const phoneClean = phone.replace(/\D/g, '')
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      console.log('❌ Telefone inválido:', phone)
      return NextResponse.json(
        {
          success: false,
          error: 'Número de telefone inválido.',
        },
        { status: 400 }
      )
    }

    // Validar WhatsApp
    const whatsappClean = whatsapp.replace(/\D/g, '')
    if (whatsappClean.length < 10 || whatsappClean.length > 11) {
      console.log('❌ WhatsApp inválido:', whatsapp)
      return NextResponse.json(
        {
          success: false,
          error: 'Número de WhatsApp inválido.',
        },
        { status: 400 }
      )
    }

    // Verificar cache para evitar duplicações rápidas
    const cacheKey = getCacheKey({ cpf: cpfClean, selectedDate, selectedTime })
    const cachedResult = getFromCache(cacheKey)

    if (cachedResult) {
      console.log('📦 Retornando resultado do cache')
      return NextResponse.json(cachedResult)
    }

    // Validar se não é agendamento para o mesmo dia
    const today = new Date().toISOString().split('T')[0]
    if (selectedDate === today) {
      console.log('❌ Tentativa de agendamento para o mesmo dia:', selectedDate)
      return NextResponse.json(
        {
          success: false,
          error: 'Não é possível agendar consultas para o mesmo dia. Por favor, escolha uma data futura.',
        },
        { status: 400 }
      )
    }

    console.log('💾 Criando contato de comunicação e paciente médico...')

    try {
      // 1. Verificar se já existe paciente médico com este CPF
      const existingMedicalPatient = await getMedicalPatientByCpf(cpfClean)

      if (existingMedicalPatient) {
        console.log('⚠️ Paciente médico já existe com este CPF:', cpfClean)

        // Verificar se paciente pode agendar nova consulta
        const canSchedule = await canPatientScheduleNewAppointment(cpfClean)
        
        if (!canSchedule.canSchedule) {
          console.log('❌ Paciente não pode agendar nova consulta:', canSchedule.reason)
          return NextResponse.json(
            {
              success: false,
              error: canSchedule.reason,
            },
            { status: 400 }
          )
        }

        // Criar apenas o agendamento para o paciente existente
        const appointmentResult = await createAppointment({
          communicationContactId: existingMedicalPatient.communicationContactId,
          medicalPatientId: existingMedicalPatient.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          appointmentType: 'consulta',
          source: 'website',
        })

        if (!appointmentResult.success) {
          throw new Error(appointmentResult.message)
        }

        // Enviar notificação Telegram
        try {
          const notificationData = {
            patientName: fullName,
            patientEmail: email,
            patientPhone: phoneClean,
            patientWhatsapp: whatsappClean,
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            insuranceType: insuranceType as 'unimed' | 'particular' | 'outro',
            appointmentType: 'consulta',
            source: 'public_appointment',
          }

          await sendTelegramAppointmentNotification(notificationData)
          console.log('✅ Notificação Telegram enviada')
        } catch (notifError) {
          console.error('⚠️ Erro ao enviar notificação Telegram:', notifError)
          // Não bloqueia o agendamento se notificação falhar
        }

        const successResponse = {
          success: true,
          appointment: appointmentResult.appointment,
          patient: existingMedicalPatient,
          message: 'Agendamento criado com sucesso para paciente existente!',
          isExistingPatient: true,
        }

        setCache(cacheKey, successResponse)
        return NextResponse.json(successResponse)
      }

      // 2. Criar ou atualizar contato de comunicação
      const communicationContact = await createOrUpdateCommunicationContact({
        name: fullName,
        email: email || undefined,
        whatsapp: whatsappClean,
        birthDate,
        source: 'public_appointment',
      })

      if (!communicationContact.success) {
        throw new Error(communicationContact.message)
      }

      // 3. Criar paciente médico
      const medicalPatient = await createMedicalPatient({
        communicationContactId: communicationContact.contact?.id ?? '',
        cpf: cpfClean,
        fullName,
        insuranceType: insuranceType,
        insurancePlan: undefined,
        consents: {
          dataProcessing: true,
          dataProcessingDate: new Date().toISOString(),
          medicalTreatment: true,
          medicalTreatmentDate: new Date().toISOString(),
          imageUse: true,
          imageUseDate: new Date().toISOString(),
        },
      })

      if (!medicalPatient.success || !medicalPatient.patient) {
        throw new Error(medicalPatient.message)
      }

      // 4. Criar agendamento unificado
      const appointmentResult = await createAppointment({
        communicationContactId: communicationContact.contact?.id ?? '',
        medicalPatientId: medicalPatient.patient?.id ?? '',
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        appointmentType: 'consulta',
        source: 'website',
      })

      if (!appointmentResult.success) {
        throw new Error(appointmentResult.message)
      }

      console.log('✅ Agendamento público criado com sucesso!')

      // Enviar notificação Telegram
      try {
        const notificationData = {
          patientName: fullName,
          patientEmail: email,
          patientPhone: phoneClean,
          patientWhatsapp: whatsappClean,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          insuranceType: insuranceType as 'unimed' | 'particular' | 'outro',
          appointmentType: 'consulta',
          source: 'public_appointment',
        }

        await sendTelegramAppointmentNotification(notificationData)
        console.log('✅ Notificação Telegram enviada')
      } catch (notifError) {
        console.error('⚠️ Erro ao enviar notificação Telegram:', notifError)
        // Não bloqueia o agendamento se notificação falhar
      }

      const successResponse = {
        success: true,
        appointment: appointmentResult.appointment,
        patient: medicalPatient.patient,
        communicationContact: communicationContact.contact,
        message: 'Agendamento criado com sucesso!',
        isExistingPatient: false,
      }

      // Cachear resultado de sucesso
      setCache(cacheKey, successResponse)

      return NextResponse.json(successResponse)
    } catch (creationError) {
      console.log('❌ Falha ao criar agendamento:', creationError)
      return NextResponse.json(
        {
          success: false,
          error:
            creationError instanceof Error
              ? creationError.message
              : 'Erro ao criar agendamento',
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

// GET - Test endpoint to verify route is working
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Public appointment API is working',
    timestamp: new Date().toISOString()
  })
}
