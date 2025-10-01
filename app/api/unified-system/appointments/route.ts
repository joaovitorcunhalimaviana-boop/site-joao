import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllAppointments,
  createAppointment,
  getAppointmentsByDate,
  UnifiedAppointment
} from '@/lib/unified-patient-system'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (date) {
      const appointments = getAppointmentsByDate(date)
      return NextResponse.json({
        success: true,
        appointments,
        count: appointments.length
      })
    }

    const appointments = getAllAppointments()
    return NextResponse.json({
      success: true,
      appointments,
      count: appointments.length
    })
  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
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
      duration
    } = body

    if (!communicationContactId || !appointmentDate || !appointmentTime || !appointmentType || !source) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos obrigatórios: communicationContactId, appointmentDate, appointmentTime, appointmentType, source' 
        },
        { status: 400 }
      )
    }

    const result = createAppointment({
      communicationContactId,
      medicalPatientId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      source,
      notes,
      duration
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
      message: result.message
    })
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}