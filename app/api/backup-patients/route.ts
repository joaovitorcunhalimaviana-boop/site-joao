import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const PATIENTS_FILE = path.join(process.cwd(), 'data', 'patients.json')

export async function POST(request: NextRequest) {
  console.warn('⚠️ DEPRECATED: /api/backup-patients está obsoleta. Use /api/unified-system/medical-patients')

  try {
    const { patients } = await request.json()

    if (!Array.isArray(patients)) {
      return NextResponse.json(
        { error: 'Dados de pacientes inválidos' },
        { status: 400 }
      )
    }

    // Garantir que o diretório data existe
    const dataDir = path.dirname(PATIENTS_FILE)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Salvar os dados dos pacientes
    await fs.writeFile(
      PATIENTS_FILE,
      JSON.stringify(patients, null, 2),
      'utf-8'
    )

    console.log(
      `✅ Backup de ${patients.length} pacientes salvo em ${PATIENTS_FILE}`
    )

    return NextResponse.json({
      success: true,
      message: `Backup de ${patients.length} pacientes salvo com sucesso`,
      deprecated: true,
      warning: 'Esta API está obsoleta. Use /api/unified-system/medical-patients'
    })
  } catch (error) {
    console.error('❌ Erro ao salvar backup de pacientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  console.warn('⚠️ DEPRECATED: /api/backup-patients está obsoleta. Use /api/unified-system/medical-patients')

  try {
    // Tentar ler o arquivo de backup
    const data = await fs.readFile(PATIENTS_FILE, 'utf-8')
    const patients = JSON.parse(data)

    return NextResponse.json({
      success: true,
      patients,
      count: patients.length,
      deprecated: true,
      warning: 'Esta API está obsoleta. Use /api/unified-system/medical-patients'
    })
  } catch (error) {
    // Se o arquivo não existir, retornar array vazio
    console.log('📁 Arquivo de backup não encontrado, retornando array vazio')
    console.warn('⚠️ DEPRECATED: Use /api/unified-system/medical-patients para obter dados do Prisma')
    return NextResponse.json({
      success: true,
      patients: [],
      count: 0,
      deprecated: true,
      warning: 'Esta API está obsoleta. Use /api/unified-system/medical-patients'
    })
  }
}
