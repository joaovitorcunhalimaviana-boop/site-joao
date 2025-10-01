import { NextRequest, NextResponse } from 'next/server'
import { sendEmailWithFallback } from '../../../lib/email-providers'
import { getAllPatients, saveAllPatients } from '@/lib/unified-data-service'
import fs from 'fs'
import path from 'path'

interface WelcomeEmailLog {
  email: string
  name: string
  sentAt: string
  source: string
  success: boolean
}

// Função para salvar log de email de boas-vindas no sistema unificado
function saveWelcomeEmailLog(email: string, log: WelcomeEmailLog): void {
  const patients = getAllPatients()
  const patientIndex = patients.findIndex(p => p.email === email)
  
  if (patientIndex !== -1) {
    if (!patients[patientIndex].welcomeEmailLogs) {
      patients[patientIndex].welcomeEmailLogs = []
    }
    patients[patientIndex].welcomeEmailLogs.push(log)
    saveAllPatients(patients)
  }
}

// Função para verificar se já foi enviado email de boas-vindas
function hasWelcomeEmailBeenSent(email: string): boolean {
  const patients = getAllPatients()
  const patient = patients.find(p => p.email === email)
  
  if (!patient || !patient.welcomeEmailLogs) return false
  
  return patient.welcomeEmailLogs.some(log => log.success)
}

// Template de email de boas-vindas
function getWelcomeEmailTemplate(patientName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #000000;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo(a)!</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #1e3a8a; margin-bottom: 20px;">Olá, ${patientName}!</h2>
        
        <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">É com imenso carinho e satisfação que recebemos você em nossa clínica. Estamos aqui para cuidar da sua saúde com todo o acolhimento, dedicação e excelência que você merece.</p>
        
        <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">Sabemos que cuidar da saúde pode gerar ansiedades, e por isso queremos que você se sinta completamente à vontade e seguro(a) conosco. Nossa equipe está preparada para oferecer o melhor atendimento, sempre proporcionando as tecnologias mais novas e baseadas nas melhores evidências científicas, com humanização e respeito.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1e3a8a;">
          <h3 style="color: #1e3a8a; margin-top: 0;">Nossa clínica especializada em coloproctologia e cirurgia geral</h3>
          <p style="margin: 0; line-height: 1.6; color: #1f2937; text-align: justify;">Oferecemos atendimento completo e personalizado, sempre priorizando seu bem-estar e conforto em cada etapa do tratamento.</p>
        </div>
        
        <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">Estamos comprometidos em proporcionar a você uma experiência de cuidado excepcional, onde sua saúde e tranquilidade são nossas prioridades.</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://instagram.com/drjoaovitorviana" 
             style="display: inline-block; background: linear-gradient(45deg, #E1306C, #F56040, #FFDC80); 
                    color: white; text-decoration: none; padding: 12px 25px; border-radius: 25px; 
                    font-weight: bold; box-shadow: 0 4px 15px rgba(225, 48, 108, 0.3);">
            📸 Siga-nos no Instagram
          </a>
        </div>
        
        <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">Muito obrigado por confiar em nosso trabalho. Estamos ansiosos para conhecê-lo(a) pessoalmente e iniciar essa jornada de cuidado juntos.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #1e3a8a; font-weight: bold; margin: 5px 0;">Dr. João Vitor Viana</p>
          <p style="color: #6b7280; margin: 5px 0;">Coloproctologista e Cirurgião Geral</p>
          <p style="color: #6b7280; margin: 5px 0;">CRM-GO 20.583 | RQE 11.248</p>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Este é um email automático. Por favor, não responda diretamente a esta mensagem.
        </p>
      </div>
    </div>
  `
}

export async function POST(request: NextRequest) {
  let name = 'unknown'
  let email = 'unknown'
  let source = 'website'
  
  try {
    const body = await request.json()
    name = body.name
    email = body.email
    source = body.source || 'website'

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já foi enviado email para este paciente usando sistema unificado
    const alreadySent = hasWelcomeEmailBeenSent(email)

    if (alreadySent) {
      return NextResponse.json({
        success: true,
        message: 'Email de boas-vindas já foi enviado anteriormente',
        alreadySent: true
      })
    }

    // Enviar email com sistema de fallback
    const mailOptions = {
      from: `"Dr. João Vitor Viana" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Bem-vindo(a) ao consultório Dr. João Vitor Viana',
      html: getWelcomeEmailTemplate(name)
    }

    await sendEmailWithFallback(mailOptions)

    // Registrar no sistema unificado
    const logEntry: WelcomeEmailLog = {
      email,
      name,
      sentAt: new Date().toISOString(),
      source,
      success: true
    }

    saveWelcomeEmailLog(email, logEntry)

    console.log(`📧 Email de boas-vindas enviado para: ${name} (${email})`)

    return NextResponse.json({
      success: true,
      message: 'Email de boas-vindas enviado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error)

    // Registrar erro no sistema unificado
    try {
      const logEntry: WelcomeEmailLog = {
        email,
        name,
        sentAt: new Date().toISOString(),
        source,
        success: false
      }

      saveWelcomeEmailLog(email, logEntry)
    } catch (logError) {
      console.error('Erro ao registrar falha no log:', logError)
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor ao enviar email' },
      { status: 500 }
    )
  }
}