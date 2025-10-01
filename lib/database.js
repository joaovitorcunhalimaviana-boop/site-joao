const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

class AuditService {
  static async log(data) {
    try {
      return await prisma.auditLog.create({
        data: {
          action: data.action,
          resource: data.resource,
          details: data.details || '',
          severity: data.severity || 'LOW',
          userId: data.userId || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null
        }
      })
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error)
      return null
    }
  }
}

class EncryptionService {
  static encrypt(data) {
    return data // Implementação simplificada
  }
  
  static decrypt(data) {
    return data // Implementação simplificada
  }
}

module.exports = {
  prisma,
  AuditService,
  EncryptionService
}
