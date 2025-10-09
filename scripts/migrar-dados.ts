import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

interface PacienteJSON {
  id?: string
  nomeCompleto?: string
  name?: string
  dataNascimento?: string
  birthDate?: string
  cpf?: string
  telefone?: string
  phone?: string
  whatsapp?: string
  email?: string
  planoSaude?: string
  insurance?: string
  consultas?: any[]
  // ... outros campos que você tiver no JSON
}

interface ConsultaJSON {
  id?: string
  patientId?: string
  pacienteId?: string
  date?: string
  dataConsulta?: string
  time?: string
  horaConsulta?: string
  type?: string
  tipoConsulta?: string
  status?: string
  notes?: string
  observacoes?: string
  // ... outros campos
}

async function migrarDados() {
  console.log('🔄 Iniciando migração de dados...\n')
  
  try {
    // 1. ENCONTRAR O BACKUP MAIS RECENTE
    const backupsDir = path.join(process.cwd(), 'data', 'security-backups')
    const backupFiles = await fs.readdir(backupsDir)
    
    if (backupFiles.length === 0) {
      console.log('⚠️  Nenhum backup encontrado na pasta security-backups')
      return
    }
    
    // Ordenar por data (mais recente primeiro)
    const sortedBackups = backupFiles
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a))
    
    const latestBackup = sortedBackups[0]
    const jsonPath = path.join(backupsDir, latestBackup)
    
    console.log(`📖 Usando backup mais recente: ${latestBackup}`)
    
    // 2. LER JSON
    console.log('📖 Lendo dados do backup...')
    const jsonContent = await fs.readFile(jsonPath, 'utf-8')
    const dados = JSON.parse(jsonContent)
    
    const pacientes: PacienteJSON[] = dados.patients || []
    const consultas: ConsultaJSON[] = dados.appointments || []
    console.log(`📊 ${pacientes.length} pacientes encontrados`)
    console.log(`📊 ${consultas.length} consultas encontradas\n`)
    
    if (pacientes.length === 0 && consultas.length === 0) {
      console.log('⚠️  Nenhum dado encontrado no backup')
      return
    }
    
    // 3. VALIDAR DADOS
    console.log('🔍 Validando dados...')
    const erros: string[] = []
    
    pacientes.forEach((paciente, index) => {
      const nome = paciente.nomeCompleto || paciente.name
      const nascimento = paciente.dataNascimento || paciente.birthDate
      
      if (!nome) {
        erros.push(`Paciente ${index + 1}: Nome completo obrigatório`)
      }
      if (!nascimento) {
        erros.push(`Paciente ${index + 1}: Data de nascimento obrigatória`)
      }
    })
    
    if (erros.length > 0) {
      console.error('❌ Erros encontrados:')
      erros.forEach(erro => console.error(`  - ${erro}`))
      throw new Error('Corrija os erros antes de continuar')
    }
    console.log('✅ Validação concluída\n')
    
    // 4. MIGRAR COM TRANSAÇÃO (tudo ou nada)
    console.log('💾 Migrando para PostgreSQL...')
    let migrados = 0
    
    await prisma.$transaction(async (tx) => {
      // Migrar pacientes
      for (const paciente of pacientes) {
        const nome = paciente.nomeCompleto || paciente.name || ''
        const nascimento = paciente.dataNascimento || paciente.birthDate || ''
        const telefone = paciente.telefone || paciente.phone || null
        const plano = paciente.planoSaude || paciente.insurance || null
        
        // Criar paciente
        const pacienteCriado = await tx.paciente.create({
          data: {
            nomeCompleto: nome,
            dataNascimento: new Date(nascimento),
            cpf: paciente.cpf || null,
            telefone: telefone,
            whatsapp: paciente.whatsapp || null,
            email: paciente.email || null,
            planoSaude: plano,
          }
        })
        
        migrados++
        console.log(`  ✅ ${migrados}/${pacientes.length} - ${nome}`)
      }
      
      // Migrar consultas independentes (se houver)
      let consultasMigradas = 0
      for (const consulta of consultas) {
        const dataConsulta = consulta.date || consulta.dataConsulta
        const horaConsulta = consulta.time || consulta.horaConsulta
        const tipo = consulta.type || consulta.tipoConsulta || 'presencial'
        const observacoes = consulta.notes || consulta.observacoes
        
        if (dataConsulta) {
          // Tentar encontrar o paciente pelo ID
          let pacienteId = consulta.patientId || consulta.pacienteId
          
          if (pacienteId) {
            // Verificar se o paciente existe no banco
            const pacienteExiste = await tx.paciente.findFirst({
              where: { id: pacienteId }
            })
            
            if (pacienteExiste) {
              await tx.consulta.create({
                data: {
                  pacienteId: pacienteId,
                  dataConsulta: new Date(dataConsulta),
                  horaInicio: horaConsulta ? new Date(`${dataConsulta}T${horaConsulta}`) : null,
                  tipoConsulta: tipo,
                  status: consulta.status || 'concluido',
                  observacoes: observacoes,
                }
              })
              
              consultasMigradas++
            }
          }
        }
      }
      
      if (consultasMigradas > 0) {
        console.log(`  ✅ ${consultasMigradas} consultas independentes migradas`)
      }
    })
    
    console.log(`\n🎉 Migração concluída com sucesso!`)
    console.log(`📊 Total migrado: ${migrados} pacientes`)
    console.log(`\n⚠️  IMPORTANTE: NÃO delete o arquivo JSON ainda!`)
    console.log(`   Mantenha o backup por pelo menos 30 dias.`)
    
  } catch (error) {
    console.error('\n❌ Erro durante migração:', error)
    console.error('\n⚠️  NENHUM dado foi alterado (rollback automático)')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar migração
migrarDados()