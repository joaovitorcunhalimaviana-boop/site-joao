// Sistema de agendamento automático diário às 20:00
import { getTodayISO, formatDateToBrazilian } from './date-utils'
import { getAppointmentsByDate } from './unified-appointment-system'

interface CronJob {
  id: string
  scheduledTime: Date
  targetDate: string
  status: 'pending' | 'sent' | 'failed'
}

let cronJobs: CronJob[] = []
let cronInterval: NodeJS.Timeout | null = null

/**
 * Inicia o sistema de cron job para envio diário às 20:00
 */
export function startDailyCronScheduler(): void {
  console.log('🚀 Iniciando sistema de cron job diário às 20:00...')
  
  // Verificar a cada minuto se chegou às 20:00
  cronInterval = setInterval(async () => {
    await checkAndSendDailyAgendas()
  }, 60000) // Verificar a cada 60 segundos
  
  console.log('✅ Sistema de cron job iniciado (verificação a cada minuto)')
}

/**
 * Para o sistema de cron job
 */
export function stopDailyCronScheduler(): void {
  if (cronInterval) {
    clearInterval(cronInterval)
    cronInterval = null
    console.log('⏹️ Sistema de cron job parado')
  }
}

/**
 * Verifica se é 20:00 e envia as agendas do dia seguinte
 */
async function checkAndSendDailyAgendas(): Promise<void> {
  try {
    const now = new Date()
    const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    
    // Verificar se é exatamente 20:00 (com tolerância de 1 minuto)
    const currentHour = brasiliaTime.getHours()
    const currentMinute = brasiliaTime.getMinutes()
    
    if (currentHour === 20 && currentMinute === 0) {
      console.log('🕐 20:00 detectado - enviando agendas do dia seguinte...')
      
      // Calcular data de amanhã
      const tomorrow = new Date(brasiliaTime)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowISO = tomorrow.toISOString().split('T')[0]
      
      // Verificar se já foi enviado hoje
      const todayISO = getTodayISO()
      const alreadySent = cronJobs.some(job => 
        job.targetDate === tomorrowISO && 
        job.status === 'sent' && 
        job.scheduledTime.toISOString().split('T')[0] === todayISO
      )
      
      if (!alreadySent) {
        await sendDailyAgendaForDate(tomorrowISO)
        
        // Registrar como enviado
        cronJobs.push({
          id: `daily-${todayISO}-${tomorrowISO}`,
          scheduledTime: new Date(),
          targetDate: tomorrowISO,
          status: 'sent'
        })
      } else {
        console.log('ℹ️ Agenda para amanhã já foi enviada hoje')
      }
    }
  } catch (error) {
    console.error('❌ Erro no cron job diário:', error)
  }
}

/**
 * Envia agenda diária para uma data específica
 */
async function sendDailyAgendaForDate(targetDate: string): Promise<void> {
  try {
    console.log(`📅 Enviando agenda diária para ${targetDate}...`)
    
    // Buscar consultas para a data
    const appointments = await getAppointmentsByDate(targetDate)
    
    if (appointments.length === 0) {
      console.log(`ℹ️ Nenhuma consulta encontrada para ${targetDate} - não enviando agenda`)
      return
    }
    
    // Enviar via API
    const response = await fetch('/api/daily-agenda', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetDate,
        appointments: appointments.map(apt => ({
          patientName: apt.patientName,
          appointmentTime: apt.appointmentTime,
          whatsapp: apt.patientWhatsapp,
          insuranceType: apt.insuranceType === 'particular' ? 'private' : 'unimed'
        }))
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log(`✅ Agenda diária enviada com sucesso para ${targetDate}!`)
      console.log(`👥 Total de pacientes: ${result.totalPatients}`)
    } else {
      console.error(`❌ Erro ao enviar agenda para ${targetDate}: ${response.status}`)
    }
    
  } catch (error) {
    console.error(`❌ Erro ao enviar agenda para ${targetDate}:`, error)
  }
}

/**
 * Agenda manualmente uma agenda para uma data específica
 */
export async function scheduleManualDailyAgenda(targetDate: string): Promise<void> {
  console.log(`📋 Agendamento manual de agenda para ${targetDate}...`)
  await sendDailyAgendaForDate(targetDate)
}

/**
 * Obtém estatísticas dos cron jobs
 */
export function getCronJobStats(): {
  totalJobs: number
  sentToday: number
  pendingJobs: number
} {
  const todayISO = getTodayISO()
  
  return {
    totalJobs: cronJobs.length,
    sentToday: cronJobs.filter(job => 
      job.status === 'sent' && 
      job.scheduledTime.toISOString().split('T')[0] === todayISO
    ).length,
    pendingJobs: cronJobs.filter(job => job.status === 'pending').length
  }
}

/**
 * Limpa jobs antigos (mais de 7 dias)
 */
export function cleanupOldCronJobs(): void {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const initialCount = cronJobs.length
  cronJobs = cronJobs.filter(job => job.scheduledTime > sevenDaysAgo)
  
  const removedCount = initialCount - cronJobs.length
  if (removedCount > 0) {
    console.log(`🧹 Limpeza: ${removedCount} jobs antigos removidos`)
  }
}

/**
 * Força o envio da agenda para amanhã (para testes)
 */
export async function forceSendTomorrowAgenda(): Promise<void> {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowISO = tomorrow.toISOString().split('T')[0]
  
  console.log('🔧 Forçando envio da agenda de amanhã...')
  await sendDailyAgendaForDate(tomorrowISO)
}

// Iniciar automaticamente quando o módulo for carregado
if (typeof window === 'undefined') { // Apenas no servidor
  startDailyCronScheduler()
  
  // Limpeza automática a cada 24 horas
  setInterval(cleanupOldCronJobs, 24 * 60 * 60 * 1000)
}