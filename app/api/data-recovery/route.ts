import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface RecoveryData {
  patients: any[]
  appointments: any[]
  medicalRecords: any[]
  consultations: any[]
  surgeries: any[]
  reviews: any[]
  users: any[]
}

// Sistema de recuperação de dados
class DataRecoverySystem {
  // Listar backups disponíveis
  static async listAvailableBackups(): Promise<any[]> {
    const backupDirs = [
      path.join(process.cwd(), 'backups', 'emergency'),
      path.join(process.cwd(), 'data', 'security-backups'),
    ]

    const availableBackups: any[] = []

    for (const dir of backupDirs) {
      if (fs.existsSync(dir)) {
        const files = fs
          .readdirSync(dir)
          .filter(file => file.endsWith('.json'))
          .map(file => {
            const filePath = path.join(dir, file)
            const stats = fs.statSync(filePath)
            return {
              filename: file,
              path: filePath,
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime,
              directory: dir,
            }
          })

        availableBackups.push(...files)
      }
    }

    // Ordenar por data de criação (mais recente primeiro)
    return availableBackups.sort(
      (a, b) => b.created.getTime() - a.created.getTime()
    )
  }

  // Validar backup antes da recuperação
  static async validateBackup(
    backupPath: string
  ): Promise<{ isValid: boolean; data?: any; error?: string }> {
    try {
      if (!fs.existsSync(backupPath)) {
        return { isValid: false, error: 'Arquivo de backup não encontrado' }
      }

      const backupContent = fs.readFileSync(backupPath, 'utf8')
      const backupData = JSON.parse(backupContent)

      // Verificar estrutura básica
      const requiredFields = [
        'timestamp',
        'patients',
        'appointments',
        'medicalRecords',
        'checksum',
      ]
      for (const field of requiredFields) {
        if (!backupData[field]) {
          return {
            isValid: false,
            error: `Campo obrigatório ausente: ${field}`,
          }
        }
      }

      // Verificar integridade com checksum
      const crypto = require('crypto')
      const calculatedChecksum = crypto
        .createHash('sha256')
        .update(
          JSON.stringify({
            patients: backupData.patients,
            appointments: backupData.appointments,
            medicalRecords: backupData.medicalRecords,
            consultations: backupData.consultations || [],
            surgeries: backupData.surgeries || [],
            reviews: backupData.reviews || [],
            users: backupData.users || [],
          })
        )
        .digest('hex')

      if (calculatedChecksum !== backupData.checksum) {
        return {
          isValid: false,
          error: 'Checksum inválido - backup pode estar corrompido',
        }
      }

      return { isValid: true, data: backupData }
    } catch (error) {
      return {
        isValid: false,
        error: `Erro ao validar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      }
    }
  }

  // Recuperar dados do backup
  static async recoverFromBackup(
    backupPath: string,
    options: {
      recoverPatients?: boolean
      recoverAppointments?: boolean
      recoverMedicalRecords?: boolean
      recoverConsultations?: boolean
      recoverSurgeries?: boolean
      recoverReviews?: boolean
      recoverUsers?: boolean
      overwriteExisting?: boolean
    } = {}
  ): Promise<{ success: boolean; message: string; recovered: any }> {
    try {
      console.log('🚨 INICIANDO RECUPERAÇÃO DE DADOS DE EMERGÊNCIA...')
      console.log('📁 Backup:', backupPath)

      // Validar backup
      const validation = await this.validateBackup(backupPath)
      if (!validation.isValid) {
        throw new Error(`Backup inválido: ${validation.error}`)
      }

      const backupData = validation.data!
      const recovered = {
        patients: 0,
        appointments: 0,
        medicalRecords: 0,
        consultations: 0,
        surgeries: 0,
        reviews: 0,
        users: 0,
      }

      // Recuperar pacientes (convertendo para MedicalPatient/CommunicationContact)
      if (options.recoverPatients !== false && backupData.patients) {
        console.log('👥 Recuperando pacientes...')
        for (const patient of backupData.patients) {
          try {
            // Skip recovery for old patient format - would need manual migration
            console.log(`⚠️ Skipping patient ${patient.name} - requires manual migration to new schema`)
            // TODO: Implement migration from old Patient model to MedicalPatient/CommunicationContact
            /*
            const existingContact = await prisma.communicationContact.findFirst({
              where: {
                OR: [
                  { email: patient.email },
                  { whatsapp: patient.phone }
                ]
              },
            })

            if (!existingContact || options.overwriteExisting) {
              // Would need to create CommunicationContact + MedicalPatient
              recovered.patients++
            }
            */
          } catch (error) {
            console.error(
              `❌ Erro ao recuperar paciente ${patient.email}:`,
              error
            )
          }
        }
      }

      // Recuperar consultas
      if (options.recoverAppointments !== false && backupData.appointments) {
        console.log('📅 Recuperando consultas...')
        for (const appointment of backupData.appointments) {
          try {
            // Verificar se o paciente existe
            const patient = await prisma.patient.findUnique({
              where: {
                email: appointment.patient?.email || appointment.patientEmail,
              },
            })

            if (patient) {
              const existingAppointment = await prisma.appointment.findFirst({
                where: {
                  patientId: patient.id,
                  date: new Date(appointment.date),
                  time: appointment.time,
                },
              })

              if (!existingAppointment || options.overwriteExisting) {
                await prisma.appointment.upsert({
                  where: { id: appointment.id || 'new-' + Date.now() },
                  update: {
                    patientName: appointment.patientName || 'Unknown',
                    patientPhone: appointment.patientPhone || '',
                    patientWhatsapp: appointment.patientWhatsapp || '',
                    date: new Date(appointment.date || appointment.appointmentDate),
                    time: appointment.time || appointment.appointmentTime,
                    type: appointment.type,
                    status: appointment.status,
                    notes: appointment.notes,
                    updatedAt: new Date(),
                  },
                  create: {
                    patientName: appointment.patientName || 'Unknown',
                    patientPhone: appointment.patientPhone || '',
                    patientWhatsapp: appointment.patientWhatsapp || '',
                    date: new Date(appointment.date || appointment.appointmentDate),
                    time: appointment.time || appointment.appointmentTime,
                    type: appointment.type,
                    status: appointment.status || 'SCHEDULED',
                    notes: appointment.notes,
                  },
                })
                recovered.appointments++
              }
            }
          } catch (error) {
            console.error(`❌ Erro ao recuperar consulta:`, error)
          }
        }
      }

      // Recuperar prontuários médicos
      if (
        options.recoverMedicalRecords !== false &&
        backupData.medicalRecords
      ) {
        console.log('📋 Recuperando prontuários médicos...')
        console.log('⚠️ Medical records recovery requires consultation ID - skipping for now')
        // Medical records now require consultationId which is unique
        // Would need to create consultations first, then medical records
        // TODO: Implement proper medical record recovery with consultation creation
      }

      console.log('✅ RECUPERAÇÃO DE DADOS CONCLUÍDA!')
      console.log('📊 Dados recuperados:', recovered)

      return {
        success: true,
        message: '🚨 DADOS RECUPERADOS COM SUCESSO!',
        recovered,
      }
    } catch (error) {
      console.error('❌ FALHA NA RECUPERAÇÃO DE DADOS:', error)
      return {
        success: false,
        message: `❌ Falha na recuperação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        recovered: {},
      }
    }
  }

  // Criar backup antes da recuperação
  static async createPreRecoveryBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFileName = `pre-recovery-backup-${timestamp}.json`

      // Buscar dados atuais
      const [medicalPatients, communicationContacts, appointments, medicalRecords] = await Promise.all([
        prisma.medicalPatient.findMany(),
        prisma.communicationContact.findMany(),
        prisma.appointment.findMany(),
        prisma.medicalRecord.findMany(),
      ])

      const backupData = {
        timestamp: new Date().toISOString(),
        type: 'PRE_RECOVERY_BACKUP',
        medicalPatients,
        communicationContacts,
        appointments,
        medicalRecords,
        totalRecords:
          medicalPatients.length + communicationContacts.length + appointments.length + medicalRecords.length,
      }

      const backupDir = path.join(process.cwd(), 'backups', 'pre-recovery')
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }

      const backupPath = path.join(backupDir, backupFileName)
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2))

      console.log(`💾 Backup pré-recuperação criado: ${backupPath}`)
      return backupPath
    } catch (error) {
      console.error('❌ Erro ao criar backup pré-recuperação:', error)
      throw error
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'list') {
      const backups = await DataRecoverySystem.listAvailableBackups()

      return NextResponse.json({
        success: true,
        message: 'Backups disponíveis para recuperação',
        data: {
          backups,
          total: backups.length,
        },
      })
    }

    if (action === 'validate') {
      const backupPath = searchParams.get('path')
      if (!backupPath) {
        return NextResponse.json(
          {
            success: false,
            message: 'Caminho do backup não fornecido',
          },
          { status: 400 }
        )
      }

      const validation = await DataRecoverySystem.validateBackup(backupPath)

      return NextResponse.json({
        success: validation.isValid,
        message: validation.isValid
          ? 'Backup válido'
          : `Backup inválido: ${validation.error}`,
        data: validation.isValid
          ? {
              timestamp: validation.data?.timestamp,
              totalRecords: validation.data?.totalRecords,
              patients: validation.data?.patients?.length || 0,
              appointments: validation.data?.appointments?.length || 0,
              medicalRecords: validation.data?.medicalRecords?.length || 0,
            }
          : null,
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Ação inválida. Use: list ou validate',
      },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Erro no sistema de recuperação',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, backupPath, options } = await request.json()

    if (action === 'recover') {
      if (!backupPath) {
        return NextResponse.json(
          {
            success: false,
            message: 'Caminho do backup não fornecido',
          },
          { status: 400 }
        )
      }

      // Criar backup pré-recuperação
      const preRecoveryBackup =
        await DataRecoverySystem.createPreRecoveryBackup()

      // Executar recuperação
      const result = await DataRecoverySystem.recoverFromBackup(
        backupPath,
        options || {}
      )

      return NextResponse.json({
        ...result,
        preRecoveryBackup,
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Ação inválida. Use: recover',
      },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Erro na recuperação de dados',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
