import { NextRequest, NextResponse } from 'next/server'
import {
  getAllCommunicationContacts,
  createOrUpdateCommunicationContact,
  CommunicationContact,
} from '@/lib/unified-patient-system-prisma'
import { prisma } from '@/lib/prisma-service'
import {
  loadNotificationConfig,
  isTelegramConfigured,
  withRetry,
  checkNotificationRateLimit,
  logNotification,
  isValidEmail,
  sanitizeWhatsApp,
} from '@/lib/notification-utils'
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/rate-limiter'

// Newsletter data is now stored in Prisma database via NewsletterData model
// These functions are deprecated and replaced with Prisma operations

// Prisma-based newsletter functions
async function readNewslettersData(): Promise<Newsletter[]> {
  try {
    const newsletters = await prisma.newsletterData.findMany({
      orderBy: { sentAt: 'desc' },
      include: {
        creator: {
          select: { name: true }
        }
      }
    })
    
    return newsletters.map(newsletter => ({
      id: newsletter.id,
      subject: newsletter.title,
      content: newsletter.content,
      sentAt: newsletter.sentAt?.toISOString() || newsletter.createdAt.toISOString(),
      recipientCount: 0 // This would need to be calculated based on subscribers at time of sending
    }))
  } catch (error) {
    console.error('Erro ao ler newsletters do Prisma:', error)
    return []
  }
}

async function saveNewsletterData(newsletter: Omit<Newsletter, 'id'>): Promise<Newsletter> {
  try {
    const savedNewsletter = await prisma.newsletterData.create({
      data: {
        title: newsletter.subject,
        content: newsletter.content,
        isDraft: false,
        sentAt: new Date(newsletter.sentAt)
      }
    })
    
    return {
      id: savedNewsletter.id,
      subject: savedNewsletter.title,
      content: savedNewsletter.content,
      sentAt: savedNewsletter.sentAt?.toISOString() || savedNewsletter.createdAt.toISOString(),
      recipientCount: newsletter.recipientCount
    }
  } catch (error) {
    console.error('Erro ao salvar newsletter no Prisma:', error)
    throw error
  }
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
    newsletter: boolean
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
function convertContactsToSubscribers(
  contacts: CommunicationContact[]
): Subscriber[] {
  return contacts
    .filter(
      contact =>
        contact.email && (contact.emailNewsletter || contact.emailSubscribed)
    )
    .map(contact => ({
      id: contact.id,
      email: contact.email || '',
      name: contact.name,
      whatsapp: contact.whatsapp,
      birthDate: contact.birthDate,
      subscribed: contact.emailSubscribed,
      subscribedAt: contact.createdAt,
      preferences: {
        newsletter: contact.emailNewsletter,
        healthTips: contact.emailHealthTips,
        appointments: contact.emailAppointments,
        promotions: contact.emailPromotions,
      },
    }))
}

// Função para obter subscribers do sistema unificado
async function getSubscribers(): Promise<Subscriber[]> {
  const contacts = await getAllCommunicationContacts()
  return convertContactsToSubscribers(contacts)
}

// Função de validação de email removida - agora importada de notification-utils

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
  const config = loadNotificationConfig()

  // Validar configuração
  if (!isTelegramConfigured(config)) {
    await logNotification({
      level: 'WARN',
      channel: 'telegram',
      notificationType: 'newsletter',
      message: 'Telegram não configurado - notificação de newsletter não enviada',
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Telegram não configurado' }
  }

  // Verificar rate limit
  const rateLimitCheck = checkNotificationRateLimit('telegram_newsletter', 5)
  if (!rateLimitCheck.allowed) {
    await logNotification({
      level: 'WARN',
      channel: 'telegram',
      notificationType: 'newsletter',
      message: `Rate limit excedido. Tente novamente em ${rateLimitCheck.retryAfter}s`,
      timestamp: new Date().toISOString(),
    })
    return {
      success: false,
      error: `Rate limit excedido. Aguarde ${rateLimitCheck.retryAfter} segundos`,
    }
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
        `${config.doctorName}\n` +
        `Coloproctologista`
    )

    const sanitizedWhatsApp = subscriberData.whatsapp
      ? sanitizeWhatsApp(subscriberData.whatsapp)
      : null
    const whatsappLink = sanitizedWhatsApp
      ? `https://wa.me/${sanitizedWhatsApp}?text=${whatsappMessage}`
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

    // Enviar mensagem via API do Telegram com retry logic
    await withRetry(
      async () => {
        const response = await fetch(
          `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              chat_id: config.telegramChatId,
              text: telegramMessage,
              parse_mode: 'Markdown',
              disable_web_page_preview: false,
            }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            `Erro na API do Telegram: ${response.status} - ${JSON.stringify(errorData)}`
          )
        }

        return response
      },
      {
        maxAttempts: config.retryAttempts || 3,
        delayMs: config.retryDelay || 2000,
      }
    )

    await logNotification({
      level: 'SUCCESS',
      channel: 'telegram',
      notificationType: 'newsletter',
      recipient: subscriberData.email,
      message: 'Notificação de nova inscrição na newsletter enviada',
      timestamp: new Date().toISOString(),
      metadata: {
        subscriberName: subscriberData.name,
        subscriberEmail: subscriberData.email,
      },
    })

    return { success: true }
  } catch (error) {
    await logNotification({
      level: 'ERROR',
      channel: 'telegram',
      notificationType: 'newsletter',
      recipient: subscriberData.email,
      message: 'Falha ao enviar notificação de newsletter',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    })

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
      const newsletters = await readNewslettersData()
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
    const newsletters = await readNewslettersData()

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
  // Aplicar rate limiting
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    RATE_LIMIT_CONFIGS.PUBLIC,
    {
      auditAction: 'NEWSLETTER_ACTION',
      resourceName: 'newsletter',
    }
  )

  if (rateLimitResponse) {
    return rateLimitResponse
  }

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
      const existingContact = contacts.find(
        c => c.email?.toLowerCase() === email.toLowerCase()
      )

      if (existingContact && existingContact.emailSubscribed) {
        return NextResponse.json(
          {
            success: false,
            message: 'Este email já está cadastrado na newsletter',
            contactId: existingContact.id,
          },
          { status: 409 }
        )
      }

      // Criar ou atualizar contato no sistema unificado
      const contactResult = await createOrUpdateCommunicationContact({
        name,
        email,
        whatsapp: whatsapp || undefined,
        birthDate,
        source: 'newsletter',
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
          birthDate: contactResult.contact.birthDate,
        })
      } catch (telegramError) {
        console.error(
          '❌ Erro ao enviar notificação Telegram de newsletter:',
          telegramError
        )
        // Não falha a inscrição se o Telegram falhar
      }

      return NextResponse.json({
        success: true,
        message: 'Inscrição realizada com sucesso!',
        contactId: contactResult.contact.id,
        reactivated: existingContact ? true : false,
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
      const savedNewsletter = await saveNewsletterData(newsletter)

      // Aqui você integraria com um serviço de email como SendGrid, Mailgun, etc.
      // Por enquanto, apenas simulamos o envio

      return NextResponse.json({
        success: true,
        message: 'Newsletter enviado com sucesso!',
        newsletter: savedNewsletter,
        recipientCount: subscribers.length,
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

    // Buscar contato no sistema unificado Prisma
    const contacts = await getAllCommunicationContacts()
    const contact = contacts.find(
      c => c.email?.toLowerCase() === email.toLowerCase()
    )

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contato não encontrado' },
        { status: 404 }
      )
    }

    let updatedPreferences = {
      subscribed: contact.emailSubscribed,
      newsletter: contact.emailNewsletter,
      healthTips: contact.emailHealthTips,
      appointments: contact.emailAppointments,
      promotions: contact.emailPromotions,
    }

    if (action === 'unsubscribe') {
      // Desinscrever da newsletter
      updatedPreferences = {
        ...updatedPreferences,
        subscribed: false,
        newsletter: false,
        healthTips: false,
        promotions: false,
      }
    } else if (preferences) {
      // Atualizar preferências específicas
      updatedPreferences = {
        ...updatedPreferences,
        ...preferences,
      }
    }

    // Atualizar contato usando o sistema Prisma diretamente
    const updatedContactPrisma = await prisma.communicationContact.update({
      where: { id: contact.id },
      data: {
        emailSubscribed: updatedPreferences.subscribed,
        emailNewsletter: updatedPreferences.newsletter,
        emailHealthTips: updatedPreferences.healthTips ?? contact.emailHealthTips,
        emailAppointments: updatedPreferences.appointments ?? contact.emailAppointments,
        emailPromotions: updatedPreferences.promotions,
        emailUnsubscribedAt: !updatedPreferences.subscribed ? new Date() : undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Preferências atualizadas com sucesso',
      contact: {
        id: updatedContactPrisma.id,
        email: updatedContactPrisma.email,
        name: updatedContactPrisma.name,
        emailPreferences: {
          subscribed: updatedContactPrisma.emailSubscribed,
          newsletter: updatedContactPrisma.emailNewsletter,
          healthTips: updatedContactPrisma.emailHealthTips,
          appointments: updatedContactPrisma.emailAppointments,
          promotions: updatedContactPrisma.emailPromotions
        },
      },
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

    // Buscar contato no sistema unificado Prisma
    const contacts = await getAllCommunicationContacts()
    const contact = contacts.find(
      c => c.email?.toLowerCase() === email.toLowerCase()
    )

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contato não encontrado' },
        { status: 404 }
      )
    }

    // Remover completamente as preferências de email (unsubscribe total)
    const updatedContactPrisma = await prisma.communicationContact.update({
      where: { id: contact.id },
      data: {
        emailSubscribed: false,
        emailNewsletter: false,
        emailHealthTips: false,
        emailAppointments: false,
        emailPromotions: false,
        emailUnsubscribedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscriber removido com sucesso',
      contact: {
        id: updatedContactPrisma.id,
        email: updatedContactPrisma.email,
        name: updatedContactPrisma.name,
        emailPreferences: {
          subscribed: updatedContactPrisma.emailSubscribed,
          newsletter: updatedContactPrisma.emailNewsletter,
          healthTips: updatedContactPrisma.emailHealthTips,
          appointments: updatedContactPrisma.emailAppointments,
          promotions: updatedContactPrisma.emailPromotions
        },
      },
    })
  } catch (error) {
    console.error('Erro ao remover subscriber:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
