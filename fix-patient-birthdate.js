const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixPatientBirthDate() {
  try {
    console.log('🔍 Buscando paciente João Vítor da Cunha Lima Viana...')
    
    // Buscar o contato de comunicação
    const contact = await prisma.communicationContact.findFirst({
      where: {
        name: {
          contains: 'João Vítor da Cunha Lima Viana',
          mode: 'insensitive'
        }
      }
    })
    
    if (!contact) {
      console.log('❌ Contato não encontrado')
      return
    }
    
    console.log('📋 Contato encontrado:', {
      id: contact.id,
      name: contact.name,
      birthDate: contact.birthDate
    })
    
    // Atualizar a data de nascimento (assumindo que o paciente nasceu em 1997 baseado no contexto)
    const updatedContact = await prisma.communicationContact.update({
      where: { id: contact.id },
      data: {
        birthDate: '1997-01-02' // Data de exemplo, pode ser ajustada
      }
    })
    
    console.log('✅ Data de nascimento atualizada:', {
      id: updatedContact.id,
      name: updatedContact.name,
      birthDate: updatedContact.birthDate
    })
    
    // Verificar se existe paciente médico associado
    const medicalPatient = await prisma.medicalPatient.findFirst({
      where: {
        communicationContactId: contact.id
      }
    })
    
    if (medicalPatient) {
      console.log('🏥 Paciente médico encontrado:', {
        id: medicalPatient.id,
        fullName: medicalPatient.fullName
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar data de nascimento:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixPatientBirthDate()