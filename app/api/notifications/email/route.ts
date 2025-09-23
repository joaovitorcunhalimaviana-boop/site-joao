import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key'

// Função para verificar autenticação
async function verifyAuth() {
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

// POST - Enviar notificação por email
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth()

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 401 }
      )
    }

    const { to, subject, message, type } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Simular envio de email (em produção, usar serviço real)
    console.log('Email enviado:', { to, subject, message, type })

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Listar histórico de emails
export async function GET(_request: NextRequest) {
  try {
    const auth = await verifyAuth()

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 401 }
      )
    }

    // Simular histórico de emails
    const emailHistory = [
      {
        id: '1',
        to: 'paciente@email.com',
        subject: 'Lembrete de consulta',
        message: 'Sua consulta está agendada para amanhã',
        type: 'reminder',
        sentAt: new Date().toISOString(),
        status: 'sent',
      },
    ]

    return NextResponse.json({
      success: true,
      emails: emailHistory,
    })
  } catch (error) {
    console.error('Erro ao listar emails:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
