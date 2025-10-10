import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Remove all patient data from database (complete cleanup)
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Iniciando limpeza completa de dados de pacientes...')

    // Desabilitar verificações de chave estrangeira temporariamente
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF`

    console.log('📋 Limpando dados em ordem de dependência...')

    // 1. Limpar prescrições
    const prescriptions = await prisma.prescription.deleteMany({})
    console.log(`✅ Removidas ${prescriptions.count} prescrições`)

    // 2. Limpar anexos médicos
    const attachments = await prisma.medicalAttachment.deleteMany({})
    console.log(`✅ Removidos ${attachments.count} anexos médicos`)

    // 3. Limpar resultados de calculadoras
    const calculatorResults = await prisma.calculatorResult.deleteMany({})
    console.log(
      `✅ Removidos ${calculatorResults.count} resultados de calculadoras`
    )

    // 4. Limpar prontuários médicos
    const medicalRecords = await prisma.medicalRecord.deleteMany({})
    console.log(`✅ Removidos ${medicalRecords.count} prontuários médicos`)

    // 5. Limpar consultas
    const consultations = await prisma.consultation.deleteMany({})
    console.log(`✅ Removidas ${consultations.count} consultas`)

    // 6. Limpar agendamentos
    const appointments = await prisma.appointment.deleteMany({})
    console.log(`✅ Removidos ${appointments.count} agendamentos`)

    // 7. Limpar pacientes médicos
    const medicalPatients = await prisma.medicalPatient.deleteMany({})
    console.log(`✅ Removidos ${medicalPatients.count} pacientes médicos`)

    // 8. Limpar contatos de comunicação
    const communicationContacts = await prisma.communicationContact.deleteMany(
      {}
    )
    console.log(
      `✅ Removidos ${communicationContacts.count} contatos de comunicação`
    )

    // 9. Limpar pacientes antigos (deprecated) - Patient model no longer exists
    // const patients = await prisma.patient.deleteMany({})
    // console.log(`✅ Removidos ${patients.count} pacientes (sistema antigo)`)

    // 10. Limpar assinantes da newsletter (modelo removido - dados agora em CommunicationContact)
    // const newsletterSubscribers = await prisma.newsletterSubscriber.deleteMany({})
    // console.log(`✅ Removidos ${newsletterSubscribers.count} assinantes da newsletter`)
    const newsletterSubscribers = { count: 0 }

    // 11. Limpar avaliações
    const reviews = await prisma.review.deleteMany({})
    console.log(`✅ Removidas ${reviews.count} avaliações`)

    // 12. Limpar detecções de duplicatas
    const duplicateDetections = await prisma.duplicateDetection.deleteMany({})
    console.log(
      `✅ Removidas ${duplicateDetections.count} detecções de duplicatas`
    )

    // Reabilitar verificações de chave estrangeira
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`

    const total =
      prescriptions.count +
      attachments.count +
      calculatorResults.count +
      medicalRecords.count +
      consultations.count +
      appointments.count +
      medicalPatients.count +
      communicationContacts.count +
      newsletterSubscribers.count +
      reviews.count +
      duplicateDetections.count

    const summary = {
      success: true,
      message: '🎉 Limpeza completa finalizada com sucesso!',
      details: {
        prescriptions: prescriptions.count,
        attachments: attachments.count,
        calculatorResults: calculatorResults.count,
        medicalRecords: medicalRecords.count,
        consultations: consultations.count,
        appointments: appointments.count,
        medicalPatients: medicalPatients.count,
        communicationContacts: communicationContacts.count,
        newsletterSubscribers: newsletterSubscribers.count,
        reviews: reviews.count,
        duplicateDetections: duplicateDetections.count,
        total: total,
      },
    }

    console.log('📊 Resumo da limpeza:', summary)

    return NextResponse.json(summary, { status: 200 })
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro durante a limpeza de dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Remove all patients from database (legacy method - DEPRECATED)
export async function DELETE(request: NextRequest) {
  try {
    console.log('Método DELETE descontinuado - use POST para limpeza completa')

    // O modelo Patient não existe mais, use MedicalPatient
    const medicalPatients = await prisma.medicalPatient.findMany({
      select: { id: true, fullName: true },
    })

    console.log(`Encontrados ${medicalPatients.length} pacientes médicos para deletar`)

    if (medicalPatients.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum paciente encontrado para deletar',
        deletedCount: 0,
      })
    }

    // Delete all medical patients
    const deleteResult = await prisma.medicalPatient.deleteMany({})

    console.log(`${deleteResult.count} pacientes médicos deletados com sucesso`)

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} pacientes médicos deletados com sucesso`,
      deletedCount: deleteResult.count,
      deletedPatients: medicalPatients.map(p => ({ id: p.id, name: p.fullName })),
    })
  } catch (error) {
    console.error('Erro ao deletar pacientes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor ao deletar pacientes',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET - List all patients
export async function GET(request: NextRequest) {
  try {
    // O modelo Patient não existe mais, use MedicalPatient
    const medicalPatients = await prisma.medicalPatient.findMany({
      select: {
        id: true,
        fullName: true,
        cpf: true,
        communicationContact: {
          select: {
            email: true,
            whatsapp: true,
          },
        },
      },
    })

    console.log(`${medicalPatients.length} pacientes médicos encontrados`)

    const patients = medicalPatients.map(p => ({
      id: p.id,
      name: p.fullName,
      cpf: p.cpf,
      email: p.communicationContact?.email,
      phone: p.communicationContact?.whatsapp,
    }))

    return NextResponse.json({
      success: true,
      message: `${patients.length} pacientes encontrados`,
      count: patients.length,
      patients: patients,
    })
  } catch (error) {
    console.error('Erro ao listar pacientes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor ao listar pacientes',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
