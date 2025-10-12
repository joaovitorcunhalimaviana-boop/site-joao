const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJoaoPatient() {
  try {
    console.log('🔍 Buscando dados do paciente João Vítor da Cunha Lima Viana...');
    
    // Buscar como Medical Patient
    const medicalPatients = await prisma.medicalPatient.findMany({
      where: {
        fullName: {
          contains: 'João Vítor da Cunha Lima Viana'
        }
      },
      include: {
        appointments: true
      }
    });
    
    console.log('\n📋 Medical Patients encontrados:', medicalPatients.length);
    medicalPatients.forEach((patient, index) => {
      console.log(`\nPaciente ${index + 1}:`);
      console.log(`- ID: ${patient.id}`);
      console.log(`- Nome: ${patient.fullName}`);
      console.log(`- CPF: ${patient.cpf}`);
      console.log(`- Prontuário: ${patient.medicalRecordNumber}`);
      console.log(`- Ativo: ${patient.isActive}`);
      console.log(`- Agendamentos: ${patient.appointments.length}`);
      
      if (patient.appointments.length > 0) {
        patient.appointments.forEach((apt, aptIndex) => {
          console.log(`  Agendamento ${aptIndex + 1}:`);
          console.log(`  - Data: ${apt.scheduledDate}`);
          console.log(`  - Status: ${apt.status}`);
          console.log(`  - Tipo: ${apt.type}`);
        });
      }
    });
    
    // Buscar agendamentos através do relacionamento com MedicalPatient
    const appointments = await prisma.appointment.findMany({
      where: {
        medicalPatient: {
          fullName: {
            contains: 'João Vítor da Cunha Lima Viana'
          }
        }
      },
      include: {
        medicalPatient: true,
        communicationContact: true
      }
    });
    
    console.log('\n📅 Agendamentos encontrados:', appointments.length);
    appointments.forEach((apt, index) => {
      console.log(`\nAgendamento ${index + 1}:`);
      console.log(`- ID: ${apt.id}`);
      console.log(`- Data: ${apt.appointmentDate}`);
      console.log(`- Hora: ${apt.appointmentTime}`);
      console.log(`- Status: ${apt.status}`);
      console.log(`- Tipo: ${apt.type}`);
      console.log(`- Medical Patient ID: ${apt.medicalPatientId}`);
      if (apt.medicalPatient) {
        console.log(`- Nome do Paciente: ${apt.medicalPatient.fullName}`);
      }
    });
    
    // Buscar como Communication Contact
    const communicationContacts = await prisma.communicationContact.findMany({
      where: {
        name: {
          contains: 'João Vítor da Cunha Lima Viana'
        }
      }
    });
    
    console.log('\n📞 Communication Contacts encontrados:', communicationContacts.length);
    communicationContacts.forEach((contact, index) => {
      console.log(`\nContato ${index + 1}:`);
      console.log(`- ID: ${contact.id}`);
      console.log(`- Nome: ${contact.name}`);
      console.log(`- Email: ${contact.email}`);
      console.log(`- WhatsApp: ${contact.whatsapp}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao consultar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJoaoPatient();