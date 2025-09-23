import { NextRequest } from 'next/server'
import { sanitizeHtml, sanitizeText, checkRateLimit } from './security'

// Interface para logs de segurança
interface SecurityLog {
  timestamp: string
  type:
    | 'XSS_ATTEMPT'
    | 'SQL_INJECTION'
    | 'BRUTE_FORCE'
    | 'SUSPICIOUS_ACTIVITY'
    | 'RATE_LIMIT_EXCEEDED'
  ip: string
  userAgent: string
  path: string
  payload?: any
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

// Armazenamento em memória para logs (em produção, usar banco de dados)
const securityLogs: SecurityLog[] = []

// Função para registrar eventos de segurança
export function logSecurityEvent(event: Omit<SecurityLog, 'timestamp'>): void {
  const log: SecurityLog = {
    ...event,
    timestamp: new Date().toISOString(),
  }

  securityLogs.push(log)

  // Manter apenas os últimos 1000 logs em memória
  if (securityLogs.length > 1000) {
    securityLogs.shift()
  }

  // Log crítico no console
  if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
    console.error(
      `[SECURITY ALERT] ${event.type}: ${event.ip} - ${event.path}`,
      event.payload
    )
  }
}

// Validação avançada de entrada
export class InputValidator {
  // Padrões maliciosos conhecidos
  private static readonly MALICIOUS_PATTERNS = {
    xss: [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi,
      /vbscript:/gi,
      /expression\s*\(/gi,
    ],
    sqlInjection: [
      /(union|select|insert|delete|update|drop|create|alter|exec|execute)\s+/gi,
      /('|(\-\-)|(;)|(\||\|)|(\*|\*))/gi,
      /\b(or|and)\s+\d+\s*=\s*\d+/gi,
      /\b(or|and)\s+['"]\w+['"]\s*=\s*['"]\w+['"]/gi,
    ],
    pathTraversal: [
      /\.\.\/|\.\.\\/gi,
      /%2e%2e%2f|%2e%2e%5c/gi,
      /\.\.%2f|\.\.%5c/gi,
    ],
    commandInjection: [
      /[;&|`$(){}\[\]]/gi,
      /\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ping|wget|curl)\b/gi,
    ],
  }

  // Validar entrada contra padrões maliciosos
  static validateInput(
    input: string,
    context: string = 'general'
  ): {
    isValid: boolean
    threats: string[]
    sanitized: string
  } {
    const threats: string[] = []
    let sanitized = input

    // Verificar XSS
    if (this.MALICIOUS_PATTERNS.xss.some(pattern => pattern.test(input))) {
      threats.push('XSS_ATTEMPT')
      sanitized = sanitizeHtml(sanitized)
    }

    // Verificar SQL Injection
    if (
      this.MALICIOUS_PATTERNS.sqlInjection.some(pattern => pattern.test(input))
    ) {
      threats.push('SQL_INJECTION')
      sanitized = sanitizeText(sanitized)
    }

    // Verificar Path Traversal
    if (
      this.MALICIOUS_PATTERNS.pathTraversal.some(pattern => pattern.test(input))
    ) {
      threats.push('PATH_TRAVERSAL')
      sanitized = sanitized.replace(/\.\.\/|\.\.\\/g, '')
    }

    // Verificar Command Injection
    if (
      this.MALICIOUS_PATTERNS.commandInjection.some(pattern =>
        pattern.test(input)
      )
    ) {
      threats.push('COMMAND_INJECTION')
      sanitized = sanitized.replace(/[;&|`$(){}\[\]]/g, '')
    }

    return {
      isValid: threats.length === 0,
      threats,
      sanitized,
    }
  }

  // Validação específica para dados médicos
  static validateMedicalData(data: Record<string, any>): {
    isValid: boolean
    errors: string[]
    sanitized: Record<string, any>
  } {
    const errors: string[] = []
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        const validation = this.validateInput(value, 'medical')
        if (!validation.isValid) {
          errors.push(
            `Campo ${key} contém dados suspeitos: ${validation.threats.join(', ')}`
          )
        }
        sanitized[key] = validation.sanitized
      } else if (typeof value === 'number') {
        // Validar ranges médicos
        if (key === 'age' && (value < 0 || value > 150)) {
          errors.push('Idade inválida')
        }
        if (key === 'weight' && (value <= 0 || value > 1000)) {
          errors.push('Peso inválido')
        }
        if (key === 'height' && (value <= 0 || value > 300)) {
          errors.push('Altura inválida')
        }
        sanitized[key] = value
      } else {
        sanitized[key] = value
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized,
    }
  }
}

// Detector de atividade suspeita
export class ThreatDetector {
  private static readonly suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /nmap/i,
    /burp/i,
    /owasp/i,
    /acunetix/i,
    /w3af/i,
    /skipfish/i,
    /wpscan/i,
  ]

  private static readonly suspiciousPaths = [
    /\/admin/i,
    /\/wp-admin/i,
    /\/phpmyadmin/i,
    /\/config/i,
    /\/backup/i,
    /\/test/i,
    /\/debug/i,
    /\/api\/v1/i,
  ]

  static analyzeRequest(request: NextRequest): {
    isSuspicious: boolean
    threats: string[]
    riskScore: number
  } {
    const threats: string[] = []
    let riskScore = 0

    const userAgent = request.headers.get('user-agent') || ''
    const path = request.nextUrl.pathname
    const searchParams = request.nextUrl.searchParams.toString()

    // Verificar User-Agent suspeito
    if (this.suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
      threats.push('MALICIOUS_USER_AGENT')
      riskScore += 50
    }

    // Verificar caminhos suspeitos
    if (this.suspiciousPaths.some(pattern => pattern.test(path))) {
      threats.push('SUSPICIOUS_PATH')
      riskScore += 30
    }

    // Verificar parâmetros suspeitos
    const paramValidation = InputValidator.validateInput(searchParams)
    if (!paramValidation.isValid) {
      threats.push(...paramValidation.threats)
      riskScore += paramValidation.threats.length * 20
    }

    // Verificar ausência de User-Agent (possível bot)
    if (!userAgent) {
      threats.push('MISSING_USER_AGENT')
      riskScore += 10
    }

    // Verificar múltiplos headers suspeitos
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-originating-ip',
    ]
    const headerCount = suspiciousHeaders.filter(header =>
      request.headers.get(header)
    ).length
    if (headerCount > 2) {
      threats.push('MULTIPLE_PROXY_HEADERS')
      riskScore += 15
    }

    return {
      isSuspicious: riskScore >= 30,
      threats,
      riskScore,
    }
  }
}

// Sistema de rate limiting avançado
export class AdvancedRateLimit {
  private static readonly limits = new Map<
    string,
    {
      requests: number[]
      blocked: boolean
      blockUntil?: number
    }
  >()

  static checkLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000,
    blockDurationMs: number = 300000 // 5 minutos
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
    blocked: boolean
  } {
    const now = Date.now()
    const windowStart = now - windowMs

    let entry = this.limits.get(identifier)
    if (!entry) {
      entry = { requests: [], blocked: false }
      this.limits.set(identifier, entry)
    }

    // Verificar se ainda está bloqueado
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil,
        blocked: true,
      }
    }

    // Remover bloqueio se expirou
    if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
      entry.blocked = false
      entry.blockUntil = undefined
      entry.requests = []
    }

    // Limpar requests antigas
    entry.requests = entry.requests.filter(time => time > windowStart)

    // Verificar se excedeu o limite
    if (entry.requests.length >= maxRequests) {
      // Bloquear por período mais longo
      entry.blocked = true
      entry.blockUntil = now + blockDurationMs

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil,
        blocked: true,
      }
    }

    // Adicionar request atual
    entry.requests.push(now)

    return {
      allowed: true,
      remaining: maxRequests - entry.requests.length,
      resetTime: now + windowMs,
      blocked: false,
    }
  }

  // Limpar entradas antigas periodicamente
  static cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (
        entry.blocked &&
        entry.blockUntil &&
        now > entry.blockUntil + 3600000
      ) {
        // 1 hora após desbloqueio
        this.limits.delete(key)
      }
    }
  }
}

// Função para obter relatório de segurança
export function getSecurityReport(): {
  totalEvents: number
  eventsByType: Record<string, number>
  recentEvents: SecurityLog[]
  topThreats: Array<{ ip: string; count: number }>
} {
  const eventsByType: Record<string, number> = {}
  const ipCounts: Record<string, number> = {}

  securityLogs.forEach(log => {
    eventsByType[log.type] = (eventsByType[log.type] || 0) + 1
    ipCounts[log.ip] = (ipCounts[log.ip] || 0) + 1
  })

  const topThreats = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const recentEvents = securityLogs
    .slice(-50)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

  return {
    totalEvents: securityLogs.length,
    eventsByType,
    recentEvents,
    topThreats,
  }
}

// Middleware de segurança para APIs
export function securityMiddleware(request: NextRequest) {
  const clientIP =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  const userAgent = request.headers.get('user-agent') || ''
  const path = request.nextUrl.pathname

  // Análise de ameaças
  const threatAnalysis = ThreatDetector.analyzeRequest(request)

  if (threatAnalysis.isSuspicious) {
    logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      ip: clientIP,
      userAgent,
      path,
      payload: {
        threats: threatAnalysis.threats,
        riskScore: threatAnalysis.riskScore,
      },
      severity: threatAnalysis.riskScore >= 70 ? 'CRITICAL' : 'HIGH',
    })

    // Bloquear requests com risco muito alto
    if (threatAnalysis.riskScore >= 70) {
      return {
        blocked: true,
        reason: 'High risk activity detected',
        threats: threatAnalysis.threats,
      }
    }
  }

  // Rate limiting avançado
  const rateLimit = AdvancedRateLimit.checkLimit(
    `${clientIP}:${path}`,
    50,
    60000
  )

  if (!rateLimit.allowed) {
    logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      ip: clientIP,
      userAgent,
      path,
      payload: { blocked: rateLimit.blocked },
      severity: rateLimit.blocked ? 'HIGH' : 'MEDIUM',
    })

    return {
      blocked: true,
      reason: rateLimit.blocked
        ? 'IP temporarily blocked'
        : 'Rate limit exceeded',
      resetTime: rateLimit.resetTime,
    }
  }

  return {
    blocked: false,
    rateLimit,
  }
}

export default {
  InputValidator,
  ThreatDetector,
  AdvancedRateLimit,
  logSecurityEvent,
  getSecurityReport,
  securityMiddleware,
}
