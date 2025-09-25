import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getTodayISO, getTimestampISO } from '@/lib/date-utils'

interface AgendaItem {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  type: 'appointment' | 'manual' // appointment = agendado pelo sistema, manual = adicionado pela secretária
  notes?: string
  createdAt: string
  updatedAt?: string
}

const DATA_FILE = path.join(process.cwd(), 'data', 'agenda.json')

// Função para garantir que o diretório existe
function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Função para ler a agenda
function readAgenda(): AgendaItem[] {
  ensureDataDirectory()
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Erro ao ler agenda:', error)
    return []
  }
}

// Função para salvar a agenda
function saveAgenda(agenda: AgendaItem[]) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(agenda, null, 2))
  } catch (error) {
    console.error('Erro ao salvar agenda:', error)
    throw error
  }
}

// Função para ler pacientes
function readPatients() {
  const patientsFile = path.join(process.cwd(), 'data', 'patients.json')
  try {
    if (fs.existsSync(patientsFile)) {
      const data = fs.readFileSync(patientsFile, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Erro ao ler pacientes:', error)
    return []
  }
}

// GET - Buscar agenda por data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || getTodayISO()
    const status = searchParams.get('status')

    const agenda = readAgenda()
    let filteredAgenda = agenda.filter(item => item.date === date)

    if (status) {
      filteredAgenda = filteredAgenda.filter(item => item.status === status)
    }

    // Ordenar por horário
    filteredAgenda.sort((a, b) => a.time.localeCompare(b.time))

    return NextResponse.json(filteredAgenda)
  } catch (error) {
    console.error('Erro ao buscar agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Adicionar paciente à agenda
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, date, time, type = 'manual', notes } = body

    // Validação dos campos obrigatórios
    if (!patientId || !date) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: patientId, date' },
        { status: 400 }
      )
    }

    // Buscar informações do paciente
    const patients = readPatients()
    const patient = patients.find((p: any) => p.id === patientId)

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    const agenda = readAgenda()

    // Verificar se já existe um agendamento para este paciente na mesma data
    const existingAppointment = agenda.find(
      item => item.patientId === patientId && item.date === date
    )

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Paciente já possui agendamento para esta data' },
        { status: 400 }
      )
    }

    const newAgendaItem: AgendaItem = {
      id: Date.now().toString(),
      patientId,
      patientName: patient.name,
      date,
      time: time || '08:00',
      status: 'pending',
      type,
      notes: notes || '',
      createdAt: getTimestampISO(),
    }

    agenda.push(newAgendaItem)
    saveAgenda(agenda)

    return NextResponse.json(newAgendaItem, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar à agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar status da agenda
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, time, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      )
    }

    const agenda = readAgenda()
    const itemIndex = agenda.findIndex(item => item.id === id)

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar o item da agenda
    const item = agenda[itemIndex]
    if (item) {
      if (status) item.status = status
      if (time) item.time = time
      if (notes !== undefined) item.notes = notes
      item.updatedAt = getTimestampISO()
    }

    saveAgenda(agenda)

    return NextResponse.json(agenda[itemIndex])
  } catch (error) {
    console.error('Erro ao atualizar agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover da agenda
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      )
    }

    const agenda = readAgenda()
    const itemIndex = agenda.findIndex(item => item.id === id)

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Remover o item da agenda
    agenda.splice(itemIndex, 1)
    saveAgenda(agenda)

    return NextResponse.json({ message: 'Agendamento removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover da agenda:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
