// Sistema de Notificações de Cirurgia
// Notificações de véspera e follow-ups pós-operatórios via Telegram

import {
  loadNotificationConfig,
  isTelegramConfigured,
  withRetry,
  checkNotificationRateLimit,
  logNotification,
  handleNotificationError,
  sanitizeWhatsApp,
} from './notification-utils'

export interface SurgeryNotificationData {
  patientName: string
  patientWhatsapp: string
  surgeryDate: string // YYYY-MM-DD
  surgeryTime: string // HH:MM
  surgeryType: string
  surgeon: string
  hospital: string
  notes?: string
}

export interface PostOpFollowUpData {
  patientName: string
  patientWhatsapp: string
  surgeryDate: string
  surgeryType: string
  followUpDay: number // 1, 4, 7, 14
  painScaleRequired?: boolean
}

/**
 * Formatar data para exibição brasileira
 */
function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Gerar link do WhatsApp para confirmação de cirurgia
 */
function generateSurgeryWhatsAppLink(
  whatsapp: string,
  patientName: string,
  surgeryDate: string,
  surgeryTime: string,
  doctorName: string
): string {
  const message = encodeURIComponent(
    `Olá ${patientName}! 👋\n\n` +
    `Este é um lembrete da sua cirurgia agendada para:\n` +
    `📅 ${surgeryDate}\n` +
    `⏰ ${surgeryTime}\n\n` +
    `Por favor, confirme sua presença respondendo esta mensagem.\n\n` +
    `Atenciosamente,\n${doctorName}`
  )
  return `https://wa.me/${whatsapp}?text=${message}`
}

/**
 * Gerar link do WhatsApp para follow-up pós-operatório
 */
function generateFollowUpWhatsAppLink(
  whatsapp: string,
  patientName: string,
  followUpDay: number,
  surgeryType: string
): string {
  const dayMessages = {
    1: 'primeiro dia após a cirurgia',
    4: 'quarto dia após a cirurgia',
    7: 'uma semana após a cirurgia',
    14: 'duas semanas após a cirurgia'
  }

  const message = encodeURIComponent(
    `Olá ${patientName}! 👋\n\n` +
    `Como você está se sentindo no ${dayMessages[followUpDay as keyof typeof dayMessages]}?\n\n` +
    `Por favor, nos informe:\n` +
    `• Como está sua dor (0-10)?\n` +
    `• Há algum sangramento?\n` +
    `• Funcionamento intestinal normal?\n` +
    `• Alguma preocupação?\n\n` +
    `Sua recuperação é importante para nós! 🏥`
  )
  return `https://wa.me/${whatsapp}?text=${message}`
}

/**
 * Enviar notificação de véspera de cirurgia via Telegram
 */
export async function sendSurgeryReminderNotification(
  surgeryData: SurgeryNotificationData
): Promise<{ success: boolean; error?: string }> {
  const config = loadNotificationConfig()

  // Validar configuração
  if (!isTelegramConfigured(config)) {
    await logNotification({
      level: 'WARN',
      channel: 'telegram',
      notificationType: 'surgery_reminder',
      message: 'Telegram não configurado - notificação de cirurgia não enviada',
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Telegram não configurado' }
  }

  // Verificar rate limit
  const rateLimitCheck = checkNotificationRateLimit('telegram_surgery', 5)
  if (!rateLimitCheck.allowed) {
    await logNotification({
      level: 'WARN',
      channel: 'telegram',
      notificationType: 'surgery_reminder',
      message: `Rate limit excedido. Tente novamente em ${rateLimitCheck.retryAfter}s`,
      timestamp: new Date().toISOString(),
    })
    return {
      success: false,
      error: `Rate limit excedido. Aguarde ${rateLimitCheck.retryAfter} segundos`,
    }
  }

  try {
    // Formatar data para exibição
    const formattedDate = formatDateForDisplay(surgeryData.surgeryDate)

    // Gerar link do WhatsApp
    const sanitizedWhatsApp = sanitizeWhatsApp(surgeryData.patientWhatsapp)
    const whatsappLink = generateSurgeryWhatsAppLink(
      sanitizedWhatsApp,
      surgeryData.patientName,
      formattedDate,
      surgeryData.surgeryTime,
      config.doctorName
    )

    // Criar mensagem do Telegram
    const telegramMessage =
      `🏥 *LEMBRETE DE CIRURGIA - VÉSPERA*\n\n` +
      `👤 *Paciente:* ${surgeryData.patientName}\n` +
      `📱 *WhatsApp:* ${surgeryData.patientWhatsapp}\n` +
      `📅 *Data:* ${formattedDate}\n` +
      `⏰ *Horário:* ${surgeryData.surgeryTime}\n` +
      `🔬 *Tipo:* ${surgeryData.surgeryType}\n` +
      `👨‍⚕️ *Cirurgião:* ${surgeryData.surgeon}\n` +
      `🏥 *Hospital:* ${surgeryData.hospital}\n` +
      (surgeryData.notes ? `📝 *Observações:* ${surgeryData.notes}\n` : '') +
      `\n🔗 [📱 Confirmar via WhatsApp](${whatsappLink})\n\n` +
      `⚠️ *Lembrete:* Cirurgia agendada para amanhã!`

    // Enviar mensagem via API do Telegram
    await withRetry(
      async () => {
        const response = await fetch(
          `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              chat_id: config.telegramChatId,
              text: telegramMessage,
              parse_mode: 'Markdown',
              disable_web_page_preview: false,
            }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            `Erro na API do Telegram: ${response.status} - ${JSON.stringify(errorData)}`
          )
        }

        return response
      },
      {
        maxAttempts: config.retryAttempts || 3,
        delayMs: config.retryDelay || 2000,
        onRetry: (attempt, error) => {
          console.warn(
            `⚠️ Tentativa ${attempt} de enviar notificação de cirurgia falhou:`,
            error.message
          )
        },
      }
    )

    await logNotification({
      level: 'SUCCESS',
      channel: 'telegram',
      notificationType: 'surgery_reminder',
      recipient: config.telegramChatId,
      message: 'Notificação de véspera de cirurgia enviada com sucesso',
      metadata: {
        patientName: surgeryData.patientName,
        surgeryDate: surgeryData.surgeryDate,
        surgeryTime: surgeryData.surgeryTime,
        surgeryType: surgeryData.surgeryType,
      },
      timestamp: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    await handleNotificationError(
      error instanceof Error ? error : new Error(String(error)),
      {
        channel: 'telegram',
        notificationType: 'surgery_reminder',
        recipient: config.telegramChatId,
      }
    )

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Enviar notificação de follow-up pós-operatório via Telegram
 */
export async function sendPostOpFollowUpNotification(
  followUpData: PostOpFollowUpData
): Promise<{ success: boolean; error?: string }> {
  const config = loadNotificationConfig()

  // Validar configuração
  if (!isTelegramConfigured(config)) {
    await logNotification({
      level: 'WARN',
      channel: 'telegram',
      notificationType: 'postop_followup',
      message: 'Telegram não configurado - notificação de follow-up não enviada',
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Telegram não configurado' }
  }

  // Verificar rate limit
  const rateLimitCheck = checkNotificationRateLimit('telegram_followup', 10)
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      error: `Rate limit excedido. Aguarde ${rateLimitCheck.retryAfter} segundos`,
    }
  }

  try {
    // Gerar link do WhatsApp para follow-up
    const sanitizedWhatsApp = sanitizeWhatsApp(followUpData.patientWhatsapp)
    const whatsappLink = generateFollowUpWhatsAppLink(
      sanitizedWhatsApp,
      followUpData.patientName,
      followUpData.followUpDay,
      followUpData.surgeryType
    )

    const dayMessages = {
      1: '1º DIA PÓS-OPERATÓRIO',
      4: '4º DIA PÓS-OPERATÓRIO',
      7: '7º DIA PÓS-OPERATÓRIO (1 SEMANA)',
      14: '14º DIA PÓS-OPERATÓRIO (2 SEMANAS)'
    }

    // Criar mensagem do Telegram
    const telegramMessage =
      `🩺 *FOLLOW-UP ${dayMessages[followUpData.followUpDay as keyof typeof dayMessages]}*\n\n` +
      `👤 *Paciente:* ${followUpData.patientName}\n` +
      `📱 *WhatsApp:* ${followUpData.patientWhatsapp}\n` +
      `🔬 *Cirurgia:* ${followUpData.surgeryType}\n` +
      `📅 *Data da Cirurgia:* ${formatDateForDisplay(followUpData.surgeryDate)}\n` +
      `📊 *Follow-up:* ${followUpData.followUpDay}º dia pós-operatório\n\n` +
      `🔗 [📱 Contatar via WhatsApp](${whatsappLink})\n\n` +
      `📋 *Avaliar:*\n` +
      `• Nível de dor (escala 0-10)\n` +
      `• Presença de sangramento\n` +
      `• Funcionamento intestinal\n` +
      `• Outras preocupações`

    // Enviar mensagem via API do Telegram
    await withRetry(
      async () => {
        const response = await fetch(
          `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              chat_id: config.telegramChatId,
              text: telegramMessage,
              parse_mode: 'Markdown',
              disable_web_page_preview: false,
            }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            `Erro na API do Telegram: ${response.status} - ${JSON.stringify(errorData)}`
          )
        }

        return response
      },
      {
        maxAttempts: config.retryAttempts || 3,
        delayMs: config.retryDelay || 2000,
      }
    )

    await logNotification({
      level: 'SUCCESS',
      channel: 'telegram',
      notificationType: 'postop_followup',
      recipient: config.telegramChatId,
      message: `Follow-up ${followUpData.followUpDay}º dia enviado com sucesso`,
      metadata: {
        patientName: followUpData.patientName,
        surgeryDate: followUpData.surgeryDate,
        followUpDay: followUpData.followUpDay,
      },
      timestamp: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    await handleNotificationError(
      error instanceof Error ? error : new Error(String(error)),
      {
        channel: 'telegram',
        notificationType: 'postop_followup',
        recipient: config.telegramChatId,
      }
    )

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Função para gerar link do WhatsApp
function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`
}

// Função para criar mensagem Telegram com links WhatsApp manuais
export async function createTelegramWhatsAppLinks(
  surgeryData: SurgeryNotificationData,
  type: 'preop' | 'postop',
  followUpDay?: number
): Promise<string> {
  const patientPhone = surgeryData.patientWhatsapp
  const surgeryDate = formatDateForDisplay(surgeryData.surgeryDate)
  const surgeryTime = surgeryData.surgeryTime
  
  let whatsappMessage = ''
  let telegramMessage = ''
  
  if (type === 'preop') {
    whatsappMessage = `Olá ${surgeryData.patientName}! 👋

🏥 *Lembrete de Cirurgia - Véspera*

Sua cirurgia está agendada para *amanhã*:
📅 Data: ${surgeryDate}
⏰ Horário: ${surgeryTime}
🔬 Procedimento: ${surgeryData.surgeryType}

📋 *Orientações importantes:*
• Jejum absoluto a partir das 22h de hoje
• Tomar banho com sabonete antisséptico
• Não usar maquiagem, esmalte ou joias
• Chegar ao hospital 1h antes do horário
• Trazer documentos e exames

❓ Dúvidas? Entre em contato conosco.

Desejamos uma excelente recuperação! 🙏`

    telegramMessage = `🏥 *LINK WHATSAPP - VÉSPERA DE CIRURGIA*

👤 *Paciente:* ${surgeryData.patientName}
📱 *Telefone:* ${patientPhone}
📅 *Cirurgia:* ${surgeryDate} às ${surgeryTime}
🔬 *Procedimento:* ${surgeryData.surgeryType}

📲 *Link para enviar mensagem:*
${generateWhatsAppLink(patientPhone, whatsappMessage)}

⚠️ *Instruções:*
1. Clique no link acima
2. Será aberto o WhatsApp com a mensagem pronta
3. Revise a mensagem se necessário
4. Envie para o paciente

#VesperaCirurgia #${surgeryData.patientName.replace(/\s+/g, '')}`
  } else {
    const followUpDayText = followUpDay === 1 ? '1º dia' : 
                           followUpDay === 4 ? '4º dia' : 
                           followUpDay === 7 ? '1 semana' : 
                           followUpDay === 14 ? '2 semanas' : `${followUpDay}º dia`
    
    whatsappMessage = `Olá ${surgeryData.patientName}! 👋

🏥 *Follow-up Pós-Operatório - ${followUpDayText}*

Como você está se sentindo após sua cirurgia?
📅 Cirurgia realizada: ${surgeryDate}
🔬 Procedimento: ${surgeryData.surgeryType}

📋 *Gostaríamos de saber:*
• Como está sua dor (0-10)?
• Há algum sangramento?
• Como está sua alimentação?
• Consegue se movimentar bem?
• Alguma preocupação ou dúvida?

📲 Responda esta mensagem ou ligue para agendar uma consulta se necessário.

Estamos acompanhando sua recuperação! 🙏`

    telegramMessage = `🏥 *LINK WHATSAPP - FOLLOW-UP ${followUpDayText.toUpperCase()}*

👤 *Paciente:* ${surgeryData.patientName}
📱 *Telefone:* ${patientPhone}
📅 *Cirurgia:* ${surgeryDate}
🔬 *Procedimento:* ${surgeryData.surgeryType}
📊 *Follow-up:* ${followUpDayText} pós-operatório

📲 *Link para enviar mensagem:*
${generateWhatsAppLink(patientPhone, whatsappMessage)}

⚠️ *Instruções:*
1. Clique no link acima
2. Será aberto o WhatsApp com a mensagem pronta
3. Revise a mensagem se necessário
4. Envie para o paciente

#FollowUp${followUpDay}Dias #${surgeryData.patientName.replace(/\s+/g, '')}`
  }
  
  return telegramMessage
}

/**
 * Agendar notificações automáticas para uma cirurgia
 */
export async function scheduleSurgeryNotifications(
  surgeryData: SurgeryNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Calcular data de véspera (1 dia antes)
    const surgeryDate = new Date(surgeryData.surgeryDate + 'T00:00:00')
    const reminderDate = new Date(surgeryDate)
    reminderDate.setDate(reminderDate.getDate() - 1)

    // Verificar se a véspera já passou
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (reminderDate >= now) {
      // Agendar notificação de véspera
      // Nota: Em um ambiente de produção, isso seria feito com um job scheduler
      console.log(`📅 Notificação de véspera agendada para: ${reminderDate.toISOString()}`)
    }

    // Agendar follow-ups pós-operatórios (1º, 4º, 7º, 14º dias)
    const followUpDays = [1, 4, 7, 14]
    for (const day of followUpDays) {
      const followUpDate = new Date(surgeryDate)
      followUpDate.setDate(followUpDate.getDate() + day)
      
      console.log(`📅 Follow-up ${day}º dia agendado para: ${followUpDate.toISOString()}`)
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao agendar notificações',
    }
  }
}