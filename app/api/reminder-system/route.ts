import { NextRequest, NextResponse } from 'next/server'
import {
  scheduleAppointmentReminders,
  checkAndSendReminders,
  getReminderStats,
  getUpcomingReminders,
  cancelAppointmentReminders,
  generateAppointmentId,
  scheduleTestAppointment,
} from '../../../lib/reminder-scheduler'

// Cache para evitar processamento duplicado
const processCache = new Map<string, any>()
const CACHE_TTL = 30000 // 30 segundos

function getCacheKey(data: any): string {
  return `${data.patientName}-${data.appointmentDate}-${data.appointmentTime}`
}

// GET - Obter informações do sistema de lembretes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'stats':
        const stats = getReminderStats()
        return NextResponse.json({
          success: true,
          data: stats,
          message: 'Estatísticas obtidas com sucesso',
        })

      case 'upcoming':
        const limit = parseInt(searchParams.get('limit') || '10')
        const upcoming = getUpcomingReminders(limit)
        return NextResponse.json({
          success: true,
          data: upcoming,
          message: `${upcoming.length} próximos lembretes encontrados`,
        })

      case 'check':
        await checkAndSendReminders()
        return NextResponse.json({
          success: true,
          message: 'Verificação de lembretes executada',
        })

      case 'test':
        const testAppointment = scheduleTestAppointment()
        return NextResponse.json({
          success: true,
          data: testAppointment,
          message: 'Consulta de teste agendada com lembretes',
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            stats: getReminderStats(),
            upcoming: getUpcomingReminders(5),
          },
          message: 'Sistema de lembretes ativo',
        })
    }
  } catch (error) {
    console.error('❌ Erro no GET /api/reminder-system:', error)
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

// POST - Agendar lembretes para uma nova consulta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'schedule') {
      const {
        patientName,
        whatsapp,
        appointmentDate,
        appointmentTime,
        insuranceType,
        email,
      } = body

      // Validações otimizadas
      if (!patientName || !whatsapp || !appointmentDate || !appointmentTime) {
        return NextResponse.json(
          {
            success: false,
            error: 'Dados obrigatórios não fornecidos',
            required: [
              'patientName',
              'whatsapp',
              'appointmentDate',
              'appointmentTime',
            ],
          },
          { status: 400 }
        )
      }

      // Verificar cache para evitar processamento duplicado
      const cacheKey = getCacheKey({
        patientName,
        appointmentDate,
        appointmentTime,
      })
      const cached = processCache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('📦 Retornando lembretes do cache para:', patientName)
        return NextResponse.json(cached.data)
      }

      // Validação de data otimizada
      const appointmentDateTime = new Date(
        `${appointmentDate}T${appointmentTime}:00`
      )

      if (
        isNaN(appointmentDateTime.getTime()) ||
        appointmentDateTime <= new Date()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Data ou horário inválido ou no passado',
          },
          { status: 400 }
        )
      }

      // Criar dados da consulta
      const appointmentData = {
        id: generateAppointmentId(),
        patientName,
        whatsapp: whatsapp.replace(/\D/g, ''), // Remover caracteres não numéricos
        appointmentDate,
        appointmentTime,
        insuranceType,
        email,
      }

      // Agendar lembretes
      const scheduledReminders = scheduleAppointmentReminders(appointmentData)

      const response = {
        success: true,
        data: {
          appointment: appointmentData,
          reminders: scheduledReminders.map(r => ({
            type: r.reminderType,
            scheduledTime: r.scheduledTime,
            status: r.status,
          })),
        },
        message: `Lembretes agendados para ${patientName}`,
        reminderCount: scheduledReminders.length,
      }

      // Cachear resultado
      processCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      })

      return NextResponse.json(response)
    } else if (action === 'cancel') {
      const { appointmentId } = body

      if (!appointmentId) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID da consulta não fornecido',
          },
          { status: 400 }
        )
      }

      const canceledCount = cancelAppointmentReminders(appointmentId)

      return NextResponse.json({
        success: true,
        data: { canceledCount },
        message: `${canceledCount} lembretes cancelados`,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Ação não reconhecida',
          availableActions: ['schedule', 'cancel'],
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('❌ Erro no POST /api/reminder-system:', error)
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

// DELETE - Cancelar lembretes
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID da consulta não fornecido',
        },
        { status: 400 }
      )
    }

    const canceledCount = cancelAppointmentReminders(appointmentId)

    return NextResponse.json({
      success: true,
      data: { canceledCount },
      message: `${canceledCount} lembretes cancelados para consulta ${appointmentId}`,
    })
  } catch (error) {
    console.error('❌ Erro no DELETE /api/reminder-system:', error)
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
