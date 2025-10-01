import { NextRequest, NextResponse } from 'next/server'
import { sendNewsletterEmail } from '@/lib/email-service'
import { readNewslettersData, saveNewslettersData } from '@/lib/unified-data-service'

export async function POST(request: NextRequest) {
  try {
    const { subject, content, recipients } = await request.json()

    // Validar dados obrigatórios
    if (!subject || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assunto e conteúdo são obrigatórios',
        },
        { status: 400 }
      )
    }

    let emailList: string[] = []

    // Se não foram fornecidos destinatários específicos, usar todos os pacientes com email
    if (!recipients || recipients.length === 0) {
      try {
        const patientsPath = path.join(process.cwd(), 'data', 'patients.json')
        const patientsData = JSON.parse(fs.readFileSync(patientsPath, 'utf8'))

        // Filtrar pacientes com email válido
        emailList = patientsData
          .filter(
            (patient: any) => patient.email && patient.email.trim() !== ''
          )
          .map((patient: any) => patient.email)

        console.log(
          `Encontrados ${emailList.length} pacientes com email para newsletter`
        )
      } catch (error) {
        console.error('Erro ao carregar lista de pacientes:', error)
        return NextResponse.json(
          {
            success: false,
            error: 'Erro ao carregar lista de pacientes',
          },
          { status: 500 }
        )
      }
    } else {
      // Validar emails fornecidos
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const invalidEmails = recipients.filter(
        (email: string) => !emailRegex.test(email)
      )

      if (invalidEmails.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Emails inválidos encontrados: ${invalidEmails.join(', ')}`,
          },
          { status: 400 }
        )
      }

      emailList = recipients
    }

    if (emailList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhum destinatário válido encontrado',
        },
        { status: 400 }
      )
    }

    console.log(`Enviando newsletter para ${emailList.length} destinatários`)
    console.log(`Assunto: ${subject}`)

    // Enviar newsletter
    const emailSent = await sendNewsletterEmail(emailList, content, subject)

    if (emailSent) {
      console.log(
        `✅ Newsletter enviada com sucesso para ${emailList.length} destinatários`
      )

      // Salvar histórico da newsletter
      try {
        const newsletterHistory = readNewslettersData()

        newsletterHistory.push({
          id: Date.now().toString(),
          subject,
          content,
          recipients: emailList.length,
          sentAt: new Date().toISOString(),
          status: 'sent',
        })

        saveNewslettersData(newsletterHistory)
        console.log('Histórico da newsletter salvo com sucesso')
      } catch (error) {
        console.error('Erro ao salvar histórico da newsletter:', error)
      }

      return NextResponse.json({
        success: true,
        message: `Newsletter enviada com sucesso para ${emailList.length} destinatários`,
        stats: {
          recipientsCount: emailList.length,
          subject,
          sentAt: new Date().toISOString(),
        },
      })
    } else {
      console.error(`❌ Falha ao enviar newsletter`)
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao enviar newsletter',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro ao processar newsletter:', error)
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

// GET para buscar histórico de newsletters
export async function GET() {
  try {
    const newsletters = readNewslettersData()

    return NextResponse.json({
      success: true,
      newsletters: newsletters.sort(
        (a: any, b: any) =>
          new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      ),
    })
  } catch (error) {
    console.error('Erro ao buscar histórico de newsletters:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar histórico de newsletters',
      },
      { status: 500 }
    )
  }
}
