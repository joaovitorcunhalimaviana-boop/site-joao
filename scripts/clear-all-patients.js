const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAllPatientData() {
  console.log('🧹 Iniciando limpeza completa de dados de pacientes...');
  
  try {
    // Desabilitar verificações de chave estrangeira temporariamente
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF`;
    
    console.log('📋 Limpando dados em ordem de dependência...');
    
    // 1. Limpar prescrições
    const prescriptions = await prisma.prescription.deleteMany({});
    console.log(`✅ Removidas ${prescriptions.count} prescrições`);
    
    // 2. Limpar anexos médicos
    const attachments = await prisma.medicalAttachment.deleteMany({});
    console.log(`✅ Removidos ${attachments.count} anexos médicos`);
    
    // 3. Limpar resultados de calculadoras
    const calculatorResults = await prisma.calculatorResult.deleteMany({});
    console.log(`✅ Removidos ${calculatorResults.count} resultados de calculadoras`);
    
    // 4. Limpar prontuários médicos
    const medicalRecords = await prisma.medicalRecord.deleteMany({});
    console.log(`✅ Removidos ${medicalRecords.count} prontuários médicos`);
    
    // 5. Limpar consultas
    const consultations = await prisma.consultation.deleteMany({});
    console.log(`✅ Removidas ${consultations.count} consultas`);
    
    // 6. Limpar agendamentos
    const appointments = await prisma.appointment.deleteMany({});
    console.log(`✅ Removidos ${appointments.count} agendamentos`);
    
    // 7. Limpar pacientes médicos
    const medicalPatients = await prisma.medicalPatient.deleteMany({});
    console.log(`✅ Removidos ${medicalPatients.count} pacientes médicos`);
    
    // 8. Limpar contatos de comunicação
    const communicationContacts = await prisma.communicationContact.deleteMany({});
    console.log(`✅ Removidos ${communicationContacts.count} contatos de comunicação`);
    
    // 9. Limpar pacientes antigos (deprecated)
    const patients = await prisma.patient.deleteMany({});
    console.log(`✅ Removidos ${patients.count} pacientes (sistema antigo)`);
    
    // 10. Limpar assinantes da newsletter
    const newsletterSubscribers = await prisma.newsletterSubscriber.deleteMany({});
    console.log(`✅ Removidos ${newsletterSubscribers.count} assinantes da newsletter`);
    
    // 11. Limpar avaliações
    const reviews = await prisma.review.deleteMany({});
    console.log(`✅ Removidas ${reviews.count} avaliações`);
    
    // 12. Limpar detecções de duplicatas
    const duplicateDetections = await prisma.duplicateDetection.deleteMany({});
    console.log(`✅ Removidas ${duplicateDetections.count} detecções de duplicatas`);
    
    // Reabilitar verificações de chave estrangeira
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
    
    console.log('🎉 Limpeza completa finalizada com sucesso!');
    console.log('📊 Resumo da limpeza:');
    console.log(`   • Prescrições: ${prescriptions.count}`);
    console.log(`   • Anexos médicos: ${attachments.count}`);
    console.log(`   • Resultados de calculadoras: ${calculatorResults.count}`);
    console.log(`   • Prontuários médicos: ${medicalRecords.count}`);
    console.log(`   • Consultas: ${consultations.count}`);
    console.log(`   • Agendamentos: ${appointments.count}`);
    console.log(`   • Pacientes médicos: ${medicalPatients.count}`);
    console.log(`   • Contatos de comunicação: ${communicationContacts.count}`);
    console.log(`   • Pacientes (sistema antigo): ${patients.count}`);
    console.log(`   • Assinantes da newsletter: ${newsletterSubscribers.count}`);
    console.log(`   • Avaliações: ${reviews.count}`);
    console.log(`   • Detecções de duplicatas: ${duplicateDetections.count}`);
    
    const total = prescriptions.count + attachments.count + calculatorResults.count + 
                  medicalRecords.count + consultations.count + appointments.count + 
                  medicalPatients.count + communicationContacts.count + patients.count + 
                  newsletterSubscribers.count + reviews.count + duplicateDetections.count;
    
    console.log(`📈 Total de registros removidos: ${total}`);
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
if (require.main === module) {
  clearAllPatientData()
    .then(() => {
      console.log('✨ Sistema limpo e pronto para novos testes!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na limpeza:', error);
      process.exit(1);
    });
}

module.exports = { clearAllPatientData };