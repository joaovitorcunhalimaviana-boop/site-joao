import nodemailer from 'nodemailer'

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
  port: parseInt(process.env['EMAIL_PORT'] || '587'),
  secure: process.env['EMAIL_SECURE'] === 'true',
  auth: {
    user: process.env['EMAIL_USER'],
    pass: process.env['EMAIL_PASSWORD'],
  },
  tls: {
    rejectUnauthorized: false,
  },
})

// Interface para dados do paciente
export interface PatientEmailData {
  name: string
  email: string
  birthDate?: string
}

// Templates de e-mail
const emailTemplates = {
  welcome: {
    subject: 'Bem-vindo(a) ao consultório Dr. João Vitor Viana',
    html: (patientName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #000000;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo(a)!</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Olá, caro paciente!</h2>
          
          <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">É com imenso carinho e satisfação que recebemos você em nossa clínica. Estamos aqui para cuidar da sua saúde com todo o acolhimento, dedicação e excelência que você merece.</p>
          
          <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">Sabemos que cuidar da saúde pode gerar ansiedades, e por isso queremos que você se sinta completamente à vontade e seguro(a) conosco. Nossa equipe está preparada para oferecer o melhor atendimento, sempre proporcionando as tecnologias mais novas e baseadas nas melhores evidências científicas, com humanização e respeito.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1e3a8a;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Nossa clínica especializada em coloproctologia e cirurgia geral</h3>
            <p style="margin: 0; line-height: 1.6; color: #1f2937; text-align: justify;">Oferecemos atendimento completo e personalizado, sempre priorizando seu bem-estar e conforto em cada etapa do tratamento.</p>
          </div>
          
          <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">Estamos comprometidos em proporcionar a você uma experiência de cuidado excepcional, onde sua saúde e tranquilidade são nossas prioridades.</p>
          
          <!-- Link do Instagram após o texto sobre experiência excepcional -->
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://instagram.com/drjoaovitorviana" 
               style="display: inline-block; background: #1e3a8a; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; 
                      box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
              📸 Me siga no Instagram para dicas de coloproctologia
            </a>
          </div>
          
          <div style="background-color: #1e3a8a; color: white; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h3 style="margin-top: 0;">Entre em Contato</h3>
            <p style="margin-bottom: 20px;">Fale conosco através dos nossos canais de atendimento</p>
            
            <!-- Grid de contatos simétrico -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div style="text-align: center;">
                <p style="margin: 5px 0; font-weight: bold;">📞 Telefone</p>
                <p style="margin: 0; font-size: 14px;">(83) 3225-1747</p>
              </div>
              <div style="text-align: center;">
                <p style="margin: 5px 0; font-weight: bold;">💬 WhatsApp</p>
                <p style="margin: 0; font-size: 14px;">(83) 9 9122-1599</p>
              </div>
              <div style="text-align: center;">
                <p style="margin: 5px 0; font-weight: bold;">✉️ E-mail</p>
                <p style="margin: 0; font-size: 12px; color: white;">joaovitorvianacoloprocto@gmail.com</p>
              </div>
              <div style="text-align: center;">
                <p style="margin: 5px 0; font-weight: bold;">📱 Instagram</p>
                <p style="margin: 0; font-size: 14px;">@drjoaovitorviana</p>
              </div>
            </div>
            
            <!-- Endereço como rodapé -->
            <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 15px; margin-top: 15px;">
              <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">📍 Localização do Consultório</p>
              <p style="margin: 0; font-size: 13px; line-height: 1.4;">Avenida Rui Barbosa, 484<br>Edifício Arcádia, Sala 101 - Torre<br>João Pessoa - PB</p>
            </div>
          </div>
          
          <p style="text-align: center; color: #4b5563; font-size: 14px; margin-top: 30px; text-align: justify;">Esperamos vê-lo em breve para iniciarmos juntos este cuidado com sua saúde.</p>
        </div>
      </div>
    `,
  },

  birthday: {
    subject: 'Feliz Aniversário! 🎉',
    html: (patientName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Feliz Aniversário! 🎉</h1>
        </div>
        
        <div style="padding: 30px; text-align: center;">
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Parabéns, ${patientName}!</h2>
          
          <p style="line-height: 1.6; margin-bottom: 20px; font-size: 18px; color: #1f2937;">Hoje é um dia muito especial e queremos parabenizá-lo(a) por mais um ano de vida!</p>
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #1e3a8a;">
            <p style="margin: 0; line-height: 1.6; font-size: 16px; color: #1e3a8a;">Desejamos que este novo ano seja repleto de saúde, alegria e realizações. Continue cuidando bem de si mesmo(a)!</p>
          </div>
          
          <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">Com carinho,<br><strong style="color: #1f2937;">Dr. João Vitor Viana e equipe</strong></p>
        </div>
      </div>
    `,
  },

  newsletter: {
    subject: 'Newsletter - Dicas de Saúde',
    html: (content: string) => content, // Usar o conteúdo HTML completo enviado pelo editor
  },
}

// Função para enviar e-mail de boas-vindas
export async function sendWelcomeEmail(
  patientData: PatientEmailData
): Promise<boolean> {
  try {
    console.log(
      '📧 Tentando enviar e-mail de boas-vindas para:',
      patientData.email
    )
    console.log('📧 Configuração do transporter:')
    console.log('- Host:', process.env['EMAIL_HOST'] || 'smtp.gmail.com')
    console.log('- Port:', process.env['EMAIL_PORT'] || '587')
    console.log(
      '- User:',
      process.env['EMAIL_USER'] ? 'Configurado' : 'Não configurado'
    )
    console.log(
      '- Pass:',
      process.env['EMAIL_PASSWORD'] ? 'Configurado' : 'Não configurado'
    )

    const mailOptions = {
      from: `"${process.env['EMAIL_FROM_NAME'] || 'Dr. João Vitor Viana - Coloproctologia'}" <${process.env['EMAIL_USER'] || 'joaovitorvianacoloprocto@gmail.com'}>`,
      to: patientData.email,
      subject: emailTemplates.welcome.subject,
      html: emailTemplates.welcome.html(patientData.name),
      replyTo: process.env['EMAIL_REPLY_TO'],
    }

    console.log('📧 Opções do email:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    })

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ E-mail de boas-vindas enviado com sucesso!')
    console.log('📧 Resultado:', result.messageId)
    return true
  } catch (error) {
    console.error('❌ ERRO DETALHADO ao enviar e-mail de boas-vindas:')
    console.error(
      '❌ Tipo do erro:',
      error instanceof Error ? error.constructor.name : typeof error
    )
    console.error(
      '❌ Mensagem:',
      error instanceof Error ? error.message : String(error)
    )
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'N/A')
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('❌ Código do erro:', (error as any).code)
    }
    return false
  }
}

// Função para enviar e-mail de aniversário
export async function sendBirthdayEmail(
  patientData: PatientEmailData
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"${process.env['EMAIL_FROM_NAME'] || 'Dr. João Vitor Viana - Coloproctologia'}" <${process.env['EMAIL_USER'] || 'joaovitorvianacoloprocto@gmail.com'}>`,
      to: patientData.email,
      subject: emailTemplates.birthday.subject,
      html: emailTemplates.birthday.html(patientData.name),
      replyTo: process.env['EMAIL_REPLY_TO'],
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ E-mail de aniversário enviado para ${patientData.email}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail de aniversário:', error)
    return false
  }
}

// Função para enviar newsletter
export async function sendNewsletterEmail(
  recipients: string[],
  content: string,
  customSubject?: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"${process.env['EMAIL_FROM_NAME'] || 'Dr. João Vitor Viana - Coloproctologia'}" <${process.env['EMAIL_USER'] || 'joaovitorvianacoloprocto@gmail.com'}>`,
      bcc: recipients, // Usar BCC para envio em massa
      subject: customSubject || emailTemplates.newsletter.subject,
      html: emailTemplates.newsletter.html(content),
      replyTo: process.env['EMAIL_REPLY_TO'],
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Newsletter enviada para ${recipients.length} destinatários`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar newsletter:', error)
    return false
  }
}

// Função para verificar aniversariantes do dia
export function getTodayBirthdays(
  patients: PatientEmailData[]
): PatientEmailData[] {
  const today = new Date()
  const todayMonth = today.getMonth() + 1
  const todayDay = today.getDate()

  return patients.filter(patient => {
    if (!patient.birthDate) return false

    const birthDate = new Date(patient.birthDate)
    const birthMonth = birthDate.getMonth() + 1
    const birthDay = birthDate.getDate()

    return birthMonth === todayMonth && birthDay === todayDay
  })
}

// Função para processar envios automáticos de aniversário
export async function processBirthdayEmails(
  patients: PatientEmailData[]
): Promise<void> {
  const birthdayPatients = getTodayBirthdays(patients)

  if (birthdayPatients.length === 0) {
    console.log('📅 Nenhum aniversariante hoje')
    return
  }

  console.log(`🎂 ${birthdayPatients.length} aniversariante(s) hoje`)

  for (const patient of birthdayPatients) {
    await sendBirthdayEmail(patient)
    // Pequena pausa entre envios para evitar spam
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}
