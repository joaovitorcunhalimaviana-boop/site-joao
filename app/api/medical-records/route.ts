import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface CalculatorResult {
  calculatorName: string
  result: any
  timestamp: string
}

interface MedicalAttachment {
  id: string
  fileName: string
  originalName: string
  fileType: string
  fileSize: number
  category: 'exame' | 'foto' | 'documento' | 'outro'
  description: string
  uploadedAt: string
  filePath: string
}

interface MedicalRecord {
  id: string
  patientId: string
  date: string
  time: string
  anamnesis: string
  examination: string
  diagnosis: string
  treatment: string
  prescription: string
  observations: string
  doctorName: string
  calculatorResults?: CalculatorResult[]
  attachments?: MedicalAttachment[]
  diagnosticHypotheses?: string[]
  createdAt: string
}

const DATA_FILE = path.join(process.cwd(), 'data', 'medical-records.json')

// Função para garantir que o diretório existe
function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Função para ler os prontuários
function readMedicalRecords(): MedicalRecord[] {
  ensureDataDirectory()
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Erro ao ler prontuários:', error)
    return []
  }
}

// Função para salvar os prontuários
function saveMedicalRecords(records: MedicalRecord[]) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2))
  } catch (error) {
    console.error('Erro ao salvar prontuários:', error)
    throw error
  }
}

// GET - Buscar prontuários por paciente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const recordId = searchParams.get('id')

    const records = readMedicalRecords()

    if (recordId) {
      const record = records.find(r => r.id === recordId)
      if (!record) {
        return NextResponse.json({ error: 'Prontuário não encontrado' }, { status: 404 })
      }
      return NextResponse.json(record)
    }

    if (patientId) {
      const patientRecords = records.filter(r => r.patientId === patientId)
      // Ordenar por data mais recente primeiro
      patientRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return NextResponse.json(patientRecords)
    }

    // Retornar todos os prontuários se não houver filtro
    return NextResponse.json(records)
  } catch (error) {
    console.error('Erro ao buscar prontuários:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo prontuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      patientId,
      date,
      time,
      anamnesis,
      examination,
      diagnosis,
      treatment,
      prescription,
      observations,
      doctorName,
      calculatorResults,
      attachments,
      diagnosticHypotheses
    } = body

    // Validação dos campos obrigatórios
    if (!patientId || !anamnesis) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: patientId, anamnesis' },
        { status: 400 }
      )
    }

    const records = readMedicalRecords()
    
    const newRecord: MedicalRecord = {
      id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      date: date || new Date().toISOString().split('T')[0],
      time: time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      anamnesis,
      examination: examination || '',
      diagnosis: diagnosis || '',
      treatment: treatment || '',
      prescription: prescription || '',
      observations: observations || '',
      doctorName: doctorName || 'Dr. João Vitor Viana',
      calculatorResults: calculatorResults || [],
      attachments: attachments || [],
      diagnosticHypotheses: diagnosticHypotheses || [],
      createdAt: new Date().toISOString()
    }

    records.push(newRecord)
    saveMedicalRecords(records)

    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar prontuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar prontuário existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do prontuário é obrigatório' }, { status: 400 })
    }

    const records = readMedicalRecords()
    const recordIndex = records.findIndex(r => r.id === id)

    if (recordIndex === -1) {
      return NextResponse.json({ error: 'Prontuário não encontrado' }, { status: 404 })
    }

    // Atualizar o prontuário
    records[recordIndex] = {
      ...records[recordIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    saveMedicalRecords(records)

    return NextResponse.json(records[recordIndex])
  } catch (error) {
    console.error('Erro ao atualizar prontuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir prontuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do prontuário é obrigatório' }, { status: 400 })
    }

    const records = readMedicalRecords()
    const recordIndex = records.findIndex(r => r.id === id)

    if (recordIndex === -1) {
      return NextResponse.json({ error: 'Prontuário não encontrado' }, { status: 404 })
    }

    // Remover o prontuário
    records.splice(recordIndex, 1)
    saveMedicalRecords(records)

    return NextResponse.json({ message: 'Prontuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir prontuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}