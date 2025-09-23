import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface NotificationData {
  fullName: string
  email: string
  whatsapp: string
  insuranceType: 'unimed' | 'particular'
  selectedDate: string
  selectedTime: string
}

export async function POST(request: NextRequest) {
  try {
    const data: NotificationData = await request.json()

    // Validar dados recebidos
    if (
      !data.fullName ||
      !data.email ||
      !data.whatsapp ||
      !data.selectedDate ||
      !data.selectedTime
    ) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Configurar transporter do email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASSWORD'], // App Password do Gmail
      },
    })

    // Formatar email HTML
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
          .footer { background: #1e293b; color: white; padding: 15px; border-radius: 0 0 8px 8px; }
          .info-row { margin: 10px 0; padding: 8px; background: white; border-radius: 4px; }
          .label { font-weight: bold; color: #1e40af; }
          .whatsapp-btn { 
            display: inline-block; 
            background: #25d366; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Nova Consulta Agendada</h1>
            <p>Dr. ${process.env['DOCTOR_NAME'] || 'João Vítor Viana'} - ${process.env['DOCTOR_SPECIALTY'] || 'Coloproctologista'}</p>
          </div>
          
          <div class="content">
            <div class="info-row">
              <span class="label">👤 Paciente:</span> ${data.fullName}
            </div>
            <div class="info-row">
              <span class="label">📅 Data:</span> ${data.selectedDate}
            </div>
            <div class="info-row">
              <span class="label">🕐 Horário:</span> ${data.selectedTime}
            </div>
            <div class="info-row">
              <span class="label">📧 Email:</span> ${data.email}
            </div>
            <div class="info-row">
              <span class="label">📱 WhatsApp:</span> ${data.whatsapp}
            </div>
            <div class="info-row">
              <span class="label">💳 Plano:</span> ${data.insuranceType === 'unimed' ? 'Unimed' : 'Particular'}
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://wa.me/55${process.env['DOCTOR_WHATSAPP']?.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(data.fullName)},%20sua%20consulta%20está%20confirmada%20para%20${encodeURIComponent(data.selectedDate)}%20às%20${encodeURIComponent(data.selectedTime)}." 
                 class="whatsapp-btn" target="_blank">
                📱 Confirmar via WhatsApp
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>✅ Agendamento confirmado automaticamente pelo sistema online.</p>
            <p><small>Recebido em: ${new Date().toLocaleString('pt-BR')}</small></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Configurar email
    const mailOptions = {
      from: process.env['EMAIL_USER'],
      to: process.env['DOCTOR_EMAIL'] || process.env['EMAIL_USER'],
      subject: `🏥 Nova Consulta: ${data.fullName} - ${data.selectedDate} às ${data.selectedTime}`,
      html: emailHtml,
      text: `
NOVA CONSULTA AGENDADA

👤 Paciente: ${data.fullName}
📅 Data: ${data.selectedDate}
🕐 Horário: ${data.selectedTime}
📧 Email: ${data.email}
📱 WhatsApp: ${data.whatsapp}
💳 Plano: ${data.insuranceType === 'unimed' ? 'Unimed' : 'Particular'}

✅ Agendamento confirmado pelo sistema online.
      `,
    }

    // Enviar email
    console.log('📧 Enviando notificação por email...')
    console.log('Para:', mailOptions.to)
    console.log('Assunto:', mailOptions.subject)

    if (process.env['EMAIL_USER'] && process.env['EMAIL_PASSWORD']) {
      try {
        await transporter.sendMail(mailOptions)
        console.log('✅ Email enviado com sucesso!')

        return NextResponse.json({
          success: true,
          message: 'Notificação enviada por email com sucesso',
          method: 'email',
          sentTo: mailOptions.to,
        })
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError)
        return NextResponse.json(
          {
            success: false,
            message: 'Erro ao enviar email. Verifique as configurações.',
            error:
              emailError instanceof Error
                ? emailError.message
                : 'Erro desconhecido',
          },
          { status: 500 }
        )
      }
    } else {
      console.log('⚠️ Credenciais de email não configuradas')
      return NextResponse.json(
        {
          success: false,
          message:
            'Credenciais de email não configuradas. Configure EMAIL_USER e EMAIL_PASSWORD no .env.local',
          requiresSetup: true,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('❌ Erro na API de email:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
