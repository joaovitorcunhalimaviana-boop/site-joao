import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limiter'

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

const REVIEWS_FILE = path.join(process.cwd(), 'data', 'reviews.json')

// Função para garantir que o diretório existe
function ensureDataDirectory() {
  const dataDir = path.dirname(REVIEWS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Função para ler as avaliações
function readReviews(): ReviewsData {
  ensureDataDirectory()

  if (!fs.existsSync(REVIEWS_FILE)) {
    const initialData: ReviewsData = {
      reviews: [
        {
          id: '1',
          patientName: 'Maria Silva',
          email: 'maria@email.com',
          rating: 5,
          comment:
            'Excelente atendimento! Dr. João é muito atencioso e profissional. Recomendo a todos.',
          date: '2024-01-15T10:30:00Z',
          verified: true,
          approved: true,
        },
        {
          id: '2',
          patientName: 'Carlos Santos',
          email: 'carlos@email.com',
          rating: 5,
          comment:
            'Profissional excepcional! Resolveu meu problema de forma rápida e eficiente. Muito obrigado!',
          date: '2024-01-10T14:20:00Z',
          verified: true,
          approved: true,
        },
        {
          id: '3',
          patientName: 'Ana Costa',
          email: 'ana@email.com',
          rating: 4,
          comment:
            'Muito bom atendimento. Clínica bem organizada e médico competente.',
          date: '2024-01-08T09:15:00Z',
          verified: true,
          approved: true,
        },
        {
          id: '4',
          patientName: 'Roberto Lima',
          email: 'roberto@email.com',
          rating: 5,
          comment:
            'Dr. João é um excelente profissional. Me senti muito seguro durante todo o tratamento.',
          date: '2024-01-05T16:45:00Z',
          verified: true,
          approved: true,
        },
      ],
      stats: {
        totalReviews: 4,
        averageRating: 4.75,
        ratingDistribution: { 5: 3, 4: 1, 3: 0, 2: 0, 1: 0 },
      },
    }
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(initialData, null, 2))
    return initialData
  }

  try {
    const data = fs.readFileSync(REVIEWS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erro ao ler arquivo de avaliações:', error)
    return {
      reviews: [],
      stats: {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      },
    }
  }
}

// Função para salvar as avaliações
function saveReviews(data: ReviewsData) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Erro ao salvar arquivo de avaliações:', error)
    throw new Error('Erro ao salvar avaliação')
  }
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
        const data = readReviews()

        // Retornar apenas avaliações aprovadas para o público
        const approvedReviews = data.reviews
          .filter(review => review.approved)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )

        return NextResponse.json({
          reviews: approvedReviews,
          stats: data.stats,
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
      auditAction: 'REVIEWS_ACCESS',
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

        // Ler dados existentes
        const data = readReviews()

        // Verificar se já existe avaliação deste email
        const existingReview = data.reviews.find(
          review => review.email.toLowerCase() === email.toLowerCase()
        )
        if (existingReview) {
          return NextResponse.json(
            { error: 'Já existe uma avaliação para este email' },
            { status: 400 }
          )
        }

        // Criar nova avaliação
        const newReview: Review = {
          id: Date.now().toString(),
          patientName: patientName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || '',
          rating: parseInt(rating),
          comment: comment.trim(),
          date: new Date().toISOString(),
          verified: false,
          approved: true, // Auto-aprovar por enquanto, pode ser alterado para moderação manual
        }

        // Adicionar nova avaliação
        data.reviews.push(newReview)

        // Recalcular estatísticas
        data.stats = calculateStats(data.reviews)

        // Salvar dados
        saveReviews(data)

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
