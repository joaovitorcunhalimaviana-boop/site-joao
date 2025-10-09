import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from './database'
import { AuditService } from './database'

// Tipos para o contexto de autenticação
export interface AuthContext {
  user: {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'DOCTOR' | 'SECRETARY'
    isActive: boolean
  }
  sessionId?: string
}

// Rotas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/api/public',
]

// Rotas que precisam de permissões específicas
const ROLE_PERMISSIONS = {
  ADMIN: ['*'], // Acesso total
  DOCTOR: [
    '/api/unified-system/patients',
    '/api/unified-system/medical-patients',
    '/api/appointments',
    '/api/consultations',
    '/api/medical-records',
    '/api/medical-attachments',
    '/api/prescriptions',
    '/api/reports',
  ],
  SECRETARY: [
    '/api/unified-system/patients',
    '/api/unified-system/medical-patients',
    '/api/appointments',
    '/api/agenda',
    '/api/reports/basic',
  ],
}

// Rate limiting por usuário
const userRateLimit = new Map<string, { count: number; resetTime: number }>()

export class AuthMiddleware {
  /**
   * Middleware principal de autenticação
   */
  static async authenticate(request: NextRequest): Promise<{
    success: boolean
    user?: AuthContext['user']
    error?: string
    response?: NextResponse
  }> {
    const pathname = request.nextUrl.pathname

    // Verificar se é rota pública
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      return { success: true }
    }

    // Extrair token do header Authorization ou cookie
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')
    
    // Se não há token no header, verificar cookie
    if (!token) {
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {} as Record<string, string>)
        token = cookies['auth-token']
      }
    }

    if (!token) {
      return {
        success: false,
        error: 'Token de acesso não fornecido',
        response: NextResponse.json(
          { error: 'Token de acesso requerido' },
          { status: 401 }
        ),
      }
    }

    try {
      // Verificar token JWT
      const decoded = verify(token, process.env['JWT_SECRET']!) as {
        userId: string
        type: string
        iat: number
        exp: number
      }

      if (decoded.type !== 'access') {
        throw new Error('Tipo de token inválido')
      }

      // Buscar usuário no banco
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLogin: true,
        },
      })

      if (!user || !user.isActive) {
        return {
          success: false,
          error: 'Usuário não encontrado ou inativo',
          response: NextResponse.json(
            { error: 'Acesso negado' },
            { status: 403 }
          ),
        }
      }

      // Verificar rate limiting
      const rateLimitResult = this.checkRateLimit(user.id, user.role)
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: 'Rate limit excedido',
          response: NextResponse.json(
            {
              error: 'Muitas requisições. Tente novamente em alguns minutos.',
              retryAfter: rateLimitResult.retryAfter,
            },
            { status: 429 }
          ),
        }
      }

      // Verificar permissões
      const hasPermission = this.checkPermissions(user.role, pathname)
      if (!hasPermission) {
        // Log de tentativa de acesso não autorizado
        await AuditService.log({
          userId: user.id,
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          resource: 'API',
          details: JSON.stringify({ path: pathname }),
          severity: 'HIGH',
          ipAddress: this.getClientIP(request),
          userAgent: request.headers.get('user-agent') || undefined,
        })

        return {
          success: false,
          error: 'Permissão insuficiente',
          response: NextResponse.json(
            { error: 'Acesso negado para este recurso' },
            { status: 403 }
          ),
        }
      }

      // Log de acesso bem-sucedido para rotas sensíveis
      if (this.isSensitiveRoute(pathname)) {
        await AuditService.log({
          userId: user.id,
          action: 'API_ACCESS',
          resource: 'API',
          details: JSON.stringify({ path: pathname, method: request.method }),
          severity: 'LOW',
          ipAddress: this.getClientIP(request),
          userAgent: request.headers.get('user-agent') || undefined,
        })
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
      }
    } catch (error) {
      console.error('❌ [Auth] Authentication error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })

      return {
        success: false,
        error: 'Token inválido',
        response: NextResponse.json(
          { error: 'Token de acesso inválido' },
          { status: 401 }
        ),
      }
    }
  }

  /**
   * Verificar rate limiting por usuário
   */
  private static checkRateLimit(
    userId: string,
    userRole?: string
  ): {
    allowed: boolean
    retryAfter?: number
  } {
    // Rate limiting desabilitado - sempre permitir
    return { allowed: true }
  }

  /**
   * Verificar permissões baseadas no papel do usuário
   */
  private static checkPermissions(role: string, pathname: string): boolean {
    const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]

    if (!permissions) return false

    // Admin tem acesso total
    if (permissions.includes('*')) return true

    // Verificar se o caminho está nas permissões
    return permissions.some(permission => pathname.startsWith(permission))
  }

  /**
   * Verificar se é uma rota sensível que precisa de auditoria
   */
  private static isSensitiveRoute(pathname: string): boolean {
    const sensitiveRoutes = [
      '/api/unified-system/patients',
      '/api/medical-records',
      '/api/medical-attachments',
      '/api/prescriptions',
      '/api/consultations',
      '/api/reports',
      '/api/admin',
    ]

    return sensitiveRoutes.some(route => pathname.startsWith(route))
  }

  /**
   * Extrair IP do cliente
   */
  private static getClientIP(request: NextRequest): string {
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
   * Middleware para Next.js API Routes
   */
  static withAuth(
    handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
  ) {
    return async (request: NextRequest) => {
      const authResult = await this.authenticate(request)

      if (!authResult.success) {
        return authResult.response!
      }

      // Criar contexto de autenticação
      const context: AuthContext = {
        user: authResult.user!,
      }

      return handler(request, context)
    }
  }

  /**
   * Verificar se o usuário tem uma permissão específica
   */
  static hasPermission(userRole: string, resource: string): boolean {
    const permissions =
      ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]

    if (!permissions) return false
    if (permissions.includes('*')) return true

    return permissions.includes(resource)
  }

  /**
   * Middleware para verificar se é admin
   */
  static requireAdmin(
    handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
  ) {
    return this.withAuth(async (request, context) => {
      if (context.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Acesso restrito a administradores' },
          { status: 403 }
        )
      }

      return handler(request, context)
    })
  }

  /**
   * Middleware para verificar se é médico ou admin
   */
  static requireDoctor(
    handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
  ) {
    return this.withAuth(async (request, context) => {
      if (!['DOCTOR', 'ADMIN'].includes(context.user.role)) {
        return NextResponse.json(
          { error: 'Acesso restrito a médicos' },
          { status: 403 }
        )
      }

      return handler(request, context)
    })
  }

  /**
   * Limpar rate limits expirados (executar periodicamente)
   */
  static cleanupRateLimits() {
    const now = Date.now()

    for (const [userId, limit] of userRateLimit.entries()) {
      if (now > limit.resetTime) {
        userRateLimit.delete(userId)
      }
    }
  }
}

// Limpar rate limits a cada 5 minutos
setInterval(
  () => {
    AuthMiddleware.cleanupRateLimits()
  },
  5 * 60 * 1000
)

// Exportações nomeadas para compatibilidade
export const withAuth = (
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) => {
  return AuthMiddleware.withAuth(handler)
}

export const requireAdmin = (
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) => {
  return AuthMiddleware.requireAdmin(handler)
}

export const requireDoctor = (
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) => {
  return AuthMiddleware.requireDoctor(handler)
}

export default AuthMiddleware
