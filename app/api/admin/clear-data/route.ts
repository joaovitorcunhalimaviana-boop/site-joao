import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Verificar se é ambiente de produção
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { error: 'Este endpoint só funciona em produção' },
        { status: 403 }
      )
    }

    // Verificar token de autorização simples
    const authHeader = request.headers.get('authorization')
    if (authHeader !== 'Bearer clear-all-data-2024') {
      return NextResponse.json(
        { error: 'Token de autorização inválido' },
        { status: 401 }
      )
    }

    console.log('🧹 Iniciando limpeza dos dados de produção...')
    
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
    console.log('📊 Verificando contagens finais...')
    const finalCounts = {
      patients: await prisma.medicalPatient.count(),
      appointments: await prisma.appointment.count(),
      records: await prisma.medicalRecord.count(),
      contacts: await prisma.communicationContact.count(),
      newsletter: await prisma.newsletterSubscription.count(),
      users: await prisma.user.count()
    }
    
    const result = {
      success: true,
      message: 'Limpeza concluída com sucesso',
      deleted: {
        patients: deletedPatients.count,
        appointments: deletedAppointments.count,
        records: deletedRecords.count,
        contacts: deletedContacts.count,
        newsletter: deletedNewsletter.count
      },
      finalCounts,
      isClean: finalCounts.patients === 0 && finalCounts.appointments === 0 && finalCounts.records === 0
    }
    
    console.log('✅ LIMPEZA CONCLUÍDA COM SUCESSO!')
    console.log('🎉 O banco de dados está limpo e pronto para uso em produção')
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Método GET para verificar status
export async function GET() {
  try {
    const counts = {
      patients: await prisma.medicalPatient.count(),
      appointments: await prisma.appointment.count(),
      records: await prisma.medicalRecord.count(),
      contacts: await prisma.communicationContact.count(),
      newsletter: await prisma.newsletterSubscription.count(),
      users: await prisma.user.count()
    }
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      counts,
      isEmpty: counts.patients === 0 && counts.appointments === 0 && counts.records === 0
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar dados' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}