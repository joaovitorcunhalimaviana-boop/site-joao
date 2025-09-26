// Sistema de Integração de Emails
// Integra newsletter e sistema de pacientes para evitar duplicatas e garantir cobertura completa

import fs from 'fs'
import path from 'path'
import { getAllPatients, type Patient } from './unified-appointment-system'

// Interfaces
interface Subscriber {
  id: string
  email: string
  name: string
  whatsapp?: string
  birthDate?: string
  subscribed: boolean
  subscribedAt: string
  source: 'newsletter' | 'appointment' | 'integrated'
  preferences: {
    healthTips: boolean
    appointments: boolean
    promotions: boolean
  }
}

interface NewsletterData {
  subscribers: Subscriber[]
  newsletters: any[]
}

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

// Caminhos dos arquivos
const NEWSLETTER_FILE = path.join(process.cwd(), 'data', 'newsletter.json')
const INTEGRATED_EMAILS_FILE = path.join(process.cwd(), 'data', 'integrated-emails.json')

// Função para ler dados da newsletter
function readNewsletterData(): NewsletterData {
  try {
    if (!fs.existsSync(NEWSLETTER_FILE)) {
      return { subscribers: [], newsletters: [] }
    }
    const data = fs.readFileSync(NEWSLETTER_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('❌ Erro ao ler dados da newsletter:', error)
    return { subscribers: [], newsletters: [] }
  }
}

// Função para salvar dados da newsletter
function saveNewsletterData(data: NewsletterData): void {
  try {
    const dataDir = path.dirname(NEWSLETTER_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('❌ Erro ao salvar dados da newsletter:', error)
  }
}

// Função para ler dados integrados de emails
export function readIntegratedEmailData(): IntegratedEmailData[] {
  try {
    if (!fs.existsSync(INTEGRATED_EMAILS_FILE)) {
      return []
    }
    const data = fs.readFileSync(INTEGRATED_EMAILS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('❌ Erro ao ler dados integrados de emails:', error)
    return []
  }
}

// Função para salvar dados integrados de emails
function saveIntegratedEmailData(data: IntegratedEmailData[]): void {
  try {
    const dataDir = path.dirname(INTEGRATED_EMAILS_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(INTEGRATED_EMAILS_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('❌ Erro ao salvar dados integrados de emails:', error)
  }
}

// Função para normalizar email
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// Função para gerar ID único
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Função principal para integrar emails
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

    // Ler dados existentes
    const newsletterData = readNewsletterData()
    const patients = await getAllPatients()
    const existingIntegrated = readIntegratedEmailData()

    console.log(`📊 Newsletter: ${newsletterData.subscribers.length} subscribers`)
    console.log(`📊 Pacientes: ${patients.length} patients`)
    console.log(`📊 Integrados existentes: ${existingIntegrated.length}`)

    // Criar mapa de emails integrados existentes
    const integratedMap = new Map<string, IntegratedEmailData>()
    existingIntegrated.forEach(item => {
      integratedMap.set(normalizeEmail(item.email), item)
    })

    let duplicatesFound = 0
    let newIntegrations = 0

    // Processar subscribers da newsletter
    newsletterData.subscribers.forEach(subscriber => {
      if (!subscriber.email) return

      const normalizedEmail = normalizeEmail(subscriber.email)
      const existing = integratedMap.get(normalizedEmail)

      if (existing) {
        // Atualizar dados existentes se necessário
        if (existing.source === 'appointment') {
          existing.source = 'both'
          duplicatesFound++
        }
        // Adicionar origem da newsletter se não existir
        if (!existing.registrationSources) {
          existing.registrationSources = []
        }
        if (!existing.registrationSources.includes('newsletter')) {
          existing.registrationSources.push('newsletter')
        }
        // Manter dados mais recentes da newsletter
        existing.name = subscriber.name
        existing.whatsapp = subscriber.whatsapp || existing.whatsapp
        existing.birthDate = subscriber.birthDate || existing.birthDate
        existing.subscribed = subscriber.subscribed
        existing.subscribedAt = subscriber.subscribedAt
        existing.preferences = subscriber.preferences
      } else {
        // Novo registro da newsletter
        const integratedData: IntegratedEmailData = {
          email: subscriber.email,
          name: subscriber.name,
          whatsapp: subscriber.whatsapp,
          birthDate: subscriber.birthDate,
          source: 'newsletter',
          subscribed: subscriber.subscribed,
          subscribedAt: subscriber.subscribedAt,
          registrationSources: ['newsletter'],
          preferences: subscriber.preferences
        }
        integratedMap.set(normalizedEmail, integratedData)
        newIntegrations++
      }
    })

    // Processar pacientes do sistema de agendamento
    patients.forEach(patient => {
      if (!patient.email) return

      const normalizedEmail = normalizeEmail(patient.email)
      const existing = integratedMap.get(normalizedEmail)

      // Determinar a origem específica do paciente
      let patientSource = 'public_scheduling' // padrão
      if (patient.source === 'medical_area') {
        patientSource = 'medical_area'
      } else if (patient.source === 'secretary_area') {
        patientSource = 'secretary_area'
      }

      if (existing) {
        // Atualizar dados existentes
        if (existing.source === 'newsletter') {
          existing.source = 'both'
          duplicatesFound++
        }
        // Adicionar nova origem se não existir
        if (!existing.registrationSources) {
          existing.registrationSources = ['appointment']
        }
        if (!existing.registrationSources.includes(patientSource)) {
          existing.registrationSources.push(patientSource)
        }
        // Manter dados do paciente se não tiver na newsletter
        existing.patientId = patient.id
        existing.whatsapp = existing.whatsapp || patient.whatsapp
        existing.birthDate = existing.birthDate || patient.birthDate
      } else {
        // Novo registro do sistema de pacientes
        const integratedData: IntegratedEmailData = {
          email: patient.email,
          name: patient.name,
          whatsapp: patient.whatsapp,
          birthDate: patient.birthDate,
          source: 'appointment',
          subscribed: true, // Pacientes são automaticamente incluídos
          subscribedAt: patient.createdAt,
          patientId: patient.id,
          registrationSources: [patientSource],
          preferences: {
            healthTips: true,
            appointments: true,
            promotions: false
          }
        }
        integratedMap.set(normalizedEmail, integratedData)
        newIntegrations++
      }
    })

    // Converter mapa para array e salvar
    const integratedData = Array.from(integratedMap.values())
    saveIntegratedEmailData(integratedData)

    // Atualizar newsletter com dados integrados
    const updatedSubscribers: Subscriber[] = integratedData
      .filter(item => item.subscribed)
      .map(item => ({
        id: generateId(),
        email: item.email,
        name: item.name,
        whatsapp: item.whatsapp,
        birthDate: item.birthDate,
        subscribed: item.subscribed,
        subscribedAt: item.subscribedAt,
        source: item.source as 'newsletter' | 'appointment' | 'integrated',
        preferences: item.preferences
      }))

    // Salvar newsletter atualizada
    const updatedNewsletterData: NewsletterData = {
      subscribers: updatedSubscribers,
      newsletters: newsletterData.newsletters
    }
    saveNewsletterData(updatedNewsletterData)

    const stats = {
      newsletterSubscribers: newsletterData.subscribers.length,
      appointmentPatients: patients.filter(p => p.email).length,
      totalIntegrated: integratedData.length,
      duplicatesFound,
      newIntegrations
    }

    console.log('✅ Integração concluída com sucesso!')
    console.log('📊 Estatísticas:', stats)

    return {
      success: true,
      stats,
      message: `Integração concluída: ${stats.totalIntegrated} emails únicos, ${stats.duplicatesFound} duplicatas encontradas`
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
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// Função para verificar se um email já existe no sistema integrado
export async function checkEmailExists(email: string): Promise<{
  exists: boolean
  source?: 'newsletter' | 'appointment' | 'both'
  data?: IntegratedEmailData
}> {
  try {
    const integratedData = readIntegratedEmailData()
    const normalizedEmail = normalizeEmail(email)
    
    const existingData = integratedData.find(item => 
      normalizeEmail(item.email) === normalizedEmail
    )

    if (existingData) {
      return {
        exists: true,
        source: existingData.source,
        data: existingData
      }
    }

    return { exists: false }
  } catch (error) {
    console.error('❌ Erro ao verificar email:', error)
    return { exists: false }
  }
}

// Função para obter todos os emails para aniversários (integrados)
export async function getAllBirthdayEmails(): Promise<IntegratedEmailData[]> {
  try {
    // Garantir que a integração está atualizada
    await integrateEmailSystems()
    
    const integratedData = readIntegratedEmailData()
    
    // Retornar apenas emails com data de nascimento e que estão inscritos
    return integratedData.filter(item => 
      item.subscribed && 
      item.birthDate && 
      item.email
    )
  } catch (error) {
    console.error('❌ Erro ao obter emails de aniversário:', error)
    return []
  }
}

// Função para adicionar novo email ao sistema integrado
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
    const existingCheck = await checkEmailExists(email)
    
    if (existingCheck.exists) {
      return {
        success: false,
        message: `Email já existe no sistema (fonte: ${existingCheck.source})`
      }
    }

    const integratedData = readIntegratedEmailData()
    
    const newEmailData: IntegratedEmailData = {
      email: normalizeEmail(email),
      name,
      whatsapp: additionalData?.whatsapp,
      birthDate: additionalData?.birthDate,
      source,
      subscribed: true,
      subscribedAt: new Date().toISOString(),
      patientId: additionalData?.patientId,
      preferences: additionalData?.preferences || {
        healthTips: true,
        appointments: true,
        promotions: false
      }
    }

    integratedData.push(newEmailData)
    saveIntegratedEmailData(integratedData)

    // Atualizar newsletter também
    await integrateEmailSystems()

    return {
      success: true,
      message: 'Email adicionado ao sistema integrado com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar email:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}