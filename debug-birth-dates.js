const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugBirthDates() {
  console.log('🔍 Verificando dados de nascimento no banco...')
  
  try {
    // Verificar contatos de comunicação
    const contacts = await prisma.communicationContact.findMany({
      select: {
        id: true,
        name: true,
        birthDate: true,
        email: true
      }
    })
    
    console.log('\n📋 Contatos de Comunicação:')
    contacts.forEach(contact => {
      console.log(`- ${contact.name}: birthDate = "${contact.birthDate}" (tipo: ${typeof contact.birthDate})`)
    })
    
    // Verificar pacientes médicos com seus contatos
    const medicalPatients = await prisma.medicalPatient.findMany({
      select: {
        id: true,
        fullName: true,
        communicationContactId: true,
        cpf: true
      },
      include: {
        communicationContact: {
          select: {
            birthDate: true,
            name: true
          }
        }
      }
    })
    
    console.log('\n🏥 Pacientes Médicos:')
    medicalPatients.forEach(patient => {
      console.log(`- ${patient.fullName}: birthDate do contato = "${patient.communicationContact?.birthDate}" (tipo: ${typeof patient.communicationContact?.birthDate})`)
    })
    
    // Testar a função getMedicalPatientById diretamente
    if (medicalPatients.length > 0) {
      const firstPatientId = medicalPatients[0].id
      console.log(`\n🧪 Testando getMedicalPatientById com ID: ${firstPatientId}`)
      
      const { getMedicalPatientById } = require('./lib/unified-patient-system-prisma')
      const patientData = await getMedicalPatientById(firstPatientId)
      
      console.log('📊 Resultado da função getMedicalPatientById:')
      console.log(`- Nome: ${patientData?.fullName}`)
      console.log(`- birthDate: "${patientData?.birthDate}" (tipo: ${typeof patientData?.birthDate})`)
      console.log(`- phone: "${patientData?.phone}"`)
      console.log(`- whatsapp: "${patientData?.whatsapp}"`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugBirthDates()