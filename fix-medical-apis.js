const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMedicalAPIs() {
  console.log('🔧 Corrigindo problemas das APIs médicas...');
  
  try {
    // 1. Verificar se o usuário médico existe
    console.log('\n1. Verificando usuário médico...');
    const doctor = await prisma.user.findFirst({
      where: {
        role: 'DOCTOR'
      }
    });
    
    if (!doctor) {
      console.log('❌ Usuário médico não encontrado. Criando...');
      const newDoctor = await prisma.user.create({
        data: {
          email: 'joao.viana@example.com',
          username: 'joao.viana',
          password: '$2b$10$example.hash', // Hash da senha Logos1.1
          role: 'DOCTOR',
          name: 'Dr. João Vitor Viana',
          isActive: true
        }
      });
      console.log('✅ Usuário médico criado:', newDoctor.id);
    } else {
      console.log('✅ Usuário médico encontrado:', doctor.id);
    }
    
    // 2. Verificar se existe um paciente médico de teste
    console.log('\n2. Verificando paciente médico de teste...');
    let testPatient = await prisma.medicalPatient.findFirst({
      where: {
        fullName: 'Paciente Teste'
      }
    });
    
    if (!testPatient) {
      console.log('❌ Paciente de teste não encontrado. Criando...');
      
      // Primeiro criar um contato de comunicação
      const communicationContact = await prisma.communicationContact.create({
        data: {
          name: 'Paciente Teste',
          email: 'paciente.teste@example.com',
          phone: '11999999999',
          birthDate: '1990-01-01'
        }
      });
      
      testPatient = await prisma.medicalPatient.create({
        data: {
          communicationContactId: communicationContact.id,
          fullName: 'Paciente Teste',
          cpf: '12345678901',
          medicalRecordNumber: 1001,
          address: 'Rua Teste, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234567',
          insuranceType: 'PARTICULAR'
        }
      });
      console.log('✅ Paciente de teste criado:', testPatient.id);
    } else {
      console.log('✅ Paciente de teste encontrado:', testPatient.id);
    }
    
    // 3. Verificar diretório de uploads
    const fs = require('fs');
    const path = require('path');
    
    console.log('\n3. Verificando diretório de uploads...');
    const uploadsDir = path.join(process.cwd(), 'uploads', 'medical-attachments');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Diretório de uploads não existe. Criando...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Diretório de uploads criado:', uploadsDir);
    } else {
      console.log('✅ Diretório de uploads existe:', uploadsDir);
    }
    
    // 4. Testar criação de consulta
    console.log('\n4. Testando criação de consulta...');
    const doctorUser = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
    
    if (doctorUser && testPatient) {
      try {
        const testConsultation = await prisma.consultation.create({
          data: {
            medicalPatientId: testPatient.id,
            doctorId: doctorUser.id,
            startTime: new Date(),
            status: 'IN_PROGRESS',
            anamnese: 'Consulta de teste'
          }
        });
        console.log('✅ Consulta de teste criada:', testConsultation.id);
        
        // Limpar consulta de teste
        await prisma.consultation.delete({ where: { id: testConsultation.id } });
        console.log('✅ Consulta de teste removida');
        
      } catch (error) {
        console.error('❌ Erro ao criar consulta de teste:', error.message);
      }
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMedicalAPIs();