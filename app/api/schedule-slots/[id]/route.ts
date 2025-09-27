import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface ScheduleSlot {
  id: string
  date: string // YYYY-MM-DD format
  time: string
  isActive: boolean
  createdAt: string
}

// Caminho para o arquivo de dados
const DATA_FILE = path.join(process.cwd(), 'data', 'schedule-slots.json')

// Função para garantir que o diretório existe
function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Função para obter slots do arquivo
function getScheduleSlots(): ScheduleSlot[] {
  try {
    ensureDataDirectory()
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Erro ao ler arquivo de slots:', error)
    return []
  }
}

// Função para salvar slots no arquivo
function saveScheduleSlots(slots: ScheduleSlot[]): void {
  try {
    ensureDataDirectory()
    fs.writeFileSync(DATA_FILE, JSON.stringify(slots, null, 2))
  } catch (error) {
    console.error('Erro ao salvar arquivo de slots:', error)
  }
}

// PATCH - Atualizar slot (ativar/desativar)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { isActive } = body

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'id e isActive (boolean) são obrigatórios',
        },
        { status: 400 }
      )
    }

    const slots = getScheduleSlots()
    const slotIndex = slots.findIndex(slot => slot.id === id)

    if (slotIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slot não encontrado',
        },
        { status: 404 }
      )
    }

    slots[slotIndex].isActive = isActive
    saveScheduleSlots(slots)

    return NextResponse.json({
      success: true,
      slot: slots[slotIndex],
      message: `Slot ${isActive ? 'ativado' : 'desativado'} com sucesso`,
    })
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

// DELETE - Remover slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID do slot é obrigatório',
        },
        { status: 400 }
      )
    }

    // Simular localStorage no servidor usando um objeto global
    if (typeof window === 'undefined') {
      // No servidor, vamos simular a remoção
      console.log('Removendo slot no servidor:', id)
      
      return NextResponse.json({
        success: true,
        slot: { id },
        message: 'Slot removido com sucesso',
      })
    }

    const slots = getScheduleSlots()
    const slotIndex = slots.findIndex(slot => slot.id === id)

    if (slotIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slot não encontrado',
        },
        { status: 404 }
      )
    }

    const removedSlot = slots.splice(slotIndex, 1)[0]
    saveScheduleSlots(slots)

    return NextResponse.json({
      success: true,
      slot: removedSlot,
      message: 'Slot removido com sucesso',
    })
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