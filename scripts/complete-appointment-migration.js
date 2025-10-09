// Script to complete the Appointment migration
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function completeMigration() {
  try {
    console.log('🔄 Completing Appointment field migration...\n')

    // Step 1: Rename "date" column to "appointmentDate"
    console.log('[1/3] Renaming "date" to "appointmentDate"...')
    await prisma.$executeRawUnsafe('ALTER TABLE "appointments" RENAME COLUMN "date" TO "appointmentDate"')
    console.log('✅ Column renamed\n')

    // Step 2: Convert appointmentDate from timestamp to TEXT (YYYY-MM-DD format)
    console.log('[2/3] Converting appointmentDate from timestamp to TEXT...')
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "appointments" ALTER COLUMN "appointmentDate" TYPE TEXT USING TO_CHAR("appointmentDate"::timestamp, 'YYYY-MM-DD')`
    )
    console.log('✅ Type converted\n')

    // Step 3: Add specialty column if it doesn't exist
    console.log('[3/3] Adding specialty column...')
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "specialty" TEXT')
      console.log('✅ Specialty column added\n')
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Specialty column already exists\n')
      } else {
        throw error
      }
    }

    // Verify the changes
    console.log('🔍 Verifying changes...')
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'appointments'
        AND column_name IN ('appointmentDate', 'appointmentTime', 'specialty', 'doctorName')
      ORDER BY column_name;
    `
    console.table(columns)

    console.log('\n✅ Migration completed successfully!')
    console.log('📊 Checking data integrity...')

    // Check if data was preserved
    const sampleAppointments = await prisma.$queryRaw`
      SELECT id, "appointmentDate", "appointmentTime", status
      FROM appointments
      LIMIT 3;
    `
    console.log('\n📋 Sample appointments (first 3):')
    console.table(sampleAppointments)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

completeMigration()
  .then(() => {
    console.log('\n✅ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
