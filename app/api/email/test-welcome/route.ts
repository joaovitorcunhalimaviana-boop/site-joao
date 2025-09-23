import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email-service'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    console.log('🧪 Iniciando teste de email de boas-vindas...')

    // Carregar dados do paciente cadastrado
    const patientsPath = path.join(process.cwd(), 'data', 'patients.json')
    const patientsData = JSON.parse(fs.readFileSync(patientsPath, 'utf8'))

    if (patientsData.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhum paciente cadastrado encontrado',
        },
        { status: 404 }
      )
    }

    // Usar o primeiro paciente com email
    const patient = patientsData.find(
      (p: any) => p.email && p.email.trim() !== ''
    )

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhum paciente com email encontrado',
        },
        { status: 404 }
      )
    }

    console.log(
      `📧 Enviando email de teste para: ${patient.name} (${patient.email})`
    )

    // Enviar email de boas-vindas
    const emailSent = await sendWelcomeEmail({
      name: patient.name,
      email: patient.email,
      birthDate: patient.birthDate,
    })

    if (emailSent) {
      console.log(`✅ Email de teste enviado com sucesso!`)

      return NextResponse.json({
        success: true,
        message: `Email de boas-vindas enviado com sucesso!`,
        patient: {
          name: patient.name,
          email: patient.email,
        },
        sentAt: new Date().toISOString(),
      })
    } else {
      console.error(`❌ Falha ao enviar email de teste`)
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao enviar email. Verifique as configurações SMTP.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Erro ao processar teste de email:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        troubleshooting: {
          message:
            'Verifique se as configurações de email estão corretas no arquivo .env.local',
          steps: [
            '1. Configure EMAIL_PASSWORD com a senha de aplicativo do Gmail',
            '2. Verifique se a verificação em 2 etapas está ativa no Gmail',
            '3. Consulte o arquivo CONFIGURAR_EMAIL_GMAIL.md para instruções detalhadas',
          ],
        },
      },
      { status: 500 }
    )
  }
}

// GET para verificar configurações
export async function GET() {
  try {
    const emailUser = process.env['EMAIL_USER']
    const emailPassword = process.env['EMAIL_PASSWORD']
    const smtpHost = process.env['SMTP_HOST']
    const smtpPort = process.env['SMTP_PORT']

    return NextResponse.json({
      success: true,
      config: {
        emailConfigured: !!emailUser && !!emailPassword,
        emailUser: emailUser || 'Não configurado',
        passwordConfigured: emailPassword ? 'Configurado' : 'Não configurado',
        smtpHost: smtpHost || 'smtp.gmail.com',
        smtpPort: smtpPort || '587',
        status:
          emailUser && emailPassword
            ? 'Pronto para envio'
            : 'Configuração incompleta',
      },
      instructions: {
        message:
          'Para configurar o email, siga as instruções no arquivo CONFIGURAR_EMAIL_GMAIL.md',
        configFile: '.env.local',
        requiredVars: ['EMAIL_USER', 'EMAIL_PASSWORD'],
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao verificar configurações',
      },
      { status: 500 }
    )
  }
}
