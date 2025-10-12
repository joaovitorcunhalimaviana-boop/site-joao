const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugPatient() {
  try {
    console.log('🔍 Buscando paciente João Vítor da Cunha Lima Viana...')
    
    // Buscar paciente médico
    const medicalPatient = await prisma.medicalPatient.findFirst({
      where: {
        fullName: {
          contains: 'João Vítor da Cunha Lima Viana',
          mode: 'insensitive'
        }
      }
    })
    
    console.log('👤 Paciente médico encontrado:', medicalPatient)
    
    if (medicalPatient && medicalPatient.communicationContactId) {
      // Buscar contato de comunicação
      const contact = await prisma.communicationContact.findUnique({
        where: {
          id: medicalPatient.communicationContactId
        }
      })
      
      console.log('📞 Contato de comunicação:', contact)
      console.log('🎂 Data de nascimento no contato:', contact?.birthDate)
    }
    
    // Buscar também em contatos de comunicação diretamente
    const directContact = await prisma.communicationContact.findFirst({
      where: {
        name: {
          contains: 'João Vítor da Cunha Lima Viana',
          mode: 'insensitive'
        }
      }
    })
    
    console.log('📞 Contato direto encontrado:', directContact)
    console.log('🎂 Data de nascimento no contato direto:', directContact?.birthDate)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugPatient()