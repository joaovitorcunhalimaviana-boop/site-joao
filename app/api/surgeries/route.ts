import { NextRequest, NextResponse } from 'next/server'
import {
  getAllSurgeries,
  getSurgeriesByDate,
  createSurgery,
  updateSurgery,
  deleteSurgery,
  createOrUpdateCommunicationContact,
  type Surgery,
} from '@/lib/unified-patient-system-prisma'

// GET - Listar cirurgias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const paymentType = searchParams.get('paymentType')

    let surgeries = getAllSurgeries()

    // Filtros
    if (date) {
      surgeries = getSurgeriesByDate(date)
    }

    if (status) {
      surgeries = surgeries.filter(surgery => surgery.status === status)
    }

    if (paymentType) {
      surgeries = surgeries.filter(
        surgery => surgery.paymentType === paymentType
      )
    }

    // Ordenar por data e hora (mais recentes primeiro)
    surgeries.sort((a, b) => {
      const dateA = new Date(
        `${a.date.split('/').reverse().join('-')}T${a.time}`
      )
      const dateB = new Date(
        `${b.date.split('/').reverse().join('-')}T${b.time}`
      )
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({
      success: true,
      surgeries,
      total: surgeries.length,
    })
  } catch (error) {
    console.error('Erro ao buscar cirurgias:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova cirurgia
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação básica
    if (
      !body.patientName ||
      !body.surgeryType ||
      !body.date ||
      !body.time ||
      !body.paymentType ||
      !body.hospital
    ) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Criar ou atualizar contato de comunicação
    const contactResult = createOrUpdateCommunicationContact({
      name: body.patientName,
      email: body.patientEmail,
      whatsapp: body.patientWhatsapp,
      source: 'doctor_area',
    })

    if (!contactResult.success) {
      return NextResponse.json(
        { success: false, error: 'Erro ao criar contato de comunicação' },
        { status: 500 }
      )
    }

    // Criar cirurgia usando o sistema unificado
    const surgeryResult = await createSurgery({
      communicationContactId: contactResult.contact.id,
      medicalPatientId: body.medicalPatientId,
      patientName: body.patientName,
      surgeryType: body.surgeryType,
      date: body.date,
      time: body.time,
      hospital: body.hospital,
      paymentType: body.paymentType,
      insurancePlan: body.insurancePlan,
      totalValue: body.totalValue,
      hospitalValue: body.hospitalValue,
      anesthesiologistValue: body.anesthesiologistValue,
      instrumentalistValue: body.instrumentalistValue,
      auxiliaryValue: body.auxiliaryValue,
      doctorValue: body.doctorValue,
      doctorAmount: body.doctorAmount,
      totalAmount: body.totalAmount,
      hospitalAmount: body.hospitalAmount,
      assistantAmount: body.assistantAmount,
      expectedAmount: body.expectedAmount,
      procedureCodes: body.procedureCodes,
      notes: body.notes,
    })

    if (!surgeryResult.success) {
      return NextResponse.json(
        { success: false, error: surgeryResult.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cirurgia cadastrada com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar cirurgia:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cirurgia
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID da cirurgia é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar cirurgia usando o sistema unificado
    const surgeryResult = await updateSurgery(body.id, {
      patientName: body.patientName,
      surgeryType: body.surgeryType,
      date: body.date,
      time: body.time,
      hospital: body.hospital,
      paymentType: body.paymentType,
      insurancePlan: body.insurancePlan,
      totalValue: body.totalValue,
      hospitalValue: body.hospitalValue,
      anesthesiologistValue: body.anesthesiologistValue,
      instrumentalistValue: body.instrumentalistValue,
      auxiliaryValue: body.auxiliaryValue,
      doctorValue: body.doctorValue,
      doctorAmount: body.doctorAmount,
      totalAmount: body.totalAmount,
      hospitalAmount: body.hospitalAmount,
      assistantAmount: body.assistantAmount,
      expectedAmount: body.expectedAmount,
      procedureCodes: body.procedureCodes,
      status: body.status,
      notes: body.notes,
    })

    if (!surgeryResult.success) {
      return NextResponse.json(
        { success: false, error: surgeryResult.message },
        {
          status:
            surgeryResult.message === 'Cirurgia não encontrada' ? 404 : 500,
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cirurgia atualizada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao atualizar cirurgia:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar cirurgia
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da cirurgia é obrigatório' },
        { status: 400 }
      )
    }

    // Deletar cirurgia usando o sistema unificado
    const result = await deleteSurgery(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: result.message === 'Cirurgia não encontrada' ? 404 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cirurgia deletada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao deletar cirurgia:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
