import { NextRequest, NextResponse } from 'next/server'
import { getTodayISO, getTimestampISO } from '@/lib/date-utils'
import { 
  getAppointmentsByDate, 
  getAllPatients,
  createAppointment,
  updateAppointmentStatus
} from '@/lib/unified-appointment-system'

interface AgendaItem {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  type: 'appointment' | 'manual' // appointment = agendado pelo sistema, manual = adicionado pela secretária
  notes?: string
  createdAt: string
  updatedAt?: string
}

// Função para converter agendamento unificado para formato da agenda
function convertUnifiedToAgenda(unifiedAppointment: any): AgendaItem {
  return {
    id: unifiedAppointment.id,
    patientId: unifiedAppointment.patientId,
    patientName: unifiedAppointment.patientName,
    date: unifiedAppointment.appointmentDate,
    time: unifiedAppointment.appointmentTime,
    status: mapUnifiedStatus(unifiedAppointment.status),
    type: unifiedAppointment.source === 'public_appointment' ? 'appointment' : 'manual',
    notes: unifiedAppointment.notes || '',
    createdAt: unifiedAppointment.createdAt,
    updatedAt: unifiedAppointment.updatedAt
  }
}

// Função para mapear status do sistema unificado para agenda
function mapUnifiedStatus(unifiedStatus: string): 'pending' | 'accepted' | 'rejected' | 'completed' {
  switch (unifiedStatus) {
    case 'agendada':
      return 'pending'
    case 'confirmada':
      return 'accepted'
    case 'cancelada':
      return 'rejected'
    case 'concluida':
      return 'completed'
    default:
      return 'pending'
  }
}

// Função para mapear status da agenda para sistema unificado
function mapAgendaStatus(agendaStatus: string): string {
  switch (agendaStatus) {
    case 'pending':
      return 'agendada'
    case 'accepted':
      return 'confirmada'
    case 'rejected':
      return 'cancelada'
    case 'completed':
      return 'concluida'
    default:
      return 'agendada'
  }
}

// GET - Buscar itens da agenda por data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    if (!date) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 })
    }

    // Buscar agendamentos do sistema unificado
    const unifiedAppointments = await getAppointmentsByDate(date)
    
    // Converter para formato da agenda
    let agendaItems = unifiedAppointments.map(convertUnifiedToAgenda)

    // Filtrar por status se especificado
    if (status) {
      agendaItems = agendaItems.filter(item => item.status === status)
    }

    // Ordenar por horário
    agendaItems.sort((a, b) => a.time.localeCompare(b.time))

    return NextResponse.json(agendaItems)
  } catch (error) {
    console.error('Erro ao buscar agenda:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Adicionar novo item à agenda
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, patientName, date, time, notes } = body

    if (!patientId || !patientName || !date || !time) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: patientId, patientName, date, time' },
        { status: 400 }
      )
    }

    // Verificar se já existe agendamento no mesmo horário
    const existingAppointments = await getAppointmentsByDate(date)
    const timeConflict = existingAppointments.some(
      appointment => appointment.appointmentTime === time
    )

    if (timeConflict) {
      return NextResponse.json(
        { error: 'Já existe um agendamento neste horário' },
        { status: 409 }
      )
    }

    // Criar novo agendamento no sistema unificado
    const newAppointment = await createAppointment({
      patientId,
      patientName,
      appointmentDate: date,
      appointmentTime: time,
      status: 'agendada',
      source: 'manual',
      notes: notes || ''
    })

    if (!newAppointment.success) {
      return NextResponse.json(
        { error: newAppointment.error || 'Erro ao criar agendamento' },
        { status: 400 }
      )
    }

    // Converter para formato da agenda
    const agendaItem = convertUnifiedToAgenda(newAppointment.appointment)

    return NextResponse.json(agendaItem, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar item da agenda:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar item da agenda
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, time, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Atualizar status no sistema unificado
    if (status) {
      const unifiedStatus = mapAgendaStatus(status)
      const updateResult = await updateAppointmentStatus(id, unifiedStatus)
      
      if (!updateResult.success) {
        return NextResponse.json(
          { error: updateResult.error || 'Erro ao atualizar status' },
          { status: 400 }
        )
      }
    }

    // Para atualizações de horário e notas, precisamos buscar o agendamento e atualizar
    // (Nota: O sistema unificado pode precisar de uma função específica para isso)
    
    return NextResponse.json({ message: 'Item atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar item da agenda:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Remover item da agenda
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Cancelar agendamento (mudando status para cancelada)
    const cancelResult = await updateAppointmentStatus(id, 'cancelada')
    
    if (!cancelResult.success) {
      return NextResponse.json(
        { error: cancelResult.error || 'Erro ao cancelar agendamento' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'Item removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover item da agenda:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
