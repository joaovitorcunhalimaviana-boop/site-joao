import { NextRequest, NextResponse } from 'next/server'
import { startBirthdayCronJob, stopBirthdayCronJob, getBirthdayJobStatus } from '@/lib/birthday-cron-scheduler'
import { logActivity } from '@/lib/activity-logger'
import { rateLimiter } from '@/lib/rate-limiter'
import { AuditService } from '@/lib/audit-service'

// POST - Iniciar/parar sistema de cron de aniversários
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter(request, {
      maxRequests: 10,
      windowMs: 60000, // 1 minuto
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (!action || !['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Ação inválida. Use "start" ou "stop".' },
        { status: 400 }
      )
    }

    let result
    if (action === 'start') {
      result = startBirthdayCronJob()
      await logActivity({
        action: 'birthday_cron_started',
        details: 'Sistema de cron de aniversários iniciado',
        timestamp: new Date().toISOString(),
        source: 'api'
      })
    } else {
      result = stopBirthdayCronJob()
      await logActivity({
        action: 'birthday_cron_stopped',
        details: 'Sistema de cron de aniversários parado',
        timestamp: new Date().toISOString(),
        source: 'api'
      })
    }

    // Auditoria
    await AuditService.log({
      action: `birthday_cron_${action}`,
      resource: 'birthday-cron',
      details: {
        action,
        result
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: result.message,
      status: result.status
    })

  } catch (error) {
    console.error(' Erro na API de cron de aniversários:', error)
    
    await AuditService.log({
      action: 'birthday_cron_error',
      resource: 'birthday-cron',
      details: {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Verificar status do sistema de cron
export async function GET(request: NextRequest) {
  try {
    const status = getBirthdayJobStatus()
    
    return NextResponse.json({
      success: true,
      status
    })

  } catch (error) {
    console.error(' Erro ao verificar status do cron:', error)
    
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
