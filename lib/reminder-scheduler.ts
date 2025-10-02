// Sistema de agendamento automático de lembretes
// Este arquivo implementa a lógica para agendar lembretes automáticos

interface AppointmentData {
  id: string
  patientName: string
  whatsapp: string
  appointmentDate: string
  appointmentTime: string
  insuranceType?: string
  email?: string
}

interface ScheduledReminder {
  appointmentId: string
  reminderType: '24h'
  scheduledTime: Date
  patientData: AppointmentData
  status: 'pending' | 'sent' | 'failed'
}

// Simulação de banco de dados em memória para demonstração
// Em produção, isso seria substituído por um banco de dados real
let scheduledReminders: ScheduledReminder[] = []
const appointments: AppointmentData[] = []

/**
 * Agenda lembrete automático de 24 horas para uma consulta
 */
export function scheduleAppointmentReminders(
  appointmentData: AppointmentData
): ScheduledReminder[] {
  const appointmentDateTime = new Date(
    `${appointmentData.appointmentDate}T${appointmentData.appointmentTime}:00`
  )

  // Calcular apenas o horário do lembrete de 24 horas
  const reminder24h = new Date(
    appointmentDateTime.getTime() - 24 * 60 * 60 * 1000
  )

  const reminders: ScheduledReminder[] = [
    {
      appointmentId: appointmentData.id,
      reminderType: '24h',
      scheduledTime: reminder24h,
      patientData: appointmentData,
      status: 'pending',
    },
  ]

  // Adicionar à lista de lembretes agendados
  scheduledReminders.push(...reminders)

  // Adicionar consulta à lista
  appointments.push(appointmentData)

  console.log(
    `✅ Lembrete automático de 24h agendado para ${appointmentData.patientName}:`
  )
  console.log(`📅 24h antes: ${reminder24h.toLocaleString('pt-BR')}`)

  return reminders
}

/**
 * Verifica e envia lembretes pendentes
 */
export async function checkAndSendReminders(): Promise<void> {
  const now = new Date()
  const pendingReminders = scheduledReminders.filter(
    reminder => reminder.status === 'pending' && reminder.scheduledTime <= now
  )

  console.log(
    `🔍 Verificando lembretes... Encontrados ${pendingReminders.length} pendentes`
  )

  for (const reminder of pendingReminders) {
    try {
      await sendReminderNotification(reminder)
      reminder.status = 'sent'
      console.log(
        `✅ Lembrete ${reminder.reminderType} enviado para ${reminder.patientData.patientName}`
      )
    } catch (error) {
      reminder.status = 'failed'
      console.error(
        `❌ Erro ao enviar lembrete ${reminder.reminderType} para ${reminder.patientData.patientName}:`,
        error
      )
    }
  }
}

/**
 * Envia notificação de lembrete
 */
async function sendReminderNotification(
  reminder: ScheduledReminder
): Promise<void> {
  const response = await fetch('/api/appointment-reminder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName: reminder.patientData.patientName,
      whatsapp: reminder.patientData.whatsapp,
      appointmentDate: reminder.patientData.appointmentDate,
      appointmentTime: reminder.patientData.appointmentTime,
      reminderType: reminder.reminderType,
      insuranceType: reminder.patientData.insuranceType,
    }),
  })

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`)
  }

  const result = await response.json()
  console.log(`📱 Lembrete ${reminder.reminderType} processado:`, result)
}

/**
 * Obtém estatísticas dos lembretes
 */
export function getReminderStats(): {
  total: number
  pending: number
  sent: number
  failed: number
  byType: Record<string, number>
} {
  const stats = {
    total: scheduledReminders.length,
    pending: scheduledReminders.filter(r => r.status === 'pending').length,
    sent: scheduledReminders.filter(r => r.status === 'sent').length,
    failed: scheduledReminders.filter(r => r.status === 'failed').length,
    byType: {
      '24h': scheduledReminders.filter(r => r.reminderType === '24h').length,
    },
  }

  return stats
}

/**
 * Lista próximos lembretes agendados
 */
export function getUpcomingReminders(limit: number = 10): ScheduledReminder[] {
  const now = new Date()
  return scheduledReminders
    .filter(
      reminder => reminder.status === 'pending' && reminder.scheduledTime > now
    )
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
    .slice(0, limit)
}

/**
 * Cancela lembretes de uma consulta específica
 */
export function cancelAppointmentReminders(appointmentId: string): number {
  const canceledCount = scheduledReminders.filter(
    reminder =>
      reminder.appointmentId === appointmentId && reminder.status === 'pending'
  ).length

  scheduledReminders = scheduledReminders.filter(
    reminder =>
      !(
        reminder.appointmentId === appointmentId &&
        reminder.status === 'pending'
      )
  )

  console.log(
    `🚫 ${canceledCount} lembretes cancelados para consulta ${appointmentId}`
  )
  return canceledCount
}

/**
 * Simula o processamento automático de lembretes (para demonstração)
 * Em produção, isso seria executado por um cron job ou sistema de filas
 */
export function startReminderProcessor(): void {
  console.log('🚀 Iniciando processador de lembretes automáticos...')

  // Verificar lembretes a cada minuto (em produção seria menos frequente)
  setInterval(async () => {
    await checkAndSendReminders()
  }, 60000) // 60 segundos

  console.log(
    '✅ Processador de lembretes iniciado (verificação a cada 60 segundos)'
  )
}

/**
 * Função utilitária para criar um ID único
 */
export function generateAppointmentId(): string {
  return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Função para demonstração - agenda uma consulta de teste
 */
export function scheduleTestAppointment(): AppointmentData {
  const testAppointment: AppointmentData = {
    id: generateAppointmentId(),
    patientName: 'João Silva (Teste)',
    whatsapp: '11999999999',
    appointmentDate: new Date(Date.now() + 25 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // Amanhã
    appointmentTime: '14:00',
    insuranceType: 'Unimed',
    email: 'joao.teste@email.com',
  }

  scheduleAppointmentReminders(testAppointment)
  return testAppointment
}

// Exportar dados para debugging (apenas em desenvolvimento)
if (process.env['NODE_ENV'] === 'development') {
  ;(global as any).reminderDebug = {
    scheduledReminders: () => scheduledReminders,
    appointments: () => appointments,
    stats: getReminderStats,
    upcoming: getUpcomingReminders,
    scheduleTest: scheduleTestAppointment,
  }
}

