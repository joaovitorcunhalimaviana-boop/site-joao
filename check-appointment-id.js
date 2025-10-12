const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAppointment() {
  try {
    const appointmentId = 'cmgnh1lo4000lvdwc7ej8bajy';
    console.log('Procurando agendamento com ID:', appointmentId);
    
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });
    
    if (appointment) {
      console.log('✅ Agendamento encontrado:', appointment);
    } else {
      console.log('❌ Agendamento não encontrado');
    }
    
    // Verificar todos os agendamentos para ver quais IDs existem
    const allAppointments = await prisma.appointment.findMany({
      select: { 
        id: true, 
        appointmentDate: true, 
        appointmentTime: true, 
        status: true,
        medicalPatientId: true,
        reason: true
      },
      include: {
        medicalPatient: {
          select: {
            fullName: true
          }
        }
      }
    });
    
    console.log('\n📋 Todos os agendamentos no banco:');
    allAppointments.forEach(apt => {
      const patientName = apt.medicalPatient?.fullName || 'Sem paciente';
      console.log(`- ID: ${apt.id}, Paciente: ${patientName}, Data: ${apt.appointmentDate}, Hora: ${apt.appointmentTime}, Status: ${apt.status}`);
    });
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAppointment();