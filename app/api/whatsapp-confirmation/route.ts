import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      whatsapp,
      insuranceType,
      selectedDate,
      selectedTime,
    } = body

    // Validar dados obrigatórios
    if (
      !fullName ||
      !email ||
      !phone ||
      !whatsapp ||
      !insuranceType ||
      !selectedDate ||
      !selectedTime
    ) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar mensagem de confirmação para o paciente
    const patientMessage = generatePatientConfirmationMessage({
      fullName,
      selectedDate,
      selectedTime,
      insuranceType,
    })

    // Gerar mensagem de notificação para o médico
    const doctorMessage = generateDoctorNotificationMessage({
      fullName,
      email,
      phone,
      whatsapp,
      insuranceType,
      selectedDate,
      selectedTime,
    })

    // Links WhatsApp
    const patientWhatsApp = whatsapp.replace(/\D/g, '') // Remove formatação
    const doctorWhatsApp = process.env['DOCTOR_WHATSAPP'] || '83991221599'

    const patientWhatsAppLink = `https://wa.me/55${patientWhatsApp}?text=${encodeURIComponent(patientMessage)}`
    const doctorWhatsAppLink = `https://wa.me/55${doctorWhatsApp}?text=${encodeURIComponent(doctorMessage)}`

    // Log detalhado
    console.log('\n' + '='.repeat(80))
    console.log('🩺 SISTEMA DE CONFIRMAÇÃO WHATSAPP ATIVADO')
    console.log('='.repeat(80))
    console.log(`👤 Paciente: ${fullName}`)
    console.log(`📅 Consulta: ${selectedDate} às ${selectedTime}`)
    console.log(`📱 WhatsApp: ${whatsapp}`)
    console.log('\n📋 AÇÕES NECESSÁRIAS:')
    console.log('1️⃣ ENVIAR CONFIRMAÇÃO PARA O PACIENTE:')
    console.log(patientWhatsAppLink)
    console.log('\n2️⃣ NOTIFICAR O MÉDICO:')
    console.log(doctorWhatsAppLink)
    console.log('='.repeat(80) + '\n')

    // REMOVIDO: Notificação duplicada do Telegram
    // A notificação principal já é enviada pelo sistema unificado de agendamentos
    // await sendTelegramNotification(...)

    return NextResponse.json({
      success: true,
      message: 'Sistema de confirmação WhatsApp ativado',
      patientWhatsAppLink,
      doctorWhatsAppLink,
      patientMessage,
      doctorMessage,
    })
  } catch (error) {
    console.error('❌ Erro no sistema de confirmação WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generatePatientConfirmationMessage(data: {
  fullName: string
  selectedDate: string
  selectedTime: string
  insuranceType: string
}) {
  return (
    `🩺 *CONFIRMAÇÃO DE CONSULTA*\n\n` +
    `Olá ${data.fullName}! 👋\n\n` +
    `✅ Sua consulta foi agendada com sucesso:\n\n` +
    `👨‍⚕️ *Médico:* Dr. João Vítor Viana\n` +
    `🏥 *Especialidade:* Coloproctologia\n` +
    `📅 *Data:* ${data.selectedDate}\n` +
    `⏰ *Horário:* ${data.selectedTime}\n` +
    `💳 *Atendimento:* ${data.insuranceType === 'unimed' ? 'Unimed' : 'Particular'}\n\n` +
    `📍 *Endereço do Consultório:*\n` +
    `Avenida Rui Barbosa, 484\n` +
    `Edifício Arcádia, Sala 101\n` +
    `Torre - João Pessoa - PB\n\n` +
    `⚠️ *IMPORTANTE:*\n` +
    `• Chegue 15 minutos antes\n` +
    `• Traga documento com foto\n` +
    `• ${data.insuranceType === 'unimed' ? 'Traga carteirinha da Unimed' : 'Traga documento com foto'}\n\n` +
    `📞 *Dúvidas?* Entre em contato:\n` +
    `WhatsApp: (83) 9 9122-1599\n\n` +
    `🔄 *Precisa reagendar?* Responda esta mensagem.\n\n` +
    `Obrigado pela confiança! 🙏`
  )
}

function generateDoctorNotificationMessage(data: {
  fullName: string
  email: string
  phone: string
  whatsapp: string
  insuranceType: string
  selectedDate: string
  selectedTime: string
}) {
  return (
    `🚨 *NOVA CONSULTA AGENDADA*\n\n` +
    `👤 *Paciente:* ${data.fullName}\n` +
    `📧 *Email:* ${data.email}\n` +
    `📞 *Telefone:* ${data.phone}\n` +
    `📱 *WhatsApp:* ${data.whatsapp}\n` +
    `💳 *Plano:* ${data.insuranceType === 'unimed' ? 'Unimed' : 'Particular'}\n` +
    `📅 *Data:* ${data.selectedDate}\n` +
    `⏰ *Horário:* ${data.selectedTime}\n\n` +
    `✅ *Status:* Confirmação enviada ao paciente\n` +
    `🕐 *Agendado em:* ${new Date().toLocaleString('pt-BR')}\n\n` +
    `📋 *Próximas ações:*\n` +
    `• Confirmar disponibilidade na agenda\n` +
    `• Enviar lembrete 24h antes\n` +
    `• Preparar prontuário se necessário`
  )
}

async function sendTelegramNotification(data: {
  fullName: string
  selectedDate: string
  selectedTime: string
  whatsapp: string
  patientWhatsAppLink: string
  doctorWhatsAppLink: string
}) {
  const telegramToken = process.env['TELEGRAM_BOT_TOKEN']
  const telegramChatId = process.env['TELEGRAM_CHAT_ID']

  if (!telegramToken || !telegramChatId) {
    console.log('ℹ️ Telegram não configurado - pulando notificação')
    return
  }

  try {
    const telegramMessage =
      `🩺 *NOVA CONSULTA AGENDADA*\n\n` +
      `👤 *Paciente:* ${data.fullName}\n` +
      `📅 *Data:* ${data.selectedDate}\n` +
      `⏰ *Horário:* ${data.selectedTime}\n` +
      `📱 *WhatsApp:* ${data.whatsapp}\n\n` +
      `🔗 *Links de ação:*\n` +
      `[📤 Confirmar com paciente](${data.patientWhatsAppLink})\n` +
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

    console.log('✅ Notificação Telegram enviada com sucesso!')
  } catch (error) {
    console.log('❌ Erro no Telegram:', error)
  }
}
