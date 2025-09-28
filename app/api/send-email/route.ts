import { NextRequest, NextResponse } from 'next/server'
import { sendEmailWithFallback, EmailProviderManager } from '@/lib/email-providers'
import { sendGmailOptimized, GmailOptimizer } from '@/lib/gmail-optimizer'
import { logActivity } from '@/lib/activity-logger'
import { rateLimiter } from '@/lib/rate-limiter'
import { AuditService } from '@/lib/database'
import { z } from 'zod'
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

    // Enviar emails usando o sistema de provedores alternativos
    for (const email of recipients) {
      try {
        let success = false
        let messageId = ''

        // Preparar dados do email baseado no template
        let emailData = {
          to: email,
          from: `"Dr. João Vitor Viana" <${process.env.EMAIL_USER || 'noreply@joaovitorviana.com.br'}>`,
          subject: subject || 'Mensagem do consultório Dr. João Vitor Viana',
          html: content || 'Conteúdo do email'
        }

        if (template === 'welcome') {
          emailData = {
            ...emailData,
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
        } else if (template === 'birthday') {
          emailData = {
            ...emailData,
            subject: subject || 'Feliz Aniversário! 🎉',
            html: content || `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Feliz Aniversário! 🎉</h2>
                <p>Caro Paciente,</p>
                <p>Desejamos um feliz aniversário e muita saúde!</p>
                <p>Atenciosamente,<br>Dr. João Vitor Viana</p>
              </div>
            `
          }
        } else if (template === 'newsletter' || type === 'newsletter') {
          const newsletterContent = content || customContent || 'Conteúdo da newsletter'
          emailData = {
            ...emailData,
            subject: subject || 'Newsletter - Dr. João Vitor Viana',
            html: newsletterContent
          }
        }

        // Usar o sistema de provedores alternativos
        let result
        try {
          // Primeiro, tentar com o sistema de fallback normal
          result = await sendEmailWithFallback(emailData)
          
        } catch (fallbackError) {
          console.log('❌ Sistema de fallback falhou, tentando otimizador do Gmail...')
          
          // Se o sistema de fallback falhar, tentar o otimizador do Gmail
          try {
            result = await sendGmailOptimized(emailData)
            console.log('✅ Email enviado com sucesso usando otimizador do Gmail')
            
          } catch (gmailError) {
            console.log('❌ Otimizador do Gmail também falhou:', gmailError)
            throw new Error(`Falha completa no envio: Fallback (${fallbackError.message}) e Gmail otimizado (${gmailError.message})`)
          }
        }
        
        success = result.success
        messageId = result.messageId || ''

        if (success) {
          results.push({
            email,
            status: 'sent',
            messageId: messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sentAt: new Date().toISOString(),
          })
          successCount++
        } else {
          results.push({
            email,
            status: 'failed',
            error: result.error || 'Falha no envio',
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
