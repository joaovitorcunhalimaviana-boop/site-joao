import { NextRequest, NextResponse } from 'next/server'
import { getAllPatients, createOrUpdatePatient } from '@/lib/unified-data-service'

// Interface para compatibilidade com o sistema antigo
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

// Função para obter dados integrados de emails do sistema unificado
function getIntegratedEmailData(): IntegratedEmailData[] {
  try {
    const patients = getAllPatients()
    
    return patients
      .filter(patient => patient.email) // Apenas pacientes com email
      .map(patient => ({
        email: patient.email!,
        name: patient.name,
        whatsapp: patient.whatsapp,
        birthDate: patient.birthDate,
        source: determineSource(patient.registrationSources || []),
        subscribed: isSubscribed(patient.emailPreferences),
        subscribedAt: patient.createdAt || new Date().toISOString(),
        patientId: patient.id,
        registrationSources: patient.registrationSources,
        preferences: {
          healthTips: patient.emailPreferences?.healthTips || false,
          appointments: patient.emailPreferences?.appointments || false,
          promotions: patient.emailPreferences?.promotions || false
        }
      }))
  } catch (error) {
    console.error('❌ Erro ao obter dados integrados de emails:', error)
    return []
  }
}

// Função auxiliar para determinar a fonte principal
function determineSource(sources: string[]): 'newsletter' | 'appointment' | 'both' {
  const hasNewsletter = sources.includes('newsletter')
  const hasAppointment = sources.some(s => ['public_scheduling', 'doctor_area', 'appointment'].includes(s))
  
  if (hasNewsletter && hasAppointment) return 'both'
  if (hasNewsletter) return 'newsletter'
  if (hasAppointment) return 'appointment'
  return 'appointment' // default
}

// Função auxiliar para verificar se está inscrito
function isSubscribed(preferences: any): boolean {
  if (!preferences) return false
  return preferences.healthTips || preferences.appointments || preferences.promotions
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
        const data = getIntegratedEmailData()
        return NextResponse.json({ success: true, data })

      case 'birthdays':
        const allEmails = getIntegratedEmailData()
        const birthdayEmails = allEmails.filter(email => {
          if (!email.birthDate) return false
          
          const today = new Date()
          const birthDate = new Date(email.birthDate)
          
          return (
            birthDate.getMonth() === today.getMonth() &&
            birthDate.getDate() === today.getDate()
          )
        })
        
        return NextResponse.json({ 
          success: true, 
          birthdayEmails,
          count: birthdayEmails.length 
        })

      case 'check':
        const email = searchParams.get('email')
        if (!email) {
          return NextResponse.json(
            { success: false, message: 'Email é obrigatório' },
            { status: 400 }
          )
        }
        
        const normalizedEmail = normalizeEmail(email)
        const allData = getIntegratedEmailData()
        const exists = allData.some(item => normalizeEmail(item.email) === normalizedEmail)
        
        return NextResponse.json({ 
          success: true, 
          exists,
          email: normalizedEmail
        })

      default:
        const integratedData = getIntegratedEmailData()
        return NextResponse.json({
          success: true,
          data: integratedData,
          stats: {
            total: integratedData.length,
            subscribed: integratedData.filter(item => item.subscribed).length,
            sources: {
              newsletter: integratedData.filter(item => item.source === 'newsletter').length,
              appointment: integratedData.filter(item => item.source === 'appointment').length,
              both: integratedData.filter(item => item.source === 'both').length
            }
          }
        })
    }
  } catch (error) {
    console.error('❌ Erro na API de integração de emails:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Integrar dados de emails
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'integrate':
        // A integração agora é feita automaticamente pelo sistema unificado
        // Esta ação retorna apenas estatísticas do sistema atual
        const integratedData = getIntegratedEmailData()
        const patients = getAllPatients()
        
        return NextResponse.json({
          success: true,
          stats: {
            totalPatients: patients.length,
            patientsWithEmail: patients.filter(p => p.email).length,
            subscribedPatients: integratedData.filter(item => item.subscribed).length,
            sources: {
              newsletter: integratedData.filter(item => item.source === 'newsletter').length,
              appointment: integratedData.filter(item => item.source === 'appointment').length,
              both: integratedData.filter(item => item.source === 'both').length
            }
          },
          message: `✅ Sistema unificado ativo! ${integratedData.length} emails integrados.`
        })

      case 'add':
        // Adicionar email individual ao sistema unificado
        const { email, name, source, additionalData } = body
        
        if (!email || !name || !source) {
          return NextResponse.json({ 
            success: false, 
            message: 'Email, nome e source são obrigatórios' 
          }, { status: 400 })
        }

        const allPatients = getAllPatients()
        const existingPatient = allPatients.find(p => p.email?.toLowerCase() === email.toLowerCase())

        if (existingPatient) {
          // Atualizar paciente existente
          const updatedSources = existingPatient.registrationSources || []
          if (!updatedSources.includes(source)) {
            updatedSources.push(source)
          }

          const updatedPatient = {
            ...existingPatient,
            registrationSources: updatedSources,
            whatsapp: additionalData?.whatsapp || existingPatient.whatsapp,
            birthDate: additionalData?.birthDate || existingPatient.birthDate,
            emailPreferences: {
              ...existingPatient.emailPreferences,
              ...additionalData?.preferences
            }
          }

          const result = createOrUpdatePatient(updatedPatient)
          
          if (!result.success) {
            return NextResponse.json({ 
              success: false, 
              message: result.message 
            }, { status: 400 })
          }

          return NextResponse.json({
            success: true,
            message: 'Email atualizado com sucesso',
            patientId: result.patient?.id,
            updated: true
          })
        } else {
          // Criar novo paciente
          const newPatient = {
            id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            email,
            whatsapp: additionalData?.whatsapp,
            birthDate: additionalData?.birthDate,
            registrationSources: [source],
            emailPreferences: additionalData?.preferences || {
              healthTips: true,
              appointments: true,
              promotions: false
            },
            createdAt: new Date().toISOString()
          }

          const result = createOrUpdatePatient(newPatient)
          
          if (!result.success) {
            return NextResponse.json({ 
              success: false, 
              message: result.message 
            }, { status: 400 })
          }

          return NextResponse.json({
            success: true,
            message: 'Email adicionado com sucesso',
            patientId: result.patient?.id,
            created: true
          })
        }

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Ação não reconhecida' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Erro na API de integração de emails:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}