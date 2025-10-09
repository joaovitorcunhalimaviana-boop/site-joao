const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUsers() {
  try {
    // Configurar usuário médico
    console.log('Configurando usuário médico...');
    
    const existingDoctor = await prisma.user.findUnique({
      where: { username: 'joao.viana' }
    });

    const doctorPassword = await bcrypt.hash('Logos1.1', 10);

    if (existingDoctor) {
      console.log('Médico já existe. Atualizando credenciais...');
      
      await prisma.user.update({
        where: { username: 'joao.viana' },
        data: {
          password: doctorPassword,
          email: 'joao.viana@clinica.com',
          name: 'Dr. João Viana',
          role: 'DOCTOR'
        }
      });
    } else {
      console.log('Criando novo usuário médico...');
      
      await prisma.user.create({
        data: {
          username: 'joao.viana',
          email: 'joao.viana@clinica.com',
          password: doctorPassword,
          name: 'Dr. João Viana',
          role: 'DOCTOR'
        }
      });
    }

    // Configurar usuário secretária
    console.log('Configurando usuário secretária...');
    
    const existingSecretary = await prisma.user.findUnique({
      where: { username: 'zeta.secretaria' }
    });

    const secretaryPassword = await bcrypt.hash('zeta123', 10);

    if (existingSecretary) {
      console.log('Secretária já existe. Atualizando credenciais...');
      
      await prisma.user.update({
        where: { username: 'zeta.secretaria' },
        data: {
          password: secretaryPassword,
          email: 'zeta.secretaria@clinica.com',
          name: 'Secretária Zeta',
          role: 'SECRETARY'
        }
      });
    } else {
      console.log('Criando novo usuário secretária...');
      
      await prisma.user.create({
        data: {
          username: 'zeta.secretaria',
          email: 'zeta.secretaria@clinica.com',
          password: secretaryPassword,
          name: 'Secretária Zeta',
          role: 'SECRETARY'
        }
      });
    }
    
    console.log('\n✅ Credenciais configuradas com sucesso:');
    console.log('MÉDICO:');
    console.log('  Username: joao.viana');
    console.log('  Senha: Logos1.1');
    console.log('\nSECRETÁRIA:');
    console.log('  Username: zeta.secretaria');
    console.log('  Senha: zeta123');
    
  } catch (error) {
    console.error('Erro ao criar/atualizar usuários:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();