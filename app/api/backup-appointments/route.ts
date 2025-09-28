import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const APPOINTMENTS_FILE = path.join(process.cwd(), 'data', 'unified-appointments.json')

export async function POST(request: NextRequest) {
  try {
    const { appointments } = await request.json()

    if (!Array.isArray(appointments)) {
      return NextResponse.json(
        { error: 'Dados de agendamentos inválidos' },
        { status: 400 }
      )
    }

    // Garantir que o diretório data existe
    const dataDir = path.dirname(APPOINTMENTS_FILE)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Salvar os dados dos agendamentos
    await fs.writeFile(
      APPOINTMENTS_FILE,
      JSON.stringify(appointments, null, 2),
      'utf-8'
    )

    console.log(
      `✅ Backup de ${appointments.length} agendamentos salvo em ${APPOINTMENTS_FILE}`
    )

    return NextResponse.json({
      success: true,
      message: `Backup de ${appointments.length} agendamentos salvo com sucesso`,
    })
  } catch (error) {
    console.error('❌ Erro ao salvar backup de agendamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Tentar ler o arquivo de backup
    const data = await fs.readFile(APPOINTMENTS_FILE, 'utf-8')
    const appointments = JSON.parse(data)

    return NextResponse.json({
      success: true,
      appointments,
      count: appointments.length,
    })
  } catch (error) {
    // Se o arquivo não existir, retornar array vazio
    console.log('📁 Arquivo de backup de agendamentos não encontrado, retornando array vazio')
    return NextResponse.json({
      success: true,
      appointments: [],
      count: 0,
    })
  }
}