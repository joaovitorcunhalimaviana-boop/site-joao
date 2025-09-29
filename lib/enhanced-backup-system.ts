// Sistema de Backup Aprimorado com Proteção Contra Perda de Dados
// Implementa múltiplas camadas de proteção e verificação de integridade

import { BackupService } from './backup-service'
import { AuditService, prisma } from './database'
import fs from 'fs/promises'
import path from 'path'

interface DataIntegrityCheck {
  timestamp: string
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  issues: Array<{
    type: 'MISSING_DATA' | 'CORRUPTED_DATA' | 'INCONSISTENT_DATA'
    table: string
    description: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }>
  totalRecords: number
  lastBackup?: string
}

interface BackupVerification {
  backupId: string
  verified: boolean
  checksum: string
  size: number
  recordCount: number
  issues: string[]
}

export class EnhancedBackupSystem {
  private static instance: EnhancedBackupSystem
  private isRunning = false
  private lastIntegrityCheck?: Date
  private criticalDataTables = [
    'users',
    'patients', 
    'appointments',
    'medical_records',
    'consultations',
    'reviews',
    'audit_logs',
    'schedule_blocks'
  ]

  static getInstance(): EnhancedBackupSystem {
    if (!EnhancedBackupSystem.instance) {
      EnhancedBackupSystem.instance = new EnhancedBackupSystem()
    }
    return EnhancedBackupSystem.instance
  }

  /**
   * Verificação completa de integridade dos dados
   */
  async performDataIntegrityCheck(): Promise<DataIntegrityCheck> {
    console.log('🔍 INICIANDO VERIFICAÇÃO DE INTEGRIDADE DOS DADOS...')
    
    const check: DataIntegrityCheck = {
      timestamp: new Date().toISOString(),
      status: 'HEALTHY',
      issues: [],
      totalRecords: 0
    }

    try {
      // Verificar cada tabela crítica
      for (const table of this.criticalDataTables) {
        await this.checkTableIntegrity(table, check)
      }

      // Verificar relacionamentos entre tabelas
      await this.checkDataRelationships(check)

      // Verificar consistência temporal
      await this.checkTemporalConsistency(check)

      // Determinar status geral
      const criticalIssues = check.issues.filter(i => i.severity === 'CRITICAL')
      const highIssues = check.issues.filter(i => i.severity === 'HIGH')

      if (criticalIssues.length > 0) {
        check.status = 'CRITICAL'
      } else if (highIssues.length > 0 || check.issues.length > 5) {
        check.status = 'WARNING'
      }

      // Registrar resultado
      await AuditService.log({
        action: 'DATA_INTEGRITY_CHECK',
        resource: 'Database',
        details: JSON.stringify({
          status: check.status,
          issuesCount: check.issues.length,
          totalRecords: check.totalRecords,
          criticalIssues: criticalIssues.length
        }),
        severity: check.status === 'CRITICAL' ? 'CRITICAL' : 
                 check.status === 'WARNING' ? 'HIGH' : 'LOW'
      })

      this.lastIntegrityCheck = new Date()
      
      console.log(`✅ Verificação concluída: ${check.status} (${check.issues.length} problemas encontrados)`)
      
      return check

    } catch (error) {
      console.error('❌ Erro na verificação de integridade:', error)
      
      check.status = 'CRITICAL'
      check.issues.push({
        type: 'CORRUPTED_DATA',
        table: 'system',
        description: `Erro na verificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        severity: 'CRITICAL'
      })

      return check
    }
  }

  /**
   * Verificar integridade de uma tabela específica
   */
  private async checkTableIntegrity(tableName: string, check: DataIntegrityCheck): Promise<void> {
    try {
      // Contar registros
      const count = await this.getTableCount(tableName)
      check.totalRecords += count

      // Verificar se a tabela existe e tem dados esperados
      if (tableName === 'users' && count === 0) {
        check.issues.push({
          type: 'MISSING_DATA',
          table: tableName,
          description: 'Tabela de usuários está vazia - possível perda de dados crítica',
          severity: 'CRITICAL'
        })
      }

      if (tableName === 'patients' && count === 0) {
        check.issues.push({
          type: 'MISSING_DATA',
          table: tableName,
          description: 'Tabela de pacientes está vazia',
          severity: 'HIGH'
        })
      }

      // Verificar registros órfãos ou inconsistentes
      await this.checkTableConsistency(tableName, check)

    } catch (error) {
      check.issues.push({
        type: 'CORRUPTED_DATA',
        table: tableName,
        description: `Erro ao verificar tabela: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        severity: 'HIGH'
      })
    }
  }

  /**
   * Obter contagem de registros de uma tabela
   */
  private async getTableCount(tableName: string): Promise<number> {
    try {
      switch (tableName) {
        case 'patients':
          return await prisma.patient.count()
        case 'appointments':
          return await prisma.appointment.count()
        case 'medical_records':
          return await prisma.medicalRecord.count()
        case 'consultations':
          return await prisma.consultation.count()
        case 'reviews':
          return await prisma.review.count()
        case 'users':
          return await prisma.user.count()
        case 'audit_logs':
          return await prisma.auditLog.count()
        case 'schedule_blocks':
          return await prisma.scheduleBlock.count()
        default:
          return 0
      }
    } catch (error) {
      console.error(`Erro ao contar registros da tabela ${tableName}:`, error)
      return 0
    }
  }

  /**
   * Verificar consistência específica de uma tabela
   */
  private async checkTableConsistency(tableName: string, check: DataIntegrityCheck): Promise<void> {
    try {
      switch (tableName) {
        case 'appointments':
          // Verificar agendamentos órfãos (sem paciente válido)
          const orphanAppointments = await prisma.appointment.count({
            where: {
              patient: {
                is: null
              }
            }
          })
          
          if (orphanAppointments > 0) {
            check.issues.push({
              type: 'INCONSISTENT_DATA',
              table: tableName,
              description: `${orphanAppointments} agendamentos sem paciente associado`,
              severity: 'MEDIUM'
            })
          }
          break

        case 'medical_records':
          // Verificar prontuários órfãos (sem paciente válido)
          const orphanRecords = await prisma.medicalRecord.count({
            where: {
              patient: {
                is: null
              }
            }
          })
          
          if (orphanRecords > 0) {
            check.issues.push({
              type: 'INCONSISTENT_DATA',
              table: tableName,
              description: `${orphanRecords} prontuários sem paciente associado`,
              severity: 'HIGH'
            })
          }
          break
      }
    } catch (error) {
      // Erro na verificação de consistência não é crítico
      console.warn(`Aviso na verificação de consistência da tabela ${tableName}:`, error)
    }
  }

  /**
   * Verificar relacionamentos entre tabelas
   */
  private async checkDataRelationships(check: DataIntegrityCheck): Promise<void> {
    try {
      // Verificar se há pacientes sem nenhum agendamento há muito tempo
      const patientsWithoutRecentAppointments = await prisma.patient.count({
        where: {
          appointments: {
            none: {
              date: {
                gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 ano
              }
            }
          },
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Criado há mais de 30 dias
          }
        }
      })

      if (patientsWithoutRecentAppointments > 10) {
        check.issues.push({
          type: 'INCONSISTENT_DATA',
          table: 'patients',
          description: `${patientsWithoutRecentAppointments} pacientes sem agendamentos recentes`,
          severity: 'LOW'
        })
      }

    } catch (error) {
      console.warn('Aviso na verificação de relacionamentos:', error)
    }
  }

  /**
   * Verificar consistência temporal dos dados
   */
  private async checkTemporalConsistency(check: DataIntegrityCheck): Promise<void> {
    try {
      // Verificar agendamentos com datas inconsistentes
      const futureAppointments = await prisma.appointment.count({
        where: {
          date: {
            gt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Mais de 1 ano no futuro
          }
        }
      })

      if (futureAppointments > 0) {
        check.issues.push({
          type: 'INCONSISTENT_DATA',
          table: 'appointments',
          description: `${futureAppointments} agendamentos com datas muito distantes no futuro`,
          severity: 'LOW'
        })
      }

      // Verificar registros com timestamps inválidos
      const invalidTimestamps = await prisma.appointment.count({
        where: {
          createdAt: {
            gt: new Date()
          }
        }
      })

      if (invalidTimestamps > 0) {
        check.issues.push({
          type: 'CORRUPTED_DATA',
          table: 'appointments',
          description: `${invalidTimestamps} registros com timestamps futuros`,
          severity: 'MEDIUM'
        })
      }

    } catch (error) {
      console.warn('Aviso na verificação temporal:', error)
    }
  }

  /**
   * Backup de emergência com verificação
   */
  async performEmergencyBackup(): Promise<{
    success: boolean
    backupId?: string
    verification?: BackupVerification
    error?: string
  }> {
    console.log('🚨 EXECUTANDO BACKUP DE EMERGÊNCIA...')

    try {
      // Primeiro, verificar integridade dos dados
      const integrityCheck = await this.performDataIntegrityCheck()
      
      if (integrityCheck.status === 'CRITICAL') {
        console.log('⚠️ DADOS CRÍTICOS DETECTADOS - Prosseguindo com backup de emergência')
      }

      // Executar backup
      const backupResult = await BackupService.createBackup()
      
      if (!backupResult.success) {
        return {
          success: false,
          error: backupResult.error
        }
      }

      // Verificar o backup criado
      const verification = await this.verifyBackup(backupResult.backupId!)
      
      // Registrar resultado
      await AuditService.log({
        action: 'EMERGENCY_BACKUP_COMPLETED',
        resource: 'Database',
        details: JSON.stringify({
          backupId: backupResult.backupId,
          verified: verification.verified,
          integrityStatus: integrityCheck.status,
          issues: integrityCheck.issues.length
        }),
        severity: 'HIGH'
      })

      console.log(`✅ Backup de emergência concluído: ${backupResult.backupId}`)
      
      return {
        success: true,
        backupId: backupResult.backupId,
        verification
      }

    } catch (error) {
      console.error('❌ Erro no backup de emergência:', error)
      
      await AuditService.log({
        action: 'EMERGENCY_BACKUP_FAILED',
        resource: 'Database',
        details: JSON.stringify({
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }),
        severity: 'CRITICAL'
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Verificar integridade de um backup
   */
  private async verifyBackup(backupId: string): Promise<BackupVerification> {
    const verification: BackupVerification = {
      backupId,
      verified: false,
      checksum: '',
      size: 0,
      recordCount: 0,
      issues: []
    }

    try {
      // Buscar informações do backup
      const backup = await prisma.backupLog.findUnique({
        where: { id: backupId }
      })

      if (!backup) {
        verification.issues.push('Backup não encontrado no banco de dados')
        return verification
      }

      if (!backup.filename) {
        verification.issues.push('Nome do arquivo de backup não encontrado')
        return verification
      }

      // Verificar se o arquivo existe
      const backupPath = path.join(process.cwd(), 'backups', backup.filename)
      
      try {
        const stats = await fs.stat(backupPath)
        verification.size = stats.size
        
        if (stats.size === 0) {
          verification.issues.push('Arquivo de backup está vazio')
          return verification
        }
      } catch (error) {
        verification.issues.push('Arquivo de backup não encontrado no sistema de arquivos')
        return verification
      }

      // Se chegou até aqui, o backup está verificado
      verification.verified = verification.issues.length === 0
      
      return verification

    } catch (error) {
      verification.issues.push(`Erro na verificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      return verification
    }
  }

  /**
   * Monitoramento contínuo do sistema
   */
  async startContinuousMonitoring(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Monitoramento já está em execução')
      return
    }

    this.isRunning = true
    console.log('🔄 INICIANDO MONITORAMENTO CONTÍNUO DE PROTEÇÃO DE DADOS...')

    // Verificação de integridade a cada 6 horas
    const integrityInterval = setInterval(async () => {
      try {
        const check = await this.performDataIntegrityCheck()
        
        if (check.status === 'CRITICAL') {
          console.log('🚨 PROBLEMAS CRÍTICOS DETECTADOS - Executando backup de emergência')
          await this.performEmergencyBackup()
        }
      } catch (error) {
        console.error('❌ Erro no monitoramento de integridade:', error)
      }
    }, 6 * 60 * 60 * 1000) // 6 horas

    // Backup preventivo a cada 2 horas
    const backupInterval = setInterval(async () => {
      try {
        await this.performEmergencyBackup()
      } catch (error) {
        console.error('❌ Erro no backup preventivo:', error)
      }
    }, 2 * 60 * 60 * 1000) // 2 horas

    // Registrar início do monitoramento
    await AuditService.log({
      action: 'CONTINUOUS_MONITORING_STARTED',
      resource: 'System',
      details: JSON.stringify({
        integrityCheckInterval: '6 hours',
        backupInterval: '2 hours'
      }),
      severity: 'HIGH'
    })

    // Cleanup quando o processo terminar
    process.on('SIGINT', () => {
      clearInterval(integrityInterval)
      clearInterval(backupInterval)
      this.isRunning = false
      console.log('🛑 Monitoramento contínuo interrompido')
    })
  }

  /**
   * Obter status atual do sistema de proteção
   */
  async getProtectionStatus(): Promise<{
    monitoring: boolean
    lastIntegrityCheck?: string
    lastBackup?: string
    criticalIssues: number
    totalBackups: number
  }> {
    try {
      // Buscar último backup
      const lastBackup = await prisma.backupLog.findFirst({
        orderBy: { startedAt: 'desc' }
      })

      // Buscar logs de auditoria recentes para problemas críticos
      const recentCriticalLogs = await prisma.auditLog.count({
        where: {
          severity: 'CRITICAL',
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      })

      const totalBackups = await prisma.backupLog.count()

      return {
        monitoring: this.isRunning,
        lastIntegrityCheck: this.lastIntegrityCheck?.toISOString(),
        lastBackup: lastBackup?.startedAt.toISOString(),
        criticalIssues: recentCriticalLogs,
        totalBackups
      }

    } catch (error) {
      console.error('❌ Erro ao obter status de proteção:', error)
      return {
        monitoring: this.isRunning,
        criticalIssues: 0,
        totalBackups: 0
      }
    }
  }
}

// Exportar instância singleton
export const enhancedBackupSystem = EnhancedBackupSystem.getInstance()