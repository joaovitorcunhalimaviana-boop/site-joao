import { NextRequest, NextResponse } from 'next/server'
import { BackupService } from '@/lib/backup-service'
import { withAuth, requireAdmin } from '@/lib/auth-middleware'
import { AuditService } from '@/lib/database'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limiter'

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  return realIP || 'unknown'
}

// Criar backup manual
export const POST = requireAdmin(async (request: NextRequest, authContext) => {
  return withRateLimit(request, RATE_LIMIT_CONFIGS.BACKUP, async () => {
    try {
      const clientIP = getClientIP(request)
      const userAgent = request.headers.get('user-agent') || 'Unknown'

      // Log de início do backup manual
      await AuditService.log({
        userId: authContext.user.id,
        action: 'MANUAL_BACKUP_REQUESTED',
        resource: 'Backup',
        details: JSON.stringify({ requestedBy: authContext.user.email }),
        severity: 'MEDIUM',
        ipAddress: clientIP,
        userAgent,
      })

      // Executar backup
      const result = await BackupService.createBackup()

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Backup criado com sucesso',
          backup: {
            id: result.backupId,
            filePath: result.filePath,
            size: result.size,
          },
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Erro ao criar backup',
          },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error('❌ [Backup] Error creating manual backup:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
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
})

// Listar backups disponíveis
export const GET = requireAdmin(async (request: NextRequest, authContext) => {
  return withRateLimit(request, RATE_LIMIT_CONFIGS.BACKUP, async () => {
    try {
      const clientIP = getClientIP(request)
      const userAgent = request.headers.get('user-agent') || 'Unknown'

      // Log de acesso aos backups
      await AuditService.log({
        userId: authContext.user.id,
        action: 'BACKUP_LIST_ACCESSED',
        resource: 'Backup',
        details: JSON.stringify({ accessedBy: authContext.user.email }),
        severity: 'LOW',
        ipAddress: clientIP,
        userAgent,
      })

      const result = await BackupService.listBackups()

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Erro ao listar backups',
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        backups:
          result.backups?.map(backup => ({
            id: backup.id,
            filename: backup.fileName,
            size: backup.size,
            createdAt: backup.createdAt,
            type: backup.status,
          })) || [],
      })
    } catch (error) {
      console.error('❌ [Backup] Error listing backups:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
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
})

// Restaurar backup
export const PUT = requireAdmin(async (request: NextRequest, authContext) => {
  return withRateLimit(request, RATE_LIMIT_CONFIGS.BACKUP, async () => {
    try {
      const clientIP = getClientIP(request)
      const userAgent = request.headers.get('user-agent') || 'Unknown'
      const body = await request.json()

      if (!body.backupId) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID do backup é obrigatório',
          },
          { status: 400 }
        )
      }

      // Log de início da restauração
      await AuditService.log({
        userId: authContext.user.id,
        action: 'BACKUP_RESTORE_REQUESTED',
        resource: 'Backup',
        details: JSON.stringify({
          backupId: body.backupId,
          requestedBy: authContext.user.email,
        }),
        severity: 'HIGH',
        ipAddress: clientIP,
        userAgent,
      })

      const result = await BackupService.restoreBackup(body.backupId)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Backup restaurado com sucesso',
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
      console.error('❌ [Backup] Error restoring backup:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
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
})

// Deletar backup
export const DELETE = requireAdmin(
  async (request: NextRequest, authContext) => {
    return withRateLimit(request, RATE_LIMIT_CONFIGS.BACKUP, async () => {
      try {
        const clientIP = getClientIP(request)
        const userAgent = request.headers.get('user-agent') || 'Unknown'
        const { searchParams } = new URL(request.url)
        const backupId = searchParams.get('id')

        if (!backupId) {
          return NextResponse.json(
            {
              success: false,
              error: 'ID do backup é obrigatório',
            },
            { status: 400 }
          )
        }

        // Log de deleção do backup
        await AuditService.log({
          userId: authContext.user.id,
          action: 'BACKUP_DELETED',
          resource: 'Backup',
          details: JSON.stringify({
            backupId,
            deletedBy: authContext.user.email,
          }),
          severity: 'MEDIUM',
          ipAddress: clientIP,
          userAgent,
        })

        const result = await BackupService.deleteBackup(backupId)

        if (result.success) {
          return NextResponse.json({
            success: true,
            message: 'Backup deletado com sucesso',
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              error: result.error || 'Erro ao deletar backup',
            },
            { status: 500 }
          )
        }
      } catch (error) {
        console.error('❌ [Backup] Error deleting backup:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
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
  }
)
