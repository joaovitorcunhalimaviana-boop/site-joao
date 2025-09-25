import { NextRequest, NextResponse } from 'next/server'
import { TwoFactorAuthService } from '../../../../../lib/two-factor-auth'
import { AuthService } from '../../../../../lib/database'
import { z } from 'zod'

/**
 * Schema de validação para desabilitar 2FA
 */
const DisableTwoFactorSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  confirmDisable: z.boolean().refine(val => val === true, {
    message: 'Confirmação é obrigatória para desabilitar 2FA',
  }),
})

/**
 * Obter IP do cliente
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}

/**
 * POST /api/auth/2fa/disable
 * Desabilitar 2FA para um usuário
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIP(request)

  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de acesso requerido' },
        { status: 401 }
      )
    }

    // Verificar token JWT
    const decoded = await AuthService.verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // Validar dados da requisição
    const body = await request.json()
    const validatedData = DisableTwoFactorSchema.parse(body)

    // Verificar se 2FA está habilitado
    const status = await TwoFactorAuthService.getTwoFactorStatus(userId)

    if (!status.success) {
      return NextResponse.json(
        { success: false, error: status.error },
        { status: 400 }
      )
    }

    if (!status.isEnabled) {
      return NextResponse.json(
        { success: false, error: '2FA não está habilitado para este usuário' },
        { status: 400 }
      )
    }

    // Desabilitar 2FA
    const result = await TwoFactorAuthService.disableTwoFactor(
      {
        userId,
        currentPassword: validatedData.currentPassword,
      },
      clientIp
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        disabled: true,
        message:
          '2FA foi desabilitado com sucesso. Sua conta agora usa apenas senha para autenticação.',
      },
    })
  } catch (error) {
    console.error('Erro ao desabilitar 2FA:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.issues.map(e => e.message),
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
