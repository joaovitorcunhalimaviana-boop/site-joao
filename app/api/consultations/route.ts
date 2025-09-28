import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { consultations, type Consultation } from './data'
import { getAllAppointments, type UnifiedAppointment } from '@/lib/unified-appointment-system'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key'

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
function convertAppointmentToConsultation(appointment: UnifiedAppointment): Consultation {
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    date: appointment.appointmentDate,
    time: appointment.appointmentTime,
    type: appointment.appointmentType,
    status: appointment.status === 'agendada' ? 'scheduled' : 
            appointment.status === 'concluida' ? 'completed' : 
            appointment.status === 'cancelada' ? 'cancelled' : 'scheduled',
    notes: appointment.notes || '',
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

    // Buscar agendamentos do sistema unificado
    const appointments = await getAllAppointments()
    
    // Converter agendamentos em consultas
    const unifiedConsultations = appointments.map(convertAppointmentToConsultation)
    
    // Combinar com consultas existentes (se houver)
    const allConsultations = [...consultations, ...unifiedConsultations]
    
    console.log('=== CONSULTATIONS API DEBUG ===')
    console.log('Total agendamentos encontrados:', appointments.length)
    console.log('Total consultas retornadas:', allConsultations.length)
    console.log('Consultas:', allConsultations.map(c => ({
      id: c.id,
      patientName: c.patientName,
      date: c.date,
      time: c.time,
      status: c.status
    })))
    console.log('===============================')

    return NextResponse.json({
      success: true,
      consultations: allConsultations,
    })
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

    const newConsultation: Consultation = {
      id: Date.now().toString(),
      patientId,
      patientName,
      date,
      time,
      type,
      status: 'scheduled',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    }

    consultations.push(newConsultation)

    return NextResponse.json({
      success: true,
      consultation: newConsultation,
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

    const consultationIndex = consultations.findIndex(c => c.id === id)

    if (consultationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Consulta não encontrada' },
        { status: 404 }
      )
    }

    consultations[consultationIndex] = {
      ...consultations[consultationIndex],
      ...updateData,
    }

    return NextResponse.json({
      success: true,
      consultation: consultations[consultationIndex],
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

    const consultationIndex = consultations.findIndex(c => c.id === id)

    if (consultationIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Consulta não encontrada' },
        { status: 404 }
      )
    }

    const consultation = consultations[consultationIndex]
    if (consultation) {
      consultation.status = 'cancelled'
    }

    return NextResponse.json({
      success: true,
      message: 'Consulta cancelada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao cancelar consulta:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
