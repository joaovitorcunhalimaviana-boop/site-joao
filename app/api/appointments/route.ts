import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limiter'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key'

// Simulação de dados de agendamentos
const appointments: Array<{
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}> = []

// Função para verificar autenticação
async function verifyAuth() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch (error) {
    return null
  }
}

// GET - Listar agendamentos
export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.APPOINTMENTS,
    async () => {
      try {
        const auth = await verifyAuth()

        if (!auth) {
          return NextResponse.json(
            { success: false, error: 'Acesso negado' },
            { status: 401 }
          )
        }

        return NextResponse.json({
          success: true,
          appointments,
        })
      } catch (error) {
        console.error('Erro ao listar agendamentos:', error)
        return NextResponse.json(
          { success: false, error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'APPOINTMENTS_LIST_ACCESS',
      resourceName: 'Appointments API',
    }
  )
}

// POST - Criar novo agendamento
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.APPOINTMENTS,
    async () => {
      try {
        const auth = await verifyAuth()

        if (!auth) {
          return NextResponse.json(
            { success: false, error: 'Acesso negado' },
            { status: 401 }
          )
        }

        const { patientId, patientName, date, time, type, notes } =
          await request.json()

        if (!patientId || !patientName || !date || !time || !type) {
          return NextResponse.json(
            { success: false, error: 'Dados obrigatórios não fornecidos' },
            { status: 400 }
          )
        }

        const newAppointment = {
          id: Date.now().toString(),
          patientId,
          patientName,
          date,
          time,
          type,
          status: 'scheduled' as const,
          notes: notes || '',
          createdAt: new Date().toISOString(),
        }

        appointments.push(newAppointment)

        return NextResponse.json({
          success: true,
          appointment: newAppointment,
        })
      } catch (error) {
        console.error('Erro ao criar agendamento:', error)
        return NextResponse.json(
          { success: false, error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'APPOINTMENT_CREATE',
      resourceName: 'Appointments API',
    }
  )
}

// PUT - Atualizar agendamento
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth()

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 401 }
      )
    }

    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      )
    }

    const appointmentIndex = appointments.findIndex(app => app.id === id)

    if (appointmentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...updateData,
    }

    return NextResponse.json({
      success: true,
      appointment: appointments[appointmentIndex],
    })
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar agendamento
export async function DELETE(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.APPOINTMENTS,
    async () => {
      try {
        const auth = await verifyAuth()

        if (!auth) {
          return NextResponse.json(
            { success: false, error: 'Acesso negado' },
            { status: 401 }
          )
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID do agendamento é obrigatório' },
            { status: 400 }
          )
        }

        const appointmentIndex = appointments.findIndex(app => app.id === id)

        if (appointmentIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Agendamento não encontrado' },
            { status: 404 }
          )
        }

        const appointment = appointments[appointmentIndex]
        if (appointment) {
          appointment.status = 'cancelled'
        }

        return NextResponse.json({
          success: true,
          message: 'Agendamento cancelado com sucesso',
        })
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error)
        return NextResponse.json(
          { success: false, error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'APPOINTMENT_CANCEL',
      resourceName: 'Appointments API',
    }
  )
}
