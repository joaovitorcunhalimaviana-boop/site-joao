import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { sendBirthdayEmail } from '@/lib/email-service'

export async function POST() {
  try {
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

    return NextResponse.json({
      success: true,
      message: 'Verificação de aniversários concluída',
      stats: {
        totalBirthdays: todayBirthdays.length,
        emailsSent,
        emailsFailed,
        errors,
      },
      birthdayPatients: todayBirthdays.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
      })),
    })
  } catch (error) {
    console.error('Erro ao processar aniversários:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
