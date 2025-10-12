const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPatientBirthdate() {
  try {
    // Buscar o paciente com o contato de comunicação
    const patient = await prisma.medicalPatient.findFirst({
      where: {
        fullName: {
          contains: 'João Vítor da Cunha Lima Viana'
        }
      },
      include: {
        communicationContact: true
      }
    });

    if (!patient) {
      console.log('❌ Paciente não encontrado');
      return;
    }

    console.log('📋 Dados atuais do paciente:');
    console.log('ID:', patient.id);
    console.log('Nome:', patient.fullName);
    console.log('Data de nascimento atual:', patient.communicationContact.birthDate);
    console.log('Contact ID:', patient.communicationContact.id);

    // Corrigir para a data correta: 02/01/1997
    const correctBirthDate = '02/01/1997';

    console.log('\n🔧 Corrigindo para:');
    console.log('Nova data de nascimento:', correctBirthDate);

    // Atualizar no banco - no CommunicationContact
    const updatedContact = await prisma.communicationContact.update({
      where: { id: patient.communicationContact.id },
      data: {
        birthDate: correctBirthDate
      }
    });

    console.log('\n✅ Data de nascimento atualizada com sucesso!');
    console.log('Nova data de nascimento:', updatedContact.birthDate);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPatientBirthdate();