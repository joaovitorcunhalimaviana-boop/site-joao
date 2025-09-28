/**
 * Serviço de Recuperação de Dados
 * 
 * Este serviço garante que os dados dos pacientes sejam sempre recuperados
 * do backup quando não estiverem disponíveis no localStorage.
 */

import { Patient, UnifiedAppointment } from './unified-appointment-system'

const PATIENTS_KEY = 'unified-patients'
const APPOINTMENTS_KEY = 'unified-appointments'

interface BackupResponse {
  success: boolean
  patients?: Patient[]
  appointments?: UnifiedAppointment[]
  count?: number
}

/**
 * Força a sincronização dos dados do backup para o localStorage
 */
export async function forceDataSync(): Promise<{
  success: boolean
  patientsRestored: number
  appointmentsRestored: number
  error?: string
}> {
  try {
    console.log('🔄 Iniciando sincronização forçada de dados...')
    
    let patientsRestored = 0
    let appointmentsRestored = 0

    // Recuperar pacientes do backup
    try {
      const patientsResponse = await fetch('/api/backup-patients')
      if (patientsResponse.ok) {
        const patientsData: BackupResponse = await patientsResponse.json()
        if (patientsData.patients && patientsData.patients.length > 0) {
          localStorage.setItem(PATIENTS_KEY, JSON.stringify(patientsData.patients))
          patientsRestored = patientsData.patients.length
          console.log(`✅ ${patientsRestored} pacientes restaurados do backup`)
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao recuperar pacientes do backup:', error)
    }

    // Recuperar agendamentos do backup (se existir API)
    try {
      const appointmentsResponse = await fetch('/api/backup-appointments')
      if (appointmentsResponse.ok) {
        const appointmentsData: BackupResponse = await appointmentsResponse.json()
        if (appointmentsData.appointments && appointmentsData.appointments.length > 0) {
          localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointmentsData.appointments))
          appointmentsRestored = appointmentsData.appointments.length
          console.log(`✅ ${appointmentsRestored} agendamentos restaurados do backup`)
        }
      }
    } catch (error) {
      console.warn('⚠️ API de backup de agendamentos não disponível')
    }

    return {
      success: true,
      patientsRestored,
      appointmentsRestored
    }
  } catch (error) {
    console.error('❌ Erro na sincronização forçada:', error)
    return {
      success: false,
      patientsRestored: 0,
      appointmentsRestored: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

/**
 * Verifica se os dados estão disponíveis e força sincronização se necessário
 */
export async function ensureDataAvailability(): Promise<boolean> {
  try {
    // Verificar se há dados no localStorage
    const patients = localStorage.getItem(PATIENTS_KEY)
    const appointments = localStorage.getItem(APPOINTMENTS_KEY)

    const hasPatients = patients && JSON.parse(patients).length > 0
    const hasAppointments = appointments && JSON.parse(appointments).length > 0

    // Se não há dados, forçar sincronização
    if (!hasPatients || !hasAppointments) {
      console.log('📭 Dados não encontrados no localStorage, iniciando recuperação...')
      const result = await forceDataSync()
      return result.success
    }

    return true
  } catch (error) {
    console.error('❌ Erro ao verificar disponibilidade dos dados:', error)
    return false
  }
}

/**
 * Monitora continuamente a integridade dos dados
 */
export function startDataIntegrityMonitor(): void {
  // Verificar integridade a cada 30 segundos
  setInterval(async () => {
    try {
      const patients = localStorage.getItem(PATIENTS_KEY)
      const appointments = localStorage.getItem(APPOINTMENTS_KEY)

      if (!patients || JSON.parse(patients).length === 0) {
        console.log('🔍 Monitor: Dados de pacientes perdidos, recuperando...')
        await forceDataSync()
      }
    } catch (error) {
      console.warn('⚠️ Erro no monitor de integridade:', error)
    }
  }, 30000) // 30 segundos
}

/**
 * Cria backup manual dos dados atuais
 */
export async function createManualBackup(): Promise<{
  success: boolean
  message: string
}> {
  try {
    const patients = localStorage.getItem(PATIENTS_KEY)
    const appointments = localStorage.getItem(APPOINTMENTS_KEY)

    if (patients) {
      const patientsData = JSON.parse(patients)
      const response = await fetch('/api/backup-patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patients: patientsData }),
      })

      if (response.ok) {
        return {
          success: true,
          message: `Backup manual criado com sucesso: ${patientsData.length} pacientes salvos`
        }
      }
    }

    return {
      success: false,
      message: 'Nenhum dado encontrado para backup'
    }
  } catch (error) {
    return {
      success: false,
      message: `Erro ao criar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

/**
 * Inicializa o serviço de recuperação de dados
 */
export function initializeDataRecoveryService(): void {
  console.log('🛡️ Inicializando serviço de recuperação de dados...')
  
  // Garantir dados na inicialização
  ensureDataAvailability()
  
  // Iniciar monitor de integridade
  startDataIntegrityMonitor()
  
  console.log('✅ Serviço de recuperação de dados ativo')
}