import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limiter'

interface Patient {
  id: string
  name: string
  phone: string
  whatsapp: string
  birthDate: string
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
  }
  consultation?: {
    id: string
    patientId: string
    date: string
    time: string
    type: string
    status: string
    notes: string
    createdAt: string
    updatedAt: string
  }
}

// Dados de exemplo (usar o mesmo array da API principal)
// Função para buscar pacientes da API principal
async function getMainPatients(): Promise<Patient[]> {
  try {
    const response = await fetch('http://localhost:3000/api/patients')
    if (response.ok) {
      const data = await response.json()
      return data.patients || []
    }
  } catch (error) {
    console.error('Erro ao buscar pacientes da API principal:', error)
  }
  return []
}

// Dados locais como fallback
const patients: Patient[] = [
  {
    id: 'patient_2',
    name: 'João Santos',
    phone: '(11) 88888-2222',
    whatsapp: '(11) 88888-2222',
    birthDate: '1978-07-22',
    insurance: {
      type: 'particular',
    },
  },
  {
    id: 'patient_3',
    name: 'Ana Costa',
    phone: '(11) 77777-3333',
    whatsapp: '(11) 77777-3333',
    birthDate: '1990-12-08',
    insurance: {
      type: 'unimed',
      plan: 'Unimed Premium',
    },
  },
  {
    id: 'patient_5',
    name: 'Carla Oliveira',
    phone: '(11) 55555-5555',
    whatsapp: '(11) 55555-5555',
    birthDate: '1982-09-30',
    insurance: {
      type: 'unimed',
      plan: 'Unimed Executivo',
    },
  },
]

// Função para verificar autenticação
function verifyAuth(): boolean {
  // Temporariamente permitir acesso sem autenticação para debug
  return true
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.PATIENTS,
    async () => {
      try {
        if (!verifyAuth()) {
          return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id } = await params

        // Primeiro tenta buscar da API principal
        const mainPatients = await getMainPatients()
        let patient = mainPatients.find(p => p.id === id)

        // Se não encontrar, usa dados locais como fallback
        if (!patient) {
          patient = patients.find(p => p.id === id)
        }

        if (!patient) {
          return NextResponse.json(
            { error: 'Paciente não encontrado' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          patient,
        })
      } catch (error) {
        console.error('Erro ao buscar paciente:', error)
        return NextResponse.json(
          { error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'PATIENT_VIEW',
      resourceName: 'Patient Details API',
    }
  )
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAuth()) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const patientIndex = patients.findIndex(p => p.id === id)
    if (patientIndex === -1) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar dados do paciente
    patients[patientIndex] = {
      ...patients[patientIndex],
      ...body,
      id, // Manter o ID original
    }

    return NextResponse.json({
      message: 'Paciente atualizado com sucesso',
      patient: patients[patientIndex],
    })
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyAuth()) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const patientIndex = patients.findIndex(p => p.id === id)

    if (patientIndex === -1) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    const deletedPatient = patients.splice(patientIndex, 1)[0]

    return NextResponse.json({
      message: 'Paciente removido com sucesso',
      patient: deletedPatient,
    })
  } catch (error) {
    console.error('Erro ao remover paciente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
