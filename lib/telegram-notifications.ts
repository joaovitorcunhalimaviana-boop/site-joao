// Sistema de Notificações do Telegram
// Função utilitária para enviar notificações de agendamentos via Telegram

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
 * Envia notificação de nova consulta via Telegram
 */
export async function sendTelegramAppointmentNotification(
  appointmentData: AppointmentNotificationData
): Promise<{ success: boolean; error?: string }> {
  const telegramToken = process.env['TELEGRAM_BOT_TOKEN']
  const telegramChatId = process.env['TELEGRAM_CHAT_ID']

  if (!telegramToken || !telegramChatId) {
    console.log('ℹ️ Telegram não configurado - notificação não enviada')
    return { success: false, error: 'Telegram não configurado' }
  }

  try {
    // Formatar data para exibição
    const formattedDate = formatDateForDisplay(appointmentData.appointmentDate)

    // Gerar link do WhatsApp para confirmação
    const whatsappLink = generateWhatsAppConfirmationLink(
      appointmentData.patientWhatsapp,
      appointmentData.patientName,
      formattedDate,
      appointmentData.appointmentTime
    )

    // Criar mensagem do Telegram
    const telegramMessage =
      `🩺 *NOVA CONSULTA AGENDADA*\n\n` +
      `👤 *Paciente:* ${appointmentData.patientName}\n` +
      `📧 *Email:* ${appointmentData.patientEmail || 'Não informado'}\n` +
      `📞 *Telefone:* ${appointmentData.patientPhone}\n` +
      `📱 *WhatsApp:* ${appointmentData.patientWhatsapp}\n` +
      `🏥 *Plano:* ${getInsuranceDisplayName(appointmentData.insuranceType)}\n` +
      `📅 *Data:* ${formattedDate}\n` +
      `⏰ *Horário:* ${appointmentData.appointmentTime}\n` +
      `🏷️ *Tipo:* ${appointmentData.appointmentType || 'Consulta'}\n` +
      `📋 *Origem:* ${getSourceDisplayName(appointmentData.source)}\n` +
      (appointmentData.notes
        ? `📝 *Observações:* ${appointmentData.notes}\n`
        : '') +
      `\n🔗 [📱 Confirmar via WhatsApp](${whatsappLink})`

    // Enviar mensagem via API do Telegram
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

    console.log('✅ Notificação Telegram enviada com sucesso!')
    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao enviar notificação Telegram:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Envia lembrete de consulta via Telegram (um dia antes)
 */
export async function sendTelegramReminderNotification(
  appointmentData: AppointmentNotificationData,
  reminderType: 'day_before' | 'hour_before' = 'day_before'
): Promise<{ success: boolean; error?: string }> {
  const telegramToken = process.env['TELEGRAM_BOT_TOKEN']
  const telegramChatId = process.env['TELEGRAM_CHAT_ID']

  if (!telegramToken || !telegramChatId) {
    console.log('ℹ️ Telegram não configurado - lembrete não enviado')
    return { success: false, error: 'Telegram não configurado' }
  }

  try {
    const formattedDate = formatDateForDisplay(appointmentData.appointmentDate)
    const reminderEmoji = reminderType === 'day_before' ? '📅' : '⏰'
    const reminderText = reminderType === 'day_before' ? 'AMANHÃ' : 'EM 1 HORA'

    const whatsappReminderLink = generateWhatsAppReminderLink(
      appointmentData.patientWhatsapp,
      appointmentData.patientName,
      formattedDate,
      appointmentData.appointmentTime
    )

    const telegramMessage =
      `${reminderEmoji} *LEMBRETE DE CONSULTA - ${reminderText}*\n\n` +
      `👤 *Paciente:* ${appointmentData.patientName}\n` +
      `📱 *WhatsApp:* ${appointmentData.patientWhatsapp}\n` +
      `📅 *Data:* ${formattedDate}\n` +
      `⏰ *Horário:* ${appointmentData.appointmentTime}\n` +
      `🏥 *Plano:* ${getInsuranceDisplayName(appointmentData.insuranceType)}\n\n` +
      `🔗 [📤 Enviar lembrete ao paciente](${whatsappReminderLink})`

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

    console.log(`✅ Lembrete Telegram (${reminderType}) enviado com sucesso!`)
    return { success: true }
  } catch (error) {
    console.error(
      `❌ Erro ao enviar lembrete Telegram (${reminderType}):`,
      error
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
    console.log('ℹ️ Telegram não configurado - agenda diária não enviada')
    return { success: false, error: 'Telegram não configurado' }
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
  switch (insuranceType) {
    case 'unimed':
      return 'Unimed'
    case 'particular':
      return 'Particular'
    case 'outro':
      return 'Outro'
    default:
      return insuranceType || 'Não informado'
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
  time: string
): string {
  const cleanPatientWhatsApp = whatsapp.replace(/\D/g, '')

  const message =
    `🏥 Confirmação de Consulta\n\n` +
    `Olá ${patientName}!\n\n` +
    `Sua consulta foi agendada com sucesso:\n` +
    `📅 Data: ${date}\n` +
    `⏰ Horário: ${time}\n\n` +
    `Por favor, confirme sua presença respondendo esta mensagem.\n\n` +
    `Obrigado!\n` +
    `${process.env['DOCTOR_NAME'] || 'Dr. João Vítor Viana'}`

  return `https://wa.me/55${cleanPatientWhatsApp}?text=${encodeURIComponent(message)}`
}

function generateWhatsAppReminderLink(
  patientWhatsapp: string,
  patientName: string,
  date: string,
  time: string
): string {
  const cleanPatientWhatsApp = patientWhatsapp.replace(/\D/g, '')

  const message =
    `🏥 Lembrete de Consulta\n\n` +
    `Olá ${patientName}!\n\n` +
    `Lembramos que você tem consulta marcada:\n` +
    `📅 Data: ${date}\n` +
    `⏰ Horário: ${time}\n\n` +
    `Por favor, confirme sua presença respondendo esta mensagem.\n\n` +
    `Obrigado!\n` +
    `${process.env['DOCTOR_NAME'] || 'Dr. João Vítor Viana'}`

  return `https://wa.me/55${cleanPatientWhatsApp}?text=${encodeURIComponent(message)}`
}
