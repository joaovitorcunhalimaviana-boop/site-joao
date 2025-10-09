import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key'

// Função para verificar autenticação
async function verifyAuth(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch (error) {
    return null
  }
}

// POST - Webhook do Telegram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Processar webhook do Telegram
    console.log('Webhook do Telegram recebido:', body)

    return NextResponse.json({
      success: true,
      message: 'Webhook processado',
    })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Status do bot
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      status: 'Bot ativo',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao verificar status do bot:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
