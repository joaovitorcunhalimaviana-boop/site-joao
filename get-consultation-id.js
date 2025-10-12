const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getLatestConsultationId() {
  try {
    const consultation = await prisma.consultation.findFirst({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true
      }
    });
    
    if (consultation) {
      console.log('✅ Consultation ID encontrado:', consultation.id);
      console.log('📅 Criado em:', consultation.createdAt);
      return consultation.id;
    } else {
      console.log('❌ Nenhuma consulta encontrada');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar consultation ID:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

getLatestConsultationId();