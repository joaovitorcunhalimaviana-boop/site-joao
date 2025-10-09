import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface AuditLog {
  id: string
  timestamp: string
  userId?: string
  userEmail?: string
  action: string
  resource: string
  resourceId?: string
  details: any
  ipAddress?: string
  userAgent?: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'SUCCESS' | 'FAILURE' | 'WARNING'
}

interface AuditQuery {
  startDate?: string
  endDate?: string
  userId?: string
  action?: string
  resource?: string
  severity?: string
  status?: string
  limit?: number
  offset?: number
}

// Sistema de Logs de Auditoria
class AuditLogSystem {
  // Registrar evento de auditoria
  static async logEvent(
    action: string,
    resource: string,
    details: any,
    options: {
      userId?: string
      userEmail?: string
      resourceId?: string
      ipAddress?: string
      userAgent?: string
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      status?: 'SUCCESS' | 'FAILURE' | 'WARNING'
    } = {}
  ): Promise<void> {
    try {
      const logEntry: AuditLog = {
        id: this.generateLogId(),
        timestamp: new Date().toISOString(),
        userId: options.userId,
        userEmail: options.userEmail,
        action,
        resource,
        resourceId: options.resourceId,
        details,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        severity: options.severity || 'MEDIUM',
        status: options.status || 'SUCCESS',
      }

      // Salvar no arquivo de log
      await this.saveToFile(logEntry)

      // Log crítico também vai para o console
      if (logEntry.severity === 'CRITICAL') {
        console.log(
          '🚨 EVENTO CRÍTICO REGISTRADO:',
          JSON.stringify(logEntry, null, 2)
        )
      }
    } catch (error) {
      console.error('❌ ERRO AO REGISTRAR LOG DE AUDITORIA:', error)
      // Em caso de erro, pelo menos registrar no console
      console.log('📝 EVENTO (FALLBACK):', {
        action,
        resource,
        details,
        options,
      })
    }
  }

  // Gerar ID único para o log
  static generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Salvar log em arquivo
  static async saveToFile(logEntry: AuditLog): Promise<void> {
    try {
      const logsDir = path.join(process.cwd(), 'logs', 'audit')

      // Criar diretório se não existir
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
      }

      // Nome do arquivo baseado na data
      const today = new Date().toISOString().split('T')[0]
      const logFile = path.join(logsDir, `audit_${today}.json`)

      // Ler logs existentes ou criar array vazio
      let existingLogs: AuditLog[] = []
      if (fs.existsSync(logFile)) {
        const fileContent = fs.readFileSync(logFile, 'utf8')
        try {
          existingLogs = JSON.parse(fileContent)
        } catch (parseError) {
          console.error('❌ Erro ao parsear logs existentes:', parseError)
          existingLogs = []
        }
      }

      // Adicionar novo log
      existingLogs.push(logEntry)

      // Salvar de volta no arquivo
      fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2))

      // Manter apenas os últimos 30 dias de logs
      await this.cleanOldLogs(logsDir)
    } catch (error) {
      console.error('❌ Erro ao salvar log em arquivo:', error)
    }
  }

  // Limpar logs antigos (manter apenas 30 dias)
  static async cleanOldLogs(logsDir: string): Promise<void> {
    try {
      const files = fs.readdirSync(logsDir)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      for (const file of files) {
        if (file.startsWith('audit_') && file.endsWith('.json')) {
          const dateStr = file.replace('audit_', '').replace('.json', '')
          const fileDate = new Date(dateStr)

          if (fileDate < thirtyDaysAgo) {
            const filePath = path.join(logsDir, file)
            fs.unlinkSync(filePath)
            console.log(`🗑️ Log antigo removido: ${file}`)
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao limpar logs antigos:', error)
    }
  }

  // Buscar logs com filtros
  static async searchLogs(
    query: AuditQuery
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const logsDir = path.join(process.cwd(), 'logs', 'audit')

      if (!fs.existsSync(logsDir)) {
        return { logs: [], total: 0 }
      }

      let allLogs: AuditLog[] = []

      // Determinar arquivos a serem lidos baseado nas datas
      const files = fs.readdirSync(logsDir)
      const logFiles = files.filter(
        file => file.startsWith('audit_') && file.endsWith('.json')
      )

      // Filtrar arquivos por data se especificado
      let filesToRead = logFiles
      if (query.startDate || query.endDate) {
        filesToRead = logFiles.filter(file => {
          const dateStr = file.replace('audit_', '').replace('.json', '')
          const fileDate = new Date(dateStr)

          if (query.startDate && fileDate < new Date(query.startDate))
            return false
          if (query.endDate && fileDate > new Date(query.endDate)) return false

          return true
        })
      }

      // Ler logs dos arquivos selecionados
      for (const file of filesToRead) {
        try {
          const filePath = path.join(logsDir, file)
          const fileContent = fs.readFileSync(filePath, 'utf8')
          const logs: AuditLog[] = JSON.parse(fileContent)
          allLogs = allLogs.concat(logs)
        } catch (error) {
          console.error(`❌ Erro ao ler arquivo ${file}:`, error)
        }
      }

      // Aplicar filtros
      let filteredLogs = allLogs

      if (query.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === query.userId)
      }

      if (query.action) {
        filteredLogs = filteredLogs.filter(log =>
          log.action.toLowerCase().includes(query.action!.toLowerCase())
        )
      }

      if (query.resource) {
        filteredLogs = filteredLogs.filter(log =>
          log.resource.toLowerCase().includes(query.resource!.toLowerCase())
        )
      }

      if (query.severity) {
        filteredLogs = filteredLogs.filter(
          log => log.severity === query.severity
        )
      }

      if (query.status) {
        filteredLogs = filteredLogs.filter(log => log.status === query.status)
      }

      // Ordenar por timestamp (mais recente primeiro)
      filteredLogs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      const total = filteredLogs.length

      // Aplicar paginação
      const offset = query.offset || 0
      const limit = query.limit || 100
      const paginatedLogs = filteredLogs.slice(offset, offset + limit)

      return { logs: paginatedLogs, total }
    } catch (error) {
      console.error('❌ Erro ao buscar logs:', error)
      return { logs: [], total: 0 }
    }
  }

  // Obter estatísticas dos logs
  static async getLogStatistics(days: number = 7): Promise<any> {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { logs } = await this.searchLogs({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })

      const stats = {
        total: logs.length,
        byAction: {} as Record<string, number>,
        byResource: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        byDay: {} as Record<string, number>,
        criticalEvents: logs.filter(log => log.severity === 'CRITICAL').length,
        failedEvents: logs.filter(log => log.status === 'FAILURE').length,
      }

      // Contar por categoria
      logs.forEach(log => {
        // Por ação
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1

        // Por recurso
        stats.byResource[log.resource] =
          (stats.byResource[log.resource] || 0) + 1

        // Por severidade
        stats.bySeverity[log.severity] =
          (stats.bySeverity[log.severity] || 0) + 1

        // Por status
        stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1

        // Por dia
        const day = log.timestamp.split('T')[0]
        stats.byDay[day] = (stats.byDay[day] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      return null
    }
  }

  // Registrar eventos específicos do sistema médico
  static async logPatientEvent(
    action: string,
    patientId: string,
    details: any,
    options: any = {}
  ) {
    await this.logEvent(action, 'patient', details, {
      ...options,
      resourceId: patientId,
      severity: 'HIGH', // Eventos de paciente são sempre de alta prioridade
    })
  }

  static async logAppointmentEvent(
    action: string,
    appointmentId: string,
    details: any,
    options: any = {}
  ) {
    await this.logEvent(action, 'appointment', details, {
      ...options,
      resourceId: appointmentId,
      severity: 'HIGH',
    })
  }

  static async logMedicalRecordEvent(
    action: string,
    recordId: string,
    details: any,
    options: any = {}
  ) {
    await this.logEvent(action, 'medical_record', details, {
      ...options,
      resourceId: recordId,
      severity: 'CRITICAL', // Prontuários médicos são críticos
    })
  }

  static async logSystemEvent(action: string, details: any, options: any = {}) {
    await this.logEvent(action, 'system', details, {
      ...options,
      severity: options.severity || 'MEDIUM',
    })
  }

  static async logSecurityEvent(
    action: string,
    details: any,
    options: any = {}
  ) {
    await this.logEvent(action, 'security', details, {
      ...options,
      severity: 'CRITICAL', // Eventos de segurança são sempre críticos
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'search' || !action) {
      const query: AuditQuery = {
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        userId: searchParams.get('userId') || undefined,
        action: searchParams.get('actionFilter') || undefined,
        resource: searchParams.get('resource') || undefined,
        severity: searchParams.get('severity') || undefined,
        status: searchParams.get('status') || undefined,
        limit: searchParams.get('limit')
          ? parseInt(searchParams.get('limit')!)
          : 100,
        offset: searchParams.get('offset')
          ? parseInt(searchParams.get('offset')!)
          : 0,
      }

      const result = await AuditLogSystem.searchLogs(query)

      return NextResponse.json({
        success: true,
        message: `${result.total} logs encontrados`,
        data: result,
      })
    }

    if (action === 'stats') {
      const days = searchParams.get('days')
        ? parseInt(searchParams.get('days')!)
        : 7
      const stats = await AuditLogSystem.getLogStatistics(days)

      return NextResponse.json({
        success: true,
        message: `Estatísticas dos últimos ${days} dias`,
        data: stats,
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Ação inválida. Use: search, stats',
      },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao processar logs de auditoria',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, resource, details, options } = await request.json()

    if (!action || !resource) {
      return NextResponse.json(
        {
          success: false,
          message: 'Parâmetros obrigatórios: action, resource',
        },
        { status: 400 }
      )
    }

    // Extrair informações da requisição
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await AuditLogSystem.logEvent(action, resource, details, {
      ...options,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      message: 'Evento de auditoria registrado com sucesso',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao registrar evento de auditoria',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

// Exportar o sistema para uso em outros módulos
export { AuditLogSystem }
