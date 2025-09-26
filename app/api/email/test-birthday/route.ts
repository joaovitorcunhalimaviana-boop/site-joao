import { NextRequest, NextResponse } from 'next/server'
import { sendBirthdayEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de e-mail inválido' },
        { status: 400 }
      )
    }

    console.log(`Enviando e-mail de aniversário de teste para: ${name} (${email})`)

    const result = await sendBirthdayEmail({
      name: name,
      email: email,
      birthDate: new Date().toISOString().split('T')[0], // Data de hoje
    })

    if (result) {
      return NextResponse.json({
        success: true,
        message: `E-mail de aniversário enviado com sucesso para ${name}`,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          error: 'Falha ao enviar e-mail de aniversário',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail de aniversário:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}