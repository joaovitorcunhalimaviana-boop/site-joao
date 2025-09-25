import { NextRequest } from 'next/server'

// ================================
// CONFIGURAÇÕES DE SESSÃO MÉDICA
// ================================

export interface MedicalSessionConfig {
  extendedSessionDuration: string
  autoLogoutDisabled: boolean
  maxConcurrentSessions: number
  sessionWarningTime: number // minutos antes do vencimento para avisar
  allowSessionExtension: boolean
}

export const MEDICAL_SESSION_CONFIG: MedicalSessionConfig = {
  extendedSessionDuration: process.env['JWT_MEDICAL_SESSION_EXPIRY'] || '6h',
  autoLogoutDisabled:
    process.env['AUTO_LOGOUT_DISABLED_FOR_DOCTORS'] === 'true',
  maxConcurrentSessions: 3, // Permite múltiplas sessões para médicos
  sessionWarningTime: 30, // Avisa 30 minutos antes do vencimento
  allowSessionExtension: true, // Permite renovar sessão automaticamente
}

// ================================
// POLÍTICAS DE RETENÇÃO DE DADOS
// ================================

export interface DataRetentionPolicy {
  medicalDataPermanent: boolean
  patientDataRetentionDays: number
  consultationDataRetentionDays: number
  auditLogRetentionDays: number
  backupRetentionDays: number
}

export const DATA_RETENTION_POLICY: DataRetentionPolicy = {
  medicalDataPermanent: process.env['MEDICAL_DATA_PERMANENT'] === 'true',
  patientDataRetentionDays: -1, // Permanente
  consultationDataRetentionDays: -1, // Permanente
  auditLogRetentionDays: parseInt(
    process.env['AUDIT_LOG_RETENTION_DAYS'] || '2555'
  ), // 7 anos
  backupRetentionDays: parseInt(process.env['BACKUP_RETENTION_DAYS'] || '365'), // 1 ano
}

// ================================
// UTILITÁRIOS DE SESSÃO MÉDICA
// ================================

export class MedicalSessionManager {
  /**
   * Verifica se o usuário é médico e deve ter sessão estendida
   */
  static shouldUseExtendedSession(userRole: string): boolean {
    return userRole === 'DOCTOR' && MEDICAL_SESSION_CONFIG.autoLogoutDisabled
  }

  /**
   * Calcula o tempo de expiração baseado no tipo de usuário
   */
  static getSessionExpiry(userRole: string): string {
    if (this.shouldUseExtendedSession(userRole)) {
      return MEDICAL_SESSION_CONFIG.extendedSessionDuration
    }
    return process.env['JWT_ACCESS_TOKEN_EXPIRY'] || '15m'
  }

  /**
   * Verifica se a sessão deve ser renovada automaticamente
   */
  static shouldAutoRenewSession(
    userRole: string,
    timeUntilExpiry: number
  ): boolean {
    if (!this.shouldUseExtendedSession(userRole)) {
      return false
    }

    // Renova automaticamente se restam menos de 30 minutos
    const warningTimeMs = MEDICAL_SESSION_CONFIG.sessionWarningTime * 60 * 1000
    return (
      timeUntilExpiry < warningTimeMs &&
      MEDICAL_SESSION_CONFIG.allowSessionExtension
    )
  }

  /**
   * Extrai informações da sessão médica do request
   */
  static extractMedicalSessionInfo(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || ''
    const isInConsultation = request.headers.get('x-in-consultation') === 'true'
    const patientId = request.headers.get('x-current-patient-id')

    return {
      userAgent,
      isInConsultation,
      patientId,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Verifica se os dados devem ser retidos permanentemente
   */
  static shouldRetainDataPermanently(dataType: string): boolean {
    if (!DATA_RETENTION_POLICY.medicalDataPermanent) {
      return false
    }

    const medicalDataTypes = [
      'patient',
      'consultation',
      'medical-record',
      'prescription',
      'medical-attachment',
      'appointment',
      'diagnosis',
      'treatment',
    ]

    return medicalDataTypes.some(type => dataType.toLowerCase().includes(type))
  }

  /**
   * Calcula o período de retenção baseado no tipo de dados
   */
  static getRetentionPeriod(dataType: string): number {
    if (this.shouldRetainDataPermanently(dataType)) {
      return -1 // Permanente
    }

    // Períodos específicos para outros tipos de dados
    const retentionMap: Record<string, number> = {
      audit: DATA_RETENTION_POLICY.auditLogRetentionDays,
      backup: DATA_RETENTION_POLICY.backupRetentionDays,
      session: 30, // Logs de sessão por 30 dias
      error: 90, // Logs de erro por 90 dias
      default: 365, // Padrão de 1 ano
    }

    for (const [key, days] of Object.entries(retentionMap)) {
      if (dataType.toLowerCase().includes(key)) {
        return days
      }
    }

    return retentionMap['default']
  }
}

// ================================
// MIDDLEWARE DE SESSÃO MÉDICA
// ================================

export class MedicalSessionMiddleware {
  /**
   * Aplica políticas específicas para sessões médicas
   */
  static applyMedicalSessionPolicies(userRole: string, sessionData: any) {
    if (userRole !== 'DOCTOR') {
      return sessionData
    }

    return {
      ...sessionData,
      extendedSession: true,
      autoLogoutDisabled: MEDICAL_SESSION_CONFIG.autoLogoutDisabled,
      sessionDuration: MEDICAL_SESSION_CONFIG.extendedSessionDuration,
      maxConcurrentSessions: MEDICAL_SESSION_CONFIG.maxConcurrentSessions,
      allowSessionExtension: MEDICAL_SESSION_CONFIG.allowSessionExtension,
    }
  }

  /**
   * Valida se a sessão médica ainda é válida
   */
  static validateMedicalSession(sessionData: any): boolean {
    if (!sessionData.extendedSession) {
      return true // Não é sessão médica, usar validação padrão
    }

    // Sessões médicas têm validação mais flexível
    const now = Date.now()
    const sessionAge = now - new Date(sessionData.createdAt).getTime()
    const maxAge = 6 * 60 * 60 * 1000 // 6 horas em ms

    return sessionAge < maxAge
  }
}

export default {
  MEDICAL_SESSION_CONFIG,
  DATA_RETENTION_POLICY,
  MedicalSessionManager,
  MedicalSessionMiddleware,
}
