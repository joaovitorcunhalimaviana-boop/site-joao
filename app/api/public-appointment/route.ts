import { NextRequest, NextResponse } from 'next/server'
import { createPublicAppointment } from '../../../lib/unified-appointment-system'

// POST - Criar agendamento público através do formulário
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API PUBLIC-APPOINTMENT: Recebendo requisição...')

    const body = await request.json()
    console.log('📋 Dados recebidos:', body)

    const {
      fullName,
      cpf,
      email,
      phone,
      whatsapp,
      birthDate,
      insuranceType,
      selectedDate,
      selectedTime,
    } = body

    // Validar campos obrigatórios
    if (
      !fullName ||
      !cpf ||
      !phone ||
      !whatsapp ||
      !birthDate ||
      !insuranceType ||
      !selectedDate ||
      !selectedTime
    ) {
      console.log('❌ Campos obrigatórios faltando')
      return NextResponse.json(
        {
          success: false,
          error:
            'Campos obrigatórios: fullName, cpf, phone, whatsapp, birthDate, insuranceType, selectedDate, selectedTime',
        },
        { status: 400 }
      )
    }

    // Converter selectedDate para objeto Date se for string
    const dateObject =
      typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate

    console.log('💾 Chamando createPublicAppointment...')

    // Criar agendamento público
    const result = await createPublicAppointment({
      fullName,
      cpf,
      email: email || '',
      phone,
      whatsapp,
      birthDate,
      insuranceType,
      selectedDate: dateObject,
      selectedTime,
    })

    console.log('📊 Resultado do createPublicAppointment:', result)

    if (result.success) {
      console.log('✅ Agendamento público criado com sucesso!')
      return NextResponse.json({
        success: true,
        appointment: result.appointment,
        patient: result.patient,
        message: 'Agendamento criado com sucesso!',
      })
    } else {
      console.log('❌ Falha ao criar agendamento:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          existingAppointment: result.existingAppointment,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('❌ Erro na API public-appointment:', error)
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
