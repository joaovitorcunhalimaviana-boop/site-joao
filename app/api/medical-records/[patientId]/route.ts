import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

// Função para verificar autenticação
function verifyAuth(): boolean {
  // Temporariamente permitir acesso sem autenticação para debug
  return true
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    if (!verifyAuth()) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { patientId } = await params
    const records = readMedicalRecords()

    const patientRecords = records.filter(
      record => record.patientId === patientId
    )

    // Ordenar por data/hora mais recente
    patientRecords.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({
      records: patientRecords,
      total: patientRecords.length,
    })
  } catch (error) {
    console.error('Erro ao buscar prontuários do paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
