import { NextRequest, NextResponse } from 'next/server'
import { formatDateTimeToBrazilian } from '@/lib/date-utils'

// Cache para mensagens geradas recentemente
const messageCache = new Map<string, any>()
const CACHE_TTL = 60000 // 1 minuto

function getCacheKey(data: any): string {
  return `${data.fullName}-${data.selectedDate}-${data.selectedTime}`
}

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

    // Verificar cache para mensagens já geradas
    const cacheKey = getCacheKey({ fullName, selectedDate, selectedTime })
    const cached = messageCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('📦 Retornando mensagens do cache para:', fullName)
      return NextResponse.json(cached.data)
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

    // Log otimizado (menos verboso)
    console.log(
      `🩺 WhatsApp confirmação: ${fullName} - ${selectedDate} ${selectedTime}`
    )

    // Notificação via Telegram removida para evitar duplicação
    // A notificação principal já é enviada pelo sistema unificado

    const response = {
      success: true,
      message: 'Sistema de confirmação WhatsApp ativado',
      patientWhatsAppLink,
      doctorWhatsAppLink,
      patientMessage,
      doctorMessage,
    }

    // Cachear resultado
    messageCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    })

    // Limpar cache antigo periodicamente
    if (messageCache.size > 100) {
      const now = Date.now()
      for (const [key, value] of messageCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          messageCache.delete(key)
        }
      }
    }

    return NextResponse.json(response)
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
    `🕐 *Agendado em:* ${formatDateTimeToBrazilian(new Date())}\n\n` +
    `📋 *Próximas ações:*\n` +
    `• Confirmar disponibilidade na agenda\n` +
    `• Enviar lembrete 24h antes\n` +
    `• Preparar prontuário se necessário`
  )
}

// Função sendTelegramNotification removida para evitar mensagens duplicadas
// A notificação principal já é enviada pelo sistema unificado de pacientes
