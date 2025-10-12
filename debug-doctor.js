console.log('🔍 Verificando médico padrão...')

try {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  
  async function checkDoctor() {
    console.log('👨‍⚕️ Buscando médicos...')
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' }
    })
    console.log('Total de médicos:', doctors.length)
    
    doctors.forEach((doctor, index) => {
      console.log(`Médico ${index + 1}:`, {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role
      })
    })
    
    // Verificar se o médico padrão existe (Dr. João Vitor Viana)
    const defaultDoctor = await prisma.user.findUnique({
      where: { id: 'cmgl48lmp0000vddgzfjbwjoy' }
    })
    
    if (defaultDoctor) {
      console.log('✅ Médico padrão encontrado:', defaultDoctor)
    } else {
      console.log('❌ Médico padrão NÃO encontrado!')
      
      // Criar médico padrão se não existir
      console.log('🔧 Criando médico padrão...')
      const newDoctor = await prisma.user.create({
        data: {
          id: 'cmgl48lmp0000vddgzfjbwjoy',
          name: 'Dr. João Vitor Viana',
          email: 'joao@clinica.com',
          password: '$2b$10$defaulthashedpassword',
          role: 'DOCTOR',
          isActive: true
        }
      })
      console.log('✅ Médico padrão criado:', newDoctor)
    }
    
    await prisma.$disconnect()
    console.log('✅ Verificação concluída!')
  }
  
  checkDoctor().catch(console.error)
} catch (error) {
  console.error('❌ Erro:', error.message)
}