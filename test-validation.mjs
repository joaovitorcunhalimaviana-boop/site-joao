import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testValidation() {
  try {
    console.log('🔍 Testando validação do João Vítor...');
    
    const cpf = '05166083474';
    const patientId = 'cmgla4agm000dvd24ujkmiw10';
    
    // 1. Verificar se o paciente existe
    const patient = await prisma.medicalPatient.findUnique({
      where: { id: patientId }
    });
    
    console.log('\n=== DADOS DO PACIENTE ===');
    console.log('Paciente encontrado:', !!patient);
    if (patient) {
      console.log('ID:', patient.id);
      console.log('Nome:', patient.fullName);
      console.log('CPF:', patient.cpf);
    }
    
    // 2. Verificar consultas ativas
    const activeAppointments = await prisma.appointment.findMany({
      where: {
        medicalPatientId: patientId,
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    });
    
    console.log('\n=== CONSULTAS ATIVAS ===');
    console.log('Consultas ativas encontradas:', activeAppointments.length);
    activeAppointments.forEach((apt, index) => {
      console.log(`Consulta ${index + 1}:`);
      console.log('  - ID:', apt.id);
      console.log('  - Data:', apt.appointmentDate);
      console.log('  - Status:', apt.status);
    });
    
    // 3. Simular a lógica de validação
    const canSchedule = activeAppointments.length === 0;
    console.log('\n=== RESULTADO ===');
    console.log('Pode agendar:', canSchedule);
    console.log('Razão:', canSchedule ? 'Nenhuma consulta ativa' : 'Possui consultas ativas');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testValidation();