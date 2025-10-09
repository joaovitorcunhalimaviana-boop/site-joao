// Middleware de Auditoria para Sistema Médico
// Integra automaticamente logs de auditoria em todas as operações críticas

interface AuditOptions {
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status?: 'SUCCESS' | 'FAILURE' | 'WARNING'
}

// Sistema de Auditoria Integrado
export class AuditMiddleware {
  
  // Log de operações de pacientes
  static async logPatientOperation(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    patientData: any,
    options: AuditOptions = {}
  ): Promise<void> {
    try {
      const details = {
        patientId: patientData.id,
        patientName: patientData.name,
        patientEmail: patientData.email,
        operation: action,
        timestamp: new Date().toISOString(),
        changes: action === 'UPDATE' ? patientData.changes : undefined
      }
      
      await this.sendAuditLog('patient_operation', 'patient', details, {
        ...options,
        resourceId: patientData.id,
        severity: 'HIGH' // Operações de paciente são sempre de alta prioridade
      })
      
    } catch (error) {
      console.error('❌ [Audit] Patient audit log failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Log de operações de consultas
  static async logAppointmentOperation(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    appointmentData: any,
    options: AuditOptions = {}
  ): Promise<void> {
    try {
      const details = {
        appointmentId: appointmentData.id,
        patientId: appointmentData.patientId,
        patientName: appointmentData.patient?.name,
        date: appointmentData.date,
        time: appointmentData.time,
        operation: action,
        timestamp: new Date().toISOString(),
        changes: action === 'UPDATE' ? appointmentData.changes : undefined
      }
      
      await this.sendAuditLog('appointment_operation', 'appointment', details, {
        ...options,
        resourceId: appointmentData.id,
        severity: 'HIGH'
      })
      
    } catch (error) {
      console.error('❌ [Audit] Consultation audit log failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Log de operações de prontuários médicos
  static async logMedicalRecordOperation(
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW',
    recordData: any,
    options: AuditOptions = {}
  ): Promise<void> {
    try {
      const details = {
        recordId: recordData.id,
        patientId: recordData.patientId,
        patientName: recordData.patient?.name,
        diagnosis: recordData.diagnosis,
        operation: action,
        timestamp: new Date().toISOString(),
        changes: action === 'UPDATE' ? recordData.changes : undefined
      }
      
      await this.sendAuditLog('medical_record_operation', 'medical_record', details, {
        ...options,
        resourceId: recordData.id,
        severity: 'CRITICAL' // Prontuários médicos são críticos
      })
      
    } catch (error) {
      console.error('❌ [Audit] Medical record audit log failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Log de operações do sistema
  static async logSystemOperation(
    action: string,
    details: any,
    options: AuditOptions = {}
  ): Promise<void> {
    try {
      const systemDetails = {
        operation: action,
        timestamp: new Date().toISOString(),
        ...details
      }
      
      await this.sendAuditLog(action, 'system', systemDetails, {
        ...options,
        severity: options.severity || 'MEDIUM'
      })
      
    } catch (error) {
      console.error('❌ [Audit] System audit log failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Log de operações de segurança
  static async logSecurityEvent(
    action: string,
    details: any,
    options: AuditOptions = {}
  ): Promise<void> {
    try {
      const securityDetails = {
        operation: action,
        timestamp: new Date().toISOString(),
        ...details
      }
      
      await this.sendAuditLog(action, 'security', securityDetails, {
        ...options,
        severity: 'CRITICAL' // Eventos de segurança são sempre críticos
      })
      
    } catch (error) {
      console.error('❌ [Audit] Security audit log failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Log de operações de backup
  static async logBackupOperation(
    action: 'START' | 'SUCCESS' | 'FAILURE' | 'SCHEDULE',
    details: any,
    options: AuditOptions = {}
  ): Promise<void> {
    try {
      const backupDetails = {
        operation: action,
        timestamp: new Date().toISOString(),
        ...details
      }
      
      await this.sendAuditLog(`backup_${action.toLowerCase()}`, 'backup', backupDetails, {
        ...options,
        severity: action === 'FAILURE' ? 'CRITICAL' : 'HIGH'
      })
      
    } catch (error) {
      console.error('❌ [Audit] Backup audit log failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Enviar log para o sistema de auditoria
  private static async sendAuditLog(
    action: string,
    resource: string,
    details: any,
    options: AuditOptions
  ): Promise<void> {
    try {
      // Se estamos no lado do servidor, usar diretamente o sistema de auditoria
      if (typeof window === 'undefined') {
        const { AuditLogSystem } = await import('../app/api/audit-logs/route')
        await AuditLogSystem.logEvent(action, resource, details, options)
      } else {
        // Se estamos no cliente, fazer requisição para a API
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action,
            resource,
            details,
            options
          })
        })
      }
    } catch (error) {
      console.error('❌ [Audit] Failed to send audit log:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Wrapper para operações com auditoria automática
  static async withAudit<T>(
    operation: () => Promise<T>,
    auditInfo: {
      action: string
      resource: string
      details: any
      options?: AuditOptions
    }
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      // Log de início da operação
      await this.sendAuditLog(
        `${auditInfo.action}_start`,
        auditInfo.resource,
        { ...auditInfo.details, startTime: new Date().toISOString() },
        { ...auditInfo.options, status: 'SUCCESS' }
      )
      
      // Executar operação
      const result = await operation()
      
      // Log de sucesso
      const duration = Date.now() - startTime
      await this.sendAuditLog(
        `${auditInfo.action}_success`,
        auditInfo.resource,
        { 
          ...auditInfo.details, 
          duration,
          endTime: new Date().toISOString(),
          result: typeof result === 'object' ? JSON.stringify(result).substring(0, 500) : result
        },
        { ...auditInfo.options, status: 'SUCCESS' }
      )
      
      return result
      
    } catch (error) {
      // Log de erro
      const duration = Date.now() - startTime
      await this.sendAuditLog(
        `${auditInfo.action}_failure`,
        auditInfo.resource,
        { 
          ...auditInfo.details, 
          duration,
          endTime: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        { ...auditInfo.options, status: 'FAILURE', severity: 'CRITICAL' }
      )
      
      throw error
    }
  }
  
  // Extrair informações da requisição para auditoria
  static extractRequestInfo(request?: Request): AuditOptions {
    if (!request) return {}
    
    return {
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }
  }
  
  // Middleware para Next.js API routes
  static createApiMiddleware() {
    return (handler: Function) => {
      return async (req: any, res: any) => {
        const requestInfo = this.extractRequestInfo(req)
        
        // Log da requisição
        await this.logSystemOperation('api_request', {
          method: req.method,
          url: req.url,
          timestamp: new Date().toISOString()
        }, requestInfo)
        
        try {
          const result = await handler(req, res)
          
          // Log de sucesso
          await this.logSystemOperation('api_response_success', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            timestamp: new Date().toISOString()
          }, { ...requestInfo, status: 'SUCCESS' })
          
          return result
          
        } catch (error) {
          // Log de erro
          await this.logSystemOperation('api_response_error', {
            method: req.method,
            url: req.url,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            timestamp: new Date().toISOString()
          }, { ...requestInfo, status: 'FAILURE', severity: 'HIGH' })
          
          throw error
        }
      }
    }
  }
}

// Funções de conveniência para uso direto
export const auditPatient = AuditMiddleware.logPatientOperation
export const auditAppointment = AuditMiddleware.logAppointmentOperation
export const auditMedicalRecord = AuditMiddleware.logMedicalRecordOperation
export const auditSystem = AuditMiddleware.logSystemOperation
export const auditSecurity = AuditMiddleware.logSecurityEvent
export const auditBackup = AuditMiddleware.logBackupOperation
export const withAudit = AuditMiddleware.withAudit