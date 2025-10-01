const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs/promises')
const path = require('path')
const { AuditService, prisma } = require('./database')
const { EncryptionService } = require('./database')

const execAsync = promisify(exec)

class BackupService {
  static config = {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    localPath: process.env.BACKUP_LOCAL_PATH || './backups',
    encryption: {
      enabled: process.env.BACKUP_ENCRYPTION === 'true',
      key: process.env.BACKUP_ENCRYPTION_KEY
    },
    compression: process.env.BACKUP_COMPRESSION !== 'false'
  }

  static async createBackup() {
    try {
      console.log(' Iniciando backup...')
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupId = `backup_${timestamp}`
      const filename = `${backupId}.sql`
      const backupPath = path.join(this.config.localPath, filename)
      
      await fs.mkdir(this.config.localPath, { recursive: true })
      
      const dbUrl = process.env.DATABASE_URL
      if (!dbUrl) {
        throw new Error('DATABASE_URL não configurada')
      }
      
      const backupCommand = `pg_dump "${dbUrl}" > "${backupPath}"`
      await execAsync(backupCommand)
      
      const stats = await fs.stat(backupPath)
      if (stats.size === 0) {
        throw new Error('Backup criado mas arquivo está vazio')
      }
      
      const backupLog = await prisma.backupLog.create({
        data: {
          id: backupId,
          type: 'FULL',
          status: 'COMPLETED',
          filename: filename,
          size: stats.size,
          checksum: 'generated',
          metadata: JSON.stringify({
            timestamp,
            size: stats.size,
            compressed: this.config.compression
          })
        }
      })
      
      console.log(` Backup concluído: ${backupId}`)
      
      return {
        success: true,
        backupId,
        filename,
        size: stats.size
      }
      
    } catch (error) {
      console.error(' Erro no backup:', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  static async listBackups() {
    try {
      const backups = await prisma.backupLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
      })
      
      return {
        success: true,
        backups: backups.map(backup => ({
          id: backup.id,
          filename: backup.filename,
          size: backup.size,
          timestamp: backup.createdAt,
          status: backup.status
        }))
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        backups: []
      }
    }
  }
  
  static async cleanupOldBackups() {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)
      
      const oldBackups = await prisma.backupLog.findMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      })
      
      let deletedCount = 0
      
      for (const backup of oldBackups) {
        try {
          const backupPath = path.join(this.config.localPath, backup.filename)
          await fs.unlink(backupPath)
          
          await prisma.backupLog.delete({
            where: { id: backup.id }
          })
          
          deletedCount++
        } catch (error) {
          console.warn(` Erro ao deletar backup ${backup.id}:`, error.message)
        }
      }
      
      return {
        success: true,
        deletedCount
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        deletedCount: 0
      }
    }
  }
}

module.exports = { BackupService }
