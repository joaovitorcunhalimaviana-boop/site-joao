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
  // Campos para planos
  procedureCodes?: string
  insurancePlan?: string
  status: 'agendada' | 'realizada' | 'cancelada'
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

// GET - Buscar cirurgia específica por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const surgeries = loadSurgeries()
    const surgery = surgeries.find(s => s.id === id)

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
    const surgeries = loadSurgeries()
    const surgeryIndex = surgeries.findIndex(s => s.id === id)

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
      id: id, // Garantir que o ID não seja alterado
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

// DELETE - Excluir cirurgia específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
