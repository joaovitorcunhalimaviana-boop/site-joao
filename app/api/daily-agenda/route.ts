import { NextRequest, NextResponse } from 'next/server'
import {
  sendTelegramDailyAgenda,
  type AppointmentNotificationData,
} from '../../../lib/telegram-notifications'

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

    // Gerar mensagem da agenda diária
    const agendaMessage = generateDailyAgendaMessage(targetDate, appointments)

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

    // Enviar via Telegram usando a nova função padronizada
    await sendTelegramDailyAgenda(targetDate, formattedAppointments)

    console.log('\n' + '📅'.repeat(20))
    console.log(`📋 AGENDA DIÁRIA ENVIADA - ${targetDate}`)
    console.log('📅'.repeat(20))
    console.log(`📊 Total de pacientes: ${appointments.length}`)
    console.log('📤 Telegram: Enviado')
    console.log('📅'.repeat(20) + '\n')

    return NextResponse.json({
      success: true,
      message: `Agenda diária para ${targetDate} enviada com sucesso`,
      totalPatients: appointments.length,
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

function generateDailyAgendaMessage(targetDate: string, appointments: any[]) {
  const formattedDate = new Date(targetDate).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let message = `📅 *AGENDA DO DIA*\n\n`
  message += `📆 *${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}*\n\n`
  message += `👥 *Total de pacientes: ${appointments.length}*\n\n`

  if (appointments.length === 0) {
    message += `🏖️ *Sem consultas agendadas para este dia*\n\n`
    message += `✨ Aproveite para descansar ou organizar outras atividades!`
    return message
  }

  // Ordenar por horário
  const sortedAppointments = appointments.sort((a, b) => {
    return a.appointmentTime.localeCompare(b.appointmentTime)
  })

  message += `📋 *CONSULTAS AGENDADAS:*\n\n`

  sortedAppointments.forEach((appointment, index) => {
    const patientName =
      appointment.patientName || appointment.fullName || 'Nome não informado'
    const time = appointment.appointmentTime
    const insurance =
      appointment.insuranceType === 'unimed' ? '🏥 Unimed' : '💳 Particular'
    const whatsapp = appointment.whatsapp || 'Não informado'

    message += `${index + 1}. ⏰ *${time}* - ${patientName}\n`
    message += `   ${insurance} | 📱 ${whatsapp}\n\n`
  })

  message += `📞 *Contato do consultório:* (83) 9 9122-1599\n`
  message += `📍 *Local:* Edifício Arcádia, Sala 101\n`
  message += `🏥 *Dr. João Vítor Viana - Coloproctologista*\n\n`
  message += `✅ *Lembrete enviado automaticamente 24h antes*`

  return message
}

// Função sendTelegramDailyAgenda removida - agora usando sendTelegramDailyAgenda do telegram-notifications.ts
