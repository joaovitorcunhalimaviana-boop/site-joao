const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('Criando dados de teste...');
    
    // Criar paciente de teste
    const patient = await prisma.patient.create({
      data: {
        name: 'Paciente Teste',
        cpf: '12345678901',
        birthDate: new Date('1990-01-01'),
        phone: '11999999999',
        email: 'teste@teste.com',
        address: 'Rua Teste, 123',
        communicationContactId: 'test-contact-id'
      }
    });
    
    // Criar agendamento de teste
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        date: new Date(),
        time: '14:00',
        status: 'agendada',
        type: 'consulta',
        notes: 'Consulta de teste para validar hipóteses diagnósticas'
      }
    });
    
    console.log('✅ Agendamento criado:', appointment.id);
    console.log('✅ Paciente criado:', patient.id);
    console.log('\n🔗 URL para testar: http://localhost:3000/area-medica/atendimento/' + appointment.id);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();