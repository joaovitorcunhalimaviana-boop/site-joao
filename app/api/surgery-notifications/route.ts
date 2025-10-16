import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { 
  sendPreOpReminderNotification, 
  sendPostOpFollowUpNotification,
  createTelegramWhatsAppLinks
} from '@/lib/surgery-notifications'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, surgeryId, followUpDay, sendWhatsAppLink = false } = body

    // Buscar dados da cirurgia
    const surgery = await prisma.surgery.findUnique({
      where: { id: surgeryId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
            communicationPreferences: true
          }
        }
      }
    })

    if (!surgery) {
      return NextResponse.json(
        { error: 'Cirurgia não encontrada' },
        { status: 404 }
      )
    }

    // Preparar dados da notificação
    const surgeryData = {
      surgeryId: surgery.id,
      patientId: surgery.patientId,
      patientName: surgery.patient.name,
      patientEmail: surgery.patient.email,
      patientPhone: surgery.patient.phone,
      patientWhatsapp: surgery.patient.whatsapp || surgery.patient.phone,
      surgeryDate: surgery.date,
      surgeryTime: surgery.time,
      surgeryType: surgery.type,
      surgeryNotes: surgery.notes
    }

    let result

    if (type === 'preop_reminder') {
      // Enviar lembrete pré-operatório
      result = await sendPreOpReminder(surgeryData)
      
      // Se solicitado, também criar link WhatsApp manual
      if (sendWhatsAppLink) {
        const whatsappLinkMessage = await createTelegramWhatsAppLinks(
          surgeryData, 
          'preop'
        )
        
        // Enviar link WhatsApp via Telegram
        const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: whatsappLinkMessage,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
          }),
        })

        if (!telegramResponse.ok) {
          console.error('Erro ao enviar link WhatsApp via Telegram')
        }
      }
      
    } else if (type === 'postop_followup') {
      if (!followUpDay) {
        return NextResponse.json(
          { error: 'followUpDay é obrigatório para follow-up pós-operatório' },
          { status: 400 }
        )
      }

      // Buscar dados do follow-up
      const followUpData = await prisma.postOpFollowUp.findFirst({
        where: {
          surgeryId,
          followUpDay
        }
      })

      if (!followUpData) {
        return NextResponse.json(
          { error: 'Follow-up não encontrado' },
          { status: 404 }
        )
      }

      const postOpData = {
        followUpId: followUpData.id,
        followUpDay: followUpData.followUpDay,
        scheduledDate: followUpData.scheduledDate,
        completed: followUpData.completed
      }

      // Enviar notificação de follow-up
      result = await sendPostOpFollowUpNotification(surgeryData, postOpData)
      
      // Se solicitado, também criar link WhatsApp manual
      if (sendWhatsAppLink) {
        const whatsappLinkMessage = await createTelegramWhatsAppLinks(
          surgeryData, 
          'postop',
          followUpDay
        )
        
        // Enviar link WhatsApp via Telegram
        const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: whatsappLinkMessage,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
          }),
        })

        if (!telegramResponse.ok) {
          console.error('Erro ao enviar link WhatsApp via Telegram')
        }
      }
      
    } else if (type === 'whatsapp_link_only') {
      // Apenas criar e enviar link WhatsApp manual
      const linkType = followUpDay ? 'postop' : 'preop'
      const whatsappLinkMessage = await createTelegramWhatsAppLinks(
        surgeryData, 
        linkType,
        followUpDay
      )
      
      // Enviar link WhatsApp via Telegram
      const telegramResponse = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: whatsappLinkMessage,
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        }),
      })

      if (!telegramResponse.ok) {
        throw new Error('Falha ao enviar link WhatsApp via Telegram')
      }

      result = {
        success: true,
        message: 'Link WhatsApp enviado via Telegram',
        telegramSent: true
      }
      
    } else {
      return NextResponse.json(
        { error: 'Tipo de notificação inválido' },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/surgery-notifications
 * Listar notificações pendentes ou enviadas
 */
export async function GET(request: NextRequest) {
  try {
    // Autenticar requisição
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'pending' | 'sent' | 'all'
    const date = searchParams.get('date') // YYYY-MM-DD

    let whereClause: any = {}

    // Filtrar por data se fornecida
    if (date) {
      const targetDate = new Date(date + 'T00:00:00')
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)

      whereClause.surgeryDate = {
        gte: targetDate.toISOString().split('T')[0],
        lt: nextDay.toISOString().split('T')[0]
      }
    }

    // Buscar cirurgias com dados de notificação
    const surgeries = await prisma.surgery.findMany({
      where: whereClause,
      include: {
        medicalPatient: {
          include: {
            communicationContact: true
          }
        },
        postOpFollowUps: true
      },
      orderBy: {
        surgeryDate: 'asc'
      }
    })

    // Processar dados para incluir status de notificações
    const notificationData = surgeries.map(surgery => {
      const surgeryDate = new Date(surgery.surgeryDate + 'T00:00:00')
      const now = new Date()
      const reminderDate = new Date(surgeryDate)
      reminderDate.setDate(reminderDate.getDate() - 1)

      return {
        id: surgery.id,
        patientName: surgery.medicalPatient.communicationContact.name,
        patientWhatsapp: surgery.medicalPatient.communicationContact.whatsapp,
        surgeryDate: surgery.surgeryDate,
        surgeryTime: surgery.surgeryTime,
        surgeryType: surgery.type,
        surgeon: surgery.surgeon,
        hospital: surgery.hospital,
        reminderStatus: {
          shouldSend: reminderDate >= now && reminderDate.toDateString() === now.toDateString(),
          sent: false // TODO: Implementar tracking de envio
        },
        followUps: surgery.postOpFollowUps.map(followUp => ({
          day: followUp.followUpDay,
          scheduledDate: followUp.scheduledDate,
          completed: followUp.completed,
          sent: false // TODO: Implementar tracking de envio
        }))
      }
    })

    return NextResponse.json({
      notifications: notificationData,
      total: notificationData.length
    })

  } catch (error) {
    console.error('Erro ao buscar notificações de cirurgia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}