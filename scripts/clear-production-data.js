const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearProductionData() {
  try {
    console.log('🧹 Iniciando limpeza dos dados de produção...')
    
    // Verificar se estamos em produção
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Este script só deve ser executado em produção')
      console.log('⚠️ Defina NODE_ENV=production para continuar')
      return
    }

    // Confirmar antes de executar
    console.log('⚠️ ATENÇÃO: Este script irá DELETAR TODOS os dados do banco!')
    console.log('⚠️ Isso inclui:')
    console.log('   - Todos os pacientes')
    console.log('   - Todas as consultas/agendamentos')
    console.log('   - Todos os prontuários médicos')
    console.log('   - Todos os contatos de comunicação')
    console.log('   - Todos os dados de newsletter')
    console.log('')
    console.log('⚠️ USUÁRIOS NÃO SERÃO DELETADOS (mantendo logins)')
    console.log('')
    
    // Deletar dados em ordem (respeitando foreign keys)
    console.log('🗑️ Deletando prontuários médicos...')
    const deletedRecords = await prisma.medicalRecord.deleteMany({})
    console.log(`✅ ${deletedRecords.count} prontuários deletados`)
    
    console.log('🗑️ Deletando agendamentos...')
    const deletedAppointments = await prisma.appointment.deleteMany({})
    console.log(`✅ ${deletedAppointments.count} agendamentos deletados`)
    
    console.log('🗑️ Deletando pacientes médicos...')
    const deletedPatients = await prisma.medicalPatient.deleteMany({})
    console.log(`✅ ${deletedPatients.count} pacientes deletados`)
    
    console.log('🗑️ Deletando contatos de comunicação...')
    const deletedContacts = await prisma.communicationContact.deleteMany({})
    console.log(`✅ ${deletedContacts.count} contatos deletados`)
    
    console.log('🗑️ Deletando inscrições de newsletter...')
    const deletedNewsletter = await prisma.newsletterSubscription.deleteMany({})
    console.log(`✅ ${deletedNewsletter.count} inscrições de newsletter deletadas`)
    
    // Verificar contagens finais
    console.log('\n📊 Verificando contagens finais...')
    const finalCounts = {
      patients: await prisma.medicalPatient.count(),
      appointments: await prisma.appointment.count(),
      records: await prisma.medicalRecord.count(),
      contacts: await prisma.communicationContact.count(),
      newsletter: await prisma.newsletterSubscription.count(),
      users: await prisma.user.count()
    }
    
    console.log('📊 Contagens finais:')
    console.log(`   - Pacientes: ${finalCounts.patients}`)
    console.log(`   - Agendamentos: ${finalCounts.appointments}`)
    console.log(`   - Prontuários: ${finalCounts.records}`)
    console.log(`   - Contatos: ${finalCounts.contacts}`)
    console.log(`   - Newsletter: ${finalCounts.newsletter}`)
    console.log(`   - Usuários: ${finalCounts.users} (mantidos)`)
    
    if (finalCounts.patients === 0 && finalCounts.appointments === 0 && finalCounts.records === 0) {
      console.log('\n✅ LIMPEZA CONCLUÍDA COM SUCESSO!')
      console.log('🎉 O banco de dados está limpo e pronto para uso em produção')
    } else {
      console.log('\n⚠️ Alguns dados ainda permanecem no banco')
    }
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  clearProductionData()
    .then(() => {
      console.log('🏁 Script finalizado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Falha na execução:', error)
      process.exit(1)
    })
}

module.exports = { clearProductionData }