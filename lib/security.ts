import DOMPurify from 'isomorphic-dompurify'

// Sanitização de strings para prevenir XSS
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: sanitização básica
    return dirty
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // Client-side: usar DOMPurify
  return DOMPurify.sanitize(dirty)
}

// Sanitização de input de texto simples
export function sanitizeText(input: string): string {
  return input.trim().replace(/[<>"'&]/g, match => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
    }
    return entities[match] || match
  })
}

// Validação de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Validação de telefone brasileiro
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, '')
  return /^\d{10,11}$/.test(cleanPhone)
}

// Validação de email (alias para compatibilidade)
export function validateEmail(email: string): boolean {
  return isValidEmail(email)
}

// Sanitização de dados médicos
export function sanitizeMedicalFormData(
  data: Record<string, any>
): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMedicalFormData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// Validação de CPF
export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '')

  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }

  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0

  return remainder === parseInt(cleanCPF.charAt(10))
}

// Rate limiting simples (em memória)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowStart = now - windowMs

  // Limpar entradas antigas
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }

  const current = rateLimitMap.get(identifier)

  if (!current || current.resetTime < now) {
    // Nova janela de tempo
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    }
  }

  current.count++
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime,
  }
}

// Validação de dados médicos
export const medicalValidators = {
  weight: (value: number): boolean => value > 0 && value <= 1000,
  height: (value: number): boolean => value > 0 && value <= 300,
  age: (value: number): boolean => value >= 0 && value <= 150,
  bloodPressure: {
    systolic: (value: number): boolean => value >= 50 && value <= 300,
    diastolic: (value: number): boolean => value >= 30 && value <= 200,
  },
  heartRate: (value: number): boolean => value >= 30 && value <= 250,
  temperature: (value: number): boolean => value >= 30 && value <= 45,
}

// Sanitização de dados de formulário médico
export function sanitizeMedicalForm(
  data: Record<string, any>
): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    } else if (typeof value === 'number') {
      // Validar números médicos
      if (key === 'weight' && !medicalValidators.weight(value)) {
        throw new Error(`Peso inválido: ${value}`)
      }
      if (key === 'height' && !medicalValidators.height(value)) {
        throw new Error(`Altura inválida: ${value}`)
      }
      if (key === 'age' && !medicalValidators.age(value)) {
        throw new Error(`Idade inválida: ${value}`)
      }
      sanitized[key] = value
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// Geração de tokens seguros
export function generateSecureToken(length: number = 32): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    )
  }

  // Fallback para Node.js
  const crypto = require('crypto')
  return crypto.randomBytes(length).toString('hex')
}

// Validação de sessão
export function validateSession(token: string): boolean {
  // Implementar validação de token JWT ou similar
  return token.length >= 32 && /^[a-f0-9]+$/i.test(token)
}

export default {
  sanitizeHtml,
  sanitizeText,
  isValidEmail,
  isValidPhone,
  isValidCPF,
  checkRateLimit,
  medicalValidators,
  sanitizeMedicalForm,
  generateSecureToken,
  validateSession,
}
