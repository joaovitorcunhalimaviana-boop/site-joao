import { NextRequest, NextResponse } from 'next/server'
import { createPublicAppointment } from '../../../lib/unified-appointment-system'

// Cache simples para reduzir consultas repetidas
const cache = new Map<string, any>()
const CACHE_TTL = 30000 // 30 segundos

function getCacheKey(data: any): string {
  return `${data.cpf}-${data.selectedDate}-${data.selectedTime}`
}

function getFromCache(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

// POST - Criar agendamento público através do formulário
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API PUBLIC-APPOINTMENT: Recebendo requisição...')

    const body = await request.json()
    console.log('📋 Dados recebidos:', body)

    const {
      fullName,
      cpf,
      email,
      phone,
      whatsapp,
      birthDate,
      insuranceType,
      selectedDate,
      selectedTime,
    } = body

    // Validar campos obrigatórios
    if (
      !fullName ||
      !cpf ||
      !phone ||
      !whatsapp ||
      !birthDate ||
      !insuranceType ||
      !selectedDate ||
      !selectedTime
    ) {
      console.log('❌ Campos obrigatórios faltando')
      return NextResponse.json(
        {
          success: false,
          error:
            'Campos obrigatórios: fullName, cpf, phone, whatsapp, birthDate, insuranceType, selectedDate, selectedTime',
        },
        { status: 400 }
      )
    }

    // Verificar cache para evitar duplicações rápidas
    const cacheKey = getCacheKey({ cpf, selectedDate, selectedTime })
    const cachedResult = getFromCache(cacheKey)
    
    if (cachedResult) {
      console.log('📦 Retornando resultado do cache')
      return NextResponse.json(cachedResult)
    }

    // Converter selectedDate para objeto Date se for string
    const dateObject =
      typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate

    console.log('💾 Chamando createPublicAppointment...')

    // Criar agendamento público
    const result = await createPublicAppointment({
      fullName,
      cpf,
      email: email || '',
      phone,
      whatsapp,
      birthDate,
      insuranceType,
      selectedDate: dateObject,
      selectedTime,
    })

    console.log('📊 Resultado do createPublicAppointment:', result)

    let response
    if (result.success) {
      console.log('✅ Agendamento público criado com sucesso!')
      response = NextResponse.json({
        success: true,
        appointment: result.appointment,
        patient: result.patient,
        message: 'Agendamento criado com sucesso!',
      })
    } else {
      console.log('❌ Falha ao criar agendamento:', result.error)
      response = NextResponse.json(
        {
          success: false,
          error: result.error,
          existingAppointment: result.existingAppointment,
        },
        { status: 400 }
      )
    }

    // Cachear apenas resultados de sucesso
    if (result.success) {
      setCache(cacheKey, {
        success: true,
        appointment: result.appointment,
        patient: result.patient,
        message: 'Agendamento criado com sucesso!',
      })
    }

    return response
  } catch (error) {
    console.error('❌ Erro na API public-appointment:', error)
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
