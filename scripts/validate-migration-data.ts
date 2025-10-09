/**
 * ============================================================================
 * DATA VALIDATION SCRIPT FOR DATABASE MIGRATION
 * ============================================================================
 *
 * This script performs comprehensive data validation before and after migration:
 * - Counts records in all tables
 * - Validates data integrity
 * - Checks for orphaned records
 * - Verifies foreign key constraints
 * - Generates detailed validation report
 *
 * Usage: npx tsx scripts/validate-migration-data.ts [--before|--after]
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ValidationReport {
  timestamp: string
  phase: 'before' | 'after'
  recordCounts: Record<string, number>
  dataIntegrity: {
    passed: boolean
    issues: string[]
  }
  orphanedRecords: {
    found: boolean
    details: Array<{ table: string; count: number; description: string }>
  }
  foreignKeyConstraints: {
    passed: boolean
    violations: Array<{ constraint: string; count: number }>
  }
  dataQuality: {
    duplicates: Array<{ table: string; field: string; count: number }>
    missingRequired: Array<{ table: string; field: string; count: number }>
    invalidData: Array<{ table: string; field: string; count: number; examples: string[] }>
  }
  performance: {
    executionTimeMs: number
    largestTables: Array<{ table: string; count: number }>
  }
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(70))
  log(title, 'bright')
  console.log('='.repeat(70) + '\n')
}

async function countRecords(): Promise<Record<string, number>> {
  log('📊 Counting records in all tables...', 'blue')

  const counts: Record<string, number> = {}

  try {
    // Core tables
    counts.users = await prisma.user.count()
    counts.communicationContacts = await prisma.communicationContact.count()
    counts.medicalPatients = await prisma.medicalPatient.count()
    counts.appointments = await prisma.appointment.count()
    counts.consultations = await prisma.consultation.count()
    counts.medicalRecords = await prisma.medicalRecord.count()
    counts.prescriptions = await prisma.prescription.count()
    counts.calculatorResults = await prisma.calculatorResult.count()

    // Supporting tables
    counts.reviews = await prisma.review.count().catch(() => 0) // May not exist before migration
    counts.registrationSources = await prisma.$queryRaw`SELECT COUNT(*) FROM registration_sources`.then((r: any) => Number(r[0]?.count || 0)).catch(() => 0)
    counts.scheduleBlocks = await prisma.scheduleBlock.count()
    counts.scheduleSlots = await prisma.scheduleSlot.count()
    counts.auditLogs = await prisma.auditLog.count()
    counts.backupLogs = await prisma.backupLog.count()
    counts.duplicateDetections = await prisma.duplicateDetection.count()
    counts.medicalAttachments = await prisma.medicalAttachment.count()
    counts.newsletterSubscribers = await prisma.newsletterSubscriber.count().catch(() => 0)
    counts.newsletterData = await prisma.newsletterData.count()
    counts.systemConfig = await prisma.systemConfig.count()
    counts.refreshTokens = await prisma.refreshToken.count()
    counts.twoFactorSetups = await prisma.twoFactorSetup.count()

    log('✅ Record counts completed', 'green')
    return counts
  } catch (error) {
    log(`❌ Error counting records: ${error}`, 'red')
    throw error
  }
}

async function validateDataIntegrity(): Promise<{ passed: boolean; issues: string[] }> {
  log('🔍 Validating data integrity...', 'blue')

  const issues: string[] = []

  try {
    // Check for empty required fields in CommunicationContacts
    const contactsWithoutName = await prisma.communicationContact.count({
      where: { name: '' }
    })
    if (contactsWithoutName > 0) {
      issues.push(`${contactsWithoutName} CommunicationContacts have empty names`)
    }

    // Check for CommunicationContacts without email or whatsapp
    const contactsWithoutContact = await prisma.communicationContact.count({
      where: {
        AND: [
          { email: null },
          { whatsapp: null }
        ]
      }
    })
    if (contactsWithoutContact > 0) {
      issues.push(`${contactsWithoutContact} CommunicationContacts have neither email nor WhatsApp`)
    }

    // Check for MedicalPatients without CPF
    const patientsWithoutCPF = await prisma.medicalPatient.count({
      where: { cpf: '' }
    })
    if (patientsWithoutCPF > 0) {
      issues.push(`${patientsWithoutCPF} MedicalPatients have empty CPF`)
    }

    // Check for duplicate CPFs
    const duplicateCPFs = await prisma.$queryRaw<Array<{ cpf: string; count: number }>>`
      SELECT cpf, COUNT(*) as count
      FROM medical_patients
      WHERE cpf IS NOT NULL AND cpf != ''
      GROUP BY cpf
      HAVING COUNT(*) > 1
    `
    if (duplicateCPFs.length > 0) {
      issues.push(`${duplicateCPFs.length} duplicate CPFs found in MedicalPatients`)
    }

    // Check for duplicate medical record numbers
    const duplicateMRNs = await prisma.$queryRaw<Array<{ medicalRecordNumber: number; count: number }>>`
      SELECT "medicalRecordNumber", COUNT(*) as count
      FROM medical_patients
      GROUP BY "medicalRecordNumber"
      HAVING COUNT(*) > 1
    `
    if (duplicateMRNs.length > 0) {
      issues.push(`${duplicateMRNs.length} duplicate Medical Record Numbers found`)
    }

    // Check for appointments with invalid dates
    const appointmentsWithInvalidDates = await prisma.appointment.count({
      where: {
        date: {
          lt: new Date('2020-01-01') // Appointments before 2020 are suspicious
        }
      }
    })
    if (appointmentsWithInvalidDates > 0) {
      issues.push(`${appointmentsWithInvalidDates} appointments have dates before 2020`)
    }

    // Check for consultations without medical records
    const consultationsCount = await prisma.consultation.count()
    const medicalRecordsCount = await prisma.medicalRecord.count()
    if (consultationsCount > medicalRecordsCount + 50) { // Allow some variance
      issues.push(`${consultationsCount - medicalRecordsCount} consultations may be missing medical records`)
    }

    log(issues.length === 0 ? '✅ Data integrity check passed' : `⚠️  Found ${issues.length} integrity issues`, issues.length === 0 ? 'green' : 'yellow')
    return { passed: issues.length === 0, issues }
  } catch (error) {
    log(`❌ Error during integrity validation: ${error}`, 'red')
    throw error
  }
}

async function checkOrphanedRecords(): Promise<{ found: boolean; details: Array<{ table: string; count: number; description: string }> }> {
  log('🔍 Checking for orphaned records...', 'blue')

  const orphans: Array<{ table: string; count: number; description: string }> = []

  try {
    // Check for appointments without CommunicationContact
    const appointmentsWithoutContact = await prisma.appointment.count({
      where: {
        communicationContactId: null
      }
    })
    if (appointmentsWithoutContact > 0) {
      orphans.push({
        table: 'appointments',
        count: appointmentsWithoutContact,
        description: 'Appointments without CommunicationContact'
      })
    }

    // Check for MedicalPatients without CommunicationContact
    const patientsWithoutContact = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count
      FROM medical_patients mp
      LEFT JOIN communication_contacts cc ON mp."communicationContactId" = cc.id
      WHERE cc.id IS NULL
    `
    const patientsWithoutContactCount = Number(patientsWithoutContact[0]?.count || 0)
    if (patientsWithoutContactCount > 0) {
      orphans.push({
        table: 'medical_patients',
        count: patientsWithoutContactCount,
        description: 'MedicalPatients with invalid CommunicationContact reference'
      })
    }

    // Check for consultations without appointments (should be rare)
    const consultationsWithoutAppointment = await prisma.consultation.count({
      where: {
        appointmentId: null
      }
    })
    if (consultationsWithoutAppointment > 0) {
      orphans.push({
        table: 'consultations',
        count: consultationsWithoutAppointment,
        description: 'Consultations without linked Appointment'
      })
    }

    // Check for prescriptions without consultations
    const prescriptionsWithoutConsultation = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count
      FROM prescriptions p
      LEFT JOIN consultations c ON p."consultationId" = c.id
      WHERE c.id IS NULL
    `
    const prescriptionsWithoutConsultationCount = Number(prescriptionsWithoutConsultation[0]?.count || 0)
    if (prescriptionsWithoutConsultationCount > 0) {
      orphans.push({
        table: 'prescriptions',
        count: prescriptionsWithoutConsultationCount,
        description: 'Prescriptions with invalid Consultation reference'
      })
    }

    // Check for medical records without consultations
    const medicalRecordsWithoutConsultation = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count
      FROM medical_records mr
      LEFT JOIN consultations c ON mr."consultationId" = c.id
      WHERE c.id IS NULL
    `
    const medicalRecordsWithoutConsultationCount = Number(medicalRecordsWithoutConsultation[0]?.count || 0)
    if (medicalRecordsWithoutConsultationCount > 0) {
      orphans.push({
        table: 'medical_records',
        count: medicalRecordsWithoutConsultationCount,
        description: 'Medical Records with invalid Consultation reference'
      })
    }

    log(orphans.length === 0 ? '✅ No orphaned records found' : `⚠️  Found ${orphans.length} types of orphaned records`, orphans.length === 0 ? 'green' : 'yellow')
    return { found: orphans.length > 0, details: orphans }
  } catch (error) {
    log(`❌ Error checking orphaned records: ${error}`, 'red')
    throw error
  }
}

async function validateForeignKeyConstraints(): Promise<{ passed: boolean; violations: Array<{ constraint: string; count: number }> }> {
  log('🔍 Validating foreign key constraints...', 'blue')

  const violations: Array<{ constraint: string; count: number }> = []

  try {
    // This validation is mostly covered by Prisma's type safety and database constraints
    // But we'll check for common issues

    // Check appointments -> communicationContact
    const invalidAppointmentContacts = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count
      FROM appointments a
      LEFT JOIN communication_contacts cc ON a."communicationContactId" = cc.id
      WHERE a."communicationContactId" IS NOT NULL AND cc.id IS NULL
    `
    if (Number(invalidAppointmentContacts[0]?.count || 0) > 0) {
      violations.push({
        constraint: 'appointments.communicationContactId -> communication_contacts.id',
        count: Number(invalidAppointmentContacts[0].count)
      })
    }

    // Check appointments -> medicalPatient
    const invalidAppointmentPatients = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count
      FROM appointments a
      LEFT JOIN medical_patients mp ON a."medicalPatientId" = mp.id
      WHERE a."medicalPatientId" IS NOT NULL AND mp.id IS NULL
    `
    if (Number(invalidAppointmentPatients[0]?.count || 0) > 0) {
      violations.push({
        constraint: 'appointments.medicalPatientId -> medical_patients.id',
        count: Number(invalidAppointmentPatients[0].count)
      })
    }

    log(violations.length === 0 ? '✅ All foreign key constraints valid' : `⚠️  Found ${violations.length} constraint violations`, violations.length === 0 ? 'green' : 'yellow')
    return { passed: violations.length === 0, violations }
  } catch (error) {
    log(`❌ Error validating foreign keys: ${error}`, 'red')
    throw error
  }
}

async function analyzeDataQuality() {
  log('🔍 Analyzing data quality...', 'blue')

  const quality = {
    duplicates: [] as Array<{ table: string; field: string; count: number }>,
    missingRequired: [] as Array<{ table: string; field: string; count: number }>,
    invalidData: [] as Array<{ table: string; field: string; count: number; examples: string[] }>
  }

  try {
    // Check for duplicate emails in CommunicationContacts
    const duplicateEmails = await prisma.$queryRaw<Array<{ email: string; count: number }>>`
      SELECT email, COUNT(*) as count
      FROM communication_contacts
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email
      HAVING COUNT(*) > 1
    `
    if (duplicateEmails.length > 0) {
      quality.duplicates.push({
        table: 'communication_contacts',
        field: 'email',
        count: duplicateEmails.length
      })
    }

    // Check for duplicate WhatsApp numbers
    const duplicateWhatsApp = await prisma.$queryRaw<Array<{ whatsapp: string; count: number }>>`
      SELECT whatsapp, COUNT(*) as count
      FROM communication_contacts
      WHERE whatsapp IS NOT NULL AND whatsapp != ''
      GROUP BY whatsapp
      HAVING COUNT(*) > 1
    `
    if (duplicateWhatsApp.length > 0) {
      quality.duplicates.push({
        table: 'communication_contacts',
        field: 'whatsapp',
        count: duplicateWhatsApp.length
      })
    }

    // Check for invalid email formats
    const invalidEmails = await prisma.communicationContact.findMany({
      where: {
        AND: [
          { email: { not: null } },
          { email: { not: '' } },
          { NOT: { email: { contains: '@' } } }
        ]
      },
      select: { email: true },
      take: 5
    })
    if (invalidEmails.length > 0) {
      quality.invalidData.push({
        table: 'communication_contacts',
        field: 'email',
        count: invalidEmails.length,
        examples: invalidEmails.map(e => e.email || '')
      })
    }

    // Check for invalid CPF formats (should be 11 digits)
    const invalidCPFs = await prisma.$queryRaw<Array<{ cpf: string }>>`
      SELECT cpf
      FROM medical_patients
      WHERE cpf IS NOT NULL
        AND cpf != ''
        AND LENGTH(REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), '/', '')) != 11
      LIMIT 5
    `
    if (invalidCPFs.length > 0) {
      quality.invalidData.push({
        table: 'medical_patients',
        field: 'cpf',
        count: invalidCPFs.length,
        examples: invalidCPFs.map(r => r.cpf)
      })
    }

    log('✅ Data quality analysis completed', 'green')
    return quality
  } catch (error) {
    log(`❌ Error analyzing data quality: ${error}`, 'red')
    throw error
  }
}

async function generateReport(phase: 'before' | 'after'): Promise<ValidationReport> {
  const startTime = Date.now()

  logSection(`🔍 MIGRATION DATA VALIDATION - ${phase.toUpperCase()} MIGRATION`)

  const recordCounts = await countRecords()
  const dataIntegrity = await validateDataIntegrity()
  const orphanedRecords = await checkOrphanedRecords()
  const foreignKeyConstraints = await validateForeignKeyConstraints()
  const dataQuality = await analyzeDataQuality()

  const executionTimeMs = Date.now() - startTime

  // Find largest tables
  const largestTables = Object.entries(recordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([table, count]) => ({ table, count }))

  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    phase,
    recordCounts,
    dataIntegrity,
    orphanedRecords,
    foreignKeyConstraints,
    dataQuality,
    performance: {
      executionTimeMs,
      largestTables
    }
  }

  return report
}

function printReport(report: ValidationReport) {
  logSection('📊 VALIDATION REPORT')

  console.log(`Timestamp: ${report.timestamp}`)
  console.log(`Phase: ${report.phase.toUpperCase()}`)
  console.log(`Execution Time: ${(report.performance.executionTimeMs / 1000).toFixed(2)}s\n`)

  log('Record Counts:', 'bright')
  Object.entries(report.recordCounts).forEach(([table, count]) => {
    console.log(`  ${table.padEnd(30)} ${count.toLocaleString()}`)
  })

  console.log('\n')
  log(`Data Integrity: ${report.dataIntegrity.passed ? '✅ PASSED' : '❌ FAILED'}`, report.dataIntegrity.passed ? 'green' : 'red')
  if (report.dataIntegrity.issues.length > 0) {
    report.dataIntegrity.issues.forEach(issue => {
      log(`  • ${issue}`, 'yellow')
    })
  }

  console.log('\n')
  log(`Orphaned Records: ${report.orphanedRecords.found ? '⚠️  FOUND' : '✅ NONE'}`, report.orphanedRecords.found ? 'yellow' : 'green')
  if (report.orphanedRecords.details.length > 0) {
    report.orphanedRecords.details.forEach(orphan => {
      log(`  • ${orphan.table}: ${orphan.count} - ${orphan.description}`, 'yellow')
    })
  }

  console.log('\n')
  log(`Foreign Key Constraints: ${report.foreignKeyConstraints.passed ? '✅ PASSED' : '❌ FAILED'}`, report.foreignKeyConstraints.passed ? 'green' : 'red')
  if (report.foreignKeyConstraints.violations.length > 0) {
    report.foreignKeyConstraints.violations.forEach(violation => {
      log(`  • ${violation.constraint}: ${violation.count} violations`, 'red')
    })
  }

  console.log('\n')
  log('Data Quality:', 'bright')
  if (report.dataQuality.duplicates.length > 0) {
    log('  Duplicates:', 'yellow')
    report.dataQuality.duplicates.forEach(dup => {
      log(`    • ${dup.table}.${dup.field}: ${dup.count} duplicates`, 'yellow')
    })
  }
  if (report.dataQuality.invalidData.length > 0) {
    log('  Invalid Data:', 'yellow')
    report.dataQuality.invalidData.forEach(inv => {
      log(`    • ${inv.table}.${inv.field}: ${inv.count} invalid entries`, 'yellow')
      log(`      Examples: ${inv.examples.join(', ')}`, 'yellow')
    })
  }
  if (report.dataQuality.duplicates.length === 0 && report.dataQuality.invalidData.length === 0) {
    log('  ✅ No quality issues detected', 'green')
  }

  console.log('\n')
  log('Largest Tables:', 'bright')
  report.performance.largestTables.forEach(table => {
    console.log(`  ${table.table.padEnd(30)} ${table.count.toLocaleString()}`)
  })
}

async function saveReport(report: ValidationReport) {
  const reportsDir = path.join(process.cwd(), 'backups', 'staging', 'validation')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }

  const filename = `validation_${report.phase}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const filepath = path.join(reportsDir, filename)

  fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
  log(`\n💾 Report saved to: ${filepath}`, 'green')
}

async function main() {
  const args = process.argv.slice(2)
  const phase = args.includes('--after') ? 'after' : 'before'

  try {
    const report = await generateReport(phase)
    printReport(report)
    await saveReport(report)

    // Exit with error code if validation failed
    if (!report.dataIntegrity.passed || !report.foreignKeyConstraints.passed) {
      log('\n❌ Validation failed! Please review and fix issues before proceeding.', 'red')
      process.exit(1)
    }

    log('\n✅ Validation completed successfully!', 'green')
    process.exit(0)
  } catch (error) {
    log(`\n❌ Validation failed with error: ${error}`, 'red')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
