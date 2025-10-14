const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function upsertUser({ id, username, email, name, role, password }) {
  const hashed = await bcrypt.hash(password, 10)
  return prisma.user.upsert({
    where: { username },
    update: {
      email,
      name,
      role,
      isActive: true,
      password: hashed,
    },
    create: {
      id,
      username,
      email,
      name,
      role,
      isActive: true,
      password: hashed,
    },
  })
}

async function main() {
  try {
    console.log('🌱 Criando/atualizando usuários de teste...')

    const zeta = await upsertUser({
      id: 'zeta-secretaria',
      username: 'zeta.secretaria',
      email: 'zeta.secretaria',
      name: 'Secretária Zeta',
      role: 'SECRETARY',
      password: 'zeta123',
    })
    console.log('✅ Zeta:', zeta.username, zeta.role)

    const joao = await upsertUser({
      id: 'joao-viana',
      username: 'joao.viana',
      email: 'joao.viana',
      name: 'Dr. João Viana',
      role: 'DOCTOR',
      password: 'Logos1.1',
    })
    console.log('✅ João:', joao.username, joao.role)

    console.log('🎉 Usuários de teste prontos.')
  } catch (e) {
    console.error('❌ Erro ao criar usuários:', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()