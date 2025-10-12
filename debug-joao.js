const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function debugJoao() {
  try {
    let output = '=== DEBUG JOÃO VÍTOR ===\n\n';
    
    // Buscar Medical Patients
    const medicalPatients = await prisma.medicalPatient.findMany({
      where: {
        fullName: {
          contains: 'João Vítor'
        }
      },
      include: {
        appointments: true
      }
    });
    
    output += `Medical Patients encontrados: ${medicalPatients.length}\n`;
    medicalPatients.forEach((patient, index) => {
      output += `\nPaciente ${index + 1}:\n`;
      output += `- ID: ${patient.id}\n`;
      output += `- Nome: ${patient.fullName}\n`;
      output += `- CPF: ${patient.cpf}\n`;
      output += `- Ativo: ${patient.isActive}\n`;
      output += `- Agendamentos: ${patient.appointments.length}\n`;
      
      patient.appointments.forEach((apt, aptIndex) => {
        output += `  Agendamento ${aptIndex + 1}:\n`;
        output += `  - Data: ${apt.scheduledDate}\n`;
        output += `  - Status: ${apt.status}\n`;
        output += `  - Tipo: ${apt.type}\n`;
      });
    });
    
    // Buscar todos os agendamentos
    const appointments = await prisma.appointment.findMany({
      where: {
        medicalPatient: {
          fullName: {
            contains: 'João Vítor'
          }
        }
      },
      include: {
        medicalPatient: true
      }
    });
    
    output += `\n\nAgendamentos encontrados: ${appointments.length}\n`;
    appointments.forEach((apt, index) => {
      output += `\nAgendamento ${index + 1}:\n`;
      output += `- ID: ${apt.id}\n`;
      output += `- Data: ${apt.appointmentDate}\n`;
      output += `- Hora: ${apt.appointmentTime}\n`;
      output += `- Status: ${apt.status}\n`;
      output += `- Tipo: ${apt.type}\n`;
      if (apt.medicalPatient) {
        output += `- Nome: ${apt.medicalPatient.fullName}\n`;
      }
    });
    
    // Salvar no arquivo
    fs.writeFileSync('joao-debug-output.txt', output);
    console.log('Dados salvos em joao-debug-output.txt');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugJoao();