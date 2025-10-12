import { NextRequest, NextResponse } from 'next/server'
import { deleteAppointment } from '../../../../lib/unified-patient-system-prisma'

// DELETE - Deletar agendamento por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      )
    }

    const deleteResult = await deleteAppointment(appointmentId)
    
    if (!deleteResult.success) {
      const statusCode = deleteResult.message.includes('não encontrado') ? 404 : 500
      return NextResponse.json(
        { success: false, error: deleteResult.message },
        { status: statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      message: deleteResult.message,
    })
  } catch (error) {
    console.error('❌ Erro ao deletar agendamento:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}