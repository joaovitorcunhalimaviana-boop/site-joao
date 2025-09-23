import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    // Validar dados obrigatórios
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nome e email são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Formato de email inválido',
        },
        { status: 400 }
      )
    }

    console.log(`Enviando email de boas-vindas para: ${name} (${email})`)

    // Enviar email de boas-vindas
    const emailSent = await sendWelcomeEmail({
      name,
      email,
    })

    if (emailSent) {
      console.log(`✅ Email de boas-vindas enviado com sucesso para ${name}`)
      return NextResponse.json({
        success: true,
        message: 'Email de boas-vindas enviado com sucesso',
      })
    } else {
      console.error(`❌ Falha ao enviar email de boas-vindas para ${name}`)
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao enviar email de boas-vindas',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro ao processar email de boas-vindas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
