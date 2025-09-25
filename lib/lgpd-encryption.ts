import crypto from 'crypto'
import { prisma } from './database'

// ================================
// SERVIÇO DE CRIPTOGRAFIA LGPD
// ================================

export interface EncryptionMetadata {
  algorithm: string
  keyVersion: string
  encryptedAt: Date
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED'
}

export interface EncryptedData {
  data: string
  metadata: EncryptionMetadata
}

export class LGPDEncryptionService {
  private static readonly ALGORITHMS = {
    'aes-256-gcm': { keySize: 32, ivSize: 16 },
    'aes-256-cbc': { keySize: 32, ivSize: 16 },
    'chacha20-poly1305': { keySize: 32, ivSize: 12 },
  }

  private static readonly DATA_CLASSIFICATION_ALGORITHMS = {
    PUBLIC: 'aes-256-cbc',
    INTERNAL: 'aes-256-gcm',
    CONFIDENTIAL: 'aes-256-gcm',
    RESTRICTED: 'chacha20-poly1305',
  }

  // Chaves de criptografia por versão (rotação de chaves)
  private static getEncryptionKey(version: string = 'v1'): Buffer {
    const keyEnvVar = `ENCRYPTION_KEY_${version.toUpperCase()}`
    const key = process.env[keyEnvVar] || process.env['ENCRYPTION_KEY']

    if (!key) {
      throw new Error(`Chave de criptografia não encontrada: ${keyEnvVar}`)
    }

    return Buffer.from(key, 'hex')
  }

  // Criptografia com classificação de dados
  static encrypt(
    plaintext: string,
    classification:
      | 'PUBLIC'
      | 'INTERNAL'
      | 'CONFIDENTIAL'
      | 'RESTRICTED' = 'CONFIDENTIAL',
    keyVersion: string = 'v1'
  ): EncryptedData {
    if (!plaintext) {
      throw new Error('Texto para criptografia não pode estar vazio')
    }

    const algorithm = this.DATA_CLASSIFICATION_ALGORITHMS[classification]
    const key = this.getEncryptionKey(keyVersion)
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    let authTag: Buffer | null = null
    if (algorithm.includes('gcm')) {
      authTag = (cipher as any).getAuthTag()
    }

    const result =
      iv.toString('hex') +
      ':' +
      (authTag ? authTag.toString('hex') : '') +
      ':' +
      encrypted

    return {
      data: result,
      metadata: {
        algorithm,
        keyVersion,
        encryptedAt: new Date(),
        dataClassification: classification,
      },
    }
  }

  // Descriptografia com verificação de integridade
  static decrypt(encryptedData: EncryptedData | string): string {
    let data: string
    let metadata: EncryptionMetadata

    if (typeof encryptedData === 'string') {
      // Compatibilidade com formato antigo
      return this.legacyDecrypt(encryptedData)
    }

    data = encryptedData.data
    metadata = encryptedData.metadata

    const algorithm = metadata.algorithm
    const keyVersion = metadata.keyVersion
    const key = this.getEncryptionKey(keyVersion)

    const parts = data.split(':')

    if (parts.length < 3) {
      throw new Error('Formato de dados criptografados inválido')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const authTag = parts[1] ? Buffer.from(parts[1], 'hex') : null
    const encryptedText = parts[2]

    const decipher = crypto.createDecipheriv(algorithm, key, iv)

    if (authTag && algorithm.includes('gcm')) {
      ;(decipher as any).setAuthTag(authTag)
    }

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  // Descriptografia de formato legado
  private static legacyDecrypt(encryptedData: string): string {
    const parts = encryptedData.split(':')

    if (parts.length !== 3) {
      throw new Error('Formato legado inválido')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]

    const key = this.getEncryptionKey('v1')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  // Hash seguro para indexação (permite busca sem descriptografar)
  static createSearchableHash(plaintext: string, salt?: string): string {
    const actualSalt = salt || process.env['SEARCH_SALT'] || 'default-salt'
    return crypto
      .pbkdf2Sync(plaintext.toLowerCase(), actualSalt, 10000, 32, 'sha256')
      .toString('hex')
  }

  // Verificar se dados precisam ser re-criptografados (rotação de chaves)
  static needsReencryption(metadata: EncryptionMetadata): boolean {
    const currentVersion = process.env['CURRENT_KEY_VERSION'] || 'v1'
    const maxAge =
      parseInt(process.env['ENCRYPTION_MAX_AGE_DAYS'] || '365') *
      24 *
      60 *
      60 *
      1000

    const isOldVersion = metadata.keyVersion !== currentVersion
    const isOldEncryption = Date.now() - metadata.encryptedAt.getTime() > maxAge

    return isOldVersion || isOldEncryption
  }

  // Re-criptografar dados com nova chave/algoritmo
  static reencrypt(
    encryptedData: EncryptedData,
    newClassification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED'
  ): EncryptedData {
    const plaintext = this.decrypt(encryptedData)
    const classification =
      newClassification || encryptedData.metadata.dataClassification
    const newVersion = process.env['CURRENT_KEY_VERSION'] || 'v1'

    return this.encrypt(plaintext, classification, newVersion)
  }
}

// ================================
// SERVIÇO DE ANONIMIZAÇÃO LGPD
// ================================

export class LGPDAnonymizationService {
  // Anonimizar CPF (manter apenas dígitos verificadores)
  static anonymizeCPF(cpf: string): string {
    if (!cpf || cpf.length < 11) return '***.***.***-**'
    const cleaned = cpf.replace(/\D/g, '')
    return `***.***.*${cleaned.slice(-2)}`
  }

  // Anonimizar email (manter domínio)
  static anonymizeEmail(email: string): string {
    if (!email || !email.includes('@')) return '***@***.***'
    const [local, domain] = email.split('@')
    const anonymizedLocal =
      local.length > 2
        ? local[0] + '*'.repeat(local.length - 2) + local.slice(-1)
        : '***'
    return `${anonymizedLocal}@${domain}`
  }

  // Anonimizar telefone (manter DDD)
  static anonymizePhone(phone: string): string {
    if (!phone) return '(**) ****-****'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 10) {
      const ddd = cleaned.slice(0, 2)
      return `(${ddd}) ****-****`
    }
    return '(**) ****-****'
  }

  // Anonimizar nome (manter primeira letra de cada palavra)
  static anonymizeName(name: string): string {
    if (!name) return '*** ***'
    return name
      .split(' ')
      .map(word =>
        word.length > 0
          ? word[0] + '*'.repeat(Math.max(0, word.length - 1))
          : ''
      )
      .join(' ')
  }

  // Pseudonimização reversível (com chave)
  static pseudonymize(data: string, key?: string): string {
    const pseudoKey =
      key || process.env['PSEUDONYMIZATION_KEY'] || 'default-pseudo-key'
    return crypto.createHmac('sha256', pseudoKey).update(data).digest('hex')
  }
}

// ================================
// SERVIÇO DE AUDITORIA LGPD
// ================================

export class LGPDAuditService {
  // Log de acesso a dados pessoais
  static async logDataAccess({
    userId,
    dataSubject,
    dataType,
    purpose,
    legalBasis,
    ipAddress,
    userAgent,
  }: {
    userId: string
    dataSubject: string // ID do titular dos dados
    dataType: string // Tipo de dado acessado
    purpose: string // Finalidade do acesso
    legalBasis: string // Base legal LGPD
    ipAddress?: string
    userAgent?: string
  }) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DATA_ACCESS',
        resource: 'PersonalData',
        resourceId: dataSubject,
        details: JSON.stringify({
          dataType,
          purpose,
          legalBasis,
          timestamp: new Date().toISOString(),
        }),
        ipAddress,
        userAgent,
        severity: 'MEDIUM',
      },
    })
  }

  // Log de modificação de dados pessoais
  static async logDataModification({
    userId,
    dataSubject,
    dataType,
    operation,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
  }: {
    userId: string
    dataSubject: string
    dataType: string
    operation: 'CREATE' | 'UPDATE' | 'DELETE'
    oldValue?: string
    newValue?: string
    ipAddress?: string
    userAgent?: string
  }) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: `DATA_${operation}`,
        resource: 'PersonalData',
        resourceId: dataSubject,
        details: JSON.stringify({
          dataType,
          operation,
          oldValueHash: oldValue
            ? crypto.createHash('sha256').update(oldValue).digest('hex')
            : null,
          newValueHash: newValue
            ? crypto.createHash('sha256').update(newValue).digest('hex')
            : null,
          timestamp: new Date().toISOString(),
        }),
        ipAddress,
        userAgent,
        severity: operation === 'DELETE' ? 'HIGH' : 'MEDIUM',
      },
    })
  }

  // Relatório de conformidade LGPD
  static async generateComplianceReport(startDate: Date, endDate: Date) {
    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        action: {
          startsWith: 'DATA_',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const summary = {
      totalAccesses: logs.filter(log => log.action === 'DATA_ACCESS').length,
      totalModifications: logs.filter(log => log.action.includes('UPDATE'))
        .length,
      totalDeletions: logs.filter(log => log.action.includes('DELETE')).length,
      uniqueDataSubjects: new Set(logs.map(log => log.resourceId)).size,
      complianceScore: this.calculateComplianceScore(logs),
    }

    return {
      period: { startDate, endDate },
      summary,
      logs: logs.map(log => ({
        ...log,
        details: JSON.parse(log.details || '{}'),
      })),
    }
  }

  private static calculateComplianceScore(logs: any[]): number {
    // Algoritmo simples de score de conformidade
    const totalLogs = logs.length
    if (totalLogs === 0) return 100

    const violations = logs.filter(log => {
      const details = JSON.parse(log.details || '{}')
      return !details.legalBasis || !details.purpose
    }).length

    return Math.max(0, Math.round((1 - violations / totalLogs) * 100))
  }
}

// ================================
// MIDDLEWARE DE PROTEÇÃO LGPD
// ================================

export class LGPDProtectionMiddleware {
  // Verificar consentimento antes de processar dados
  static async checkConsent(userId: string, purpose: string): Promise<boolean> {
    // Implementar verificação de consentimento
    // Por enquanto, retorna true (implementar conforme necessário)
    return true
  }

  // Aplicar minimização de dados
  static minimizeData<T extends Record<string, any>>(
    data: T,
    allowedFields: string[]
  ): Partial<T> {
    const minimized: Partial<T> = {}

    for (const field of allowedFields) {
      if (field in data) {
        minimized[field as keyof T] = data[field]
      }
    }

    return minimized
  }

  // Aplicar retenção de dados
  static shouldRetainData(
    createdAt: Date,
    retentionPeriodDays: number,
    dataType?: string
  ): boolean {
    // DADOS MÉDICOS: RETENÇÃO PERMANENTE
    if (
      process.env['MEDICAL_DATA_PERMANENT'] === 'true' &&
      (dataType?.includes('medical') ||
        dataType?.includes('patient') ||
        dataType?.includes('consultation'))
    ) {
      return true // Dados médicos nunca são excluídos
    }

    // Retenção permanente se configurado como -1
    if (retentionPeriodDays === -1) {
      return true
    }

    const retentionPeriodMs = retentionPeriodDays * 24 * 60 * 60 * 1000
    return Date.now() - createdAt.getTime() < retentionPeriodMs
  }
}
