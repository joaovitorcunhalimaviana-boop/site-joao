// Sistema de Notificações do Telegram
// Função utilitária para enviar Notificações de agendamentos via Telegram

import {
  loadNotificationConfig,
  isTelegramConfigured,
  withRetry,
  checkNotificationRateLimit,
  logNotification,
  handleNotificationError,
  sanitizeWhatsApp,
} from './notification-utils'
import { CommunicationContact, UnifiedAppointment } from './unified-patient-system-prisma'

export interface AppointmentNotificationData {
  patientName: string
  patientEmail?: string
  patientPhone: string
  patientWhatsapp: string
  appointmentDate: string // YYYY-MM-DD
  appointmentTime: string // HH:MM
  insuranceType: 'unimed' | 'particular' | 'outro'
  appointmentType?: string
  source?: string
  notes?: string
}

/**
 * Converte dados do Prisma para o formato de notificação
 */
export function convertPrismaToNotificationData(
  contact: CommunicationContact,
  appointment: UnifiedAppointment
): AppointmentNotificationData {
  return {
    patientName: contact.name,
    patientEmail: contact.email,
    patientPhone: contact.phone || contact.whatsapp || '',
    patientWhatsapp: contact.whatsapp || contact.phone || '',
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    insuranceType:
      (appointment.insuranceType || 'particular').toLowerCase() as
        'unimed' | 'particular' | 'outro',
    appointmentType: appointment.type,
    source: appointment.source,
    notes: appointment.observations
  }
}

/**
 * Envia Notificação de nova consulta via Telegram
 */
export async function sendTelegramAppointmentNotification(
  appointmentData: AppointmentNotificationData
): Promise<{ success: boolean; error?: string }> {
  const config = loadNotificationConfig()

  // Validar configuração
  if (!isTelegramConfigured(config)) {
    await logNotification({
      level: 'WARN',
      channel: 'telegram',
      notificationType: 'appointment_confirmation',
      message: 'Telegram não configurado - notificação não enviada',
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Telegram não configurado' }
  }

  // Verificar rate limit
  const rateLimitCheck = checkNotificationRateLimit('telegram_doctor', 10)
  if (!rateLimitCheck.allowed) {
    await logNotification({
      level: 'WARN',
      channel: 'telegram',
      notificationType: 'appointment_confirmation',
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
    const formattedDate = formatDateForDisplay(appointmentData.appointmentDate)

    // Gerar link do WhatsApp para Confirmação
    const sanitizedWhatsApp = sanitizeWhatsApp(appointmentData.patientWhatsapp)
    const whatsappLink = generateWhatsAppConfirmationLink(
      sanitizedWhatsApp,
      appointmentData.patientName,
      formattedDate,
      appointmentData.appointmentTime,
      config.doctorName
    )

    // Criar mensagem do Telegram
    const telegramMessage =
      `🩺 *NOVA consulta agendada*\n\n` +
      `👤 *Paciente:* ${appointmentData.patientName}\n` +
      `📧 *Email:* ${appointmentData.patientEmail || 'Não informado'}\n` +
      `📞 *Telefone:* ${appointmentData.patientPhone}\n` +
      `📱 *WhatsApp:* ${appointmentData.patientWhatsapp}\n` +
      `🏥 *Plano:* ${getInsuranceDisplayName(appointmentData.insuranceType)}\n` +
      `📅 *Data:* ${formattedDate}\n` +
      `⏰ *Horário:* ${appointmentData.appointmentTime}\n` +
      `🏷️ *Tipo:* ${appointmentData.appointmentType || 'consulta'}\n` +
      `📋 *Origem:* ${getSourceDisplayName(appointmentData.source)}\n` +
      (appointmentData.notes
        ? `📝 *Observações:* ${appointmentData.notes}\n`
        : '') +
      `\n🔗 [📱 Confirmar via WhatsApp](${whatsappLink})`

    // Enviar mensagem via API do Telegram com retry logic
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
            `⚠️ Tentativa ${attempt} de enviar notificação Telegram falhou:`,
            error.message
          )
        },
      }
    )

    await logNotification({
      level: 'SUCCESS',
      channel: 'telegram',
      notificationType: 'appointment_confirmation',
      recipient: config.telegramChatId,
      message: 'Notificação de agendamento enviada com sucesso',
      metadata: {
        patientName: appointmentData.patientName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
      },
      timestamp: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    await handleNotificationError(
      error instanceof Error ? error : new Error(String(error)),
      {
        channel: 'telegram',
        notificationType: 'appointment_confirmation',
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
 * Envia lembrete de consulta via Telegram (24 horas antes)
 */
export async function sendTelegramReminderNotification(
  appointmentData: AppointmentNotificationData
): Promise<{ success: boolean; error?: string }> {
  const config = loadNotificationConfig()

  // Validar configuração
  if (!isTelegramConfigured(config)) {
    await logNotification({
      level: 'WARN',
      channel: 'telegram',
      notificationType: 'appointment_reminder',
      message: 'Telegram não configurado - lembrete não enviado',
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Telegram não configurado' }
  }

  // Verificar rate limit
  const rateLimitCheck = checkNotificationRateLimit('telegram_reminder', 15)
  if (!rateLimitCheck.allowed) {
    await logNotification({
      level: 'WARN',
      channel: 'telegram',
      notificationType: 'appointment_reminder',
      message: `Rate limit excedido. Tente novamente em ${rateLimitCheck.retryAfter}s`,
      timestamp: new Date().toISOString(),
    })
    return {
      success: false,
      error: `Rate limit excedido. Aguarde ${rateLimitCheck.retryAfter} segundos`,
    }
  }

  try {
    const formattedDate = formatDateForDisplay(appointmentData.appointmentDate)

    const sanitizedWhatsApp = sanitizeWhatsApp(appointmentData.patientWhatsapp)
    const whatsappReminderLink = generateWhatsAppReminderLink(
      sanitizedWhatsApp,
      appointmentData.patientName,
      formattedDate,
      appointmentData.appointmentTime,
      config.doctorName
    )

    const telegramMessage =
      `📅 *LEMBRETE DE CONSULTA - AMANHÃ*\n\n` +
      `👤 *Paciente:* ${appointmentData.patientName}\n` +
      `📱 *WhatsApp:* ${appointmentData.patientWhatsapp}\n` +
      `📅 *Data:* ${formattedDate}\n` +
      `⏰ *Horário:* ${appointmentData.appointmentTime}\n` +
      `🏥 *Plano:* ${getInsuranceDisplayName(appointmentData.insuranceType)}\n\n` +
      `🔗 [📤 Enviar lembrete ao paciente](${whatsappReminderLink})`

    // Enviar com retry logic
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
      notificationType: 'appointment_reminder',
      recipient: config.telegramChatId,
      message: 'Lembrete de consulta enviado com sucesso',
      metadata: {
        patientName: appointmentData.patientName,
        appointmentDate: appointmentData.appointmentDate,
      },
      timestamp: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    await handleNotificationError(
      error instanceof Error ? error : new Error(String(error)),
      {
        channel: 'telegram',
        notificationType: 'appointment_reminder',
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
 * Envia agenda diária via Telegram
 */
export async function sendTelegramDailyAgenda(
  targetDate: string,
  appointments: AppointmentNotificationData[]
): Promise<{ success: boolean; error?: string }> {
  const telegramToken = process.env['TELEGRAM_BOT_TOKEN']
  const telegramChatId = process.env['TELEGRAM_CHAT_ID']

  if (!telegramToken || !telegramChatId) {
    console.log('ℹ️ Telegram Não configurado - agenda diária Não enviada')
    return { success: false, error: 'Telegram Não configurado' }
  }

  try {
    const formattedDate = formatDateForDisplay(targetDate)

    let telegramMessage =
      `📅 *AGENDA MEDICA*\n` + `🗓️ *${formattedDate.toUpperCase()}*\n\n`

    if (appointments.length === 0) {
      telegramMessage +=
        `✅ *Nenhuma consulta agendada*\n\n` +
        `🏖️ Dia livre para descanso ou atividades administrativas.`
    } else {
      telegramMessage += `👥 *${appointments.length} ${appointments.length === 1 ? 'consulta agendada' : 'consultas agendadas'}*

`

      // Ordenar por horario
      const sortedAppointments = appointments.sort((a, b) =>
        a.appointmentTime.localeCompare(b.appointmentTime)
      )

      sortedAppointments.forEach((appointment, index) => {
        const whatsappLink = generateWhatsAppConfirmationLink(
          appointment.patientWhatsapp,
          appointment.patientName,
          formattedDate,
          appointment.appointmentTime
        )

        telegramMessage +=
          `🕐 *${appointment.appointmentTime}h* - ${appointment.patientName}\n` +
          `📱 ${appointment.patientWhatsapp}\n` +
          `🏥 ${getInsuranceDisplayName(appointment.insuranceType)}\n` +
          `💬 [Contatar paciente](${whatsappLink})\n`

        if (index < sortedAppointments.length - 1) {
          telegramMessage += `\n━━━━━━━━━━━━━━━━━━━━\n\n`
        }
      })

      telegramMessage +=
        `

📊 *Resumo do dia:*
` +
        `• Total: ${appointments.length} ${appointments.length === 1 ? 'paciente' : 'pacientes'}
` +
        `• Primeiro atendimento: ${sortedAppointments[0].appointmentTime}h
` +
        `• Ultimo atendimento: ${sortedAppointments[sortedAppointments.length - 1].appointmentTime}h`
    }

    const response = await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: telegramMessage,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Erro na API do Telegram: ${response.status} - ${JSON.stringify(errorData)}`
      )
    }

    console.log('✅ Agenda diária Telegram enviada com sucesso!')
    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao enviar agenda diária Telegram:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Funções auxiliares

function formatDateForDisplay(dateString: string): string {
  try {
    // Parse da data no formato YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month é 0-indexed

    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

function getInsuranceDisplayName(insuranceType: string): string {
  const type = (insuranceType || '').toLowerCase()
  switch (type) {
    case 'unimed':
      return 'Unimed'
    case 'particular':
      return 'Particular'
    case 'outro':
      return 'Outro'
    default:
      return 'Não informado'
  }
}

function getSourceDisplayName(source?: string): string {
  switch (source) {
    case 'public_appointment':
      return 'Formulário Público'
    case 'secretary_area':
      return 'Área da Secretária'
    case 'doctor_area':
      return 'Área Médica'
    default:
      return 'Sistema'
  }
}

function generateWhatsAppConfirmationLink(
  whatsapp: string,
  patientName: string,
  date: string,
  time: string,
  doctorName?: string
): string {
  const message =
    `🏥 Confirmação de consulta\n\n` +
    `Olá ${patientName}!\n\n` +
    `Sua consulta foi agendada com sucesso:\n` +
    `📅 Data: ${date}\n` +
    `⏰ Horário: ${time}\n\n` +
    `Por favor, confirme sua presença respondendo esta mensagem.\n\n` +
    `Obrigado!\n` +
    `${doctorName || 'Dr. João Vítor Viana'}`

  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`
}

function generateWhatsAppReminderLink(
  patientWhatsapp: string,
  patientName: string,
  date: string,
  time: string,
  doctorName?: string
): string {
  const message =
    `🏥 Lembrete de consulta\n\n` +
    `Olá ${patientName}!\n\n` +
    `Lembramos que você tem consulta marcada:\n` +
    `📅 Data: ${date}\n` +
    `⏰ Horário: ${time}\n\n` +
    `Por favor, confirme sua presença respondendo esta mensagem.\n\n` +
    `Obrigado!\n` +
    `${doctorName || 'Dr. João Vítor Viana'}`

  return `https://wa.me/${patientWhatsapp}?text=${encodeURIComponent(message)}`
}

