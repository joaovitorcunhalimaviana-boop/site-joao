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

// GET - Obter todos os slots
export async function GET(request: NextRequest) {
  try {
    const slots = getScheduleSlots()
    
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

    const slots = getScheduleSlots()

    // Verificar se já existe um slot para esta data e horário
    const existingSlot = slots.find(
      slot => slot.date === date && slot.time === time
    )

    if (existingSlot) {
      return NextResponse.json(
        {
          success: false,
          error: 'Já existe um slot para esta data e horário',
        },
        { status: 400 }
      )
    }

    const newSlot: ScheduleSlot = {
      id: `slot-${date}-${time.replace(':', '')}-${Date.now()}`,
      date,
      time,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    slots.push(newSlot)
    saveScheduleSlots(slots)

    return NextResponse.json({
      success: true,
      slot: newSlot,
      slots: slots, // Retornar todos os slots atualizados
      message: 'Slot criado com sucesso',
    })
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