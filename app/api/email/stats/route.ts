import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Ler dados dos pacientes do arquivo JSON
    const patientsPath = path.join(process.cwd(), 'data', 'patients.json')
    const patientsData = JSON.parse(fs.readFileSync(patientsPath, 'utf8'))

    // Contar total de pacientes
    const totalPatients = patientsData.length

    // Contar pacientes com email
    const patientsWithEmail = patientsData.filter(
      (patient: any) => patient.email && patient.email.trim() !== ''
    ).length

    // Calcular porcentagem de cobertura de email
    const emailCoverage =
      totalPatients > 0
        ? Math.round((patientsWithEmail / totalPatients) * 100)
        : 0

    // Obter data atual
    const today = new Date()
    const currentMonth = today.getMonth() + 1 // getMonth() retorna 0-11
    const currentDay = today.getDate()

    // Filtrar pacientes com email e data de nascimento
    const patientsWithEmailAndBirthday = patientsData.filter(
      (patient: any) =>
        patient.email && patient.email.trim() !== '' && patient.birthDate
    )

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

    const birthdaysTodayCount = todayBirthdays.length

    return NextResponse.json({
      totalPatients,
      patientsWithEmail,
      emailCoverage,
      birthdaysToday: birthdaysTodayCount,
      todayBirthdayPatients: todayBirthdays.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
      })),
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas de email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
