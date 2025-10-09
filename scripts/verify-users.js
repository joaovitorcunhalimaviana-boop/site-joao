// Script para verificar usuários cadastrados no sistema
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyUsers() {
  try {
    console.log('🔍 Verificando usuários cadastrados no sistema...\n')
    console.log('='.repeat(70))

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        createdAt: true
      },
      orderBy: {
        role: 'asc'
      }
    })

    if (users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado!')
      return
    }

    console.log(`✅ Total de usuários: ${users.length}\n`)

    // Agrupar por role
    const usersByRole = {
      DOCTOR: users.filter(u => u.role === 'DOCTOR'),
      SECRETARY: users.filter(u => u.role === 'SECRETARY'),
      ADMIN: users.filter(u => u.role === 'ADMIN')
    }

    // Exibir médicos
    if (usersByRole.DOCTOR.length > 0) {
      console.log('👨‍⚕️  MÉDICOS:')
      console.log('-'.repeat(70))
      usersByRole.DOCTOR.forEach(user => {
        console.log(`   Username: ${user.username}`)
        console.log(`   Email:    ${user.email}`)
        console.log(`   Nome:     ${user.name}`)
        console.log(`   Status:   ${user.isActive ? '✅ Ativo' : '❌ Inativo'}`)
        console.log(`   2FA:      ${user.twoFactorEnabled ? '✅ Habilitado' : '❌ Desabilitado'}`)
        console.log(`   Acesso:   /area-medica via /login-medico`)
        console.log('')
      })
    }

    // Exibir secretárias
    if (usersByRole.SECRETARY.length > 0) {
      console.log('👩‍💼 SECRETÁRIAS:')
      console.log('-'.repeat(70))
      usersByRole.SECRETARY.forEach(user => {
        console.log(`   Username: ${user.username}`)
        console.log(`   Email:    ${user.email}`)
        console.log(`   Nome:     ${user.name}`)
        console.log(`   Status:   ${user.isActive ? '✅ Ativo' : '❌ Inativo'}`)
        console.log(`   2FA:      ${user.twoFactorEnabled ? '✅ Habilitado' : '❌ Desabilitado'}`)
        console.log(`   Acesso:   /area-secretaria via /login-secretaria`)
        console.log('')
      })
    }

    // Exibir admins
    if (usersByRole.ADMIN.length > 0) {
      console.log('🔐 ADMINISTRADORES:')
      console.log('-'.repeat(70))
      usersByRole.ADMIN.forEach(user => {
        console.log(`   Username: ${user.username}`)
        console.log(`   Email:    ${user.email}`)
        console.log(`   Nome:     ${user.name}`)
        console.log(`   Status:   ${user.isActive ? '✅ Ativo' : '❌ Inativo'}`)
        console.log(`   2FA:      ${user.twoFactorEnabled ? '✅ Habilitado' : '❌ Desabilitado'}`)
        console.log(`   Acesso:   Todas as áreas`)
        console.log('')
      })
    }

    console.log('='.repeat(70))
    console.log('\n📋 CREDENCIAIS PRINCIPAIS:')
    console.log('-'.repeat(70))
    console.log('Área Médica:')
    console.log('  Username: joao.viana')
    console.log('  Senha: Logos1.1')
    console.log('  URL: /login-medico')
    console.log('')
    console.log('Área Secretária:')
    console.log('  Username: zeta.secretaria')
    console.log('  Senha: zeta123')
    console.log('  URL: /login-secretaria')
    console.log('='.repeat(70))

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verifyUsers()
  .then(() => {
    console.log('\n✅ Verificação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })
