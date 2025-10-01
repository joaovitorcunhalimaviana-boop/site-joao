import { NextRequest, NextResponse } from 'next/server'
import { sendEmailWithFallback } from '@/lib/email-providers'
import { auditSystem } from '@/lib/audit-middleware'
import { rateLimiter } from '@/lib/rate-limiter'
import { z } from 'zod'
import { sanitizeMedicalFormData } from '@/lib/security'

// Schema de validação para dados do e-mail de aniversário
const birthdayEmailSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  source: z.string().optional().default('birthday_scheduler')
})

// Template do e-mail de aniversário
function getBirthdayEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Feliz Aniversário!</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .birthday-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        h1 {
          color: #2c5aa0;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 30px;
          text-align: center;
        }
        .signature {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
        }
        .contact-info {
          margin-top: 20px;
          font-size: 14px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="birthday-icon"></div>
          <h1>Feliz Aniversário, ${name}!</h1>
        </div>
        
        <div class="message">
          <p>É com grande alegria que desejamos um <strong>Feliz Aniversário</strong> para você!</p>
          
          <p>Que este novo ano de vida seja repleto de saúde, felicidade e realizações. É um prazer tê-lo(a) como nosso paciente e fazer parte da sua jornada de cuidados com a saúde.</p>
          
          <p>Aproveitamos para lembrar que estamos sempre à disposição para cuidar do seu bem-estar. Se precisar de alguma consulta ou tiver dúvidas sobre sua saúde, não hesite em entrar em contato conosco.</p>
          
          <p><strong>Desejamos um dia muito especial e um ano repleto de bênçãos!</strong></p>
        </div>
        
        <div class="signature">
          <p><strong>Dr. João Vítor Viana</strong></p>
          <p>Coloproctologista</p>
          <p>CRM-PE 12345</p>
          
          <div class="contact-info">
            <p> (81) 99999-9999</p>
            <p> contato@drjoaovitorviana.com.br</p>
            <p> www.drjoaovitorviana.com.br</p>
            <p> Recife - PE</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  let name = 'unknown'
  let email = 'unknown'
  let source = 'birthday_scheduler'

  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'
    
    const rateLimitResult = await rateLimiter.checkLimit(clientIP, 'email', 10, 3600) // 10 emails por hora
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de envio de email. Tente novamente mais tarde.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validação dos dados
    const validatedData = birthdayEmailSchema.parse(body)
    name = validatedData.name
    email = validatedData.email
    source = validatedData.source

    // Sanitizar dados
    const sanitizedData = sanitizeMedicalFormData({
      name: name,
      email: email
    })

    console.log(` Enviando email de aniversário para: ${sanitizedData.name} (${sanitizedData.email})`)

    // Configurar opções do email
    const mailOptions = {
      from: `"Dr. João Vitor Viana" <${process.env.EMAIL_USER || process.env.MAILTRAP_API_TOKEN}>`,
      to: sanitizedData.email,
      subject: ` Feliz Aniversário, ${sanitizedData.name}!`,
      html: getBirthdayEmailTemplate(sanitizedData.name)
    }

    // Enviar email com sistema de fallback
    await sendEmailWithFallback(mailOptions)

    // Log da atividade
    await auditSystem({
      action: 'BIRTHDAY_EMAIL_SENT',
      details: {
        recipient: sanitizedData.email,
        name: sanitizedData.name,
        source: source
      },
      ip: clientIP
    })

    console.log(` Email de aniversário enviado com sucesso para: ${sanitizedData.name} (${sanitizedData.email})`)

    return NextResponse.json({
      success: true,
      message: 'Email de aniversário enviado com sucesso'
    })

  } catch (error) {
    console.error(' Erro ao enviar email de aniversário:', error)

    // Log do erro
    try {
      await auditSystem({
        action: 'BIRTHDAY_EMAIL_ERROR',
        details: {
          recipient: email,
          name: name,
          source: source,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
      })
    } catch (logError) {
      console.error('Erro ao registrar log de erro:', logError)
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor ao enviar email de aniversário' },
      { status: 500 }
    )
  }
}
