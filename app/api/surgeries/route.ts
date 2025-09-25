import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const SURGERIES_FILE = path.join(DATA_DIR, 'surgeries.json')

interface Surgery {
  id: string
  patientName: string
  surgeryType: string
  date: string
  time: string
  hospital: string
  paymentType: 'particular' | 'plano'
  // Campos para particulares
  totalValue?: number
  hospitalValue?: number
  anesthesiologistValue?: number
  instrumentalistValue?: number
  auxiliaryValue?: number
  doctorValue?: number
  doctorAmount?: number
  totalAmount?: number
  hospitalAmount?: number
  assistantAmount?: number
  expectedAmount?: number
  // Campos para planos
  procedureCodes?: string
  insurancePlan?: string
  status: 'agendada' | 'confirmada' | 'concluida' | 'cancelada'
  notes?: string
  createdAt?: string
  updatedAt?: string
}

// Garantir que o diretório existe
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Carregar cirurgias do arquivo
function loadSurgeries(): Surgery[] {
  ensureDataDirectory()

  if (!fs.existsSync(SURGERIES_FILE)) {
    return []
  }

  try {
    const data = fs.readFileSync(SURGERIES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erro ao carregar cirurgias:', error)
    return []
  }
}

// Salvar cirurgias no arquivo
function saveSurgeries(surgeries: Surgery[]) {
  ensureDataDirectory()

  try {
    fs.writeFileSync(SURGERIES_FILE, JSON.stringify(surgeries, null, 2))
  } catch (error) {
    console.error('Erro ao salvar cirurgias:', error)
    throw error
  }
}

// Gerar ID único
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// GET - Listar cirurgias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const paymentType = searchParams.get('paymentType')

    let surgeries = loadSurgeries()

    // Filtros
    if (date) {
      surgeries = surgeries.filter(surgery => surgery.date === date)
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
      !body.paymentType
    ) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    const surgeries = loadSurgeries()

    const newSurgery: Surgery = {
      id: generateId(),
      patientName: body.patientName,
      surgeryType: body.surgeryType,
      date: body.date,
      time: body.time,
      hospital: body.hospital || '',
      paymentType: body.paymentType,
      status: body.status || 'agendada',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Campos específicos para cirurgia particular
    if (body.paymentType === 'particular') {
      newSurgery.totalAmount = body.totalAmount || 0
      newSurgery.hospitalAmount = body.hospitalAmount || 0
      newSurgery.assistantAmount = body.assistantAmount || 0
      newSurgery.doctorAmount = body.doctorAmount || 0
    }

    // Campos específicos para plano de saúde
    if (body.paymentType === 'plano') {
      newSurgery.insurancePlan = body.insurancePlan || ''
      newSurgery.procedureCodes = body.procedureCodes || []
      newSurgery.expectedAmount = body.expectedAmount || 0
    }

    surgeries.push(newSurgery)
    saveSurgeries(surgeries)

    return NextResponse.json(
      {
        success: true,
        surgery: newSurgery,
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

    const surgeries = loadSurgeries()
    const surgeryIndex = surgeries.findIndex(s => s.id === body.id)

    if (surgeryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Cirurgia não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar cirurgia mantendo dados existentes
    const updatedSurgery: Surgery = {
      ...surgeries[surgeryIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    surgeries[surgeryIndex] = updatedSurgery
    saveSurgeries(surgeries)

    return NextResponse.json({
      success: true,
      surgery: updatedSurgery,
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

// DELETE - Excluir cirurgia
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

    const surgeries = loadSurgeries()
    const surgeryIndex = surgeries.findIndex(s => s.id === id)

    if (surgeryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Cirurgia não encontrada' },
        { status: 404 }
      )
    }

    const deletedSurgery = surgeries.splice(surgeryIndex, 1)[0]
    saveSurgeries(surgeries)

    return NextResponse.json({
      success: true,
      surgery: deletedSurgery,
      message: 'Cirurgia excluída com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir cirurgia:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
