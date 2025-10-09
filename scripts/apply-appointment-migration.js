// Script to apply Appointment model migration safely
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function applyMigration() {
  try {
    console.log('🔄 Starting Appointment field migration...')

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', 'rename_appointment_fields', 'migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration SQL:')
    console.log(migrationSQL)
    console.log('')

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📊 Executing ${statements.length} SQL statements...`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`\n[${i + 1}/${statements.length}] Executing:`)
      console.log(statement)

      try {
        await prisma.$executeRawUnsafe(statement)
        console.log('✅ Success')
      } catch (error) {
        // Check if error is about column already existing (idempotent migration)
        if (error.message.includes('already exists') || error.message.includes('does not exist')) {
          console.log('⚠️  Column already migrated or doesn\'t exist, skipping...')
        } else {
          throw error
        }
      }
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('🔄 Now generating Prisma client...')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
  .then(() => {
    console.log('✅ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
