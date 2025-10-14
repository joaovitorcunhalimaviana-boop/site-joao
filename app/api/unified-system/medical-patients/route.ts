import { NextRequest, NextResponse } from 'next/server'
import {
  getAllPatients,
  getPatientById,
  createOrUpdatePatient,
  UnifiedPatient,
} from '@/lib/prisma-service'
import { getAllMedicalPatients, getMedicalPatientById, getCommunicationContactById } from '@/lib/unified-patient-system-prisma'
import { AuthMiddleware } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

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

      if (patient) {
        // Fallback: usar histórico de agendamentos priorizando "unimed" por ordem de atualização
        let finalInsurance = patient.insurance || { type: 'particular', plan: undefined }
        try {
          const linkedMedicalPatient = await getMedicalPatientById(id)
          const whereClause = linkedMedicalPatient
            ? {
                OR: [
                  { medicalPatientId: linkedMedicalPatient.id },
                  { communicationContactId: linkedMedicalPatient.communicationContactId },
                ],
              }
            : { communicationContactId: id }

          const normalizeType = (t?: any) => (t ? String(t).toLowerCase() : undefined)

          // Buscar o mais recente com Unimed, senão Particular, senão Outro
          const preferredUnimed = await prisma.appointment.findFirst({
            where: {
              ...whereClause,
              insuranceType: { in: ['UNIMED', 'unimed', 'Unimed'] },
            },
            orderBy: { updatedAt: 'desc' },
            select: { insuranceType: true, insurancePlan: true }
          })

          const preferredParticular = !preferredUnimed
            ? await prisma.appointment.findFirst({
                where: {
                  ...whereClause,
                  insuranceType: { in: ['PARTICULAR', 'particular', 'Particular'] },
                },
                orderBy: { updatedAt: 'desc' },
                select: { insuranceType: true, insurancePlan: true }
              })
            : null

          const preferredOutro = !preferredUnimed && !preferredParticular
            ? await prisma.appointment.findFirst({
                where: {
                  ...whereClause,
                  insuranceType: { in: ['OUTRO', 'outro', 'Outro'] },
                },
                orderBy: { updatedAt: 'desc' },
                select: { insuranceType: true, insurancePlan: true }
              })
            : null

          const preferred = preferredUnimed || preferredParticular || preferredOutro
          if (preferred) {
            const typeFromApt = normalizeType(preferred.insuranceType)
            const planFromApt = preferred.insurancePlan || undefined
            if (typeFromApt) {
              finalInsurance = {
                type: (typeFromApt as 'unimed' | 'particular' | 'outro') || finalInsurance.type || 'particular',
                plan: planFromApt ?? finalInsurance.plan,
              }
            }
          }
        } catch (err) {
          console.warn('⚠️ Falha ao obter convênios de agendamentos:', err)
        }

        const patientWithEnhancedInsurance = { ...patient, insurance: finalInsurance }

        return NextResponse.json(
          {
            success: true,
            patient: patientWithEnhancedInsurance,
            message: 'Paciente encontrado com sucesso',
          },
          { status: 200 }
        )
      }

      // Fallback: buscar paciente do sistema unificado (medicalPatient) e montar dados com contato
      const medicalPatient = await getMedicalPatientById(id)

      if (!medicalPatient) {
        return NextResponse.json(
          {
            success: false,
            message: 'Paciente não encontrado',
          },
          { status: 404 }
        )
      }

      const contact = medicalPatient.communicationContactId
        ? await getCommunicationContactById(medicalPatient.communicationContactId)
        : null

      let unifiedPatient = {
        id: medicalPatient.id,
        fullName: medicalPatient.fullName,
        name: medicalPatient.fullName,
        cpf: medicalPatient.cpf,
        phone: contact?.phone || contact?.whatsapp || medicalPatient.phone || medicalPatient.whatsapp || '',
        whatsapp: contact?.whatsapp || contact?.phone || medicalPatient.whatsapp || medicalPatient.phone || '',
        email: contact?.email || '',
        birthDate: contact?.birthDate || medicalPatient.birthDate || '',
        insurance: {
          type: (medicalPatient.insuranceType?.toLowerCase() || 'particular') as 'unimed' | 'particular' | 'outro',
          plan: medicalPatient.insurancePlan || '',
        },
        createdAt: medicalPatient.createdAt,
        updatedAt: medicalPatient.updatedAt,
        isActive: medicalPatient.isActive,
      }

      // Fallback adicional: usar convênio do histórico por ordem de atualização e priorizar "unimed"
      try {
        const whereClause = {
          OR: [
            { medicalPatientId: medicalPatient.id },
            { communicationContactId: medicalPatient.communicationContactId },
          ],
        }

        const normalizeType = (t?: any) => (t ? String(t).toLowerCase() : undefined)

        const preferredUnimed = await prisma.appointment.findFirst({
          where: {
            ...whereClause,
            insuranceType: { in: ['UNIMED', 'unimed', 'Unimed'] },
          },
          orderBy: { updatedAt: 'desc' },
          select: { insuranceType: true, insurancePlan: true }
        })

        const preferredParticular = !preferredUnimed
          ? await prisma.appointment.findFirst({
              where: {
                ...whereClause,
                insuranceType: { in: ['PARTICULAR', 'particular', 'Particular'] },
              },
              orderBy: { updatedAt: 'desc' },
              select: { insuranceType: true, insurancePlan: true }
            })
          : null

        const preferredOutro = !preferredUnimed && !preferredParticular
          ? await prisma.appointment.findFirst({
              where: {
                ...whereClause,
                insuranceType: { in: ['OUTRO', 'outro', 'Outro'] },
              },
              orderBy: { updatedAt: 'desc' },
              select: { insuranceType: true, insurancePlan: true }
            })
          : null

        const preferred = preferredUnimed || preferredParticular || preferredOutro
        if (preferred) {
          const typeFromApt = normalizeType(preferred.insuranceType)
          const planFromApt = preferred.insurancePlan || undefined
          if (typeFromApt) {
            unifiedPatient = {
              ...unifiedPatient,
              insurance: {
                type: (typeFromApt as 'unimed' | 'particular' | 'outro') || unifiedPatient.insurance.type,
                plan: planFromApt ?? unifiedPatient.insurance.plan,
              },
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ Falha ao aplicar fallback de convênio via agendamentos:', err)
      }

      return NextResponse.json(
        {
          success: true,
          patient: unifiedPatient,
          message: 'Paciente encontrado com sucesso (via sistema unificado)',
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

    // Listar apenas pacientes médicos (com CPF) - incluir dados do contato de comunicação
    const medicalPatients = await getAllMedicalPatients()
    
    // Buscar dados completos incluindo contatos de comunicação
    const patientsWithContacts = await Promise.all(
      medicalPatients.map(async (patient) => {
        try {
          const contact = await prisma.communicationContact.findUnique({
            where: { id: patient.communicationContactId }
          })

          // Base insurance from medical patient
          let finalInsurance: { type: 'unimed' | 'particular' | 'outro'; plan?: string } = {
            type: (patient.insuranceType?.toLowerCase() || 'particular') as 'unimed' | 'particular' | 'outro',
            plan: patient.insurancePlan || undefined
          }

          // Fallback via histórico de agendamentos: prioriza Unimed > Particular > Outro
          try {
            const whereClause = {
              OR: [
                { medicalPatientId: patient.id },
                { communicationContactId: patient.communicationContactId },
              ],
            }

            const normalizeType = (t?: any) => (t ? String(t).toLowerCase() : undefined)

            const preferredUnimed = await prisma.appointment.findFirst({
              where: { ...whereClause, insuranceType: { in: ['UNIMED', 'unimed', 'Unimed'] } },
              orderBy: { updatedAt: 'desc' },
              select: { insuranceType: true, insurancePlan: true }
            })

            const preferredParticular = !preferredUnimed
              ? await prisma.appointment.findFirst({
                  where: { ...whereClause, insuranceType: { in: ['PARTICULAR', 'particular', 'Particular'] } },
                  orderBy: { updatedAt: 'desc' },
                  select: { insuranceType: true, insurancePlan: true }
                })
              : null

            const preferredOutro = !preferredUnimed && !preferredParticular
              ? await prisma.appointment.findFirst({
                  where: { ...whereClause, insuranceType: { in: ['OUTRO', 'outro', 'Outro'] } },
                  orderBy: { updatedAt: 'desc' },
                  select: { insuranceType: true, insurancePlan: true }
                })
              : null

            const preferred = preferredUnimed || preferredParticular || preferredOutro
            if (preferred) {
              const typeFromApt = normalizeType(preferred.insuranceType) as 'unimed' | 'particular' | 'outro' | undefined
              const planFromApt = preferred.insurancePlan || undefined
              if (typeFromApt) {
                finalInsurance = {
                  type: typeFromApt,
                  plan: planFromApt ?? finalInsurance.plan,
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ Falha ao obter convênio por agendamentos (lista):', err)
          }

          return {
            id: patient.id,
            name: patient.fullName,
            cpf: patient.cpf,
            medicalRecordNumber: patient.medicalRecordNumber,
            phone: contact?.phone || contact?.whatsapp || '',
            whatsapp: contact?.whatsapp || contact?.phone || '',
            email: contact?.email || '',
            birthDate: contact?.birthDate || '',
            insurance: finalInsurance,
            registrationSources: [],
            emailPreferences: {
              healthTips: false,
              appointments: false,
              promotions: false,
              subscribed: false,
              newsletter: false
            },
            birthdayEmailLogs: [],
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
            isActive: patient.isActive ?? true
          }
        } catch (error) {
          console.error('Erro ao buscar contato para paciente:', patient.id, error)

          // Mesmo com erro no contato, aplicar a mesma lógica de fallback de convênio
          let finalInsurance: { type: 'unimed' | 'particular' | 'outro'; plan?: string } = {
            type: (patient.insuranceType?.toLowerCase() || 'particular') as 'unimed' | 'particular' | 'outro',
            plan: patient.insurancePlan || undefined
          }
          try {
            const whereClause = {
              OR: [
                { medicalPatientId: patient.id },
                { communicationContactId: patient.communicationContactId },
              ],
            }
            const normalizeType = (t?: any) => (t ? String(t).toLowerCase() : undefined)

            const preferredUnimed = await prisma.appointment.findFirst({
              where: { ...whereClause, insuranceType: { in: ['UNIMED', 'unimed', 'Unimed'] } },
              orderBy: { updatedAt: 'desc' },
              select: { insuranceType: true, insurancePlan: true }
            })
            const preferredParticular = !preferredUnimed
              ? await prisma.appointment.findFirst({
                  where: { ...whereClause, insuranceType: { in: ['PARTICULAR', 'particular', 'Particular'] } },
                  orderBy: { updatedAt: 'desc' },
                  select: { insuranceType: true, insurancePlan: true }
                })
              : null
            const preferredOutro = !preferredUnimed && !preferredParticular
              ? await prisma.appointment.findFirst({
                  where: { ...whereClause, insuranceType: { in: ['OUTRO', 'outro', 'Outro'] } },
                  orderBy: { updatedAt: 'desc' },
                  select: { insuranceType: true, insurancePlan: true }
                })
              : null

            const preferred = preferredUnimed || preferredParticular || preferredOutro
            if (preferred) {
              const typeFromApt = normalizeType(preferred.insuranceType) as 'unimed' | 'particular' | 'outro' | undefined
              const planFromApt = preferred.insurancePlan || undefined
              if (typeFromApt) {
                finalInsurance = {
                  type: typeFromApt,
                  plan: planFromApt ?? finalInsurance.plan,
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ Falha ao obter convênio por agendamentos (lista, fallback):', err)
          }

          return {
            id: patient.id,
            name: patient.fullName,
            cpf: patient.cpf,
            medicalRecordNumber: patient.medicalRecordNumber,
            phone: '',
            whatsapp: '',
            email: '',
            birthDate: '',
            insurance: finalInsurance,
            registrationSources: [],
            emailPreferences: {
              healthTips: false,
              appointments: false,
              promotions: false,
              subscribed: false,
              newsletter: false
            },
            birthdayEmailLogs: [],
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
            isActive: patient.isActive ?? true
          }
        }
      })
    )
    
    let patients = patientsWithContacts

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

  // Verificar permissões (médicos, secretárias e admins podem criar pacientes médicos)
  if (!['DOCTOR', 'SECRETARY', 'ADMIN'].includes(auth.user.role)) {
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
    if (existingPatient && existingPatient.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'Já existe um paciente ativo com este CPF',
        },
        { status: 409 }
      )
    }

    // Se existe um paciente inativo com o mesmo CPF, reativar ao invés de criar novo
    if (existingPatient && !existingPatient.isActive) {
      const reactivatedPatient = await createOrUpdatePatient({
        ...existingPatient,
        fullName: body.fullName.trim(),
        name: body.fullName.trim(),
        rg: body.rg?.trim() || existingPatient.rg,
        endereco: body.address?.trim() || existingPatient.endereco,
        cidade: body.city?.trim() || existingPatient.cidade,
        estado: body.state?.trim() || existingPatient.estado,
        cep: body.zipCode?.replace(/\D/g, '') || existingPatient.cep,
        phone: body.phone?.trim() || existingPatient.phone,
        whatsapp: body.whatsapp?.trim() || body.phone?.trim() || existingPatient.whatsapp,
        email: body.email?.trim() || existingPatient.email,
        birthDate: body.birthDate?.trim() || existingPatient.birthDate,
        insurance: {
          type: body.insurance?.type || existingPatient.insurance?.type || 'particular',
          plan: body.insurance?.plan?.trim() || existingPatient.insurance?.plan,
          cardNumber: body.insurance?.cardNumber?.trim() || existingPatient.insurance?.cardNumber,
          validUntil: body.insurance?.validUntil || existingPatient.insurance?.validUntil,
        },
        isActive: true,
      })

      return NextResponse.json(
        {
          success: true,
          patient: reactivatedPatient,
          message: 'Paciente reativado com sucesso',
        },
        { status: 200 }
      )
    }

    // Criar novo paciente usando Prisma service
    const patientData: Partial<UnifiedPatient> = {
      cpf: cpfClean,
      name: body.fullName.trim(),
      fullName: body.fullName.trim(),
      rg: body.rg?.trim(),
      endereco: body.address?.trim(),
      cidade: body.city?.trim(),
      estado: body.state?.trim(),
      cep: body.zipCode?.replace(/\D/g, ''),
      phone: body.phone?.trim(),
      whatsapp: body.whatsapp?.trim() || body.phone?.trim(),
      email: body.email?.trim(),
      birthDate: body.birthDate?.trim(),
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

  // Verificar permissões (médicos, secretárias e admins podem atualizar pacientes médicos)
  if (!['DOCTOR', 'SECRETARY', 'ADMIN'].includes(auth.user.role)) {
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
      birthDate: body.birthDate?.trim() || patient.birthDate,
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