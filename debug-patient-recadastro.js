const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugPatientRecadastro() {
  try {
    console.log('🔍 Verificando pacientes no banco de dados...')
    
    // Buscar todos os pacientes médicos
    const allPatients = await prisma.medicalPatient.findMany({
      include: {
        communicationContact: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    
    console.log(`📊 Total de pacientes no banco: ${allPatients.length}`)
    
    // Mostrar detalhes dos últimos 5 pacientes
    console.log('\n📋 Últimos 5 pacientes (ordenados por updatedAt):')
    allPatients.slice(0, 5).forEach((patient, index) => {
      console.log(`\n${index + 1}. Paciente:`, {
        id: patient.id,
        fullName: patient.fullName,
        cpf: patient.cpf,
        isActive: patient.isActive,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        communicationContactId: patient.communicationContactId,
        contact: {
          name: patient.communicationContact?.name,
          phone: patient.communicationContact?.phone,
          whatsapp: patient.communicationContact?.whatsapp,
          email: patient.communicationContact?.email
        }
      })
    })
    
    // Verificar pacientes inativos
    const inactivePatients = allPatients.filter(p => !p.isActive)
    console.log(`\n❌ Pacientes inativos: ${inactivePatients.length}`)
    
    if (inactivePatients.length > 0) {
      console.log('\n📋 Pacientes inativos:')
      inactivePatients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.fullName} (CPF: ${patient.cpf}) - Atualizado em: ${patient.updatedAt}`)
      })
    }
    
    // Verificar pacientes ativos
    const activePatients = allPatients.filter(p => p.isActive)
    console.log(`\n✅ Pacientes ativos: ${activePatients.length}`)
    
    if (activePatients.length > 0) {
      console.log('\n📋 Pacientes ativos:')
      activePatients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.fullName} (CPF: ${patient.cpf}) - Atualizado em: ${patient.updatedAt}`)
      })
    }
    
    // Verificar se há duplicatas por CPF
    const cpfCounts = {}
    allPatients.forEach(patient => {
      if (patient.cpf) {
        cpfCounts[patient.cpf] = (cpfCounts[patient.cpf] || 0) + 1
      }
    })
    
    const duplicateCpfs = Object.entries(cpfCounts).filter(([cpf, count]) => count > 1)
    if (duplicateCpfs.length > 0) {
      console.log('\n⚠️ CPFs duplicados encontrados:')
      duplicateCpfs.forEach(([cpf, count]) => {
        console.log(`CPF ${cpf}: ${count} registros`)
        const duplicates = allPatients.filter(p => p.cpf === cpf)
        duplicates.forEach(dup => {
          console.log(`  - ID: ${dup.id}, Nome: ${dup.fullName}, Ativo: ${dup.isActive}, Atualizado: ${dup.updatedAt}`)
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao debugar pacientes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugPatientRecadastro()