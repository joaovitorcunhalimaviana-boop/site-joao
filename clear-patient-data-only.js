const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

console.log('🧹 LIMPANDO APENAS DADOS DOS PACIENTES')
console.log('=' .repeat(60))
console.log('⚠️  MANTENDO USUÁRIOS EXISTENTES INTACTOS')
console.log('=' .repeat(60))

async function clearPatientDataOnly() {
  try {
    console.log('\n1. 🔍 VERIFICANDO USUÁRIOS EXISTENTES')
    console.log('-'.repeat(40))
    
    const users = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })
    
    console.log(`✅ ${users.length} usuários encontrados (serão mantidos):`)
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.name}`)
    })
    
    console.log('\n2. 🗑️  REMOVENDO APENAS DADOS DOS PACIENTES')
    console.log('-'.repeat(40))
    
    // Ordem de exclusão respeitando as dependências (foreign keys)
    
    // 1. Remover anexos médicos
    console.log('📎 Removendo anexos médicos...')
    const attachmentsCount = await prisma.medicalAttachment.count()
    if (attachmentsCount > 0) {
      await prisma.medicalAttachment.deleteMany({})
      console.log(`✅ ${attachmentsCount} anexos médicos removidos`)
    } else {
      console.log('ℹ️  Nenhum anexo médico encontrado')
    }
    
    // 2. Remover prescrições
    console.log('💊 Removendo prescrições...')
    const prescriptionsCount = await prisma.prescription.count()
    if (prescriptionsCount > 0) {
      await prisma.prescription.deleteMany({})
      console.log(`✅ ${prescriptionsCount} prescrições removidas`)
    } else {
      console.log('ℹ️  Nenhuma prescrição encontrada')
    }
    
    // 3. Remover consultas
    console.log('🩺 Removendo consultas...')
    const consultationsCount = await prisma.consultation.count()
    if (consultationsCount > 0) {
      await prisma.consultation.deleteMany({})
      console.log(`✅ ${consultationsCount} consultas removidas`)
    } else {
      console.log('ℹ️  Nenhuma consulta encontrada')
    }
    
    // 4. Remover prontuários médicos
    console.log('📋 Removendo prontuários médicos...')
    const medicalRecordsCount = await prisma.medicalRecord.count()
    if (medicalRecordsCount > 0) {
      await prisma.medicalRecord.deleteMany({})
      console.log(`✅ ${medicalRecordsCount} prontuários médicos removidos`)
    } else {
      console.log('ℹ️  Nenhum prontuário médico encontrado')
    }
    
    // 5. Remover agendamentos
    console.log('📆 Removendo agendamentos...')
    const appointmentsCount = await prisma.appointment.count()
    if (appointmentsCount > 0) {
      await prisma.appointment.deleteMany({})
      console.log(`✅ ${appointmentsCount} agendamentos removidos`)
    } else {
      console.log('ℹ️  Nenhum agendamento encontrado')
    }
    
    // 6. Remover pacientes médicos
    console.log('👥 Removendo pacientes médicos...')
    const medicalPatientsCount = await prisma.medicalPatient.count()
    if (medicalPatientsCount > 0) {
      await prisma.medicalPatient.deleteMany({})
      console.log(`✅ ${medicalPatientsCount} pacientes médicos removidos`)
    } else {
      console.log('ℹ️  Nenhum paciente médico encontrado')
    }
    
    // 10. Remover slots de agendamento
    console.log('🕐 Removendo slots de agendamento...')
    const scheduleSlotsCount = await prisma.scheduleSlot.count()
    if (scheduleSlotsCount > 0) {
      await prisma.scheduleSlot.deleteMany({})
      console.log(`✅ ${scheduleSlotsCount} slots de agendamento removidos`)
    } else {
      console.log('ℹ️  Nenhum slot de agendamento encontrado')
    }
    
    // 11. Remover avaliações
    console.log('⭐ Removendo avaliações...')
    const reviewsCount = await prisma.review.count()
    if (reviewsCount > 0) {
      await prisma.review.deleteMany({})
      console.log(`✅ ${reviewsCount} avaliações removidas`)
    } else {
      console.log('ℹ️  Nenhuma avaliação encontrada')
    }
    
    // 12. Remover contatos de comunicação (se não estiverem vinculados a usuários)
    console.log('📞 Removendo contatos de comunicação...')
    const communicationContactsCount = await prisma.communicationContact.count()
    if (communicationContactsCount > 0) {
      await prisma.communicationContact.deleteMany({})
      console.log(`✅ ${communicationContactsCount} contatos de comunicação removidos`)
    } else {
      console.log('ℹ️  Nenhum contato de comunicação encontrado')
    }
    
    console.log('\n3. 🗂️  LIMPANDO ARQUIVOS DE ANEXOS')
    console.log('-'.repeat(40))
    
    // Limpar diretório de anexos médicos
    const attachmentsDir = path.join(process.cwd(), 'data', 'medical-attachments')
    if (fs.existsSync(attachmentsDir)) {
      const files = fs.readdirSync(attachmentsDir)
      let removedFiles = 0
      
      for (const file of files) {
        const filePath = path.join(attachmentsDir, file)
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
          removedFiles++
        }
      }
      
      if (removedFiles > 0) {
        console.log(`✅ ${removedFiles} arquivos de anexos removidos`)
      } else {
        console.log('ℹ️  Nenhum arquivo de anexo encontrado')
      }
    } else {
      console.log('ℹ️  Diretório de anexos não existe')
    }
    
    console.log('\n4. ✅ VERIFICANDO LIMPEZA')
    console.log('-'.repeat(40))
    
    // Verificar se dados dos pacientes foram removidos
    const remainingPatientData = {
      patients: await prisma.patient.count(),
      medicalPatients: await prisma.medicalPatient.count(),
      appointments: await prisma.appointment.count(),
      unifiedAppointments: await prisma.unifiedAppointment.count(),
      consultations: await prisma.consultation.count(),
      medicalRecords: await prisma.medicalRecord.count(),
      prescriptions: await prisma.prescription.count(),
      medicalAttachments: await prisma.medicalAttachment.count(),
      surgeries: await prisma.surgery.count(),
      scheduleSlots: await prisma.scheduleSlot.count(),
      reviews: await prisma.review.count(),
      communicationContacts: await prisma.communicationContact.count()
    }
    
    const totalRemainingPatientData = Object.values(remainingPatientData).reduce((sum, count) => sum + count, 0)
    
    // Verificar se usuários foram mantidos
    const remainingUsers = await prisma.user.count()
    
    console.log('\n5. 📊 RESULTADO FINAL')
    console.log('-'.repeat(40))
    
    if (totalRemainingPatientData === 0) {
      console.log('🎉 DADOS DOS PACIENTES COMPLETAMENTE REMOVIDOS!')
      console.log('✅ Todos os dados de pacientes, agendamentos e prontuários foram limpos')
    } else {
      console.log('⚠️  Alguns dados de pacientes ainda permanecem:')
      Object.entries(remainingPatientData).forEach(([key, count]) => {
        if (count > 0) {
          console.log(`   - ${key}: ${count} registros`)
        }
      })
    }
    
    console.log(`\n👥 USUÁRIOS MANTIDOS: ${remainingUsers}`)
    
    const finalUsers = await prisma.user.findMany({
      select: {
        username: true,
        name: true,
        role: true,
        isActive: true
      }
    })
    
    finalUsers.forEach(user => {
      console.log(`   ✅ ${user.username} (${user.role}) - ${user.name} - ${user.isActive ? 'Ativo' : 'Inativo'}`)
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('🧹 LIMPEZA DE DADOS DOS PACIENTES CONCLUÍDA')
    console.log('='.repeat(60))
    console.log('\n📝 RESUMO:')
    console.log('✅ Dados dos pacientes removidos')
    console.log('✅ Usuários médicos e secretárias mantidos')
    console.log('✅ Sistema pronto para novos testes')
    console.log('\n🔑 CREDENCIAIS MANTIDAS:')
    console.log('   Médico: joao.viana / Logos1.1')
    console.log('   Secretária: zeta.secretaria / zeta123')
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza dos dados dos pacientes:', error)
    console.error('\n🔧 POSSÍVEIS SOLUÇÕES:')
    console.error('1. Verifique se o banco de dados está acessível')
    console.error('2. Execute: npx prisma generate')
    console.error('3. Execute: npx prisma db push')
    console.error('4. Tente novamente')
  } finally {
    await prisma.$disconnect()
  }
}

// Executar limpeza
clearPatientDataOnly().catch(console.error)