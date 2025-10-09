import { NextRequest, NextResponse } from 'next/server'
import {
  startDailyCronScheduler,
  stopDailyCronScheduler,
  getCronJobStats,
  forceSendTomorrowAgenda,
  scheduleManualDailyAgenda,
} from '../../../lib/daily-cron-scheduler'

// Controle do sistema de cron job diário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, targetDate } = body

    switch (action) {
      case 'start':
        startDailyCronScheduler()
        return NextResponse.json({
          success: true,
          message: 'Sistema de cron job iniciado com sucesso',
          stats: getCronJobStats(),
        })

      case 'stop':
        stopDailyCronScheduler()
        return NextResponse.json({
          success: true,
          message: 'Sistema de cron job parado com sucesso',
        })

      case 'stats':
        return NextResponse.json({
          success: true,
          stats: getCronJobStats(),
        })

      case 'force_tomorrow':
        await forceSendTomorrowAgenda()
        return NextResponse.json({
          success: true,
          message: 'Agenda de amanhã enviada com sucesso',
        })

      case 'manual_schedule':
        if (!targetDate) {
          return NextResponse.json(
            { error: 'targetDate é obrigatório para agendamento manual' },
            { status: 400 }
          )
        }
        await scheduleManualDailyAgenda(targetDate)
        return NextResponse.json({
          success: true,
          message: `Agenda para ${targetDate} enviada com sucesso`,
        })

      default:
        return NextResponse.json(
          {
            error:
              'Ação não reconhecida. Use: start, stop, stats, force_tomorrow, manual_schedule',
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Erro no controle do cron job:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para obter estatísticas
export async function GET() {
  try {
    const stats = getCronJobStats()

    return NextResponse.json({
      success: true,
      stats,
      message: 'Estatísticas do sistema de cron job',
      info: {
        description: 'Sistema automático que envia agendas diárias às 20:00',
        timezone: 'America/Sao_Paulo',
        checkInterval: '60 segundos',
        targetTime: '20:00',
      },
    })
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do cron job:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
