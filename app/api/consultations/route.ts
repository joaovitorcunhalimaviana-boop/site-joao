import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import {
  getAllAppointments,
  createAppointment,
  updateAppointment,
  UnifiedAppointment,
} from '@/lib/unified-patient-system-prisma'
import { ApiRedisCache } from '@/lib/redis-cache'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key'

// Interface para consultas (compatibilidade)
interface Consultation {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

// Função para verificar autenticação
async function verifyAuth() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    console.log('=== AUTH DEBUG ===')
    console.log('Token encontrado:', token ? 'SIM' : 'NÃO')
    console.log('JWT_SECRET:', JWT_SECRET)

    if (!token) {
      console.log('❌ Nenhum token encontrado')
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log('✅ Token decodificado:', decoded)
    return decoded
  } catch (error) {
    console.log('❌ Erro ao verificar token:', error)
    return null
  }
}

// Função para converter agendamentos em consultas
function convertAppointmentToConsultation(
  appointment: UnifiedAppointment
): Consultation {
  return {
    id: appointment.id,
    patientId: appointment.medicalPatientId || appointment.communicationContactId,
    patientName: 'Nome não informado', // Nome deve ser buscado do relacionamento
    date: appointment.appointmentDate,
    time: appointment.appointmentTime,
    type: appointment.type,
    status:
      appointment.status === 'scheduled'
        ? 'scheduled'
        : appointment.status === 'completed'
          ? 'completed'
          : appointment.status === 'cancelled'
            ? 'cancelled'
            : 'scheduled',
    notes: appointment.observations || '',
    createdAt: appointment.createdAt,
  }
}

// GET - Listar consultas
export async function GET() {
  try {
    const auth = await verifyAuth()

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 401 }
      )
    }

    // Tentar buscar do cache primeiro (desabilitado temporariamente devido a erro)
    // const cacheKey = 'consultations:all'
    // const cachedResult = await ApiRedisCache.get(cacheKey)
    // if (cachedResult) {
    //   return NextResponse.json(cachedResult)
    // }

    // Buscar agendamentos do sistema unificado
    const appointments = await getAllAppointments()

    // Converter agendamentos em consultas
    const unifiedConsultations = appointments.map(
      convertAppointmentToConsultation
    )

    // Usar apenas as consultas unificadas
    const allConsultations = unifiedConsultations

    console.log('=== CONSULTATIONS API DEBUG ===')
    console.log('Total agendamentos encontrados:', appointments.length)
    console.log('Total consultas retornadas:', allConsultations.length)
    console.log(
      'Consultas:',
      allConsultations.map(c => ({
        id: c.id,
        patientName: c.patientName,
        date: c.date,
        time: c.time,
        status: c.status,
      }))
    )
    console.log('===============================')

    const result = {
      success: true,
      consultations: allConsultations,
    }

    // Cache por 2 minutos (desabilitado temporariamente devido a erro)
    // const cacheKey = 'consultations:all'
    // await ApiRedisCache.set(cacheKey, result, {
    //   ttl: 2 * 60 * 1000,
    //   tags: ['consultations', 'appointments'],
    // })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao listar consultas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova consulta
export async function POST(request: NextRequest) {
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

    // Criar agendamento no sistema unificado
    const appointmentData = {
      communicationContactId: patientId,
      medicalPatientId: patientId,
      appointmentDate: date,
      appointmentTime: time,
      type: type,
      status: 'scheduled' as const,
      observations: notes || '',
    }

    const result = await createAppointment(appointmentData)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      )
    }

    // Invalidar cache de consultas e agendamentos
    await ApiRedisCache.invalidateByTags(['consultations', 'appointments'])

    // Converter para formato de consulta
    const consultation = convertAppointmentToConsultation(result.appointment!)

    return NextResponse.json({
      success: true,
      consultation,
    })
  } catch (error) {
    console.error('Erro ao criar consulta:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar consulta
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
        { success: false, error: 'ID da consulta é obrigatório' },
        { status: 400 }
      )
    }

    // Converter dados de consulta para formato de agendamento
    const appointmentUpdateData: Partial<UnifiedAppointment> = {}

    if (updateData.date) appointmentUpdateData.appointmentDate = updateData.date
    if (updateData.time) appointmentUpdateData.appointmentTime = updateData.time
    if (updateData.type) appointmentUpdateData.type = updateData.type
    if (updateData.notes !== undefined)
      appointmentUpdateData.observations = updateData.notes
    if (updateData.status) {
      appointmentUpdateData.status =
        updateData.status === 'scheduled'
          ? 'scheduled'
          : updateData.status === 'completed'
            ? 'completed'
            : updateData.status === 'cancelled'
              ? 'cancelled'
              : 'scheduled'
    }

    const result = await updateAppointment(id, appointmentUpdateData)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: result.message === 'Agendamento não encontrado' ? 404 : 400 }
      )
    }

    // Invalidar cache de consultas e agendamentos
    await ApiRedisCache.invalidateByTags(['consultations', 'appointments'])

    // Converter para formato de consulta
    const consultation = convertAppointmentToConsultation(result.appointment!)

    return NextResponse.json({
      success: true,
      consultation,
    })
  } catch (error) {
    console.error('Erro ao atualizar consulta:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar consulta
export async function DELETE(request: NextRequest) {
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
        { success: false, error: 'ID da consulta é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar status para cancelada no sistema unificado
    const result = await updateAppointment(id, { status: 'cancelled' })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: result.message === 'Agendamento não encontrado' ? 404 : 400 }
      )
    }

    // Invalidar cache de consultas e agendamentos
    await ApiRedisCache.invalidateByTags(['consultations', 'appointments'])

    // Converter para formato de consulta
    const consultation = convertAppointmentToConsultation(result.appointment!)

    return NextResponse.json({
      success: true,
      consultation,
    })
  } catch (error) {
    console.error('Erro ao cancelar consulta:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
