import { PrismaClient } from '@prisma/client'

// Uso: node scripts/delete-communication-contact.mjs --name "Nome do Paciente" | --id <patientId>
// Remove o CommunicationContact associado ao paciente, garantindo que não existam dependências bloqueando.

const prisma = new PrismaClient()

function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--name') parsed.name = args[++i]
    else if (arg === '--id') parsed.id = args[++i]
  }
  return parsed
}

async function run() {
  const { name, id } = parseArgs()

  if (!name && !id) {
    console.error('❌ Informe --name "Nome do Paciente" ou --id <patientId>')
    process.exit(1)
  }

  try {
    let patient
    if (id) {
      patient = await prisma.medicalPatient.findUnique({
        where: { id },
        include: { communicationContact: true }
      })
    } else {
      patient = await prisma.medicalPatient.findFirst({
        where: { fullName: name },
        include: { communicationContact: true }
      })
    }

    if (!patient) {
      console.error('❌ Paciente não encontrado.')
      process.exit(2)
    }

    const contactId = patient.communicationContactId
    if (!contactId) {
      console.log('ℹ️ Paciente não possui contato de comunicação vinculado.')
      process.exit(0)
    }

    // Apagar quaisquer agendamentos restantes que referenciem o contato
    const delAptsByContact = await prisma.appointment.deleteMany({
      where: { communicationContactId: contactId }
    })
    console.log(`🗑️ Agendamentos por contato removidos: ${delAptsByContact.count}`)

    // Remover fontes de registro e reviews serão removidos por cascade ao deletar o contato

    // Deletar o contato (irá em cascade remover MedicalPatient em alguns schemas)
    const contactBefore = await prisma.communicationContact.findUnique({
      where: { id: contactId },
      include: { registrationSources: true, reviews: true }
    })

    if (!contactBefore) {
      console.log('ℹ️ Contato de comunicação já inexistente.')
    } else {
      console.log('🔎 Contato encontrado:', {
        id: contactBefore.id,
        name: contactBefore.name,
        email: contactBefore.email,
        whatsapp: contactBefore.whatsapp,
        regSources: contactBefore.registrationSources?.length || 0,
        reviews: contactBefore.reviews?.length || 0
      })
      await prisma.communicationContact.delete({ where: { id: contactId } })
      console.log('✅ Contato de comunicação deletado com sucesso.')
    }

    // Conferir se o paciente ainda existe (dependendo do schema, pode ter sido removido por cascade)
    const patientAfter = await prisma.medicalPatient.findUnique({ where: { id: patient.id } })
    if (patientAfter) {
      console.log('⚠️ Paciente ainda existe após remoção do contato. Marcando como inativo e limpando vínculo.')
      await prisma.medicalPatient.update({
        where: { id: patient.id },
        data: { isActive: false }
      })
    } else {
      console.log('🧹 Paciente foi removido automaticamente pelo cascade da relação.')
    }

    console.log('🎉 Remoção do contato concluída com sucesso.')
  } catch (error) {
    console.error('❌ Erro ao excluir contato de comunicação:', error)
    process.exit(3)
  } finally {
    await prisma.$disconnect()
  }
}

run()