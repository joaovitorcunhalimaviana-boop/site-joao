// API para Status do Sistema de Proteção de Dados
import { NextRequest, NextResponse } from 'next/server'
import { enhancedBackupSystem } from '@/lib/enhanced-backup-system'

export async function GET(request: NextRequest) {
  try {
    // Obter status do sistema de proteção
    const protectionStatus = await enhancedBackupSystem.getProtectionStatus()

    // Verificar se há problemas críticos recentes
    const integrityCheck =
      await enhancedBackupSystem.performDataIntegrityCheck()

    return NextResponse.json({
      success: true,
      data: {
        protection: protectionStatus,
        integrity: {
          status: integrityCheck.status,
          lastCheck: integrityCheck.timestamp,
          issuesCount: integrityCheck.issues.length,
          criticalIssues: integrityCheck.issues.filter(
            i => i.severity === 'CRITICAL'
          ).length,
        },
        services: {
          backupMonitoring: protectionStatus.monitoring,
          emailAutomation: true, // Sempre ativo
        },
      },
    })
  } catch (error) {
    console.error('❌ Erro ao obter status de proteção:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'start_monitoring':
        await enhancedBackupSystem.startContinuousMonitoring()

        return NextResponse.json({
          success: true,
          message: 'Monitoramento iniciado com sucesso',
        })

      case 'emergency_backup':
        const backupResult = await enhancedBackupSystem.performEmergencyBackup()

        return NextResponse.json({
          success: backupResult.success,
          data: backupResult,
          message: backupResult.success
            ? 'Backup de emergência concluído'
            : 'Falha no backup de emergência',
        })

      case 'integrity_check':
        const integrityResult =
          await enhancedBackupSystem.performDataIntegrityCheck()

        return NextResponse.json({
          success: true,
          data: integrityResult,
          message: `Verificação concluída: ${integrityResult.status}`,
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Ação não reconhecida',
          },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Erro na ação de proteção:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
