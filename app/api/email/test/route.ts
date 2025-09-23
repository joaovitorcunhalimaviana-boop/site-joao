import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'welcome' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
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

    console.log(`Enviando e-mail de teste (${type}) para: ${email}`)

    // Por enquanto, vamos usar o template de boas-vindas para teste
    const result = await sendWelcomeEmail({
      name: 'Usuário de Teste',
      email: email,
      birthDate: '01/01/1990',
    })

    if (result) {
      return NextResponse.json({
        success: true,
        message: `E-mail de teste enviado com sucesso para ${email}`,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          error: 'Falha ao enviar e-mail de teste',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail de teste:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
