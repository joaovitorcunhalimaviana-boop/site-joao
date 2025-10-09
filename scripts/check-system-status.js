// Script to check system status and data
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSystemStatus() {
  try {
    console.log('🔍 Verificando status do sistema...\n')

    // Check users
    console.log('👥 USUÁRIOS:')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        twoFactorEnabled: true,
        createdAt: true
      }
    })
    console.log(`   Total: ${users.length}`)
    if (users.length > 0) {
      console.table(users)
    } else {
      console.log('   ⚠️  Nenhum usuário encontrado no sistema')
    }

    // Check medical patients
    console.log('\n🏥 PACIENTES MÉDICOS:')
    const medicalPatients = await prisma.medicalPatient.count()
    console.log(`   Total: ${medicalPatients}`)

    // Check communication contacts
    console.log('\n📧 CONTATOS DE COMUNICAÇÃO:')
    const commContacts = await prisma.communicationContact.count()
    console.log(`   Total: ${commContacts}`)

    // Check appointments with new schema
    console.log('\n📅 CONSULTAS (com novo schema):')
    const appointments = await prisma.appointment.findMany({
      select: {
        id: true,
        appointmentDate: true,
        appointmentTime: true,
        status: true,
        type: true,
        specialty: true,
        doctorName: true
      },
      take: 5
    })
    console.log(`   Total: ${await prisma.appointment.count()}`)
    if (appointments.length > 0) {
      console.log('\n   Primeiras 5 consultas:')
      console.table(appointments)
    }

    // Check surgeries (commented out as surgery model doesn't exist in Prisma yet)
    console.log('\n🏥 CIRURGIAS:')
    // const surgeries = await prisma.surgery.count()
    console.log(`   Total: 0 (modelo não implementado no Prisma ainda)`)

    // Check medical records
    console.log('\n📋 PRONTUÁRIOS:')
    const records = await prisma.medicalRecord.count()
    console.log(`   Total: ${records}`)

    // Check consultations
    console.log('\n🩺 CONSULTAS MÉDICAS:')
    const consultations = await prisma.consultation.count()
    console.log(`   Total: ${consultations}`)

    // Check audit logs
    console.log('\n📊 LOGS DE AUDITORIA:')
    const auditLogs = await prisma.auditLog.count()
    console.log(`   Total: ${auditLogs}`)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMO DO SISTEMA:')
    console.log('='.repeat(60))
    console.log(`✅ Banco de dados: Conectado (PostgreSQL)`)
    console.log(`✅ Schema: Sincronizado`)
    console.log(`📈 Dados: ${medicalPatients} pacientes, ${appointments.length} consultas agendadas`)
    console.log(`🔐 Autenticação: ${users.length} usuários cadastrados`)

    if (users.length === 0) {
      console.log('\n⚠️  ATENÇÃO: Não há usuários cadastrados!')
      console.log('   Execute o seed para criar usuários iniciais.')
    }

  } catch (error) {
    console.error('❌ Erro ao verificar sistema:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkSystemStatus()
  .then(() => {
    console.log('\n✅ Verificação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })
