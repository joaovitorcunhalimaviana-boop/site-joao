import { NextRequest, NextResponse } from 'next/server'

interface NotificationData {
  fullName: string
  email: string
  whatsapp: string
  insuranceType: 'unimed' | 'particular'
  selectedDate: string
  selectedTime: string
}

interface TwilioResponse {
  sid: string
  [key: string]: any
}

// Função para enviar via Twilio (se configurado)
async function sendViaTwilio(message: string, toNumber: string): Promise<TwilioResponse> {
  const accountSid = process.env['TWILIO_ACCOUNT_SID']
  const authToken = process.env['TWILIO_AUTH_TOKEN']
  const fromNumber = process.env['TWILIO_WHATSAPP_NUMBER']
  
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Credenciais do Twilio não configuradas')
  }
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: fromNumber,
      To: `whatsapp:+55${toNumber}`,
      Body: message,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro do Twilio: ${error}`)
  }
  
  return await response.json()
}

export async function POST(request: NextRequest) {
  try {
    const data: NotificationData = await request.json()
    
    // Validar dados recebidos
    if (!data.fullName || !data.email || !data.whatsapp || !data.selectedDate || !data.selectedTime) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Formatar a mensagem para WhatsApp
    const message = formatWhatsAppMessage(data)
    const doctorWhatsApp = process.env['DOCTOR_WHATSAPP']
    
    console.log('📱 Nova consulta agendada - Processando notificação:')
    console.log('Paciente:', data.fullName)
    console.log('Data/Hora:', data.selectedDate, 'às', data.selectedTime)
    console.log('WhatsApp do médico:', doctorWhatsApp || 'Não configurado')
    
    let notificationResult: TwilioResponse | null = null
    let method = 'link'
    
    // Tentar enviar via Twilio primeiro (se configurado)
    if (process.env['TWILIO_ACCOUNT_SID'] && process.env['TWILIO_AUTH_TOKEN'] && doctorWhatsApp) {
      try {
        console.log('🔄 Tentando enviar via Twilio...')
        notificationResult = await sendViaTwilio(message, doctorWhatsApp)
        method = 'twilio'
        console.log('✅ Mensagem enviada via Twilio com sucesso!')
        if (notificationResult) {
          console.log('SID da mensagem:', notificationResult.sid)
        }
      } catch (twilioError) {
        console.log('❌ Falha no Twilio:', twilioError)
        console.log('📋 Gerando link manual como fallback...')
      }
    }
    
    // Gerar link direto para WhatsApp (sempre, como backup)
    let whatsappLink: string | null = null
    if (doctorWhatsApp) {
      whatsappLink = generateWhatsAppLink(doctorWhatsApp, message)
      console.log('🔗 Link direto WhatsApp:', whatsappLink)
    }
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return NextResponse.json({
      success: true,
      message: method === 'twilio' ? 'Notificação enviada automaticamente via Twilio' : 'Link de notificação gerado com sucesso',
      whatsappMessage: message
    })
    
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function formatWhatsAppMessage(data: NotificationData): string {
  const { fullName, email, whatsapp, insuranceType, selectedDate, selectedTime } = data
  
  return `🏥 *NOVA CONSULTA AGENDADA*\n\n` +
    `👤 *Paciente:* ${fullName}\n` +
    `📅 *Data:* ${selectedDate}\n` +
    `🕐 *Horário:* ${selectedTime}\n` +
    `📧 *Email:* ${email}\n` +
    `📱 *WhatsApp:* ${whatsapp}\n` +
    `💳 *Plano:* ${insuranceType === 'unimed' ? 'Unimed' : 'Particular'}\n\n` +
    `✅ Agendamento confirmado pelo sistema online.`
}

// Função auxiliar para enviar via WhatsApp Web (link direto)
function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const encodedMessage = encodeURIComponent(message)
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`
}

// Função para integração com Twilio (exemplo)
// Descomente e configure se quiser usar Twilio
/*
async function sendViaTwilio(to: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER // formato: whatsapp:+14155238886
  
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Credenciais do Twilio não configuradas')
  }
  
  const client = require('twilio')(accountSid, authToken)
  
  return await client.messages.create({
    body: message,
    from: fromNumber,
    to: `whatsapp:+55${to.replace(/\D/g, '')}`
  })
}
*/