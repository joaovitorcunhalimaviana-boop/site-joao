import { NextRequest, NextResponse } from 'next/server'
import {
  getAllAppointments,
  getAppointmentsByDate,
  createAppointment,
} from '@/lib/unified-patient-system-prisma'
import { ApiRedisCache } from '@/lib/redis-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const patientName = searchParams.get('patientName')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Tentar buscar do cache primeiro
    const cachedResult = await ApiRedisCache.appointments.get(
      date || undefined,
      page,
      limit
    )
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    // Buscar agendamentos
    let appointments = date ? await getAppointmentsByDate(date) : await getAllAppointments()

    // Aplicar filtros
    if (status) {
      appointments = appointments.filter(
        appointment => appointment.status === status
      )
    }

    if (patientName) {
      const searchTerm = patientName.toLowerCase()
      appointments = appointments.filter(appointment =>
        appointment.patientName.toLowerCase().includes(searchTerm)
      )
    }

    // Ordenar por data e hora
    appointments.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`)
      const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`)
      return dateA.getTime() - dateB.getTime()
    })

    // Aplicar paginação
    const total = appointments.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAppointments = appointments.slice(startIndex, endIndex)

    const result = {
      success: true,
      appointments: paginatedAppointments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }

    // Cache por 2 minutos
    await ApiRedisCache.appointments.set(date || undefined, page, limit, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      communicationContactId,
      medicalPatientId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      source,
      notes,
      duration,
    } = body

    if (
      !communicationContactId ||
      !appointmentDate ||
      !appointmentTime ||
      !appointmentType ||
      !source
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Campos obrigatórios: communicationContactId, appointmentDate, appointmentTime, appointmentType, source',
        },
        { status: 400 }
      )
    }

    const result = await createAppointment({
      communicationContactId,
      medicalPatientId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      source,
      notes,
      duration,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      appointment: result.appointment,
      message: result.message,
    })
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
