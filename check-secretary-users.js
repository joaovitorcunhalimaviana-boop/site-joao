const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSecretaryUsers() {
  try {
    console.log('🔍 Verificando usuários da secretária...');
    
    const secretaryUsers = await prisma.user.findMany({
      where: {
        role: 'SECRETARY'
      }
    });
    
    console.log('📋 Usuários encontrados:', secretaryUsers.length);
    
    secretaryUsers.forEach(user => {
      console.log('👤 Usuário:', {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    });
    
    if (secretaryUsers.length === 0) {
      console.log('⚠️ Nenhum usuário da secretária encontrado!');
      console.log('💡 Criando usuário padrão da secretária...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('zeta123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          username: 'zeta.secretaria',
          email: 'secretaria@clinica.com',
          password: hashedPassword,
          name: 'Secretária Zeta',
          role: 'SECRETARY',
          isActive: true
        }
      });
      
      console.log('✅ Usuário da secretária criado:', {
        username: newUser.username,
        email: newUser.email,
        name: newUser.name
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkSecretaryUsers();