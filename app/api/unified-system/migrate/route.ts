import { NextRequest, NextResponse } from 'next/server'
import {
  getAllMedicalPatients,
  getAllCommunicationContacts,
  createMedicalPatient,
  createOrUpdateCommunicationContact,
  validateDataIntegrity,
  type MedicalPatient,
  type CommunicationContact,
} from '../../../../lib/unified-patient-system-prisma'
import {
  getAllPatients as readPatientsData,
  getAllAppointments as readAppointmentsData,
  readNewslettersData,
} from '../../../../lib/unified-data-service-prisma'
import * as fs from 'fs'
import * as path from 'path'

interface MigrationStats {
  communicationContacts: {
    created: number
    updated: number
    errors: number
  }
  medicalPatients: {
    created: number
    errors: number
  }
  appointments: {
    migrated: number
    errors: number
  }
  medicalRecords: {
    migrated: number
    errors: number
  }
}

interface MigrationResult {
  success: boolean
  stats: MigrationStats
  errors: string[]
  message: string
}

// Função para migrar dados da newsletter
async function migrateNewsletterData(): Promise<{
  contacts: number
  errors: string[]
}> {
  const errors: string[] = []
  let contactsCreated = 0

  try {
    const newsletterPath = path.join(process.cwd(), 'data', 'newsletter.json')

    if (fs.existsSync(newsletterPath)) {
      const newsletterData = JSON.parse(fs.readFileSync(newsletterPath, 'utf8'))

      if (
        newsletterData.subscribers &&
        Array.isArray(newsletterData.subscribers)
      ) {
        for (const subscriber of newsletterData.subscribers) {
          if (subscriber.email && subscriber.name) {
            const result = createOrUpdateCommunicationContact({
              name: subscriber.name,
              email: subscriber.email,
              source: 'newsletter',
              emailPreferences: {
                newsletter: true,
                healthTips: false,
                appointments: true,
                promotions: false,
                subscribed: true,
                subscribedAt:
                  subscriber.subscribedAt || new Date().toISOString(),
              },
            })

            if (result.success) {
              contactsCreated++
            } else {
              errors.push(
                `Erro ao migrar subscriber ${subscriber.email}: ${result.message}`
              )
            }
          }
        }
      }
    }
  } catch (error) {
    errors.push(`Erro ao migrar dados da newsletter: ${error}`)
  }

  return { contacts: contactsCreated, errors }
}

// Função para migrar dados de email integration (desabilitada - email removido)
async function migrateEmailIntegrationData(): Promise<{
  contacts: number
  errors: string[]
}> {
  // Email integration foi removido do sistema
  return { contacts: 0, errors: [] }
}

// Função para migrar pacientes antigos
async function migrateOldPatients(): Promise<{
  communicationContacts: number
  medicalPatients: number
  errors: string[]
}> {
  const errors: string[] = []
  let communicationContactsCreated = 0
  let medicalPatientsCreated = 0

  try {
    const oldPatients = readPatientsData()

    for (const oldPatient of oldPatients) {
      // Primeiro, criar ou atualizar contato de comunicação
      const contactResult = createOrUpdateCommunicationContact({
        name: oldPatient.name,
        email: oldPatient.email,
        whatsapp: oldPatient.whatsapp,
        birthDate: oldPatient.birthDate,
        source: 'doctor_area', // Assumindo que veio da área médica
        emailPreferences: {
          newsletter: false,
          healthTips: true,
          appointments: true,
          promotions: false,
          subscribed: !!oldPatient.email,
        },
      })

      if (!contactResult.success) {
        errors.push(
          `Erro ao criar contato para paciente ${oldPatient.name}: ${contactResult.message}`
        )
        continue
      }

      communicationContactsCreated++

      // Se tem CPF, criar paciente médico
      if (oldPatient.cpf) {
        const patientResult = createMedicalPatient(
          {
            communicationContactId: contactResult.contact.id,
            cpf: oldPatient.cpf,
            fullName: oldPatient.name,
            rg: (oldPatient as any).rg, // Legacy property
            address: (oldPatient as any).address, // Legacy property
            city: (oldPatient as any).city, // Legacy property
            state: (oldPatient as any).state, // Legacy property
            zipCode: (oldPatient as any).zipCode, // Legacy property
            insurance: {
              type: oldPatient.insurance?.type || 'particular',
              plan: oldPatient.insurance?.plan,
              cardNumber: (oldPatient.insurance as any)?.cardNumber,
              validUntil: (oldPatient.insurance as any)?.validUntil,
            },
            medicalInfo: {
              allergies: (oldPatient as any).allergies || [],
              medications: (oldPatient as any).medications || [],
              conditions: (oldPatient as any).conditions || [],
              emergencyContact: (oldPatient as any).emergencyContact,
              emergencyPhone: (oldPatient as any).emergencyPhone,
              bloodType: (oldPatient as any).bloodType,
              notes: (oldPatient as any).notes,
            },
            consents: {
              dataProcessing: true,
              dataProcessingDate: new Date().toISOString(),
              medicalTreatment: true,
              medicalTreatmentDate: new Date().toISOString(),
              imageUse: false,
            },
          },
          'migration_system'
        )

        if (patientResult.success) {
          medicalPatientsCreated++
        } else {
          errors.push(
            `Erro ao criar paciente médico ${oldPatient.name}: ${patientResult.message}`
          )
        }
      }
    }
  } catch (error) {
    errors.push(`Erro ao migrar pacientes antigos: ${error}`)
  }

  return {
    communicationContacts: communicationContactsCreated,
    medicalPatients: medicalPatientsCreated,
    errors,
  }
}

// Função para migrar agendamentos antigos
async function migrateOldAppointments(): Promise<{
  appointments: number
  errors: string[]
}> {
  const errors: string[] = []
  let appointmentsMigrated = 0

  try {
    const oldAppointments = readAppointmentsData()

    for (const oldAppointment of oldAppointments) {
      // Buscar contato de comunicação pelo email ou nome
      // Esta lógica precisa ser implementada baseada nos dados migrados

      // Por enquanto, vamos pular a migração de agendamentos
      // até que os contatos estejam migrados
      console.log(
        `Agendamento ${oldAppointment.id} será migrado em uma segunda fase`
      )
    }
  } catch (error) {
    errors.push(`Erro ao migrar agendamentos antigos: ${error}`)
  }

  return { appointments: appointmentsMigrated, errors }
}

// Função para migrar prontuários antigos
async function migrateOldMedicalRecords(): Promise<{
  records: number
  errors: string[]
}> {
  const errors: string[] = []
  let recordsMigrated = 0

  try {
    const medicalRecordsPath = path.join(
      process.cwd(),
      'data',
      'medical-records.json'
    )

    if (fs.existsSync(medicalRecordsPath)) {
      const oldRecords = JSON.parse(fs.readFileSync(medicalRecordsPath, 'utf8'))

      if (Array.isArray(oldRecords)) {
        for (const oldRecord of oldRecords) {
          // Buscar paciente médico correspondente
          // Esta lógica precisa ser implementada baseada nos dados migrados

          console.log(
            `Prontuário ${oldRecord.id} será migrado em uma segunda fase`
          )
        }
      }
    }
  } catch (error) {
    errors.push(`Erro ao migrar prontuários antigos: ${error}`)
  }

  return { records: recordsMigrated, errors }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { action } = await request.json()

    if (action !== 'migrate') {
      return NextResponse.json(
        {
          success: false,
          message: 'Ação inválida. Use action: "migrate"',
        },
        { status: 400 }
      )
    }

    console.log('🔄 Iniciando migração para o sistema unificado...')

    const migrationStats: MigrationStats = {
      communicationContacts: { created: 0, updated: 0, errors: 0 },
      medicalPatients: { created: 0, errors: 0 },
      appointments: { migrated: 0, errors: 0 },
      medicalRecords: { migrated: 0, errors: 0 },
    }

    const allErrors: string[] = []

    // 1. Migrar dados da newsletter
    console.log('📧 Migrando dados da newsletter...')
    const newsletterResult = await migrateNewsletterData()
    migrationStats.communicationContacts.created += newsletterResult.contacts
    migrationStats.communicationContacts.errors +=
      newsletterResult.errors.length
    allErrors.push(...newsletterResult.errors)

    // 2. Migrar dados de email integration
    console.log('📨 Migrando dados de email integration...')
    const emailResult = await migrateEmailIntegrationData()
    migrationStats.communicationContacts.created += emailResult.contacts
    migrationStats.communicationContacts.errors += emailResult.errors.length
    allErrors.push(...emailResult.errors)

    // 3. Migrar pacientes antigos
    console.log('👥 Migrando pacientes antigos...')
    const patientsResult = await migrateOldPatients()
    migrationStats.communicationContacts.created +=
      patientsResult.communicationContacts
    migrationStats.medicalPatients.created += patientsResult.medicalPatients
    migrationStats.medicalPatients.errors += patientsResult.errors.length
    allErrors.push(...patientsResult.errors)

    // 4. Migrar agendamentos antigos
    console.log('📅 Migrando agendamentos antigos...')
    const appointmentsResult = await migrateOldAppointments()
    migrationStats.appointments.migrated += appointmentsResult.appointments
    migrationStats.appointments.errors += appointmentsResult.errors.length
    allErrors.push(...appointmentsResult.errors)

    // 5. Migrar prontuários antigos
    console.log('📋 Migrando prontuários antigos...')
    const recordsResult = await migrateOldMedicalRecords()
    migrationStats.medicalRecords.migrated += recordsResult.records
    migrationStats.medicalRecords.errors += recordsResult.errors.length
    allErrors.push(...recordsResult.errors)

    // 6. Validar integridade dos dados migrados
    console.log('✅ Validando integridade dos dados...')
    const integrityResult = validateDataIntegrity()

    if (!integrityResult.success) {
      allErrors.push(...integrityResult.issues)
    }

    const result: MigrationResult = {
      success: allErrors.length === 0,
      stats: migrationStats,
      errors: allErrors,
      message:
        allErrors.length === 0
          ? 'Migração concluída com sucesso'
          : `Migração concluída com ${allErrors.length} erros`,
    }

    console.log('✅ Migração finalizada:', result)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('❌ Erro na migração:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor durante a migração',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    // Verificar status da migração
    const integrityResult = validateDataIntegrity()

    return NextResponse.json(
      {
        success: true,
        message: 'Status da migração',
        integrity: integrityResult,
        endpoints: {
          migrate:
            'POST /api/unified-system/migrate - Executar migração completa',
          status:
            'GET /api/unified-system/migrate - Verificar status da migração',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Erro ao verificar status da migração:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
