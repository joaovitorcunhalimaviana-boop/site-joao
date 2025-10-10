import { NextRequest, NextResponse } from 'next/server'
import {
  getMedicalRecordsByPatientId,
  createMedicalRecord,
  type MedicalRecord,
} from '@/lib/unified-patient-system-prisma'

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
    const patientRecords = await getMedicalRecordsByPatientId(patientId)

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
