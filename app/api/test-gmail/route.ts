import { NextRequest, NextResponse } from 'next/server'
import { GmailOptimizer, GMAIL_CONFIGURATIONS } from '@/lib/gmail-optimizer'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Iniciando teste das configurações do Gmail...')
    
    // Verificar se as credenciais estão configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais do Gmail não configuradas',
        details: {
          EMAIL_USER: !!process.env.EMAIL_USER,
          EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD
        }
      }, { status: 400 })
    }

    const optimizer = GmailOptimizer.getInstance()
    
    // Resetar configurações para teste completo
    optimizer.resetTestedConfigs()
    
    const results = []
    let workingConfig = null

    // Testar cada configuração
    for (const config of GMAIL_CONFIGURATIONS) {
      console.log(`🧪 Testando: ${config.name}`)
      
      const startTime = Date.now()
      let isWorking = false
      let error = null

      try {
        isWorking = await optimizer.testConfiguration(config)
        if (isWorking && !workingConfig) {
          workingConfig = config
        }
      } catch (err: any) {
        error = err.message
      }

      const duration = Date.now() - startTime

      results.push({
        name: config.name,
        description: config.description,
        isWorking,
        duration: `${duration}ms`,
        error: error || (isWorking ? null : 'Falha na verificação'),
        config: {
          host: config.config.host,
          port: config.config.port,
          secure: config.config.secure,
          connectionTimeout: config.config.connectionTimeout
        }
      })
    }

    // Obter status final
    const status = optimizer.getConfigurationsStatus()

    return NextResponse.json({
      success: true,
      message: workingConfig 
        ? `Configuração funcionando encontrada: ${workingConfig.name}`
        : 'Nenhuma configuração do Gmail funcionou',
      workingConfig: workingConfig?.name || null,
      results,
      status,
      environment: {
        EMAIL_USER: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : 'não configurado',
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***configurado***' : 'não configurado'
      }
    })

  } catch (error: any) {
    console.error('❌ Erro no teste do Gmail:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste do Gmail',
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message } = body

    if (!to || !subject || !message) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros obrigatórios: to, subject, message'
      }, { status: 400 })
    }

    console.log('📧 Testando envio de email via Gmail otimizado...')

    const optimizer = GmailOptimizer.getInstance()
    
    const mailOptions = {
      from: `"Dr. João Vitor" <${process.env.EMAIL_USER}>`,
      to,
      subject: `[TESTE] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🧪 Teste do Sistema de Email</h2>
          <p><strong>Mensagem:</strong> ${message}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Este é um email de teste enviado pelo otimizador do Gmail.<br>
            Horário: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `
    }

    const startTime = Date.now()
    const result = await optimizer.sendEmailWithRetry(mailOptions)
    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: 'Email de teste enviado com sucesso via Gmail otimizado',
      details: {
        to,
        subject: mailOptions.subject,
        duration: `${duration}ms`,
        messageId: result.messageId,
        workingConfig: optimizer.getConfigurationsStatus().workingConfig
      }
    })

  } catch (error: any) {
    console.error('❌ Erro no envio de teste:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Falha no envio de email de teste',
      details: error.message,
      configStatus: GmailOptimizer.getInstance().getConfigurationsStatus()
    }, { status: 500 })
  }
}