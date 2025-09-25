import { NextRequest, NextResponse } from 'next/server'
import { formatDateTimeToBrazilian } from '@/lib/date-utils'

// Sistema aprimorado de notificações para o médico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type, // 'new_appointment', 'reminder', 'reschedule', 'cancellation'
      patientData,
      appointmentData,
    } = body

    // Validar dados obrigatórios
    if (!type || !patientData || !appointmentData) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    const notifications: Array<{
      channel: string
      status: string
      data?: any
      error?: string
    }> = []
    let success = true
    let errors: string[] = []

    // 1. Notificação via WhatsApp
    try {
      const whatsappResult = await sendWhatsAppNotification(
        type,
        patientData,
        appointmentData
      )
      notifications.push({
        channel: 'whatsapp',
        status: 'success',
        data: whatsappResult,
      })
    } catch (error) {
      success = false
      errors.push(`WhatsApp: ${error}`)
      notifications.push({
        channel: 'whatsapp',
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }

    // 2. Notificação via Telegram
    try {
      const telegramResult = await sendTelegramNotification(
        type,
        patientData,
        appointmentData
      )
      notifications.push({
        channel: 'telegram',
        status: 'success',
        data: telegramResult,
      })
    } catch (error) {
      errors.push(`Telegram: ${error}`)
      notifications.push({
        channel: 'telegram',
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }

    // 3. Notificação via Email (se configurado)
    try {
      const emailResult = await sendEmailNotification()
      notifications.push({
        channel: 'email',
        status: 'success',
        data: emailResult,
      })
    } catch (error) {
      errors.push(`Email: ${error}`)
      notifications.push({
        channel: 'email',
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      })
    }

    // 4. Log detalhado no console
    logNotificationDetails(type, patientData, appointmentData, notifications)

    return NextResponse.json({
      success,
      message: success
        ? 'Notificações enviadas com sucesso'
        : 'Algumas notificações falharam',
      notifications,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: notifications.length,
        successful: notifications.filter(n => n.status === 'success').length,
        failed: notifications.filter(n => n.status === 'error').length,
      },
    })
  } catch (error) {
    console.error('❌ Erro no sistema de notificações do médico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para enviar notificação via WhatsApp
async function sendWhatsAppNotification(
  type: string,
  patientData: any,
  appointmentData: any
): Promise<any> {
  const doctorWhatsApp = process.env['DOCTOR_WHATSAPP'] || '83991221599'
  const message = generateDoctorMessage(type, patientData, appointmentData)
  const whatsappLink = `https://wa.me/55${doctorWhatsApp}?text=${encodeURIComponent(message)}`

  return {
    whatsappLink,
    message,
    doctorPhone: doctorWhatsApp,
  }
}

// Função para enviar notificação via Telegram
async function sendTelegramNotification(
  type: string,
  patientData: any,
  appointmentData: any
): Promise<any> {
  const telegramBotToken = process.env['TELEGRAM_BOT_TOKEN']
  const telegramChatId = process.env['TELEGRAM_CHAT_ID']

  if (!telegramBotToken || !telegramChatId) {
    throw new Error('Telegram não configurado')
  }

  const message = generateTelegramMessage(type, patientData, appointmentData)

  const response = await fetch(
    `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Erro na API do Telegram: ${response.status}`)
  }

  return await response.json()
}

// Função para enviar notificação via Email
async function sendEmailNotification(): Promise<any> {
  const doctorEmail = process.env['DOCTOR_EMAIL']

  if (!doctorEmail) {
    throw new Error('Email do médico não configurado')
  }

  // Aqui você implementaria o envio de email usando nodemailer ou outro serviço
  // Por enquanto, apenas simular
  return {
    status: 'simulated',
    message: 'Email seria enviado em produção',
    to: doctorEmail,
  }
}

// Função para gerar mensagem para o médico
function generateDoctorMessage(
  type: string,
  patientData: any,
  appointmentData: any
): string {
  const typeEmojis = {
    new_appointment: '🆕',
    reminder: '⏰',
    reschedule: '📅',
    cancellation: '❌',
  }

  const typeTexts = {
    new_appointment: 'NOVA CONSULTA AGENDADA',
    reminder: 'LEMBRETE DE CONSULTA',
    reschedule: 'REAGENDAMENTO SOLICITADO',
    cancellation: 'CONSULTA CANCELADA',
  }

  const emoji = typeEmojis[type as keyof typeof typeEmojis] || '📋'
  const typeText = typeTexts[type as keyof typeof typeTexts] || 'NOTIFICAÇÃO'

  let message = `${emoji} *${typeText}*\n\n`

  message += `👤 *Paciente:* ${patientData.fullName || patientData.patientName}\n`
  message += `📱 *WhatsApp:* ${patientData.whatsapp}\n`

  if (patientData.email) {
    message += `📧 *Email:* ${patientData.email}\n`
  }

  if (patientData.phone && patientData.phone !== patientData.whatsapp) {
    message += `☎️ *Telefone:* ${patientData.phone}\n`
  }

  message += `\n📅 *Data:* ${appointmentData.selectedDate || appointmentData.appointmentDate}\n`
  message += `⏰ *Horário:* ${appointmentData.selectedTime || appointmentData.appointmentTime}\n`

  if (patientData.insuranceType) {
    message += `💳 *Atendimento:* ${patientData.insuranceType === 'unimed' ? 'Unimed' : 'Particular'}\n`
  }

  if (type === 'reminder') {
    message += `\n⏰ *Lembrete:* consulta agendada\n`
  }

  message += `\n🏥 *Consultório:*\n`
  message += `Edifício Arcádia, Sala 101\n`
  message += `Avenida Rui Barbosa, 484\n`
  message += `Sala 707 - Tambaú, João Pessoa - PB\n`

  message += `\n⏰ *Enviado em:* ${formatDateTimeToBrazilian(new Date())}\n`

  return message
}

// Função para gerar mensagem do Telegram (formato HTML)
function generateTelegramMessage(
  type: string,
  patientData: any,
  appointmentData: any
): string {
  const typeEmojis = {
    new_appointment: '🆕',
    reminder: '⏰',
    reschedule: '📅',
    cancellation: '❌',
  }

  const typeTexts = {
    new_appointment: 'NOVA CONSULTA AGENDADA',
    reminder: 'LEMBRETE DE CONSULTA',
    reschedule: 'REAGENDAMENTO SOLICITADO',
    cancellation: 'CONSULTA CANCELADA',
  }

  const emoji = typeEmojis[type as keyof typeof typeEmojis] || '📋'
  const typeText = typeTexts[type as keyof typeof typeTexts] || 'NOTIFICAÇÃO'

  let message = `${emoji} <b>${typeText}</b>\n\n`

  message += `👤 <b>Paciente:</b> ${patientData.fullName || patientData.patientName}\n`
  message += `📱 <b>WhatsApp:</b> ${patientData.whatsapp}\n`

  if (patientData.email) {
    message += `📧 <b>Email:</b> ${patientData.email}\n`
  }

  message += `\n📅 <b>Data:</b> ${appointmentData.selectedDate || appointmentData.appointmentDate}\n`
  message += `⏰ <b>Horário:</b> ${appointmentData.selectedTime || appointmentData.appointmentTime}\n`

  if (patientData.insuranceType) {
    message += `💳 <b>Atendimento:</b> ${patientData.insuranceType === 'unimed' ? 'Unimed' : 'Particular'}\n`
  }

  message += `\n⏰ <b>Enviado em:</b> ${formatDateTimeToBrazilian(new Date())}\n`

  return message
}

// Função para log detalhado
function logNotificationDetails(
  type: string,
  patientData: any,
  appointmentData: any,
  notifications: any[]
): void {
  console.log('\n' + '='.repeat(80))
  console.log('🩺 SISTEMA DE NOTIFICAÇÕES DO MÉDICO')
  console.log('='.repeat(80))
  console.log(`📋 Tipo: ${type.toUpperCase()}`)
  console.log(`👤 Paciente: ${patientData.fullName || patientData.patientName}`)
  console.log(
    `📅 Consulta: ${appointmentData.selectedDate || appointmentData.appointmentDate} às ${appointmentData.selectedTime || appointmentData.appointmentTime}`
  )
  console.log(`📱 WhatsApp: ${patientData.whatsapp}`)

  console.log('\n📤 CANAIS DE NOTIFICAÇÃO:')
  notifications.forEach((notification, index) => {
    const status = notification.status === 'success' ? '✅' : '❌'
    console.log(
      `${index + 1}️⃣ ${status} ${notification.channel.toUpperCase()}: ${notification.status}`
    )

    if (notification.status === 'success' && notification.data?.whatsappLink) {
      console.log(`   🔗 Link: ${notification.data.whatsappLink}`)
    }

    if (notification.status === 'error') {
      console.log(`   ⚠️ Erro: ${notification.error}`)
    }
  })

  console.log('='.repeat(80) + '\n')
}
