import { NextRequest, NextResponse } from 'next/server'
import { integrateEmailSystems, checkEmailExists } from '@/lib/email-integration'

// GET - Verificar status da integração
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (email) {
      // Verificar se um email específico existe
      const result = await checkEmailExists(email)
      return NextResponse.json({
        success: true,
        email,
        exists: result.exists,
        source: result.source,
        data: result.data
      })
    }
    
    // Retornar status geral
    return NextResponse.json({
      success: true,
      message: 'Sistema de integração de emails ativo',
      endpoints: {
        check: '/api/integrate-emails?email=exemplo@email.com',
        integrate: 'POST /api/integrate-emails'
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar integração:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    )
  }
}

// POST - Executar integração de emails
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando integração manual de emails...')
    
    const result = await integrateEmailSystems()
    
    if (result.success) {
      console.log('✅ Integração concluída com sucesso!')
      return NextResponse.json({
        success: true,
        message: result.message,
        stats: result.stats,
        timestamp: new Date().toISOString()
      })
    } else {
      console.error('❌ Falha na integração:', result.message)
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          stats: result.stats
        },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('❌ Erro na integração de emails:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}