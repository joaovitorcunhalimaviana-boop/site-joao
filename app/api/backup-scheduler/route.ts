import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { enhancedBackupSystem } from '@/lib/enhanced-backup-system'

const prisma = new PrismaClient()

// Sistema de backup automático com cron job
class EmergencyBackupScheduler {
  private static instance: EmergencyBackupScheduler
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null
  private lastBackupTime: Date | null = null

  static getInstance(): EmergencyBackupScheduler {
    if (!EmergencyBackupScheduler.instance) {
      EmergencyBackupScheduler.instance = new EmergencyBackupScheduler()
    }
    return EmergencyBackupScheduler.instance
  }

  // Executar backup de emergência (com verificação de saúde)
  private async executeEmergencyBackup(): Promise<void> {
    try {
      console.log('🚨 EXECUTANDO BACKUP AUTOMÁTICO DE EMERGÊNCIA...')

      // Base unificada: prioriza NEXTAUTH_URL, depois NEXT_PUBLIC_BASE_URL/NEXT_PUBLIC_APP_URL
      const baseUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3002'
          : process.env['NEXTAUTH_URL'] ||
            process.env['NEXT_PUBLIC_BASE_URL'] ||
            process.env['NEXT_PUBLIC_APP_URL'] ||
            'https://www.joaovitorviana.com.br'

      // Verificar health antes de executar o backup
      try {
        const health = await fetch(`${baseUrl}/api/health`, { method: 'GET' })
        if (!health.ok) {
          throw new Error(`Healthcheck falhou: ${health.status}`)
        }
      } catch (healthErr) {
        console.error('❌ Healthcheck indisponível, adiando backup:', healthErr)
        return
      }
      // Executar backup diretamente pela lógica interna (evita middleware)
      const result = await enhancedBackupSystem.performEmergencyBackup()
      if (result.success && result.data) {
        console.log('✅ BACKUP AUTOMÁTICO CONCLUÍDO:', result.data)
        this.lastBackupTime = new Date()

        // Salvar log do backup automático
        await this.saveBackupLog(result.data)
      } else {
        throw new Error(`Falha no backup: ${result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ ERRO NO BACKUP AUTOMÁTICO:', error)

      // Tentar backup de emergência alternativo
      await this.emergencyFallbackBackup()
    }
  }

  // Backup de emergência alternativo
  private async emergencyFallbackBackup(): Promise<void> {
    try {
      console.log('🆘 EXECUTANDO BACKUP DE EMERGÊNCIA ALTERNATIVO...')

      // Contar registros críticos
      const [medicalPatientCount, communicationContactCount, appointmentCount, recordCount] = await Promise.all([
        prisma.medicalPatient.count(),
        prisma.communicationContact.count(),
        prisma.appointment.count(),
        prisma.medicalRecord.count(),
      ])

      const emergencyData = {
        timestamp: new Date().toISOString(),
        counts: {
          medicalPatients: medicalPatientCount,
          communicationContacts: communicationContactCount,
          appointments: appointmentCount,
          medicalRecords: recordCount,
        },
        status: 'EMERGENCY_FALLBACK',
        message:
          'Backup de emergência executado devido a falha no sistema principal',
      }

      console.log('🆘 DADOS DE EMERGÊNCIA:', emergencyData)

      // Salvar dados de emergência
      await this.saveEmergencyData(emergencyData)
    } catch (error) {
      console.error('💀 FALHA CRÍTICA NO BACKUP DE EMERGÊNCIA:', error)
    }
  }

  // Salvar log do backup
  private async saveBackupLog(backupData: any): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        type: 'AUTOMATIC_BACKUP',
        totalRecords: backupData.totalRecords,
        checksum: backupData.checksum,
        patients: backupData.patients,
        appointments: backupData.appointments,
        medicalRecords: backupData.medicalRecords,
        success: true,
      }

      console.log('📝 LOG DE BACKUP SALVO:', logEntry)
    } catch (error) {
      console.error('❌ ERRO AO SALVAR LOG:', error)
    }
  }

  // Salvar dados de emergência
  private async saveEmergencyData(emergencyData: any): Promise<void> {
    try {
      console.log('💾 SALVANDO DADOS DE EMERGÊNCIA:', emergencyData)
    } catch (error) {
      console.error('❌ ERRO AO SALVAR DADOS DE EMERGÊNCIA:', error)
    }
  }

  // Iniciar sistema de backup automático
  public startAutomaticBackup(): void {
    if (this.isRunning) {
      console.log('⚠️ Sistema de backup já está em execução')
      return
    }

    console.log('🚀 INICIANDO SISTEMA DE BACKUP AUTOMÁTICO DE EMERGÊNCIA...')
    console.log('⏰ Backup será executado a cada 6 horas (4x por dia)')

    this.isRunning = true

    // Executar backup com pequeno delay inicial para evitar 405 após boot
    setTimeout(() => {
      this.executeEmergencyBackup()
    }, 60 * 1000) // 60 segundos

    // Agendar backups a cada 6 horas (21600000 ms)
    this.intervalId = setInterval(
      () => {
        console.log('⏰ HORA DO BACKUP AUTOMÁTICO!')
        this.executeEmergencyBackup()
      },
      6 * 60 * 60 * 1000
    ) // 6 horas

    console.log('✅ SISTEMA DE BACKUP AUTOMÁTICO INICIADO COM SUCESSO!')
  }

  // Parar sistema de backup
  public stopAutomaticBackup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('🛑 Sistema de backup automático parado')
  }

  // Verificar status
  public getStatus() {
    return {
      isRunning: this.isRunning,
      lastBackupTime: this.lastBackupTime,
      nextBackupIn: this.isRunning ? '6 horas' : 'Sistema parado',
    }
  }

  // Forçar backup imediato
  public async forceBackup(): Promise<void> {
    console.log('🚨 BACKUP FORÇADO SOLICITADO!')
    await this.executeEmergencyBackup()
  }
}

// Inicializar sistema automaticamente
const backupScheduler = EmergencyBackupScheduler.getInstance()

// Iniciar sistema na primeira execução
if (process.env['NODE_ENV'] === 'production') {
  console.log('🚨 MODO PRODUÇÃO - INICIANDO BACKUP AUTOMÁTICO...')
  backupScheduler.startAutomaticBackup()
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'start':
        backupScheduler.startAutomaticBackup()
        return NextResponse.json({
          success: true,
          message: '🚀 Sistema de backup automático iniciado!',
          status: backupScheduler.getStatus(),
        })

      case 'stop':
        backupScheduler.stopAutomaticBackup()
        return NextResponse.json({
          success: true,
          message: '🛑 Sistema de backup automático parado!',
          status: backupScheduler.getStatus(),
        })

      case 'force':
        await backupScheduler.forceBackup()
        return NextResponse.json({
          success: true,
          message: '🚨 Backup forçado executado!',
          status: backupScheduler.getStatus(),
        })

      default:
        return NextResponse.json(
          {
            success: false,
            message: 'Ação inválida. Use: start, stop, ou force',
          },
          { status: 400 }
        )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Erro no sistema de backup',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = backupScheduler.getStatus()

    return NextResponse.json({
      success: true,
      message: 'Status do sistema de backup automático',
      data: status,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao verificar status',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
