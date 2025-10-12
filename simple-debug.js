console.log('🔍 Iniciando debug simples...')

try {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  
  async function test() {
    console.log('📋 Buscando contatos...')
    const contacts = await prisma.communicationContact.findMany()
    console.log('Total de contatos:', contacts.length)
    
    contacts.forEach((contact, index) => {
      console.log(`Contato ${index + 1}:`, {
        name: contact.name,
        birthDate: contact.birthDate,
        type: typeof contact.birthDate
      })
    })
    
    await prisma.$disconnect()
    console.log('✅ Debug concluído!')
  }
  
  test().catch(console.error)
} catch (error) {
  console.error('❌ Erro:', error.message)
}