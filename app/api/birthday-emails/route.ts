import { NextRequest, NextResponse } from 'next/server'
import { getAllBirthdayEmails } from '@/lib/email-integration'
import fs from 'fs'
import path from 'path'

interface Subscriber {
  id: string
  email: string
  name: string
  whatsapp?: string
  birthDate?: string
  subscribed: boolean
  subscribedAt: string
  preferences: {
    healthTips: boolean
    appointments: boolean
    promotions: boolean
  }
}

interface NewsletterData {
  subscribers: Subscriber[]
  newsletters: any[]
}

interface BirthdayEmailLog {
  subscriberId: string
  email: string
  name: string
  sentAt: string
  year: number
}

interface BirthdayEmailData {
  logs: BirthdayEmailLog[]
  lastCheck: string
}

const NEWSLETTER_FILE = path.join(process.cwd(), 'data', 'newsletter.json')
const BIRTHDAY_LOGS_FILE = path.join(process.cwd(), 'data', 'birthday-emails.json')

// Função para ler dados da newsletter
function readNewsletterData(): NewsletterData {
  try {
    if (!fs.existsSync(NEWSLETTER_FILE)) {
      return { subscribers: [], newsletters: [] }
    }
    const data = fs.readFileSync(NEWSLETTER_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erro ao ler dados da newsletter:', error)
    return { subscribers: [], newsletters: [] }
  }
}

// Função para ler logs de emails de aniversário
function readBirthdayLogs(): BirthdayEmailData {
  try {
    if (!fs.existsSync(BIRTHDAY_LOGS_FILE)) {
      const initialData: BirthdayEmailData = {
        logs: [],
        lastCheck: new Date().toISOString()
      }
      // Criar diretório se não existir
      const dataDir = path.dirname(BIRTHDAY_LOGS_FILE)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      fs.writeFileSync(BIRTHDAY_LOGS_FILE, JSON.stringify(initialData, null, 2))
      return initialData
    }
    const data = fs.readFileSync(BIRTHDAY_LOGS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erro ao ler logs de aniversário:', error)
    return { logs: [], lastCheck: new Date().toISOString() }
  }
}

// Função para salvar logs de emails de aniversário
function saveBirthdayLogs(data: BirthdayEmailData) {
  try {
    fs.writeFileSync(BIRTHDAY_LOGS_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Erro ao salvar logs de aniversário:', error)
  }
}

// Função para verificar se é aniversário hoje
function isBirthdayToday(birthDate: string): boolean {
  const today = new Date()
  const birth = new Date(birthDate)
  
  return (
    birth.getMonth() === today.getMonth() &&
    birth.getDate() === today.getDate()
  )
}

// Função para verificar se já foi enviado email este ano
function alreadySentThisYear(emailId: string, logs: BirthdayEmailLog[]): boolean {
  const currentYear = new Date().getFullYear()
  return logs.some(log => 
    (log.subscriberId === emailId || log.email === emailId) && 
    log.year === currentYear
  )
}

// Função para calcular idade
function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Função para enviar email de aniversário
async function sendBirthdayEmail(subscriber: Subscriber): Promise<boolean> {
  try {
    const age = calculateAge(subscriber.birthDate!)
    
    const emailData = {
      to: subscriber.email,
      subject: `🎂 Feliz Aniversário, ${subscriber.name}! - Dr. João Vítor Viana`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header com confetes -->
            <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white;">
              <h1 style="margin: 0; font-size: 32px;">🎉 FELIZ ANIVERSÁRIO! 🎉</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Dr. João Vítor Viana</p>
            </div>
            
            <!-- Mensagem principal -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 28px;">
                Parabéns, ${subscriber.name}! 🎂
              </h2>
              <p style="color: #374151; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
                Hoje é um dia muito especial - você está completando <strong>${age} anos</strong>!
              </p>
            </div>
            
            <!-- Cartão de aniversário -->
            <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 25px; border-radius: 15px; margin: 25px 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 15px;">🎂🎈🎁</div>
              <h3 style="color: #8b4513; margin: 0 0 15px 0; font-size: 24px;">
                Desejamos um ano repleto de:
              </h3>
              <div style="color: #8b4513; font-size: 16px; line-height: 1.8;">
                ✨ Muita saúde e bem-estar<br>
                🌟 Momentos de alegria e felicidade<br>
                💪 Força e disposição<br>
                ❤️ Amor e carinho da família<br>
                🙏 Muitas bênçãos e realizações
              </div>
            </div>
            
            <!-- Mensagem do médico -->
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #2563eb;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 20px;">Uma mensagem especial:</h3>
              <p style="color: #374151; line-height: 1.6; margin: 0; font-style: italic;">
                "O aniversário é uma data muito especial para celebrarmos não apenas mais um ano de vida, 
                mas também para refletirmos sobre nossa saúde e bem-estar. Que este novo ciclo seja 
                repleto de cuidado consigo mesmo e muita qualidade de vida!"
              </p>
              <p style="color: #1e40af; margin: 15px 0 0 0; font-weight: bold;">
                - Dr. João Vítor Viana, Coloproctologista
              </p>
            </div>
            
            <!-- Dica de saúde -->
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #15803d; margin-top: 0; font-size: 18px;">💡 Dica de Saúde para o seu Aniversário:</h3>
              <p style="color: #374151; line-height: 1.6; margin: 0;">
                Que tal aproveitar este dia especial para agendar seus exames de rotina? 
                Cuidar da saúde é o melhor presente que você pode dar para si mesmo e para quem você ama!
              </p>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://wa.me/5583999999999?text=Olá! Gostaria de agendar uma consulta." 
                 style="background-color: #25d366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                📱 Agendar Consulta pelo WhatsApp
              </a>
            </div>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Dr. João Vítor Viana</strong><br>
                Coloproctologista - CRM/PB XXXXX<br>
                João Pessoa/PB
              </p>
              <div style="margin: 15px 0;">
                <span style="font-size: 24px;">🎉🎂🎈</span>
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                Este é um email automático enviado com carinho no seu aniversário.<br>
                Você pode cancelar sua inscrição na newsletter a qualquer momento.
              </p>
            </div>
            
          </div>
        </div>
      `
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar email de aniversário:', error)
    return false
  }
}

// POST - Verificar e enviar emails de aniversário
export async function POST(request: NextRequest) {
  try {
    // Usar o sistema integrado de emails
    const integratedEmails = await getAllBirthdayEmails()
    const birthdayLogs = readBirthdayLogs()
    
    const today = new Date()
    const currentYear = today.getFullYear()
    
    // Filtrar emails que fazem aniversário hoje
    const birthdaySubscribers = integratedEmails.filter(emailData => 
      emailData.subscribed && 
      emailData.birthDate && 
      isBirthdayToday(emailData.birthDate) &&
      !alreadySentThisYear(emailData.email, birthdayLogs.logs)
    )
    
    console.log(`🎂 Verificando aniversários para ${today.toDateString()}`)
    console.log(`📧 Encontrados ${birthdaySubscribers.length} aniversariantes no sistema integrado`)
    
    const results = []
    
    for (const emailData of birthdaySubscribers) {
      console.log(`🎉 Enviando email de aniversário para: ${emailData.name} (${emailData.email})`)
      
      // Converter para formato compatível com a função existente
      const subscriber = {
        id: emailData.email, // Usar email como ID único
        email: emailData.email,
        name: emailData.name,
        birthDate: emailData.birthDate,
        subscribed: emailData.subscribed
      }
      
      const emailSent = await sendBirthdayEmail(subscriber)
      
      if (emailSent) {
        // Registrar no log
        const logEntry: BirthdayEmailLog = {
          subscriberId: emailData.email,
          email: emailData.email,
          name: emailData.name,
          sentAt: new Date().toISOString(),
          year: currentYear
        }
        
        birthdayLogs.logs.push(logEntry)
        
        results.push({
          success: true,
          subscriber: emailData.name,
          email: emailData.email,
          source: emailData.source
        })
        
        console.log(`✅ Email de aniversário enviado com sucesso para: ${emailData.name} (fonte: ${emailData.source})`)
      } else {
        results.push({
          success: false,
          subscriber: subscriber.name,
          email: subscriber.email,
          error: 'Falha no envio'
        })
        
        console.log(`❌ Falha ao enviar email de aniversário para: ${subscriber.name}`)
      }
      
      // Pequena pausa entre envios para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Atualizar logs
    birthdayLogs.lastCheck = new Date().toISOString()
    saveBirthdayLogs(birthdayLogs)
    
    return NextResponse.json({
      success: true,
      message: `Verificação de aniversários concluída`,
      totalChecked: newsletterData.subscribers.length,
      birthdaySubscribers: birthdaySubscribers.length,
      emailsSent: results.filter(r => r.success).length,
      results
    })
    
  } catch (error) {
    console.error('Erro na verificação de aniversários:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Obter estatísticas de emails de aniversário
export async function GET(request: NextRequest) {
  try {
    const birthdayLogs = readBirthdayLogs()
    const newsletterData = readNewsletterData()
    
    const currentYear = new Date().getFullYear()
    const currentYearLogs = birthdayLogs.logs.filter(log => log.year === currentYear)
    
    // Próximos aniversários (próximos 30 dias)
    const today = new Date()
    const next30Days = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    const upcomingBirthdays = newsletterData.subscribers
      .filter(subscriber => subscriber.subscribed && subscriber.birthDate)
      .map(subscriber => {
        const birthDate = new Date(subscriber.birthDate!)
        const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate())
        
        // Se já passou este ano, considerar o próximo ano
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(currentYear + 1)
        }
        
        return {
          name: subscriber.name,
          email: subscriber.email,
          birthDate: subscriber.birthDate,
          nextBirthday: thisYearBirthday.toISOString(),
          daysUntil: Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
        }
      })
      .filter(item => {
        const nextBirthday = new Date(item.nextBirthday)
        return nextBirthday >= today && nextBirthday <= next30Days
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
    
    return NextResponse.json({
      success: true,
      stats: {
        totalEmailsSentThisYear: currentYearLogs.length,
        lastCheck: birthdayLogs.lastCheck,
        upcomingBirthdays: upcomingBirthdays.slice(0, 10), // Próximos 10
        totalSubscribersWithBirthdate: newsletterData.subscribers.filter(
          s => s.subscribed && s.birthDate
        ).length
      }
    })
    
  } catch (error) {
    console.error('Erro ao obter estatísticas de aniversário:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}