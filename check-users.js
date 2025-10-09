const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Usuários encontrados:', users.length);
    users.forEach(user => {
      console.log('- Email:', user.email, '| Nome:', user.name, '| Função:', user.role);
    });
  } catch (error) {
    console.error('Erro ao verificar usuários:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();