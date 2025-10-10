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

    let surgeries = await getAllSurgeries()

    // Filtros
    if (date) {
      surgeries = await getSurgeriesByDate(date)
    }

    if (status) {
      surgeries = surgeries.filter(surgery => surgery.status === status)
    }

    // Remover filtro de paymentType pois não existe na interface Surgery
    // if (paymentType) {
    //   surgeries = surgeries.filter(
    //     surgery => surgery.paymentType === paymentType
    //   )
    // }

    // Ordenar por data e hora (mais recentes primeiro)
    surgeries.sort((a, b) => {
      const dateA = new Date(
        `${a.surgeryDate}T${a.surgeryTime}`
      )
      const dateB = new Date(
        `${b.surgeryDate}T${b.surgeryTime}`
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

    // Validação básica - campos da interface Surgery
    if (
      !body.patientName ||
      !body.surgeryType ||
      !body.surgeryDate ||
      !body.surgeryTime
    ) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Criar ou atualizar contato de comunicação
    const contactResult = await createOrUpdateCommunicationContact({
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

    // Criar cirurgia usando o sistema unificado - campos corretos da interface Surgery
    const surgeryResult = await createSurgery({
      communicationContactId: contactResult.contact.id,
      medicalPatientId: body.medicalPatientId,
      surgeryDate: body.surgeryDate || body.date,
      surgeryTime: body.surgeryTime || body.time,
      type: body.surgeryType,
      description: body.description || '',
      surgeon: body.surgeon || 'Dr. João Vitor Viana',
      anesthesiologist: body.anesthesiologist,
      duration: body.duration,
      status: body.status || 'scheduled',
      preOpNotes: body.preOpNotes,
      postOpNotes: body.postOpNotes,
      complications: body.complications,
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

    // Atualizar cirurgia usando o sistema unificado - campos corretos da interface Surgery
    const surgeryResult = await updateSurgery(body.id, {
      surgeryDate: body.surgeryDate || body.date,
      surgeryTime: body.surgeryTime || body.time,
      type: body.surgeryType,
      description: body.description,
      surgeon: body.surgeon,
      anesthesiologist: body.anesthesiologist,
      duration: body.duration,
      status: body.status,
      preOpNotes: body.preOpNotes,
      postOpNotes: body.postOpNotes,
      complications: body.complications,
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
