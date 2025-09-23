// Sistema de verificação automática de aniversários diários
import { getTodayBirthdays, processBirthdayEmails } from './email-service'
import { getAllPatients } from './unified-appointment-system'

interface BirthdayJob {
  id: string
  scheduledTime: Date
  targetDate: string
  status: 'pending' | 'sent' | 'failed'
  patientsCount: number
}

let birthdayJobs: BirthdayJob[] = []
let birthdayCronInterval: NodeJS.Timeout | null = null

/**
 * Inicia o sistema de cron job para verificação de aniversários diariamente às 08:00
 */
export function startBirthdayCronScheduler(): void {
  console.log('🎂 Iniciando sistema de cron job para aniversários às 08:00...')

  // Verificar a cada minuto se chegou às 08:00
  birthdayCronInterval = setInterval(async () => {
    await checkAndSendBirthdayEmails()
  }, 60000) // Verificar a cada 60 segundos

  console.log(
    '✅ Sistema de cron job de aniversários iniciado (verificação a cada minuto)'
  )
}

/**
 * Para o sistema de cron job de aniversários
 */
export function stopBirthdayCronScheduler(): void {
  if (birthdayCronInterval) {
    clearInterval(birthdayCronInterval)
    birthdayCronInterval = null
    console.log('⏹️ Sistema de cron job de aniversários parado')
  }
}

/**
 * Verifica se é 08:00 e envia emails de aniversário
 */
async function checkAndSendBirthdayEmails(): Promise<void> {
  try {
    const now = new Date()
    const brasiliaTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    )

    // Verificar se é exatamente 08:00 (com tolerância de 1 minuto)
    const currentHour = brasiliaTime.getHours()
    const currentMinute = brasiliaTime.getMinutes()

    if (currentHour === 8 && currentMinute === 0) {
      console.log('🕐 08:00 detectado - verificando aniversariantes do dia...')

      const todayISO = brasiliaTime.toISOString().split('T')[0]

      // Verificar se já foi processado hoje
      const alreadyProcessed = birthdayJobs.some(
        job =>
          job.targetDate === todayISO &&
          job.status === 'sent' &&
          job.scheduledTime.toISOString().split('T')[0] === todayISO
      )

      if (!alreadyProcessed) {
        await processBirthdayEmailsForDate(todayISO)

        // Registrar como processado
        const patients = await getAllPatients()
        const patientsWithEmail = patients
          .filter(patient => patient.email && patient.birthDate)
          .map(patient => ({
            name: patient.name,
            email: patient.email!,
            birthDate: patient.birthDate!,
          }))

        const todayBirthdays = getTodayBirthdays(patientsWithEmail)

        birthdayJobs.push({
          id: `birthday-${todayISO}`,
          scheduledTime: new Date(),
          targetDate: todayISO,
          status: 'sent',
          patientsCount: todayBirthdays.length,
        })
      } else {
        console.log('ℹ️ Aniversários de hoje já foram processados')
      }
    }
  } catch (error) {
    console.error('❌ Erro no cron job de aniversários:', error)
  }
}

/**
 * Processa emails de aniversário para uma data específica
 */
async function processBirthdayEmailsForDate(targetDate: string): Promise<void> {
  try {
    console.log(`🎂 Processando aniversários para ${targetDate}...`)

    // Buscar todos os pacientes
    const patients = await getAllPatients()

    // Filtrar pacientes com email e data de nascimento
    const patientsWithEmail = patients
      .filter(patient => patient.email && patient.birthDate)
      .map(patient => ({
        name: patient.name,
        email: patient.email!,
        birthDate: patient.birthDate!,
      }))

    // Verificar aniversariantes do dia
    const todayBirthdays = getTodayBirthdays(patientsWithEmail)

    if (todayBirthdays.length === 0) {
      console.log(`ℹ️ Nenhum aniversariante encontrado para ${targetDate}`)
      return
    }

    console.log(
      `🎉 ${todayBirthdays.length} aniversariante(s) encontrado(s) para ${targetDate}`
    )

    // Processar envio de emails
    await processBirthdayEmails(todayBirthdays)

    console.log(
      `✅ Emails de aniversário processados com sucesso para ${targetDate}!`
    )
  } catch (error) {
    console.error(
      `❌ Erro ao processar aniversários para ${targetDate}:`,
      error
    )

    // Registrar como falha
    birthdayJobs.push({
      id: `birthday-failed-${targetDate}`,
      scheduledTime: new Date(),
      targetDate,
      status: 'failed',
      patientsCount: 0,
    })
  }
}

/**
 * Força o processamento de aniversários para hoje (para testes)
 */
export async function forceProcessTodayBirthdays(): Promise<void> {
  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]

  console.log('🔧 Forçando processamento de aniversários de hoje...')
  await processBirthdayEmailsForDate(todayISO)
}

/**
 * Agenda manualmente o processamento de aniversários para uma data específica
 */
export async function scheduleManualBirthdayCheck(
  targetDate: string
): Promise<void> {
  console.log(`📋 Processamento manual de aniversários para ${targetDate}...`)
  await processBirthdayEmailsForDate(targetDate)
}

/**
 * Obtém estatísticas dos jobs de aniversário
 */
export function getBirthdayJobStats(): {
  totalJobs: number
  processedToday: number
  pendingJobs: number
  totalBirthdaysProcessed: number
} {
  const todayISO = new Date().toISOString().split('T')[0]

  const processedToday = birthdayJobs.filter(
    job =>
      job.status === 'sent' &&
      job.scheduledTime.toISOString().split('T')[0] === todayISO
  )

  return {
    totalJobs: birthdayJobs.length,
    processedToday: processedToday.length,
    pendingJobs: birthdayJobs.filter(job => job.status === 'pending').length,
    totalBirthdaysProcessed: processedToday.reduce(
      (sum, job) => sum + job.patientsCount,
      0
    ),
  }
}

/**
 * Limpa jobs antigos de aniversário (mais de 30 dias)
 */
export function cleanupOldBirthdayJobs(): void {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const initialCount = birthdayJobs.length
  birthdayJobs = birthdayJobs.filter(job => job.scheduledTime > thirtyDaysAgo)

  const removedCount = initialCount - birthdayJobs.length
  if (removedCount > 0) {
    console.log(
      `🧹 Limpeza de aniversários: ${removedCount} jobs antigos removidos`
    )
  }
}

// Iniciar automaticamente quando o módulo for carregado (apenas no servidor)
if (typeof window === 'undefined') {
  console.log('🚀 Inicializando sistema de aniversários automático...')
  startBirthdayCronScheduler()

  // Limpeza automática a cada 7 dias
  setInterval(cleanupOldBirthdayJobs, 7 * 24 * 60 * 60 * 1000)
}

export default {
  startBirthdayCronScheduler,
  stopBirthdayCronScheduler,
  forceProcessTodayBirthdays,
  scheduleManualBirthdayCheck,
  getBirthdayJobStats,
  cleanupOldBirthdayJobs,
}
