import { NextRequest, NextResponse } from 'next/server'
import {
  sendTelegramReminderNotification,
  type AppointmentNotificationData,
} from '../../../lib/telegram-notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      whatsapp,
      selectedDate,
      selectedTime,
      insuranceType,
      reminderType = '24h',
    } = body

    // Validar dados obrigatórios
    if (!fullName || !whatsapp || !selectedDate || !selectedTime) {
      return NextResponse.json(
        {
          error:
            'Dados obrigatórios: fullName, whatsapp, selectedDate, selectedTime',
        },
        { status: 400 }
      )
    }

    // Gerar mensagem de lembrete baseada no tipo
    const reminderMessage = generateReminderMessage({
      fullName,
      selectedDate,
      selectedTime,
      insuranceType,
      reminderType,
    })

    // Link WhatsApp para o paciente
    const patientWhatsApp = whatsapp.replace(/\D/g, '') // Remove formatação
    const reminderWhatsAppLink = `https://wa.me/55${patientWhatsApp}?text=${encodeURIComponent(reminderMessage)}`

    // Log do lembrete
    console.log('\n' + '⏰'.repeat(20))
    console.log(`🔔 LEMBRETE DE CONSULTA (${reminderType.toUpperCase()})`)
    console.log('⏰'.repeat(20))
    console.log(`👤 Paciente: ${fullName}`)
    console.log(`📅 Consulta: ${selectedDate} às ${selectedTime}`)
    console.log(`📱 WhatsApp: ${whatsapp}`)
    console.log('\n📤 ENVIAR LEMBRETE:')
    console.log(reminderWhatsAppLink)
    console.log('⏰'.repeat(20) + '\n')

    // Enviar lembrete via Telegram usando a nova função padronizada
    try {
      const reminderData: AppointmentNotificationData = {
        patientName: fullName,
        patientPhone: whatsapp,
        patientWhatsapp: whatsapp,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        insuranceType:
          (insuranceType as 'unimed' | 'particular' | 'outro') || 'particular',
      }

      await sendTelegramReminderNotification(
        reminderData,
        reminderType === '24h' ? 'day_before' : 'hour_before'
      )
      console.log('✅ Lembrete Telegram enviado via nova função!')
    } catch (telegramError) {
      console.warn('⚠️ Erro ao enviar lembrete Telegram:', telegramError)
    }

    // Enviar notificação aprimorada para o médico
    try {
      const doctorNotificationResponse = await fetch(
        '/api/doctor-notifications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'reminder',
            patientData: {
              patientName: fullName,
              whatsapp,
              insuranceType,
            },
            appointmentData: {
              appointmentDate: selectedDate,
              appointmentTime: selectedTime,
            },
            additionalInfo: {
              reminderType,
            },
          }),
        }
      )

      const result = await doctorNotificationResponse.json()
      console.log(
        '📤 Notificações do médico (lembrete):',
        result.success ? 'Enviadas' : 'Falharam'
      )
    } catch (error) {
      console.warn('⚠️ Erro ao notificar médico sobre lembrete:', error)
    }

    // Manter notificação via Telegram como backup
    await sendTelegramReminderNotification({
      patientName: fullName,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      patientWhatsapp: whatsapp,
      patientPhone: whatsapp,
      insuranceType: insuranceType || 'particular',
    })

    return NextResponse.json({
      success: true,
      message: `Lembrete ${reminderType} gerado com sucesso`,
      reminderWhatsAppLink,
      reminderMessage,
      scheduledFor: selectedDate,
      reminderType,
    })
  } catch (error) {
    console.error('❌ Erro ao gerar lembrete:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateReminderMessage(data: {
  fullName: string
  selectedDate: string
  selectedTime: string
  insuranceType?: string
  reminderType: string
}) {
  const baseMessage =
    `🔔 *LEMBRETE DE CONSULTA*\n\n` + `Olá ${data.fullName}! 👋\n\n`

  switch (data.reminderType) {
    case '24h':
      return (
        baseMessage +
        `⏰ Sua consulta é *AMANHÃ*:\n\n` +
        `👨‍⚕️ *Dr. João Vítor Viana*\n` +
        `🏥 *Coloproctologista*\n` +
        `📅 *Data:* ${data.selectedDate}\n` +
        `⏰ *Horário:* ${data.selectedTime}\n\n` +
        `📍 *Local:*\n` +
        `Edifício Arcádia, Sala 101\n` +
        `Avenida Rui Barbosa, 484\n` +
        `Sala 707 - Tambaú, João Pessoa - PB\n\n` +
        `✅ *Lembre-se de trazer:*\n` +
        `• Documento com foto\n` +
        `• ${data.insuranceType === 'unimed' ? 'Carteirinha da Unimed' : 'Documento com foto'}\n` +
        `• Chegar 15 minutos antes\n\n` +
        `🔔 *CONFIRME SUA PRESENÇA:*\n` +
        `Por favor, responda esta mensagem com:\n\n` +
        `✅ *CONFIRMAR* - Para confirmar presença\n` +
        `🔄 *REAGENDAR* - Para solicitar novo horário\n` +
        `❌ *CANCELAR* - Para cancelar a consulta\n\n` +
        `⚠️ *Importante:* Se não confirmar até 2 horas antes da consulta, entraremos em contato.\n\n` +
        `Aguardamos sua confirmação! 😊`
      )

    default:
      return (
        baseMessage +
        `📅 Você tem uma consulta agendada:\n\n` +
        `👨‍⚕️ *Dr. João Vítor Viana*\n` +
        `📅 *Data:* ${data.selectedDate}\n` +
        `⏰ *Horário:* ${data.selectedTime}\n\n` +
        `📞 *Contato:* (83) 9 9122-1599`
      )
  }
}

// Função sendTelegramReminder removida - agora usando sendTelegramReminderNotification do telegram-notifications.ts
