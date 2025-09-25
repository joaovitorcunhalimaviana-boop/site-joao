// Sistema de agendamento automático da agenda diária

interface AppointmentData {
  patientName?: string
  fullName?: string
  appointmentDate: string
  appointmentTime: string
  whatsapp: string
  insuranceType: 'unimed' | 'private'
}

interface DailyAgendaSchedule {
  targetDate: string
  agendaTime: Date
  appointments: AppointmentData[]
}

// Função principal para agendar agenda diária
export async function scheduleDailyAgenda(appointmentData: AppointmentData) {
  try {
    console.log('\n' + '📅'.repeat(15))
    console.log('📋 AGENDANDO AGENDA DIÁRIA')
    console.log('📅'.repeat(15))
    console.log(`📆 Data do atendimento: ${appointmentData.appointmentDate}`)
    console.log(
      `👤 Paciente: ${appointmentData.patientName || appointmentData.fullName}`
    )

    // Calcular quando enviar a agenda (24h antes às 20:00)
    const agendaTime = calculateDailyAgendaTime(appointmentData.appointmentDate)

    console.log(
      `⏰ Agenda será enviada em: ${agendaTime.toLocaleString('pt-BR')}`
    )

    // Verificar se já passou do horário de envio
    const now = new Date()
    if (agendaTime <= now) {
      console.log('⚠️ Horário de agenda já passou - enviando imediatamente')
      await sendDailyAgendaImmediately(appointmentData.appointmentDate)
      return
    }

    // Agendar para o horário correto
    const delay = agendaTime.getTime() - now.getTime()

    setTimeout(async () => {
      await sendDailyAgendaImmediately(appointmentData.appointmentDate)
    }, delay)

    console.log('✅ Agenda diária agendada com sucesso!')
    console.log('📅'.repeat(15) + '\n')
  } catch (error) {
    console.error('❌ Erro ao agendar agenda diária:', error)
  }
}

// Função para calcular horário da agenda (24h antes às 20:00)
function calculateDailyAgendaTime(appointmentDate: string): Date {
  const targetDate = new Date(appointmentDate)
  const agendaDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000) // 24h antes

  // Definir para 20:00 (8 PM) do dia anterior
  agendaDate.setHours(20, 0, 0, 0)

  return agendaDate
}

// Função para enviar agenda imediatamente
export async function sendDailyAgendaImmediately(targetDate: string) {
  try {
    console.log(`📅 Enviando agenda diária imediatamente para: ${targetDate}`)

    // Usar a nova função que inclui cirurgias
    const dailyAgenda = await getDailyAgendaWithSurgeries(targetDate)

    if (
      !dailyAgenda ||
      (!dailyAgenda.appointments.length && !dailyAgenda.surgeries.length)
    ) {
      console.log(
        `📭 Nenhuma consulta ou cirurgia encontrada para ${targetDate}`
      )
      return
    }

    // Enviar para a API de agenda diária
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/daily-agenda`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetDate,
          appointments: dailyAgenda.appointments,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    const result = await response.json()
    console.log(`✅ Agenda diária enviada com sucesso:`, result)
  } catch (error) {
    console.error('❌ Erro ao enviar agenda diária imediatamente:', error)
    throw error
  }
}

// Função para buscar consultas de uma data específica
// Usa o mesmo sistema de armazenamento do reminder-scheduler
async function getAppointmentsForTargetDate(
  targetDate: string
): Promise<AppointmentData[]> {
  console.log(`🔍 Buscando consultas para ${targetDate}...`)

  try {
    // Buscar do sistema de lembretes que já armazena as consultas
    const response = await fetch(
      '/api/reminder-system?action=upcoming&limit=100'
    )
    const result = await response.json()

    if (result.success && result.data) {
      // Filtrar consultas pela data específica
      const appointmentsForDate = result.data
        .filter((reminder: any) => {
          const appointmentDate = reminder.patientData?.appointmentDate
          return appointmentDate === targetDate
        })
        .map((reminder: any) => ({
          patientName:
            reminder.patientData?.patientName || reminder.patientData?.fullName,
          fullName:
            reminder.patientData?.fullName || reminder.patientData?.patientName,
          appointmentDate: reminder.patientData?.appointmentDate,
          appointmentTime: reminder.patientData?.appointmentTime,
          whatsapp: reminder.patientData?.whatsapp,
          insuranceType: reminder.patientData?.insuranceType,
        }))

      console.log(
        `✅ Encontradas ${appointmentsForDate.length} consultas para ${targetDate}`
      )
      return appointmentsForDate
    }
  } catch (error) {
    console.error('❌ Erro ao buscar consultas:', error)
  }

  return []
}

// Função para agendar múltiplas agendas (útil para consultas já existentes)
export async function scheduleMultipleDailyAgendas(
  appointments: AppointmentData[]
) {
  console.log('\n' + '📅'.repeat(20))
  console.log('📋 AGENDANDO MÚLTIPLAS AGENDAS DIÁRIAS')
  console.log('📅'.repeat(20))
  console.log(`📊 Total de consultas: ${appointments.length}`)

  // Agrupar por data
  const appointmentsByDate = groupAppointmentsByDate(appointments)

  // Agendar uma agenda para cada data
  for (const [date, dateAppointments] of Object.entries(appointmentsByDate)) {
    console.log(
      `📆 Agendando para ${date}: ${dateAppointments.length} consultas`
    )

    // Usar o primeiro appointment da data para agendar
    if (dateAppointments.length > 0) {
      await scheduleDailyAgenda(dateAppointments[0])
    }
  }

  console.log('✅ Todas as agendas diárias foram agendadas!')
  console.log('📅'.repeat(20) + '\n')
}

// Função auxiliar para agrupar consultas por data
function groupAppointmentsByDate(
  appointments: AppointmentData[]
): Record<string, AppointmentData[]> {
  return appointments.reduce(
    (groups, appointment) => {
      const date = appointment.appointmentDate
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(appointment)
      return groups
    },
    {} as Record<string, AppointmentData[]>
  )
}

// Função para verificar e enviar agendas pendentes (útil para inicialização)
export async function checkPendingDailyAgendas() {
  console.log('\n' + '🔍'.repeat(15))
  console.log('📋 VERIFICANDO AGENDAS PENDENTES')
  console.log('🔍'.repeat(15))

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  console.log(`📆 Verificando consultas para amanhã: ${tomorrowStr}`)

  // Verificar se já passou das 20:00 de hoje
  const now = new Date()
  const todayAt8PM = new Date()
  todayAt8PM.setHours(20, 0, 0, 0)

  if (now >= todayAt8PM) {
    console.log('⏰ Já passou das 20:00 - enviando agenda para amanhã')
    await sendDailyAgendaImmediately(tomorrowStr)
  } else {
    console.log('⏰ Ainda não chegou às 20:00 - agenda será enviada no horário')
  }

  console.log('🔍'.repeat(15) + '\n')
}

import { getDailyAgendaWithSurgeries } from './unified-appointment-system'
