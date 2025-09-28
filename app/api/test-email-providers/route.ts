import { NextRequest, NextResponse } from 'next/server'
import { EmailProviderManager, EMAIL_PROVIDERS } from '../../../lib/email-providers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando conectividade dos provedores de email...')
    
    const manager = EmailProviderManager.getInstance()
    const results = []
    
    // Testar cada provedor individualmente
    for (const provider of EMAIL_PROVIDERS) {
      console.log(`\n📧 Testando provedor: ${provider.name}`)
      
      try {
        const isConnected = await provider.testConnection()
        const isConfigured = manager['isProviderConfigured'](provider)
        
        results.push({
          name: provider.name,
          priority: provider.priority,
          configured: isConfigured,
          connected: isConnected,
          status: isConnected ? 'OK' : 'FAILED',
          host: provider.config.host,
          port: provider.config.port
        })
        
        console.log(`${isConnected ? '✅' : '❌'} ${provider.name}: ${isConnected ? 'Conectado' : 'Falhou'}`)
        
      } catch (error) {
        results.push({
          name: provider.name,
          priority: provider.priority,
          configured: false,
          connected: false,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          host: provider.config.host,
          port: provider.config.port
        })
        
        console.log(`❌ ${provider.name}: Erro - ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }
    
    // Encontrar o melhor provedor disponível
    const bestProvider = await manager.findBestProvider()
    
    // Status geral do sistema
    const workingProviders = results.filter(r => r.connected).length
    const configuredProviders = results.filter(r => r.configured).length
    
    const systemStatus = {
      overall: workingProviders > 0 ? 'HEALTHY' : 'CRITICAL',
      workingProviders,
      configuredProviders,
      totalProviders: EMAIL_PROVIDERS.length,
      bestProvider: bestProvider?.name || 'NONE',
      timestamp: new Date().toISOString()
    }
    
    console.log(`\n📊 Status do sistema: ${systemStatus.overall}`)
    console.log(`✅ Provedores funcionando: ${workingProviders}/${EMAIL_PROVIDERS.length}`)
    console.log(`⚙️ Provedores configurados: ${configuredProviders}/${EMAIL_PROVIDERS.length}`)
    console.log(`🏆 Melhor provedor: ${systemStatus.bestProvider}`)
    
    return NextResponse.json({
      success: true,
      systemStatus,
      providers: results,
      recommendations: generateRecommendations(results)
    })
    
  } catch (error) {
    console.error('❌ Erro ao testar provedores de email:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      systemStatus: {
        overall: 'ERROR',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

function generateRecommendations(results: any[]): string[] {
  const recommendations = []
  
  const workingProviders = results.filter(r => r.connected)
  const configuredProviders = results.filter(r => r.configured)
  
  if (workingProviders.length === 0) {
    recommendations.push('🚨 CRÍTICO: Nenhum provedor de email está funcionando!')
    recommendations.push('📧 Configure pelo menos um provedor: Gmail, Postmark, Mailgun ou SendGrid')
  }
  
  if (workingProviders.length === 1) {
    recommendations.push('⚠️ AVISO: Apenas um provedor está funcionando. Configure backups para maior confiabilidade.')
  }
  
  if (configuredProviders.length < EMAIL_PROVIDERS.length) {
    const unconfigured = EMAIL_PROVIDERS.filter(p => 
      !results.find(r => r.name === p.name && r.configured)
    ).map(p => p.name)
    
    recommendations.push(`⚙️ Configure provedores adicionais para backup: ${unconfigured.join(', ')}`)
  }
  
  // Recomendações específicas por provedor
  const gmailResult = results.find(r => r.name === 'gmail')
  if (gmailResult && !gmailResult.connected && gmailResult.configured) {
    recommendations.push('📧 Gmail: Verifique se a senha de app está correta e se a verificação em 2 etapas está ativa')
  }
  
  const postmarkResult = results.find(r => r.name === 'postmark')
  if (!postmarkResult?.configured) {
    recommendations.push('🚀 Postmark é recomendado para Railway - configure POSTMARK_SERVER_TOKEN')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Sistema de email está funcionando corretamente!')
  }
  
  return recommendations
}

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json()
    
    if (!testEmail) {
      return NextResponse.json({
        success: false,
        error: 'Email de teste é obrigatório'
      }, { status: 400 })
    }
    
    console.log(`📧 Enviando email de teste para: ${testEmail}`)
    
    const manager = EmailProviderManager.getInstance()
    const transporter = await manager.createTransporter()
    
    if (!transporter) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum provedor de email disponível'
      }, { status: 500 })
    }
    
    const mailOptions = {
      from: `"Sistema de Testes" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: '🧪 Teste de Conectividade - Sistema de Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">✅ Teste de Email Bem-sucedido!</h2>
          <p>Este é um email de teste para verificar a conectividade do sistema.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>📊 Informações do Teste:</h3>
            <ul>
              <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
              <li><strong>Provedor:</strong> ${manager['currentProvider']?.name || 'Desconhecido'}</li>
              <li><strong>Status:</strong> Funcionando ✅</li>
            </ul>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Este email foi enviado automaticamente pelo sistema de testes do Dr. João Vitor Viana.
          </p>
        </div>
      `
    }
    
    await transporter.sendMail(mailOptions)
    
    console.log('✅ Email de teste enviado com sucesso!')
    
    return NextResponse.json({
      success: true,
      message: 'Email de teste enviado com sucesso',
      provider: manager['currentProvider']?.name,
      sentTo: testEmail,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de teste:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}