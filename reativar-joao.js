const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function reativarJoao() {
  try {
    console.log('🔄 Reativando paciente João Vítor da Cunha Lima Viana...')
    
    // Buscar o paciente pelo CPF
    const paciente = await prisma.medicalPatient.findFirst({
      where: {
        cpf: '05166083474'
      }
    })
    
    if (!paciente) {
      console.log('❌ Paciente não encontrado!')
      return
    }
    
    console.log('📋 Paciente encontrado:')
    console.log(`- ID: ${paciente.id}`)
    console.log(`- Nome: ${paciente.fullName}`)
    console.log(`- CPF: ${paciente.cpf}`)
    console.log(`- Ativo: ${paciente.isActive}`)
    
    // Reativar o paciente
    const pacienteAtualizado = await prisma.medicalPatient.update({
      where: {
        id: paciente.id
      },
      data: {
        isActive: true,
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Paciente reativado com sucesso!')
    console.log(`- Ativo: ${pacienteAtualizado.isActive}`)
    console.log(`- Atualizado em: ${pacienteAtualizado.updatedAt}`)
    
  } catch (error) {
    console.error('❌ Erro ao reativar paciente:', error)
  } finally {
    await prisma.$disconnect()
  }
}

reativarJoao()