#!/usr/bin/env node

/**
 * Script para verificar variáveis de ambiente necessárias
 * Usado para diagnosticar problemas de configuração no Railway
 */

console.log('🔍 Verificando Variáveis de Ambiente...\n')

// Variáveis críticas para email
const emailVars = {
  'EMAIL_HOST': process.env.EMAIL_HOST,
  'EMAIL_PORT': process.env.EMAIL_PORT,
  'EMAIL_USER': process.env.EMAIL_USER,
  'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  'EMAIL_FROM': process.env.EMAIL_FROM
}

// Variáveis críticas para Telegram
const telegramVars = {
  'TELEGRAM_BOT_TOKEN': process.env.TELEGRAM_BOT_TOKEN,
  'TELEGRAM_CHAT_ID': process.env.TELEGRAM_CHAT_ID
}

// Outras variáveis importantes
const otherVars = {
  'NODE_ENV': process.env.NODE_ENV,
  'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL
}

function checkVariables(vars, category) {
  console.log(`📋 ${category}:`)
  let allConfigured = true
  
  for (const [key, value] of Object.entries(vars)) {
    const status = value ? '✅' : '❌'
    const displayValue = value ? 
      (key.includes('PASSWORD') || key.includes('TOKEN') ? '***CONFIGURADO***' : value) : 
      'NÃO CONFIGURADO'
    
    console.log(`  ${status} ${key}: ${displayValue}`)
    
    if (!value) {
      allConfigured = false
    }
  }
  
  console.log('')
  return allConfigured
}

// Verificar todas as categorias
const emailOk = checkVariables(emailVars, 'Configurações de Email')
const telegramOk = checkVariables(telegramVars, 'Configurações de Telegram')
const otherOk = checkVariables(otherVars, 'Outras Configurações')

// Resumo final
console.log('📊 RESUMO:')
console.log(`  Email: ${emailOk ? '✅ Configurado' : '❌ Incompleto'}`)
console.log(`  Telegram: ${telegramOk ? '✅ Configurado' : '❌ Incompleto'}`)
console.log(`  Outras: ${otherOk ? '✅ Configurado' : '❌ Incompleto'}`)

if (emailOk && telegramOk) {
  console.log('\n🎉 Todas as variáveis críticas estão configuradas!')
} else {
  console.log('\n⚠️  Algumas variáveis críticas não estão configuradas.')
  console.log('   Isso pode causar falhas nos sistemas de email e Telegram.')
}

// Teste de conectividade (se as variáveis estão configuradas)
if (emailOk) {
  console.log('\n🧪 Testando configuração de email...')
  try {
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
      },
    })
    
    // Verificar configuração sem enviar email
    transporter.verify((error, success) => {
      if (error) {
        console.log('❌ Erro na configuração de email:', error.message)
      } else {
        console.log('✅ Configuração de email válida!')
      }
    })
  } catch (error) {
    console.log('❌ Erro ao testar email:', error.message)
  }
}

if (telegramOk) {
  console.log('\n🧪 Testando configuração do Telegram...')
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  
  fetch(`https://api.telegram.org/bot${token}/getMe`)
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        console.log(`✅ Bot Telegram conectado: @${data.result.username}`)
      } else {
        console.log('❌ Erro na configuração do Telegram:', data.description)
      }
    })
    .catch(error => {
      console.log('❌ Erro ao testar Telegram:', error.message)
    })
}

console.log('\n' + '='.repeat(60))
console.log('🔧 Para configurar no Railway:')
console.log('1. Acesse: https://railway.app/project/55e5b00b-05de-4241-baa3-437a2c5c630b')
console.log('2. Vá em Variables')
console.log('3. Adicione as variáveis que estão marcadas como ❌')
console.log('='.repeat(60))