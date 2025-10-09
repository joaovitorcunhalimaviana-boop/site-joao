import { NextResponse } from 'next/server'

/**
 * Endpoint para testar se as variáveis de ambiente estão configuradas
 * Usado para diagnosticar problemas no Railway
 */
export async function GET() {
  try {
    // Verificar variáveis críticas sem expor valores sensíveis
    const envStatus = {
      telegram: {
        botToken: !!process.env['TELEGRAM_BOT_TOKEN'],
        chatId: !!process.env['TELEGRAM_CHAT_ID'],
      },
      other: {
        nodeEnv: process.env['NODE_ENV'] || 'not-set',
        appUrl: process.env['NEXT_PUBLIC_APP_URL'] || 'not-set',
        doctorWhatsapp: !!process.env['DOCTOR_WHATSAPP'],
      },
    }

    // Calcular status geral
    const telegramConfigured = Object.values(envStatus.telegram).every(Boolean)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'] || 'development',
      status: {
        overall: telegramConfigured ? 'configured' : 'incomplete',
        telegram: telegramConfigured ? 'configured' : 'incomplete',
      },
      details: envStatus,
      message: telegramConfigured
        ? '✅ Todas as variáveis críticas estão configuradas!'
        : '⚠️ Algumas variáveis críticas não estão configuradas.',
      recommendations: telegramConfigured
        ? []
        : [
            !telegramConfigured &&
              'Configure as variáveis do Telegram (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)',
          ].filter(Boolean),
    })
  } catch (error) {
    console.error('Erro ao verificar variáveis de ambiente:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
