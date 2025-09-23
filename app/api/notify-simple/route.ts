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

    // Formatar mensagem para WhatsApp
    const whatsappMessage =
      `🩺 *NOVA CONSULTA AGENDADA*\n\n` +
      `👤 *Paciente:* ${fullName}\n` +
      `📧 *Email:* ${email}\n` +
      `📞 *Telefone:* ${phone}\n` +
      `📱 *WhatsApp:* ${whatsapp}\n` +
      `🏥 *Plano:* ${insuranceType === 'unimed' ? 'Unimed' : 'Particular'}\n` +
      `📅 *Data:* ${selectedDate}\n` +
      `⏰ *Horário:* ${selectedTime}\n\n` +
      `✅ Agendamento confirmado pelo sistema online!`

    // Link direto para WhatsApp
    const doctorWhatsApp = process.env['DOCTOR_WHATSAPP'] || '83991221599'
    const whatsappLink = `https://wa.me/55${doctorWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`

    // Log detalhado no console
    console.log('\n' + '='.repeat(60))
    console.log('🚨 NOVA CONSULTA AGENDADA - AÇÃO NECESSÁRIA!')
    console.log('='.repeat(60))
    console.log(`👤 Paciente: ${fullName}`)
    console.log(`📧 Email: ${email}`)
    console.log(`📞 Telefone: ${phone}`)
    console.log(`📱 WhatsApp: ${whatsapp}`)
    console.log(
      `🏥 Convênio: ${insuranceType === 'unimed' ? 'Unimed' : 'Particular'}`
    )
    console.log(`📅 Data: ${selectedDate}`)
    console.log(`⏰ Horário: ${selectedTime}`)
    console.log('\n🔗 CLIQUE AQUI PARA ENVIAR WHATSAPP:')
    console.log(whatsappLink)
    console.log('\n' + '='.repeat(60))
    console.log('⚠️  COPIE O LINK ACIMA E COLE NO SEU NAVEGADOR')
    console.log('='.repeat(60) + '\n')

    // Tentar enviar notificação via Telegram (se configurado)
    const telegramToken = process.env['TELEGRAM_BOT_TOKEN']
    const telegramChatId = process.env['TELEGRAM_CHAT_ID']

    if (telegramToken && telegramChatId) {
      try {
        const telegramMessage =
          `🩺 *NOVA CONSULTA AGENDADA*\n\n` +
          `👤 *Paciente:* ${fullName}\n` +
          `📧 *Email:* ${email}\n` +
          `📞 *Telefone:* ${phone}\n` +
          `📱 *WhatsApp:* ${whatsapp}\n` +
          `🏥 *Plano:* ${insuranceType === 'unimed' ? 'Unimed' : 'Particular'}\n` +
          `📅 *Data:* ${selectedDate}\n` +
          `⏰ *Horário:* ${selectedTime}\n\n` +
          `🔗 [Clique aqui para WhatsApp](${whatsappLink})`

        await fetch(
          `https://api.telegram.org/bot${telegramToken}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: telegramMessage,
              parse_mode: 'Markdown',
            }),
          }
        )
        console.log('✅ Notificação Telegram enviada com sucesso!')
      } catch (telegramError) {
        console.log('❌ Erro no Telegram:', telegramError)
      }
    }

    // Tentar enviar notificação via webhook genérico (se configurado)
    const webhookUrl = process.env['WEBHOOK_URL']
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: `🩺 Nova consulta agendada!\n👤 ${fullName}\n📅 ${selectedDate} às ${selectedTime}\n📱 ${whatsapp}`,
            patient: fullName,
            date: selectedDate,
            time: selectedTime,
            phone: phone,
            whatsapp: whatsapp,
            email: email,
            insurance: insuranceType,
            whatsappLink: whatsappLink,
          }),
        })
        console.log('✅ Webhook genérico enviado com sucesso!')
      } catch (webhookError) {
        console.log('❌ Erro no webhook:', webhookError)
      }
    }

    // Backup dos dados
    console.log('📋 BACKUP - Dados da consulta:', {
      paciente: fullName,
      email: email,
      telefone: phone,
      whatsapp: whatsapp,
      plano: insuranceType,
      data: selectedDate,
      horario: selectedTime,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Notificação processada com sucesso',
      whatsappLink: whatsappLink,
      instructions: 'Verifique o console do servidor para o link do WhatsApp',
    })
  } catch (error) {
    console.error('❌ Erro ao processar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
