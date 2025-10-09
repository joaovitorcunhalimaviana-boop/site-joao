import { NextRequest, NextResponse } from 'next/server'
import { AuthService, AuditService, prisma } from '@/lib/database'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  return realIP || 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Obter refresh token do cookie
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token não encontrado' },
        { status: 401 }
      )
    }

    // Verificar refresh token
    const payload = await AuthService.verifyToken(refreshToken, 'refresh')
    if (!payload) {
      await AuditService.log({
        action: 'REFRESH_TOKEN_INVALID',
        resource: 'Auth',
        details: JSON.stringify({
          token: refreshToken.substring(0, 20) + '...',
        }),
        severity: 'MEDIUM',
        ipAddress: clientIP,
        userAgent,
      })

      return NextResponse.json(
        { success: false, error: 'Refresh token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Verificar se o refresh token existe no banco
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    })

    if (!storedToken || !storedToken.user.isActive) {
      await AuditService.log({
        userId: payload.userId,
        action: 'REFRESH_TOKEN_NOT_FOUND_OR_USER_INACTIVE',
        resource: 'Auth',
        details: JSON.stringify({
          tokenFound: !!storedToken,
          userActive: storedToken?.user.isActive,
        }),
        severity: 'MEDIUM',
        ipAddress: clientIP,
        userAgent,
      })

      return NextResponse.json(
        { success: false, error: 'Token inválido ou usuário inativo' },
        { status: 401 }
      )
    }

    // Gerar novos tokens mantendo configurações de sessão médica
    const { accessToken, refreshToken: newRefreshToken } =
      AuthService.generateTokens(storedToken.user.id, storedToken.user.role)

    // Remover o refresh token antigo e salvar o novo
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    })

    await AuthService.saveRefreshToken(storedToken.user.id, newRefreshToken)

    // Log de refresh bem-sucedido
    await AuditService.log({
      userId: storedToken.user.id,
      action: 'TOKEN_REFRESHED',
      resource: 'Auth',
      details: JSON.stringify({
        email: storedToken.user.email,
        role: storedToken.user.role,
      }),
      severity: 'LOW',
      ipAddress: clientIP,
      userAgent,
    })

    // Preparar resposta
    const response = NextResponse.json({
      success: true,
      accessToken,
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.name,
        role: storedToken.user.role,
      },
    })

    // Configurar novo cookie do refresh token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/',
    }

    response.cookies.set('refreshToken', newRefreshToken, cookieOptions)

    return response
  } catch (error) {
    console.error('Erro no refresh token:', error)

    await AuditService.log({
      action: 'REFRESH_TOKEN_ERROR',
      resource: 'Auth',
      details: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      severity: 'HIGH',
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Obter refresh token do cookie
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (refreshToken) {
      // Verificar token para obter userId
      const payload = await AuthService.verifyToken(refreshToken, 'refresh')

      if (payload) {
        // Remover refresh token do banco
        await prisma.refreshToken.deleteMany({
          where: {
            token: refreshToken,
            userId: payload.userId,
          },
        })

        // Log de logout
        await AuditService.log({
          userId: payload.userId,
          action: 'USER_LOGOUT',
          resource: 'Auth',
          details: JSON.stringify({ method: 'refresh_token_deletion' }),
          severity: 'LOW',
          ipAddress: clientIP,
          userAgent,
        })
      }
    }

    // Preparar resposta removendo o cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    })

    // Remover cookie do refresh token
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict' as const,
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Erro no logout:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}
