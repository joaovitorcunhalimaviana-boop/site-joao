const cron = require('node-cron')
const { BackupService } = require('../lib/backup-service')
const { AuditService } = require('../lib/database')

/**
 * Agendador de backups automáticos
 * Executa backup diário às 2:00 AM e limpeza semanal aos domingos às 3:00 AM
 */
class BackupScheduler {
  static isRunning = false
  static backupTask = null
  static cleanupTask = null

  /**
   * Iniciar agendamento de backups
   */
  static start() {
    if (this.isRunning) {
      console.log('Agendador de backup já está em execução')
      return
    }

    console.log('Iniciando agendador de backups...')

    // Backup diário às 2:00 AM
    this.backupTask = cron.schedule(
      '0 2 * * *',
      async () => {
        console.log('Executando backup automático diário...')

        try {
          await AuditService.log({
            action: 'SCHEDULED_BACKUP_STARTED',
            resource: 'Backup',
            details: JSON.stringify({
              type: 'daily_automatic',
              scheduledTime: new Date().toISOString(),
            }),
            severity: 'LOW',
          })

          const result = await BackupService.createBackup()

          if (result.success) {
            console.log(`Backup automático concluído: ${result.backupId}`)

            await AuditService.log({
              action: 'SCHEDULED_BACKUP_COMPLETED',
              resource: 'Backup',
              details: JSON.stringify({
                backupId: result.backupId,
                size: result.size,
                type: 'daily_automatic',
              }),
              severity: 'LOW',
            })
          } else {
            console.error('Erro no backup automático:', result.error)

            await AuditService.log({
              action: 'SCHEDULED_BACKUP_FAILED',
              resource: 'Backup',
              details: JSON.stringify({
                error: result.error,
                type: 'daily_automatic',
              }),
              severity: 'HIGH',
            })
          }
        } catch (error) {
          console.error('Erro crítico no backup automático:', error)

          await AuditService.log({
            action: 'SCHEDULED_BACKUP_ERROR',
            resource: 'Backup',
            details: JSON.stringify({
              error: error.message,
              type: 'daily_automatic',
            }),
            severity: 'CRITICAL',
          })
        }
      },
      {
        scheduled: true,
        timezone: 'America/Sao_Paulo',
      }
    )

    // Limpeza semanal aos domingos às 3:00 AM
    this.cleanupTask = cron.schedule(
      '0 3 * * 0',
      async () => {
        console.log('Executando limpeza automática de backups antigos...')

        try {
          await AuditService.log({
            action: 'SCHEDULED_CLEANUP_STARTED',
            resource: 'Backup',
            details: JSON.stringify({
              type: 'weekly_automatic',
              scheduledTime: new Date().toISOString(),
            }),
            severity: 'LOW',
          })

          const result = await BackupService.cleanupOldBackups()

          if (result.success) {
            console.log(
              `Limpeza automática concluída: ${result.deletedCount} backups removidos`
            )

            await AuditService.log({
              action: 'SCHEDULED_CLEANUP_COMPLETED',
              resource: 'Backup',
              details: JSON.stringify({
                deletedCount: result.deletedCount,
                type: 'weekly_automatic',
              }),
              severity: 'LOW',
            })
          } else {
            console.error('Erro na limpeza automática:', result.error)

            await AuditService.log({
              action: 'SCHEDULED_CLEANUP_FAILED',
              resource: 'Backup',
              details: JSON.stringify({
                error: result.error,
                type: 'weekly_automatic',
              }),
              severity: 'MEDIUM',
            })
          }
        } catch (error) {
          console.error('Erro crítico na limpeza automática:', error)

          await AuditService.log({
            action: 'SCHEDULED_CLEANUP_ERROR',
            resource: 'Backup',
            details: JSON.stringify({
              error: error.message,
              type: 'weekly_automatic',
            }),
            severity: 'HIGH',
          })
        }
      },
      {
        scheduled: true,
        timezone: 'America/Sao_Paulo',
      }
    )

    this.isRunning = true
    console.log('Agendador de backups iniciado com sucesso')
    console.log('- Backup diário: 02:00 (horário de Brasília)')
    console.log('- Limpeza semanal: Domingos às 03:00 (horário de Brasília)')
  }

  /**
   * Parar agendamento de backups
   */
  static stop() {
    if (!this.isRunning) {
      console.log('Agendador de backup não está em execução')
      return
    }

    console.log('Parando agendador de backups...')

    if (this.backupTask) {
      this.backupTask.stop()
      this.backupTask = null
    }

    if (this.cleanupTask) {
      this.cleanupTask.stop()
      this.cleanupTask = null
    }

    this.isRunning = false
    console.log('Agendador de backups parado')
  }

  /**
   * Verificar status do agendador
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      backupTaskActive: this.backupTask ? true : false,
      cleanupTaskActive: this.cleanupTask ? true : false,
      nextBackup: this.backupTask ? 'Diário às 02:00' : 'Não agendado',
      nextCleanup: this.cleanupTask ? 'Domingos às 03:00' : 'Não agendado',
    }
  }

  /**
   * Executar backup manual (fora do agendamento)
   */
  static async runManualBackup() {
    console.log('Executando backup manual...')

    try {
      await AuditService.log({
        action: 'MANUAL_BACKUP_VIA_SCHEDULER',
        resource: 'Backup',
        details: JSON.stringify({
          type: 'manual_scheduler',
          timestamp: new Date().toISOString(),
        }),
        severity: 'LOW',
      })

      const result = await BackupService.createBackup()

      if (result.success) {
        console.log(`Backup manual concluído: ${result.backupId}`)
        return { success: true, backupId: result.backupId }
      } else {
        console.error('Erro no backup manual:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Erro crítico no backup manual:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Executar limpeza manual (fora do agendamento)
   */
  static async runManualCleanup() {
    console.log('Executando limpeza manual...')

    try {
      await AuditService.log({
        action: 'MANUAL_CLEANUP_VIA_SCHEDULER',
        resource: 'Backup',
        details: JSON.stringify({
          type: 'manual_scheduler',
          timestamp: new Date().toISOString(),
        }),
        severity: 'LOW',
      })

      const result = await BackupService.cleanupOldBackups()

      if (result.success) {
        console.log(
          `Limpeza manual concluída: ${result.deletedCount} backups removidos`
        )
        return { success: true, deletedCount: result.deletedCount }
      } else {
        console.error('Erro na limpeza manual:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Erro crítico na limpeza manual:', error)
      return { success: false, error: error.message }
    }
  }
}

// Iniciar automaticamente se executado diretamente
if (require.main === module) {
  BackupScheduler.start()

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nRecebido SIGINT, parando agendador...')
    BackupScheduler.stop()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\nRecebido SIGTERM, parando agendador...')
    BackupScheduler.stop()
    process.exit(0)
  })
}

module.exports = { BackupScheduler }
