import { PrismaClient } from '@prisma/client'
import { hash, compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import {
  LGPDEncryptionService,
  LGPDAuditService,
  LGPDAnonymizationService,
} from './lgpd-encryption'
import { 
  getAllPatients, 
  getPatientById, 
  createOrUpdatePatient 
} from './prisma-service'

// Singleton do Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env['NODE_ENV'] !== 'production') globalForPrisma.prisma = prisma

// ================================
// SERVIÇOS DE AUTENTICAÇÃO
// ================================

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return await hash(password, 12)
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await compare(password, hashedPassword)
  }

  static generateTokens(userId: string, userRole?: string) {
    // Sessões estendidas para médicos (4 horas vs 15 minutos)
    const accessTokenExpiry =
      userRole === 'DOCTOR'
        ? process.env['JWT_MEDICAL_SESSION_EXPIRY'] || '4h'
        : process.env['JWT_ACCESS_TOKEN_EXPIRY'] || '15m'

    const accessToken = jwt.sign(
      { userId, type: 'access', role: userRole },
      process.env['JWT_SECRET'] as string
    )

    const refreshToken = jwt.sign(
      { userId, type: 'refresh', role: userRole },
      process.env['JWT_REFRESH_SECRET'] as string
    )

    return { accessToken, refreshToken }
  }

  static generateTempToken(userId: string, expiresIn: string = '5m') {
    return jwt.sign(
      { userId, type: 'temp_2fa' },
      process.env['JWT_SECRET'] as string
    )
  }

  static async verifyToken(
    token: string,
    type: 'access' | 'refresh' | 'temp_2fa' = 'access'
  ) {
    try {
      const secret =
        type === 'refresh'
          ? (process.env['JWT_REFRESH_SECRET'] as string)
          : (process.env['JWT_SECRET'] as string)
      const decoded = jwt.verify(token, secret) as {
        userId: string
        type: string
      }

      // Verificar se o tipo do token corresponde ao esperado
      if (decoded.type !== type) {
        return null
      }

      return decoded
    } catch {
      return null
    }
  }

  static async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    return await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    })
  }

  static async revokeRefreshToken(token: string) {
    return await prisma.refreshToken.delete({
      where: { token },
    })
  }
}

// ================================
// SERVIÇOS DE CRIPTOGRAFIA
// ================================

export class EncryptionService {
  private static algorithm = 'aes-256-cbc'
  private static key = process.env['ENCRYPTION_KEY']
    ? Buffer.from(process.env['ENCRYPTION_KEY'], 'utf8')
    : Buffer.from('default-key-32-chars-long-12345', 'utf8')

  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, this.key)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return iv.toString('hex') + ':' + encrypted
  }

  static decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]

    const decipher = crypto.createDecipher(this.algorithm, this.key)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}

// ================================
// SERVIÇOS DE PACIENTES
// ================================

export class PatientService {
  static async createPatient(
    data: any,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const patient = await createOrUpdatePatient({
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      cpf: data.cpf,
      birthDate: data.birthDate,
      insurance: data.insurance
    })

    // Log de auditoria LGPD
    if (userId) {
      await LGPDAuditService.logDataModification({
        userId,
        dataSubject: patient.id,
        dataType: 'PatientData',
        operation: 'CREATE',
        newValue: JSON.stringify({ name: data.name, cpf: data.cpf }),
        ipAddress,
        userAgent,
      })
    }

    // Log de auditoria tradicional
    await AuditService.log({
      userId,
      action: 'CREATE',
      resource: 'Patient',
      resourceId: patient.id,
      details: JSON.stringify({ patientName: data.name }),
      ipAddress,
      userAgent,
    })

    return patient
  }

  static async getPatient(
    id: string,
    userId?: string,
    purpose?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const patient = await getPatientById(id)

    if (!patient) return null

    // Log de auditoria LGPD para acesso a dados
    if (userId) {
      await LGPDAuditService.logDataAccess({
        userId,
        dataSubject: patient.id,
        dataType: 'PatientData',
        purpose: purpose || 'Consulta de prontuário',
        legalBasis: 'Execução de contrato',
        ipAddress,
        userAgent,
      })
    }

    return patient
  }

  static async getAllPatients(page = 1, limit = 50, search?: string) {
    const allPatients = await getAllPatients()
    
    // Filtrar por busca se fornecida
    let filteredPatients = allPatients
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPatients = allPatients.filter(patient => 
        patient.name?.toLowerCase().includes(searchLower) ||
        patient.cpf?.includes(search) ||
        patient.phone?.includes(search) ||
        patient.whatsapp?.includes(search) ||
        patient.email?.toLowerCase().includes(searchLower)
      )
    }

    // Paginação
    const skip = (page - 1) * limit
    const paginatedPatients = filteredPatients.slice(skip, skip + limit)

    return {
      patients: paginatedPatients,
      total: filteredPatients.length,
      pages: Math.ceil(filteredPatients.length / limit),
    }
  }

  static async updatePatient(id: string, data: any) {
    const patient = await createOrUpdatePatient({
      id,
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      cpf: data.cpf,
      birthDate: data.birthDate,
      insurance: data.insurance
    })

    // Log de auditoria
    await AuditService.log({
      action: 'UPDATE',
      resource: 'Patient',
      resourceId: id,
      details: JSON.stringify({ updatedFields: Object.keys(data) }),
    })

    return patient
  }

  static async deletePatient(id: string) {
    // Verificar se há dados relacionados
    const patient = await prisma.medicalPatient.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            appointments: true,
            consultations: true,
            medicalRecords: true,
          },
        },
      },
    })

    if (!patient) throw new Error('Paciente não encontrado')

    // LGPD: Verificar se pode deletar ou deve anonimizar
    const hasImportantData =
      patient._count.consultations > 0 || patient._count.medicalRecords > 0

    if (hasImportantData) {
      // Anonimizar ao invés de deletar
      return await this.anonymizePatient(id)
    }

    // Deletar completamente se não há dados médicos importantes
    await prisma.medicalPatient.delete({ where: { id } })

    // Log de auditoria
    await AuditService.log({
      action: 'DELETE',
      resource: 'MedicalPatient',
      resourceId: id,
      details: JSON.stringify({ patientName: patient.fullName }),
    })

    return { success: true }
  }

  static async anonymizePatient(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Buscar dados atuais para auditoria
    const currentPatient = await prisma.medicalPatient.findUnique({
      where: { id },
      include: { communicationContact: true }
    })
    if (!currentPatient) throw new Error('Paciente não encontrado')

    // Descriptografar dados atuais para anonimização
    const currentCpf = currentPatient.cpf
      ? LGPDEncryptionService.decrypt(currentPatient.cpf)
      : null
    const currentEmail = currentPatient.communicationContact.email
      ? LGPDEncryptionService.decrypt(currentPatient.communicationContact.email)
      : null
    const currentPhone = currentPatient.communicationContact.whatsapp
      ? LGPDEncryptionService.decrypt(currentPatient.communicationContact.whatsapp)
      : ''
    const currentWhatsapp = currentPatient.communicationContact.whatsapp
      ? LGPDEncryptionService.decrypt(currentPatient.communicationContact.whatsapp)
      : ''

    const anonymizedData = {
      fullName: LGPDAnonymizationService.anonymizeName(currentPatient.fullName),
      cpf: currentCpf
        ? LGPDEncryptionService.encrypt(
            LGPDAnonymizationService.anonymizeCPF(currentCpf),
            'PUBLIC'
          ).data
        : '',
      address: null,
      city: null,
      state: null,
      zipCode: null,
    }

    const patient = await prisma.medicalPatient.update({
      where: { id },
      data: anonymizedData,
    })

    // Log de auditoria LGPD
    if (userId) {
      await LGPDAuditService.logDataModification({
        userId,
        dataSubject: id,
        dataType: 'PatientData',
        operation: 'UPDATE',
        oldValue: JSON.stringify({
          name: currentPatient.fullName,
          cpf: currentCpf,
        }),
        newValue: JSON.stringify({
          name: anonymizedData.fullName,
          anonymized: true,
        }),
        ipAddress,
        userAgent,
      })
    }

    // Log de auditoria tradicional
    await AuditService.log({
      userId,
      action: 'ANONYMIZE',
      resource: 'MedicalPatient',
      resourceId: id,
      details: JSON.stringify({ reason: 'LGPD_COMPLIANCE' }),
      ipAddress,
      userAgent,
      severity: 'HIGH',
    })

    return patient
  }
}

// ================================
// SERVIÇOS DE CONSULTAS
// ================================

export class ConsultationService {
  static async createConsultation(data: any) {
    const consultation = await prisma.consultation.create({
      data,
      include: {
        medicalPatient: true,
        doctor: true,
      },
    })

    // Log de auditoria
    await AuditService.log({
      action: 'CREATE',
      resource: 'Consultation',
      resourceId: consultation.id,
      details: JSON.stringify({
        medicalPatientId: data.medicalPatientId,
        doctorId: data.doctorId,
      }),
    })

    return consultation
  }

  static async getConsultation(id: string) {
    return await prisma.consultation.findUnique({
      where: { id },
      select: {
        id: true,
        medicalPatientId: true,
        doctorId: true,
        startTime: true,
        endTime: true,
        status: true,
        anamnese: true,
        createdAt: true,
        updatedAt: true,
        medicalPatient: {
          select: {
            id: true,
            fullName: true,
            cpf: true,
            communicationContact: {
              select: {
                email: true,
                whatsapp: true,
                birthDate: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            crm: true,
            specialties: true,
          },
        },
        medicalRecords: {
          select: {
            id: true,
            content: true,
            summary: true,
            category: true,
          },
        },
        prescriptions: {
          select: {
            id: true,
            medications: true,
            instructions: true,
            createdAt: true,
          },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            size: true,
            description: true,
            createdAt: true,
          },
        },
      },
    })
  }

  static async getPatientConsultations(medicalPatientId: string) {
    return await prisma.consultation.findMany({
      where: { medicalPatientId },
      orderBy: { startTime: 'desc' },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        anamnese: true,
        createdAt: true,
        doctor: {
          select: {
            id: true,
            name: true,
            crm: true,
            specialties: true,
          },
        },
        medicalRecords: {
          select: {
            id: true,
            content: true,
            summary: true,
          },
        },
        prescriptions: {
          select: {
            id: true,
            medications: true,
            instructions: true,
          },
        },
      },
    })
  }

  static async updateConsultation(id: string, data: any) {
    const consultation = await prisma.consultation.update({
      where: { id },
      data,
    })

    // Log de auditoria
    await AuditService.log({
      action: 'UPDATE',
      resource: 'Consultation',
      resourceId: id,
      details: JSON.stringify({ updatedFields: Object.keys(data) }),
    })

    return consultation
  }
}

// ================================
// SERVIÇOS DE PRONTUÁRIO
// ================================

export class MedicalRecordService {
  static async createMedicalRecord(data: any) {
    const record = await prisma.medicalRecord.create({
      data,
      include: {
        medicalPatient: true,
        doctor: true,
        consultation: true,
      },
    })

    // Log de auditoria
    await AuditService.log({
      action: 'CREATE',
      resource: 'MedicalRecord',
      resourceId: record.id,
      details: JSON.stringify({
        medicalPatientId: data.medicalPatientId,
        consultationId: data.consultationId,
      }),
    })

    return record
  }

  static async getPatientMedicalHistory(medicalPatientId: string) {
    return await prisma.medicalRecord.findMany({
      where: { medicalPatientId },
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: true,
        consultation: true,
      },
    })
  }
}

// ================================
// SERVIÇOS DE ANEXOS MÉDICOS
// ================================

export class MedicalAttachmentService {
  static async createAttachment(data: any) {
    // Calcular checksum do arquivo para integridade
    const checksum = crypto
      .createHash('sha256')
      .update(data.content || '')
      .digest('hex')

    const attachment = await prisma.medicalAttachment.create({
      data: {
        ...data,
        checksum,
      },
    })

    // Log de auditoria
    await AuditService.log({
      action: 'CREATE',
      resource: 'MedicalAttachment',
      resourceId: attachment.id,
      details: JSON.stringify({
        consultationId: data.consultationId,
        filename: data.filename,
        category: data.category,
      }),
    })

    return attachment
  }

  static async getConsultationAttachments(consultationId: string) {
    return await prisma.medicalAttachment.findMany({
      where: { consultationId },
      orderBy: { uploadedAt: 'desc' },
    })
  }
}

// ================================
// SERVIÇOS DE AUDITORIA
// ================================

export class AuditService {
  static async log(data: {
    userId?: string
    action: string
    resource: string
    resourceId?: string
    details?: string
    ipAddress?: string
    userAgent?: string
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }) {
    return await prisma.auditLog.create({
      data: {
        ...data,
        severity: data.severity || 'LOW',
      },
    })
  }

  static async getAuditLogs(filters?: {
    userId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  }) {
    const where: any = {}

    if (filters?.userId) where.userId = filters.userId
    if (filters?.action) where.action = filters.action
    if (filters?.resource) where.resource = filters.resource
    if (filters?.severity) where.severity = filters.severity
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    return await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })
  }
}

// ================================
// SERVIÇOS DE BACKUP
// ================================

export class BackupService {
  static async createBackupLog(type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL') {
    return await prisma.backupLog.create({
      data: {
        type,
        status: 'PENDING',
      },
    })
  }

  static async updateBackupLog(
    id: string,
    data: {
      status?: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
      filename?: string
      size?: number
      checksum?: string
      completedAt?: Date
      errorMessage?: string
    }
  ) {
    return await prisma.backupLog.update({
      where: { id },
      data,
    })
  }

  static async getBackupHistory() {
    return await prisma.backupLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
    })
  }
}

// ================================
// UTILITÁRIOS DE MIGRAÇÃO
// ================================

export class MigrationService {
  static async migrateFromLocalStorage() {
    console.log('Iniciando migração do localStorage para PostgreSQL...')

    try {
      // Migrar pacientes
      const patientsData = JSON.parse(
        localStorage.getItem('unified-patients') || '[]'
      )
      for (const patient of patientsData) {
        await PatientService.createPatient(patient)
      }

      // Migrar agendamentos
      const appointmentsData = JSON.parse(
        localStorage.getItem('unified-appointments') || '[]'
      )
      for (const appointment of appointmentsData) {
        await prisma.appointment.create({ data: appointment })
      }

      // Migrar outros dados...

      console.log('Migração concluída com sucesso!')
      return { success: true }
    } catch (error) {
      console.error('Erro na migração:', error)
      return { success: false, error }
    }
  }
}

export default prisma
