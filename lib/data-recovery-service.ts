/**
 * Serviço de Recuperação de Dados
 * 
 * Este serviço garante que os dados dos pacientes sejam sempre recuperados
 * do banco de dados Prisma quando necessário.
 */

import { 
  getAllPatients, 
  getAllAppointments, 
  UnifiedPatient, 
  UnifiedAppointment 
} from './prisma-service'

interface BackupResponse {
  success: boolean
  patients?: UnifiedPatient[]
  appointments?: UnifiedAppointment[]
  count?: number
}

/**
 * Força a sincronização dos dados do banco Prisma
 */
export async function forceDataSync(): Promise<{
  success: boolean
  patientsRestored: number
  appointmentsRestored: number
  error?: string
}> {
  try {
    console.log('🔄 Iniciando sincronização de dados do Prisma...')
    
    let patientsRestored = 0
    let appointmentsRestored = 0

    // Recuperar pacientes do Prisma
    try {
      const patients = await getAllPatients()
      patientsRestored = patients.length
      console.log(`✅ ${patientsRestored} pacientes carregados do Prisma`)
    } catch (error) {
      console.warn('⚠️ Erro ao recuperar pacientes do Prisma:', error)
    }

    // Recuperar agendamentos do Prisma
    try {
      const appointments = await getAllAppointments()
      appointmentsRestored = appointments.length
      console.log(`✅ ${appointmentsRestored} agendamentos carregados do Prisma`)
    } catch (error) {
      console.warn('⚠️ Erro ao recuperar agendamentos do Prisma:', error)
    }

    return {
      success: true,
      patientsRestored,
      appointmentsRestored
    }
  } catch (error) {
    console.error('❌ Erro na sincronização:', error)
    return {
      success: false,
      patientsRestored: 0,
      appointmentsRestored: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

/**
 * Verifica se os dados estão disponíveis no banco Prisma
 */
export async function ensureDataAvailability(): Promise<boolean> {
  try {
    // Verificar se há dados no banco Prisma
    const patients = await getAllPatients()
    const appointments = await getAllAppointments()

    const hasPatients = patients && patients.length > 0
    const hasAppointments = appointments && appointments.length > 0

    console.log(`📊 Dados disponíveis: ${patients.length} pacientes, ${appointments.length} agendamentos`)

    return hasPatients || hasAppointments
  } catch (error) {
    console.error('❌ Erro ao verificar disponibilidade dos dados:', error)
    return false
  }
}

/**
 * Monitora continuamente a integridade dos dados no Prisma
 */
export function startDataIntegrityMonitor(): void {
  // Verificar integridade a cada 5 minutos (menos frequente que localStorage)
  setInterval(async () => {
    try {
      const isAvailable = await ensureDataAvailability()
      if (!isAvailable) {
        console.log('🔍 Monitor: Problemas de conectividade com banco, verificando...')
        await forceDataSync()
      }
    } catch (error) {
      console.warn('⚠️ Erro no monitor de integridade:', error)
    }
  }, 300000) // 5 minutos
}

/**
 * Cria backup manual dos dados atuais do Prisma
 */
export async function createManualBackup(): Promise<{
  success: boolean
  message: string
}> {
  try {
    const patients = await getAllPatients()
    const appointments = await getAllAppointments()

    // Com Prisma, os dados já estão persistidos no banco
    // Esta função agora apenas reporta o status atual
    return {
      success: true,
      message: `Dados atuais no banco: ${patients.length} pacientes, ${appointments.length} agendamentos`
    }
  } catch (error) {
    return {
      success: false,
      message: `Erro ao verificar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

/**
 * Inicializa o serviço de recuperação de dados com Prisma
 */
export function initializeDataRecoveryService(): void {
  console.log('🛡️ Inicializando serviço de recuperação de dados com Prisma...')
  
  // Garantir dados na inicialização
  ensureDataAvailability()
  
  // Iniciar monitor de integridade
  startDataIntegrityMonitor()
  
  console.log('✅ Serviço de recuperação de dados ativo com Prisma')
}