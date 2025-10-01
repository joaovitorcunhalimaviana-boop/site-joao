import { NextRequest, NextResponse } from 'next/server'
import { sendEmailWithFallback } from '@/lib/email-providers'
import { sendGmailOptimized } from '@/lib/gmail-optimizer'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { type, emailData } = await request.json()

    if (type === 'newsletter') {
      // Load email template
      const templatePath = path.join(process.cwd(), 'templates', 'newsletter.html')
      let template

      try {
        template = fs.readFileSync(templatePath, 'utf8')
      } catch (error) {
        console.log('Template not found, using basic HTML structure')
        template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter</title>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    {{CONTENT}}
  </div>
</body>
</html>`
      }

      // Replace template variables
      const htmlContent = template
        .replace(/{{CONTENT}}/g, emailData.content || '')
        .replace(/{{NAME}}/g, emailData.name || '')

      // Format email data correctly for email providers
      const mailOptions = {
        from: process.env['EMAIL_USER'],
        to: emailData.email,
        subject: 'Newsletter',
        html: htmlContent,
        text: emailData.content || ''
      }

      let result
      let success = false

      try {
        // Try with fallback system first
        result = await sendEmailWithFallback(mailOptions)
        success = true
        console.log('Email enviado com sucesso usando sistema de fallback')

      } catch (fallbackError) {
        console.log('Sistema de fallback falhou, tentando otimizador do Gmail...')

        // If fallback fails, try Gmail optimizer
        try {
          result = await sendGmailOptimized(mailOptions)
          success = true
          console.log('Email enviado com sucesso usando otimizador do Gmail')

        } catch (gmailError) {
          console.log('Otimizador do Gmail tambem falhou:', gmailError)
          throw new Error(`Falha completa no envio: Fallback (${fallbackError.message}) e Gmail otimizado (${gmailError.message})`)
        }
      }

      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Newsletter enviada com sucesso',
          messageId: result.messageId || ''
        })
      } else {
        return NextResponse.json({
          success: false,
          message: 'Falha no envio da newsletter'
        }, { status: 500 })
      }
    }

    // Handle other email types
    const mailOptions = {
      from: process.env['EMAIL_USER'],
      to: emailData.email,
      subject: emailData.subject || 'Email',
      html: emailData.content || '',
      text: emailData.text || emailData.content || ''
    }

    const result = await sendEmailWithFallback(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
      messageId: result.messageId || ''
    })

  } catch (error) {
    console.error('Erro na API de envio de email:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    }, { status: 500 })
  }
}
