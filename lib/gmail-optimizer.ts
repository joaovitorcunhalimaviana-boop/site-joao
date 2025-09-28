// Otimizador específico para Gmail SMTP
// Tenta diferentes configurações para resolver problemas de conectividade

import nodemailer from 'nodemailer'

export interface GmailConfig {
  name: string
  config: any
  description: string
}

// Diferentes configurações do Gmail para tentar
export const GMAIL_CONFIGURATIONS: GmailConfig[] = [
  // Configuração 1: Padrão otimizada
  {
    name: 'gmail-optimized',
    description: 'Gmail com configurações otimizadas para Railway',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      pool: false,
      maxConnections: 1,
      maxMessages: 1,
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      }
    }
  },

  // Configuração 2: Porta 465 (SSL)
  {
    name: 'gmail-ssl',
    description: 'Gmail usando porta 465 com SSL',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 45000,
      greetingTimeout: 20000,
      socketTimeout: 45000,
      pool: false,
      tls: {
        rejectUnauthorized: false
      }
    }
  },

  // Configuração 3: Configuração mais permissiva
  {
    name: 'gmail-permissive',
    description: 'Gmail com configurações mais permissivas',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      pool: false,
      ignoreTLS: true,
      tls: {
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_method'
      }
    }
  },

  // Configuração 4: Configuração básica
  {
    name: 'gmail-basic',
    description: 'Gmail com configuração básica mínima',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 20000,
      greetingTimeout: 10000,
      socketTimeout: 20000
    }
  }
]

export class GmailOptimizer {
  private static instance: GmailOptimizer
  private workingConfig: GmailConfig | null = null
  private testedConfigs: Set<string> = new Set()

  static getInstance(): GmailOptimizer {
    if (!GmailOptimizer.instance) {
      GmailOptimizer.instance = new GmailOptimizer()
    }
    return GmailOptimizer.instance
  }

  // Testar uma configuração específica
  async testConfiguration(config: GmailConfig): Promise<boolean> {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('❌ Credenciais do Gmail não configuradas')
      return false
    }

    try {
      console.log(`🧪 Testando configuração: ${config.name} - ${config.description}`)
      
      const transporter = nodemailer.createTransporter(config.config)
      await transporter.verify()
      
      console.log(`✅ Configuração ${config.name} funcionou!`)
      return true
      
    } catch (error: any) {
      console.log(`❌ Configuração ${config.name} falhou:`, error.message)
      this.testedConfigs.add(config.name)
      return false
    }
  }

  // Encontrar a melhor configuração do Gmail
  async findBestGmailConfig(): Promise<GmailConfig | null> {
    console.log('🔍 Procurando melhor configuração do Gmail...')

    // Se já temos uma configuração funcionando, usar ela
    if (this.workingConfig && !this.testedConfigs.has(this.workingConfig.name)) {
      const stillWorking = await this.testConfiguration(this.workingConfig)
      if (stillWorking) {
        return this.workingConfig
      }
    }

    // Testar todas as configurações
    for (const config of GMAIL_CONFIGURATIONS) {
      if (this.testedConfigs.has(config.name)) {
        continue // Pular configurações que já falharam
      }

      const isWorking = await this.testConfiguration(config)
      if (isWorking) {
        this.workingConfig = config
        return config
      }
    }

    console.log('❌ Nenhuma configuração do Gmail funcionou')
    return null
  }

  // Criar transporter com a melhor configuração
  async createGmailTransporter(): Promise<any> {
    const config = await this.findBestGmailConfig()
    
    if (!config) {
      throw new Error('Nenhuma configuração do Gmail disponível')
    }

    console.log(`📧 Usando configuração Gmail: ${config.name}`)
    return nodemailer.createTransporter(config.config)
  }

  // Enviar email com retry automático
  async sendEmailWithRetry(mailOptions: any, maxRetries: number = 3): Promise<any> {
    let lastError: any = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📧 Tentativa ${attempt}/${maxRetries} de envio via Gmail`)
        
        const transporter = await this.createGmailTransporter()
        const result = await transporter.sendMail(mailOptions)
        
        console.log(`✅ Email enviado com sucesso via Gmail na tentativa ${attempt}`)
        return result
        
      } catch (error: any) {
        lastError = error
        console.log(`❌ Tentativa ${attempt} falhou:`, error.message)
        
        // Marcar configuração atual como falha
        if (this.workingConfig) {
          this.testedConfigs.add(this.workingConfig.name)
          this.workingConfig = null
        }
        
        // Se não é a última tentativa, aguardar um pouco
        if (attempt < maxRetries) {
          console.log(`⏳ Aguardando 2 segundos antes da próxima tentativa...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    throw new Error(`Falha ao enviar email via Gmail após ${maxRetries} tentativas. Último erro: ${lastError?.message}`)
  }

  // Resetar configurações testadas
  resetTestedConfigs(): void {
    console.log('🔄 Resetando configurações testadas do Gmail')
    this.testedConfigs.clear()
    this.workingConfig = null
  }

  // Obter status das configurações
  getConfigurationsStatus(): any {
    return {
      workingConfig: this.workingConfig?.name || 'none',
      testedConfigs: Array.from(this.testedConfigs),
      availableConfigs: GMAIL_CONFIGURATIONS.map(config => ({
        name: config.name,
        description: config.description,
        tested: this.testedConfigs.has(config.name),
        isWorking: this.workingConfig?.name === config.name
      }))
    }
  }
}

// Função utilitária para usar o otimizador
export async function sendGmailOptimized(mailOptions: any): Promise<any> {
  const optimizer = GmailOptimizer.getInstance()
  return await optimizer.sendEmailWithRetry(mailOptions)
}