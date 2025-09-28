import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import {
  sendWelcomeEmail,
  sendBirthdayEmail,
  sendNewsletterEmail,
} from '@/lib/email-service'
import { InputValidator, logSecurityEvent } from '@/lib/security-audit'
import { sanitizeMedicalFormData } from '@/lib/security'

// Função específica para validar conteúdo de email de forma mais permissiva
function validateEmailContent(emailData: {
  recipients?: string[]
  subject?: string
  customContent?: string
  content?: string
}): { isValid: boolean; threats: string[] } {
  const threats: string[] = []

  // Verificar apenas ameaças críticas e óbvias em emails
  const allContent = [
    ...(emailData.recipients || []),
    emailData.subject || '',
    emailData.customContent || '',
    emailData.content || '',
  ].join(' ')

  // Padrões muito específicos para emails - apenas ameaças reais
  const criticalPatterns = {
    // XSS muito óbvio
    xss: [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:\s*[^;]/gi,
      /<iframe[^>]*src\s*=/gi,
    ],
    // SQL Injection óbvio
    sql: [/union\s+select\s+/gi, /drop\s+table\s+/gi, /delete\s+from\s+/gi],
  }

  // Verificar XSS crítico
  if (criticalPatterns.xss.some(pattern => pattern.test(allContent))) {
    threats.push('CRITICAL_XSS')
  }

  // Verificar SQL Injection crítico
  if (criticalPatterns.sql.some(pattern => pattern.test(allContent))) {
    threats.push('CRITICAL_SQL_INJECTION')
  }

  return {
    isValid: threats.length === 0,
    threats,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipients, subject, template, customContent, type, content } = body

    // Obter IP do cliente para auditoria
    const clientIP =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || ''

    // Validação de segurança específica para emails - muito mais permissiva
    console.log(
      '🔍 Validando dados de entrada para email:',
      JSON.stringify(body, null, 2)
    )

    // Para emails, validar apenas ameaças críticas e óbvias
    const emailValidation = validateEmailContent({
      recipients: body.recipients,
      subject: body.subject,
      customContent: body.customContent,
      content: body.content,
    })

    if (!emailValidation.isValid) {
      console.log(
        '⚠️ Ameaças críticas detectadas em email:',
        emailValidation.threats
      )
      logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        ip: clientIP,
        userAgent,
        path: '/api/send-email',
        payload: { threats: emailValidation.threats, originalData: body },
        severity: 'MEDIUM',
      })

      return NextResponse.json(
        { success: false, error: 'Dados de entrada contêm conteúdo suspeito' },
        { status: 400 }
      )
    }

    console.log('✅ Validação de segurança passou')

    // Validação básica
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lista de destinatários é obrigatória' },
        { status: 400 }
      )
    }

    // Para newsletters, template não é obrigatório se type='newsletter' for fornecido
    if (!subject || (!template && type !== 'newsletter')) {
      return NextResponse.json(
        { success: false, error: 'Assunto e template são obrigatórios' },
        { status: 400 }
      )
    }

    // Sanitizar dados sensíveis
    const sanitizedData = {
      recipients: recipients.map(
        email => sanitizeMedicalFormData({ email })['email']
      ),
      subject: subject, // Usar subject diretamente já que passou na validação
      template,
      customContent: customContent
        ? sanitizeMedicalFormData({ content: customContent })['content']
        : customContent,
      type,
      content: content
        ? sanitizeMedicalFormData({ content })['content']
        : content,
    }

    // Verificar configuração de email
    console.log('🔍 Verificando configuração de email:')
    console.log(
      'EMAIL_USER:',
      process.env['EMAIL_USER'] ? 'Configurado' : 'Não configurado'
    )
    console.log(
      'EMAIL_PASSWORD:',
      (process.env['EMAIL_PASSWORD'] || process.env['EMAIL_PASS']) ? 'Configurado (****)' : 'Não configurado'
    )
    console.log('EMAIL_HOST:', process.env['EMAIL_HOST'] || 'smtp.gmail.com')
    console.log('EMAIL_PORT:', process.env['EMAIL_PORT'] || '587')

    const emailPassword = process.env['EMAIL_PASSWORD'] || process.env['EMAIL_PASS']
    
    if (!process.env['EMAIL_USER'] || !emailPassword) {
      console.error('❌ Configuração de email incompleta:')
      console.error(
        'EMAIL_USER:',
        process.env['EMAIL_USER'] ? 'Configurado' : 'Não configurado'
      )
      console.error(
        'EMAIL_PASSWORD/EMAIL_PASS:',
        emailPassword ? 'Configurado' : 'Não configurado'
      )
      return NextResponse.json(
        {
          success: false,
          error:
            'Configuração de email não encontrada. Verifique as variáveis EMAIL_USER e EMAIL_PASSWORD no Railway',
        },
        { status: 500 }
      )
    }

    console.log('=== ENVIANDO E-MAILS REAIS ===')
    console.log('Destinatários:', recipients)
    console.log('Assunto:', subject)
    console.log('Template:', template)
    console.log('===============================')

    const results: Array<{
      email: string
      status: 'sent' | 'failed'
      messageId?: string
      error?: string
      sentAt: string
    }> = []
    let successCount = 0
    let errorCount = 0

    // Enviar emails baseado no template
    for (const email of recipients) {
      try {
        let success = false

        if (template === 'welcome') {
          // Enviar email de boas-vindas diretamente usando nodemailer
          const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
              user: process.env.EMAIL_USER,
              pass: emailPassword,
            },
            tls: {
              rejectUnauthorized: false,
            },
          })

          const mailOptions = {
            from: `"Dr. João Vitor Viana" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject || 'Bem-vindo(a) ao consultório Dr. João Vitor Viana',
            html: content || `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Bem-vindo(a) ao consultório Dr. João Vitor Viana!</h2>
                <p>Olá! Seja bem-vindo(a) ao nosso consultório.</p>
                <p>Estamos aqui para cuidar da sua saúde com excelência e dedicação.</p>
                <p>Atenciosamente,<br>Dr. João Vitor Viana</p>
              </div>
            `
          }

          const result = await transporter.sendMail(mailOptions)
          success = !!result.messageId
        } else if (template === 'birthday') {
          success = await sendBirthdayEmail({
            name: 'Caro Paciente',
            email: email,
            birthDate: '01/01/1990',
          })
        } else if (template === 'newsletter' || type === 'newsletter') {
          const newsletterContent =
            content || customContent || 'Conteúdo da newsletter'
          success = await sendNewsletterEmail(
            [email],
            newsletterContent,
            subject
          )
        }

        if (success) {
          results.push({
            email,
            status: 'sent',
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sentAt: new Date().toISOString(),
          })
          successCount++
        } else {
          results.push({
            email,
            status: 'failed',
            error: 'Falha no envio',
            sentAt: new Date().toISOString(),
          })
          errorCount++
        }

        // Pequena pausa entre envios
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        results.push({
          email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          sentAt: new Date().toISOString(),
        })
        errorCount++
      }
    }

    console.log(`✅ Emails enviados: ${successCount}`)
    console.log(`❌ Emails falharam: ${errorCount}`)

    return NextResponse.json(
      {
        success: successCount > 0,
        message: `${successCount} e-mail(s) enviado(s) com sucesso${errorCount > 0 ? `, ${errorCount} falharam` : ''}`,
        results,
        stats: {
          total: recipients.length,
          sent: successCount,
          failed: errorCount,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao enviar e-mails:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor ao enviar e-mails' },
      { status: 500 }
    )
  }
}
