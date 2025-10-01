import { NextRequest, NextResponse } from 'next/server'
import { getAllPatients, saveAllPatients } from '@/lib/unified-data-service'
import fs from 'fs'
import path from 'path'

interface BirthdayEmailLog {
  patientId: string
  email: string
  name: string
  sentAt: string
  year: number
}

// Função para ler logs de emails de aniversário do sistema unificado
function getBirthdayLogs(): BirthdayEmailLog[] {
  const patients = getAllPatients()
  const logs: BirthdayEmailLog[] = []
  
  patients.forEach(patient => {
    if (patient.birthdayEmailLogs) {
      patient.birthdayEmailLogs.forEach(log => {
        logs.push({
          patientId: patient.id,
          email: patient.email || '',
          name: patient.name,
          sentAt: log.sentAt,
          year: log.year
        })
      })
    }
  })
  
  return logs
}

// Função para salvar log de email de aniversário no sistema unificado
function saveBirthdayLog(patientId: string, log: { sentAt: string, year: number }) {
  const patients = getAllPatients()
  const patientIndex = patients.findIndex(p => p.id === patientId)
  
  if (patientIndex !== -1) {
    if (!patients[patientIndex].birthdayEmailLogs) {
      patients[patientIndex].birthdayEmailLogs = []
    }
    patients[patientIndex].birthdayEmailLogs.push(log)
    saveAllPatients(patients)
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

// Função para obter pacientes com aniversário hoje do sistema unificado
function getTodayBirthdayPatients() {
  const patients = getAllPatients()
  
  return patients.filter(patient => {
    // Verificar se tem email, data de nascimento e está inscrito
    if (!patient.email || !patient.birthDate) return false
    
    // Verificar se está inscrito em algum tipo de email
    const isSubscribed = patient.emailPreferences?.healthTips || 
                        patient.emailPreferences?.appointments || 
                        patient.emailPreferences?.promotions
    
    if (!isSubscribed) return false
    
    // Verificar se é aniversário hoje
    return isBirthdayToday(patient.birthDate)
  })
}
// Função para verificar se já foi enviado email este ano
function alreadySentThisYear(patientId: string): boolean {
  const patients = getAllPatients()
  const patient = patients.find(p => p.id === patientId)
  
  if (!patient || !patient.birthdayEmailLogs) return false
  
  const currentYear = new Date().getFullYear()
  return patient.birthdayEmailLogs.some(log => log.year === currentYear)
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
async function sendBirthdayEmail(patient: any): Promise<boolean> {
  try {
    const age = calculateAge(patient.birthDate!)
    
    const emailData = {
      to: patient.email,
      subject: `🎂 Feliz Aniversário, ${patient.name}! - Dr. João Vítor Viana`,
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
                Parabéns, ${patient.name}! 🎂
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.joaovitorviana.com.br'}/api/send-email`, {
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
    // Usar o sistema unificado de pacientes
    const birthdayPatients = getTodayBirthdayPatients()
    
    const today = new Date()
    const currentYear = today.getFullYear()
    
    // Filtrar pacientes que ainda não receberam email este ano
    const patientsToSendEmail = birthdayPatients.filter(patient => 
      !alreadySentThisYear(patient.id)
    )
    
    console.log(`🎂 Verificando aniversários para ${today.toDateString()}`)
    console.log(`📧 Encontrados ${patientsToSendEmail.length} aniversariantes no sistema unificado`)
    
    const results = []
    
    for (const patient of patientsToSendEmail) {
      console.log(`🎉 Enviando email de aniversário para: ${patient.name} (${patient.email})`)
      
      const emailSent = await sendBirthdayEmail(patient)
      
      if (emailSent) {
        // Registrar no sistema unificado
        saveBirthdayLog(patient.id, {
          sentAt: new Date().toISOString(),
          year: currentYear
        })
        
        results.push({
          success: true,
          subscriber: patient.name,
          email: patient.email,
          source: 'unified-system'
        })
        
        console.log(`✅ Email de aniversário enviado com sucesso para: ${patient.name}`)
      } else {
        results.push({
          success: false,
          subscriber: patient.name,
          email: patient.email,
          error: 'Falha no envio'
        })
        
        console.log(`❌ Falha ao enviar email de aniversário para: ${patient.name}`)
      }
      
      // Pequena pausa entre envios para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return NextResponse.json({
      success: true,
      message: `Verificação de aniversários concluída`,
      totalChecked: birthdayPatients.length,
      birthdaySubscribers: patientsToSendEmail.length,
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
    const birthdayLogs = getBirthdayLogs()
    const allPatients = getAllPatients()
    
    const currentYear = new Date().getFullYear()
    const currentYearLogs = birthdayLogs.filter(log => log.year === currentYear)
    
    // Próximos aniversários (próximos 30 dias)
    const today = new Date()
    const next30Days = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    const upcomingBirthdays = allPatients
      .filter(patient => 
        patient.birthDate && 
        (patient.emailPreferences?.newsletter || 
         patient.emailPreferences?.appointments || 
         patient.emailPreferences?.healthTips)
      )
      .map(patient => {
        const birthDate = new Date(patient.birthDate!)
        const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate())
        
        // Se já passou este ano, considerar o próximo ano
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(currentYear + 1)
        }
        
        return {
          name: patient.name,
          email: patient.email,
          birthDate: patient.birthDate,
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
        lastCheck: new Date().toISOString(), // Current timestamp since we don't track lastCheck in unified system
        upcomingBirthdays: upcomingBirthdays.slice(0, 10), // Próximos 10
        totalSubscribersWithBirthdate: allPatients.filter(
          patient => patient.birthDate && 
          (patient.emailPreferences?.newsletter || 
           patient.emailPreferences?.appointments || 
           patient.emailPreferences?.healthTips)
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