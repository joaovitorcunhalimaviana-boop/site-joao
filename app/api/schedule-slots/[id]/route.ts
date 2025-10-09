import { NextRequest, NextResponse } from 'next/server'
import {
  getAllSCHEDULESlots,
  updateSCHEDULESlot,
  deleteSCHEDULESlot,
  SCHEDULESlot,
} from '@/lib/unified-patient-system-prisma'

// PATCH - Atualizar slot (ativar/desativar)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, isActive } = body

    if (action === 'toggle') {
      // Buscar o slot atual
      const slots = await getAllSCHEDULESlots()
      const currentSlot = slots.find(slot => slot.id === id)

      if (!currentSlot) {
        return NextResponse.json(
          { success: false, error: 'Slot não encontrado' },
          { status: 404 }
        )
      }

      // Alternar o status
      const result = updateSCHEDULESlot(id, { isActive: !currentSlot.isActive })

      if (result.success) {
        return NextResponse.json({
          success: true,
          slot: result.slot,
          message: 'Status do slot atualizado com sucesso',
        })
      } else {
        return NextResponse.json(
          { success: false, error: result.message },
          { status: 400 }
        )
      }
    } else if (typeof isActive === 'boolean') {
      // Atualizar com valor específico
      const result = updateSCHEDULESlot(id, { isActive })

      if (result.success) {
        return NextResponse.json({
          success: true,
          slot: result.slot,
          message: 'Status do slot atualizado com sucesso',
        })
      } else {
        return NextResponse.json(
          { success: false, error: result.message },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Ação inválida ou isActive deve ser boolean' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Erro ao atualizar slot:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    const result = deleteSCHEDULESlot(id)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Slot removido com sucesso',
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Erro ao remover slot:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
