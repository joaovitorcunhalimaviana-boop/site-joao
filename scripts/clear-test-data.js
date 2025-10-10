// Script para limpar todos os dados de teste do sistema
// Remove pacientes, agendamentos e prontuários médicos

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearAllTestData() {
  try {
    console.log('🧹 Iniciando limpeza de dados de teste...')
    
    // 1. Deletar todos os agendamentos
    console.log('📅 Removendo agendamentos...')
    const deletedAppointments = await prisma.appointment.deleteMany({})
    console.log(`✅ ${deletedAppointments.count} agendamentos removidos`)
    
    // 2. Deletar todos os prontuários médicos
    console.log('📋 Removendo prontuários médicos...')
    const deletedMedicalRecords = await prisma.medicalRecord.deleteMany({})
    console.log(`✅ ${deletedMedicalRecords.count} prontuários médicos removidos`)
    
    // 3. Deletar todos os pacientes médicos
    console.log('👥 Removendo pacientes médicos...')
    const deletedMedicalPatients = await prisma.medicalPatient.deleteMany({})
    console.log(`✅ ${deletedMedicalPatients.count} pacientes médicos removidos`)
    
    // 4. Deletar todos os contatos de comunicação
    console.log('📞 Removendo contatos de comunicação...')
    const deletedCommunicationContacts = await prisma.communicationContact.deleteMany({})
    console.log(`✅ ${deletedCommunicationContacts.count} contatos de comunicação removidos`)
    
    // 5. Deletar anexos médicos se existirem
    try {
      console.log('📎 Removendo anexos médicos...')
      const deletedAttachments = await prisma.medicalAttachment.deleteMany({})
      console.log(`✅ ${deletedAttachments.count} anexos médicos removidos`)
    } catch (error) {
      console.log('ℹ️ Tabela de anexos médicos não encontrada ou vazia')
    }
    
    // 6. Deletar consultas se existirem
    try {
      console.log('🩺 Removendo consultas...')
      const deletedConsultations = await prisma.consultation.deleteMany({})
      console.log(`✅ ${deletedConsultations.count} consultas removidas`)
    } catch (error) {
      console.log('ℹ️ Tabela de consultas não encontrada ou vazia')
    }
    
    // 7. Deletar cirurgias se existirem
    try {
      console.log('🏥 Removendo cirurgias...')
      const deletedSurgeries = await prisma.surgery.deleteMany({})
      console.log(`✅ ${deletedSurgeries.count} cirurgias removidas`)
    } catch (error) {
      console.log('ℹ️ Tabela de cirurgias não encontrada ou vazia')
    }
    
    console.log('\n🎉 Limpeza completa! Todos os dados de teste foram removidos.')
    console.log('📊 Sistema pronto para uso em produção.')
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
clearAllTestData()
  .then(() => {
    console.log('✅ Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Falha na execução do script:', error)
    process.exit(1)
  })