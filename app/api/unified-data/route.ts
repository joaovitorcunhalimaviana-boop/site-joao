import { NextRequest, NextResponse } from 'next/server'
import { migrateOldData, getAllPatients, cleanupOldFiles } from '@/lib/unified-data-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'migrate':
        console.log('🔄 Iniciando migração de dados para sistema unificado...')
        
        // Executar migração
        migrateOldData()
        
        // Verificar resultado
        const patients = getAllPatients()
        
        return NextResponse.json({
          success: true,
          message: `✅ Migração concluída! ${patients.length} pacientes no sistema unificado.`,
          stats: {
            totalPatients: patients.length,
            withEmail: patients.filter(p => p.email).length,
            subscribed: patients.filter(p => p.emailPreferences.subscribed).length
          }
        })

      case 'status':
        const allPatients = getAllPatients()
        
        return NextResponse.json({
          success: true,
          data: {
            totalPatients: allPatients.length,
            withEmail: allPatients.filter(p => p.email).length,
            subscribed: allPatients.filter(p => p.emailPreferences.subscribed).length,
            sources: {
              newsletter: allPatients.filter(p => p.registrationSources.includes('newsletter')).length,
              appointment: allPatients.filter(p => p.registrationSources.includes('public_scheduling')).length,
              integrated: allPatients.filter(p => p.registrationSources.includes('integrated_emails')).length
            }
          }
        })

      case 'cleanup':
        console.log('🧹 Iniciando limpeza de arquivos antigos...')
        
        // Executar limpeza
        cleanupOldFiles()
        
        return NextResponse.json({
          success: true,
          message: '✅ Limpeza de arquivos antigos concluída!'
        })

      default:
        return NextResponse.json(
          { success: false, message: 'Ação não reconhecida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Erro na API unified-data:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'status') {
      const patients = getAllPatients()
      
      return NextResponse.json({
        success: true,
        data: {
          totalPatients: patients.length,
          withEmail: patients.filter(p => p.email).length,
          subscribed: patients.filter(p => p.emailPreferences.subscribed).length,
          sources: {
            newsletter: patients.filter(p => p.registrationSources.includes('newsletter')).length,
            appointment: patients.filter(p => p.registrationSources.includes('public_scheduling')).length,
            integrated: patients.filter(p => p.registrationSources.includes('integrated_emails')).length
          }
        }
      })
    }

    return NextResponse.json(
      { success: false, message: 'Ação não especificada' },
      { status: 400 }
    )
  } catch (error) {
    console.error('❌ Erro na API unified-data GET:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      },
      { status: 500 }
    )
  }
}