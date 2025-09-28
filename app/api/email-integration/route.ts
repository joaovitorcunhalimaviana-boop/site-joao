import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getAllPatients } from '@/lib/unified-appointment-system'

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
  registrationSources?: string[]
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
function readIntegratedEmailData(): IntegratedEmailData[] {
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

// GET - Ler dados integrados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'read':
        const data = readIntegratedEmailData()
        return NextResponse.json({ success: true, data })

      case 'birthdays':
        const allEmails = readIntegratedEmailData()
        const birthdayEmails = allEmails.filter(email => {
          if (!email.birthDate) return false
          
          const today = new Date()
          const birthDate = new Date(email.birthDate)
          
          return (
            birthDate.getMonth() === today.getMonth() &&
            birthDate.getDate() === today.getDate()
          )
        })
        return NextResponse.json({ success: true, data: birthdayEmails })

      case 'check':
        const emailToCheck = searchParams.get('email')
        if (!emailToCheck) {
          return NextResponse.json({ success: false, message: 'Email é obrigatório' }, { status: 400 })
        }
        
        const integratedData = readIntegratedEmailData()
        const normalizedEmail = normalizeEmail(emailToCheck)
        const existingEmail = integratedData.find(item => normalizeEmail(item.email) === normalizedEmail)
        
        if (existingEmail) {
          return NextResponse.json({
            success: true,
            exists: true,
            source: existingEmail.source,
            data: existingEmail
          })
        } else {
          return NextResponse.json({
            success: true,
            exists: false
          })
        }

      default:
        return NextResponse.json({ success: false, message: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Erro na API de integração de emails:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Adicionar email ou integrar sistemas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'integrate':
        // Integração completa dos sistemas
        const newsletterData = readNewsletterData()
        const patients = await getAllPatients()
        const existingIntegrated = readIntegratedEmailData()

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
            duplicatesFound++
            if (existing.source === 'appointment') {
              existing.source = 'both'
              existing.registrationSources = existing.registrationSources || []
              if (!existing.registrationSources.includes('newsletter')) {
                existing.registrationSources.push('newsletter')
              }
            }
          } else {
            newIntegrations++
            const newIntegration: IntegratedEmailData = {
              email: subscriber.email,
              name: subscriber.name || 'Nome não informado',
              whatsapp: subscriber.whatsapp,
              birthDate: subscriber.birthDate,
              source: 'newsletter',
              subscribed: subscriber.subscribed,
              subscribedAt: subscriber.subscribedAt || new Date().toISOString(),
              registrationSources: ['newsletter'],
              preferences: subscriber.preferences || {
                healthTips: true,
                appointments: true,
                promotions: true
              }
            }
            integratedMap.set(normalizedEmail, newIntegration)
          }
        })

        // Processar pacientes
        patients.forEach(patient => {
          if (!patient.email) return

          const normalizedEmail = normalizeEmail(patient.email)
          const existing = integratedMap.get(normalizedEmail)

          if (existing) {
            duplicatesFound++
            if (existing.source === 'newsletter') {
              existing.source = 'both'
            }
            existing.patientId = patient.id
            existing.registrationSources = existing.registrationSources || []
            if (!existing.registrationSources.includes('appointment')) {
              existing.registrationSources.push('appointment')
            }
          } else {
            newIntegrations++
            const newIntegration: IntegratedEmailData = {
              email: patient.email,
              name: patient.name,
              whatsapp: patient.whatsapp,
              birthDate: patient.birthDate,
              source: 'appointment',
              subscribed: true,
              subscribedAt: new Date().toISOString(),
              patientId: patient.id,
              registrationSources: ['appointment'],
              preferences: {
                healthTips: true,
                appointments: true,
                promotions: false
              }
            }
            integratedMap.set(normalizedEmail, newIntegration)
          }
        })

        // Salvar dados integrados
        const finalIntegratedData = Array.from(integratedMap.values())
        saveIntegratedEmailData(finalIntegratedData)

        return NextResponse.json({
          success: true,
          stats: {
            newsletterSubscribers: newsletterData.subscribers.length,
            appointmentPatients: patients.length,
            totalIntegrated: finalIntegratedData.length,
            duplicatesFound,
            newIntegrations
          },
          message: `✅ Integração concluída! ${finalIntegratedData.length} emails integrados.`
        })

      case 'add':
        // Adicionar email individual
        const { email, name, source, additionalData } = body
        
        if (!email || !name || !source) {
          return NextResponse.json({ 
            success: false, 
            message: 'Email, nome e source são obrigatórios' 
          }, { status: 400 })
        }

        const currentData = readIntegratedEmailData()
        const normalizedNewEmail = normalizeEmail(email)
        const existingIndex = currentData.findIndex(item => normalizeEmail(item.email) === normalizedNewEmail)

        if (existingIndex >= 0) {
          // Atualizar existente
          const existing = currentData[existingIndex]
          existing.registrationSources = existing.registrationSources || []
          
          if (!existing.registrationSources.includes(source)) {
            existing.registrationSources.push(source)
          }

          if (existing.source !== source) {
            existing.source = existing.source === 'newsletter' && source === 'appointment' ? 'both' :
                            existing.source === 'appointment' && source === 'newsletter' ? 'both' : existing.source
          }

          if (additionalData) {
            if (additionalData.whatsapp) existing.whatsapp = additionalData.whatsapp
            if (additionalData.birthDate) existing.birthDate = additionalData.birthDate
            if (additionalData.patientId) existing.patientId = additionalData.patientId
            if (additionalData.preferences) existing.preferences = { ...existing.preferences, ...additionalData.preferences }
          }

          currentData[existingIndex] = existing
        } else {
          // Adicionar novo
          const newEmail: IntegratedEmailData = {
            email,
            name,
            whatsapp: additionalData?.whatsapp,
            birthDate: additionalData?.birthDate,
            source: source as 'newsletter' | 'appointment',
            subscribed: true,
            subscribedAt: new Date().toISOString(),
            patientId: additionalData?.patientId,
            registrationSources: [source],
            preferences: additionalData?.preferences || {
              healthTips: true,
              appointments: true,
              promotions: source === 'newsletter'
            }
          }
          currentData.push(newEmail)
        }

        saveIntegratedEmailData(currentData)
        return NextResponse.json({ success: true, message: 'Email adicionado com sucesso!' })

      default:
        return NextResponse.json({ success: false, message: 'Ação não reconhecida' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Erro na API de integração de emails:', error)
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 })
  }
}