const { BackupScheduler } = require('./backup-scheduler')
const { BackupService } = require('../lib/backup-service')
const { AuditService } = require('../lib/database')
const fs = require('fs').promises
const path = require('path')

/**
 * Script de inicialização do sistema de backup
 * Configura e inicia todos os componentes necessários
 */
class BackupSystemInitializer {
  /**
   * Inicializar sistema completo de backup
   */
  static async initialize() {
    console.log('🔧 Inicializando sistema de backup...')

    try {
      // 1. Verificar e criar diretórios necessários
      await this.ensureDirectories()

      // 2. Verificar configurações
      await this.validateConfiguration()

      // 3. Testar conectividade do banco
      await this.testDatabaseConnection()

      // 4. Inicializar serviço de backup
      await this.initializeBackupService()

      // 5. Iniciar agendador
      await this.startScheduler()

      // 6. Registrar inicialização
      await this.logInitialization()

      console.log('✅ Sistema de backup inicializado com sucesso!')
      console.log('📋 Status:')
      console.log('   - Backup diário: 02:00 (horário de Brasília)')
      console.log('   - Limpeza semanal: Domingos às 03:00')
      console.log('   - Retenção: 30 dias')
      console.log('   - Auditoria: Ativada')

      return { success: true }
    } catch (error) {
      console.error('❌ Erro na inicialização do sistema de backup:', error)

      try {
        await AuditService.log({
          action: 'BACKUP_SYSTEM_INIT_FAILED',
          resource: 'BackupSystem',
          details: JSON.stringify({
            error: error.message,
            stack: error.stack,
          }),
          severity: 'CRITICAL',
        })
      } catch (auditError) {
        console.error('Erro adicional ao registrar falha:', auditError)
      }

      return { success: false, error: error.message }
    }
  }

  /**
   * Garantir que todos os diretórios necessários existem
   */
  static async ensureDirectories() {
    console.log('📁 Verificando diretórios...')

    const directories = [
      path.join(process.cwd(), 'backups'),
      path.join(process.cwd(), 'backups', 'local'),
      path.join(process.cwd(), 'backups', 'temp'),
      path.join(process.cwd(), 'logs'),
      path.join(process.cwd(), 'scripts'),
    ]

    for (const dir of directories) {
      try {
        await fs.access(dir)
        console.log(`   ✓ ${dir}`)
      } catch {
        await fs.mkdir(dir, { recursive: true })
        console.log(`   📁 Criado: ${dir}`)
      }
    }
  }

  /**
   * Validar configurações do sistema
   */
  static async validateConfiguration() {
    console.log('⚙️ Validando configurações...')

    // Verificar variáveis de ambiente essenciais
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

    if (missingVars.length > 0) {
      throw new Error(
        `Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(', ')}`
      )
    }

    console.log('   ✓ Variáveis de ambiente OK')

    // Verificar espaço em disco
    const stats = await fs.stat(process.cwd())
    console.log('   ✓ Diretório de trabalho acessível')
  }

  /**
   * Testar conexão com banco de dados
   */
  static async testDatabaseConnection() {
    console.log('🔌 Testando conexão com banco...')

    try {
      // Tentar uma operação simples no banco
      await AuditService.log({
        action: 'BACKUP_SYSTEM_DB_TEST',
        resource: 'Database',
        details: JSON.stringify({
          timestamp: new Date().toISOString(),
          test: 'connection_check',
        }),
        severity: 'LOW',
      })

      console.log('   ✓ Conexão com banco OK')
    } catch (error) {
      throw new Error(`Falha na conexão com banco: ${error.message}`)
    }
  }

  /**
   * Inicializar serviço de backup
   */
  static async initializeBackupService() {
    console.log('🛠️ Inicializando serviço de backup...')

    try {
      // Verificar se o serviço pode ser instanciado
      const testResult = await BackupService.listBackups()

      if (testResult.success) {
        console.log(
          `   ✓ Serviço OK (${testResult.backups.length} backups existentes)`
        )
      } else {
        throw new Error(`Erro no serviço: ${testResult.error}`)
      }
    } catch (error) {
      throw new Error(`Falha na inicialização do serviço: ${error.message}`)
    }
  }

  /**
   * Iniciar agendador de backups
   */
  static async startScheduler() {
    console.log('⏰ Iniciando agendador...')

    try {
      BackupScheduler.start()

      const status = BackupScheduler.getStatus()

      if (status.isRunning) {
        console.log('   ✓ Agendador iniciado')
        console.log(
          `   ✓ Backup task: ${status.backupTaskActive ? 'Ativo' : 'Inativo'}`
        )
        console.log(
          `   ✓ Cleanup task: ${status.cleanupTaskActive ? 'Ativo' : 'Inativo'}`
        )
      } else {
        throw new Error('Agendador não conseguiu iniciar')
      }
    } catch (error) {
      throw new Error(`Falha no agendador: ${error.message}`)
    }
  }

  /**
   * Registrar inicialização no sistema de auditoria
   */
  static async logInitialization() {
    await AuditService.log({
      action: 'BACKUP_SYSTEM_INITIALIZED',
      resource: 'BackupSystem',
      details: JSON.stringify({
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: [
          'daily_backup',
          'weekly_cleanup',
          'audit_logging',
          'retention_policy',
        ],
      }),
      severity: 'LOW',
    })
  }

  /**
   * Parar sistema de backup
   */
  static async shutdown() {
    console.log('🛑 Parando sistema de backup...')

    try {
      BackupScheduler.stop()

      await AuditService.log({
        action: 'BACKUP_SYSTEM_SHUTDOWN',
        resource: 'BackupSystem',
        details: JSON.stringify({
          timestamp: new Date().toISOString(),
          reason: 'manual_shutdown',
        }),
        severity: 'LOW',
      })

      console.log('✅ Sistema de backup parado com sucesso')
      return { success: true }
    } catch (error) {
      console.error('❌ Erro ao parar sistema:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Verificar status completo do sistema
   */
  static async getSystemStatus() {
    try {
      const schedulerStatus = BackupScheduler.getStatus()
      const backupList = await BackupService.listBackups()

      return {
        success: true,
        scheduler: schedulerStatus,
        backups: {
          total: backupList.success ? backupList.backups.length : 0,
          lastBackup:
            backupList.success && backupList.backups.length > 0
              ? backupList.backups[0].timestamp
              : null,
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
}

// Executar inicialização se chamado diretamente
if (require.main === module) {
  BackupSystemInitializer.initialize()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Sistema pronto para uso!')

        // Manter processo ativo
        process.on('SIGINT', async () => {
          console.log('\n🛑 Recebido sinal de parada...')
          await BackupSystemInitializer.shutdown()
          process.exit(0)
        })

        process.on('SIGTERM', async () => {
          console.log('\n🛑 Recebido SIGTERM...')
          await BackupSystemInitializer.shutdown()
          process.exit(0)
        })
      } else {
        console.error('\n💥 Falha na inicialização')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('\n💥 Erro crítico:', error)
      process.exit(1)
    })
}

module.exports = { BackupSystemInitializer }
