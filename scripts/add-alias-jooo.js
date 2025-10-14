const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔧 Upsert alias de usuário: joao.viana')
    const hashed = await bcrypt.hash('Logos1.1', 10)

    const user = await prisma.user.upsert({
      where: { username: 'joao.viana' },
      update: {
        email: 'joaovitorvianacoloprocto@gmail.com',
        name: 'Dr. João Vítor Viana',
        role: 'DOCTOR',
        isActive: true,
        password: hashed,
      },
      create: {
        id: 'joao-viana',
        username: 'joao.viana',
        email: 'joaovitorvianacoloprocto@gmail.com',
        name: 'Dr. João Vítor Viana',
        role: 'DOCTOR',
        isActive: true,
        password: hashed,
      },
    })

    console.log('✅ Alias criado/atualizado:', user.username)
  } catch (e) {
    console.error('❌ Erro ao criar alias joao.viana:', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()