#!/usr/bin/env tsx

/**
 * SCRIPT DE TESTE DE CONEXÃO POSTGRESQL
 * 
 * Este script testa a conexão com o banco PostgreSQL
 * antes de executar a migração completa.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 TESTANDO CONEXÃO COM POSTGRESQL')
  console.log('=' .repeat(50))
  
  try {
    // Testar conexão básica
    console.log('⏳ Conectando ao banco...')
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso!')
    
    // Testar query simples
    console.log('⏳ Testando query básica...')
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('✅ Query executada:', result)
    
    // Verificar se as tabelas existem (após migração)
    try {
      console.log('⏳ Verificando tabelas...')
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `
      console.log('📊 Tabelas encontradas:', tables)
    } catch (error) {
      console.log('ℹ️  Tabelas ainda não criadas (normal antes da migração)')
    }
    
    console.log('=' .repeat(50))
    console.log('🎉 TESTE DE CONEXÃO CONCLUÍDO COM SUCESSO!')
    
  } catch (error) {
    console.error('💥 ERRO DE CONEXÃO:', error)
    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:')
    console.log('1. Verificar se DATABASE_URL está correta no .env')
    console.log('2. Verificar se o PostgreSQL está rodando no Railway')
    console.log('3. Verificar conectividade de rede')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste
if (require.main === module) {
  testConnection()
}

export { testConnection }