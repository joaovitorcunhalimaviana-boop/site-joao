const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function updatePasswords() {
  try {
    console.log('🔐 Atualizando senhas dos usuários...')

    // Senha simples para teste
    const plainPassword = '123456'
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    console.log('Senha em texto:', plainPassword)
    console.log('Senha hasheada:', hashedPassword)

    // Atualizar médico
    const doctor = await prisma.user.update({
      where: { email: 'joao.viana@clinica.com' },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
        lockedUntil: null,
      },
    })

    console.log('✅ Senha do médico atualizada:', doctor.email)

    // Atualizar secretária
    const secretary = await prisma.user.update({
      where: { email: 'secretaria@clinica.com' },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
        lockedUntil: null,
      },
    })

    console.log('✅ Senha da secretária atualizada:', secretary.email)

    // Testar verificação
    const testVerification = await bcrypt.compare(plainPassword, hashedPassword)
    console.log(
      '🧪 Teste de verificação:',
      testVerification ? '✅ OK' : '❌ FALHOU'
    )

    console.log('\n🎉 Senhas atualizadas com sucesso!')
    console.log('📋 Use as seguintes credenciais:')
    console.log('   Email: joao.viana@clinica.com')
    console.log('   Senha: 123456')
  } catch (error) {
    console.error('❌ Erro ao atualizar senhas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePasswords()
