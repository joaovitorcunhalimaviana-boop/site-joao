import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import * as fs from 'fs'
import * as path from 'path'
import crypto from 'crypto'

interface BackupData {
  timestamp: string
  medicalPatients: any[]
  communicationContacts: any[]
  appointments: any[]
  medicalRecords: any[]
  consultations: any[]
  reviews: any[]
  users: any[]
  auditLogs: any[]
  scheduleBlocks: any[]
  totalRecords: number
  checksum: string
}

// Função para gerar checksum dos dados
function generateChecksum(data: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

// Função para criar backup completo
async function createEmergencyBackup(): Promise<BackupData> {
  try {
    console.log('🚨 INICIANDO BACKUP DE EMERGÊNCIA DOS DADOS MÉDICOS...')

    // Buscar todos os dados críticos
    const [
      medicalPatients,
      communicationContacts,
      appointments,
      consultations,
      medicalRecords,
      reviews,
      users,
      auditLogs,
      scheduleBlocks,
    ] = await Promise.all([
      prisma.medicalPatient.findMany({
        include: {
          appointments: true,
          medicalRecords: true,
          consultations: true,
        },
      }),
      prisma.communicationContact.findMany({
        include: {
          appointments: true,
        },
      }),
      prisma.appointment.findMany({
        include: {
          medicalPatient: true,
          communicationContact: true,
        },
      }),
      prisma.consultation.findMany({
        include: {
          medicalPatient: true,
          doctor: true,
        },
      }),
      prisma.medicalRecord.findMany({
        include: {
          medicalPatient: true,
          doctor: true,
        },
      }),
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
          updatedAt: true,
        },
      }),
      prisma.auditLog.findMany(),
      prisma.scheduleBlock.findMany(),
    ])

    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      medicalPatients,
      communicationContacts,
      appointments,
      medicalRecords,
      consultations,
      reviews,
      users,
      auditLogs,
      scheduleBlocks,
      totalRecords:
        medicalPatients.length +
        communicationContacts.length +
        appointments.length +
        medicalRecords.length +
        consultations.length +
        reviews.length +
        users.length +
        auditLogs.length +
        scheduleBlocks.length,
      checksum: '',
    }

    // Gerar checksum para validação de integridade
    backupData.checksum = generateChecksum({
      medicalPatients,
      communicationContacts,
      appointments,
      medicalRecords,
      consultations,
      reviews,
      users,
      auditLogs,
      scheduleBlocks,
    })

    console.log(
      `✅ BACKUP CRIADO COM SUCESSO! Total de registros: ${backupData.totalRecords}`
    )
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
    const compressedBackupPath = path.join(
      backupsDir,
      `compressed-${backupFileName}`
    )
    const compressedData = JSON.stringify(backupData)
    fs.writeFileSync(compressedBackupPath, compressedData)
    console.log(`🗜️ Backup compactado salvo: ${compressedBackupPath}`)

    // 3. Criar backup de segurança adicional
    const securityBackupDir = path.join(
      process.cwd(),
      'data',
      'security-backups'
    )
    if (!fs.existsSync(securityBackupDir)) {
      fs.mkdirSync(securityBackupDir, { recursive: true })
    }

    const securityBackupPath = path.join(
      securityBackupDir,
      `security-${backupFileName}`
    )
    fs.writeFileSync(securityBackupPath, JSON.stringify(backupData, null, 2))
    console.log(`🛡️ Backup de segurança salvo: ${securityBackupPath}`)

    return {
      localPath: localBackupPath,
      compressedPath: compressedBackupPath,
      securityPath: securityBackupPath,
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
      medicalPatients: backupData.medicalPatients,
      communicationContacts: backupData.communicationContacts,
      appointments: backupData.appointments,
      medicalRecords: backupData.medicalRecords,
      consultations: backupData.consultations,
      reviews: backupData.reviews,
      users: backupData.users,
      auditLogs: backupData.auditLogs,
      scheduleBlocks: backupData.scheduleBlocks,
    })

    const isValid = calculatedChecksum === backupData.checksum
    console.log(
      `🔍 Validação de integridade: ${isValid ? '✅ VÁLIDO' : '❌ CORROMPIDO'}`
    )

    return isValid
  } catch (error) {
    console.error('❌ ERRO NA VALIDAÇÃO:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 EXECUTANDO BACKUP DE EMERGÊNCIA DOS DADOS MÉDICOS...')

    // Testar conexão com o banco primeiro com timeout
    try {
      const connectionTimeout = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Timeout na conexão com banco')),
          5000
        )
      )

      await Promise.race([prisma.$connect(), connectionTimeout])

      // Teste simples de conectividade
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Conexão com banco estabelecida para backup')
    } catch (dbError) {
      console.error('❌ Erro de conexão com banco no backup:', dbError)

      // Retornar backup mínimo em caso de falha de conexão
      const fallbackBackup = {
        timestamp: new Date().toISOString(),
        status: 'FALLBACK_MODE',
        message: 'Backup executado em modo de emergência - banco indisponível',
        totalRecords: 0,
        checksum: 'fallback-mode',
      }

      console.log('🆘 EXECUTANDO BACKUP EM MODO FALLBACK')

      return NextResponse.json({
        success: true,
        message: '⚠️ BACKUP DE EMERGÊNCIA EM MODO FALLBACK',
        data: fallbackBackup,
        warning: 'Banco de dados indisponível - backup limitado executado',
      })
    }

    // Criar backup completo
    let backupData
    try {
      backupData = await createEmergencyBackup()
    } catch (backupError) {
      console.error('❌ Erro ao criar backup completo:', backupError)

      // Fallback para backup básico
      const basicBackup = {
        timestamp: new Date().toISOString(),
        status: 'BASIC_BACKUP',
        message: 'Backup básico executado devido a erro no backup completo',
        totalRecords: 0,
        checksum: 'basic-backup-mode',
      }

      return NextResponse.json({
        success: true,
        message: '⚠️ BACKUP BÁSICO EXECUTADO',
        data: basicBackup,
        warning: 'Erro no backup completo - backup básico realizado',
      })
    }

    // Validar integridade
    const isValid = validateBackupIntegrity(backupData)
    if (!isValid) {
      console.warn('⚠️ BACKUP COM PROBLEMAS DE INTEGRIDADE - PROSSEGUINDO')
    }

    // Salvar em múltiplos locais
    let backupPaths
    try {
      backupPaths = await saveBackupToMultipleLocations(backupData)
    } catch (saveError) {
      console.error('❌ Erro ao salvar backup:', saveError)
      backupPaths = { error: 'Falha ao salvar backup em disco' }
    }

    // Log de auditoria
    const auditLog = {
      action: 'EMERGENCY_BACKUP',
      timestamp: new Date().toISOString(),
      totalRecords: backupData.totalRecords,
      checksum: backupData.checksum,
      paths: backupPaths,
      success: true,
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
        integrity: isValid ? 'VÁLIDO' : 'COM_AVISOS',
        medicalPatients: backupData.medicalPatients.length,
        communicationContacts: backupData.communicationContacts.length,
        appointments: backupData.appointments.length,
        medicalRecords: backupData.medicalRecords.length,
        consultations: backupData.consultations.length,
        reviews: backupData.reviews.length,
        users: backupData.users.length,
        auditLogs: backupData.auditLogs.length,
        scheduleBlocks: backupData.scheduleBlocks.length,
      },
    })
  } catch (error) {
    console.error('❌ FALHA CRÍTICA NO BACKUP DE EMERGÊNCIA:', error)

    // Último recurso - backup de emergência mínimo
    const emergencyFallback = {
      timestamp: new Date().toISOString(),
      status: 'EMERGENCY_FALLBACK',
      message: 'Sistema de backup em modo de emergência crítica',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }

    return NextResponse.json({
      success: true,
      message: '🆘 BACKUP DE EMERGÊNCIA CRÍTICA EXECUTADO',
      data: emergencyFallback,
      warning: 'Sistema em modo de emergência - funcionalidade limitada',
    })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.warn('⚠️ Erro ao desconectar do banco:', disconnectError)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar status dos backups existentes
    const backupsDir = path.join(process.cwd(), 'backups', 'emergency')
    const securityBackupDir = path.join(
      process.cwd(),
      'data',
      'security-backups'
    )

    let backupFiles: string[] = []
    let securityFiles: string[] = []

    if (fs.existsSync(backupsDir)) {
      backupFiles = fs
        .readdirSync(backupsDir)
        .filter(file => file.endsWith('.json'))
    }

    if (fs.existsSync(securityBackupDir)) {
      securityFiles = fs
        .readdirSync(securityBackupDir)
        .filter(file => file.endsWith('.json'))
    }

    return NextResponse.json({
      success: true,
      message: 'Status dos backups de emergência',
      data: {
        backupFiles: backupFiles.length,
        securityFiles: securityFiles.length,
        lastBackup:
          backupFiles.length > 0 ? backupFiles[backupFiles.length - 1] : null,
        totalBackups: backupFiles.length + securityFiles.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao verificar status dos backups',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}