// Utilitários para sistema de notificações
// Inclui retry logic, rate limiting, validações LGPD e logging estruturado

import { AuditService } from './database'

// ===========================
// CONFIGURAÇÃO E VALIDAÇÃO
// ===========================

export interface NotificationConfig {
  telegramBotToken?: string
  telegramChatId?: string
  whatsappToken?: string
  whatsappPhoneId?: string
  doctorName?: string
  retryAttempts?: number
  retryDelay?: number
}

/**
 * Valida e carrega configurações de notificação
 */
export function loadNotificationConfig(): NotificationConfig {
  const config: NotificationConfig = {
    telegramBotToken: process.env['TELEGRAM_BOT_TOKEN'],
    telegramChatId: process.env['TELEGRAM_CHAT_ID'],
    whatsappToken: process.env['WHATSAPP_TOKEN'],
    whatsappPhoneId: process.env['WHATSAPP_PHONE_ID'],
    doctorName: process.env['DOCTOR_NAME'] || 'Dr. João Vítor Viana',
    retryAttempts: 3,
    retryDelay: 2000, // 2 segundos entre tentativas
  }

  return config
}

/**
 * Verifica se o Telegram está configurado
 */
export function isTelegramConfigured(config?: NotificationConfig): boolean {
  const cfg = config || loadNotificationConfig()
  return !!(cfg.telegramBotToken && cfg.telegramChatId)
}

/**
 * Verifica se o WhatsApp está configurado
 */
export function isWhatsAppConfigured(config?: NotificationConfig): boolean {
  const cfg = config || loadNotificationConfig()
  return !!(cfg.whatsappToken && cfg.whatsappPhoneId)
}

// ===========================
// VALIDAÇÃO DE PREFERÊNCIAS LGPD
// ===========================

export interface CommunicationPreferences {
  emailSubscribed?: boolean
  emailAppointments?: boolean
  emailReminders?: boolean
  emailPromotions?: boolean
  whatsappSubscribed?: boolean
  whatsappAppointments?: boolean
  whatsappReminders?: boolean
  whatsappPromotions?: boolean
}

export type NotificationType =
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'newsletter'
  | 'promotion'
  | 'health_tip'

/**
 * Verifica se o paciente consentiu receber determinado tipo de notificação
 */
export function hasConsent(
  preferences: CommunicationPreferences,
  notificationType: NotificationType,
  channel: 'email' | 'whatsapp'
): boolean {
  // Verificar se está inscrito no canal
  if (channel === 'email' && !preferences.emailSubscribed) {
    return false
  }
  if (channel === 'whatsapp' && !preferences.whatsappSubscribed) {
    return false
  }

  // Verificar preferências específicas por tipo de notificação
  switch (notificationType) {
    case 'appointment_confirmation':
    case 'appointment_reminder':
      return channel === 'email'
        ? preferences.emailAppointments ?? true
        : preferences.whatsappAppointments ?? true

    case 'newsletter':
    case 'health_tip':
      return channel === 'email'
        ? preferences.emailReminders ?? false
        : preferences.whatsappReminders ?? false

    case 'promotion':
      return channel === 'email'
        ? preferences.emailPromotions ?? false
        : preferences.whatsappPromotions ?? false

    default:
      return false
  }
}

// ===========================
// RETRY LOGIC
// ===========================

export interface RetryOptions {
  maxAttempts?: number
  delayMs?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: Error) => void
}

/**
 * Executa uma função com retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 2000,
    backoffMultiplier = 1.5,
    onRetry,
  } = options

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1)

        if (onRetry) {
          onRetry(attempt, lastError)
        }

        console.warn(
          `⚠️ Tentativa ${attempt}/${maxAttempts} falhou. Tentando novamente em ${delay}ms...`,
          lastError.message
        )

        await sleep(delay)
      }
    }
  }

  throw lastError || new Error('Falha após múltiplas tentativas')
}

/**
 * Função auxiliar para aguardar
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ===========================
// RATE LIMITING
// ===========================

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Verifica rate limit para notificações
 */
export function checkNotificationRateLimit(
  identifier: string,
  maxPerMinute: number = 10
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const key = `notification:${identifier}`

  const entry = rateLimitStore.get(key)

  // Primeira requisição ou janela expirou
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + 60000, // 1 minuto
    })
    return { allowed: true }
  }

  // Verificar se excedeu o limite
  if (entry.count >= maxPerMinute) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  // Incrementar contador
  entry.count++
  return { allowed: true }
}

// ===========================
// LOGGING ESTRUTURADO
// ===========================

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'

export interface NotificationLog {
  level: LogLevel
  channel: 'telegram' | 'whatsapp' | 'email'
  notificationType: NotificationType
  recipient?: string
  message: string
  error?: string
  metadata?: Record<string, any>
  timestamp: string
}

/**
 * Registra evento de notificação com estrutura padronizada
 */
export async function logNotification(log: NotificationLog): Promise<void> {
  const timestamp = new Date().toISOString()
  const logData = { ...log, timestamp }

  // Log no console com formatação
  const emoji = {
    INFO: 'ℹ️',
    WARN: '⚠️',
    ERROR: '❌',
    SUCCESS: '✅',
  }[log.level]

  console.log(
    `${emoji} [${log.channel.toUpperCase()}] ${log.notificationType}: ${log.message}`,
    log.metadata ? JSON.stringify(log.metadata) : ''
  )

  // Registrar em audit log se for erro ou warning
  if (log.level === 'ERROR' || log.level === 'WARN') {
    try {
      await AuditService.log({
        action: `NOTIFICATION_${log.level}`,
        resource: `notification_${log.channel}`,
        details: JSON.stringify({
          notificationType: log.notificationType,
          recipient: log.recipient,
          message: log.message,
          error: log.error,
          metadata: log.metadata,
        }),
        severity: log.level === 'ERROR' ? 'HIGH' : 'MEDIUM',
      })
    } catch (auditError) {
      console.error('Erro ao registrar em audit log:', auditError)
    }
  }
}

// ===========================
// VALIDAÇÃO DE DADOS
// ===========================

/**
 * Valida formato de WhatsApp
 */
export function isValidWhatsApp(whatsapp: string): boolean {
  if (!whatsapp) return false
  const cleaned = whatsapp.replace(/\D/g, '')
  // Brasil: 11 dígitos (2 DDD + 9 número)
  return cleaned.length >= 10 && cleaned.length <= 13
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitiza WhatsApp para formato internacional
 */
export function sanitizeWhatsApp(whatsapp: string): string {
  const cleaned = whatsapp.replace(/\D/g, '')
  // Se não tem código do país, adicionar 55 (Brasil)
  if (cleaned.length === 11 || cleaned.length === 10) {
    return `55${cleaned}`
  }
  return cleaned
}

// ===========================
// ERROR HANDLING
// ===========================

export class NotificationError extends Error {
  constructor(
    message: string,
    public channel: 'telegram' | 'whatsapp' | 'email',
    public originalError?: Error
  ) {
    super(message)
    this.name = 'NotificationError'
  }
}

/**
 * Trata erros de notificação de forma padronizada
 */
export async function handleNotificationError(
  error: Error,
  context: {
    channel: 'telegram' | 'whatsapp' | 'email'
    notificationType: NotificationType
    recipient?: string
  }
): Promise<void> {
  await logNotification({
    level: 'ERROR',
    channel: context.channel,
    notificationType: context.notificationType,
    recipient: context.recipient,
    message: 'Falha ao enviar notificação',
    error: error.message,
    metadata: {
      errorName: error.name,
      errorStack: error.stack,
    },
  })
}

// ===========================
// CLEANUP
// ===========================

/**
 * Limpa entradas antigas do rate limiter
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  const expiredKeys: string[] = []

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime + 60000) {
      expiredKeys.push(key)
    }
  }

  expiredKeys.forEach(key => rateLimitStore.delete(key))

  if (expiredKeys.length > 0) {
    console.log(
      `🧹 Notification rate limiter cleanup: ${expiredKeys.length} entradas removidas`
    )
  }
}

// Executar limpeza a cada 5 minutos
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}
