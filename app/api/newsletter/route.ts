import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllCommunicationContacts,
  createOrUpdateCommunicationContact,
  CommunicationContact
} from '@/lib/unified-patient-system'

// Mock functions para compatibilidade (newsletter system foi removido)
function readNewslettersData(): Newsletter[] {
  return []
}

function saveNewslettersData(newsletters: Newsletter[]): void {
  // Newsletter system foi removido - função desabilitada
}

function getAllPatients(): any[] {
  return []
}

function createOrUpdatePatient(patient: any): { success: boolean; message: string } {
  return { success: false, message: 'Patient system migrated to unified system' }
}

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

// Função para enviar notificação via Telegram para nova inscrição na newsletter
async function sendTelegramNewsletterNotification(subscriberData: {
  name: string
  email: string
  whatsapp?: string
  birthDate?: string
}): Promise<{ success: boolean; error?: string }> {
  const telegramToken = process.env['TELEGRAM_BOT_TOKEN']
  const telegramChatId = process.env['TELEGRAM_CHAT_ID']

  if (!telegramToken || !telegramChatId) {
    console.log('ℹ️ Telegram não configurado - notificação de newsletter não enviada')
    return { success: false, error: 'Telegram não configurado' }
  }

  try {
    // Gerar link do WhatsApp para enviar mensagem de boas-vindas
    const whatsappMessage = encodeURIComponent(
      `Olá ${subscriberData.name}! 🎉\n\n` +
      `Parabéns por se inscrever na nossa newsletter! 📧\n\n` +
      `Você receberá:\n` +
      `• Dicas de saúde exclusivas 💡\n` +
      `• Novidades sobre nossos serviços 🏥\n` +
      `• Informações importantes sobre cuidados médicos 👨‍⚕️\n\n` +
      `Obrigado pela confiança! 🙏\n\n` +
      `Dr. João Vítor Viana\n` +
      `Coloproctologista`
    )

    const whatsappLink = subscriberData.whatsapp 
      ? `https://wa.me/55${subscriberData.whatsapp.replace(/\D/g, '')}?text=${whatsappMessage}`
      : 'WhatsApp não informado'

    // Formatar data de nascimento para exibição
    const formattedBirthDate = subscriberData.birthDate 
      ? new Date(subscriberData.birthDate).toLocaleDateString('pt-BR')
      : 'Não informada'

    // Criar mensagem do Telegram
    const telegramMessage =
      `📧 *NOVA INSCRIÇÃO NA NEWSLETTER*\n\n` +
      `👤 *Nome:* ${subscriberData.name}\n` +
      `📧 *Email:* ${subscriberData.email}\n` +
      `🎂 *Data de Nascimento:* ${formattedBirthDate}\n` +
      `📱 *WhatsApp:* ${subscriberData.whatsapp || 'Não informado'}\n\n` +
      (subscriberData.whatsapp 
        ? `🔗 [📱 Enviar mensagem de boas-vindas](${whatsappLink})`
        : `⚠️ *WhatsApp não informado - contato apenas por email*`)

    // Enviar mensagem via API do Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: telegramMessage,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Erro na API do Telegram: ${response.status} - ${JSON.stringify(errorData)}`
      )
    }

    console.log('✅ Notificação Telegram de newsletter enviada com sucesso!')
    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao enviar notificação Telegram de newsletter:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
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
    const subscribers = await getSubscribers()
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

      // Enviar notificação via Telegram para nova inscrição na newsletter
      try {
        await sendTelegramNewsletterNotification({
          name: contactResult.contact.name,
          email: contactResult.contact.email!,
          whatsapp: contactResult.contact.whatsapp,
          birthDate: contactResult.contact.birthDate
        })
      } catch (telegramError) {
        console.error('❌ Erro ao enviar notificação Telegram de newsletter:', telegramError)
        // Não falha a inscrição se o Telegram falhar
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
      const subscribers = await getSubscribers()

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
