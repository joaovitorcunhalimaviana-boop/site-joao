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
      path.join(process.cwd(), 'data', 'security-backups')
    ]
    
    const availableBackups: any[] = []
    
    for (const dir of backupDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
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
              directory: dir
            }
          })
        
        availableBackups.push(...files)
      }
    }
    
    // Ordenar por data de criação (mais recente primeiro)
    return availableBackups.sort((a, b) => b.created.getTime() - a.created.getTime())
  }
  
  // Validar backup antes da recuperação
  static async validateBackup(backupPath: string): Promise<{ isValid: boolean; data?: any; error?: string }> {
    try {
      if (!fs.existsSync(backupPath)) {
        return { isValid: false, error: 'Arquivo de backup não encontrado' }
      }
      
      const backupContent = fs.readFileSync(backupPath, 'utf8')
      const backupData = JSON.parse(backupContent)
      
      // Verificar estrutura básica
      const requiredFields = ['timestamp', 'patients', 'appointments', 'medicalRecords', 'checksum']
      for (const field of requiredFields) {
        if (!backupData[field]) {
          return { isValid: false, error: `Campo obrigatório ausente: ${field}` }
        }
      }
      
      // Verificar integridade com checksum
      const crypto = require('crypto')
      const calculatedChecksum = crypto.createHash('sha256').update(JSON.stringify({
        patients: backupData.patients,
        appointments: backupData.appointments,
        medicalRecords: backupData.medicalRecords,
        consultations: backupData.consultations || [],
        surgeries: backupData.surgeries || [],
        reviews: backupData.reviews || [],
        users: backupData.users || []
      })).digest('hex')
      
      if (calculatedChecksum !== backupData.checksum) {
        return { isValid: false, error: 'Checksum inválido - backup pode estar corrompido' }
      }
      
      return { isValid: true, data: backupData }
      
    } catch (error) {
      return { 
        isValid: false, 
        error: `Erro ao validar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      }
    }
  }
  
  // Recuperar dados do backup
  static async recoverFromBackup(backupPath: string, options: {
    recoverPatients?: boolean
    recoverAppointments?: boolean
    recoverMedicalRecords?: boolean
    recoverConsultations?: boolean
    recoverSurgeries?: boolean
    recoverReviews?: boolean
    recoverUsers?: boolean
    overwriteExisting?: boolean
  } = {}): Promise<{ success: boolean; message: string; recovered: any }> {
    
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
        users: 0
      }
      
      // Recuperar pacientes
      if (options.recoverPatients !== false && backupData.patients) {
        console.log('👥 Recuperando pacientes...')
        for (const patient of backupData.patients) {
          try {
            const existingPatient = await prisma.patient.findUnique({
              where: { email: patient.email }
            })
            
            if (!existingPatient || options.overwriteExisting) {
              await prisma.patient.upsert({
                where: { email: patient.email },
                update: {
                  name: patient.name,
                  phone: patient.phone,
                  whatsapp: patient.whatsapp,
                  birthDate: patient.birthDate ? new Date(patient.birthDate) : null,
                  address: patient.address,
                  insurance: patient.insurance,
                  emergencyContact: patient.emergencyContact,
                  medicalHistory: patient.medicalHistory,
                  allergies: patient.allergies,
                  medications: patient.medications,
                  updatedAt: new Date()
                },
                create: {
                  name: patient.name,
                  email: patient.email,
                  phone: patient.phone,
                  whatsapp: patient.whatsapp,
                  birthDate: patient.birthDate ? new Date(patient.birthDate) : null,
                  address: patient.address,
                  insurance: patient.insurance,
                  emergencyContact: patient.emergencyContact,
                  medicalHistory: patient.medicalHistory,
                  allergies: patient.allergies,
                  medications: patient.medications
                }
              })
              recovered.patients++
            }
          } catch (error) {
            console.error(`❌ Erro ao recuperar paciente ${patient.email}:`, error)
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
              where: { email: appointment.patient?.email || appointment.patientEmail }
            })
            
            if (patient) {
              const existingAppointment = await prisma.appointment.findFirst({
                where: {
                  patientId: patient.id,
                  date: new Date(appointment.date),
                  time: appointment.time
                }
              })
              
              if (!existingAppointment || options.overwriteExisting) {
                await prisma.appointment.upsert({
                  where: { id: appointment.id || 'new-' + Date.now() },
                  update: {
                    date: new Date(appointment.date),
                    time: appointment.time,
                    type: appointment.type,
                    status: appointment.status,
                    notes: appointment.notes,
                    updatedAt: new Date()
                  },
                  create: {
                    patientId: patient.id,
                    date: new Date(appointment.date),
                    time: appointment.time,
                    type: appointment.type,
                    status: appointment.status || 'scheduled',
                    notes: appointment.notes
                  }
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
      if (options.recoverMedicalRecords !== false && backupData.medicalRecords) {
        console.log('📋 Recuperando prontuários médicos...')
        for (const record of backupData.medicalRecords) {
          try {
            const patient = await prisma.patient.findUnique({
              where: { email: record.patient?.email || record.patientEmail }
            })
            
            if (patient) {
              await prisma.medicalRecord.upsert({
                where: { id: record.id || 'new-' + Date.now() },
                update: {
                  diagnosis: record.diagnosis,
                  treatment: record.treatment,
                  medications: record.medications,
                  notes: record.notes,
                  date: record.date ? new Date(record.date) : new Date(),
                  updatedAt: new Date()
                },
                create: {
                  patientId: patient.id,
                  diagnosis: record.diagnosis,
                  treatment: record.treatment,
                  medications: record.medications,
                  notes: record.notes,
                  date: record.date ? new Date(record.date) : new Date()
                }
              })
              recovered.medicalRecords++
            }
          } catch (error) {
            console.error(`❌ Erro ao recuperar prontuário:`, error)
          }
        }
      }
      
      console.log('✅ RECUPERAÇÃO DE DADOS CONCLUÍDA!')
      console.log('📊 Dados recuperados:', recovered)
      
      return {
        success: true,
        message: '🚨 DADOS RECUPERADOS COM SUCESSO!',
        recovered
      }
      
    } catch (error) {
      console.error('❌ FALHA NA RECUPERAÇÃO DE DADOS:', error)
      return {
        success: false,
        message: `❌ Falha na recuperação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        recovered: {}
      }
    }
  }
  
  // Criar backup antes da recuperação
  static async createPreRecoveryBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFileName = `pre-recovery-backup-${timestamp}.json`
      
      // Buscar dados atuais
      const [patients, appointments, medicalRecords] = await Promise.all([
        prisma.patient.findMany(),
        prisma.appointment.findMany(),
        prisma.medicalRecord.findMany()
      ])
      
      const backupData = {
        timestamp: new Date().toISOString(),
        type: 'PRE_RECOVERY_BACKUP',
        patients,
        appointments,
        medicalRecords,
        totalRecords: patients.length + appointments.length + medicalRecords.length
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
          total: backups.length
        }
      })
    }
    
    if (action === 'validate') {
      const backupPath = searchParams.get('path')
      if (!backupPath) {
        return NextResponse.json({
          success: false,
          message: 'Caminho do backup não fornecido'
        }, { status: 400 })
      }
      
      const validation = await DataRecoverySystem.validateBackup(backupPath)
      
      return NextResponse.json({
        success: validation.isValid,
        message: validation.isValid ? 'Backup válido' : `Backup inválido: ${validation.error}`,
        data: validation.isValid ? {
          timestamp: validation.data?.timestamp,
          totalRecords: validation.data?.totalRecords,
          patients: validation.data?.patients?.length || 0,
          appointments: validation.data?.appointments?.length || 0,
          medicalRecords: validation.data?.medicalRecords?.length || 0
        } : null
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Ação inválida. Use: list ou validate'
    }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro no sistema de recuperação',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, backupPath, options } = await request.json()
    
    if (action === 'recover') {
      if (!backupPath) {
        return NextResponse.json({
          success: false,
          message: 'Caminho do backup não fornecido'
        }, { status: 400 })
      }
      
      // Criar backup pré-recuperação
      const preRecoveryBackup = await DataRecoverySystem.createPreRecoveryBackup()
      
      // Executar recuperação
      const result = await DataRecoverySystem.recoverFromBackup(backupPath, options || {})
      
      return NextResponse.json({
        ...result,
        preRecoveryBackup
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Ação inválida. Use: recover'
    }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro na recuperação de dados',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}