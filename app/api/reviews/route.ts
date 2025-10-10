import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limiter'
import {
  getAllCommunicationContacts,
  createOrUpdateCommunicationContact,
  CommunicationContact,
} from '@/lib/unified-patient-system-prisma'

interface Review {
  id: string
  patientName: string
  email: string
  phone?: string
  rating: number
  comment: string
  date: string
  verified: boolean
  approved: boolean
}

interface ReviewsData {
  reviews: Review[]
  stats: {
    totalReviews: number
    averageRating: number
    ratingDistribution: { [key: number]: number }
  }
}

// Função para obter reviews do sistema unificado
async function getReviewsFromUnifiedSystem(): Promise<Review[]> {
  const { prisma } = await import('@/lib/prisma-service')

  const reviews = await prisma.review.findMany({
    include: {
      contact: {
        select: {
          name: true,
          email: true,
          whatsapp: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return reviews.map(review => ({
    id: review.id,
    patientName: review.contact.name,
    email: review.contact.email || '',
    phone: review.contact.whatsapp || '',
    rating: review.rating,
    comment: review.comment,
    date: review.createdAt.toISOString(),
    verified: review.verified,
    approved: review.approved,
  }))
}

// Função para calcular estatísticas
function calculateStats(reviews: Review[]) {
  const approvedReviews = reviews.filter(review => review.approved)
  const totalReviews = approvedReviews.length

  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    }
  }

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let totalRating = 0

  approvedReviews.forEach(review => {
    ratingDistribution[review.rating as keyof typeof ratingDistribution]++
    totalRating += review.rating
  })

  const averageRating = totalRating / totalReviews

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 100) / 100,
    ratingDistribution,
  }
}

// Função para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função para enviar avaliação para o Telegram
async function sendToTelegram(review: Review) {
  const TELEGRAM_BOT_TOKEN = process.env['TELEGRAM_BOT_TOKEN']
  const TELEGRAM_CHAT_ID = process.env['TELEGRAM_CHAT_ID']

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn(
      'Telegram não configurado - variáveis de ambiente não encontradas'
    )
    return
  }

  const stars = '⭐'.repeat(review.rating)
  const message =
    `🔔 *Nova Avaliação Recebida*\n\n` +
    `👤 *Paciente:* ${review.patientName}\n` +
    `📧 *Email:* ${review.email}\n` +
    `${review.phone ? `📱 *Telefone:* ${review.phone}\n` : ''}` +
    `${stars} *Avaliação:* ${review.rating}/5\n\n` +
    `💬 *Comentário:*\n${review.comment}\n\n` +
    `📅 *Data:* ${new Date(review.date).toLocaleString('pt-BR')}`

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )

    if (!response.ok) {
      console.error('Erro ao enviar para Telegram:', await response.text())
    } else {
      console.log('Avaliação enviada para Telegram com sucesso')
    }
  } catch (error) {
    console.error('Erro ao enviar para Telegram:', error)
  }
}

// GET - Buscar avaliações
export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.PUBLIC,
    async () => {
      try {
        const { searchParams } = new URL(request.url)
        const approved = searchParams.get('approved')
        const rating = searchParams.get('rating')

        // Obter reviews do sistema unificado
        const reviews = await getReviewsFromUnifiedSystem()

        // Filtrar por aprovação se especificado
        let filteredReviews = reviews
        if (approved === 'true') {
          filteredReviews = reviews.filter(review => review.approved)
        } else if (approved === 'false') {
          filteredReviews = reviews.filter(review => !review.approved)
        }

        // Filtrar por rating se especificado
        if (rating) {
          const ratingNum = parseInt(rating)
          if (ratingNum >= 1 && ratingNum <= 5) {
            filteredReviews = filteredReviews.filter(
              review => review.rating === ratingNum
            )
          }
        }

        // Calcular estatísticas
        const stats = calculateStats(filteredReviews)

        return NextResponse.json({
          reviews: filteredReviews,
          stats,
        })
      } catch (error) {
        console.error('Erro ao buscar avaliações:', error)
        return NextResponse.json(
          { error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'REVIEW_LIST',
      resourceName: 'Reviews API',
    }
  )
}

// POST - Criar nova avaliação
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.PUBLIC,
    async () => {
      try {
        const body = await request.json()
        const { patientName, email, phone, rating, comment } = body

        // Validações
        if (!patientName || !patientName.trim()) {
          return NextResponse.json(
            { error: 'Nome é obrigatório' },
            { status: 400 }
          )
        }

        if (!email || !email.trim()) {
          return NextResponse.json(
            { error: 'Email é obrigatório' },
            { status: 400 }
          )
        }

        if (!isValidEmail(email)) {
          return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
        }

        if (!rating || rating < 1 || rating > 5) {
          return NextResponse.json(
            { error: 'Avaliação deve ser entre 1 e 5 estrelas' },
            { status: 400 }
          )
        }

        if (!comment || !comment.trim()) {
          return NextResponse.json(
            { error: 'Comentário é obrigatório' },
            { status: 400 }
          )
        }

        if (comment.length > 500) {
          return NextResponse.json(
            { error: 'Comentário deve ter no máximo 500 caracteres' },
            { status: 400 }
          )
        }

        // Verificar se já existe review deste email no sistema unificado
        const { prisma } = await import('@/lib/prisma-service')

        const existingReview = await prisma.review.findFirst({
          where: {
            contact: {
              email: {
                equals: email.toLowerCase(),
                mode: 'insensitive'
              }
            }
          }
        })

        if (existingReview) {
          return NextResponse.json(
            { error: 'Já existe uma avaliação para este email' },
            { status: 400 }
          )
        }

        // Criar ou atualizar contato com dados da review
        const contactResult = await createOrUpdateCommunicationContact({
          name: patientName.trim(),
          email: email.trim().toLowerCase(),
          whatsapp: phone?.trim() || undefined,
          source: 'review',
        })

        if (!contactResult.success) {
          return NextResponse.json(
            { success: false, message: contactResult.message },
            { status: 400 }
          )
        }

        // Usar Prisma para criar a review (prisma já importado acima)
        const createdReview = await prisma.review.create({
          data: {
            contactId: contactResult.contact!.id,
            rating: parseInt(rating),
            comment: comment.trim(),
            verified: false,
            approved: true,
          }
        })

        // Criar objeto review para resposta
        const newReview: Review = {
          id: createdReview.id,
          patientName: contactResult.contact!.name,
          email: contactResult.contact!.email!,
          phone: contactResult.contact!.whatsapp || '',
          rating: createdReview.rating,
          comment: createdReview.comment,
          date: createdReview.createdAt.toISOString(),
          verified: createdReview.verified,
          approved: createdReview.approved,
        }

        // Enviar para Telegram (não bloquear a resposta)
        sendToTelegram(newReview).catch(error => {
          console.error('Erro ao enviar para Telegram:', error)
        })

        return NextResponse.json(
          {
            message: 'Avaliação criada com sucesso',
            review: newReview,
          },
          { status: 201 }
        )
      } catch (error) {
        console.error('Erro ao criar avaliação:', error)
        return NextResponse.json(
          { error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'REVIEW_CREATE',
      resourceName: 'Reviews API',
    }
  )
}
