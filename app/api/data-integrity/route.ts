import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface IntegrityReport {
  timestamp: string
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  issues: IntegrityIssue[]
  statistics: DatabaseStatistics
  recommendations: string[]
}

interface IntegrityIssue {
  type: 'MISSING_DATA' | 'ORPHANED_RECORD' | 'DUPLICATE' | 'INVALID_FORMAT' | 'CONSTRAINT_VIOLATION'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  table: string
  description: string
  affectedRecords: number
  details?: any
}

interface DatabaseStatistics {
  patients: number
  appointments: number
  medicalRecords: number
  consultations: number
  surgeries: number
  reviews: number
  users: number
  totalRecords: number
  lastUpdated: string
}

// Sistema de validação de integridade dos dados
class DataIntegritySystem {
  
  // Verificar integridade geral do banco de dados
  static async performIntegrityCheck(): Promise<IntegrityReport> {
    console.log('🔍 INICIANDO VERIFICAÇÃO DE INTEGRIDADE DOS DADOS...')
    
    const issues: IntegrityIssue[] = []
    const recommendations: string[] = []
    
    try {
      // Coletar estatísticas
      const statistics = await this.collectDatabaseStatistics()
      
      // Verificar pacientes órfãos
      await this.checkOrphanedPatients(issues)
      
      // Verificar consultas órfãs
      await this.checkOrphanedAppointments(issues)
      
      // Verificar prontuários órfãos
      await this.checkOrphanedMedicalRecords(issues)
      
      // Verificar dados duplicados
      await this.checkDuplicatePatients(issues)
      
      // Verificar formatos inválidos
      await this.checkInvalidFormats(issues)
      
      // Verificar consistência de datas
      await this.checkDateConsistency(issues)
      
      // Verificar integridade referencial
      await this.checkReferentialIntegrity(issues)
      
      // Gerar recomendações
      this.generateRecommendations(issues, recommendations)
      
      // Determinar status geral
      const status = this.determineOverallStatus(issues)
      
      const report: IntegrityReport = {
        timestamp: new Date().toISOString(),
        status,
        issues,
        statistics,
        recommendations
      }
      
      console.log(`✅ VERIFICAÇÃO CONCLUÍDA - Status: ${status}`)
      console.log(`🔍 Problemas encontrados: ${issues.length}`)
      
      return report
      
    } catch (error) {
      console.error('❌ ERRO NA VERIFICAÇÃO DE INTEGRIDADE:', error)
      throw error
    }
  }
  
  // Coletar estatísticas do banco de dados
  static async collectDatabaseStatistics(): Promise<DatabaseStatistics> {
    const [patients, appointments, medicalRecords, consultations, reviews, users] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.medicalRecord.count(),
      prisma.consultation.count(),
      // prisma.surgery.count(), // Modelo Surgery não existe no schema atual
      prisma.review.count(),
      prisma.user.count()
    ])
    
    return {
      patients,
      appointments,
      medicalRecords,
      consultations,
      surgeries: 0, // Modelo Surgery não existe no schema atual
      reviews,
      users,
      totalRecords: patients + appointments + medicalRecords + consultations + 0 + reviews + users,
      lastUpdated: new Date().toISOString()
    }
  }
  
  // Verificar pacientes órfãos (sem dados relacionados)
  static async checkOrphanedPatients(issues: IntegrityIssue[]): Promise<void> {
    try {
      const orphanedPatients = await prisma.patient.findMany({
        where: {
          AND: [
            { appointments: { none: {} } },
            { medicalRecords: { none: {} } },
            { consultations: { none: {} } }
          ]
        },
        select: { id: true, name: true, email: true, createdAt: true }
      })
      
      if (orphanedPatients.length > 0) {
        issues.push({
          type: 'ORPHANED_RECORD',
          severity: 'MEDIUM',
          table: 'patients',
          description: `${orphanedPatients.length} pacientes sem consultas, prontuários ou registros médicos`,
          affectedRecords: orphanedPatients.length,
          details: orphanedPatients.slice(0, 5) // Mostrar apenas os primeiros 5
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar pacientes órfãos:', error)
    }
  }
  
  // Verificar consultas órfãs (sem paciente)
  static async checkOrphanedAppointments(issues: IntegrityIssue[]): Promise<void> {
    try {
      const orphanedAppointments = await prisma.appointment.findMany({
        where: {
          patientId: null
        },
        select: { id: true, date: true, time: true, patientId: true }
      })
      
      if (orphanedAppointments.length > 0) {
        issues.push({
          type: 'ORPHANED_RECORD',
          severity: 'HIGH',
          table: 'appointments',
          description: `${orphanedAppointments.length} consultas sem paciente associado`,
          affectedRecords: orphanedAppointments.length,
          details: orphanedAppointments
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar consultas órfãs:', error)
    }
  }
  
  // Verificar prontuários órfãos
  static async checkOrphanedMedicalRecords(issues: IntegrityIssue[]): Promise<void> {
    try {
      const orphanedRecords = await prisma.medicalRecord.findMany({
        where: {
          patient: null
        },
        select: { id: true, diagnosis: true, date: true, patientId: true }
      })
      
      if (orphanedRecords.length > 0) {
        issues.push({
          type: 'ORPHANED_RECORD',
          severity: 'CRITICAL',
          table: 'medicalRecords',
          description: `${orphanedRecords.length} prontuários médicos sem paciente associado`,
          affectedRecords: orphanedRecords.length,
          details: orphanedRecords
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar prontuários órfãos:', error)
    }
  }
  
  // Verificar pacientes duplicados
  static async checkDuplicatePatients(issues: IntegrityIssue[]): Promise<void> {
    try {
      const duplicateEmails = await prisma.patient.groupBy({
        by: ['email'],
        having: {
          email: {
            _count: {
              gt: 1
            }
          }
        },
        _count: {
          email: true
        }
      })
      
      if (duplicateEmails.length > 0) {
        let totalDuplicates = 0
        for (const duplicate of duplicateEmails) {
          totalDuplicates += duplicate._count.email - 1 // Subtrair 1 para contar apenas os duplicados
        }
        
        issues.push({
          type: 'DUPLICATE',
          severity: 'HIGH',
          table: 'patients',
          description: `${totalDuplicates} pacientes com emails duplicados`,
          affectedRecords: totalDuplicates,
          details: duplicateEmails
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar duplicatas:', error)
    }
  }
  
  // Verificar formatos inválidos
  static async checkInvalidFormats(issues: IntegrityIssue[]): Promise<void> {
    try {
      // Verificar emails inválidos
      const invalidEmails = await prisma.patient.findMany({
        where: {
          OR: [
            { email: { not: { contains: '@' } } },
            { email: { equals: '' } },
            { email: null }
          ]
        },
        select: { id: true, name: true, email: true }
      })
      
      if (invalidEmails.length > 0) {
        issues.push({
          type: 'INVALID_FORMAT',
          severity: 'HIGH',
          table: 'patients',
          description: `${invalidEmails.length} pacientes com emails inválidos ou ausentes`,
          affectedRecords: invalidEmails.length,
          details: invalidEmails
        })
      }
      
      // Verificar telefones inválidos
      const invalidPhones = await prisma.patient.findMany({
        where: {
          OR: [
            { phone: { equals: '' } },
            { phone: null }
          ]
        },
        select: { id: true, name: true, phone: true }
      })
      
      if (invalidPhones.length > 0) {
        issues.push({
          type: 'INVALID_FORMAT',
          severity: 'MEDIUM',
          table: 'patients',
          description: `${invalidPhones.length} pacientes sem telefone`,
          affectedRecords: invalidPhones.length,
          details: invalidPhones.slice(0, 5)
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar formatos:', error)
    }
  }
  
  // Verificar consistência de datas
  static async checkDateConsistency(issues: IntegrityIssue[]): Promise<void> {
    try {
      // Verificar consultas com datas futuras muito distantes
      const futureAppointments = await prisma.appointment.findMany({
        where: {
          date: {
            gt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Mais de 1 ano no futuro
          }
        },
        select: { id: true, date: true, time: true, patient: { select: { name: true } } }
      })
      
      if (futureAppointments.length > 0) {
        issues.push({
          type: 'INVALID_FORMAT',
          severity: 'MEDIUM',
          table: 'appointments',
          description: `${futureAppointments.length} consultas agendadas para mais de 1 ano no futuro`,
          affectedRecords: futureAppointments.length,
          details: futureAppointments
        })
      }
      
      // Verificar consultas com datas muito antigas
      const oldAppointments = await prisma.appointment.findMany({
        where: {
          date: {
            lt: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000) // Mais de 5 anos atrás
          }
        },
        select: { id: true, date: true, time: true, patient: { select: { name: true } } }
      })
      
      if (oldAppointments.length > 0) {
        issues.push({
          type: 'INVALID_FORMAT',
          severity: 'LOW',
          table: 'appointments',
          description: `${oldAppointments.length} consultas com mais de 5 anos`,
          affectedRecords: oldAppointments.length,
          details: oldAppointments.slice(0, 3)
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar datas:', error)
    }
  }
  
  // Verificar integridade referencial
  static async checkReferentialIntegrity(issues: IntegrityIssue[]): Promise<void> {
    try {
      // Esta verificação já é feita pelas outras funções de órfãos
      // Aqui podemos adicionar verificações adicionais se necessário
    } catch (error) {
      console.error('❌ Erro ao verificar integridade referencial:', error)
    }
  }
  
  // Gerar recomendações baseadas nos problemas encontrados
  static generateRecommendations(issues: IntegrityIssue[], recommendations: string[]): void {
    const criticalIssues = issues.filter(issue => issue.severity === 'CRITICAL')
    const highIssues = issues.filter(issue => issue.severity === 'HIGH')
    const mediumIssues = issues.filter(issue => issue.severity === 'MEDIUM')
    
    if (criticalIssues.length > 0) {
      recommendations.push('🚨 AÇÃO IMEDIATA NECESSÁRIA: Problemas críticos detectados que podem causar perda de dados')
      recommendations.push('📞 Entre em contato com o suporte técnico imediatamente')
      recommendations.push('💾 Execute um backup completo antes de fazer qualquer alteração')
    }
    
    if (highIssues.length > 0) {
      recommendations.push('⚠️ Problemas de alta prioridade detectados')
      recommendations.push('🔧 Agende manutenção para corrigir os problemas identificados')
    }
    
    if (mediumIssues.length > 0) {
      recommendations.push('📋 Considere limpar dados órfãos e duplicados')
      recommendations.push('✅ Implemente validações mais rigorosas nos formulários')
    }
    
    if (issues.length === 0) {
      recommendations.push('✅ Banco de dados está íntegro e saudável')
      recommendations.push('📅 Continue executando verificações regulares')
    }
    
    recommendations.push('🔄 Execute esta verificação semanalmente')
    recommendations.push('💾 Mantenha backups regulares e atualizados')
  }
  
  // Determinar status geral baseado nos problemas
  static determineOverallStatus(issues: IntegrityIssue[]): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
    const criticalIssues = issues.filter(issue => issue.severity === 'CRITICAL')
    const highIssues = issues.filter(issue => issue.severity === 'HIGH')
    
    if (criticalIssues.length > 0) {
      return 'CRITICAL'
    }
    
    if (highIssues.length > 0) {
      return 'WARNING'
    }
    
    return 'HEALTHY'
  }
  
  // Corrigir problemas automaticamente (quando possível)
  static async autoFixIssues(issueTypes: string[]): Promise<{ fixed: number; errors: string[] }> {
    let fixed = 0
    const errors: string[] = []
    
    try {
      // Remover consultas órfãs
      if (issueTypes.includes('orphaned_appointments')) {
        const deletedAppointments = await prisma.appointment.deleteMany({
          where: {
            patient: null
          }
        })
        fixed += deletedAppointments.count
        console.log(`🗑️ Removidas ${deletedAppointments.count} consultas órfãs`)
      }
      
      // Remover prontuários órfãos
      if (issueTypes.includes('orphaned_medical_records')) {
        const deletedRecords = await prisma.medicalRecord.deleteMany({
          where: {
            patient: null
          }
        })
        fixed += deletedRecords.count
        console.log(`🗑️ Removidos ${deletedRecords.count} prontuários órfãos`)
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      errors.push(errorMsg)
      console.error('❌ Erro na correção automática:', error)
    }
    
    return { fixed, errors }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'check' || !action) {
      const report = await DataIntegritySystem.performIntegrityCheck()
      
      return NextResponse.json({
        success: true,
        message: `Verificação de integridade concluída - Status: ${report.status}`,
        data: report
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Ação inválida. Use: check'
    }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro na verificação de integridade',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, issueTypes } = await request.json()
    
    if (action === 'autofix') {
      const result = await DataIntegritySystem.autoFixIssues(issueTypes || [])
      
      return NextResponse.json({
        success: true,
        message: `Correção automática concluída. ${result.fixed} problemas corrigidos.`,
        data: result
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Ação inválida. Use: autofix'
    }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro na correção automática',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}