import { NextResponse } from 'next/server'

/**
 * Endpoint para testar se as variáveis de ambiente estão configuradas
 * Usado para diagnosticar problemas no Railway
 */
export async function GET() {
  try {
    // Verificar variáveis críticas sem expor valores sensíveis
    const envStatus = {
      email: {
        host: !!process.env.EMAIL_HOST,
        port: !!process.env.EMAIL_PORT,
        user: !!process.env.EMAIL_USER,
        password: !!process.env.EMAIL_PASSWORD,
        from: !!process.env.EMAIL_FROM,
      },
      telegram: {
        botToken: !!process.env.TELEGRAM_BOT_TOKEN,
        chatId: !!process.env.TELEGRAM_CHAT_ID,
      },
      other: {
        nodeEnv: process.env.NODE_ENV || 'not-set',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not-set',
        doctorWhatsapp: !!process.env.DOCTOR_WHATSAPP,
      }
    }

    // Calcular status geral
    const emailConfigured = Object.values(envStatus.email).every(Boolean)
    const telegramConfigured = Object.values(envStatus.telegram).every(Boolean)
    const allConfigured = emailConfigured && telegramConfigured

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      status: {
        overall: allConfigured ? 'configured' : 'incomplete',
        email: emailConfigured ? 'configured' : 'incomplete',
        telegram: telegramConfigured ? 'configured' : 'incomplete',
      },
      details: envStatus,
      message: allConfigured 
        ? '✅ Todas as variáveis críticas estão configuradas!'
        : '⚠️ Algumas variáveis críticas não estão configuradas.',
      recommendations: allConfigured ? [] : [
        !emailConfigured && 'Configure as variáveis de email (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM)',
        !telegramConfigured && 'Configure as variáveis do Telegram (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)',
      ].filter(Boolean)
    })

  } catch (error) {
    console.error('Erro ao verificar variáveis de ambiente:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}