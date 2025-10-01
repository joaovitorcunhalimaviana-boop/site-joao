import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllMedicalPatients,
  getMedicalPatientById,
  getMedicalPatientByCpf,
  createMedicalPatient,
  getCommunicationContactById,
  getNextMedicalRecordNumber,
  MedicalPatient
} from '@/lib/unified-patient-system'

// GET - Listar todos os pacientes médicos ou buscar por ID/CPF
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const cpf = searchParams.get('cpf')
    const active = searchParams.get('active')
    const insurance = searchParams.get('insurance')
    
    if (id) {
      // Buscar por ID
      const patient = getMedicalPatientById(id)
      
      if (!patient) {
        return NextResponse.json({
          success: false,
          message: 'Paciente não encontrado'
        }, { status: 404 })
      }
      
      // Incluir dados do contato de comunicação
      const communicationContact = getCommunicationContactById(patient.communicationContactId)
      
      return NextResponse.json({
        success: true,
        patient: {
          ...patient,
          communicationContact
        },
        message: 'Paciente encontrado com sucesso'
      }, { status: 200 })
    }
    
    if (cpf) {
      // Buscar por CPF
      const patient = getMedicalPatientByCpf(cpf)
      
      if (!patient) {
        return NextResponse.json({
          success: false,
          message: 'Paciente não encontrado'
        }, { status: 404 })
      }
      
      // Incluir dados do contato de comunicação
      const communicationContact = getCommunicationContactById(patient.communicationContactId)
      
      return NextResponse.json({
        success: true,
        patient: {
          ...patient,
          communicationContact
        },
        message: 'Paciente encontrado com sucesso'
      }, { status: 200 })
    }
    
    // Listar todos os pacientes com filtros opcionais
    let patients = getAllMedicalPatients()
    
    // Filtrar por status ativo
    if (active !== null) {
      const isActive = active === 'true'
      patients = patients.filter(patient => patient.isActive === isActive)
    }
    
    // Filtrar por tipo de plano
    if (insurance) {
      patients = patients.filter(patient => 
        patient.insurance.type === insurance
      )
    }
    
    // Incluir dados de comunicação para cada paciente
    const patientsWithCommunication = patients.map(patient => {
      const communicationContact = getCommunicationContactById(patient.communicationContactId)
      return {
        ...patient,
        communicationContact
      }
    })
    
    // Estatísticas
    const stats = {
      total: patients.length,
      active: patients.filter(p => p.isActive).length,
      inactive: patients.filter(p => !p.isActive).length,
      insurance: {
        unimed: patients.filter(p => p.insurance.type === 'unimed').length,
        particular: patients.filter(p => p.insurance.type === 'particular').length,
        outro: patients.filter(p => p.insurance.type === 'outro').length
      },
      nextMedicalRecordNumber: getNextMedicalRecordNumber()
    }
    
    return NextResponse.json({
      success: true,
      patients: patientsWithCommunication,
      stats,
      message: `${patients.length} pacientes encontrados`
    }, { status: 200 })
    
  } catch (error) {
    console.error('❌ Erro ao buscar pacientes médicos:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// POST - Criar novo paciente médico
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    
    // Validações básicas
    if (!body.cpf || typeof body.cpf !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'CPF é obrigatório'
      }, { status: 400 })
    }
    
    if (!body.fullName || typeof body.fullName !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Nome completo é obrigatório'
      }, { status: 400 })
    }
    
    if (!body.communicationContactId || typeof body.communicationContactId !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'ID do contato de comunicação é obrigatório'
      }, { status: 400 })
    }
    
    // Validar formato do CPF (básico)
    const cpfClean = body.cpf.replace(/\D/g, '')
    if (cpfClean.length !== 11) {
      return NextResponse.json({
        success: false,
        message: 'CPF deve ter 11 dígitos'
      }, { status: 400 })
    }
    
    // Verificar se o contato de comunicação existe
    const communicationContact = getCommunicationContactById(body.communicationContactId)
    if (!communicationContact) {
      return NextResponse.json({
        success: false,
        message: 'Contato de comunicação não encontrado'
      }, { status: 404 })
    }
    
    // Verificar se CPF já existe
    const existingPatient = getMedicalPatientByCpf(cpfClean)
    if (existingPatient) {
      return NextResponse.json({
        success: false,
        message: 'Já existe um paciente com este CPF'
      }, { status: 409 })
    }
    
    const result = createMedicalPatient({
      communicationContactId: body.communicationContactId,
      cpf: cpfClean,
      fullName: body.fullName.trim(),
      rg: body.rg?.trim(),
      address: body.address?.trim(),
      city: body.city?.trim(),
      state: body.state?.trim(),
      zipCode: body.zipCode?.replace(/\D/g, ''),
      insurance: {
        type: body.insurance?.type || 'particular',
        plan: body.insurance?.plan?.trim(),
        cardNumber: body.insurance?.cardNumber?.trim(),
        validUntil: body.insurance?.validUntil
      },
      medicalInfo: {
        allergies: Array.isArray(body.medicalInfo?.allergies) ? body.medicalInfo.allergies : [],
        medications: Array.isArray(body.medicalInfo?.medications) ? body.medicalInfo.medications : [],
        conditions: Array.isArray(body.medicalInfo?.conditions) ? body.medicalInfo.conditions : [],
        emergencyContact: body.medicalInfo?.emergencyContact?.trim(),
        emergencyPhone: body.medicalInfo?.emergencyPhone?.trim(),
        bloodType: body.medicalInfo?.bloodType?.trim(),
        notes: body.medicalInfo?.notes?.trim()
      },
      consents: {
        dataProcessing: body.consents?.dataProcessing ?? false,
        dataProcessingDate: body.consents?.dataProcessing ? new Date().toISOString() : undefined,
        medicalTreatment: body.consents?.medicalTreatment ?? false,
        medicalTreatmentDate: body.consents?.medicalTreatment ? new Date().toISOString() : undefined,
        imageUse: body.consents?.imageUse ?? false,
        imageUseDate: body.consents?.imageUse ? new Date().toISOString() : undefined
      }
    }, body.createdBy)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      patient: {
        ...result.patient,
        communicationContact
      },
      message: result.message
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Erro ao criar paciente médico:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// PUT - Atualizar paciente médico
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    
    if (!body.id && !body.cpf) {
      return NextResponse.json({
        success: false,
        message: 'ID ou CPF é obrigatório para atualização'
      }, { status: 400 })
    }
    
    // Buscar paciente existente
    let patient: MedicalPatient | null = null
    
    if (body.id) {
      patient = getMedicalPatientById(body.id)
    } else if (body.cpf) {
      const cpfClean = body.cpf.replace(/\D/g, '')
      patient = getMedicalPatientByCpf(cpfClean)
    }
    
    if (!patient) {
      return NextResponse.json({
        success: false,
        message: 'Paciente não encontrado'
      }, { status: 404 })
    }
    
    // Atualizar apenas os campos fornecidos
    const updatedPatient: MedicalPatient = {
      ...patient,
      fullName: body.fullName?.trim() || patient.fullName,
      rg: body.rg?.trim() || patient.rg,
      address: body.address?.trim() || patient.address,
      city: body.city?.trim() || patient.city,
      state: body.state?.trim() || patient.state,
      zipCode: body.zipCode?.replace(/\D/g, '') || patient.zipCode,
      insurance: {
        ...patient.insurance,
        ...body.insurance
      },
      medicalInfo: {
        ...patient.medicalInfo,
        ...body.medicalInfo
      },
      consents: {
        ...patient.consents,
        ...body.consents
      },
      isActive: body.isActive !== undefined ? body.isActive : patient.isActive,
      updatedAt: new Date().toISOString()
    }
    
    // Salvar atualização (implementar função de update no sistema)
    // Por enquanto, retornar erro informando que a funcionalidade será implementada
    
    return NextResponse.json({
      success: false,
      message: 'Funcionalidade de atualização será implementada em breve'
    }, { status: 501 })
    
  } catch (error) {
    console.error('❌ Erro ao atualizar paciente médico:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}