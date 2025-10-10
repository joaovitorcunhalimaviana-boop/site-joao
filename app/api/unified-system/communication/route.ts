import { NextRequest, NextResponse } from 'next/server'
import {
  getAllCommunicationContacts,
  getCommunicationContactById,
  getCommunicationContactByEmail,
  createOrUpdateCommunicationContact,
  CommunicationContact,
} from '@/lib/unified-patient-system-prisma'

// GET - Listar todos os contatos de comunicação ou buscar por ID/email
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')
    const source = searchParams.get('source')
    const subscribed = searchParams.get('subscribed')

    if (id) {
      // Buscar por ID
      const contact = await getCommunicationContactById(id)

      if (!contact) {
        return NextResponse.json(
          {
            success: false,
            message: 'Contato não encontrado',
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          contact,
          message: 'Contato encontrado com sucesso',
        },
        { status: 200 }
      )
    }

    if (email) {
      // Buscar por email
      const contact = await getCommunicationContactByEmail(email)

      if (!contact) {
        return NextResponse.json(
          {
            success: false,
            message: 'Contato não encontrado',
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          contact,
          message: 'Contato encontrado com sucesso',
        },
        { status: 200 }
      )
    }

    // Listar todos os contatos com filtros opcionais
    let contacts = await getAllCommunicationContacts()

    // Filtrar por fonte de cadastro
    if (source) {
      contacts = contacts.filter(contact =>
        contact.registrationSources.includes(source as any)
      )
    }

    // Filtrar por status de inscrição
    if (subscribed !== null) {
      const isSubscribed = subscribed === 'true'
      contacts = contacts.filter(
        contact => contact.emailPreferences.subscribed === isSubscribed
      )
    }

    // Estatísticas
    const stats = {
      total: contacts.length,
      withEmail: contacts.filter(c => c.email).length,
      withWhatsapp: contacts.filter(c => c.whatsapp).length,
      newsletterSubscribers: contacts.filter(c => c.emailPreferences.newsletter)
        .length,
      sources: {
        newsletter: contacts.filter(c =>
          c.registrationSources.includes('newsletter')
        ).length,
        public_appointment: contacts.filter(c =>
          c.registrationSources.includes('public_appointment')
        ).length,
        doctor_area: contacts.filter(c =>
          c.registrationSources.includes('doctor_area')
        ).length,
        secretary_area: contacts.filter(c =>
          c.registrationSources.includes('secretary_area')
        ).length,
      },
    }

    return NextResponse.json(
      {
        success: true,
        contacts,
        stats,
        message: `${contacts.length} contatos encontrados`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Erro ao buscar contatos de comunicação:', error)

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

// POST - Criar ou atualizar contato de comunicação
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // Validações básicas
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Nome é obrigatório',
        },
        { status: 400 }
      )
    }

    if (
      !body.source ||
      ![
        'newsletter',
        'public_appointment',
        'doctor_area',
        'secretary_area',
      ].includes(body.source)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Fonte de cadastro inválida',
        },
        { status: 400 }
      )
    }

    if (!body.email && !body.whatsapp) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email ou WhatsApp é obrigatório',
        },
        { status: 400 }
      )
    }

    // Validar formato do email se fornecido
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Formato de email inválido',
        },
        { status: 400 }
      )
    }

    // Validar formato da data de nascimento se fornecida
    if (body.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Formato de data de nascimento inválido (use YYYY-MM-DD)',
        },
        { status: 400 }
      )
    }

    const result = await createOrUpdateCommunicationContact({
      name: body.name.trim(),
      email: body.email?.trim().toLowerCase(),
      whatsapp: body.whatsapp?.trim(),
      birthDate: body.birthDate,
      source: body.source,
      emailPreferences: {
        newsletter:
          body.emailPreferences?.newsletter ?? body.source === 'newsletter',
        healthTips: body.emailPreferences?.healthTips ?? false,
        appointments: body.emailPreferences?.appointments ?? true,
        promotions: body.emailPreferences?.promotions ?? false,
        subscribed: body.emailPreferences?.subscribed ?? true,
        subscribedAt: body.emailPreferences?.subscribedAt,
        unsubscribedAt: body.emailPreferences?.unsubscribedAt,
      },
      whatsappPreferences: {
        appointments: body.whatsappPreferences?.appointments ?? true,
        reminders: body.whatsappPreferences?.reminders ?? true,
        promotions: body.whatsappPreferences?.promotions ?? false,
        subscribed: body.whatsappPreferences?.subscribed ?? true,
        subscribedAt: body.whatsappPreferences?.subscribedAt,
      },
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        contact: result.contact,
        message: result.message,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Erro ao criar/atualizar contato de comunicação:', error)

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

// PUT - Atualizar preferências de comunicação
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    if (!body.id && !body.email) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID ou email é obrigatório para atualização',
        },
        { status: 400 }
      )
    }

    // Buscar contato existente
    let contact: CommunicationContact | null = null

    if (body.id) {
      contact = await getCommunicationContactById(body.id)
    } else if (body.email) {
      contact = await getCommunicationContactByEmail(body.email)
    }

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          message: 'Contato não encontrado',
        },
        { status: 404 }
      )
    }

    // Atualizar apenas as preferências fornecidas
    const updateData: any = {
      name: contact.name,
      email: contact.email,
      whatsapp: contact.whatsapp,
      birthDate: contact.birthDate,
      source: contact.registrationSources[0], // Usar a primeira fonte
    }

    if (body.emailPreferences) {
      updateData.emailPreferences = {
        ...contact.emailPreferences,
        ...body.emailPreferences,
      }

      // Se está cancelando inscrição, marcar data
      if (
        body.emailPreferences.subscribed === false &&
        contact.emailPreferences.subscribed === true
      ) {
        updateData.emailPreferences.unsubscribedAt = new Date().toISOString()
      }

      // Se está se inscrevendo novamente, marcar data
      if (
        body.emailPreferences.subscribed === true &&
        contact.emailPreferences.subscribed === false
      ) {
        updateData.emailPreferences.subscribedAt = new Date().toISOString()
        updateData.emailPreferences.unsubscribedAt = undefined
      }
    }

    if (body.whatsappPreferences) {
      updateData.whatsappPreferences = {
        ...contact.whatsappPreferences,
        ...body.whatsappPreferences,
      }

      // Se está se inscrevendo no WhatsApp, marcar data
      if (
        body.whatsappPreferences.subscribed === true &&
        contact.whatsappPreferences.subscribed === false
      ) {
        updateData.whatsappPreferences.subscribedAt = new Date().toISOString()
      }
    }

    const result = await createOrUpdateCommunicationContact(updateData)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        contact: result.contact,
        message: 'Preferências atualizadas com sucesso',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Erro ao atualizar preferências de comunicação:', error)

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
