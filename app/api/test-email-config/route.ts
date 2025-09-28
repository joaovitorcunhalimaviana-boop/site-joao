import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email-service'

/**
 * GET - Verificar configurações de email
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando configurações de email...')
    
    // Verificar variáveis de ambiente
    const emailConfig = {
      EMAIL_HOST: process.env.EMAIL_HOST || 'Não configurado',
      EMAIL_PORT: process.env.EMAIL_PORT || 'Não configurado',
      EMAIL_USER: process.env.EMAIL_USER ? 'Configurado' : 'Não configurado',
      EMAIL_PASS: (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS) ? 'Configurado' : 'Não configurado',
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Não configurado',
      EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || 'Não configurado',
    }
    
    console.log('📧 Configurações de email:', emailConfig)
    
    return NextResponse.json({
      success: true,
      message: 'Configurações de email verificadas',
      config: emailConfig,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Erro ao verificar configurações:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao verificar configurações de email',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

/**
 * POST - Testar envio de email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email é obrigatório para teste'
      }, { status: 400 })
    }
    
    console.log(`🧪 Testando envio de email para: ${email}`)
    
    // Testar envio de email de boas-vindas
    const emailSent = await sendWelcomeEmail({
      name: 'Teste do Sistema',
      email: email,
      birthDate: '1990-01-01'
    })
    
    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `Email de teste enviado com sucesso para ${email}`,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `Falha ao enviar email de teste para ${email}`,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Erro no teste de email:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro no teste de envio de email',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}