import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limiter'
import { prisma } from '@/lib/prisma'

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

// Função para buscar pacientes do PostgreSQL via Prisma
async function getMainPatients(): Promise<Patient[]> {
  try {
    const pacientes = await prisma.medicalPatient.findMany({
      orderBy: { fullName: 'asc' },
      include: {
        communicationContact: true,
        consultations: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Última consulta
        },
      },
    })

    return pacientes.map(paciente => ({
      id: paciente.id,
      name: paciente.fullName,
      phone: paciente.communicationContact.whatsapp || '',
      whatsapp: paciente.communicationContact.whatsapp || '',
      birthDate: paciente.communicationContact.birthDate || '',
      insurance: {
        type: (paciente.insuranceType.toLowerCase() as 'particular' | 'unimed' | 'outro') || 'particular',
        plan: paciente.insurancePlan || undefined,
      },
      consultation: paciente.consultations[0]
        ? {
            id: paciente.consultations[0].id,
            patientId: paciente.consultations[0].medicalPatientId || '',
            date: paciente.consultations[0].createdAt
              .toISOString()
              .split('T')[0],
            time: paciente.consultations[0].createdAt.toTimeString().slice(0, 5),
            type: 'CONSULTATION',
            status: paciente.consultations[0].status,
            notes: paciente.consultations[0].anamnese || '',
            createdAt: paciente.consultations[0].createdAt.toISOString(),
            updatedAt: paciente.consultations[0].updatedAt.toISOString(),
          }
        : undefined,
    }))
  } catch (error) {
    console.error('Erro ao buscar pacientes do PostgreSQL:', error)
    return []
  }
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

        const patient = await prisma.medicalPatient.findUnique({
          where: { id: id },
          include: {
            communicationContact: true,
            consultations: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        })

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
