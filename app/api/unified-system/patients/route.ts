import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllMedicalPatients,
  getCommunicationContactById,
  MedicalPatient,
  CommunicationContact
} from '@/lib/unified-patient-system'
import { ApiRedisCache } from '@/lib/redis-cache'

interface UnifiedPatientData extends MedicalPatient {
  communicationContact?: CommunicationContact
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const active = searchParams.get('active')
    const insurance = searchParams.get('insurance')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Criar chave de cache baseada nos parâmetros
    const cacheKey = `unified-patients:${search || ''}:${active || ''}:${insurance || ''}:${page}:${limit}`
    
    // Tentar buscar do cache primeiro
    const cachedResult = await ApiRedisCache.patients.get(page, limit, search || undefined)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }
    // Buscar todos os pacientes médicos
    const medicalPatients = getAllMedicalPatients()
    
    // Unificar com dados de comunicação
    const unifiedPatients: any[] = []
    
    for (const medicalPatient of medicalPatients) {
      const communicationContact = getCommunicationContactById(medicalPatient.communicationContactId)
      
      // Formato compatível com a newsletter e outras páginas
      unifiedPatients.push({
        id: medicalPatient.id,
        fullName: medicalPatient.fullName,
        cpf: medicalPatient.cpf,
        medicalRecordNumber: medicalPatient.medicalRecordNumber,
        phone: communicationContact?.whatsapp || '',
        whatsapp: communicationContact?.whatsapp || '',
        email: communicationContact?.email || '',
        birthDate: communicationContact?.birthDate || '',
        insuranceType: medicalPatient.insurance.type,
        insurancePlan: medicalPatient.insurance.plan,
        createdAt: medicalPatient.createdAt,
        updatedAt: medicalPatient.updatedAt,
        isActive: medicalPatient.isActive,
        // Dados adicionais do paciente médico
        consultationHistory: medicalPatient.consultationHistory,
        medicalHistory: medicalPatient.medicalHistory,
        allergies: medicalPatient.allergies,
        medications: medicalPatient.medications,
        emergencyContact: medicalPatient.emergencyContact,
        communicationContact: communicationContact || undefined
      })
    }

    // Aplicar filtros
    let filteredPatients = unifiedPatients

    if (search) {
      const searchTerm = search.toLowerCase()
      filteredPatients = filteredPatients.filter(patient => 
        patient.fullName.toLowerCase().includes(searchTerm) ||
        patient.cpf.includes(search) ||
        (patient.communicationContact?.email?.toLowerCase().includes(searchTerm)) ||
        (patient.communicationContact?.whatsapp?.includes(search))
      )
    }

    if (active !== null && active !== undefined) {
      const isActive = active === 'true'
      filteredPatients = filteredPatients.filter(patient => 
        patient.isActive === isActive
      )
    }

    if (insurance) {
      filteredPatients = filteredPatients.filter(patient => 
        patient.insurance.type === insurance
      )
    }

    // Ordenar por data de criação (mais recentes primeiro)
    filteredPatients.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Aplicar paginação
    const total = filteredPatients.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex)

    const result = {
      success: true,
      patients: paginatedPatients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }

    // Cache por 2 minutos
    await ApiRedisCache.patients.set(page, limit, search || undefined, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Erro ao buscar pacientes unificados:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}