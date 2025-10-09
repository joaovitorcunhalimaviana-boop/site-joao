import { NextRequest, NextResponse } from 'next/server'
import { getAllPatients, UnifiedPatient } from '@/lib/prisma-service'
import { ApiRedisCache } from '@/lib/redis-cache'

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
    const cachedResult = await ApiRedisCache.patients.get(
      page,
      limit,
      search || undefined
    )
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    // Buscar todos os pacientes usando Prisma
    const allPatients = await getAllPatients()

    // Converter para formato compatível com a interface existente
    const unifiedPatients = allPatients.map(patient => ({
      id: patient.id,
      fullName: patient.name,
      cpf: patient.cpf || '',
      medicalRecordNumber: patient.medicalRecordNumber || 0,
      phone: patient.phone,
      whatsapp: patient.whatsapp,
      email: patient.email || '',
      birthDate: patient.birthDate || '',
      insuranceType: patient.insurance.type,
      insurancePlan: patient.insurance.plan || '',
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      isActive: true, // Assumindo que todos os pacientes são ativos por padrão
      // Dados adicionais do paciente médico (vazios por enquanto)
      consultationHistory: [],
      medicalHistory: '',
      allergies: [],
      medications: [],
      emergencyContact: null,
    }))

    // Aplicar filtros
    let filteredPatients = unifiedPatients

    if (search) {
      const searchTerm = search.toLowerCase()
      filteredPatients = filteredPatients.filter(
        patient =>
          patient.fullName.toLowerCase().includes(searchTerm) ||
          patient.cpf.includes(search) ||
          patient.email.toLowerCase().includes(searchTerm) ||
          patient.whatsapp.includes(search)
      )
    }

    if (active !== null && active !== undefined) {
      const isActive = active === 'true'
      filteredPatients = filteredPatients.filter(
        patient => patient.isActive === isActive
      )
    }

    if (insurance) {
      filteredPatients = filteredPatients.filter(
        patient => patient.insuranceType === insurance
      )
    }

    // Ordenar por data de criação (mais recentes primeiro)
    filteredPatients.sort(
      (a, b) =>
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
        hasPrev: page > 1,
      },
    }

    // Cache por 2 minutos
    await ApiRedisCache.patients.set(page, limit, search || undefined, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Erro ao buscar pacientes unificados:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}