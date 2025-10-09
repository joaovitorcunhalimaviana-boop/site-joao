import { NextRequest, NextResponse } from 'next/server'
import {
  getAllPatients,
  getPatientById,
  createOrUpdatePatient,
  UnifiedPatient,
} from '@/lib/prisma-service'
import { AuthMiddleware } from '@/lib/auth-middleware'

// GET - Listar todos os pacientes médicos ou buscar por ID/CPF
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Autenticar requisição
  const auth = await AuthMiddleware.authenticate(request)
  if (!auth.success || !auth.user) {
    return auth.response || NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verificar permissões (apenas médicos, secretárias e admins)
  if (!['DOCTOR', 'SECRETARY', 'ADMIN'].includes(auth.user.role)) {
    return NextResponse.json({ error: 'Sem permissão para acessar pacientes médicos' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const cpf = searchParams.get('cpf')
    const active = searchParams.get('active')
    const insurance = searchParams.get('insurance')

    if (id) {
      // Buscar por ID
      const patient = await getPatientById(id)

      if (!patient) {
        return NextResponse.json(
          {
            success: false,
            message: 'Paciente não encontrado',
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          patient,
          message: 'Paciente encontrado com sucesso',
        },
        { status: 200 }
      )
    }

    if (cpf) {
      // Buscar por CPF
      const allPatients = await getAllPatients()
      const patient = allPatients.find(p => p.cpf === cpf)

      if (!patient) {
        return NextResponse.json(
          {
            success: false,
            message: 'Paciente não encontrado',
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          patient,
          message: 'Paciente encontrado com sucesso',
        },
        { status: 200 }
      )
    }

    // Listar todos os pacientes com filtros opcionais
    let patients = await getAllPatients()

    // Filtrar por status ativo
    if (active !== null) {
      const isActive = active === 'true'
      patients = patients.filter(patient => patient.isActive === isActive)
    }

    // Filtrar por tipo de plano
    if (insurance) {
      patients = patients.filter(
        patient => patient.insurance?.type === insurance
      )
    }

    // Estatísticas
    const stats = {
      total: patients.length,
      active: patients.filter(p => p.isActive).length,
      inactive: patients.filter(p => !p.isActive).length,
      insurance: {
        unimed: patients.filter(p => p.insurance?.type === 'unimed').length,
        particular: patients.filter(p => p.insurance?.type === 'particular')
          .length,
        outro: patients.filter(p => p.insurance?.type === 'outro').length,
      },
    }

    return NextResponse.json(
      {
        success: true,
        patients,
        stats,
        message: `${patients.length} pacientes encontrados`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ [API] Error fetching medical patients:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// POST - Criar novo paciente médico
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Autenticar requisição
  const auth = await AuthMiddleware.authenticate(request)
  if (!auth.success || !auth.user) {
    return auth.response || NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verificar permissões (apenas médicos e admins podem criar pacientes médicos)
  if (!['DOCTOR', 'ADMIN'].includes(auth.user.role)) {
    return NextResponse.json({ error: 'Sem permissão para criar pacientes médicos' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Validações básicas
    if (!body.cpf || typeof body.cpf !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'CPF é obrigatório',
        },
        { status: 400 }
      )
    }

    if (!body.fullName || typeof body.fullName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Nome completo é obrigatório',
        },
        { status: 400 }
      )
    }

    // Validar formato do CPF (básico)
    const cpfClean = body.cpf.replace(/\D/g, '')
    if (cpfClean.length !== 11) {
      return NextResponse.json(
        {
          success: false,
          message: 'CPF deve ter 11 dígitos',
        },
        { status: 400 }
      )
    }

    // Verificar se CPF já existe
    const allPatients = await getAllPatients()
    const existingPatient = allPatients.find(p => p.cpf === cpfClean)
    if (existingPatient) {
      return NextResponse.json(
        {
          success: false,
          message: 'Já existe um paciente com este CPF',
        },
        { status: 409 }
      )
    }

    // Criar novo paciente usando Prisma service
    const patientData: Partial<UnifiedPatient> = {
      cpf: cpfClean,
      fullName: body.fullName.trim(),
      rg: body.rg?.trim(),
      endereco: body.address?.trim(),
      cidade: body.city?.trim(),
      estado: body.state?.trim(),
      cep: body.zipCode?.replace(/\D/g, ''),
      telefone: body.phone?.trim(),
      email: body.email?.trim(),
      insurance: {
        type: body.insurance?.type || 'particular',
        plan: body.insurance?.plan?.trim(),
        cardNumber: body.insurance?.cardNumber?.trim(),
        validUntil: body.insurance?.validUntil,
      },
      medicalInfo: {
        allergies: Array.isArray(body.medicalInfo?.allergies)
          ? body.medicalInfo.allergies
          : [],
        medications: Array.isArray(body.medicalInfo?.medications)
          ? body.medicalInfo.medications
          : [],
        conditions: Array.isArray(body.medicalInfo?.conditions)
          ? body.medicalInfo.conditions
          : [],
        emergencyContact: body.medicalInfo?.emergencyContact?.trim(),
        emergencyPhone: body.medicalInfo?.emergencyPhone?.trim(),
        bloodType: body.medicalInfo?.bloodType?.trim(),
        notes: body.medicalInfo?.notes?.trim(),
      },
      consents: {
        dataProcessing: body.consents?.dataProcessing ?? false,
        dataProcessingDate: body.consents?.dataProcessing
          ? new Date().toISOString()
          : undefined,
        medicalTreatment: body.consents?.medicalTreatment ?? false,
        medicalTreatmentDate: body.consents?.medicalTreatment
          ? new Date().toISOString()
          : undefined,
        imageUse: body.consents?.imageUse ?? false,
        imageUseDate: body.consents?.imageUse
          ? new Date().toISOString()
          : undefined,
      },
      isActive: true,
    }

    const newPatient = await createOrUpdatePatient(patientData)

    return NextResponse.json(
      {
        success: true,
        patient: newPatient,
        message: 'Paciente criado com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ [API] Error creating medical patient:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// PUT - Atualizar paciente médico
export async function PUT(request: NextRequest): Promise<NextResponse> {
  // Autenticar requisição
  const auth = await AuthMiddleware.authenticate(request)
  if (!auth.success || !auth.user) {
    return auth.response || NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verificar permissões (apenas médicos e admins podem atualizar pacientes médicos)
  if (!['DOCTOR', 'ADMIN'].includes(auth.user.role)) {
    return NextResponse.json({ error: 'Sem permissão para atualizar pacientes médicos' }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (!body.id && !body.cpf) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID ou CPF é obrigatório para atualização',
        },
        { status: 400 }
      )
    }

    // Buscar paciente existente
    let patient: UnifiedPatient | null = null

    if (body.id) {
      patient = await getPatientById(body.id)
    } else if (body.cpf) {
      const cpfClean = body.cpf.replace(/\D/g, '')
      const allPatients = await getAllPatients()
      patient = allPatients.find(p => p.cpf === cpfClean) || null
    }

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: 'Paciente não encontrado',
        },
        { status: 404 }
      )
    }

    // Atualizar apenas os campos fornecidos
    const updatedPatientData: Partial<UnifiedPatient> = {
      ...patient,
      fullName: body.fullName?.trim() || patient.fullName,
      rg: body.rg?.trim() || patient.rg,
      endereco: body.address?.trim() || patient.endereco,
      cidade: body.city?.trim() || patient.cidade,
      estado: body.state?.trim() || patient.estado,
      cep: body.zipCode?.replace(/\D/g, '') || patient.cep,
      telefone: body.phone?.trim() || patient.telefone,
      email: body.email?.trim() || patient.email,
      insurance: {
        ...patient.insurance,
        ...body.insurance,
      },
      medicalInfo: {
        ...patient.medicalInfo,
        ...body.medicalInfo,
      },
      consents: {
        ...patient.consents,
        ...body.consents,
      },
      isActive: body.isActive !== undefined ? body.isActive : patient.isActive,
    }

    const updatedPatient = await createOrUpdatePatient(updatedPatientData)

    return NextResponse.json(
      {
        success: true,
        patient: updatedPatient,
        message: 'Paciente atualizado com sucesso',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ [API] Error updating medical patient:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}