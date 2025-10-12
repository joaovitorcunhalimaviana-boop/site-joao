const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBirthDates() {
  console.log('🔍 Testando dados de nascimento...')
  
  try {
    // Testar contatos de comunicação
    const contacts = await prisma.communicationContact.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        birthDate: true,
        email: true
      }
    })
    
    console.log(`\n📋 Encontrados ${contacts.length} contatos:`)
    contacts.forEach(contact => {
      const birthDate = contact.birthDate
      const age = birthDate ? calculateAge(birthDate) : 'N/A'
      console.log(`- ${contact.name}: birthDate = "${birthDate}" | Idade: ${age}`)
    })
    
    // Testar pacientes médicos
    const patients = await prisma.medicalPatient.findMany({
      take: 5,
      include: {
        communicationContact: {
          select: {
            name: true,
            birthDate: true
          }
        }
      }
    })
    
    console.log(`\n🏥 Encontrados ${patients.length} pacientes médicos:`)
    patients.forEach(patient => {
      const birthDate = patient.communicationContact?.birthDate
      const age = birthDate ? calculateAge(birthDate) : 'N/A'
      console.log(`- ${patient.fullName}: birthDate = "${birthDate}" | Idade: ${age}`)
    })
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

function calculateAge(birthDateStr) {
  if (!birthDateStr) return null
  
  try {
    // Tentar diferentes formatos
    let birthDate
    
    if (birthDateStr.includes('/')) {
      // Formato DD/MM/YYYY
      const [day, month, year] = birthDateStr.split('/')
      birthDate = new Date(year, month - 1, day)
    } else if (birthDateStr.includes('-')) {
      // Formato YYYY-MM-DD ou DD-MM-YYYY
      if (birthDateStr.length === 10 && birthDateStr.charAt(4) === '-') {
        birthDate = new Date(birthDateStr)
      } else {
        const [day, month, year] = birthDateStr.split('-')
        birthDate = new Date(year, month - 1, day)
      }
    } else {
      birthDate = new Date(birthDateStr)
    }
    
    if (isNaN(birthDate.getTime())) {
      return 'Data inválida'
    }
    
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age >= 0 ? `${age} anos` : 'Data futura'
  } catch (error) {
    return 'Erro no cálculo'
  }
}

testBirthDates()