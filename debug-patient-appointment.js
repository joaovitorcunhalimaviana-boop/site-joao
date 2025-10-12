const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugPatientAppointment() {
  try {
    console.log('🔍 INVESTIGANDO PROBLEMA DO PACIENTE NA CONSULTA')
    console.log('==================================================')
    
    // 1. Verificar todos os pacientes cadastrados
    console.log('\n1. 👥 PACIENTES CADASTRADOS:')
    console.log('----------------------------')
    
    const medicalPatients = await prisma.medicalPatient.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    
    console.log(`✅ Total de pacientes médicos: ${medicalPatients.length}`)
    medicalPatients.forEach((patient, index) => {
      console.log(`\n${index + 1}. Paciente ID: ${patient.id}`)
      console.log(`   Nome: ${patient.name}`)
      console.log(`   CPF: ${patient.cpf}`)
      console.log(`   Telefone: ${patient.phone}`)
      console.log(`   WhatsApp: ${patient.whatsapp}`)
      console.log(`   Email: ${patient.email}`)
      console.log(`   Convênio: ${patient.healthInsurance}`)
      console.log(`   Criado em: ${patient.createdAt}`)
    })
    
    // 2. Verificar consultas agendadas
    console.log('\n\n2. 📅 CONSULTAS AGENDADAS:')
    console.log('---------------------------')
    
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        medicalPatient: true,
        creator: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })
    
    console.log(`✅ Total de consultas: ${appointments.length}`)
    appointments.forEach((appointment, index) => {
      console.log(`\n${index + 1}. Consulta ID: ${appointment.id}`)
      console.log(`   Data/Hora: ${appointment.dateTime}`)
      console.log(`   Status: ${appointment.status}`)
      console.log(`   Tipo: ${appointment.type}`)
      console.log(`   Criado por: ${appointment.creator?.name} (${appointment.creator?.username})`)
      console.log(`   Paciente vinculado: ${appointment.medicalPatientId ? 'SIM' : 'NÃO'}`)
      
      if (appointment.medicalPatient) {
        console.log(`   📋 DADOS DO PACIENTE VINCULADO:`)
        console.log(`      Nome: ${appointment.medicalPatient.name}`)
        console.log(`      CPF: ${appointment.medicalPatient.cpf}`)
        console.log(`      Telefone: ${appointment.medicalPatient.phone}`)
        console.log(`      WhatsApp: ${appointment.medicalPatient.whatsapp}`)
        console.log(`      Convênio: ${appointment.medicalPatient.healthInsurance}`)
      } else {
        console.log(`   ❌ NENHUM PACIENTE VINCULADO - ESTE É O PROBLEMA!`)
      }
      
      console.log(`   Criado em: ${appointment.createdAt}`)
    })
    
    // 3. Verificar contatos de comunicação
    console.log('\n\n3. 📞 CONTATOS DE COMUNICAÇÃO:')
    console.log('-------------------------------')
    
    const communicationContacts = await prisma.communicationContact.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    
    console.log(`✅ Total de contatos: ${communicationContacts.length}`)
    communicationContacts.forEach((contact, index) => {
      console.log(`\n${index + 1}. Contato ID: ${contact.id}`)
      console.log(`   Nome: ${contact.name}`)
      console.log(`   Telefone: ${contact.phone}`)
      console.log(`   WhatsApp: ${contact.whatsapp}`)
      console.log(`   Email: ${contact.email}`)
      console.log(`   Criado em: ${contact.createdAt}`)
    })
    
    // 4. Verificar se há duplicação de dados
    console.log('\n\n4. 🔄 ANÁLISE DE DUPLICAÇÃO:')
    console.log('-----------------------------')
    
    if (medicalPatients.length > 0 && communicationContacts.length > 0) {
      const latestPatient = medicalPatients[0]
      const latestContact = communicationContacts[0]
      
      console.log('Comparando último paciente médico com último contato:')
      console.log(`Paciente: ${latestPatient.name} | Contato: ${latestContact.name}`)
      console.log(`Mesmo nome? ${latestPatient.name === latestContact.name ? 'SIM' : 'NÃO'}`)
      console.log(`Mesmo telefone? ${latestPatient.phone === latestContact.phone ? 'SIM' : 'NÃO'}`)
    }
    
    // 5. Verificar configurações do sistema
    console.log('\n\n5. ⚙️  CONFIGURAÇÕES DO SISTEMA:')
    console.log('--------------------------------')
    
    const systemConfigs = await prisma.systemConfig.findMany()
    console.log(`✅ Total de configurações: ${systemConfigs.length}`)
    
    const telegramConfig = systemConfigs.find(config => config.key.includes('telegram') || config.key.includes('TELEGRAM'))
    if (telegramConfig) {
      console.log(`📱 Configuração Telegram encontrada: ${telegramConfig.key}`)
      console.log(`   Valor: ${telegramConfig.value ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`)
    } else {
      console.log('❌ Nenhuma configuração do Telegram encontrada')
    }
    
  } catch (error) {
    console.error('❌ Erro durante a investigação:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

debugPatientAppointment()
  .then(() => {
    console.log('\n✅ Investigação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Falha na investigação:', error)
    process.exit(1)
  })