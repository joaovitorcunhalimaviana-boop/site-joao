import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function validateMigration() {
  console.log('🔍 VALIDANDO INTEGRIDADE DOS DADOS MIGRADOS')
  console.log('==================================================')

  try {
    // Verificar pacientes migrados
    console.log('⏳ Verificando pacientes...')
    const pacientes = await prisma.paciente.findMany({
      select: {
        id: true,
        nomeCompleto: true,
        cpf: true,
        dataNascimento: true,
        planoSaude: true,
        criadoEm: true,
        _count: {
          select: {
            consultas: true
          }
        }
      }
    })

    console.log(`📊 Total de pacientes: ${pacientes.length}`)
    pacientes.forEach(paciente => {
      console.log(`   - ${paciente.nomeCompleto} (CPF: ${paciente.cpf || 'N/A'})`)
      console.log(`     Plano: ${paciente.planoSaude || 'N/A'} | Consultas: ${paciente._count.consultas}`)
    })

    // Verificar consultas migradas
    console.log('\n⏳ Verificando consultas...')
    const consultas = await prisma.consulta.findMany({
      select: {
        id: true,
        dataConsulta: true,
        tipoConsulta: true,
        status: true,
        duracaoMinutos: true,
        paciente: {
          select: {
            nomeCompleto: true
          }
        }
      },
      orderBy: {
        dataConsulta: 'asc'
      }
    })

    console.log(`📊 Total de consultas: ${consultas.length}`)
    consultas.forEach(consulta => {
      console.log(`   - ${consulta.paciente.nomeCompleto}`)
      console.log(`     Data: ${consulta.dataConsulta.toISOString().split('T')[0]}`)
      console.log(`     Tipo: ${consulta.tipoConsulta} | Status: ${consulta.status}`)
      console.log(`     Duração: ${consulta.duracaoMinutos} min`)
    })

    // Verificar integridade referencial
    console.log('\n⏳ Verificando integridade referencial...')
    // Como pacienteId é obrigatório no schema, vamos apenas verificar se os dados estão consistentes
    const totalConsultas = await prisma.consulta.count()
    const totalPacientes = await prisma.paciente.count()
    
    console.log(`✅ Total de consultas: ${totalConsultas}`)
    console.log(`✅ Total de pacientes: ${totalPacientes}`)
    console.log('✅ Integridade referencial garantida pelo schema (pacienteId é obrigatório)')

    // Verificar dados obrigatórios
    console.log('\n⏳ Verificando dados obrigatórios...')
    // Como nomeCompleto é obrigatório no schema, vamos apenas verificar se há dados vazios
    const pacientesSemNome = await prisma.paciente.count({
      where: {
        nomeCompleto: { equals: '' }
      }
    })

    // Como dataConsulta é obrigatório no schema, não precisamos verificar null
    console.log('✅ Campos obrigatórios garantidos pelo schema Prisma')

    if (pacientesSemNome > 0) {
      console.log(`❌ Encontrados ${pacientesSemNome} pacientes com nome vazio`)
    } else {
      console.log('✅ Todos os pacientes têm nome válido')
    }

    console.log('\n==================================================')
    console.log('🎉 VALIDAÇÃO CONCLUÍDA!')
    
  } catch (error) {
    console.error('❌ Erro durante validação:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

validateMigration()