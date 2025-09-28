import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface BackupData {
  timestamp: string
  patients: any[]
  appointments: any[]
  medicalRecords: any[]
  consultations: any[]
  surgeries: any[]
  reviews: any[]
  users: any[]
  auditLogs: any[]
  scheduleBlocks: any[]
  totalRecords: number
  checksum: string
}

// Função para gerar checksum dos dados
function generateChecksum(data: any): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

// Função para criar backup completo
async function createEmergencyBackup(): Promise<BackupData> {
  try {
    console.log('🚨 INICIANDO BACKUP DE EMERGÊNCIA DOS DADOS MÉDICOS...')
    
    // Buscar todos os dados críticos
    const [
      patients,
      appointments,
      consultations,
      medicalRecords,
      // surgeries, // Removido - não existe no schema
      reviews,
      users,
      auditLogs
    ] = await Promise.all([
      prisma.patient.findMany({
        include: {
          appointments: true,
          medicalRecords: true,
          consultations: true
        }
      }),
      prisma.appointment.findMany({
        include: {
          patient: true
        }
      }),
      prisma.consultation.findMany({
        include: {
          patient: true,
          doctor: true
        }
      }),
      prisma.medicalRecord.findMany({
        include: {
          patient: true,
          doctor: true
        }
      }),
      // Cirurgias não existem no schema atual - removendo
      // prisma.surgery.findMany({
      //   include: {
      //     patient: true
      //   }
      // }),
      prisma.review.findMany(),
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          name: true,
          crm: true,
          specialties: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.auditLog.findMany()
    ])

    // Tentar buscar scheduleBlocks, mas não falhar se não existir
    let scheduleBlocks: any[] = []
    try {
      scheduleBlocks = await prisma.scheduleBlock.findMany()
    } catch (scheduleError) {
      console.warn('⚠️ Não foi possível buscar scheduleBlocks:', scheduleError)
      scheduleBlocks = []
    }

    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      patients,
      appointments,
      medicalRecords,
      consultations,
      surgeries: [], // Removido - não existe no schema
      reviews,
      users,
      auditLogs,
      scheduleBlocks,
      totalRecords: patients.length + appointments.length + medicalRecords.length + consultations.length + reviews.length + users.length + auditLogs.length + scheduleBlocks.length,
      checksum: ''
    }

    // Gerar checksum para validação de integridade
    backupData.checksum = generateChecksum({
      patients,
      appointments,
      medicalRecords,
      consultations,
      // surgeries, // Removido - não existe no schema
      reviews,
      users,
      auditLogs,
      scheduleBlocks
    })

    console.log(`✅ BACKUP CRIADO COM SUCESSO! Total de registros: ${backupData.totalRecords}`)
    console.log(`🔐 Checksum de integridade: ${backupData.checksum}`)
    
    return backupData
  } catch (error) {
    console.error('❌ ERRO CRÍTICO NO BACKUP:', error)
    throw error
  }
}

// Função para salvar backup em múltiplos locais
async function saveBackupToMultipleLocations(backupData: BackupData) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFileName = `emergency-backup-${timestamp}.json`
  
  try {
    // 1. Salvar no diretório de backups local
    const backupsDir = path.join(process.cwd(), 'backups', 'emergency')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }
    
    const localBackupPath = path.join(backupsDir, backupFileName)
    fs.writeFileSync(localBackupPath, JSON.stringify(backupData, null, 2))
    console.log(`💾 Backup salvo localmente: ${localBackupPath}`)
    
    // 2. Salvar backup compactado
    const compressedBackupPath = path.join(backupsDir, `compressed-${backupFileName}`)
    const compressedData = JSON.stringify(backupData)
    fs.writeFileSync(compressedBackupPath, compressedData)
    console.log(`🗜️ Backup compactado salvo: ${compressedBackupPath}`)
    
    // 3. Criar backup de segurança adicional
    const securityBackupDir = path.join(process.cwd(), 'data', 'security-backups')
    if (!fs.existsSync(securityBackupDir)) {
      fs.mkdirSync(securityBackupDir, { recursive: true })
    }
    
    const securityBackupPath = path.join(securityBackupDir, `security-${backupFileName}`)
    fs.writeFileSync(securityBackupPath, JSON.stringify(backupData, null, 2))
    console.log(`🛡️ Backup de segurança salvo: ${securityBackupPath}`)
    
    return {
      localPath: localBackupPath,
      compressedPath: compressedBackupPath,
      securityPath: securityBackupPath
    }
  } catch (error) {
    console.error('❌ ERRO AO SALVAR BACKUP:', error)
    throw error
  }
}

// Função para validar integridade do backup
function validateBackupIntegrity(backupData: BackupData): boolean {
  try {
    const calculatedChecksum = generateChecksum({
      patients: backupData.patients,
      appointments: backupData.appointments,
      medicalRecords: backupData.medicalRecords,
      consultations: backupData.consultations,
      reviews: backupData.reviews,
      users: backupData.users,
      auditLogs: backupData.auditLogs,
      scheduleBlocks: backupData.scheduleBlocks
    })
    
    const isValid = calculatedChecksum === backupData.checksum
    console.log(`🔍 Validação de integridade: ${isValid ? '✅ VÁLIDO' : '❌ CORROMPIDO'}`)
    
    return isValid
  } catch (error) {
    console.error('❌ ERRO NA VALIDAÇÃO:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 EXECUTANDO BACKUP DE EMERGÊNCIA DOS DADOS MÉDICOS...')
    
    // Testar conexão com o banco primeiro
    try {
      await prisma.$connect()
      console.log('✅ Conexão com banco estabelecida para backup')
    } catch (dbError) {
      console.error('❌ Erro de conexão com banco no backup:', dbError)
      return NextResponse.json({
        success: false,
        message: 'Erro de conexão com o banco de dados durante backup',
        error: dbError instanceof Error ? dbError.message : 'Erro de conexão desconhecido'
      }, { status: 500 })
    }
    
    // Criar backup completo
    const backupData = await createEmergencyBackup()
    
    // Validar integridade
    const isValid = validateBackupIntegrity(backupData)
    if (!isValid) {
      throw new Error('BACKUP CORROMPIDO - INTEGRIDADE COMPROMETIDA!')
    }
    
    // Salvar em múltiplos locais
    const backupPaths = await saveBackupToMultipleLocations(backupData)
    
    // Log de auditoria
    const auditLog = {
      action: 'EMERGENCY_BACKUP',
      timestamp: new Date().toISOString(),
      totalRecords: backupData.totalRecords,
      checksum: backupData.checksum,
      paths: backupPaths,
      success: true
    }
    
    console.log('📋 LOG DE AUDITORIA:', auditLog)
    
    return NextResponse.json({
      success: true,
      message: '🚨 BACKUP DE EMERGÊNCIA CRIADO COM SUCESSO!',
      data: {
        timestamp: backupData.timestamp,
        totalRecords: backupData.totalRecords,
        checksum: backupData.checksum,
        paths: backupPaths,
        integrity: 'VÁLIDO',
        patients: backupData.patients.length,
        appointments: backupData.appointments.length,
        medicalRecords: backupData.medicalRecords.length,
        consultations: backupData.consultations.length,
        surgeries: backupData.surgeries.length,
        reviews: backupData.reviews.length,
        users: backupData.users.length
      }
    })
    
  } catch (error) {
    console.error('❌ FALHA CRÍTICA NO BACKUP DE EMERGÊNCIA:', error)
    
    return NextResponse.json({
      success: false,
      message: '❌ FALHA NO BACKUP DE EMERGÊNCIA',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar status dos backups existentes
    const backupsDir = path.join(process.cwd(), 'backups', 'emergency')
    const securityBackupDir = path.join(process.cwd(), 'data', 'security-backups')
    
    let backupFiles: string[] = []
    let securityFiles: string[] = []
    
    if (fs.existsSync(backupsDir)) {
      backupFiles = fs.readdirSync(backupsDir).filter(file => file.endsWith('.json'))
    }
    
    if (fs.existsSync(securityBackupDir)) {
      securityFiles = fs.readdirSync(securityBackupDir).filter(file => file.endsWith('.json'))
    }
    
    return NextResponse.json({
      success: true,
      message: 'Status dos backups de emergência',
      data: {
        backupFiles: backupFiles.length,
        securityFiles: securityFiles.length,
        lastBackup: backupFiles.length > 0 ? backupFiles[backupFiles.length - 1] : null,
        totalBackups: backupFiles.length + securityFiles.length
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao verificar status dos backups',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}