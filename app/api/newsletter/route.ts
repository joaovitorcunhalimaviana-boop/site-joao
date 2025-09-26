import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { sendWelcomeEmail } from '@/lib/email-service'
import { sendWelcomeEmailToPatient } from '@/lib/welcome-email-service'
import { 
  checkEmailExists, 
  addEmailToIntegratedSystem, 
  integrateEmailSystems,
  readIntegratedEmailData 
} from '@/lib/email-integration'

// Interfaces
interface Subscriber {
  id: string
  email: string
  name: string
  whatsapp?: string
  birthDate?: string
  subscribed: boolean
  subscribedAt: string
  preferences: {
    healthTips: boolean
    appointments: boolean
    promotions: boolean
  }
}

interface Newsletter {
  id: string
  subject: string
  content: string
  sentAt: string
  recipientCount: number
}

interface NewsletterData {
  subscribers: Subscriber[]
  newsletters: Newsletter[]
}

const DATA_DIR = path.join(process.cwd(), 'data')
const NEWSLETTER_FILE = path.join(DATA_DIR, 'newsletter.json')

// Função para garantir que o diretório existe
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Função para ler dados do newsletter
function readNewsletterData(): NewsletterData {
  ensureDataDirectory()

  if (!fs.existsSync(NEWSLETTER_FILE)) {
    const initialData: NewsletterData = {
      subscribers: [],
      newsletters: [],
    }
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(initialData, null, 2))
    return initialData
  }

  const data = fs.readFileSync(NEWSLETTER_FILE, 'utf8')
  return JSON.parse(data)
}

// Função para salvar dados do newsletter
function saveNewsletterData(data: NewsletterData) {
  ensureDataDirectory()
  fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(data, null, 2))
}

// Função para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função para gerar ID único
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// GET - Obter subscribers e newsletters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const data = readNewsletterData()

    if (type === 'subscribers') {
      return NextResponse.json({
        success: true,
        subscribers: data.subscribers.filter(sub => sub.subscribed),
        total: data.subscribers.filter(sub => sub.subscribed).length,
      })
    }

    if (type === 'newsletters') {
      return NextResponse.json({
        success: true,
        newsletters: data.newsletters.sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        ),
      })
    }

    // Retornar estatísticas gerais
    const activeSubscribers = data.subscribers.filter(sub => sub.subscribed)
    const totalNewsletters = data.newsletters.length
    const avgOpenRate =
      data.newsletters.length > 0
        ? data.newsletters.reduce((acc, nl) => acc + (nl.openRate || 0), 0) /
          data.newsletters.length
        : 0

    return NextResponse.json({
      success: true,
      stats: {
        totalSubscribers: activeSubscribers.length,
        totalNewsletters,
        avgOpenRate: Math.round(avgOpenRate * 100) / 100,
        recentSubscribers: activeSubscribers
          .sort(
            (a, b) =>
              new Date(b.subscribedAt).getTime() -
              new Date(a.subscribedAt).getTime()
          )
          .slice(0, 5),
      },
    })
  } catch (error) {
    console.error('Erro ao obter dados do newsletter:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Inscrever no newsletter ou enviar newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    const data = readNewsletterData()

    if (action === 'subscribe') {
      const { email, name, whatsapp, birthDate, preferences } = body

      // Validações
      if (!email || !name) {
        return NextResponse.json(
          { success: false, message: 'Email e nome são obrigatórios' },
          { status: 400 }
        )
      }

      if (!isValidEmail(email)) {
        return NextResponse.json(
          { success: false, message: 'Email inválido' },
          { status: 400 }
        )
      }

      // Verificar se o email já existe no sistema integrado
      const emailCheck = await checkEmailExists(email)
      
      if (emailCheck.exists) {
        // Se já existe, verificar se está ativo
        if (emailCheck.data?.subscribed) {
          return NextResponse.json(
            { 
              success: false,
              message: 'Este email já está cadastrado na newsletter',
              source: emailCheck.source 
            },
            { status: 409 }
          )
        } else {
          // Reativar inscrição existente
          const existingIndex = data.subscribers.findIndex(
            sub => sub.email.toLowerCase() === email.toLowerCase()
          )
          
          if (existingIndex !== -1) {
            data.subscribers[existingIndex] = {
              ...data.subscribers[existingIndex],
              subscribed: true,
              subscribedAt: new Date().toISOString(),
              name,
              whatsapp,
              birthDate,
              preferences: preferences || {
                healthTips: true,
                appointments: true,
                promotions: false,
              }
            }
            saveNewsletterData(data)
            
            // Atualizar sistema integrado
            await integrateEmailSystems()
            
            // Enviar email de boas-vindas usando o novo serviço
            try {
              const integratedEmails = readIntegratedEmailData()
              const patientData = integratedEmails.find(e => e.email.toLowerCase() === email.toLowerCase())
              
              if (patientData) {
                await sendWelcomeEmailToPatient(patientData)
              } else {
                await sendWelcomeEmail({ name, email, birthDate })
              }
            } catch (emailError) {
              console.error('❌ Erro ao enviar email de boas-vindas:', emailError)
            }
            
            return NextResponse.json({
              success: true,
              message: 'Inscrição reativada com sucesso!',
              reactivated: true
            })
          }
        }
      }

      // Adicionar ao sistema integrado
      const addResult = await addEmailToIntegratedSystem(email, name, 'newsletter', {
        whatsapp,
        birthDate,
        preferences: preferences || {
          healthTips: true,
          appointments: true,
          promotions: false,
        }
      })

      if (!addResult.success) {
        return NextResponse.json(
          { success: false, message: addResult.message },
          { status: 400 }
        )
      }

      saveNewsletterData(data)

      // Enviar email de boas-vindas usando o novo serviço
      try {
        // Buscar dados integrados do paciente
        const integratedEmails = readIntegratedEmailData()
        const patientData = integratedEmails.find(e => e.email.toLowerCase() === email.toLowerCase())
        
        if (patientData) {
          await sendWelcomeEmailToPatient(patientData)
        } else {
          // Fallback para o método antigo se não encontrar nos dados integrados
          await sendWelcomeEmail({ name, email, birthDate })
        }
      } catch (emailError) {
        console.error('❌ Erro ao enviar email de boas-vindas:', emailError)
        // Não falhar a inscrição por causa do email
      }

      console.log(`✅ Nova inscrição na newsletter: ${email} (${name})`)

      return NextResponse.json({
        success: true,
        message: 'Inscrição realizada com sucesso!',
        subscriber: {
          email,
          name,
          subscribedAt: new Date().toISOString()
        }
      })
    }

    if (action === 'send') {
      const { subject, content, htmlContent, recipients } = body

      // Validações
      if (!subject || !content) {
        return NextResponse.json(
          { success: false, error: 'Assunto e conteúdo são obrigatórios' },
          { status: 400 }
        )
      }

      // Criar newsletter
      const newsletter: Newsletter = {
        id: generateId(),
        subject,
        content,
        htmlContent: htmlContent || content,
        sentAt: new Date().toISOString(),
        recipients:
          recipients || data.subscribers.filter(sub => sub.subscribed).length,
        openRate: 0,
        clickRate: 0,
      }

      data.newsletters.push(newsletter)
      saveNewsletterData(data)

      // Aqui você integraria com um serviço de email como SendGrid, Mailgun, etc.
      // Por enquanto, apenas simulamos o envio

      return NextResponse.json({
        success: true,
        message: 'Newsletter enviado com sucesso!',
        newsletter,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Ação não reconhecida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao processar newsletter:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar preferências do subscriber
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, preferences, action } = body

    const data = readNewsletterData()

    if (action === 'unsubscribe') {
      const subscriber = data.subscribers.find(sub => sub.email === email)

      if (!subscriber) {
        return NextResponse.json(
          { success: false, error: 'Subscriber não encontrado' },
          { status: 404 }
        )
      }

      subscriber.subscribed = false
      saveNewsletterData(data)

      return NextResponse.json({
        success: true,
        message: 'Inscrição cancelada com sucesso',
      })
    }

    if (action === 'update-preferences') {
      const subscriber = data.subscribers.find(sub => sub.email === email)

      if (!subscriber) {
        return NextResponse.json(
          { success: false, error: 'Subscriber não encontrado' },
          { status: 404 }
        )
      }

      subscriber.preferences = { ...subscriber.preferences, ...preferences }
      saveNewsletterData(data)

      return NextResponse.json({
        success: true,
        message: 'Preferências atualizadas com sucesso',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Ação não reconhecida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro ao atualizar newsletter:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover subscriber
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const data = readNewsletterData()
    const subscriberIndex = data.subscribers.findIndex(
      sub => sub.email === email
    )

    if (subscriberIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Subscriber não encontrado' },
        { status: 404 }
      )
    }

    data.subscribers.splice(subscriberIndex, 1)
    saveNewsletterData(data)

    return NextResponse.json({
      success: true,
      message: 'Subscriber removido com sucesso',
    })
  } catch (error) {
    console.error('Erro ao remover subscriber:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
