import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import { AuditService, prisma } from './database'
import { EncryptionService } from './database'

const execAsync = promisify(exec)

export interface BackupConfig {
  enabled: boolean
  schedule: string // Cron expression
  retentionDays: number
  localPath: string
  cloudStorage?: {
    provider: 'aws' | 'gcp' | 'azure'
    bucket: string
    region: string
    credentials: any
  }
  encryption: {
    enabled: boolean
    key?: string
  }
  compression: boolean
  excludeTables?: string[]
}

export class BackupService {
  private static config: BackupConfig = {
    enabled: process.env['BACKUP_ENABLED'] === 'true',
    schedule: process.env['BACKUP_SCHEDULE'] || '0 2 * * *', // 2 AM daily
    retentionDays: parseInt(process.env['BACKUP_RETENTION_DAYS'] || '30'),
    localPath: process.env['BACKUP_LOCAL_PATH'] || './backups',
    cloudStorage: process.env['BACKUP_CLOUD_PROVIDER']
      ? {
          provider: process.env['BACKUP_CLOUD_PROVIDER'] as
            | 'aws'
            | 'gcp'
            | 'azure',
          bucket:
            process.env['AWS_S3_BUCKET'] ||
            process.env['GCP_STORAGE_BUCKET'] ||
            process.env['AZURE_CONTAINER_NAME'] ||
            '',
          region: process.env['AWS_REGION'] || 'us-east-1',
          credentials: {
            accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
            secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
            projectId: process.env['GCP_PROJECT_ID'],
            keyFilename: process.env['GCP_KEY_FILENAME'],
            accountName: process.env['AZURE_STORAGE_ACCOUNT'],
            accountKey: process.env['AZURE_STORAGE_KEY'],
          },
        }
      : undefined,
    encryption: {
      enabled: process.env['BACKUP_ENCRYPTION_ENABLED'] === 'true',
      key: process.env['BACKUP_ENCRYPTION_KEY'],
    },
    compression: process.env['BACKUP_COMPRESSION'] !== 'false',
    excludeTables: process.env['BACKUP_EXCLUDE_TABLES']?.split(',') || [],
  }

  /**
   * Criar backup completo do banco de dados
   */
  static async createBackup(): Promise<{
    success: boolean
    backupId?: string
    filePath?: string
    size?: number
    error?: string
  }> {
    try {
      if (!this.config.enabled) {
        return { success: false, error: 'Backup está desabilitado' }
      }

      const backupId = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`
      const timestamp = new Date().toISOString()

      // Criar diretório de backup se não existir
      await fs.mkdir(this.config.localPath, { recursive: true })

      const backupFileName = `${backupId}.sql${this.config.compression ? '.gz' : ''}`
      const backupFilePath = path.join(this.config.localPath, backupFileName)

      // Registrar início do backup
      await AuditService.log({
        action: 'BACKUP_STARTED',
        resource: 'Database',
        details: JSON.stringify({ backupId, timestamp }),
        severity: 'LOW',
      })

      // Executar backup do PostgreSQL
      const databaseUrl = process.env['DATABASE_URL']
      if (!databaseUrl) {
        throw new Error('DATABASE_URL não configurada')
      }

      // Construir comando pg_dump
      let pgDumpCommand = `pg_dump "${databaseUrl}" --no-owner --no-privileges --clean --if-exists`

      // Excluir tabelas se especificado
      if (this.config.excludeTables && this.config.excludeTables.length > 0) {
        for (const table of this.config.excludeTables) {
          pgDumpCommand += ` --exclude-table=${table}`
        }
      }

      // Adicionar compressão se habilitada
      if (this.config.compression) {
        pgDumpCommand += ` | gzip > "${backupFilePath}"`
      } else {
        pgDumpCommand += ` > "${backupFilePath}"`
      }

      // Executar backup
      await execAsync(pgDumpCommand)

      // Verificar se o arquivo foi criado
      const stats = await fs.stat(backupFilePath)
      if (!stats.isFile()) {
        throw new Error('Arquivo de backup não foi criado')
      }

      let finalFilePath = backupFilePath

      // Criptografar se habilitado
      if (this.config.encryption.enabled && this.config.encryption.key) {
        const encryptedPath = `${backupFilePath}.enc`
        const backupData = await fs.readFile(backupFilePath)
        const encryptedData = EncryptionService.encrypt(backupData.toString())
        await fs.writeFile(encryptedPath, encryptedData)

        // Remover arquivo não criptografado
        await fs.unlink(backupFilePath)
        finalFilePath = encryptedPath
      }

      // Obter tamanho final do arquivo
      const finalStats = await fs.stat(finalFilePath)
      const fileSize = finalStats.size

      // Registrar backup no banco
      const backupRecord = await prisma.backupLog.create({
        data: {
          id: backupId,
          type: 'FULL',
          status: 'COMPLETED',
          filename: path.basename(finalFilePath),
          size: (await fs.stat(finalFilePath)).size,
          checksum: require('crypto')
            .createHash('md5')
            .update(await fs.readFile(finalFilePath))
            .digest('hex'),
          completedAt: new Date(),
        },
      })

      // Upload para nuvem se configurado
      if (this.config.cloudStorage) {
        try {
          await this.uploadToCloud(finalFilePath, backupId)
          await prisma.backupLog.update({
            where: { id: backupId },
            data: { status: 'COMPLETED' },
          })
        } catch (error) {
          console.error('❌ [Backup] Cloud upload failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          })
          await prisma.backupLog.update({
            where: { id: backupId },
            data: {
              status: 'FAILED',
              errorMessage:
                error instanceof Error ? error.message : 'Erro no upload',
            },
          })
        }
      }

      // Log de sucesso
      await AuditService.log({
        action: 'BACKUP_COMPLETED',
        resource: 'Database',
        details: JSON.stringify({
          backupId,
          size: fileSize,
          compressed: this.config.compression,
          encrypted: this.config.encryption.enabled,
          cloudUploaded: !!this.config.cloudStorage,
        }),
        severity: 'LOW',
      })

      return {
        success: true,
        backupId,
        filePath: finalFilePath,
        size: fileSize,
      }
    } catch (error) {
      console.error('❌ [Backup] Backup creation failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })

      await AuditService.log({
        action: 'BACKUP_FAILED',
        resource: 'Database',
        details: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        severity: 'HIGH',
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }

  /**
   * Restaurar backup
   */
  static async restoreBackup(backupId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Buscar backup no banco
      const backup = await prisma.backupLog.findUnique({
        where: { id: backupId },
      })

      if (!backup) {
        return { success: false, error: 'Backup não encontrado' }
      }

      if (backup.status !== 'COMPLETED') {
        return { success: false, error: 'Backup não está completo' }
      }

      let restoreFilePath = backup.filename
        ? path.join(this.config.localPath, backup.filename)
        : ''

      if (
        !restoreFilePath ||
        !(await fs
          .access(restoreFilePath)
          .then(() => true)
          .catch(() => false))
      ) {
        return { success: false, error: 'Arquivo de backup não encontrado' }
      }

      // Descriptografar se necessário
      if (this.config.encryption.enabled && this.config.encryption.key) {
        const encryptedData = await fs.readFile(restoreFilePath, 'utf8')
        const decryptedData = EncryptionService.decrypt(encryptedData)

        const tempPath = `${restoreFilePath}.temp`
        await fs.writeFile(tempPath, decryptedData)
        restoreFilePath = tempPath
      }

      // Registrar início da restauração
      await AuditService.log({
        action: 'RESTORE_STARTED',
        resource: 'Database',
        details: JSON.stringify({ backupId }),
        severity: 'HIGH',
      })

      const databaseUrl = process.env['DATABASE_URL']
      if (!databaseUrl) {
        throw new Error('DATABASE_URL não configurada')
      }

      // Construir comando de restauração
      let restoreCommand: string

      if (this.config.compression) {
        restoreCommand = `gunzip -c "${restoreFilePath}" | psql "${databaseUrl}"`
      } else {
        restoreCommand = `psql "${databaseUrl}" < "${restoreFilePath}"`
      }

      // Executar restauração
      await execAsync(restoreCommand)

      // Limpar arquivo temporário se foi descriptografado
      if (this.config.encryption.enabled && restoreFilePath.endsWith('.temp')) {
        await fs.unlink(restoreFilePath)
      }

      // Log de sucesso
      await AuditService.log({
        action: 'RESTORE_COMPLETED',
        resource: 'Database',
        details: JSON.stringify({ backupId }),
        severity: 'HIGH',
      })

      return { success: true }
    } catch (error) {
      console.error('❌ [Backup] Restore failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })

      await AuditService.log({
        action: 'RESTORE_FAILED',
        resource: 'Database',
        details: JSON.stringify({
          backupId,
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        severity: 'HIGH',
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }

  /**
   * Limpar backups antigos
   */
  static async cleanupOldBackups(): Promise<{
    success: boolean
    deletedCount: number
    error?: string
  }> {
    try {
      const cutoffDate = new Date(
        Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000
      )

      // Buscar backups expirados
      const expiredBackups = await prisma.backupLog.findMany({
        where: {
          startedAt: {
            lt: cutoffDate,
          },
        },
      })

      let deletedCount = 0

      for (const backup of expiredBackups) {
        try {
          // Remover arquivo local se existir
          if (backup.filename) {
            const filePath = path.join(this.config.localPath, backup.filename)
            try {
              await fs.unlink(filePath)
            } catch (fileError) {
              console.warn(`⚠️ [Backup] File not found:`, {
                filePath,
                error: fileError instanceof Error ? fileError.message : 'Unknown error',
                timestamp: new Date().toISOString()
              })
            }
          }

          // Remover do banco
          await prisma.backupLog.delete({
            where: { id: backup.id },
          })

          deletedCount++
        } catch (fileError) {
          console.error(`❌ [Backup] Error removing backup ${backup.id}:`, {
            backupId: backup.id,
            error: fileError instanceof Error ? fileError.message : 'Unknown error',
            stack: fileError instanceof Error ? fileError.stack : undefined,
            timestamp: new Date().toISOString()
          })
          // Continuar com outros backups
        }
      }

      await AuditService.log({
        action: 'BACKUP_CLEANUP',
        resource: 'Database',
        details: JSON.stringify({
          deletedCount,
          retentionDays: this.config.retentionDays,
        }),
        severity: 'LOW',
      })

      return { success: true, deletedCount }
    } catch (error) {
      console.error('Erro na limpeza de backups:', error)

      return {
        success: false,
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }

  /**
   * Listar backups disponíveis
   */
  static async listBackups(): Promise<{
    success: boolean
    backups?: any[]
    error?: string
  }> {
    try {
      const backups = await prisma.backupLog.findMany({
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          filename: true,
          size: true,
          type: true,
          status: true,
          startedAt: true,
          completedAt: true,
          checksum: true,
        },
      })

      return { success: true, backups }
    } catch (error) {
      console.error('Erro ao listar backups:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }

  /**
   * Upload para nuvem (implementação básica)
   */
  private static async uploadToCloud(
    filePath: string,
    backupId: string
  ): Promise<void> {
    // Esta é uma implementação básica - deve ser expandida conforme o provedor
    if (!this.config.cloudStorage) {
      throw new Error('Configuração de nuvem não encontrada')
    }

    // TODO: Implementar upload específico para cada provedor
    // AWS S3, Google Cloud Storage, Azure Blob Storage, etc.

    console.log(
      `Upload para nuvem simulado: ${backupId} -> ${this.config.cloudStorage.bucket}`
    )
  }

  /**
   * Deletar backup
   */
  static async deleteBackup(backupId: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Buscar backup no banco
      const backup = await prisma.backupLog.findUnique({
        where: { id: backupId },
      })

      if (!backup) {
        return { success: false, error: 'Backup não encontrado' }
      }

      // Remover arquivo local
      if (backup.filename) {
        const filePath = path.join(this.config.localPath, backup.filename)
        try {
          await fs.unlink(filePath)
        } catch (fileError) {
          console.error(`Erro ao remover arquivo ${filePath}:`, fileError)
          // Continuar mesmo se o arquivo não existir
        }
      }

      // Remover do banco
      await prisma.backupLog.delete({
        where: { id: backupId },
      })

      // Log de sucesso
      await AuditService.log({
        action: 'BACKUP_DELETED',
        resource: 'Database',
        details: JSON.stringify({ backupId }),
        severity: 'MEDIUM',
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar backup:', error)

      await AuditService.log({
        action: 'BACKUP_DELETE_FAILED',
        resource: 'Database',
        details: JSON.stringify({
          backupId,
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        severity: 'HIGH',
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }

  /**
   * Verificar integridade do backup
   */
  static async verifyBackup(backupId: string): Promise<{
    success: boolean
    valid?: boolean
    error?: string
  }> {
    try {
      const backup = await prisma.backupLog.findUnique({
        where: { id: backupId },
      })

      if (!backup) {
        return { success: false, error: 'Backup não encontrado' }
      }

      if (backup.status !== 'COMPLETED') {
        return { success: false, error: 'Backup não está completo' }
      }

      // Verificar se o arquivo existe
      if (backup.filename) {
        const filePath = path.join(this.config.localPath, backup.filename)
        try {
          const stats = await fs.stat(filePath)
          const currentSize = stats.size

          // Verificar se o tamanho corresponde
          if (backup.size && currentSize !== backup.size) {
            return { success: true, valid: false }
          }

          // Verificar checksum se disponível
          if (backup.checksum) {
            const fileData = await fs.readFile(filePath)
            const currentChecksum = require('crypto')
              .createHash('md5')
              .update(fileData)
              .digest('hex')

            if (currentChecksum !== backup.checksum) {
              return { success: true, valid: false }
            }
          }

          return { success: true, valid: true }
        } catch (fileError) {
          return { success: true, valid: false }
        }
      }

      return { success: true, valid: false }
    } catch (error) {
      console.error('Erro na verificação do backup:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }
}
