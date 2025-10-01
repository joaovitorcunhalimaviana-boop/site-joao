import { NextRequest, NextResponse } from 'next/server'

interface NotificationResponse {
  success: boolean
  message: string
  method: string
}

// Função para gerar link do WhatsApp
function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientName, appointmentDate, appointmentTime, doctorWhatsApp } = body

    if (!patientName || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Formatar a mensagem
    const message = `🏥 *Novo Agendamento*

👤 *Paciente:* ${patientName}
📅 *Data:* ${appointmentDate}
⏰ *Horário:* ${appointmentTime}

Agendamento realizado através do site.`

    let notificationResult: NotificationResponse | null = null
    let method = 'manual'

    // Gerar link do WhatsApp para notificação manual
    const whatsappLink = generateWhatsAppLink(doctorWhatsApp || '5583999999999', message)
    
    notificationResult = {
      success: true,
      message: 'Link do WhatsApp gerado com sucesso',
      method: 'manual'
    }

    console.log('✅ Link do WhatsApp gerado:', whatsappLink)

    return NextResponse.json({
      success: true,
      message: 'Notificação preparada com sucesso',
      method: method,
      whatsappLink: whatsappLink,
      details: {
        patient: patientName,
        date: appointmentDate,
        time: appointmentTime,
        notification: notificationResult
      }
    })

  } catch (error) {
    console.error('❌ Erro ao processar notificação:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
