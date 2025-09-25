import { prisma } from './database'
import { AuditService } from './database'
import crypto from 'crypto'
import { z } from 'zod'

/**
 * Serviço de Autenticação de Dois Fatores (2FA)
 * Implementa TOTP (Time-based One-Time Password) para segurança adicional
 */

// Schemas de validação
const SetupTwoFactorSchema = z.object({
  userId: z.string().uuid(),
  backupCodes: z.array(z.string()).optional(),
})

const VerifyTwoFactorSchema = z.object({
  userId: z.string().uuid(),
  token: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
  isBackupCode: z.boolean().optional().default(false),
})

const DisableTwoFactorSchema = z.object({
  userId: z.string().uuid(),
  currentPassword: z.string().min(1),
})

export interface TwoFactorSetupResult {
  success: boolean
  secret?: string
  qrCodeUrl?: string
  backupCodes?: string[]
  error?: string
}

export interface TwoFactorVerifyResult {
  success: boolean
  isValid?: boolean
  remainingBackupCodes?: number
  error?: string
}

export interface TwoFactorStatusResult {
  success: boolean
  isEnabled?: boolean
  hasBackupCodes?: boolean
  backupCodesCount?: number
  lastUsed?: Date
  error?: string
}

export class TwoFactorAuthService {
  private static readonly TOTP_WINDOW = 1 // Janela de tolerância (30s antes/depois)
  private static readonly TOTP_STEP = 30 // Intervalo em segundos
  private static readonly BACKUP_CODES_COUNT = 10
  private static readonly APP_NAME = 'Prontuário Médico'

  /**
   * Configurar 2FA para um usuário
   */
  static async setupTwoFactor(
    data: z.infer<typeof SetupTwoFactorSchema>,
    clientIp?: string
  ): Promise<TwoFactorSetupResult> {
    try {
      const validatedData = SetupTwoFactorSchema.parse(data)

      // Verificar se usuário existe
      const user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
        select: { id: true, email: true, twoFactorEnabled: true },
      })

      if (!user) {
        return { success: false, error: 'Usuário não encontrado' }
      }

      if (user.twoFactorEnabled) {
        return {
          success: false,
          error: '2FA já está habilitado para este usuário',
        }
      }

      // Gerar secret único
      const secret = this.generateSecret()

      // Gerar códigos de backup
      const backupCodes =
        validatedData.backupCodes || this.generateBackupCodes()
      const hashedBackupCodes = await Promise.all(
        backupCodes.map(code => this.hashBackupCode(code))
      )

      // Gerar URL do QR Code
      const qrCodeUrl = this.generateQRCodeUrl(user.email, secret)

      // Salvar configuração temporária (será confirmada na verificação)
      await prisma.twoFactorSetup.upsert({
        where: { userId: validatedData.userId },
        update: {
          secret,
          backupCodes: JSON.stringify(hashedBackupCodes),
          isVerified: false,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
        },
        create: {
          userId: validatedData.userId,
          secret,
          backupCodes: JSON.stringify(hashedBackupCodes),
          isVerified: false,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      })

      // Log de auditoria
      await AuditService.log({
        userId: validatedData.userId,
        action: 'TWO_FACTOR_SETUP_INITIATED',
        resource: 'TwoFactorAuth',
        details: JSON.stringify({
          email: user.email,
          clientIp,
          backupCodesGenerated: backupCodes.length,
        }),
        severity: 'MEDIUM',
      })

      return {
        success: true,
        secret,
        qrCodeUrl,
        backupCodes,
      }
    } catch (error) {
      console.error('Erro ao configurar 2FA:', error)

      if (error instanceof z.ZodError) {
        return { success: false, error: 'Dados inválidos fornecidos' }
      }

      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  /**
   * Verificar token 2FA e ativar se válido
   */
  static async verifyAndActivateTwoFactor(
    data: z.infer<typeof VerifyTwoFactorSchema>,
    clientIp?: string
  ): Promise<TwoFactorVerifyResult> {
    try {
      const validatedData = VerifyTwoFactorSchema.parse(data)

      // Buscar configuração temporária
      const setup = await prisma.twoFactorSetup.findUnique({
        where: { userId: validatedData.userId },
        include: { user: { select: { email: true, twoFactorEnabled: true } } },
      })

      if (!setup) {
        return { success: false, error: 'Configuração 2FA não encontrada' }
      }

      if (setup.expiresAt < new Date()) {
        // Limpar configuração expirada
        await prisma.twoFactorSetup.delete({
          where: { userId: validatedData.userId },
        })
        return {
          success: false,
          error: 'Configuração 2FA expirou. Inicie novamente.',
        }
      }

      if (setup.user.twoFactorEnabled) {
        return { success: false, error: '2FA já está ativo' }
      }

      let isValid = false

      if (validatedData.isBackupCode) {
        // Verificar código de backup
        isValid = await this.verifyBackupCode(
          validatedData.token,
          JSON.parse(setup.backupCodes)
        )
      } else {
        // Verificar token TOTP
        isValid = this.verifyTOTP(validatedData.token, setup.secret)
      }

      if (!isValid) {
        await AuditService.log({
          userId: validatedData.userId,
          action: 'TWO_FACTOR_VERIFICATION_FAILED',
          resource: 'TwoFactorAuth',
          details: JSON.stringify({
            email: setup.user.email,
            clientIp,
            tokenType: validatedData.isBackupCode ? 'backup_code' : 'totp',
          }),
          severity: 'MEDIUM',
        })

        return { success: true, isValid: false }
      }

      // Ativar 2FA no usuário
      await prisma.$transaction(async tx => {
        // Ativar 2FA
        await tx.user.update({
          where: { id: validatedData.userId },
          data: {
            twoFactorEnabled: true,
            twoFactorSecret: setup.secret,
            twoFactorBackupCodes: setup.backupCodes,
          },
        })

        // Remover configuração temporária
        await tx.twoFactorSetup.delete({
          where: { userId: validatedData.userId },
        })
      })

      await AuditService.log({
        userId: validatedData.userId,
        action: 'TWO_FACTOR_ACTIVATED',
        resource: 'TwoFactorAuth',
        details: JSON.stringify({
          email: setup.user.email,
          clientIp,
          activationMethod: validatedData.isBackupCode ? 'backup_code' : 'totp',
        }),
        severity: 'HIGH',
      })

      return { success: true, isValid: true }
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error)

      if (error instanceof z.ZodError) {
        return { success: false, error: 'Token inválido fornecido' }
      }

      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  /**
   * Verificar token 2FA para usuário já ativo
   */
  static async verifyTwoFactor(
    data: z.infer<typeof VerifyTwoFactorSchema>,
    clientIp?: string
  ): Promise<TwoFactorVerifyResult> {
    try {
      const validatedData = VerifyTwoFactorSchema.parse(data)

      const user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
        select: {
          id: true,
          email: true,
          twoFactorEnabled: true,
          twoFactorSecret: true,
          twoFactorBackupCodes: true,
        },
      })

      if (!user || !user.twoFactorEnabled) {
        return {
          success: false,
          error: '2FA não está habilitado para este usuário',
        }
      }

      let isValid = false
      let remainingBackupCodes: number | undefined

      if (validatedData.isBackupCode) {
        // Verificar e consumir código de backup
        const result = await this.verifyAndConsumeBackupCode(
          validatedData.userId,
          validatedData.token,
          user.twoFactorBackupCodes ? JSON.parse(user.twoFactorBackupCodes) : []
        )
        isValid = result.isValid
        remainingBackupCodes = result.remainingCodes
      } else {
        // Verificar token TOTP
        isValid = this.verifyTOTP(validatedData.token, user.twoFactorSecret!)
      }

      // Log da tentativa
      await AuditService.log({
        userId: validatedData.userId,
        action: isValid
          ? 'TWO_FACTOR_VERIFIED'
          : 'TWO_FACTOR_VERIFICATION_FAILED',
        resource: 'TwoFactorAuth',
        details: JSON.stringify({
          email: user.email,
          clientIp,
          tokenType: validatedData.isBackupCode ? 'backup_code' : 'totp',
          success: isValid,
        }),
        severity: isValid ? 'LOW' : 'MEDIUM',
      })

      if (isValid) {
        // Atualizar último uso
        await prisma.user.update({
          where: { id: validatedData.userId },
          data: { twoFactorLastUsed: new Date() },
        })
      }

      return {
        success: true,
        isValid,
        remainingBackupCodes,
      }
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error)

      if (error instanceof z.ZodError) {
        return { success: false, error: 'Token inválido fornecido' }
      }

      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  /**
   * Desabilitar 2FA
   */
  static async disableTwoFactor(
    data: z.infer<typeof DisableTwoFactorSchema>,
    clientIp?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const validatedData = DisableTwoFactorSchema.parse(data)

      const user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
        select: {
          id: true,
          email: true,
          password: true,
          twoFactorEnabled: true,
        },
      })

      if (!user) {
        return { success: false, error: 'Usuário não encontrado' }
      }

      if (!user.twoFactorEnabled) {
        return { success: false, error: '2FA não está habilitado' }
      }

      // Verificar senha atual
      const bcrypt = require('bcryptjs')
      const isPasswordValid = await bcrypt.compare(
        validatedData.currentPassword,
        user.password
      )

      if (!isPasswordValid) {
        await AuditService.log({
          userId: validatedData.userId,
          action: 'TWO_FACTOR_DISABLE_FAILED_PASSWORD',
          resource: 'TwoFactorAuth',
          details: JSON.stringify({
            email: user.email,
            clientIp,
            reason: 'invalid_password',
          }),
          severity: 'HIGH',
        })

        return { success: false, error: 'Senha atual incorreta' }
      }

      // Desabilitar 2FA
      await prisma.user.update({
        where: { id: validatedData.userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: null,
          twoFactorLastUsed: null,
        },
      })

      // Limpar configurações temporárias se existirem
      await prisma.twoFactorSetup.deleteMany({
        where: { userId: validatedData.userId },
      })

      await AuditService.log({
        userId: validatedData.userId,
        action: 'TWO_FACTOR_DISABLED',
        resource: 'TwoFactorAuth',
        details: JSON.stringify({
          email: user.email,
          clientIp,
        }),
        severity: 'HIGH',
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao desabilitar 2FA:', error)

      if (error instanceof z.ZodError) {
        return { success: false, error: 'Dados inválidos fornecidos' }
      }

      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  /**
   * Obter status do 2FA para um usuário
   */
  static async getTwoFactorStatus(
    userId: string
  ): Promise<TwoFactorStatusResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorEnabled: true,
          twoFactorBackupCodes: true,
          twoFactorLastUsed: true,
        },
      })

      if (!user) {
        return { success: false, error: 'Usuário não encontrado' }
      }

      return {
        success: true,
        isEnabled: user.twoFactorEnabled,
        hasBackupCodes: user.twoFactorBackupCodes
          ? JSON.parse(user.twoFactorBackupCodes).length > 0
          : false,
        backupCodesCount: user.twoFactorBackupCodes
          ? JSON.parse(user.twoFactorBackupCodes).length
          : 0,
        lastUsed: user.twoFactorLastUsed || undefined,
      }
    } catch (error) {
      console.error('Erro ao obter status 2FA:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  // Métodos privados

  private static generateSecret(): string {
    // Gerar bytes aleatórios e converter para base32 manualmente
    const bytes = crypto.randomBytes(20)
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let result = ''

    for (let i = 0; i < bytes.length; i += 5) {
      const chunk = bytes.subarray(i, i + 5)
      let buffer = 0
      let bitsLeft = 0

      for (const byte of chunk) {
        buffer = (buffer << 8) | byte
        bitsLeft += 8

        while (bitsLeft >= 5) {
          result += base32Chars[(buffer >> (bitsLeft - 5)) & 31]
          bitsLeft -= 5
        }
      }

      if (bitsLeft > 0) {
        result += base32Chars[(buffer << (5 - bitsLeft)) & 31]
      }
    }

    return result
  }

  private static base32ToBuffer(base32: string): Buffer {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    const bytes: number[] = []
    let buffer = 0
    let bitsLeft = 0

    for (const char of base32.toUpperCase()) {
      const value = base32Chars.indexOf(char)
      if (value === -1) continue

      buffer = (buffer << 5) | value
      bitsLeft += 5

      if (bitsLeft >= 8) {
        bytes.push((buffer >> (bitsLeft - 8)) & 255)
        bitsLeft -= 8
      }
    }

    return Buffer.from(bytes)
  }

  private static generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
    }
    return codes
  }

  private static async hashBackupCode(code: string): Promise<string> {
    const bcrypt = require('bcryptjs')
    return bcrypt.hash(code, 10)
  }

  private static generateQRCodeUrl(email: string, secret: string): string {
    const issuer = encodeURIComponent(this.APP_NAME)
    const account = encodeURIComponent(email)
    return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`
  }

  private static verifyTOTP(token: string, secret: string): boolean {
    const crypto = require('crypto')
    const currentTime = Math.floor(Date.now() / 1000 / this.TOTP_STEP)

    // Verificar janela atual e adjacentes
    for (let i = -this.TOTP_WINDOW; i <= this.TOTP_WINDOW; i++) {
      const time = currentTime + i
      const expectedToken = this.generateTOTP(secret, time)
      if (token === expectedToken) {
        return true
      }
    }

    return false
  }

  private static generateTOTP(secret: string, time: number): string {
    const crypto = require('crypto')

    // Converter secret de base32 para buffer usando função personalizada
    const key = this.base32ToBuffer(secret)

    // Converter time para buffer de 8 bytes
    const timeBuffer = Buffer.alloc(8)
    timeBuffer.writeUInt32BE(Math.floor(time / 0x100000000), 0)
    timeBuffer.writeUInt32BE(time & 0xffffffff, 4)

    // Gerar HMAC
    const hmac = crypto.createHmac('sha1', key)
    hmac.update(timeBuffer)
    const digest = hmac.digest()

    // Extrair código de 6 dígitos
    const offset = digest[digest.length - 1] & 0x0f
    const code =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff)

    return (code % 1000000).toString().padStart(6, '0')
  }

  private static async verifyBackupCode(
    code: string,
    hashedCodes: string[]
  ): Promise<boolean> {
    const bcrypt = require('bcryptjs')

    for (const hashedCode of hashedCodes) {
      if (await bcrypt.compare(code, hashedCode)) {
        return true
      }
    }

    return false
  }

  private static async verifyAndConsumeBackupCode(
    userId: string,
    code: string,
    hashedCodes: string[]
  ): Promise<{ isValid: boolean; remainingCodes: number }> {
    const bcrypt = require('bcryptjs')

    for (let i = 0; i < hashedCodes.length; i++) {
      if (await bcrypt.compare(code, hashedCodes[i])) {
        // Remover código usado
        const updatedCodes = hashedCodes.filter((_, index) => index !== i)

        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorBackupCodes: JSON.stringify(updatedCodes) },
        })

        return { isValid: true, remainingCodes: updatedCodes.length }
      }
    }

    return { isValid: false, remainingCodes: hashedCodes.length }
  }
}
