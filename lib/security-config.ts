// Configurações centralizadas de segurança

export const SECURITY_CONFIG = {
  // Rate Limiting
  RATE_LIMITS: {
    // Limites por endpoint
    API_DEFAULT: {
      maxRequests: 100,
      windowMs: 60000, // 1 minuto
      blockDurationMs: 300000, // 5 minutos
    },
    API_AUTH: {
      maxRequests: 5,
      windowMs: 60000,
      blockDurationMs: 900000, // 15 minutos
    },
    API_SENSITIVE: {
      maxRequests: 10,
      windowMs: 60000,
      blockDurationMs: 600000, // 10 minutos
    },
    WEB_PAGES: {
      maxRequests: 200,
      windowMs: 60000,
      blockDurationMs: 60000, // 1 minuto
    },
  },

  // Content Security Policy
  CSP: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Necessário para Next.js em desenvolvimento
      "'unsafe-eval'", // Necessário para Next.js em desenvolvimento
      'https://vercel.live',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Necessário para styled-components
      'https://fonts.googleapis.com',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': [
      "'self'",
      'https://www.google-analytics.com',
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },

  // Headers de Segurança
  SECURITY_HEADERS: {
    // HSTS - HTTP Strict Transport Security
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Prevenir clickjacking
    'X-Frame-Options': 'DENY',

    // Prevenir MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // XSS Protection
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', '),

    // Cross-Origin Policies
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  },

  // Configurações de Validação
  VALIDATION: {
    // Limites de entrada
    MAX_INPUT_LENGTH: 10000,
    MAX_EMAIL_LENGTH: 254,
    MAX_NAME_LENGTH: 100,
    MAX_PHONE_LENGTH: 20,

    // Padrões permitidos
    ALLOWED_FILE_TYPES: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/plain',
    ],

    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

    // Configurações médicas específicas
    MEDICAL_RANGES: {
      AGE: { min: 0, max: 150 },
      WEIGHT: { min: 0.5, max: 1000 }, // kg
      HEIGHT: { min: 30, max: 300 }, // cm
      BLOOD_PRESSURE_SYSTOLIC: { min: 50, max: 300 },
      BLOOD_PRESSURE_DIASTOLIC: { min: 30, max: 200 },
      HEART_RATE: { min: 30, max: 250 }, // bpm
      TEMPERATURE: { min: 30, max: 45 }, // °C
    },
  },

  // Configurações de Auditoria
  AUDIT: {
    // Tipos de eventos para log
    LOG_EVENTS: [
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE',
      'PASSWORD_CHANGE',
      'DATA_ACCESS',
      'DATA_MODIFICATION',
      'SECURITY_VIOLATION',
      'RATE_LIMIT_EXCEEDED',
      'SUSPICIOUS_ACTIVITY',
    ],

    // Retenção de logs
    LOG_RETENTION_DAYS: 90,

    // Níveis de severidade
    SEVERITY_LEVELS: {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
    },

    // Alertas automáticos
    AUTO_ALERT_THRESHOLDS: {
      CRITICAL_EVENTS_PER_HOUR: 5,
      HIGH_EVENTS_PER_HOUR: 20,
      FAILED_LOGINS_PER_IP: 10,
      SUSPICIOUS_PATTERNS_PER_IP: 15,
    },
  },

  // Configurações de Sessão
  SESSION: {
    // Duração da sessão
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 horas

    // Renovação automática
    REFRESH_THRESHOLD: 2 * 60 * 60 * 1000, // 2 horas antes do vencimento

    // Configurações de cookie
    COOKIE_OPTIONS: {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict' as const,
      path: '/',
    },
  },

  // Configurações de Criptografia
  CRYPTO: {
    // Algoritmos permitidos
    ALLOWED_ALGORITHMS: ['aes-256-gcm', 'aes-256-cbc'],

    // Configurações de hash
    HASH_ROUNDS: 12,

    // Configurações de JWT
    JWT_ALGORITHM: 'HS256' as const,
    JWT_EXPIRATION: '24h',
  },

  // Endpoints sensíveis que requerem proteção extra
  SENSITIVE_ENDPOINTS: [
    '/api/auth/login',
    '/api/auth/register',
    '/api/unified-system/patients',
    '/api/appointments',
    '/api/users',
    '/api/reports',
    '/api/security/report',
  ],

  // IPs e User-Agents bloqueados
  BLOCKED: {
    IPS: [
      // Adicionar IPs maliciosos conhecidos
    ],
    USER_AGENTS: [
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
    ],
  },

  // Configurações de ambiente
  ENVIRONMENT: {
    IS_PRODUCTION: process.env['NODE_ENV'] === 'production',
    IS_DEVELOPMENT: process.env['NODE_ENV'] === 'development',

    // Features habilitadas por ambiente
    FEATURES: {
      DETAILED_ERROR_MESSAGES: process.env['NODE_ENV'] === 'development',
      SECURITY_LOGGING: true,
      RATE_LIMITING: true,
      INPUT_VALIDATION: true,
      AUDIT_TRAIL: true,
    },
  },
}

// Função para obter configuração de rate limit por endpoint
export function getRateLimitConfig(endpoint: string) {
  if (endpoint.includes('/api/auth/')) {
    return SECURITY_CONFIG.RATE_LIMITS.API_AUTH
  }

  if (
    SECURITY_CONFIG.SENSITIVE_ENDPOINTS.some(sensitive =>
      endpoint.includes(sensitive)
    )
  ) {
    return SECURITY_CONFIG.RATE_LIMITS.API_SENSITIVE
  }

  if (endpoint.startsWith('/api/')) {
    return SECURITY_CONFIG.RATE_LIMITS.API_DEFAULT
  }

  return SECURITY_CONFIG.RATE_LIMITS.WEB_PAGES
}

// Função para gerar CSP header
export function generateCSPHeader(): string {
  const csp = SECURITY_CONFIG.CSP
  const directives = Object.entries(csp).map(([directive, sources]) => {
    if (Array.isArray(sources)) {
      return `${directive} ${sources.join(' ')}`
    }
    return `${directive} ${sources}`
  })

  return directives.join('; ')
}

// Função para verificar se um endpoint é sensível
export function isSensitiveEndpoint(endpoint: string): boolean {
  return SECURITY_CONFIG.SENSITIVE_ENDPOINTS.some(sensitive =>
    endpoint.includes(sensitive)
  )
}

// Função para verificar se um User-Agent está bloqueado
export function isBlockedUserAgent(userAgent: string): boolean {
  return SECURITY_CONFIG.BLOCKED.USER_AGENTS.some(pattern =>
    pattern.test(userAgent)
  )
}

export default SECURITY_CONFIG

