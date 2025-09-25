import { NextRequest, NextResponse } from 'next/server'
import { BackupService } from '@/lib/backup-service'
import { withAuth, requireAdmin } from '@/lib/auth-middleware'
import { AuditService } from '@/lib/database'
import { z } from 'zod'

const RestoreSchema = z.object({
  backupId: z.string().min(1, 'ID do backup é obrigatório'),
})

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  return realIP || 'unknown'
}

// Restaurar backup
export const POST = requireAdmin(async (request: NextRequest, authContext) => {
  try {
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Parse do corpo da requisição
    const body = await request.json()

    // Validação dos dados
    const validation = RestoreSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          errors: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { backupId } = validation.data

    // Log crítico de tentativa de restauração
    await AuditService.log({
      userId: authContext.user.id,
      action: 'DATABASE_RESTORE_REQUESTED',
      resource: 'Database',
      details: JSON.stringify({
        backupId,
        requestedBy: authContext.user.email,
        warning: 'OPERAÇÃO CRÍTICA - PODE SOBRESCREVER DADOS EXISTENTES',
      }),
      severity: 'CRITICAL',
      ipAddress: clientIP,
      userAgent,
    })

    // Verificar integridade do backup antes de restaurar
    const verificationResult = await BackupService.verifyBackup(backupId)

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: verificationResult.error || 'Erro ao verificar backup',
        },
        { status: 400 }
      )
    }

    if (!verificationResult.valid) {
      await AuditService.log({
        userId: authContext.user.id,
        action: 'DATABASE_RESTORE_FAILED_INVALID_BACKUP',
        resource: 'Database',
        details: JSON.stringify({
          backupId,
          reason: 'Backup inválido ou corrompido',
        }),
        severity: 'HIGH',
        ipAddress: clientIP,
        userAgent,
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Backup inválido ou corrompido',
        },
        { status: 400 }
      )
    }

    // Executar restauração
    const result = await BackupService.restoreBackup(backupId)

    if (result.success) {
      // Log de sucesso crítico
      await AuditService.log({
        userId: authContext.user.id,
        action: 'DATABASE_RESTORE_COMPLETED',
        resource: 'Database',
        details: JSON.stringify({
          backupId,
          restoredBy: authContext.user.email,
          timestamp: new Date().toISOString(),
        }),
        severity: 'CRITICAL',
        ipAddress: clientIP,
        userAgent,
      })

      return NextResponse.json({
        success: true,
        message: 'Backup restaurado com sucesso',
        backupId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Erro ao restaurar backup',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro na API de restauração:', error)

    await AuditService.log({
      userId: authContext.user.id,
      action: 'DATABASE_RESTORE_ERROR',
      resource: 'Database',
      details: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        requestedBy: authContext.user.email,
      }),
      severity: 'CRITICAL',
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
})
