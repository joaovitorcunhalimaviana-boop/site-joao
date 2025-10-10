import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limiter'
import { getAllPatients, createOrUpdatePatient } from '@/lib/prisma-service'
import { prisma } from '@/lib/prisma'

// GET /api/pacientes - Listar todos os pacientes
export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.APPOINTMENTS,
    async () => {
      try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const allPatients = await getAllPatients()
        
        // Filtrar por busca se fornecida
        let filteredPatients = allPatients
        if (search) {
          const searchLower = search.toLowerCase()
          filteredPatients = allPatients.filter(patient => 
            patient.name.toLowerCase().includes(searchLower) ||
            patient.cpf?.includes(search) ||
            patient.phone.includes(search) ||
            patient.email?.toLowerCase().includes(searchLower)
          )
        }

        // Paginação
        const total = filteredPatients.length
        const skip = (page - 1) * limit
        const pacientes = filteredPatients.slice(skip, skip + limit)

        return NextResponse.json({
          success: true,
          pacientes,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        })
      } catch (error) {
        console.error('❌ [API] Error fetching patients:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
        return NextResponse.json(
          { success: false, error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'PATIENTS_LIST_ACCESS',
      resourceName: 'Patients API',
    }
  )
}

// POST /api/pacientes - Criar novo paciente
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      nomeCompleto,
      dataNascimento,
      cpf,
      telefone,
      whatsapp,
      email,
      planoSaude,
    } = body

    if (!nomeCompleto || !dataNascimento) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nome completo e data de nascimento são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Validações básicas
    if (!nomeCompleto || !whatsapp) {
      return NextResponse.json(
        { success: false, error: 'Nome completo e WhatsApp são obrigatórios' },
        { status: 400 }
      )
    }

    const paciente = await createOrUpdatePatient({
      name: nomeCompleto,
      phone: telefone || whatsapp,
      whatsapp: whatsapp,
      email: email || undefined,
      birthDate: dataNascimento || undefined,
      cpf: cpf || undefined,
      insurance: planoSaude ? { type: 'particular', plan: planoSaude } : undefined
    })

    return NextResponse.json(
      {
        success: true,
        paciente,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ [API] Error creating patient:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/pacientes - Atualizar paciente
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...dadosAtualizacao } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do paciente é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se paciente médico existe
    const pacienteExistente = await prisma.medicalPatient.findFirst({
      where: { id },
    })

    if (!pacienteExistente) {
      return NextResponse.json(
        { success: false, error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Verificar CPF duplicado (se alterado)
    if (
      dadosAtualizacao.cpf &&
      dadosAtualizacao.cpf !== pacienteExistente.cpf
    ) {
      const cpfExistente = await prisma.medicalPatient.findFirst({
        where: {
          cpf: dadosAtualizacao.cpf,
          NOT: { id },
        },
      })

      if (cpfExistente) {
        return NextResponse.json(
          { success: false, error: 'CPF já cadastrado para outro paciente' },
          { status: 409 }
        )
      }
    }

    const pacienteAtualizado = await prisma.medicalPatient.update({
      where: { id },
      data: {
        ...dadosAtualizacao,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      paciente: pacienteAtualizado,
    })
  } catch (error) {
    console.error('❌ [API] Error updating patient:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/pacientes - Soft delete de paciente
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do paciente é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se paciente médico existe
    const pacienteExistente = await prisma.medicalPatient.findFirst({
      where: {
        id,
      },
    })

    if (!pacienteExistente) {
      return NextResponse.json(
        { success: false, error: 'Paciente não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - marcar como inativo
    await prisma.medicalPatient.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Paciente removido com sucesso',
    })
  } catch (error) {
    console.error('❌ [API] Error deleting patient:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}