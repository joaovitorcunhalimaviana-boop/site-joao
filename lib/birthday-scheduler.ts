// Sistema de agendamento para e-mails de aniversário

import { PatientEmailData } from './email-service'
import { sendBirthdayEmail } from './email-service'
import fs from 'fs'
import path from 'path'

interface Patient {
  id: string
  name: string
  email: string
  birthDate: string
}

// Interface para o resultado da verificação
interface BirthdayCheckResult {
  success: boolean
  totalBirthdays: number
  emailsSent: number
  emailsFailed: number
  errors: string[]
}

// Variável para controlar se o scheduler já foi inicializado
let schedulerInitialized = false

// Função para verificar e processar aniversários
export async function checkAndProcessBirthdays(): Promise<BirthdayCheckResult> {
  const errors: string[] = []
  let birthdaysFound = 0
  let emailsSent = 0

  try {
    console.log('🎂 Verificando aniversariantes do dia...')

    // Ler dados dos pacientes do arquivo JSON
    const patientsPath = path.join(process.cwd(), 'data', 'patients.json')
    const patientsData = JSON.parse(fs.readFileSync(patientsPath, 'utf8'))

    // Filtrar pacientes com email e data de nascimento
    const patientsWithEmailAndBirthday = patientsData.filter(
      (patient: any) =>
        patient.email && patient.email.trim() !== '' && patient.birthDate
    )

    // Obter data atual
    const today = new Date()
    const currentMonth = today.getMonth() + 1 // getMonth() retorna 0-11
    const currentDay = today.getDate()

    // Filtrar aniversariantes de hoje
    const todayBirthdays = patientsWithEmailAndBirthday.filter(
      (patient: any) => {
        if (!patient.birthDate) return false

        const birthDate = new Date(patient.birthDate)
        const birthMonth = birthDate.getMonth() + 1
        const birthDay = birthDate.getDate()

        return birthMonth === currentMonth && birthDay === currentDay
      }
    )

    console.log(`🎉 ${todayBirthdays.length} aniversariante(s) encontrado(s)`)

    // Inicializar estatísticas
    let emailsSent = 0
    let emailsFailed = 0
    const errors: string[] = []

    // Enviar emails para aniversariantes
    for (const patient of todayBirthdays) {
      try {
        console.log(
          `Enviando email de aniversário para: ${patient.name} (${patient.email})`
        )

        // Simular delay para evitar spam
        await new Promise(resolve => setTimeout(resolve, 1000))

        await sendBirthdayEmail({
          name: patient.name,
          email: patient.email,
          birthDate: patient.birthDate,
        })

        emailsSent++
        console.log(`✅ Email enviado com sucesso para ${patient.name}`)
      } catch (error) {
        emailsFailed++
        const errorMessage = `Erro ao enviar email para ${patient.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        errors.push(errorMessage)
        console.error(`❌ ${errorMessage}`)
      }
    }

    console.log(`\n📊 Resumo do processamento de aniversários:`)
    console.log(`- Pacientes com aniversário hoje: ${todayBirthdays.length}`)
    console.log(`- Emails enviados: ${emailsSent}`)
    console.log(`- Emails falharam: ${emailsFailed}`)

    return {
      success: true,
      totalBirthdays: todayBirthdays.length,
      emailsSent,
      emailsFailed,
      errors,
    }
  } catch (error) {
    console.error('Erro ao processar aniversários:', error)
    return {
      success: false,
      totalBirthdays: 0,
      emailsSent: 0,
      emailsFailed: 0,
      errors: [error instanceof Error ? error.message : 'Erro desconhecido'],
    }
  }
}

// Função para inicializar o agendador (executa diariamente às 9h)
export function initializeBirthdayScheduler(): void {
  if (schedulerInitialized) {
    console.log('⚠️ Sistema de aniversários já foi inicializado')
    return
  }

  console.log('🚀 Inicializando sistema de verificação de aniversários...')

  // Marcar como inicializado
  schedulerInitialized = true

  // Executar verificação imediatamente (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    checkAndProcessBirthdays().catch(console.error)
  }

  // Agendar para executar diariamente às 9h (9 * 60 * 60 * 1000 = 32400000ms)
  const now = new Date()
  const scheduledTime = new Date()
  scheduledTime.setHours(9, 0, 0, 0)

  // Se já passou das 9h hoje, agendar para amanhã
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }

  const timeUntilNext = scheduledTime.getTime() - now.getTime()

  setTimeout(() => {
    checkAndProcessBirthdays().catch(console.error)

    // Depois da primeira execução, repetir a cada 24 horas
    setInterval(
      () => {
        checkAndProcessBirthdays().catch(console.error)
      },
      24 * 60 * 60 * 1000
    )
  }, timeUntilNext)

  console.log(
    `⏰ Próxima verificação agendada para: ${scheduledTime.toLocaleString('pt-BR')}`
  )
}

// Função para verificar aniversários manualmente (para testes)
export async function manualBirthdayCheck(): Promise<{
  count: number
  patients: any[]
}> {
  try {
    const response = await fetch('/api/email/birthday-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    const data = await response.json()
    return {
      count: data.birthdaysFound || 0,
      patients: data.birthdayPatients || [],
    }
  } catch (error) {
    console.error('❌ Erro na verificação manual de aniversários:', error)
    return { count: 0, patients: [] }
  }
}
