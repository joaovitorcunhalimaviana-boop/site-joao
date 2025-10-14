#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const counts = {
      medicalPatients: await prisma.medicalPatient.count(),
      appointments: await prisma.appointment.count(),
      consultations: await prisma.consultation?.count?.().catch(() => 0) || 0,
      medicalRecords: await prisma.medicalRecord.count(),
      communicationContacts: await prisma.communicationContact.count(),
      medicalAttachments: await prisma.medicalAttachment.count(),
    }

    console.log('📊 Post-cleanup counts:', counts)

    const total = Object.values(counts).reduce((sum, n) => sum + n, 0)
    if (total === 0) {
      console.log('✅ Sistema zerado: nenhum dado de paciente/agenda presente.')
      process.exit(0)
    } else {
      console.log('⚠️ Ainda há dados residuais. Verifique tabelas listadas acima.')
      process.exit(2)
    }
  } catch (err) {
    console.error('❌ Falha ao verificar limpeza:', err)
    process.exit(1)
  } finally {
    // Evitar problemas com PowerShell ao usar $disconnect em one-liners
    prisma.$disconnect().catch(() => {})
  }
}

if (require.main === module) {
  main()
}