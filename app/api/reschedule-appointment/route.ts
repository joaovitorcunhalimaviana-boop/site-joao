import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      whatsapp,
      currentDate,
      currentTime,
      action = 'request',
    } = body

    // Validar dados obrigatórios
    if (!fullName || !whatsapp) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: fullName, whatsapp' },
        { status: 400 }
      )
    }

    let message = ''
    let doctorNotification = ''

    switch (action) {
      case 'request':
        // Paciente solicita reagendamento
        message = generateRescheduleRequestMessage({
          fullName,
          currentDate,
          currentTime,
        })
        doctorNotification = generateDoctorRescheduleNotification({
          fullName,
          whatsapp,
          currentDate,
          currentTime,
          action: 'request',
        })
        break

      case 'confirm':
        // Confirmar novo horário
        const { newDate, newTime } = body
        if (!newDate || !newTime) {
          return NextResponse.json(
            { error: 'Para confirmação, newDate e newTime são obrigatórios' },
            { status: 400 }
          )
        }
        message = generateRescheduleConfirmationMessage({
          fullName,
          currentDate,
          currentTime,
          newDate,
          newTime,
        })
        doctorNotification = generateDoctorRescheduleNotification({
          fullName,
          whatsapp,
          currentDate,
          currentTime,
          newDate,
          newTime,
          action: 'confirm',
        })
        break

      case 'cancel':
        // Cancelar consulta
        message = generateCancellationMessage({
          fullName,
          currentDate,
          currentTime,
        })
        doctorNotification = generateDoctorRescheduleNotification({
          fullName,
          whatsapp,
          currentDate,
          currentTime,
          action: 'cancel',
        })
        break

      default:
        return NextResponse.json(
          { error: 'Ação inválida. Use: request, confirm, ou cancel' },
          { status: 400 }
        )
    }

    // Links WhatsApp
    const patientWhatsApp = whatsapp.replace(/\D/g, '')
    const doctorWhatsApp = process.env['DOCTOR_WHATSAPP'] || '83991221599'

    const patientWhatsAppLink = `https://wa.me/55${patientWhatsApp}?text=${encodeURIComponent(message)}`
    const doctorWhatsAppLink = `https://wa.me/55${doctorWhatsApp}?text=${encodeURIComponent(doctorNotification)}`

    // Log da ação
    console.log('\n' + '🔄'.repeat(20))
    console.log(`📅 REAGENDAMENTO - ${action.toUpperCase()}`)
    console.log('🔄'.repeat(20))
    console.log(`👤 Paciente: ${fullName}`)
    console.log(`📱 WhatsApp: ${whatsapp}`)
    if (currentDate && currentTime) {
      console.log(`📅 Consulta atual: ${currentDate} às ${currentTime}`)
    }
    console.log('\n📤 LINKS DE AÇÃO:')
    console.log('1️⃣ Para o paciente:', patientWhatsAppLink)
    console.log('2️⃣ Para o médico:', doctorWhatsAppLink)
    console.log('🔄'.repeat(20) + '\n')

    // Enviar notificação aprimorada para o médico
    try {
      const additionalInfo: any = { action }
      if (action === 'confirm') {
        const { newDate, newTime } = body
        if (newDate && newTime) {
          additionalInfo.newDate = newDate
          additionalInfo.newTime = newTime
        }
      }

      const doctorNotificationResponse = await fetch(
        '/api/doctor-notifications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: action === 'cancel' ? 'cancellation' : 'reschedule',
            patientData: {
              patientName: fullName,
              whatsapp,
            },
            appointmentData: {
              appointmentDate: currentDate,
              appointmentTime: currentTime,
            },
            additionalInfo,
          }),
        }
      )

      const result = await doctorNotificationResponse.json()
      console.log(
        `📤 Notificações do médico (${action}):`,
        result.success ? 'Enviadas' : 'Falharam'
      )
    } catch (error) {
      console.warn(`⚠️ Erro ao notificar médico sobre ${action}:`, error)
    }

    // Manter notificação via Telegram como backup
    await sendTelegramRescheduleNotification({
      fullName,
      whatsapp,
      currentDate,
      currentTime,
      action,
      patientWhatsAppLink,
      doctorWhatsAppLink,
    })

    return NextResponse.json({
      success: true,
      message: `Reagendamento ${action} processado com sucesso`,
      action,
      patientWhatsAppLink,
      doctorWhatsAppLink,
      patientMessage: message,
      doctorMessage: doctorNotification,
    })
  } catch (error) {
    console.error('❌ Erro no sistema de reagendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateRescheduleRequestMessage(data: {
  fullName: string
  currentDate?: string
  currentTime?: string
}) {
  return (
    `🔄 *SOLICITAÇÃO DE REAGENDAMENTO*\n\n` +
    `Olá ${data.fullName}! 👋\n\n` +
    `Recebemos sua solicitação de reagendamento${data.currentDate && data.currentTime ? ` para a consulta de ${data.currentDate} às ${data.currentTime}` : ''}.\n\n` +
    `📋 *Próximos passos:*\n` +
    `1️⃣ Verificaremos a disponibilidade na agenda\n` +
    `2️⃣ Entraremos em contato com opções de horários\n` +
    `3️⃣ Confirmaremos o novo agendamento\n\n` +
    `⏱️ *Tempo de resposta:* Até 2 horas úteis\n\n` +
    `📞 *Urgente?* Ligue: (83) 9 9122-1599\n\n` +
    `Obrigado pela compreensão! 🙏`
  )
}

function generateRescheduleConfirmationMessage(data: {
  fullName: string
  currentDate?: string
  currentTime?: string
  newDate: string
  newTime: string
}) {
  return (
    `✅ *REAGENDAMENTO CONFIRMADO*\n\n` +
    `Olá ${data.fullName}! 👋\n\n` +
    `Seu reagendamento foi confirmado com sucesso:\n\n` +
    `❌ *Consulta anterior:*\n` +
    `${data.currentDate || 'Data anterior'} às ${data.currentTime || 'horário anterior'}\n\n` +
    `✅ *Nova consulta:*\n` +
    `📅 *Data:* ${data.newDate}\n` +
    `⏰ *Horário:* ${data.newTime}\n\n` +
    `👨‍⚕️ *Dr. João Vítor Viana*\n` +
    `🏥 *Coloproctologista*\n\n` +
    `📍 *Local:*\n` +
    `Edifício Arcádia, Sala 101\n` +
    `Sala 707 - Tambaú, João Pessoa - PB\n\n` +
    `⚠️ *Lembre-se:*\n` +
    `• Chegar 15 minutos antes\n` +
    `• Trazer documento com foto\n\n` +
    `📞 *Contato:* (83) 9 9122-1599\n\n` +
    `Obrigado pela confiança! 🙏`
  )
}

function generateCancellationMessage(data: {
  fullName: string
  currentDate?: string
  currentTime?: string
}) {
  return (
    `❌ *CANCELAMENTO DE CONSULTA*\n\n` +
    `Olá ${data.fullName}! 👋\n\n` +
    `Sua consulta foi cancelada conforme solicitado:\n\n` +
    `📅 *Consulta cancelada:*\n` +
    `${data.currentDate || 'Data'} às ${data.currentTime || 'horário'}\n\n` +
    `✅ *Cancelamento confirmado*\n\n` +
    `🔄 *Quer reagendar?*\n` +
    `Entre em contato quando desejar marcar uma nova consulta.\n\n` +
    `📞 *Contato:* (83) 9 9122-1599\n` +
    `💬 *WhatsApp:* Responda esta mensagem\n\n` +
    `Esperamos vê-lo em breve! 🙏`
  )
}

function generateDoctorRescheduleNotification(data: {
  fullName: string
  whatsapp: string
  currentDate?: string
  currentTime?: string
  newDate?: string
  newTime?: string
  action: string
}) {
  const baseInfo =
    `👤 *Paciente:* ${data.fullName}\n` +
    `📱 *WhatsApp:* ${data.whatsapp}\n` +
    `🕐 *Solicitado em:* ${new Date().toLocaleString('pt-BR')}\n\n`

  switch (data.action) {
    case 'request':
      return (
        `🔄 *SOLICITAÇÃO DE REAGENDAMENTO*\n\n` +
        baseInfo +
        `📅 *Consulta atual:* ${data.currentDate || 'N/A'} às ${data.currentTime || 'N/A'}\n\n` +
        `📋 *Ação necessária:*\n` +
        `• Verificar disponibilidade na agenda\n` +
        `• Oferecer opções de horários\n` +
        `• Confirmar novo agendamento`
      )

    case 'confirm':
      return (
        `✅ *REAGENDAMENTO CONFIRMADO*\n\n` +
        baseInfo +
        `❌ *Consulta anterior:* ${data.currentDate || 'N/A'} às ${data.currentTime || 'N/A'}\n` +
        `✅ *Nova consulta:* ${data.newDate} às ${data.newTime}\n\n` +
        `📋 *Atualizar:*\n` +
        `• Agenda médica\n` +
        `• Sistema de lembretes\n` +
        `• Prontuário se necessário`
      )

    case 'cancel':
      return (
        `❌ *CANCELAMENTO DE CONSULTA*\n\n` +
        baseInfo +
        `📅 *Consulta cancelada:* ${data.currentDate || 'N/A'} às ${data.currentTime || 'N/A'}\n\n` +
        `📋 *Ações:*\n` +
        `• Liberar horário na agenda\n` +
        `• Cancelar lembretes automáticos\n` +
        `• Arquivar solicitação`
      )

    default:
      return `🔄 *AÇÃO DE REAGENDAMENTO*\n\n` + baseInfo
  }
}

async function sendTelegramRescheduleNotification(data: {
  fullName: string
  whatsapp: string
  currentDate?: string
  currentTime?: string
  action: string
  patientWhatsAppLink: string
  doctorWhatsAppLink: string
}) {
  const telegramToken = process.env['TELEGRAM_BOT_TOKEN']
  const telegramChatId = process.env['TELEGRAM_CHAT_ID']

  if (!telegramToken || !telegramChatId) {
    console.log(
      'ℹ️ Telegram não configurado - pulando notificação de reagendamento'
    )
    return
  }

  try {
    const actionEmoji =
      {
        request: '🔄',
        confirm: '✅',
        cancel: '❌',
      }[data.action] || '📅'

    const telegramMessage =
      `${actionEmoji} *REAGENDAMENTO - ${data.action.toUpperCase()}*\n\n` +
      `👤 *Paciente:* ${data.fullName}\n` +
      `📱 *WhatsApp:* ${data.whatsapp}\n` +
      `📅 *Consulta:* ${data.currentDate || 'N/A'} às ${data.currentTime || 'N/A'}\n\n` +
      `🔗 *Links de ação:*\n` +
      `[📤 Responder ao paciente](${data.patientWhatsAppLink})\n` +
      `[👨‍⚕️ Ver detalhes completos](${data.doctorWhatsAppLink})`

    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: telegramMessage,
        parse_mode: 'Markdown',
      }),
    })

    console.log('✅ Notificação de reagendamento Telegram enviada!')
  } catch (error) {
    console.log('❌ Erro no reagendamento Telegram:', error)
  }
}
