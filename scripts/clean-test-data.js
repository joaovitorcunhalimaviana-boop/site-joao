#!/usr/bin/env node

/**
 * Script para limpar todos os dados de teste do sistema médico
 * Remove pacientes, consultas, cirurgias e prontuários
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Arquivos JSON que contêm dados de teste
const DATA_FILES = [
  'data/patients.json',
  'data/unified-appointments.json', 
  'data/surgeries.json'
]

async function cleanDatabase() {
  console.log('🗑️  Iniciando limpeza do banco de dados...')
  
  try {
    // Limpar tabelas em ordem (respeitando foreign keys)
    console.log('📋 Limpando registros médicos...')
    await prisma.medicalRecord.deleteMany({})
    
    console.log('💊 Limpando prescrições...')
    await prisma.prescription.deleteMany({})
    
    console.log('📎 Limpando anexos médicos...')
    await prisma.medicalAttachment.deleteMany({})
    
    console.log('🩺 Limpando consultas...')
    await prisma.consultation.deleteMany({})
    
    console.log('📅 Limpando agendamentos...')
    await prisma.appointment.deleteMany({})
    
    console.log('🧮 Limpando resultados de calculadoras...')
    await prisma.calculatorResult.deleteMany({})
    
    console.log('🔍 Limpando detecções de duplicatas...')
    await prisma.duplicateDetection.deleteMany({})
    
    console.log('👥 Limpando pacientes...')
    await prisma.patient.deleteMany({})
    
    console.log('✅ Banco de dados limpo com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error)
    throw error
  }
}

async function cleanJsonFiles() {
  console.log('📄 Iniciando limpeza dos arquivos JSON...')
  
  for (const filePath of DATA_FILES) {
    const fullPath = path.join(process.cwd(), filePath)
    
    try {
      if (fs.existsSync(fullPath)) {
        console.log(`🗑️  Limpando ${filePath}...`)
        
        // Escrever array vazio no arquivo
        fs.writeFileSync(fullPath, '[]', 'utf8')
        console.log(`✅ ${filePath} limpo com sucesso!`)
      } else {
        console.log(`⚠️  Arquivo ${filePath} não encontrado, pulando...`)
      }
    } catch (error) {
      console.error(`❌ Erro ao limpar ${filePath}:`, error)
      throw error
    }
  }
}

async function verifyCleanup() {
  console.log('🔍 Verificando limpeza...')
  
  try {
    // Verificar banco de dados
    const patientCount = await prisma.patient.count()
    const appointmentCount = await prisma.appointment.count()
    const consultationCount = await prisma.consultation.count()
    const medicalRecordCount = await prisma.medicalRecord.count()
    
    console.log('📊 Contadores do banco de dados:')
    console.log(`   - Pacientes: ${patientCount}`)
    console.log(`   - Agendamentos: ${appointmentCount}`)
    console.log(`   - Consultas: ${consultationCount}`)
    console.log(`   - Prontuários: ${medicalRecordCount}`)
    
    // Verificar arquivos JSON
    console.log('📄 Verificando arquivos JSON:')
    for (const filePath of DATA_FILES) {
      const fullPath = path.join(process.cwd(), filePath)
      if (fs.existsSync(fullPath)) {
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
        console.log(`   - ${filePath}: ${content.length} registros`)
      }
    }
    
    const totalRecords = patientCount + appointmentCount + consultationCount + medicalRecordCount
    
    if (totalRecords === 0) {
      console.log('✅ Sistema completamente limpo! Nenhum dado de teste encontrado.')
    } else {
      console.log('⚠️  Ainda existem alguns dados no sistema.')
    }
    
    return totalRecords === 0
    
  } catch (error) {
    console.error('❌ Erro ao verificar limpeza:', error)
    throw error
  }
}

async function main() {
  console.log('🧹 INICIANDO LIMPEZA COMPLETA DO SISTEMA')
  console.log('=====================================')
  
  try {
    // 1. Limpar banco de dados
    await cleanDatabase()
    
    // 2. Limpar arquivos JSON
    await cleanJsonFiles()
    
    // 3. Verificar limpeza
    const isClean = await verifyCleanup()
    
    console.log('\n🎉 LIMPEZA CONCLUÍDA!')
    console.log('====================')
    
    if (isClean) {
      console.log('✅ O sistema está completamente limpo e pronto para uso.')
      console.log('📝 Todos os dados de teste foram removidos com sucesso.')
    } else {
      console.log('⚠️  Alguns dados ainda podem estar presentes no sistema.')
      console.log('🔍 Verifique os logs acima para mais detalhes.')
    }
    
  } catch (error) {
    console.error('\n❌ ERRO DURANTE A LIMPEZA!')
    console.error('===========================')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar script
if (require.main === module) {
  main()
}

module.exports = { cleanDatabase, cleanJsonFiles, verifyCleanup }