import { NextRequest, NextResponse } from 'next/server'
import {
  getSurgeryById,
  updateSurgery,
  deleteSurgery,
  getCommunicationContactById,
  type Surgery,
} from '@/lib/unified-patient-system-prisma'

// GET - Buscar cirurgia específica por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const surgery = await getSurgeryById(id)

    if (!surgery) {
      return NextResponse.json(
        { success: false, error: 'Cirurgia não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      surgery,
    })
  } catch (error) {
    console.error('Erro ao buscar cirurgia:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar cirurgia específica
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const result = await updateSurgery(id, body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: result.message === 'Cirurgia não encontrada' ? 404 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error('Erro ao atualizar cirurgia:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir cirurgia específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await deleteSurgery(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: result.message === 'Cirurgia não encontrada' ? 404 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error('Erro ao excluir cirurgia:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
