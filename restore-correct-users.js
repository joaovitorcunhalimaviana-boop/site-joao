const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function restoreCorrectUsers() {
  try {
    console.log('🔧 RESTAURANDO USUÁRIOS CORRETOS')
    console.log('============================================')
    
    // Primeiro, remover todos os usuários existentes
    console.log('🗑️  Removendo usuários existentes...')
    await prisma.user.deleteMany({})
    console.log('✅ Usuários existentes removidos')
    
    // Hash das senhas
    const doctorPasswordHash = await bcrypt.hash('Logos 1.1', 12)
    const secretaryPasswordHash = await bcrypt.hash('zeta123', 12)
    
    // Criar o médico correto
    console.log('👨‍⚕️ Criando médico: joao.viana...')
    const doctor = await prisma.user.create({
      data: {
        username: 'joao.viana',
        email: 'joaovitorvianacoloprocto@gmail.com',
        password: doctorPasswordHash,
        role: 'DOCTOR',
        name: 'Dr. João Vitor Viana',
        crm: '12831',
        specialties: 'Coloproctologia',
        isActive: true
      }
    })
    console.log(`✅ Médico criado: ${doctor.username} - ${doctor.name}`)
    
    // Criar a secretária correta
    console.log('👩‍💼 Criando secretária: zeta.secretaria...')
    const secretary = await prisma.user.create({
      data: {
        username: 'zeta.secretaria',
        email: 'secretaria@clinica.com',
        password: secretaryPasswordHash,
        role: 'SECRETARY',
        name: 'Secretária Zeta',
        isActive: true
      }
    })
    console.log(`✅ Secretária criada: ${secretary.username} - ${secretary.name}`)
    
    console.log('\n🎉 USUÁRIOS CORRETOS RESTAURADOS COM SUCESSO!')
    console.log('============================================')
    console.log('📋 CREDENCIAIS DE ACESSO:')
    console.log(`👨‍⚕️ Médico: ${doctor.username} / Logos 1.1`)
    console.log(`   Email: ${doctor.email}`)
    console.log(`   CRM: ${doctor.crm} (Paraíba)`)
    console.log(`👩‍💼 Secretária: ${secretary.username} / zeta123`)
    console.log(`   Email: ${secretary.email}`)
    
  } catch (error) {
    console.error('❌ Erro ao restaurar usuários corretos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

restoreCorrectUsers()
  .then(() => {
    console.log('\n✅ Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Falha na execução do script:', error)
    process.exit(1)
  })