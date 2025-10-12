import * as jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { User, LoginSchema, validateData } from './validation-schemas'
import { prisma } from './database'

// Configurações JWT
const JWT_SECRET =
  process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '7d'
const REFRESH_TOKEN_EXPIRES_IN =
  process.env['REFRESH_TOKEN_EXPIRES_IN'] || '30d'

// Validar se JWT_SECRET está definido
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

// Interface para payload do JWT
export interface JWTPayload {
  userId: string
  username: string
  email: string
  role: 'doctor' | 'secretary' | 'admin'
  name: string
  iat?: number
  exp?: number
}

// Interface para tokens
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Interface para resposta de autenticação
export interface AuthResponse {
  success: boolean
  user?: Omit<User, 'password'>
  tokens?: AuthTokens
  message?: string
  errors?: string[]
}

// Classe para gerenciamento de autenticação
export class AuthManager {
  // Hash da senha
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  // Verificar senha
  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  // Gerar tokens JWT
  static generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens {
    const jwtPayload = {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      type: 'access',
    }

    const accessToken = jwt.sign(jwtPayload, JWT_SECRET as string)

    const refreshPayload = {
      userId: payload.userId,
      type: 'refresh',
    }

    const refreshToken = jwt.sign(refreshPayload, JWT_SECRET as string)

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 dias em segundos
    }
  }

  // Verificar token JWT
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as JWTPayload

      return decoded
    } catch (error) {
      console.error('❌ [Auth] Token verification failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
      return null
    }
  }

  // Renovar tokens usando refresh token
  static renewTokens(refreshToken: string): AuthTokens | null {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET as string) as any

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token type')
      }

      // Gerar novos tokens
      const newPayload = {
        userId: decoded.userId,
        username: decoded.username || '',
        email: decoded.email || '',
        role: decoded.role || 'secretary',
        name: decoded.name || '',
      }

      const accessToken = jwt.sign(newPayload, JWT_SECRET as string)

      const newRefreshToken = jwt.sign(
        { userId: decoded.userId, type: 'refresh' },
        JWT_SECRET as string
      )

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 dias em segundos
      }
    } catch (error) {
      console.error('❌ [Auth] Token renewal failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
      return null
    }
  }

  // Extrair token do header Authorization
  static extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    return authHeader.substring(7) // Remove 'Bearer ' prefix
  }

  // Middleware de autenticação
  static authenticateRequest(request: NextRequest): JWTPayload | null {
    const token = this.extractTokenFromRequest(request)

    if (!token) {
      return null
    }

    return this.verifyToken(token)
  }

  // Verificar permissões baseadas em role
  static hasPermission(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole)
  }

  // Converter string de tempo para segundos
  private static parseTimeToSeconds(timeString: string): number {
    const timeRegex = /^(\d+)([smhd])$/
    const match = timeString.match(timeRegex)

    if (!match) {
      return 3600 // Default: 1 hora
    }

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 's':
        return value
      case 'm':
        return value * 60
      case 'h':
        return value * 3600
      case 'd':
        return value * 86400
      default:
        return 3600
    }
  }
}

// Função para autenticar usuário (login)
export async function authenticateUser(
  credentials: unknown
): Promise<AuthResponse> {
  // Validar dados de entrada
  const validation = validateData(LoginSchema, credentials)

  if (!validation.success) {
    return {
      success: false,
      message: 'Dados de login inválidos',
      errors: validation.errors,
    }
  }

  const { email, password } = validation.data

  try {
    // Buscar usuário no banco de dados usando Prisma (por email ou username)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email } // O campo 'email' pode conter username também
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        name: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true,
      }
    })

    // Verificar se usuário existe e está ativo
    if (!user || !user.isActive) {
      return {
        success: false,
        message: 'Usuário não encontrado ou inativo',
      }
    }

    // Verificar se a conta está bloqueada
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return {
        success: false,
        message: 'Conta temporariamente bloqueada. Tente novamente mais tarde.',
      }
    }

    // Verificar senha
    const isPasswordValid = await AuthManager.verifyPassword(
      password,
      user.password
    )

    if (!isPasswordValid) {
      // Incrementar tentativas de login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: user.loginAttempts + 1,
          lockedUntil: user.loginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null // 15 minutos
        }
      })

      return {
        success: false,
        message: 'Senha incorreta',
      }
    }

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date()
      }
    })

    // Gerar tokens
    const tokens = AuthManager.generateTokens({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role as 'DOCTOR' | 'SECRETARY' | 'ADMIN',
      name: user.name,
    })

    // Retornar sucesso com dados do usuário (sem senha)
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as 'DOCTOR' | 'SECRETARY' | 'ADMIN',
        name: user.name,
        isActive: user.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      tokens,
      message: 'Login realizado com sucesso',
    }
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return {
      success: false,
      message: 'Erro interno do servidor',
    }
  }
}

// Middleware para proteger rotas
export function requireAuth(allowedRoles: string[] = []) {
  return (request: NextRequest) => {
    const user = AuthManager.authenticateRequest(request)

    if (!user) {
      return {
        authenticated: false,
        message: 'Token de acesso inválido ou expirado',
      }
    }

    if (
      allowedRoles.length > 0 &&
      !AuthManager.hasPermission(user.role, allowedRoles)
    ) {
      return {
        authenticated: false,
        message: 'Permissão insuficiente para acessar este recurso',
      }
    }

    return {
      authenticated: true,
      user,
    }
  }
}

// Função para logout (invalidar tokens)
export function logoutUser(refreshToken: string): boolean {
  try {
    // Aqui você adicionaria o token a uma blacklist no banco de dados
    // Por enquanto, apenas validamos se o token é válido
    const decoded = jwt.verify(refreshToken, JWT_SECRET)
    return !!decoded
  } catch (error) {
    return false
  }
}

// Função para validar força da senha
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  // Comprimento mínimo
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Senha deve ter pelo menos 8 caracteres')
  }

  // Letras minúsculas
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Adicione letras minúsculas')
  }

  // Letras maiúsculas
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Adicione letras maiúsculas')
  }

  // Números
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Adicione números')
  }

  // Caracteres especiais
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
  } else {
    feedback.push('Adicione caracteres especiais')
  }

  // Sequências comuns
  const commonSequences = ['123456', 'abcdef', 'qwerty', 'password']
  const hasCommonSequence = commonSequences.some(seq =>
    password.toLowerCase().includes(seq)
  )

  if (hasCommonSequence) {
    score -= 2
    feedback.push('Evite sequências comuns')
  }

  return {
    isValid: score >= 4 && !hasCommonSequence,
    score: Math.max(0, score),
    feedback,
  }
}

// Rate limiting simples (em produção, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}

// Limpar registros de rate limit expirados
export function cleanupRateLimit(): void {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Executar limpeza a cada 5 minutos
setInterval(cleanupRateLimit, 5 * 60 * 1000)
