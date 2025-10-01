import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email-service'
import { sendWelcomeEmailToPatient } from '@/lib/welcome-email-service'
import { 
  getAllCommunicationContacts,
  createOrUpdateCommunicationContact,
  CommunicationContact
} from '@/lib/unified-patient-system'

// Interfaces para compatibilidade com o sistema antigo
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

// Função para converter contatos de comunicação em subscribers (compatibilidade)
function convertContactsToSubscribers(contacts: CommunicationContact[]): Subscriber[] {
  return contacts
    .filter(contact => contact.emailPreferences.newsletter || contact.emailPreferences.subscribed)
    .map(contact => ({
      id: contact.id,
      email: contact.email || '',
      name: contact.name,
      whatsapp: contact.whatsapp,
      birthDate: contact.birthDate,
      subscribed: contact.emailPreferences.subscribed,
      subscribedAt: contact.emailPreferences.subscribedAt || contact.createdAt,
      preferences: {
        healthTips: contact.emailPreferences.healthTips,
        appointments: contact.emailPreferences.appointments,
        promotions: contact.emailPreferences.promotions
      }
    }))
}

// Função para obter subscribers do sistema unificado
async function getSubscribers(): Promise<Subscriber[]> {
  const contacts = await getAllCommunicationContacts()
  return convertContactsToSubscribers(contacts)
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

    if (type === 'subscribers') {
      const subscribers = await getSubscribers()
      return NextResponse.json({
        success: true,
        subscribers: subscribers,
        total: subscribers.length,
      })
    }

    if (type === 'newsletters') {
      const newsletters = readNewslettersData()
      return NextResponse.json({
        success: true,
        newsletters: newsletters.sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        ),
        total: newsletters.length,
      })
    }

    // Retornar estatísticas gerais
    const subscribers = getSubscribers()
    const newsletters = readNewslettersData()

    return NextResponse.json({
      success: true,
      stats: {
        totalSubscribers: subscribers.length,
        totalNewsletters: newsletters.length,
        recentSubscribers: subscribers
          .sort(
            (a, b) =>
              new Date(b.subscribedAt).getTime() -
              new Date(a.subscribedAt).getTime()
          )
          .slice(0, 5),
      },
    })
  } catch (error) {
    console.error('❌ Erro ao obter dados do newsletter:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// POST - Inscrever no newsletter ou enviar newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

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

      // Verificar se o email já existe no sistema unificado
      const contacts = await getAllCommunicationContacts()
      const existingContact = contacts.find(c => 
        c.email?.toLowerCase() === email.toLowerCase()
      )

      if (existingContact && existingContact.emailPreferences.subscribed) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Este email já está cadastrado na newsletter',
            contactId: existingContact.id
          },
          { status: 409 }
        )
      }

      // Criar ou atualizar contato no sistema unificado
      const contactResult = createOrUpdateCommunicationContact({
        name,
        email,
        whatsapp: whatsapp || undefined,
        birthDate,
        source: 'newsletter'
      })

      if (!contactResult.success) {
        return NextResponse.json(
          { success: false, message: contactResult.message },
          { status: 400 }
        )
      }

      // Enviar email de boas-vindas
      try {
        await sendWelcomeEmailToPatient({
          email: contactResult.contact.email!,
          name: contactResult.contact.name,
          whatsapp: contactResult.contact.whatsapp,
          birthDate: contactResult.contact.birthDate,
          source: 'newsletter',
          subscribed: true,
          subscribedAt: contactResult.contact.emailPreferences.subscribedAt!,
          patientId: contactResult.contact.id,
          registrationSources: contactResult.contact.registrationSources,
          preferences: {
            healthTips: contactResult.contact.emailPreferences.healthTips,
            appointments: contactResult.contact.emailPreferences.appointments,
            promotions: contactResult.contact.emailPreferences.promotions
          }
        })
      } catch (emailError) {
        console.error('❌ Erro ao enviar email de boas-vindas:', emailError)
      }

      return NextResponse.json({
        success: true,
        message: 'Inscrição realizada com sucesso!',
        contactId: contactResult.contact.id,
        reactivated: existingContact ? true : false
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

      // Obter subscribers do sistema unificado
      const subscribers = getSubscribers()

      // Criar newsletter
      const newsletter: Newsletter = {
        id: generateId(),
        subject,
        content,
        sentAt: new Date().toISOString(),
        recipientCount: recipients || subscribers.length,
      }

      // Salvar newsletter no histórico
      const newsletters = readNewslettersData()
      newsletters.push(newsletter)
      saveNewslettersData(newsletters)

      // Aqui você integraria com um serviço de email como SendGrid, Mailgun, etc.
      // Por enquanto, apenas simulamos o envio

      return NextResponse.json({
        success: true,
        message: 'Newsletter enviado com sucesso!',
        newsletter,
        recipientCount: subscribers.length
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

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const patients = getAllPatients()
    const patient = patients.find(p => p.email?.toLowerCase() === email.toLowerCase())

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    if (action === 'unsubscribe') {
      // Desinscrever da newsletter
      patient.emailPreferences = {
        ...patient.emailPreferences,
        subscribed: false,
        healthTips: false,
        appointments: patient.emailPreferences?.appointments || false,
        promotions: false
      }
    } else if (preferences) {
      // Atualizar preferências específicas
      patient.emailPreferences = {
        ...patient.emailPreferences,
        ...preferences
      }
    }

    // Salvar alterações
    const result = createOrUpdatePatient(patient)
    
    return NextResponse.json({
      success: true,
      message: 'Preferências atualizadas com sucesso',
      patient: {
        id: patient.id,
        email: patient.email,
        name: patient.name,
        emailPreferences: patient.emailPreferences
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error)
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

    const patients = getAllPatients()
    const patient = patients.find(p => p.email?.toLowerCase() === email.toLowerCase())

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Remover completamente as preferências de email (unsubscribe total)
    patient.emailPreferences = {
      subscribed: false,
      healthTips: false,
      appointments: false,
      promotions: false
    }

    // Salvar alterações
    const result = createOrUpdatePatient(patient)
    
    return NextResponse.json({
      success: true,
      message: 'Subscriber removido com sucesso',
      patientId: patient.id
    })
  } catch (error) {
    console.error('Erro ao remover subscriber:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
