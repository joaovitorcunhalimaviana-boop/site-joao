import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

interface IntegrityReport {
  timestamp: string
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  issues: IntegrityIssue[]
  statistics: DatabaseStatistics
  recommendations: string[]
}

interface IntegrityIssue {
  type:
    | 'MISSING_DATA'
    | 'ORPHANED_RECORD'
    | 'DUPLICATE'
    | 'INVALID_FORMAT'
    | 'CONSTRAINT_VIOLATION'
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
        recommendations,
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
    try {
      const [
        patientsCount,
        appointmentsCount,
        medicalRecordsCount,
        consultationsCount,
        reviewsCount,
        usersCount,
      ] = await Promise.all([
        prisma.medicalPatient.count(),
        prisma.appointment.count(),
        prisma.medicalRecord.count(),
        prisma.consultation.count(),
        prisma.review.count(),
        prisma.user.count(),
      ])

      const statistics: DatabaseStatistics = {
        patients: patientsCount,
        appointments: appointmentsCount,
        medicalRecords: medicalRecordsCount,
        consultations: consultationsCount,
        surgeries: 0, // Não implementado ainda
        reviews: reviewsCount,
        users: usersCount,
        totalRecords:
          patientsCount +
          appointmentsCount +
          medicalRecordsCount +
          consultationsCount +
          reviewsCount +
          usersCount,
        lastUpdated: new Date().toISOString(),
      }

      return statistics
    } catch (error) {
      console.error('Erro ao coletar estatísticas do banco:', error)
      return {
        patients: 0,
        appointments: 0,
        medicalRecords: 0,
        consultations: 0,
        surgeries: 0,
        reviews: 0,
        users: 0,
        totalRecords: 0,
        lastUpdated: new Date().toISOString(),
      }
    }
  }

  // Verificar pacientes órfãos (não aplicável no sistema de arquivos)
  static async checkOrphanedPatients(issues: IntegrityIssue[]): Promise<void> {
    // No sistema de arquivos, pacientes não podem ser órfãos
    // Esta verificação é mais relevante para bancos relacionais
  }

  // Verificar consultas órfãs (sem paciente correspondente)
  static async checkOrphanedAppointments(
    issues: IntegrityIssue[]
  ): Promise<void> {
    try {
      const patients = await prisma.medicalPatient.findMany()
      const appointments = await prisma.appointment.findMany()
      const patientIds = new Set(patients.map((p: any) => p.id))

      const orphanedAppointments = appointments.filter(
        (appointment: any) =>
          appointment.patientId && !patientIds.has(appointment.patientId)
      )

      if (orphanedAppointments.length > 0) {
        issues.push({
          type: 'ORPHANED_RECORD',
          severity: 'HIGH',
          table: 'appointments',
          description: `${orphanedAppointments.length} consultas sem paciente correspondente`,
          affectedRecords: orphanedAppointments.length,
          details: orphanedAppointments.slice(0, 5),
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar consultas órfãs:', error)
    }
  }

  // Verificar prontuários órfãos (sem paciente correspondente)
  static async checkOrphanedMedicalRecords(
    issues: IntegrityIssue[]
  ): Promise<void> {
    try {
      const patients = await prisma.medicalPatient.findMany()
      const medicalRecords = await prisma.medicalRecord.findMany()
      const patientIds = new Set(patients.map((p: any) => p.id))

      const orphanedRecords = medicalRecords.filter(
        (record: any) => record.medicalPatientId && !patientIds.has(record.medicalPatientId)
      )

      if (orphanedRecords.length > 0) {
        issues.push({
          type: 'ORPHANED_RECORD',
          severity: 'CRITICAL',
          table: 'medicalRecords',
          description: `${orphanedRecords.length} prontuários sem paciente correspondente`,
          affectedRecords: orphanedRecords.length,
          details: orphanedRecords.slice(0, 5),
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar prontuários órfãos:', error)
    }
  }

  // Verificar pacientes duplicados
  static async checkDuplicatePatients(issues: IntegrityIssue[]): Promise<void> {
    try {
      const patients = await prisma.medicalPatient.findMany({
        include: {
          communicationContact: true
        }
      })

      // Verificar duplicatas por email
      const emailGroups = new Map()
      patients.forEach((patient: any) => {
        if (patient.communicationContact?.email) {
          const email = patient.communicationContact.email.toLowerCase()
          if (!emailGroups.has(email)) {
            emailGroups.set(email, [])
          }
          emailGroups.get(email).push(patient)
        }
      })

      const duplicateEmails = Array.from(emailGroups.entries()).filter(
        ([_, patients]) => patients.length > 1
      )

      if (duplicateEmails.length > 0) {
        const totalDuplicates = duplicateEmails.reduce(
          (sum, [_, patients]) => sum + patients.length - 1,
          0
        )
        issues.push({
          type: 'DUPLICATE',
          severity: 'HIGH',
          table: 'patients',
          description: `${totalDuplicates} pacientes com emails duplicados`,
          affectedRecords: totalDuplicates,
          details: duplicateEmails
            .slice(0, 3)
            .map(([email, patients]) => ({ email, count: patients.length })),
        })
      }

      // Verificar duplicatas por telefone
      const phoneGroups = new Map()
      patients.forEach((patient: any) => {
        if (patient.communicationContact?.whatsapp) {
          const phone = patient.communicationContact.whatsapp.replace(/\D/g, '') // Remove caracteres não numéricos
          if (!phoneGroups.has(phone)) {
            phoneGroups.set(phone, [])
          }
          phoneGroups.get(phone).push(patient)
        }
      })

      const duplicatePhones = Array.from(phoneGroups.entries()).filter(
        ([_, patients]) => patients.length > 1
      )

      if (duplicatePhones.length > 0) {
        const totalDuplicates = duplicatePhones.reduce(
          (sum, [_, patients]) => sum + patients.length - 1,
          0
        )
        issues.push({
          type: 'DUPLICATE',
          severity: 'MEDIUM',
          table: 'patients',
          description: `${totalDuplicates} pacientes com telefones duplicados`,
          affectedRecords: totalDuplicates,
          details: duplicatePhones
            .slice(0, 3)
            .map(([phone, patients]) => ({ phone, count: patients.length })),
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar duplicatas:', error)
    }
  }

  // Verificar formatos inválidos
  static async checkInvalidFormats(issues: IntegrityIssue[]): Promise<void> {
    try {
      const patients = await prisma.medicalPatient.findMany({
        include: {
          communicationContact: true
        }
      })

      // Verificar emails inválidos
      const invalidEmails = patients.filter(
        (patient: any) =>
          patient.communicationContact?.email &&
          (!patient.communicationContact.email.includes('@') || patient.communicationContact.email === '')
      )

      if (invalidEmails.length > 0) {
        issues.push({
          type: 'INVALID_FORMAT',
          severity: 'HIGH',
          table: 'patients',
          description: `${invalidEmails.length} pacientes com emails inválidos ou ausentes`,
          affectedRecords: invalidEmails.length,
          details: invalidEmails
            .slice(0, 5)
            .map((p: any) => ({ id: p.id, name: p.fullName, email: p.communicationContact?.email })),
        })
      }

      // Verificar telefones inválidos
      const invalidPhones = patients.filter(
        (patient: any) => !patient.communicationContact?.whatsapp || patient.communicationContact.whatsapp === ''
      )

      if (invalidPhones.length > 0) {
        issues.push({
          type: 'INVALID_FORMAT',
          severity: 'MEDIUM',
          table: 'patients',
          description: `${invalidPhones.length} pacientes sem telefone`,
          affectedRecords: invalidPhones.length,
          details: invalidPhones
            .slice(0, 5)
            .map((p: any) => ({ id: p.id, name: p.fullName, phone: p.communicationContact?.whatsapp })),
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar formatos:', error)
    }
  }

  // Verificar consistência de datas
  static async checkDateConsistency(issues: IntegrityIssue[]): Promise<void> {
    try {
      const appointments = await prisma.appointment.findMany()
      const medicalRecords = await prisma.medicalRecord.findMany()

      // Verificar consultas com datas futuras muito distantes
      const futureAppointments = appointments.filter((appointment: any) => {
        if (!appointment.date) return false
        const appointmentDate = new Date(appointment.date)
        const oneYearFromNow = new Date()
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
        return appointmentDate > oneYearFromNow
      })

      if (futureAppointments.length > 0) {
        issues.push({
          type: 'INVALID_FORMAT',
          severity: 'MEDIUM',
          table: 'appointments',
          description: `${futureAppointments.length} consultas agendadas para mais de 1 ano no futuro`,
          affectedRecords: futureAppointments.length,
          details: futureAppointments
            .slice(0, 5)
            .map((a: any) => ({
              id: a.id,
              date: a.date,
              patientId: a.patientId,
            })),
        })
      }

      // Verificar prontuários com datas futuras
      const futureMedicalRecords = medicalRecords.filter((record: any) => {
        if (!record.date) return false
        const recordDate = new Date(record.date)
        const today = new Date()
        return recordDate > today
      })

      if (futureMedicalRecords.length > 0) {
        issues.push({
          type: 'INVALID_FORMAT',
          severity: 'HIGH',
          table: 'medicalRecords',
          description: `${futureMedicalRecords.length} prontuários com datas futuras`,
          affectedRecords: futureMedicalRecords.length,
          details: futureMedicalRecords
            .slice(0, 5)
            .map((r: any) => ({
              id: r.id,
              date: r.date,
              patientId: r.patientId,
            })),
        })
      }
    } catch (error) {
      console.error('❌ Erro ao verificar datas:', error)
    }
  }

  // Verificar integridade referencial
  static async checkReferentialIntegrity(
    issues: IntegrityIssue[]
  ): Promise<void> {
    try {
      // Esta verificação já é feita pelas outras funções de órfãos
      // Aqui podemos adicionar verificações adicionais se necessário
    } catch (error) {
      console.error('❌ Erro ao verificar integridade referencial:', error)
    }
  }

  // Gerar recomendações baseadas nos problemas encontrados
  static generateRecommendations(
    issues: IntegrityIssue[],
    recommendations: string[]
  ): void {
    const criticalIssues = issues.filter(issue => issue.severity === 'CRITICAL')
    const highIssues = issues.filter(issue => issue.severity === 'HIGH')
    const mediumIssues = issues.filter(issue => issue.severity === 'MEDIUM')

    if (criticalIssues.length > 0) {
      recommendations.push(
        '🚨 AÇÃO IMEDIATA NECESSÁRIA: Problemas críticos detectados que podem causar perda de dados'
      )
      recommendations.push(
        '📞 Entre em contato com o suporte técnico imediatamente'
      )
      recommendations.push(
        '💾 Execute um backup completo antes de fazer qualquer alteração'
      )
    }

    if (highIssues.length > 0) {
      recommendations.push('⚠️ Problemas de alta prioridade detectados')
      recommendations.push(
        '🔧 Agende manutenção para corrigir os problemas identificados'
      )
    }

    if (mediumIssues.length > 0) {
      recommendations.push('📋 Considere limpar dados órfãos e duplicados')
      recommendations.push(
        '✅ Implemente validações mais rigorosas nos formulários'
      )
    }

    if (issues.length === 0) {
      recommendations.push('✅ Banco de dados está íntegro e saudável')
      recommendations.push('📅 Continue executando verificações regulares')
    }

    recommendations.push('🔄 Execute esta verificação semanalmente')
    recommendations.push('💾 Mantenha backups regulares e atualizados')
  }

  // Determinar status geral baseado nos problemas
  static determineOverallStatus(
    issues: IntegrityIssue[]
  ): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
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
  static async autoFixIssues(
    issueTypes: string[]
  ): Promise<{ fixed: number; errors: string[] }> {
    let fixed = 0
    const errors: string[] = []

    try {
      // Para sistema baseado em arquivos, não é possível fazer correções automáticas
      // As correções devem ser feitas manualmente nos arquivos JSON
      errors.push(
        'Correção automática não disponível para sistema baseado em arquivos'
      )

      console.log(
        '⚠️ Sistema baseado em arquivos - correções manuais necessárias'
      )
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Erro desconhecido'
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
        data: report,
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Ação inválida. Use: check',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('❌ ERRO COMPLETO NA API DE INTEGRIDADE:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro na verificação de integridade',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'autofix') {
      // Para sistema baseado em arquivos, implementar correções básicas
      const report = await DataIntegritySystem.performIntegrityCheck()

      return NextResponse.json({
        success: true,
        message:
          'Verificação de integridade executada (correção automática não disponível para sistema de arquivos)',
        data: {
          ...report,
          autoFixApplied: false,
          reason: 'Sistema baseado em arquivos - correções manuais necessárias',
        },
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Ação inválida. Use: autofix',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('❌ Erro na API POST de integridade:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro na operação de integridade',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
