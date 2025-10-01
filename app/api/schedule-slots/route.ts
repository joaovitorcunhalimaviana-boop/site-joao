import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllScheduleSlots, 
  createScheduleSlot, 
  updateScheduleSlot, 
  deleteScheduleSlot,
  ScheduleSlot 
} from '@/lib/unified-patient-system'

// GET - Obter todos os slots
export async function GET(request: NextRequest) {
  try {
    const slots = await getAllScheduleSlots()
    
    return NextResponse.json({
      success: true,
      slots,
    })
  } catch (error) {
    console.error('Erro ao obter slots:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

// POST - Criar novo slot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, time } = body

    if (!date || !time) {
      return NextResponse.json(
        {
          success: false,
          error: 'date (YYYY-MM-DD) e time (string) são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          success: false,
          error: 'date deve estar no formato YYYY-MM-DD',
        },
        { status: 400 }
      )
    }

    try {
      const newSlot = await createScheduleSlot({ date, time })

      return NextResponse.json({
        success: true,
        slot: newSlot.slot,
        message: 'Slot criado com sucesso',
      })
    } catch (error: any) {
      if (error.message.includes('já existe')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Já existe um slot para esta data e horário',
          },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Erro ao criar slot:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

// PUT - Atualizar slot (ativar/desativar) - DEPRECATED
// Use PATCH /api/schedule-slots/[id] instead
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isActive } = body

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'id e isActive (boolean) são obrigatórios',
        },
        { status: 400 }
      )
    }

    try {
      const updatedSlot = await updateScheduleSlot(id, { isActive })

      return NextResponse.json({
        success: true,
        slot: updatedSlot,
        message: `Slot ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      })
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Slot não encontrado',
          },
          { status: 404 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Erro ao atualizar slot:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

// DELETE - Remover slot - DEPRECATED
// Use DELETE /api/schedule-slots/[id] instead
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID do slot é obrigatório',
        },
        { status: 400 }
      )
    }

    try {
      const removedSlot = await deleteScheduleSlot(id)

      return NextResponse.json({
        success: true,
        slot: removedSlot,
        message: 'Slot removido com sucesso',
      })
    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Slot não encontrado',
          },
          { status: 404 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Erro ao remover slot:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}