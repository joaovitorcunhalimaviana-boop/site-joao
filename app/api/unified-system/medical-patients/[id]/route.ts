import { NextRequest, NextResponse } from 'next/server'
import {
  getMedicalPatientById,
  updateMedicalPatient,
  deleteMedicalPatient,
} from '@/lib/unified-patient-system-prisma'
// DELETE - Excluir paciente médico específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log('🗑️ Tentando excluir paciente médico:', id)

    // Verificar se o paciente existe
    const patient = await getMedicalPatientById(id)
    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paciente médico não encontrado',
        },
        { status: 404 }
      )
    }

    // Tentar excluir o paciente
    const result = deleteMedicalPatient(id)

    if (!result.success) {
      console.error('❌ Erro ao excluir paciente:', result.message)

      // Nota: Agendamentos e prontuários médicos não bloqueiam mais a exclusão do paciente

      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 }
      )
    }

    console.log('✅ Paciente excluído com sucesso:', id)

    return NextResponse.json({
      success: true,
      message: 'Paciente excluído com sucesso',
    })
  } catch (error) {
    console.error('❌ Erro interno ao excluir paciente médico:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
