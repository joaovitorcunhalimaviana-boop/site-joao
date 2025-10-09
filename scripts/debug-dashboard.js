// Script para debugar dados do dashboard
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugDashboard() {
  try {
    console.log('🔍 DEBUG DO DASHBOARD - Verificando dados\n')
    console.log('='.repeat(70))

    // 1. Verificar CommunicationContacts
    console.log('\n📋 [1] COMMUNICATION CONTACTS:')
    const contacts = await prisma.communicationContact.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`Total: ${contacts.length}`)
    contacts.forEach((c, i) => {
      console.log(`\n${i + 1}. Contact:`)
      console.log(`   ID: ${c.id}`)
      console.log(`   Nome: ${c.name}`)
      console.log(`   Email: ${c.email || 'N/A'}`)
      console.log(`   WhatsApp: ${c.whatsapp || 'N/A'}`)
      console.log(`   Criado em: ${c.createdAt}`)
    })

    // 2. Verificar MedicalPatients
    console.log('\n\n📋 [2] MEDICAL PATIENTS:')
    const patients = await prisma.medicalPatient.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        communicationContact: true
      }
    })
    console.log(`Total: ${patients.length}`)
    patients.forEach((p, i) => {
      console.log(`\n${i + 1}. Patient:`)
      console.log(`   ID: ${p.id}`)
      console.log(`   Nome: ${p.fullName}`)
      console.log(`   CPF: ${p.cpf}`)
      console.log(`   Prontuário: ${p.medicalRecordNumber}`)
      console.log(`   Contact ID: ${p.communicationContactId}`)
      console.log(`   Contact Name: ${p.communicationContact?.name || 'N/A'}`)
      console.log(`   Insurance: ${p.insuranceType}`)
      console.log(`   Ativo: ${p.isActive}`)
      console.log(`   Criado em: ${p.createdAt}`)
    })

    // 3. Verificar Appointments
    console.log('\n\n📋 [3] APPOINTMENTS:')
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`Total: ${appointments.length}`)
    appointments.forEach((a, i) => {
      console.log(`\n${i + 1}. Appointment:`)
      console.log(`   ID: ${a.id}`)
      console.log(`   Communication Contact ID: ${a.communicationContactId || 'NULL'}`)
      console.log(`   Medical Patient ID: ${a.medicalPatientId || 'NULL'}`)
      console.log(`   Data: ${a.appointmentDate}`)
      console.log(`   Hora: ${a.appointmentTime}`)
      console.log(`   Tipo: ${a.type}`)
      console.log(`   Status: ${a.status}`)
      console.log(`   Source: ${a.source}`)
      console.log(`   Criado em: ${a.createdAt}`)
    })

    // 4. Testar query do dashboard (getAllPatients)
    console.log('\n\n📋 [4] TESTE DA QUERY getAllPatients():')
    console.log('Importando getAllPatients...')

    const { getAllPatients } = require('../lib/prisma-service')
    const unifiedPatients = await getAllPatients()

    console.log(`\nTotal retornado: ${unifiedPatients.length}`)

    if (unifiedPatients.length > 0) {
      console.log('\nPrimeiros 3 pacientes:')
      unifiedPatients.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`)
        console.log(`   ID: ${p.id}`)
        console.log(`   CPF: ${p.cpf || 'N/A'}`)
        console.log(`   Telefone: ${p.phone}`)
        console.log(`   Email: ${p.email || 'N/A'}`)
      })
    } else {
      console.log('⚠️ NENHUM PACIENTE RETORNADO pela função getAllPatients()!')
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ Debug concluído!')

  } catch (error) {
    console.error('\n❌ Erro no debug:', error)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

debugDashboard()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro fatal:', error)
    process.exit(1)
  })
