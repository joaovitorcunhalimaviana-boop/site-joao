import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

interface NotificationEmailData {
  doctorEmail: string
  patientName: string
  appointmentDate: string
  appointmentTime: string
  notificationType: 'new_appointment' | 'appointment_change' | 'appointment_cancellation' | 'reminder'
  additionalInfo?: string
}

function getNotificationEmailTemplate(data: NotificationEmailData) {
  const { patientName, appointmentDate, appointmentTime, notificationType, additionalInfo } = data

  let subject = ''
  let title = ''
  let message = ''
  let color = '#1e3a8a'

  switch (notificationType) {
    case 'new_appointment':
      subject = `Nova consulta agendada - ${patientName}`
      title = '📅 Nova Consulta Agendada'
      message = `Uma nova consulta foi agendada para o paciente <strong>${patientName}</strong>.`
      color = '#059669'
      break
    case 'appointment_change':
      subject = `Consulta reagendada - ${patientName}`
      title = '🔄 Consulta Reagendada'
      message = `A consulta do paciente <strong>${patientName}</strong> foi reagendada.`
      color = '#d97706'
      break
    case 'appointment_cancellation':
      subject = `Consulta cancelada - ${patientName}`
      title = '❌ Consulta Cancelada'
      message = `A consulta do paciente <strong>${patientName}</strong> foi cancelada.`
      color = '#dc2626'
      break
    case 'reminder':
      subject = `Lembrete de consulta - ${patientName}`
      title = '⏰ Lembrete de Consulta'
      message = `Lembrete: consulta com o paciente <strong>${patientName}</strong> está próxima.`
      color = '#7c3aed'
      break
  }

  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #000000;">
        <div style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937;">${message}</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid ${color};">
            <h3 style="color: ${color}; margin-top: 0;">Detalhes da Consulta</h3>
            <p style="margin: 5px 0; color: #1f2937;"><strong>Paciente:</strong> ${patientName}</p>
            <p style="margin: 5px 0; color: #1f2937;"><strong>Data:</strong> ${appointmentDate}</p>
            <p style="margin: 5px 0; color: #1f2937;"><strong>Horário:</strong> ${appointmentTime}</p>
            ${additionalInfo ? `<p style="margin: 5px 0; color: #1f2937;"><strong>Informações adicionais:</strong> ${additionalInfo}</p>` : ''}
          </div>
          
          <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937;">
            Esta é uma notificação automática do sistema de agendamentos.
          </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Sistema de Agendamentos - Dr. João Vitor Viana<br>
            Este é um email automático. Por favor, não responda diretamente a esta mensagem.
          </p>
        </div>
      </div>
    `
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      doctorEmail,
      patientName,
      appointmentDate,
      appointmentTime,
      notificationType,
      additionalInfo
    }: NotificationEmailData = body

    if (!doctorEmail || !patientName || !appointmentDate || !appointmentTime || !notificationType) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

    const emailTemplate = getNotificationEmailTemplate({
      doctorEmail,
      patientName,
      appointmentDate,
      appointmentTime,
      notificationType,
      additionalInfo
    })

    // Enviar email
    const mailOptions = {
      from: `"Sistema de Agendamentos" <${process.env.EMAIL_USER}>`,
      to: doctorEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    }

    await transporter.sendMail(mailOptions)

    console.log(`📧 Email de notificação enviado para: ${doctorEmail} - ${notificationType}`)

    return NextResponse.json({
      success: true,
      message: 'Email de notificação enviado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao enviar email de notificação:', error)

    return NextResponse.json(
      { error: 'Erro interno do servidor ao enviar email' },
      { status: 500 }
    )
  }
}