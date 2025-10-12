const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAppointment() {
  try {
    console.log('🔧 Corrigindo agendamento...');
    
    // Buscar o agendamento órfão
    const orphanAppointment = await prisma.appointment.findFirst({
      where: {
        AND: [
          { communicationContactId: null },
          { medicalPatientId: null }
        ]
      }
    });
    
    if (!orphanAppointment) {
      console.log('❌ Nenhum agendamento órfão encontrado');
      return;
    }
    
    console.log(`📅 Agendamento órfão encontrado: ${orphanAppointment.id}`);
    
    // Buscar um paciente médico para associar
    const medicalPatient = await prisma.medicalPatient.findFirst({
      include: {
        communicationContact: true
      }
    });
    
    if (!medicalPatient) {
      console.log('❌ Nenhum paciente médico encontrado');
      return;
    }
    
    console.log(`👤 Associando ao paciente: ${medicalPatient.fullName}`);
    
    // Atualizar o agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: { id: orphanAppointment.id },
      data: {
        medicalPatientId: medicalPatient.id,
        communicationContactId: medicalPatient.communicationContactId
      }
    });
    
    console.log('✅ Agendamento corrigido com sucesso!');
    console.log(`📋 Detalhes:`);
    console.log(`  - ID: ${updatedAppointment.id}`);
    console.log(`  - Data: ${updatedAppointment.appointmentDate} às ${updatedAppointment.appointmentTime}`);
    console.log(`  - Paciente ID: ${updatedAppointment.medicalPatientId}`);
    console.log(`  - Contact ID: ${updatedAppointment.communicationContactId}`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir agendamento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAppointment();