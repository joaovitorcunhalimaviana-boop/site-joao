// Script para limpar usuários com formato de email e restaurar logins antigos
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function cleanupAndRestoreUsers() {
  try {
    console.log('🧹 Limpando usuários e restaurando logins antigos...\n')

    // 1. REMOVER todos os usuários existentes
    console.log('[1/3] Removendo todos os usuários existentes...')
    const deletedCount = await prisma.user.deleteMany({})
    console.log(`   ✅ ${deletedCount.count} usuários removidos\n`)

    // 2. CRIAR usuário Dr. João Viana com login antigo
    console.log('[2/3] Criando Dr. João Viana com login antigo...')
    const joaoPassword = await bcrypt.hash('Logos1.1', 12)
    const joaoUser = await prisma.user.create({
      data: {
        username: 'joao.viana',
        email: 'joao@clinica.com',  // Email simples, mas login é pelo username
        password: joaoPassword,
        name: 'Dr. João Vitor Viana',
        role: 'DOCTOR',
        isActive: true,
        loginAttempts: 0,
        twoFactorEnabled: false
      }
    })
    console.log('   ✅ Usuário criado:')
    console.log(`      Username: joao.viana`)
    console.log(`      Senha: Logos1.1`)
    console.log(`      Email: ${joaoUser.email}`)
    console.log(`      Role: ${joaoUser.role}\n`)

    // 3. CRIAR usuária Secretária com login antigo
    console.log('[3/3] Criando Secretária com login antigo...')
    const zetaPassword = await bcrypt.hash('zeta123', 12)
    const zetaUser = await prisma.user.create({
      data: {
        username: 'zeta.secretaria',
        email: 'zeta@clinica.com',  // Email simples, mas login é pelo username
        password: zetaPassword,
        name: 'Zeta Secretária',
        role: 'SECRETARY',
        isActive: true,
        loginAttempts: 0,
        twoFactorEnabled: false
      }
    })
    console.log('   ✅ Usuário criado:')
    console.log(`      Username: zeta.secretaria`)
    console.log(`      Senha: zeta123`)
    console.log(`      Email: ${zetaUser.email}`)
    console.log(`      Role: ${zetaUser.role}\n`)

    // 4. VERIFICAR usuários finais
    console.log('─'.repeat(70))
    console.log('📊 USUÁRIOS FINAIS NO SISTEMA:')
    console.log('─'.repeat(70))

    const allUsers = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    allUsers.forEach(user => {
      console.log(`\n👤 ${user.name}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Status: ${user.isActive ? '✅ Ativo' : '❌ Inativo'}`)
    })

    console.log('\n' + '='.repeat(70))
    console.log('🔑 CREDENCIAIS DE ACESSO:')
    console.log('='.repeat(70))
    console.log('\n📘 ÁREA MÉDICA:')
    console.log('   Login: joao.viana')
    console.log('   Senha: Logos1.1')
    console.log('   URL: /login-medico')
    console.log('\n📗 ÁREA SECRETÁRIA:')
    console.log('   Login: zeta.secretaria')
    console.log('   Senha: zeta123')
    console.log('   URL: /login-secretaria')
    console.log('='.repeat(70))

  } catch (error) {
    console.error('❌ Erro ao limpar usuários:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupAndRestoreUsers()
  .then(() => {
    console.log('\n✅ Limpeza e restauração concluídas!')
    console.log('🎯 Sistema pronto para uso com logins antigos')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })
