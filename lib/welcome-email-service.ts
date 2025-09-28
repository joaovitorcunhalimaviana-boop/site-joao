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

/**
 * Enviar email de boas-vindas para um paciente específico
 */
export async function sendWelcomeEmailToPatient(
  patientData: IntegratedEmailData
): Promise<boolean> {
  try {
    console.log(`📧 Enviando email de boas-vindas para: ${patientData.name} (${patientData.email})`)
    console.log(`📍 Origem do cadastro: ${patientData.registrationSources?.join(', ') || patientData.source}`)
    
    // Chamar API route para enviar email
    const response = await fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: patientData.name,
        email: patientData.email,
        source: patientData.registrationSources?.join(', ') || patientData.source || 'website'
      })
    })

    const result = await response.json()

    if (response.ok && result.success) {
      console.log(`✅ Email de boas-vindas enviado com sucesso para: ${patientData.email}`)
      return true
    } else {
      console.error(`❌ Erro ao enviar email de boas-vindas para: ${patientData.email}`, result.error)
      return false
    }

  } catch (error) {
    console.error(`❌ Erro ao enviar email de boas-vindas para: ${patientData.email}`, error)
    return false
  }
}

/**
 * Processar todos os emails integrados e enviar boas-vindas
 */
export async function processIntegratedEmails(): Promise<void> {
  try {
    // Buscar emails integrados via API
    const response = await fetch('/api/integrated-emails')
    
    if (!response.ok) {
      console.error('❌ Erro ao buscar emails integrados')
      return
    }

    const integratedEmails: IntegratedEmailData[] = await response.json()
    
    console.log(`📊 Processando ${integratedEmails.length} emails integrados...`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const emailData of integratedEmails) {
      const success = await sendWelcomeEmailToPatient(emailData)
      
      if (success) {
        successCount++
      } else {
        errorCount++
      }
      
      // Aguardar um pouco entre envios para evitar spam
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log(`📈 Processamento concluído: ${successCount} sucessos, ${errorCount} erros`)
    
  } catch (error) {
    console.error('❌ Erro ao processar emails integrados:', error)
  }
}

/**
 * Verificar e processar novos emails automaticamente
 */
export async function checkAndProcessNewEmails(): Promise<void> {
  try {
    console.log('🔍 Verificando novos emails para processamento...')
    await processIntegratedEmails()
  } catch (error) {
    console.error('❌ Erro na verificação automática de emails:', error)
  }
}

// Função para uso em componentes React (apenas no cliente)
export async function sendWelcomeEmailClient(name: string, email: string, source?: string): Promise<boolean> {
  try {
    const response = await fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        source: source || 'website'
      })
    })

    const result = await response.json()
    return response.ok && result.success
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error)
    return false
  }
}

/**
 * Enviar emails de boas-vindas para novos pacientes
 */
export async function sendWelcomeEmailsToNewPatients(): Promise<{ success: boolean; message: string; processed: number }> {
  try {
    console.log('🚀 Iniciando envio de emails de boas-vindas para novos pacientes...')
    
    // Processar emails integrados
    await processIntegratedEmails()
    
    return {
      success: true,
      message: 'Emails de boas-vindas processados com sucesso',
      processed: 0 // Será atualizado pela função processIntegratedEmails
    }
  } catch (error) {
    console.error('❌ Erro ao enviar emails de boas-vindas:', error)
    return {
      success: false,
      message: `Erro ao processar emails: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      processed: 0
    }
  }
}