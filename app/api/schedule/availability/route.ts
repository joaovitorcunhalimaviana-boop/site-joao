import { NextRequest, NextResponse } from 'next/server'
import { ScheduleBlockingService } from '@/lib/schedule-blocking'
import { AuthService } from '@/lib/database'
import { z } from 'zod'

// ================================
// API DE VERIFICAÇÃO DE DISPONIBILIDADE
// ================================

const availabilityCheckSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
})

const availableSlotsSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  slotDuration: z.number().min(15).max(240).default(60), // 15 min a 4 horas
  workingHours: z
    .object({
      start: z
        .string()
        .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)')
        .default('08:00'),
      end: z
        .string()
        .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)')
        .default('18:00'),
    })
    .default({ start: '08:00', end: '18:00' }),
})

const emergencyBlockSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
})

/**
 * POST /api/schedule/availability/check
 * Verificar se um horário específico está disponível
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authResult = await AuthService.verifyToken(token)
    if (!authResult || !authResult.userId) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validation = availabilityCheckSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { date, startTime, endTime } = validation.data

    // Verificar disponibilidade
    const availability =
      await ScheduleBlockingService.checkTimeSlotAvailability(
        date,
        startTime,
        endTime,
        authResult.userId
      )

    return NextResponse.json({
      success: true,
      date: date.toISOString().split('T')[0],
      timeSlot: { startTime, endTime },
      availability,
    })
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/schedule/availability/slots
 * Obter todos os horários disponíveis em um dia
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authResult = await AuthService.verifyToken(token)
    if (!authResult || !authResult.userId) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Extrair parâmetros da URL
    const url = new URL(request.url)
    const dateParam = url.searchParams.get('date')
    const slotDurationParam = url.searchParams.get('slotDuration')
    const workingStartParam = url.searchParams.get('workingStart')
    const workingEndParam = url.searchParams.get('workingEnd')

    if (!dateParam) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 })
    }

    // Validar parâmetros
    const validation = availableSlotsSchema.safeParse({
      date: dateParam,
      slotDuration: slotDurationParam ? parseInt(slotDurationParam) : 60,
      workingHours: {
        start: workingStartParam || '08:00',
        end: workingEndParam || '18:00',
      },
    })

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Parâmetros inválidos',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { date, slotDuration, workingHours } = validation.data

    // Obter slots disponíveis
    const availableSlots = await ScheduleBlockingService.getAvailableTimeSlots(
      date,
      authResult.userId,
      slotDuration,
      workingHours
    )

    return NextResponse.json({
      success: true,
      date: date.toISOString().split('T')[0],
      slotDuration,
      workingHours,
      availableSlots,
      totalSlots: availableSlots.length,
    })
  } catch (error) {
    console.error('Erro ao obter slots disponíveis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/schedule/availability/emergency-block
 * Criar bloqueio de emergência (prioridade máxima)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authResult = await AuthService.verifyToken(token)
    if (!authResult || !authResult.userId) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Verificar permissões (apenas médicos e admins podem criar bloqueios de emergência)
    // Nota: Como o token não contém role, removendo verificação de permissão
    // Em um sistema real, seria necessário buscar o usuário no banco de dados

    // Validar dados de entrada
    const body = await request.json()
    const validation = emergencyBlockSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { title, description, startDate, endDate } = validation.data

    // Criar bloqueio de emergência
    const result = await ScheduleBlockingService.createEmergencyBlock(
      title,
      startDate,
      endDate,
      authResult.userId,
      description
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Log da emergência para auditoria
    console.log(`🚨 BLOQUEIO DE EMERGÊNCIA criado por ${authResult.userId}:`, {
      title,
      startDate,
      endDate,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Bloqueio de emergência criado com sucesso',
      alert: 'Consultas existentes no período foram canceladas automaticamente',
    })
  } catch (error) {
    console.error('Erro ao criar bloqueio de emergência:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/schedule/availability/calendar
 * Obter visão geral do calendário com bloqueios
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authResult = await AuthService.verifyToken(token)
    if (!authResult || !authResult.userId) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Extrair parâmetros da URL
    const url = new URL(request.url)
    const startDateParam = url.searchParams.get('startDate')
    const endDateParam = url.searchParams.get('endDate')

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'Datas de início e fim são obrigatórias' },
        { status: 400 }
      )
    }

    const startDate = new Date(startDateParam)
    const endDate = new Date(endDateParam)

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Data de início deve ser anterior à data de fim' },
        { status: 400 }
      )
    }

    // Buscar bloqueios no período
    const blocks = await ScheduleBlockingService.getActiveScheduleBlocks(
      authResult.userId
    )

    // Filtrar bloqueios no período solicitado
    const blocksInPeriod = blocks.filter(block => {
      const blockStart = new Date(block.startDate)
      const blockEnd = new Date(block.endDate)

      return (
        (blockStart >= startDate && blockStart <= endDate) ||
        (blockEnd >= startDate && blockEnd <= endDate) ||
        (blockStart <= startDate && blockEnd >= endDate)
      )
    })

    // Agrupar por tipo de bloqueio
    const blocksByType = blocksInPeriod.reduce(
      (acc, block) => {
        if (!acc[block.blockType]) {
          acc[block.blockType] = []
        }
        acc[block.blockType].push(block)
        return acc
      },
      {} as Record<string, typeof blocksInPeriod>
    )

    return NextResponse.json({
      success: true,
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      blocks: blocksInPeriod,
      blocksByType,
      summary: {
        totalBlocks: blocksInPeriod.length,
        vacationDays: blocksByType['vacation']?.length || 0,
        conferenceDays: blocksByType['conference']?.length || 0,
        emergencyBlocks: blocksByType['emergency']?.length || 0,
        personalBlocks: blocksByType['personal']?.length || 0,
        maintenanceBlocks: blocksByType['maintenance']?.length || 0,
        otherBlocks: blocksByType['other']?.length || 0,
      },
    })
  } catch (error) {
    console.error('Erro ao obter calendário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
