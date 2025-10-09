// Script para criar/atualizar usuário da secretária com credenciais específicas
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSecretaryUser() {
  try {
    console.log('🔐 Criando/atualizando usuário da Secretária...\n')

    // Credenciais especificadas
    const username = 'zeta.secretaria'
    const password = 'zeta123'
    const email = 'zeta.secretaria@clinica.com'
    const name = 'Zeta Secretária'
    const role = 'SECRETARY'

    // Hash da senha
    console.log('🔒 Gerando hash da senha...')
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('✅ Hash gerado\n')

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    })

    if (existingUser) {
      console.log('⚠️  Usuário já existe. Atualizando...')

      // Atualizar usuário existente
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          username: username,
          email: email,
          password: hashedPassword,
          name: name,
          role: role,
          isActive: true,
          loginAttempts: 0,
          lockedUntil: null,
          twoFactorEnabled: false
        }
      })

      console.log('✅ Usuário atualizado com sucesso!\n')
      console.log('📋 Detalhes:')
      console.table({
        'ID': updatedUser.id,
        'Username': updatedUser.username,
        'Email': updatedUser.email,
        'Nome': updatedUser.name,
        'Role': updatedUser.role,
        'Ativo': updatedUser.isActive ? 'Sim' : 'Não',
        '2FA': updatedUser.twoFactorEnabled ? 'Sim' : 'Não'
      })
    } else {
      console.log('➕ Criando novo usuário...')

      // Criar novo usuário
      const newUser = await prisma.user.create({
        data: {
          username: username,
          email: email,
          password: hashedPassword,
          name: name,
          role: role,
          isActive: true,
          loginAttempts: 0,
          twoFactorEnabled: false
        }
      })

      console.log('✅ Usuário criado com sucesso!\n')
      console.log('📋 Detalhes:')
      console.table({
        'ID': newUser.id,
        'Username': newUser.username,
        'Email': newUser.email,
        'Nome': newUser.name,
        'Role': newUser.role,
        'Ativo': newUser.isActive ? 'Sim' : 'Não',
        '2FA': newUser.twoFactorEnabled ? 'Sim' : 'Não'
      })
    }

    console.log('\n🔑 Credenciais de acesso:')
    console.log('─'.repeat(50))
    console.log(`Username: ${username}`)
    console.log(`Senha: ${password}`)
    console.log('─'.repeat(50))

    console.log('\n📍 Use estas credenciais para acessar:')
    console.log('   - /area-secretaria')
    console.log('   - /login-secretaria')

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createSecretaryUser()
  .then(() => {
    console.log('\n✅ Processo concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })
