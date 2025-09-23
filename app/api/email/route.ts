import { NextRequest, NextResponse } from 'next/server'
import {
  sendWelcomeEmail,
  sendBirthdayEmail,
  sendNewsletterEmail,
  processBirthdayEmails,
} from '@/lib/email-service'
import { getAllPatients } from '@/lib/unified-appointment-system'

// POST - Enviar e-mails
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, patientData, recipients, content } = body

    switch (type) {
      case 'welcome':
        if (!patientData || !patientData.email || !patientData.name) {
          return NextResponse.json(
            { error: 'Dados do paciente incompletos' },
            { status: 400 }
          )
        }

        const welcomeResult = await sendWelcomeEmail(patientData)
        return NextResponse.json({
          success: welcomeResult,
          message: welcomeResult
            ? 'E-mail de boas-vindas enviado com sucesso'
            : 'Falha ao enviar e-mail de boas-vindas',
        })

      case 'birthday':
        if (!patientData || !patientData.email || !patientData.name) {
          return NextResponse.json(
            { error: 'Dados do paciente incompletos' },
            { status: 400 }
          )
        }

        const birthdayResult = await sendBirthdayEmail(patientData)
        return NextResponse.json({
          success: birthdayResult,
          message: birthdayResult
            ? 'E-mail de aniversário enviado com sucesso'
            : 'Falha ao enviar e-mail de aniversário',
        })

      case 'newsletter':
        if (
          !recipients ||
          !Array.isArray(recipients) ||
          recipients.length === 0
        ) {
          return NextResponse.json(
            { error: 'Lista de destinatários inválida' },
            { status: 400 }
          )
        }

        if (!content) {
          return NextResponse.json(
            { error: 'Conteúdo da newsletter não fornecido' },
            { status: 400 }
          )
        }

        const newsletterResult = await sendNewsletterEmail(recipients, content)
        return NextResponse.json({
          success: newsletterResult,
          message: newsletterResult
            ? `Newsletter enviada para ${recipients.length} destinatários`
            : 'Falha ao enviar newsletter',
        })

      case 'process-birthdays':
        try {
          const patients = await getAllPatients()
          const patientsWithEmail = patients
            .filter(patient => patient.email && patient.birthDate)
            .map(patient => ({
              name: patient.name,
              email: patient.email!,
              birthDate: patient.birthDate!,
            }))

          await processBirthdayEmails(patientsWithEmail)
          return NextResponse.json({
            success: true,
            message: 'Processamento de aniversários concluído',
          })
        } catch (error) {
          console.error('Erro ao processar aniversários:', error)
          return NextResponse.json(
            { error: 'Erro ao processar aniversários' },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json(
          { error: 'Tipo de e-mail não reconhecido' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erro na API de e-mail:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Obter informações sobre e-mails
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'check-birthdays':
        try {
          const patients = await getAllPatients()
          const patientsWithEmail = patients
            .filter(patient => patient.email && patient.birthDate)
            .map(patient => ({
              name: patient.name,
              email: patient.email!,
              birthDate: patient.birthDate!,
            }))

          const today = new Date()
          const todayMonth = today.getMonth() + 1
          const todayDay = today.getDate()

          const birthdayPatients = patientsWithEmail.filter(patient => {
            const birthDate = new Date(patient.birthDate)
            const birthMonth = birthDate.getMonth() + 1
            const birthDay = birthDate.getDate()

            return birthMonth === todayMonth && birthDay === todayDay
          })

          return NextResponse.json({
            birthdayPatients,
            count: birthdayPatients.length,
          })
        } catch (error) {
          console.error('Erro ao verificar aniversários:', error)
          return NextResponse.json(
            { error: 'Erro ao verificar aniversários' },
            { status: 500 }
          )
        }

      case 'email-stats':
        try {
          const patients = await getAllPatients()
          const totalPatients = patients.length
          const patientsWithEmail = patients.filter(
            patient => patient.email
          ).length
          const patientsWithBirthDate = patients.filter(
            patient => patient.birthDate
          ).length

          return NextResponse.json({
            totalPatients,
            patientsWithEmail,
            patientsWithBirthDate,
            emailCoverage:
              totalPatients > 0
                ? Math.round((patientsWithEmail / totalPatients) * 100)
                : 0,
          })
        } catch (error) {
          console.error('Erro ao obter estatísticas:', error)
          return NextResponse.json(
            { error: 'Erro ao obter estatísticas' },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erro na API de e-mail (GET):', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
