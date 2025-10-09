import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from './database'

interface RateLimitConfig {
  windowMs: number // Janela de tempo em milissegundos
  maxRequests: number // Máximo de requests por janela
  blockDurationMs?: number // Duração do bloqueio após exceder limite
  skipSuccessfulRequests?: boolean // Não contar requests bem-sucedidos
  keyGenerator?: (request: NextRequest) => string // Função para gerar chave única
}

interface RateLimitEntry {
  count: number
  resetTime: number
  blocked: boolean
  firstRequest: number
}

// Armazenamento em memória para rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Configurações predefinidas para diferentes tipos de endpoints
export const RATE_LIMIT_CONFIGS = {
  // Autenticação - muito restritivo
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    blockDurationMs: 30 * 60 * 1000, // 30 minutos de bloqueio
  } as RateLimitConfig,

  // Endpoints críticos de dados médicos
  MEDICAL_DATA: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 50,
    blockDurationMs: 10 * 60 * 1000, // 10 minutos de bloqueio
  } as RateLimitConfig,

  // APIs de pacientes
  PATIENTS: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 30,
    blockDurationMs: 5 * 60 * 1000, // 5 minutos de bloqueio
  } as RateLimitConfig,

  // APIs de consultas/agendamentos
  APPOINTMENTS: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 20,
    blockDurationMs: 5 * 60 * 1000, // 5 minutos de bloqueio
  } as RateLimitConfig,

  // APIs administrativas
  ADMIN: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 100,
    blockDurationMs: 15 * 60 * 1000, // 15 minutos de bloqueio
  } as RateLimitConfig,

  // APIs de backup e operações críticas
  BACKUP: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 5,
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 horas de bloqueio
  } as RateLimitConfig,

  // APIs de notificações
  NOTIFICATIONS: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 10,
    blockDurationMs: 5 * 60 * 1000, // 5 minutos de bloqueio
  } as RateLimitConfig,

  // APIs públicas (reviews, etc)
  PUBLIC: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 15,
    blockDurationMs: 2 * 60 * 1000, // 2 minutos de bloqueio
  } as RateLimitConfig,

  // Default para outros endpoints
  DEFAULT: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 60,
    blockDurationMs: 1 * 60 * 1000, // 1 minuto de bloqueio
  } as RateLimitConfig,
}

/**
 * Extrai o IP do cliente da requisição
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  if (cfConnectingIP) return cfConnectingIP
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP

  return 'unknown'
}

/**
 * Gera chave única para rate limiting baseada em IP e endpoint
 */
function generateRateLimitKey(
  request: NextRequest,
  config: RateLimitConfig
): string {
  if (config.keyGenerator) {
    return config.keyGenerator(request)
  }

  const ip = getClientIP(request)
  const pathname = new URL(request.url).pathname
  return `${ip}:${pathname}`
}

/**
 * Verifica se a requisição deve ser limitada
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const now = Date.now()
  const key = generateRateLimitKey(request, config)

  const entry = rateLimitStore.get(key)

  // Primeira requisição ou janela expirou
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false,
      firstRequest: now,
    })

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
    }
  }

  // Verificar se ainda está bloqueado
  if (entry.blocked) {
    const blockEndTime =
      entry.firstRequest + (config.blockDurationMs || config.windowMs)
    if (now < blockEndTime) {
      return {
        allowed: false,
        retryAfter: Math.ceil((blockEndTime - now) / 1000),
      }
    } else {
      // Bloqueio expirou, resetar
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        blocked: false,
        firstRequest: now,
      })
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
      }
    }
  }

  // Verificar se excedeu o limite
  if (entry.count >= config.maxRequests) {
    entry.blocked = true
    const blockDuration = config.blockDurationMs || config.windowMs

    return {
      allowed: false,
      retryAfter: Math.ceil(blockDuration / 1000),
    }
  }

  // Incrementar contador
  entry.count++

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
  }
}

/**
 * Middleware de rate limiting para aplicar em rotas
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig,
  options: {
    auditAction?: string
    resourceName?: string
    skipAudit?: boolean
  } = {}
): Promise<NextResponse | null> {
  const result = checkRateLimit(request, config)

  if (!result.allowed) {
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const pathname = new URL(request.url).pathname

    // Registrar tentativa de rate limit excedido
    if (!options.skipAudit) {
      await AuditService.log({
        action: options.auditAction || 'RATE_LIMIT_EXCEEDED',
        resource: options.resourceName || pathname,
        details: JSON.stringify({
          ip: clientIP,
          endpoint: pathname,
          retryAfter: result.retryAfter,
        }),
        severity: 'HIGH',
        ipAddress: clientIP,
        userAgent,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Muitas requisições. Tente novamente mais tarde.',
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': result.retryAfter?.toString() || '60',
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(
            Date.now() + (result.retryAfter || 60) * 1000
          ).toISOString(),
        },
      }
    )
  }

  // Adicionar headers informativos
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
  response.headers.set(
    'X-RateLimit-Remaining',
    (result.remaining || 0).toString()
  )

  return null // Permitir continuar
}

/**
 * Função helper para aplicar rate limiting em handlers de API
 */
export async function withRateLimit<T>(
  request: NextRequest,
  config: RateLimitConfig,
  handler: () => Promise<T>,
  options: {
    auditAction?: string
    resourceName?: string
    skipAudit?: boolean
  } = {}
): Promise<T | NextResponse> {
  const rateLimitResponse = await rateLimitMiddleware(request, config, options)

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  return handler()
}

/**
 * Limpar entradas antigas do rate limiter (executar periodicamente)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  const expiredKeys: string[] = []

  for (const [key, entry] of rateLimitStore.entries()) {
    // Remover entradas que expiraram há mais de 1 hora
    if (now > entry.resetTime + 60 * 60 * 1000) {
      expiredKeys.push(key)
    }
  }

  expiredKeys.forEach(key => rateLimitStore.delete(key))

  console.log(
    `🧹 Rate limiter cleanup: removidas ${expiredKeys.length} entradas expiradas`
  )
}

/**
 * Obter estatísticas do rate limiter
 */
export function getRateLimitStats(): {
  totalEntries: number
  blockedEntries: number
  activeEntries: number
} {
  const now = Date.now()
  let blockedCount = 0
  let activeCount = 0

  for (const entry of rateLimitStore.values()) {
    if (entry.blocked) {
      blockedCount++
    }
    if (now <= entry.resetTime) {
      activeCount++
    }
  }

  return {
    totalEntries: rateLimitStore.size,
    blockedEntries: blockedCount,
    activeEntries: activeCount,
  }
}

// Executar limpeza a cada 30 minutos
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimitStore, 30 * 60 * 1000)
}
