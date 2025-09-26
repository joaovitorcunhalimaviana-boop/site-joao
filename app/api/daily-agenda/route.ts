import { NextRequest, NextResponse } from 'next/server'
import {
  sendTelegramDailyAgenda,
  type AppointmentNotificationData,
} from '../../../lib/telegram-notifications'
import { getSurgeriesByDate } from '../../../lib/unified-appointment-system'
import {
  getDailyBibleVerse,
  formatBibleVerseForTelegram,
} from '../../../lib/bible-verses'

// Sistema de agenda diária para o médico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetDate, appointments } = body

    // Validar dados obrigatórios
    if (!targetDate || !appointments || !Array.isArray(appointments)) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: targetDate e appointments (array)' },
        { status: 400 }
      )
    }

    // Buscar cirurgias para a data
    const surgeries = await getSurgeriesByDate(targetDate)
    console.log(
      `🏥 Cirurgias encontradas para ${targetDate}:`,
      surgeries.length
    )

    // Gerar mensagem da agenda diária incluindo cirurgias
    const agendaMessage = generateDailyAgendaMessage(
      targetDate,
      appointments,
      surgeries
    )

    // Converter appointments para o formato padronizado
    const formattedAppointments: AppointmentNotificationData[] =
      appointments.map(apt => ({
        patientName: apt.patientName || apt.fullName,
        patientPhone: apt.patientPhone || apt.phone,
        patientWhatsapp:
          apt.patientWhatsapp || apt.whatsapp || apt.patientPhone || apt.phone,
        patientEmail: apt.patientEmail || apt.email,
        appointmentDate: targetDate,
        appointmentTime: apt.appointmentTime || apt.selectedTime,
        insuranceType:
          (apt.insuranceType as 'unimed' | 'particular' | 'outro') ||
          'particular',
        appointmentType: apt.appointmentType,
        source: apt.source,
        notes: apt.notes,
      }))

    // Converter cirurgias para o formato padronizado
    const formattedSurgeries: AppointmentNotificationData[] = surgeries.map(
      surgery => ({
        patientName: surgery.patientName,
        patientPhone: '', // Cirurgias não têm telefone no modelo atual
        patientWhatsapp: '',
        patientEmail: '',
        appointmentDate: targetDate,
        appointmentTime: surgery.time,
        insuranceType:
          surgery.paymentType === 'plano' ? 'unimed' : 'particular',
        appointmentType: 'cirurgia' as any,
        source: 'surgery_system' as any,
        notes: `${surgery.surgeryType} - ${surgery.hospital}`,
      })
    )

    // Combinar consultas e cirurgias
    const allAppointments = [...formattedAppointments, ...formattedSurgeries]

    // Enviar via Telegram usando a mensagem gerada localmente
    const telegramToken = process.env['TELEGRAM_BOT_TOKEN']
    const telegramChatId = process.env['TELEGRAM_CHAT_ID']

    if (telegramToken && telegramChatId) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${telegramToken}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: agendaMessage,
              parse_mode: 'Markdown',
              disable_web_page_preview: false,
            }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            `Erro na API do Telegram: ${response.status} - ${JSON.stringify(errorData)}`
          )
        }

        console.log('✅ Agenda diária Telegram enviada com sucesso!')
      } catch (telegramError) {
        console.error(
          '❌ Erro ao enviar agenda diária Telegram:',
          telegramError
        )
      }
    } else {
      console.log('ℹ️ Telegram não configurado - agenda diária não enviada')
    }

    console.log('\n' + '📅'.repeat(20))
    console.log(`📋 AGENDA DIÁRIA ENVIADA - ${targetDate}`)
    console.log('📅'.repeat(20))
    console.log(`👥 Total de consultas: ${appointments.length}`)
    console.log(`🏥 Total de cirurgias: ${surgeries.length}`)
    console.log(`📊 Total geral: ${allAppointments.length}`)
    console.log('📤 Telegram: Enviado')
    console.log('📅'.repeat(20) + '\n')

    return NextResponse.json({
      success: true,
      message: `Agenda diária para ${targetDate} enviada com sucesso`,
      totalPatients: appointments.length,
      totalSurgeries: surgeries.length,
      totalItems: allAppointments.length,
      agendaMessage,
    })
  } catch (error) {
    console.error('❌ Erro ao enviar agenda diária:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateDailyAgendaMessage(
  targetDate: string,
  appointments: any[],
  surgeries: any[]
) {
  // Corrigir problema de timezone - adicionar horário para evitar mudança de data
  const dateWithTime = new Date(targetDate + 'T12:00:00')
  const formattedDate = dateWithTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let message = `📅 *AGENDA DO DIA*\n\n`
  message += `📆 *${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}*\n\n`
  message += `👥 *Consultas: ${appointments.length}*\n`
  message += `🏥 *Cirurgias: ${surgeries.length}*\n`
  message += `📊 *Total: ${appointments.length + surgeries.length}*\n\n`

  if (appointments.length === 0 && surgeries.length === 0) {
    message += `🏖️ *Sem atividades agendadas para este dia*\n\n`
    message += `✨ Aproveite para descansar ou organizar outras atividades!`

    // Adicionar versículo bíblico mesmo quando não há atividades
    const verse = getDailyBibleVerse(targetDate)
    message += `\n\n${formatBibleVerseForTelegram(verse)}`

    return message
  }

  // Combinar e ordenar por horário
  const allItems = [
    ...appointments.map(apt => ({
      ...apt,
      type: 'consulta',
      time: apt.appointmentTime || '00:00',
      name: apt.patientName || apt.fullName || 'Nome não informado',
    })),
    ...surgeries.map(surgery => ({
      ...surgery,
      type: 'cirurgia',
      time: surgery.time || '00:00',
      name: surgery.patientName,
    })),
  ].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))

  if (appointments.length > 0) {
    message += `📋 *CONSULTAS AGENDADAS:*\n\n`

    appointments
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
      .forEach((appointment, index) => {
        const patientName =
          appointment.patientName ||
          appointment.fullName ||
          'Nome não informado'
        const time = appointment.appointmentTime
        const insurance =
          appointment.insuranceType === 'unimed' ? '🏥 Unimed' : '💳 Particular'
        const whatsapp = appointment.whatsapp || 'Não informado'

        message += `${index + 1}. ⏰ *${time}* - ${patientName}\n`
        message += `   ${insurance} | 📱 ${whatsapp}\n\n`
      })
  }

  if (surgeries.length > 0) {
    message += `🏥 *CIRURGIAS AGENDADAS:*\n\n`

    surgeries
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach((surgery, index) => {
        const patientName = surgery.patientName
        const time = surgery.time
        const surgeryType = surgery.surgeryType
        const hospital = surgery.hospital
        const paymentType =
          surgery.paymentType === 'plano' ? '🏥 Plano' : '💳 Particular'

        message += `${index + 1}. ⏰ *${time}* - ${patientName}\n`
        message += `   🔪 ${surgeryType}\n`
        message += `   🏥 ${hospital} | ${paymentType}\n\n`
      })
  }

  // Adicionar versículo bíblico no final da mensagem
  const verse = getDailyBibleVerse(targetDate)
  message += `${formatBibleVerseForTelegram(verse)}`

  return message
}

// Função sendTelegramDailyAgenda removida - agora usando sendTelegramDailyAgenda do telegram-notifications.ts
