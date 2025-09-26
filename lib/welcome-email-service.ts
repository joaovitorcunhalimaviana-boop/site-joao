import { sendWelcomeEmail, PatientEmailData } from './email-service'
import { IntegratedEmailData } from './email-integration'

/**
 * Serviço para envio automático de emails de boas-vindas
 * para todos os pontos de cadastro de pacientes
 */

interface WelcomeEmailLog {
  email: string
  name: string
  sentAt: string
  source: string
  success: boolean
}

interface WelcomeEmailLogs {
  logs: WelcomeEmailLog[]
  lastCheck: string
}

const WELCOME_LOGS_FILE = 'data/welcome-email-logs.json'

// Função para ler logs de emails de boas-vindas
function readWelcomeEmailLogs(): WelcomeEmailLogs {
  const fs = require('fs')
  const path = require('path')
  
  const dataDir = path.join(process.cwd(), 'data')
  const logsFile = path.join(dataDir, 'welcome-email-logs.json')
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  if (!fs.existsSync(logsFile)) {
    const initialLogs: WelcomeEmailLogs = {
      logs: [],
      lastCheck: new Date().toISOString()
    }
    fs.writeFileSync(logsFile, JSON.stringify(initialLogs, null, 2))
    return initialLogs
  }
  
  const data = fs.readFileSync(logsFile, 'utf8')
  return JSON.parse(data)
}

// Função para salvar logs de emails de boas-vindas
function saveWelcomeEmailLogs(logs: WelcomeEmailLogs): void {
  const fs = require('fs')
  const path = require('path')
  
  const dataDir = path.join(process.cwd(), 'data')
  const logsFile = path.join(dataDir, 'welcome-email-logs.json')
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2))
}

// Verificar se já foi enviado email de boas-vindas
function alreadySentWelcomeEmail(email: string, logs: WelcomeEmailLog[]): boolean {
  return logs.some(log => log.email === email && log.success)
}

/**
 * Enviar email de boas-vindas para um paciente específico
 */
export async function sendWelcomeEmailToPatient(
  patientData: IntegratedEmailData
): Promise<boolean> {
  try {
    const logs = readWelcomeEmailLogs()
    
    // Verificar se já foi enviado
    if (alreadySentWelcomeEmail(patientData.email, logs.logs)) {
      console.log(`📧 Email de boas-vindas já foi enviado para: ${patientData.email}`)
      return true
    }
    
    // Preparar dados para o email
    const emailData: PatientEmailData = {
      name: patientData.name,
      email: patientData.email,
      birthDate: patientData.birthDate
    }
    
    console.log(`📧 Enviando email de boas-vindas para: ${patientData.name} (${patientData.email})`)
    console.log(`📍 Origem do cadastro: ${patientData.registrationSources?.join(', ') || patientData.source}`)
    
    // Enviar email
    const success = await sendWelcomeEmail(emailData)
    
    // Registrar no log
    const logEntry: WelcomeEmailLog = {
      email: patientData.email,
      name: patientData.name,
      sentAt: new Date().toISOString(),
      source: patientData.registrationSources?.join(', ') || patientData.source,
      success
    }
    
    logs.logs.push(logEntry)
    logs.lastCheck = new Date().toISOString()
    saveWelcomeEmailLogs(logs)
    
    if (success) {
      console.log(`✅ Email de boas-vindas enviado com sucesso para: ${patientData.name}`)
    } else {
      console.log(`❌ Falha ao enviar email de boas-vindas para: ${patientData.name}`)
    }
    
    return success
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error)
    return false
  }
}

/**
 * Enviar emails de boas-vindas para todos os novos pacientes
 */
export async function sendWelcomeEmailsToNewPatients(): Promise<{
  success: boolean
  stats: {
    totalChecked: number
    emailsSent: number
    emailsFailed: number
    alreadySent: number
  }
  message: string
}> {
  try {
    console.log('🔄 Iniciando envio de emails de boas-vindas para novos pacientes...')
    
    // Importar função de integração
    const { readIntegratedEmailData } = require('./email-integration')
    const integratedEmails = readIntegratedEmailData()
    const logs = readWelcomeEmailLogs()
    
    let emailsSent = 0
    let emailsFailed = 0
    let alreadySent = 0
    
    console.log(`📊 Total de emails integrados: ${integratedEmails.length}`)
    
    for (const emailData of integratedEmails) {
      // Verificar se já foi enviado
      if (alreadySentWelcomeEmail(emailData.email, logs.logs)) {
        alreadySent++
        continue
      }
      
      // Enviar email de boas-vindas
      const success = await sendWelcomeEmailToPatient(emailData)
      
      if (success) {
        emailsSent++
      } else {
        emailsFailed++
      }
      
      // Pequena pausa entre envios
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    const stats = {
      totalChecked: integratedEmails.length,
      emailsSent,
      emailsFailed,
      alreadySent
    }
    
    console.log('📊 Estatísticas de emails de boas-vindas:')
    console.log(`   - Total verificado: ${stats.totalChecked}`)
    console.log(`   - Emails enviados: ${stats.emailsSent}`)
    console.log(`   - Emails falharam: ${stats.emailsFailed}`)
    console.log(`   - Já enviados anteriormente: ${stats.alreadySent}`)
    
    return {
      success: true,
      stats,
      message: `Emails de boas-vindas processados: ${emailsSent} enviados, ${emailsFailed} falharam, ${alreadySent} já enviados`
    }
  } catch (error) {
    console.error('❌ Erro ao processar emails de boas-vindas:', error)
    return {
      success: false,
      stats: {
        totalChecked: 0,
        emailsSent: 0,
        emailsFailed: 0,
        alreadySent: 0
      },
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}