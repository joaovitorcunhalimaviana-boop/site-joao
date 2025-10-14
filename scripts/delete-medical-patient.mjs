import { PrismaClient } from '@prisma/client'

// Uso: node scripts/delete-medical-patient.mjs --name "Nome Completo" | --id <patientId>
// Este script remove agendamentos, consultas e prontuários do paciente e marca o paciente como inativo.

const prisma = new PrismaClient()

function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--name') parsed.name = args[++i]
    else if (arg === '--id') parsed.id = args[++i]
  }
  return parsed
}

async function run() {
  const { name, id } = parseArgs()

  if (!name && !id) {
    console.error('❌ Informe --name "Nome Completo" ou --id <patientId>')
    process.exit(1)
  }

  try {
    let patient
    if (id) {
      patient = await prisma.medicalPatient.findUnique({
        where: { id },
        include: { appointments: true, consultations: true, medicalRecords: true }
      })
    } else {
      patient = await prisma.medicalPatient.findFirst({
        where: { fullName: name },
        include: { appointments: true, consultations: true, medicalRecords: true }
      })
    }

    if (!patient) {
      console.error('❌ Paciente não encontrado.')
      process.exit(2)
    }

    console.log('🔎 Paciente encontrado:', {
      id: patient.id,
      name: patient.fullName,
      cpf: patient.cpf,
      appointments: patient.appointments?.length || 0,
      consultations: patient.consultations?.length || 0,
      medicalRecords: patient.medicalRecords?.length || 0,
    })

    // Deletar agendamentos
    const delApts = await prisma.appointment.deleteMany({
      where: { medicalPatientId: patient.id }
    })
    console.log(`🗑️ Agendamentos removidos: ${delApts.count}`)

    // Deletar consultas (consultation)
    const delCons = await prisma.consultation.deleteMany({
      where: { medicalPatientId: patient.id }
    })
    console.log(`🗑️ Consultas removidas: ${delCons.count}`)

    // Deletar prontuários médicos
    const delMRs = await prisma.medicalRecord.deleteMany({
      where: { medicalPatientId: patient.id }
    })
    console.log(`🗑️ Prontuários removidos: ${delMRs.count}`)

    // Soft delete do paciente (marcar como inativo)
    await prisma.medicalPatient.update({
      where: { id: patient.id },
      data: { isActive: false }
    })
    console.log('✅ Paciente marcado como inativo (soft delete).')

    console.log('🎉 Conclusão: paciente e dados relacionados removidos com sucesso.')
  } catch (error) {
    console.error('❌ Erro ao excluir paciente:', error)
    process.exit(3)
  } finally {
    await prisma.$disconnect()
  }
}

run()