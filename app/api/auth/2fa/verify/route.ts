import { NextRequest, NextResponse } from 'next/server'
import { TwoFactorAuthService } from '../../../../../lib/two-factor-auth'
import { AuthService } from '../../../../../lib/database'
import { z } from 'zod'

/**
 * Schema de validação para verificação 2FA
 */
const VerifyTwoFactorSchema = z.object({
  token: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, 'Token deve conter 6 dígitos'),
  isBackupCode: z.boolean().optional().default(false),
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
 * POST /api/auth/2fa/verify
 * Verificar token 2FA e ativar se for configuração inicial
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
    const validatedData = VerifyTwoFactorSchema.parse(body)

    // Verificar se é ativação inicial ou verificação normal
    const status = await TwoFactorAuthService.getTwoFactorStatus(userId)

    if (!status.success) {
      return NextResponse.json(
        { success: false, error: status.error },
        { status: 400 }
      )
    }

    let result

    if (!status.isEnabled) {
      // Ativação inicial - verificar e ativar 2FA
      result = await TwoFactorAuthService.verifyAndActivateTwoFactor(
        {
          userId,
          token: validatedData.token,
          isBackupCode: validatedData.isBackupCode,
        },
        clientIp
      )

      if (result.success && result.isValid) {
        return NextResponse.json({
          success: true,
          data: {
            activated: true,
            message:
              '2FA ativado com sucesso! Sua conta agora está mais segura.',
          },
        })
      }
    } else {
      // Verificação normal para usuário com 2FA já ativo
      result = await TwoFactorAuthService.verifyTwoFactor(
        {
          userId,
          token: validatedData.token,
          isBackupCode: validatedData.isBackupCode,
        },
        clientIp
      )

      if (result.success && result.isValid) {
        return NextResponse.json({
          success: true,
          data: {
            verified: true,
            remainingBackupCodes: result.remainingBackupCodes,
            message: 'Token 2FA verificado com sucesso',
          },
        })
      }
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    if (!result.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token inválido ou expirado',
          data: { verified: false },
        },
        { status: 400 }
      )
    }

    // Return padrão caso nenhuma condição anterior seja atendida
    return NextResponse.json(
      { success: false, error: 'Erro inesperado na verificação' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Erro na verificação 2FA:', error)

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
