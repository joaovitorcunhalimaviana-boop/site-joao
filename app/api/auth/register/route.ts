import { NextRequest, NextResponse } from 'next/server'
import { AuthService, AuditService, prisma } from '@/lib/database'
import { RegisterSchema, validateData } from '@/lib/validation-schemas'
import { z } from 'zod'

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

    // Parse do corpo da requisição
    const body = await request.json()

    // Validação dos dados
    const validation = validateData(RegisterSchema, body)

    if (!validation.success) {
      await AuditService.log({
        action: 'REGISTER_FAILED_VALIDATION',
        resource: 'Auth',
        details: JSON.stringify({ errors: validation.errors }),
        severity: 'LOW',
        ipAddress: clientIP,
        userAgent,
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Dados de registro inválidos',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    const { name, email, password, role = 'USER' } = validation.data

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      await AuditService.log({
        action: 'REGISTER_FAILED_EMAIL_EXISTS',
        resource: 'Auth',
        details: JSON.stringify({ email }),
        severity: 'MEDIUM',
        ipAddress: clientIP,
        userAgent,
      })

      return NextResponse.json(
        { success: false, error: 'Email já está em uso' },
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await AuthService.hashPassword(password)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        username: email.toLowerCase(), // Usando email como username
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Log de registro bem-sucedido
    await AuditService.log({
      userId: user.id,
      action: 'USER_REGISTERED',
      resource: 'Auth',
      details: JSON.stringify({
        email: user.email,
        role: user.role,
        name: user.name,
      }),
      severity: 'LOW',
      ipAddress: clientIP,
      userAgent,
    })

    // Gerar tokens com configuração específica para médicos
    const { accessToken, refreshToken } = AuthService.generateTokens(
      user.id,
      user.role
    )

    // Salvar refresh token
    await AuthService.saveRefreshToken(user.id, refreshToken)

    // Preparar resposta
    const response = NextResponse.json({
      success: true,
      message: 'Usuário registrado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
    })

    // Configurar cookie do refresh token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/',
    }

    response.cookies.set('refreshToken', refreshToken, cookieOptions)

    return response
  } catch (error) {
    console.error('Erro no registro:', error)

    await AuditService.log({
      action: 'REGISTER_ERROR',
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
