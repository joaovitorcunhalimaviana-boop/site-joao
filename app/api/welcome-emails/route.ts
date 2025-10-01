import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmailsToNewPatients, sendWelcomeEmailToPatient } from '@/lib/welcome-email-service'
import { getAllPatients } from '@/lib/unified-data-service'

/**
 * GET - Verificar status dos emails de boas-vindas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'status') {
      // Usar sistema unificado
      const allPatients = getAllPatients()
      
      // Contar emails de boas-vindas enviados
      const welcomeEmailsSent = allPatients.filter(patient => 
        patient.welcomeEmailLogs && patient.welcomeEmailLogs.some(log => log.success)
      ).length
      
      const welcomeEmailsFailed = allPatients.filter(patient => 
        patient.welcomeEmailLogs && patient.welcomeEmailLogs.some(log => !log.success)
      ).length
      
      const patientsWithEmail = allPatients.filter(patient => patient.email).length
      
      const stats = {
        totalPatients: patientsWithEmail,
        welcomeEmailsSent,
        welcomeEmailsFailed,
        pendingWelcomeEmails: patientsWithEmail - welcomeEmailsSent,
        lastCheck: new Date().toISOString(),
        registrationSources: {
          newsletter: allPatients.filter(p => p.registrationSources?.includes('newsletter')).length,
          publicScheduling: allPatients.filter(p => p.registrationSources?.includes('public_scheduling')).length,
          medicalArea: allPatients.filter(p => p.registrationSources?.includes('medical_area')).length,
          secretaryArea: allPatients.filter(p => p.registrationSources?.includes('secretary_area')).length
        }
      }
      
      return NextResponse.json({
        success: true,
        stats,
        message: 'Status dos emails de boas-vindas obtido com sucesso'
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Ação não especificada. Use ?action=status'
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro ao obter status dos emails de boas-vindas:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 })
  }
}

/**
 * POST - Enviar emails de boas-vindas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email } = body
    
    if (action === 'send_all') {
      console.log('🔄 Iniciando envio de emails de boas-vindas para todos os novos pacientes...')
      
      const result = await sendWelcomeEmailsToNewPatients()
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message,
          stats: result.stats,
          timestamp: new Date().toISOString()
        })
      } else {
        return NextResponse.json({
          success: false,
          message: result.message,
          stats: result.stats
        }, { status: 400 })
      }
    }
    
    if (action === 'send_single' && email) {
      console.log(`🔄 Enviando email de boas-vindas para: ${email}`)
      
      // Encontrar dados do paciente
      const integratedEmails = readIntegratedEmailData()
      const patientData = integratedEmails.find(e => e.email === email)
      
      if (!patientData) {
        return NextResponse.json({
          success: false,
          message: 'Paciente não encontrado no sistema integrado'
        }, { status: 404 })
      }
      
      const success = await sendWelcomeEmailToPatient(patientData)
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: `Email de boas-vindas enviado com sucesso para ${patientData.name}`,
          timestamp: new Date().toISOString()
        })
      } else {
        return NextResponse.json({
          success: false,
          message: `Falha ao enviar email de boas-vindas para ${patientData.name}`
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'Ação inválida. Use action: "send_all" ou "send_single" com email'
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro ao processar emails de boas-vindas:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 })
  }
}