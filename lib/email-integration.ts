// Sistema de Integração de Emails
// Integra newsletter e sistema de pacientes para evitar duplicatas e garantir cobertura completa

// Interfaces
export interface IntegratedEmailData {
  email: string
  name: string
  whatsapp?: string
  birthDate?: string
  source: 'newsletter' | 'appointment' | 'both'
  subscribed: boolean
  subscribedAt: string
  patientId?: string
  registrationSources?: string[] // Rastrear todas as origens de cadastro
  preferences: {
    healthTips: boolean
    appointments: boolean
    promotions: boolean
  }
}

// Função para ler dados integrados de emails via API
export async function readIntegratedEmailData(): Promise<IntegratedEmailData[]> {
  try {
    const response = await fetch('/api/email-integration?action=read')
    const result = await response.json()
    
    if (result.success) {
      return result.data
    } else {
      console.error('❌ Erro ao ler dados integrados de emails:', result.message)
      return []
    }
  } catch (error) {
    console.error('❌ Erro ao ler dados integrados de emails:', error)
    return []
  }
}

// Função para normalizar email
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// Função principal para integrar emails via API
export async function integrateEmailSystems(): Promise<{
  success: boolean
  stats: {
    newsletterSubscribers: number
    appointmentPatients: number
    totalIntegrated: number
    duplicatesFound: number
    newIntegrations: number
  }
  message: string
}> {
  try {
    console.log('🔄 Iniciando integração de sistemas de email...')

    const response = await fetch('/api/email-integration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'integrate' })
    })

    const result = await response.json()
    
    if (result.success) {
      return result
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('❌ Erro na integração de emails:', error)
    return {
      success: false,
      stats: {
        newsletterSubscribers: 0,
        appointmentPatients: 0,
        totalIntegrated: 0,
        duplicatesFound: 0,
        newIntegrations: 0
      },
      message: `❌ Erro na integração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

// Função para verificar se email existe via API
export async function checkEmailExists(email: string): Promise<{
  exists: boolean
  source?: 'newsletter' | 'appointment' | 'both'
  data?: IntegratedEmailData
}> {
  try {
    const response = await fetch(`/api/email-integration?action=check&email=${encodeURIComponent(email)}`)
    const result = await response.json()
    
    if (result.success) {
      return {
        exists: result.exists,
        source: result.source,
        data: result.data
      }
    } else {
      console.error('❌ Erro ao verificar email:', result.message)
      return { exists: false }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar email:', error)
    return { exists: false }
  }
}

// Função para obter emails de aniversário via API
export async function getAllBirthdayEmails(): Promise<IntegratedEmailData[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/email-integration?action=birthdays`)
    const result = await response.json()
    
    if (result.success) {
      return result.data
    } else {
      console.error('❌ Erro ao obter emails de aniversário:', result.message)
      return []
    }
  } catch (error) {
    console.error('❌ Erro ao obter emails de aniversário:', error)
    return []
  }
}

// Função para adicionar email ao sistema integrado via API
export async function addEmailToIntegratedSystem(
  email: string,
  name: string,
  source: 'newsletter' | 'appointment',
  additionalData?: {
    whatsapp?: string
    birthDate?: string
    patientId?: string
    preferences?: {
      healthTips: boolean
      appointments: boolean
      promotions: boolean
    }
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/email-integration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add',
        email,
        name,
        source,
        additionalData
      })
    })

    const result = await response.json()
    
    if (result.success) {
      return result
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar email:', error)
    return {
      success: false,
      message: `❌ Erro ao adicionar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}