// Sistema de Provedores de Email Alternativos para Railway
// Resolve problemas de timeout com Gmail SMTP

import nodemailer from 'nodemailer'

export interface EmailProvider {
  name: string
  priority: number
  config: any
  testConnection: () => Promise<boolean>
}

// Configurações dos provedores de email
export const EMAIL_PROVIDERS: EmailProvider[] = [
  // 1. Postmark - Recomendado para Railway
  {
    name: 'postmark',
    priority: 1,
    config: {
      host: 'smtp.postmarkapp.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.POSTMARK_SERVER_TOKEN,
        pass: process.env.POSTMARK_SERVER_TOKEN,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    },
    testConnection: async function() {
      if (!process.env.POSTMARK_SERVER_TOKEN) return false
      try {
        const transporter = nodemailer.createTransport(this.config)
        await transporter.verify()
        return true
      } catch {
        return false
      }
    }
  },

  // 2. Mailgun - Alternativa confiável
  {
    name: 'mailgun',
    priority: 2,
    config: {
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    },
    testConnection: async function() {
      if (!process.env.MAILGUN_SMTP_LOGIN || !process.env.MAILGUN_SMTP_PASSWORD) return false
      try {
        const transporter = nodemailer.createTransport(this.config)
        await transporter.verify()
        return true
      } catch {
        return false
      }
    }
  },

  // 3. SendGrid - Backup option
  {
    name: 'sendgrid',
    priority: 3,
    config: {
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    },
    testConnection: async function() {
      if (!process.env.SENDGRID_API_KEY) return false
      try {
        const transporter = nodemailer.createTransport(this.config)
        await transporter.verify()
        return true
      } catch {
        return false
      }
    }
  },

  // 4. Gmail - Fallback (com configurações otimizadas para Railway)
  {
    name: 'gmail',
    priority: 4,
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Configurações otimizadas para Railway e ambientes de produção
      connectionTimeout: 30000,     // 30 segundos (reduzido)
      greetingTimeout: 15000,       // 15 segundos (reduzido)
      socketTimeout: 30000,         // 30 segundos (reduzido)
      pool: false,                  // Desabilitar pool para evitar problemas de conexão
      maxConnections: 1,
      maxMessages: 1,
      // Configurações adicionais para melhorar conectividade
      tls: {
        rejectUnauthorized: false,  // Para ambientes de produção restritivos
        ciphers: 'SSLv3'
      },
      // Retry automático
      retryDelay: 1000,
      maxRetries: 3,
      // Headers específicos para Gmail
      headers: {
        'X-Mailer': 'Sistema Médico Dr. João Vitor'
      }
    },
    testConnection: async function() {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return false
      try {
        const transporter = nodemailer.createTransport(this.config)
        await transporter.verify()
        return true
      } catch (error) {
        console.error('Gmail connection error:', error.message)
        return false
      }
    }
  }
]

// Classe para gerenciar provedores de email
export class EmailProviderManager {
  private static instance: EmailProviderManager
  private currentProvider: EmailProvider | null = null
  private failedProviders: Set<string> = new Set()

  static getInstance(): EmailProviderManager {
    if (!EmailProviderManager.instance) {
      EmailProviderManager.instance = new EmailProviderManager()
    }
    return EmailProviderManager.instance
  }

  // Encontrar o melhor provedor disponível
  async findBestProvider(): Promise<EmailProvider | null> {
    console.log('🔍 Procurando melhor provedor de email...')
    
    // Ordenar por prioridade e filtrar os que falharam
    const availableProviders = EMAIL_PROVIDERS
      .filter(provider => !this.failedProviders.has(provider.name))
      .sort((a, b) => a.priority - b.priority)

    for (const provider of availableProviders) {
      console.log(`🧪 Testando provedor: ${provider.name}`)
      
      try {
        const isWorking = await provider.testConnection()
        if (isWorking) {
          console.log(`✅ Provedor ${provider.name} está funcionando!`)
          this.currentProvider = provider
          return provider
        } else {
          console.log(`❌ Provedor ${provider.name} não está configurado ou falhou`)
        }
      } catch (error) {
        console.log(`❌ Erro ao testar ${provider.name}:`, error)
        this.failedProviders.add(provider.name)
      }
    }

    console.log('❌ Nenhum provedor de email disponível')
    return null
  }

  // Criar transporter com o melhor provedor
  async createTransporter(): Promise<any> {
    if (!this.currentProvider) {
      this.currentProvider = await this.findBestProvider()
    }

    if (!this.currentProvider) {
      throw new Error('Nenhum provedor de email disponível')
    }

    console.log(`📧 Usando provedor: ${this.currentProvider.name}`)
    return nodemailer.createTransport(this.currentProvider.config)
  }

  // Marcar provedor como falho e tentar próximo
  async markProviderAsFailed(providerName: string): Promise<any> {
    console.log(`❌ Marcando provedor ${providerName} como falho`)
    this.failedProviders.add(providerName)
    this.currentProvider = null
    
    // Tentar próximo provedor
    return await this.createTransporter()
  }

  // Resetar provedores falhados (para retry)
  resetFailedProviders(): void {
    console.log('🔄 Resetando provedores falhados')
    this.failedProviders.clear()
    this.currentProvider = null
  }

  // Obter status dos provedores
  getProvidersStatus(): any {
    return {
      currentProvider: this.currentProvider?.name || 'none',
      failedProviders: Array.from(this.failedProviders),
      availableProviders: EMAIL_PROVIDERS.map(p => ({
        name: p.name,
        priority: p.priority,
        configured: this.isProviderConfigured(p),
        failed: this.failedProviders.has(p.name)
      }))
    }
  }

  // Verificar se provedor está configurado
  private isProviderConfigured(provider: EmailProvider): boolean {
    switch (provider.name) {
      case 'postmark':
        return !!process.env.POSTMARK_SERVER_TOKEN
      case 'mailgun':
        return !!(process.env.MAILGUN_SMTP_LOGIN && process.env.MAILGUN_SMTP_PASSWORD)
      case 'sendgrid':
        return !!process.env.SENDGRID_API_KEY
      case 'gmail':
        return !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
      default:
        return false
    }
  }
}

// Função utilitária para enviar email com fallback automático
export async function sendEmailWithFallback(mailOptions: any): Promise<any> {
  const manager = EmailProviderManager.getInstance()
  let lastError: any = null
  let attempts = 0
  const maxAttempts = EMAIL_PROVIDERS.length

  while (attempts < maxAttempts) {
    try {
      const transporter = await manager.createTransporter()
      const result = await transporter.sendMail(mailOptions)
      
      console.log(`✅ Email enviado com sucesso usando ${manager.getProvidersStatus().currentProvider}`)
      return result
      
    } catch (error) {
      lastError = error
      attempts++
      
      console.log(`❌ Tentativa ${attempts} falhou:`, error)
      
      if (manager.getProvidersStatus().currentProvider) {
        await manager.markProviderAsFailed(manager.getProvidersStatus().currentProvider)
      }
      
      // Se ainda há tentativas, continuar
      if (attempts < maxAttempts) {
        console.log(`🔄 Tentando próximo provedor... (${attempts}/${maxAttempts})`)
        continue
      }
    }
  }

  // Se chegou aqui, todos os provedores falharam
  console.log('💀 Todos os provedores de email falharam')
  throw new Error(`Falha ao enviar email após ${maxAttempts} tentativas. Último erro: ${lastError?.message}`)
}