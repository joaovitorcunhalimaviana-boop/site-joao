const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAppointments() {
  try {
    // Buscar agendamentos do paciente João Vítor
    const appointments = await prisma.appointment.findMany({
      where: {
        medicalPatient: {
          fullName: {
            contains: 'João Vítor da Cunha Lima Viana'
          }
        }
      },
      include: {
        medicalPatient: true
      }
    });

    console.log('📋 Agendamentos encontrados:', appointments.length);
    
    if (appointments.length > 0) {
      appointments.forEach((appointment, index) => {
        console.log(`\n--- Agendamento ${index + 1} ---`);
        console.log('ID:', appointment.id);
        console.log('Data:', appointment.appointmentDate);
        console.log('Hora:', appointment.appointmentTime);
        console.log('Status:', appointment.status);
        console.log('Paciente:', appointment.medicalPatient?.fullName);
      });
    } else {
      console.log('❌ Nenhum agendamento encontrado para este paciente');
      
      // Vamos criar um agendamento de teste
      console.log('\n🔧 Criando agendamento de teste...');
      
      const patient = await prisma.medicalPatient.findFirst({
        where: {
          fullName: {
            contains: 'João Vítor da Cunha Lima Viana'
          }
        }
      });
      
      if (patient) {
        const newAppointment = await prisma.appointment.create({
          data: {
            medicalPatientId: patient.id,
            appointmentDate: '2024-01-15',
            appointmentTime: '14:00',
            status: 'SCHEDULED',
            type: 'CONSULTATION',
            source: 'MANUAL',
            reason: 'Consulta de rotina',
            doctorName: 'Dr. João Viana'
          }
        });
        
        console.log('✅ Agendamento criado com ID:', newAppointment.id);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAppointments();