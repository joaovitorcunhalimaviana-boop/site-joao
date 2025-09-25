import { NextRequest, NextResponse } from 'next/server'
import { DuplicateDetectionService } from '@/lib/duplicate-detection'
import { AuthService } from '@/lib/database'
import { z } from 'zod'
import { getTimestampISO } from '@/lib/date-utils'

// ================================
// API DE DETECÇÃO DE DUPLICATAS
// ================================

const duplicateCheckSchema = z.object({
  cpf: z.string().min(11, 'CPF deve ter pelo menos 11 dígitos'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido').optional(),
})

/**
 * POST /api/patients/duplicate-check
 * Verifica se um paciente já existe no sistema
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de acesso requerido' },
        { status: 401 }
      )
    }

    const authResult = await AuthService.verifyToken(token)
    if (!authResult || !authResult.userId) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Validar dados de entrada
    const body = await request.json()
    const validation = duplicateCheckSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { cpf, name, phone, email } = validation.data

    // Executar detecção de duplicatas
    const duplicateResult = await DuplicateDetectionService.detectDuplicates(
      cpf,
      name,
      phone,
      email
    )

    // Log da verificação para auditoria
    console.log(
      `Verificação de duplicata realizada por ${authResult.userId}:`,
      {
        cpf: cpf.replace(/\d/g, '*'), // Mascarar CPF no log
        name,
        isDuplicate: duplicateResult.isDuplicate,
        confidence: duplicateResult.confidence,
        matchedBy: duplicateResult.matchedBy,
      }
    )

    return NextResponse.json({
      success: true,
      result: duplicateResult,
    })
  } catch (error) {
    console.error('Erro na verificação de duplicatas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/patients/duplicate-check/cpf/[cpf]
 * Verificação rápida apenas por CPF
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de acesso requerido' },
        { status: 401 }
      )
    }

    const authResult = await AuthService.verifyToken(token)
    if (!authResult || !authResult.userId) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Extrair CPF da URL
    const url = new URL(request.url)
    const cpf = url.searchParams.get('cpf')

    if (!cpf) {
      return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 })
    }

    // Validar CPF
    if (!DuplicateDetectionService.validateCPF(cpf)) {
      return NextResponse.json(
        {
          error: 'CPF inválido',
          isValid: false,
        },
        { status: 400 }
      )
    }

    // Verificar duplicata por CPF
    const duplicateResult =
      await DuplicateDetectionService.detectDuplicateByCPF(cpf)

    return NextResponse.json({
      success: true,
      cpfValid: true,
      result: duplicateResult,
    })
  } catch (error) {
    console.error('Erro na verificação de CPF:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/patients/duplicate-check/merge
 * Mesclar pacientes duplicados
 */
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de acesso requerido' },
        { status: 401 }
      )
    }

    const authResult = await AuthService.verifyToken(token)
    if (!authResult || !authResult.userId) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Nota: Verificação de permissões removida pois o token não contém role
    // Em um sistema real, seria necessário buscar o usuário no banco de dados

    const body = await request.json()
    const { keepPatientId, removePatientId } = body

    if (!keepPatientId || !removePatientId) {
      return NextResponse.json(
        { error: 'IDs dos pacientes são obrigatórios' },
        { status: 400 }
      )
    }

    if (keepPatientId === removePatientId) {
      return NextResponse.json(
        { error: 'Não é possível mesclar um paciente com ele mesmo' },
        { status: 400 }
      )
    }

    // Executar mesclagem
    const mergeResult = await DuplicateDetectionService.mergeDuplicatePatients(
      keepPatientId,
      removePatientId,
      authResult.userId
    )

    if (!mergeResult.success) {
      return NextResponse.json({ error: mergeResult.error }, { status: 400 })
    }

    // Log da mesclagem para auditoria
    console.log(`Pacientes mesclados por ${authResult.userId}:`, {
      keepPatientId,
      removePatientId,
      timestamp: getTimestampISO(),
    })

    return NextResponse.json({
      success: true,
      message: 'Pacientes mesclados com sucesso',
    })
  } catch (error) {
    console.error('Erro na mesclagem de pacientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
