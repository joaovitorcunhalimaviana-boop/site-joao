const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAppointment() {
  try {
    console.log('🔍 Verificando agendamentos...');
    
    const appointments = await prisma.appointment.findMany({
      include: {
        communicationContact: true,
        medicalPatient: {
          include: {
            communicationContact: true
          }
        }
      }
    });
    
    console.log(`📅 Total de agendamentos: ${appointments.length}`);
    
    appointments.forEach((apt, index) => {
      console.log(`\n--- Agendamento ${index + 1} ---`);
      console.log(`ID: ${apt.id}`);
      console.log(`Data: ${apt.appointmentDate} às ${apt.appointmentTime}`);
      console.log(`communicationContactId: ${apt.communicationContactId}`);
      console.log(`medicalPatientId: ${apt.medicalPatientId}`);
      
      if (apt.communicationContact) {
        console.log(`✅ CommunicationContact encontrado:`);
        console.log(`  - Nome: ${apt.communicationContact.name}`);
        console.log(`  - Email: ${apt.communicationContact.email}`);
        console.log(`  - WhatsApp: ${apt.communicationContact.whatsapp}`);
      } else {
        console.log(`❌ CommunicationContact não encontrado`);
      }
      
      if (apt.medicalPatient) {
        console.log(`✅ MedicalPatient encontrado:`);
        console.log(`  - Nome: ${apt.medicalPatient.fullName}`);
        console.log(`  - CPF: ${apt.medicalPatient.cpf}`);
        console.log(`  - Convênio: ${apt.medicalPatient.insuranceType}`);
        if (apt.medicalPatient.communicationContact) {
          console.log(`  - Contact associado: ${apt.medicalPatient.communicationContact.name}`);
        }
      } else {
        console.log(`❌ MedicalPatient não encontrado`);
      }
    });
    
    console.log('\n🔍 Verificando pacientes médicos...');
    const medicalPatients = await prisma.medicalPatient.findMany({
      include: {
        communicationContact: true
      }
    });
    
    console.log(`👥 Total de pacientes médicos: ${medicalPatients.length}`);
    medicalPatients.forEach((patient, index) => {
      console.log(`\n--- Paciente Médico ${index + 1} ---`);
      console.log(`ID: ${patient.id}`);
      console.log(`Nome: ${patient.fullName}`);
      console.log(`CPF: ${patient.cpf}`);
      console.log(`CommunicationContactId: ${patient.communicationContactId}`);
      if (patient.communicationContact) {
        console.log(`Contact: ${patient.communicationContact.name} (${patient.communicationContact.whatsapp})`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAppointment();