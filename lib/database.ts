import { PrismaClient } from '@prisma/client'
import { hash, compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import {
  LGPDEncryptionService,
  LGPDAuditService,
  LGPDAnonymizationService,
} from './lgpd-encryption'

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
    // Criptografar dados sensíveis com LGPD
    const encryptedData = {
      ...data,
      cpf: data.cpf
        ? LGPDEncryptionService.encrypt(data.cpf, 'RESTRICTED').data
        : null,
      email: data.email
        ? LGPDEncryptionService.encrypt(data.email, 'CONFIDENTIAL').data
        : null,
      phone: LGPDEncryptionService.encrypt(data.phone, 'CONFIDENTIAL').data,
      whatsapp: LGPDEncryptionService.encrypt(data.whatsapp, 'CONFIDENTIAL')
        .data,
    }

    const patient = await prisma.patient.create({
      data: encryptedData,
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
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
        },
        consultations: {
          orderBy: { startTime: 'desc' },
        },
        medicalRecords: {
          orderBy: { createdAt: 'desc' },
        },
        medicalAttachments: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    })

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

    // Descriptografar dados sensíveis com LGPD
    return {
      ...patient,
      cpf: patient.cpf ? LGPDEncryptionService.decrypt(patient.cpf) : null,
      email: patient.email
        ? LGPDEncryptionService.decrypt(patient.email)
        : null,
      phone: LGPDEncryptionService.decrypt(patient.phone),
      whatsapp: LGPDEncryptionService.decrypt(patient.whatsapp),
    }
  }

  static async getAllPatients(page = 1, limit = 50, search?: string) {
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            // Note: CPF search would need special handling due to encryption
          ],
        }
      : {}

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          cpf: true,
          email: true,
          phone: true,
          whatsapp: true,
          birthDate: true,
          gender: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              appointments: true,
              consultations: true,
            },
          },
        },
      }),
      prisma.patient.count({ where }),
    ])

    return {
      patients: patients.map(patient => ({
        ...patient,
        cpf: patient.cpf ? EncryptionService.decrypt(patient.cpf) : null,
        email: patient.email ? EncryptionService.decrypt(patient.email) : null,
        phone: EncryptionService.decrypt(patient.phone),
        whatsapp: EncryptionService.decrypt(patient.whatsapp),
      })),
      total,
      pages: Math.ceil(total / limit),
    }
  }

  static async updatePatient(id: string, data: any) {
    // Criptografar dados sensíveis se fornecidos
    const encryptedData = { ...data }
    if (data.cpf) encryptedData.cpf = EncryptionService.encrypt(data.cpf)
    if (data.email) encryptedData.email = EncryptionService.encrypt(data.email)
    if (data.phone) encryptedData.phone = EncryptionService.encrypt(data.phone)
    if (data.whatsapp)
      encryptedData.whatsapp = EncryptionService.encrypt(data.whatsapp)

    const patient = await prisma.patient.update({
      where: { id },
      data: encryptedData,
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
    const patient = await prisma.patient.findUnique({
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
    await prisma.patient.delete({ where: { id } })

    // Log de auditoria
    await AuditService.log({
      action: 'DELETE',
      resource: 'Patient',
      resourceId: id,
      details: JSON.stringify({ patientName: patient.name }),
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
    const currentPatient = await prisma.patient.findUnique({ where: { id } })
    if (!currentPatient) throw new Error('Paciente não encontrado')

    // Descriptografar dados atuais para anonimização
    const currentCpf = currentPatient.cpf
      ? LGPDEncryptionService.decrypt(currentPatient.cpf)
      : null
    const currentEmail = currentPatient.email
      ? LGPDEncryptionService.decrypt(currentPatient.email)
      : null
    const currentPhone = LGPDEncryptionService.decrypt(currentPatient.phone)
    const currentWhatsapp = LGPDEncryptionService.decrypt(
      currentPatient.whatsapp
    )

    const anonymizedData = {
      name: LGPDAnonymizationService.anonymizeName(currentPatient.name),
      cpf: currentCpf
        ? LGPDEncryptionService.encrypt(
            LGPDAnonymizationService.anonymizeCPF(currentCpf),
            'PUBLIC'
          ).data
        : null,
      email: currentEmail
        ? LGPDEncryptionService.encrypt(
            LGPDAnonymizationService.anonymizeEmail(currentEmail),
            'PUBLIC'
          ).data
        : null,
      phone: LGPDEncryptionService.encrypt(
        LGPDAnonymizationService.anonymizePhone(currentPhone),
        'PUBLIC'
      ).data,
      whatsapp: LGPDEncryptionService.encrypt(
        LGPDAnonymizationService.anonymizePhone(currentWhatsapp),
        'PUBLIC'
      ).data,
      address: null,
      city: null,
      state: null,
      zipCode: null,
    }

    const patient = await prisma.patient.update({
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
          name: currentPatient.name,
          cpf: currentCpf,
        }),
        newValue: JSON.stringify({
          name: anonymizedData.name,
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
      resource: 'Patient',
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
        patient: true,
        doctor: true,
      },
    })

    // Log de auditoria
    await AuditService.log({
      action: 'CREATE',
      resource: 'Consultation',
      resourceId: consultation.id,
      details: JSON.stringify({
        patientId: data.patientId,
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
        patientId: true,
        doctorId: true,
        startTime: true,
        endTime: true,
        type: true,
        status: true,
        notes: true,
        diagnosis: true,
        treatment: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            email: true,
            phone: true,
            birthDate: true,
            gender: true,
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
        medicalRecord: {
          select: {
            id: true,
            recordNumber: true,
            allergies: true,
            medications: true,
            medicalHistory: true,
            familyHistory: true,
          },
        },
        prescriptions: {
          select: {
            id: true,
            medication: true,
            dosage: true,
            frequency: true,
            duration: true,
            instructions: true,
            createdAt: true,
          },
        },
        medicalAttachments: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            description: true,
            createdAt: true,
          },
        },
      },
    })
  }

  static async getPatientConsultations(patientId: string) {
    return await prisma.consultation.findMany({
      where: { patientId },
      orderBy: { startTime: 'desc' },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        type: true,
        status: true,
        notes: true,
        diagnosis: true,
        treatment: true,
        createdAt: true,
        doctor: {
          select: {
            id: true,
            name: true,
            crm: true,
            specialties: true,
          },
        },
        medicalRecord: {
          select: {
            id: true,
            recordNumber: true,
            allergies: true,
            medications: true,
          },
        },
        prescriptions: {
          select: {
            id: true,
            medication: true,
            dosage: true,
            frequency: true,
            duration: true,
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
        patient: true,
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
        patientId: data.patientId,
        consultationId: data.consultationId,
      }),
    })

    return record
  }

  static async getPatientMedicalHistory(patientId: string) {
    return await prisma.medicalRecord.findMany({
      where: { patientId },
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
        patientId: data.patientId,
        filename: data.filename,
        category: data.category,
      }),
    })

    return attachment
  }

  static async getPatientAttachments(patientId: string) {
    return await prisma.medicalAttachment.findMany({
      where: { patientId },
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
