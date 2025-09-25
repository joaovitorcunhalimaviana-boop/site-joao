import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { LGPDAuditService, LGPDProtectionMiddleware } from './lgpd-encryption'

// ================================
// MIDDLEWARE LGPD PARA NEXT.JS
// ================================

export interface LGPDContext {
  userId?: string
  ipAddress?: string
  userAgent?: string
  purpose?: string
  legalBasis?: string
}

// Extrair informações do contexto da requisição
export function extractLGPDContext(request: NextRequest): LGPDContext {
  const authHeader = request.headers.get('authorization')
  let userId: string | undefined

  // Extrair userId do JWT se disponível
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)
      const decoded = verify(token, process.env['JWT_SECRET']!) as any
      userId = decoded.userId
    } catch (error) {
      // Token inválido, continuar sem userId
    }
  }

  // Extrair IP (considerando proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const ipAddress = forwarded
    ? forwarded.split(',')[0].trim()
    : request.headers.get('x-real-ip') || 'unknown'

  const userAgent = request.headers.get('user-agent') || 'unknown'

  return {
    userId,
    ipAddress,
    userAgent,
  }
}

// Middleware para auditoria automática de acesso a dados
export function withLGPDAudit(
  handler: (
    request: NextRequest,
    context: LGPDContext
  ) => Promise<NextResponse>,
  options: {
    dataType: string
    purpose: string
    legalBasis: string
    requiresAuth?: boolean
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = extractLGPDContext(request)

    // Verificar autenticação se necessário
    if (options.requiresAuth && !context.userId) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      )
    }

    try {
      // Executar handler
      const response = await handler(request, {
        ...context,
        purpose: options.purpose,
        legalBasis: options.legalBasis,
      })

      // Log de auditoria se foi bem-sucedido e há userId
      if (context.userId && response.status < 400) {
        const url = new URL(request.url)
        const resourceId = url.pathname.split('/').pop() || 'unknown'

        await LGPDAuditService.logDataAccess({
          userId: context.userId,
          dataSubject: resourceId,
          dataType: options.dataType,
          purpose: options.purpose,
          legalBasis: options.legalBasis,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        })
      }

      return response
    } catch (error) {
      console.error('Erro no middleware LGPD:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }
}

// Middleware para verificação de consentimento
export function withConsentCheck(
  handler: (
    request: NextRequest,
    context: LGPDContext
  ) => Promise<NextResponse>,
  purpose: string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const context = extractLGPDContext(request)

    if (context.userId) {
      const hasConsent = await LGPDProtectionMiddleware.checkConsent(
        context.userId,
        purpose
      )

      if (!hasConsent) {
        return NextResponse.json(
          {
            error: 'Consentimento necessário',
            code: 'CONSENT_REQUIRED',
            purpose,
          },
          { status: 403 }
        )
      }
    }

    return handler(request, context)
  }
}

// Middleware para minimização de dados
export function withDataMinimization<T>(
  data: T,
  allowedFields: string[],
  userRole?: string
): Partial<T> {
  // Campos adicionais baseados no papel do usuário
  const roleBasedFields: Record<string, string[]> = {
    admin: ['*'], // Admin pode ver tudo
    doctor: ['name', 'cpf', 'email', 'phone', 'medicalHistory'],
    nurse: ['name', 'phone', 'appointments'],
    receptionist: ['name', 'phone', 'appointments'],
  }

  let finalAllowedFields = allowedFields

  if (userRole && roleBasedFields[userRole]) {
    const roleFields = roleBasedFields[userRole]
    if (roleFields.includes('*')) {
      // Admin pode ver tudo
      return data
    }
    finalAllowedFields = [...allowedFields, ...roleFields]
  }

  return LGPDProtectionMiddleware.minimizeData(
    data as Record<string, any>,
    finalAllowedFields
  ) as Partial<T>
}

// Middleware para verificação de retenção de dados
export async function checkDataRetention(
  resourceType: string,
  resourceId: string,
  retentionPeriodDays: number = 2555 // ~7 anos para dados médicos
): Promise<boolean> {
  try {
    let createdAt: Date | null = null

    // Buscar data de criação baseada no tipo de recurso
    switch (resourceType) {
      case 'patient':
        const patient = await prisma.patient.findUnique({
          where: { id: resourceId },
          select: { createdAt: true },
        })
        createdAt = patient?.createdAt || null
        break

      case 'consultation':
        const consultation = await prisma.consultation.findUnique({
          where: { id: resourceId },
          select: { createdAt: true },
        })
        createdAt = consultation?.createdAt || null
        break

      case 'medicalRecord':
        const record = await prisma.medicalRecord.findUnique({
          where: { id: resourceId },
          select: { createdAt: true },
        })
        createdAt = record?.createdAt || null
        break
    }

    if (!createdAt) return false

    return LGPDProtectionMiddleware.shouldRetainData(
      createdAt,
      retentionPeriodDays
    )
  } catch (error) {
    console.error('Erro ao verificar retenção de dados:', error)
    return true // Em caso de erro, manter os dados por segurança
  }
}

// Decorator para rotas que processam dados pessoais
export function LGPDRoute(options: {
  dataType: string
  purpose: string
  legalBasis: string
  requiresAuth?: boolean
  requiresConsent?: boolean
  minimizeFields?: string[]
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (request: NextRequest, ...args: any[]) {
      const context = extractLGPDContext(request)

      // Verificar autenticação
      if (options.requiresAuth && !context.userId) {
        return NextResponse.json(
          { error: 'Acesso não autorizado' },
          { status: 401 }
        )
      }

      // Verificar consentimento
      if (options.requiresConsent && context.userId) {
        const hasConsent = await LGPDProtectionMiddleware.checkConsent(
          context.userId,
          options.purpose
        )

        if (!hasConsent) {
          return NextResponse.json(
            {
              error: 'Consentimento necessário',
              code: 'CONSENT_REQUIRED',
              purpose: options.purpose,
            },
            { status: 403 }
          )
        }
      }

      try {
        // Executar método original
        let result = await originalMethod.call(this, request, context, ...args)

        // Aplicar minimização de dados se especificado
        if (options.minimizeFields && result.data) {
          result.data = withDataMinimization(
            result.data,
            options.minimizeFields
          )
        }

        // Log de auditoria
        if (context.userId && result.status < 400) {
          const url = new URL(request.url)
          const resourceId = url.pathname.split('/').pop() || 'unknown'

          await LGPDAuditService.logDataAccess({
            userId: context.userId,
            dataSubject: resourceId,
            dataType: options.dataType,
            purpose: options.purpose,
            legalBasis: options.legalBasis,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          })
        }

        return result
      } catch (error) {
        console.error('Erro na rota LGPD:', error)
        return NextResponse.json(
          { error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    }

    return descriptor
  }
}

// Utilitário para headers de resposta LGPD
export function addLGPDHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Data-Protection', 'LGPD-Compliant')
  response.headers.set('X-Privacy-Policy', '/privacy-policy')
  response.headers.set('X-Data-Controller', 'Sistema Médico LGPD')
  return response
}

// Importar prisma para uso nas funções
import { prisma } from './database'
