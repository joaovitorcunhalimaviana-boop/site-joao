import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Caminho para o arquivo JSON
const SURGERIES_FILE = path.join(process.cwd(), 'data', 'surgeries.json')

// Função para garantir que o diretório existe
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Função para ler cirurgias do arquivo
async function readSurgeries() {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(SURGERIES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // Se o arquivo não existe, retorna array vazio
    return []
  }
}

// Função para salvar cirurgias no arquivo
async function saveSurgeries(surgeries: any[]) {
  await ensureDataDirectory()
  await fs.writeFile(SURGERIES_FILE, JSON.stringify(surgeries, null, 2))
}

export async function GET() {
  try {
    console.log('=== GET SURGERIES ===')
    const surgeries = await readSurgeries()
    console.log('Cirurgias encontradas:', surgeries.length)
    
    return NextResponse.json(surgeries)
  } catch (error) {
    console.error('Erro ao buscar cirurgias:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST SURGERY ===')
    const body = await request.json()
    console.log('Dados recebidos:', body)
    console.log('Tipo dos dados:', typeof body)
    console.log('Keys:', Object.keys(body))

    // Validação básica
    if (!body.patientName || !body.surgeryType || !body.hospital || !body.surgeryDate || !body.surgeryTime) {
      console.log('Campos obrigatórios faltando')
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Ler cirurgias existentes
    const surgeries = await readSurgeries()

    // Criar nova cirurgia
    const newSurgery = {
      id: Date.now().toString(), // ID simples baseado em timestamp
      patientName: body.patientName,
      surgeryType: body.surgeryType,
      hospital: body.hospital,
      surgeryDate: body.surgeryDate,
      surgeryTime: body.surgeryTime,
      paymentType: body.paymentType || 'PARTICULAR',
      insurancePlan: body.insurancePlan || '',
      notes: body.notes || '',
      totalAmount: body.totalAmount || 0,
      hospitalAmount: body.hospitalAmount || 0,
      anesthesiologistAmount: body.anesthesiologistAmount || 0,
      instrumentalistAmount: body.instrumentalistAmount || 0,
      assistantAmount: body.assistantAmount || 0,
      surgeonAmount: body.surgeonAmount || 0,
      procedures: body.procedures || [],
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('Nova cirurgia criada:', newSurgery)

    // Adicionar à lista
    surgeries.push(newSurgery)

    // Salvar no arquivo
    await saveSurgeries(surgeries)

    console.log('Cirurgia salva com sucesso!')
    return NextResponse.json(newSurgery, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar cirurgia:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== PUT SURGERY ===')
    const body = await request.json()
    console.log('Dados recebidos para atualização:', body)

    if (!body.id) {
      return NextResponse.json({ error: 'ID da cirurgia é obrigatório' }, { status: 400 })
    }

    // Ler cirurgias existentes
    const surgeries = await readSurgeries()

    // Encontrar a cirurgia para atualizar
    const surgeryIndex = surgeries.findIndex((s: any) => s.id === body.id)
    
    if (surgeryIndex === -1) {
      return NextResponse.json({ error: 'Cirurgia não encontrada' }, { status: 404 })
    }

    // Atualizar a cirurgia
    const updatedSurgery = {
      ...surgeries[surgeryIndex],
      patientName: body.patientName,
      surgeryType: body.surgeryType,
      hospital: body.hospital,
      surgeryDate: body.surgeryDate,
      surgeryTime: body.surgeryTime,
      paymentType: body.paymentType || 'PARTICULAR',
      insurancePlan: body.insurancePlan || '',
      notes: body.notes || '',
      totalAmount: body.totalAmount || 0,
      hospitalAmount: body.hospitalAmount || 0,
      anesthesiologistAmount: body.anesthesiologistAmount || 0,
      instrumentalistAmount: body.instrumentalistAmount || 0,
      assistantAmount: body.assistantAmount || 0,
      surgeonAmount: body.surgeonAmount || 0,
      procedures: body.procedures || [],
      updatedAt: new Date().toISOString()
    }

    surgeries[surgeryIndex] = updatedSurgery

    // Salvar no arquivo
    await saveSurgeries(surgeries)

    console.log('Cirurgia atualizada com sucesso!')
    return NextResponse.json(updatedSurgery)

  } catch (error) {
    console.error('Erro ao atualizar cirurgia:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID da cirurgia é obrigatório' }, { status: 400 })
    }

    // Ler cirurgias existentes
    const surgeries = await readSurgeries()

    // Filtrar removendo a cirurgia
    const filteredSurgeries = surgeries.filter((s: any) => s.id !== id)

    if (filteredSurgeries.length === surgeries.length) {
      return NextResponse.json({ error: 'Cirurgia não encontrada' }, { status: 404 })
    }

    // Salvar no arquivo
    await saveSurgeries(filteredSurgeries)

    return NextResponse.json({ message: 'Cirurgia deletada com sucesso' })

  } catch (error) {
    console.error('Erro ao deletar cirurgia:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
