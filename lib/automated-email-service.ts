// Serviço de E-mails Automáticos
// Apenas para e-mails de boas-vindas e aniversário

import { sendWelcomeEmail, sendBirthdayEmail, PatientEmailData } from './email-service'
import { AuditService, prisma } from './database'

interface WelcomeEmailData {
  patientName: string
  patientEmail: string
  doctorName: string
  clinicName: string
  appointmentDate?: string
}

interface BirthdayEmailData {
  patientName: string
  patientEmail: string
  doctorName: string
  clinicName: string
  age?: number
}

export class AutomatedEmailService {
  private static instance: AutomatedEmailService
  private isRunning = false

  static getInstance(): AutomatedEmailService {
    if (!AutomatedEmailService.instance) {
      AutomatedEmailService.instance = new AutomatedEmailService()
    }
    return AutomatedEmailService.instance
  }

  /**
   * Enviar e-mail de boas-vindas para novo paciente
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      console.log(`📧 Enviando e-mail de boas-vindas para ${data.patientName}`)

      const subject = `Bem-vindo(a) à ${data.clinicName}!`
      
      const htmlContent = this.generateWelcomeEmailHTML(data)
      const textContent = this.generateWelcomeEmailText(data)

      const result = await sendWelcomeEmail({
        name: data.patientName,
        email: data.patientEmail
      })

      if (result) {
        // Registrar envio no log de e-mails de boas-vindas
        await this.logWelcomeEmail(data, 'email-sent')
        
        // Registrar na auditoria
        await AuditService.log({
          action: 'WELCOME_EMAIL_SENT',
          resource: 'Email',
          details: JSON.stringify({
            patientName: data.patientName,
            patientEmail: data.patientEmail
          }),
          severity: 'LOW'
        })

        console.log(`✅ E-mail de boas-vindas enviado com sucesso para ${data.patientName}`)
      }

      return {
        success: result,
        messageId: result ? 'email-sent' : undefined
      }

    } catch (error) {
      console.error('❌ Erro ao enviar e-mail de boas-vindas:', error)
      
      await AuditService.log({
        action: 'WELCOME_EMAIL_FAILED',
        resource: 'Email',
        details: JSON.stringify({
          patientName: data.patientName,
          patientEmail: data.patientEmail,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }),
        severity: 'MEDIUM'
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Enviar e-mail de aniversário
   */
  async sendBirthdayEmail(data: BirthdayEmailData): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      console.log(`🎂 Enviando e-mail de aniversário para ${data.patientName}`)

      const subject = `Feliz Aniversário, ${data.patientName}! 🎉`
      
      const htmlContent = this.generateBirthdayEmailHTML(data)
      const textContent = this.generateBirthdayEmailText(data)

      const result = await sendBirthdayEmail({
        name: data.patientName,
        email: data.patientEmail
      })

      if (result) {
        // Registrar na auditoria
        await AuditService.log({
          action: 'BIRTHDAY_EMAIL_SENT',
          resource: 'Email',
          details: JSON.stringify({
            patientName: data.patientName,
            patientEmail: data.patientEmail
          }),
          severity: 'LOW'
        })

        console.log(`✅ E-mail de aniversário enviado com sucesso para ${data.patientName}`)
      }

      return {
        success: result,
        messageId: result ? 'birthday-email-sent' : undefined
      }

    } catch (error) {
      console.error('❌ Erro ao enviar e-mail de aniversário:', error)
      
      await AuditService.log({
        action: 'BIRTHDAY_EMAIL_FAILED',
        resource: 'Email',
        details: JSON.stringify({
          patientName: data.patientName,
          patientEmail: data.patientEmail,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }),
        severity: 'MEDIUM'
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Verificar e enviar e-mails de aniversário do dia
   */
  async checkAndSendBirthdayEmails(): Promise<{
    sent: number
    failed: number
    errors: string[]
  }> {
    const result = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    try {
      console.log('🎂 Verificando aniversariantes do dia...')

      // Buscar pacientes que fazem aniversário hoje
      const today = new Date()
      const todayMonth = today.getMonth() + 1
      const todayDay = today.getDate()

      const birthdayPatients = await prisma.patient.findMany({
        where: {
          AND: [
            {
              birthDate: {
                not: null
              }
            },
            // Filtrar por mês e dia usando SQL raw
            {
              birthDate: {
                not: null
              }
            }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          birthDate: true
        }
      })

      // Filtrar manualmente por mês e dia (já que Prisma não tem função EXTRACT)
      const todayBirthdays = birthdayPatients.filter(patient => {
        if (!patient.birthDate) return false
        const birthDate = new Date(patient.birthDate)
        return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay
      })

      console.log(`🎉 Encontrados ${todayBirthdays.length} aniversariantes hoje`)

      // Enviar e-mail para cada aniversariante
      for (const patient of todayBirthdays) {
        if (!patient.email) {
          console.log(`⚠️ Paciente ${patient.name} não tem e-mail cadastrado`)
          continue
        }

        const age = patient.birthDate ? 
          today.getFullYear() - new Date(patient.birthDate).getFullYear() : 
          undefined

        const emailResult = await this.sendBirthdayEmail({
          patientName: patient.name,
          patientEmail: patient.email,
          doctorName: 'Dr. João Vítor Viana',
          clinicName: 'Clínica Dr. João Vítor Viana',
          age
        })

        if (emailResult.success) {
          result.sent++
        } else {
          result.failed++
          result.errors.push(`${patient.name}: ${emailResult.error}`)
        }

        // Pequena pausa entre envios para não sobrecarregar o servidor
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Registrar resultado na auditoria
      await AuditService.log({
        action: 'BIRTHDAY_EMAILS_BATCH_PROCESSED',
        resource: 'Email',
        details: JSON.stringify({
          totalBirthdays: todayBirthdays.length,
          sent: result.sent,
          failed: result.failed,
          date: today.toISOString().split('T')[0]
        }),
        severity: result.failed > 0 ? 'MEDIUM' : 'LOW'
      })

      console.log(`✅ Processamento de aniversários concluído: ${result.sent} enviados, ${result.failed} falharam`)

    } catch (error) {
      console.error('❌ Erro ao processar e-mails de aniversário:', error)
      result.errors.push(error instanceof Error ? error.message : 'Erro desconhecido')
    }

    return result
  }

  /**
   * Iniciar monitoramento automático de aniversários
   */
  async startBirthdayMonitoring(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Monitoramento de aniversários já está em execução')
      return
    }

    this.isRunning = true
    console.log('🎂 INICIANDO MONITORAMENTO AUTOMÁTICO DE ANIVERSÁRIOS...')

    // Verificar aniversários todos os dias às 9h
    const checkBirthdays = async () => {
      const now = new Date()
      if (now.getHours() === 9 && now.getMinutes() === 0) {
        await this.checkAndSendBirthdayEmails()
      }
    }

    // Verificar a cada minuto se é hora de enviar
    const birthdayInterval = setInterval(checkBirthdays, 60 * 1000)

    // Registrar início do monitoramento
    await AuditService.log({
      action: 'BIRTHDAY_MONITORING_STARTED',
      resource: 'System',
      details: JSON.stringify({
        checkTime: '09:00 daily'
      }),
      severity: 'LOW'
    })

    // Cleanup quando o processo terminar
    process.on('SIGINT', () => {
      clearInterval(birthdayInterval)
      this.isRunning = false
      console.log('🛑 Monitoramento de aniversários interrompido')
    })
  }

  /**
   * Registrar e-mail de boas-vindas no log
   */
  private async logWelcomeEmail(data: WelcomeEmailData, messageId?: string): Promise<void> {
    try {
      const logPath = 'data/welcome-email-logs.json'
      let logs: any[] = []

      try {
        const fs = await import('fs/promises')
        const existingData = await fs.readFile(logPath, 'utf-8')
        logs = JSON.parse(existingData)
      } catch (error) {
        // Arquivo não existe ou está vazio, começar com array vazio
      }

      logs.push({
        timestamp: new Date().toISOString(),
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        messageId,
        status: 'sent'
      })

      const fs = await import('fs/promises')
      await fs.writeFile(logPath, JSON.stringify(logs, null, 2))

    } catch (error) {
      console.error('❌ Erro ao registrar log de e-mail de boas-vindas:', error)
    }
  }

  /**
   * Gerar HTML do e-mail de boas-vindas
   */
  private generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bem-vindo(a) à ${data.clinicName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Bem-vindo(a) à ${data.clinicName}!</h1>
        </div>
        <div class="content">
            <h2>Olá, ${data.patientName}!</h2>
            
            <p>É com grande satisfação que damos as boas-vindas à nossa clínica. Estamos comprometidos em oferecer o melhor atendimento e cuidado para sua saúde.</p>
            
            <div class="highlight">
                <h3>🩺 Sobre o ${data.doctorName}</h3>
                <p>Coloproctologista especializado em cirurgia geral, dedicado ao tratamento humanizado e de excelência para todos os pacientes.</p>
            </div>
            
            ${data.appointmentDate ? `
            <div class="highlight">
                <h3>📅 Seu Próximo Agendamento</h3>
                <p><strong>Data:</strong> ${data.appointmentDate}</p>
                <p>Lembre-se de chegar com 15 minutos de antecedência.</p>
            </div>
            ` : ''}
            
            <h3>📞 Contato</h3>
            <p>Para agendamentos ou dúvidas, entre em contato conosco:</p>
            <ul>
                <li>📱 WhatsApp: (83) 99999-9999</li>
                <li>📧 E-mail: contato@joaovitorviana.com.br</li>
                <li>🌐 Site: www.joaovitorviana.com.br</li>
            </ul>
            
            <p>Estamos ansiosos para cuidar da sua saúde!</p>
            
            <p>Atenciosamente,<br>
            <strong>${data.doctorName}</strong><br>
            Coloproctologista e Cirurgião Geral</p>
        </div>
        <div class="footer">
            <p>${data.clinicName} - João Pessoa/PB</p>
        </div>
    </div>
</body>
</html>
    `
  }

  /**
   * Gerar texto simples do e-mail de boas-vindas
   */
  private generateWelcomeEmailText(data: WelcomeEmailData): string {
    return `
Bem-vindo(a) à ${data.clinicName}!

Olá, ${data.patientName}!

É com grande satisfação que damos as boas-vindas à nossa clínica. Estamos comprometidos em oferecer o melhor atendimento e cuidado para sua saúde.

Sobre o ${data.doctorName}:
Coloproctologista especializado em cirurgia geral, dedicado ao tratamento humanizado e de excelência para todos os pacientes.

${data.appointmentDate ? `
Seu Próximo Agendamento:
Data: ${data.appointmentDate}
Lembre-se de chegar com 15 minutos de antecedência.
` : ''}

Contato:
- WhatsApp: (83) 99999-9999
- E-mail: contato@joaovitorviana.com.br
- Site: www.joaovitorviana.com.br

Estamos ansiosos para cuidar da sua saúde!

Atenciosamente,
${data.doctorName}
Coloproctologista e Cirurgião Geral

${data.clinicName} - João Pessoa/PB
    `
  }

  /**
   * Gerar HTML do e-mail de aniversário
   */
  private generateBirthdayEmailHTML(data: BirthdayEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Feliz Aniversário!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .birthday-card { background: white; padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .emoji { font-size: 2em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Feliz Aniversário! 🎂</h1>
        </div>
        <div class="content">
            <div class="birthday-card">
                <div class="emoji">🎈🎁🎊</div>
                <h2>Parabéns, ${data.patientName}!</h2>
                ${data.age ? `<p><strong>${data.age} anos de vida!</strong></p>` : ''}
                <p>Que este novo ano de vida seja repleto de saúde, alegria e realizações!</p>
            </div>
            
            <p>Queremos aproveitar esta data especial para desejar um feliz aniversário e reafirmar nosso compromisso com seu bem-estar e saúde.</p>
            
            <p>Que você tenha um dia maravilhoso ao lado de quem mais ama, e que o próximo ano seja ainda melhor que o anterior!</p>
            
            <h3>🎁 Nosso Presente para Você</h3>
            <p>Como forma de celebrar seu aniversário, oferecemos <strong>10% de desconto</strong> em sua próxima consulta. Entre em contato conosco para agendar!</p>
            
            <h3>📞 Contato</h3>
            <ul>
                <li>📱 WhatsApp: (83) 99999-9999</li>
                <li>📧 E-mail: contato@joaovitorviana.com.br</li>
                <li>🌐 Site: www.joaovitorviana.com.br</li>
            </ul>
            
            <p>Mais uma vez, parabéns e muito obrigado por confiar em nosso trabalho!</p>
            
            <p>Com carinho,<br>
            <strong>${data.doctorName}</strong><br>
            Coloproctologista e Cirurgião Geral</p>
        </div>
        <div class="footer">
            <p>${data.clinicName} - João Pessoa/PB</p>
        </div>
    </div>
</body>
</html>
    `
  }

  /**
   * Gerar texto simples do e-mail de aniversário
   */
  private generateBirthdayEmailText(data: BirthdayEmailData): string {
    return `
🎉 Feliz Aniversário! 🎂

Parabéns, ${data.patientName}!

${data.age ? `${data.age} anos de vida!` : ''}

Que este novo ano de vida seja repleto de saúde, alegria e realizações!

Queremos aproveitar esta data especial para desejar um feliz aniversário e reafirmar nosso compromisso com seu bem-estar e saúde.

Que você tenha um dia maravilhoso ao lado de quem mais ama, e que o próximo ano seja ainda melhor que o anterior!

🎁 Nosso Presente para Você:
Como forma de celebrar seu aniversário, oferecemos 10% de desconto em sua próxima consulta. Entre em contato conosco para agendar!

Contato:
- WhatsApp: (83) 99999-9999
- E-mail: contato@joaovitorviana.com.br
- Site: www.joaovitorviana.com.br

Mais uma vez, parabéns e muito obrigado por confiar em nosso trabalho!

Com carinho,
${data.doctorName}
Coloproctologista e Cirurgião Geral

${data.clinicName} - João Pessoa/PB
    `
  }
}

// Exportar instância singleton
export const automatedEmailService = AutomatedEmailService.getInstance()