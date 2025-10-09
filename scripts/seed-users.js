const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function seedUsers() {
  try {
    // Ler usuários do arquivo JSON
    const usersPath = path.join(__dirname, '..', 'data', 'users.json')
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))

    console.log('🌱 Iniciando seed de usuários...')

    for (const userData of usersData) {
      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email: `${userData.username}@clinica.com` },
      })

      if (existingUser) {
        console.log(`✅ Usuário ${userData.username} já existe`)
        continue
      }

      // Criar novo usuário
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: `${userData.username}@clinica.com`,
          name:
            userData.username === 'joao.viana'
              ? 'Dr. João Viana'
              : 'Secretária',
          password: userData.password, // Já está hasheada
          role: userData.role === 'admin' ? 'DOCTOR' : 'SECRETARY',
          isActive: true,
          specialties: userData.area === 'medica' ? 'Gastroenterologia' : null,
          crm: userData.area === 'medica' ? 'CRM/SP 123456' : null,
        },
      })

      console.log(`✅ Usuário criado: ${user.email} (${user.role})`)
    }

    console.log('🎉 Seed de usuários concluído!')
  } catch (error) {
    console.error('❌ Erro no seed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers()
