// Script to check current appointment table columns
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkColumns() {
  try {
    console.log('🔍 Checking appointment table columns...')

    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'appointments'
      ORDER BY ordinal_position;
    `

    console.log('\n📋 Current columns in appointments table:')
    console.table(result)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkColumns()
