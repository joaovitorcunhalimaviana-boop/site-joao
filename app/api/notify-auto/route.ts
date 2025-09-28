import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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

    // Configuração automática para diferentes provedores
    const doctorEmail =
      process.env['DOCTOR_EMAIL'] || 'joaovitorvianacolo@gmail.com'
    let transporter
    let emailSent = false

    // Tentar diferentes configurações de email
    const emailConfigs = [
      {
        name: 'Gmail (App Password)',
        service: 'gmail',
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASSWORD'],
      },
      {
        name: 'Outlook/Hotmail',
        service: 'outlook',
        user: process.env['OUTLOOK_USER'] || process.env['EMAIL_USER'],
        pass: process.env['OUTLOOK_PASSWORD'] || process.env['EMAIL_PASSWORD'],
      },
      {
        name: 'Yahoo',
        service: 'yahoo',
        user: process.env['YAHOO_USER'],
        pass: process.env['YAHOO_PASSWORD'],
      },
    ]

    // Tentar enviar email com diferentes configurações
    for (const config of emailConfigs) {
      if (!config.user || !config.pass) continue

      try {
        transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: false, // Use STARTTLS
          auth: {
            user: config.user,
            pass: config.pass,
          },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 60000, // 60 seconds
          greetingTimeout: 30000, // 30 seconds
          socketTimeout: 60000, // 60 seconds
        })

        const whatsappLink = `https://wa.me/5583991221599?text=${encodeURIComponent(
          `Olá Dr. João! Gostaria de confirmar meu agendamento:\n\n` +
            `👤 Nome: ${fullName}\n` +
            `📞 Telefone: ${phone}\n` +
            `📅 Data: ${selectedDate}\n` +
            `⏰ Horário: ${selectedTime}\n` +
            `🏥 Convênio: ${insuranceType || 'Particular'}`
        )}`

        const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
            .footer { background: #1e293b; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; }
            .info-row { margin: 10px 0; padding: 8px; background: white; border-radius: 4px; }
            .whatsapp-btn { display: inline-block; background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
            .urgent { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🏥 Novo Agendamento Recebido</h2>
              <p class="urgent">⚠️ AÇÃO NECESSÁRIA - Confirmar com paciente</p>
            </div>
            
            <div class="content">
              <h3>📋 Detalhes do Agendamento:</h3>
              
              <div class="info-row">
                <strong>👤 Paciente:</strong> ${fullName}
              </div>
              
              <div class="info-row">
                <strong>📧 Email:</strong> ${email || 'Não informado'}
              </div>
              
              <div class="info-row">
                <strong>📞 Telefone:</strong> ${phone || 'Não informado'}
              </div>
              
              <div class="info-row">
                <strong>📱 WhatsApp:</strong> ${whatsapp || 'Não informado'}
              </div>
              
              <div class="info-row">
                <strong>🏥 Convênio:</strong> ${insuranceType || 'Particular'}
              </div>
              
              <div class="info-row">
                <strong>📅 Data:</strong> ${selectedDate}
              </div>
              
              <div class="info-row">
                <strong>⏰ Horário:</strong> ${selectedTime}
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${whatsappLink}" class="whatsapp-btn">
                  💬 Confirmar via WhatsApp
                </a>
              </div>
              
              <p><strong>📝 Próximos passos:</strong></p>
              <ol>
                <li>Clique no botão WhatsApp acima</li>
                <li>A mensagem será aberta automaticamente</li>
                <li>Envie para confirmar o agendamento</li>
                <li>Paciente receberá confirmação instantânea</li>
              </ol>
            </div>
            
            <div class="footer">
              <p>Sistema de Agendamento Automático</p>
              <p>📧 Email enviado automaticamente - Não responder</p>
            </div>
          </div>
        </body>
        </html>
        `

        await transporter.sendMail({
          from: `"Sistema Agendamento" <${config.user}>`,
          to: doctorEmail,
          subject: `🏥 NOVO AGENDAMENTO: ${fullName} - ${selectedDate} às ${selectedTime}`,
          html: emailHtml,
        })

        console.log(`✅ Email enviado via ${config.name} para: ${doctorEmail}`)
        emailSent = true
        break
      } catch (emailError) {
        console.log(
          `❌ Falha com ${config.name}:`,
          emailError instanceof Error ? emailError.message : String(emailError)
        )
        continue
      }
    }

    // Log detalhado no console (backup)
    const logMessage =
      `\n${'='.repeat(60)}\n` +
      `📱 NOTIFICAÇÃO AUTOMÁTICA DE AGENDAMENTO\n` +
      `${'='.repeat(60)}\n` +
      `👤 Paciente: ${fullName}\n` +
      `📧 Email: ${email || 'Não informado'}\n` +
      `📱 WhatsApp: ${whatsapp || 'Não informado'}\n` +
      `🏥 Convênio: ${insuranceType || 'Particular'}\n` +
      `📅 Data: ${selectedDate}\n` +
      `⏰ Horário: ${selectedTime}\n\n` +
      `💬 Link WhatsApp Direto:\n` +
      `https://wa.me/5583991221599?text=${encodeURIComponent(
        `Olá Dr. João! Gostaria de confirmar meu agendamento:\n\n` +
          `👤 Nome: ${fullName}\n` +
          `📅 Data: ${selectedDate}\n` +
          `⏰ Horário: ${selectedTime}\n` +
          `🏥 Convênio: ${insuranceType || 'Particular'}`
      )}\n` +
      `${'='.repeat(60)}\n`

    console.log(logMessage)

    // Backup detalhado dos dados
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
      message: emailSent
        ? 'Email enviado automaticamente!'
        : 'Notificação registrada (configurar email para automação)',
      emailSent,
      whatsappLink: `https://wa.me/5583991221599?text=${encodeURIComponent(
        `Olá Dr. João! Gostaria de confirmar meu agendamento:\n\n` +
          `👤 Nome: ${fullName}\n` +
          `📅 Data: ${selectedDate}\n` +
          `⏰ Horário: ${selectedTime}\n` +
          `🏥 Convênio: ${insuranceType || 'Particular'}`
      )}`,
    })
  } catch (error) {
    console.error('❌ Erro na API de notificação automática:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
