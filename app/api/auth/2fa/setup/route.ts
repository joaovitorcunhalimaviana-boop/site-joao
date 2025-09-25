import { NextRequest, NextResponse } from 'next/server'
import { TwoFactorAuthService } from '../../../../../lib/two-factor-auth'
import { AuthService } from '../../../../../lib/database'
import { z } from 'zod'

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
 * POST /api/auth/2fa/setup
 * Iniciar configuração do 2FA para um usuário
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

    // Configurar 2FA
    const result = await TwoFactorAuthService.setupTwoFactor(
      { userId },
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
        qrCodeUrl: result.qrCodeUrl,
        backupCodes: result.backupCodes,
        message:
          'Configure seu aplicativo autenticador com o QR Code e confirme com um token',
      },
    })
  } catch (error) {
    console.error('Erro na configuração 2FA:', error)

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/2fa/setup
 * Obter status da configuração 2FA
 */
export async function GET(request: NextRequest) {
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

    // Obter status 2FA
    const result = await TwoFactorAuthService.getTwoFactorStatus(userId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        isEnabled: result.isEnabled,
        hasBackupCodes: result.hasBackupCodes,
        backupCodesCount: result.backupCodesCount,
        lastUsed: result.lastUsed,
      },
    })
  } catch (error) {
    console.error('Erro ao obter status 2FA:', error)

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
