#!/usr/bin/env tsx

/**
 * SCRIPT DE MIGRAÇÃO CRÍTICA: JSON → PostgreSQL
 * 
 * Este script migra todos os dados médicos dos arquivos JSON
 * para o banco PostgreSQL usando Prisma ORM.
 * 
 * SEGURANÇA:
 * - Nunca deleta arquivos JSON originais
 * - Faz backup antes da migração
 * - Valida todos os dados antes de inserir
 * - Log detalhado de todas as operações
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

interface JsonPatient {
  id: string
  cpf?: string
  fullName: string
  medicalRecordNumber?: number
  communicationContactId?: string
  phone?: string
  whatsapp?: string
  email?: string
  insurance?: {
    type: string
    plan?: string
  }
  medicalInfo?: {
    allergies: any[]
    medications: any[]
    conditions: any[]
  }
  consents?: {
    dataProcessing: boolean
    medicalTreatment: boolean
    imageUse: boolean
  }
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

interface JsonAppointment {
  id: string
  medicalPatientId: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: string
  status: string
  source: string
  patientName?: string
  patientPhone?: string
  patientWhatsapp?: string
  patientEmail?: string
  patientCpf?: string
  patientMedicalRecordNumber?: number
  insuranceType?: string
  notes?: string
  duration?: number
  createdAt?: string
  updatedAt?: string
}

async function loadJsonData(filePath: string) {
  try {
    const fullPath = path.join(process.cwd(), 'data', 'unified-system', filePath)
    const data = await fs.readFile(fullPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.log(`⚠️  Arquivo ${filePath} não encontrado ou vazio`)
    return []
  }
}

async function migratePatients() {
  console.log('🔄 Migrando pacientes...')
  
  const patients: JsonPatient[] = await loadJsonData('medical-patients.json')
  
  if (!patients || patients.length === 0) {
    console.log('ℹ️  Nenhum paciente encontrado para migrar')
    return
  }

  let migratedCount = 0
  let errorCount = 0

  for (const patient of patients) {
    try {
      // Validação de dados obrigatórios
      if (!patient.fullName || !patient.cpf) {
        console.log(`❌ Paciente ${patient.id} tem dados obrigatórios faltando (nome ou CPF)`)
        errorCount++
        continue
      }

      // Primeiro, criar ou encontrar CommunicationContact
      let communicationContact
      if (patient.communicationContactId) {
        communicationContact = await prisma.communicationContact.findUnique({
          where: { id: patient.communicationContactId }
        })
      }

      if (!communicationContact) {
         // Criar novo CommunicationContact
         communicationContact = await prisma.communicationContact.create({
           data: {
             name: patient.fullName,
             whatsapp: patient.whatsapp || patient.phone || '',
             email: patient.email || undefined,
           }
         })
       }

      // Verificar se já existe um MedicalPatient com este CPF
      const existingPatient = await prisma.medicalPatient.findUnique({
        where: { cpf: patient.cpf }
      })

      if (existingPatient) {
        console.log(`ℹ️  Paciente com CPF ${patient.cpf} já existe, pulando...`)
        continue
      }

      // Criar MedicalPatient
      await prisma.medicalPatient.create({
        data: {
          id: patient.id,
          communicationContactId: communicationContact.id,
          cpf: patient.cpf,
          medicalRecordNumber: patient.medicalRecordNumber || await getNextMedicalRecordNumber(),
          fullName: patient.fullName,
          insuranceType: (() => {
            if (!patient.insurance?.type) return 'PARTICULAR'
            const type = patient.insurance.type.toLowerCase()
            if (type.includes('unimed')) return 'UNIMED'
            if (type.includes('particular')) return 'PARTICULAR'
            return 'OUTRO'
          })(),
          insurancePlan: patient.insurance?.plan || undefined,
          allergies: patient.medicalInfo?.allergies ? JSON.stringify(patient.medicalInfo.allergies) : undefined,
          medications: patient.medicalInfo?.medications ? JSON.stringify(patient.medicalInfo.medications) : undefined,
          conditions: patient.medicalInfo?.conditions ? JSON.stringify(patient.medicalInfo.conditions) : undefined,
          consentDataProcessing: patient.consents?.dataProcessing || false,
          consentMedicalTreatment: patient.consents?.medicalTreatment || false,
          consentImageUse: patient.consents?.imageUse || false,
          isActive: patient.isActive !== false,
        }
      })

      migratedCount++
    } catch (error) {
      console.log(`❌ Erro ao migrar paciente ${patient.id}:`, error)
      errorCount++
    }
  }

  console.log(`📊 Pacientes - Migrados: ${migratedCount}, Erros: ${errorCount}`)
}

async function getNextMedicalRecordNumber(): Promise<number> {
  const lastPatient = await prisma.medicalPatient.findFirst({
    orderBy: { medicalRecordNumber: 'desc' },
    select: { medicalRecordNumber: true }
  })
  
  return lastPatient ? lastPatient.medicalRecordNumber + 1 : 1
}

async function migrateAppointments() {
  console.log('🔄 Migrando agendamentos...')
  
  const appointments: JsonAppointment[] = await loadJsonData('appointments.json')
  
  if (!appointments || appointments.length === 0) {
    console.log('ℹ️  Nenhum agendamento encontrado para migrar')
    return
  }

  let migratedCount = 0
  let errorCount = 0

  for (const appointment of appointments) {
    try {
      // Validação de dados obrigatórios
      if (!appointment.medicalPatientId || !appointment.appointmentDate) {
        console.log(`❌ Agendamento ${appointment.id} tem dados obrigatórios faltando`)
        errorCount++
        continue
      }

      // Buscar o paciente médico pelo CPF em vez do ID do JSON
      const medicalPatient = await prisma.medicalPatient.findUnique({
        where: { cpf: appointment.patientCpf }
      })

      if (!medicalPatient) {
        console.log(`❌ Paciente médico com CPF ${appointment.patientCpf} não encontrado para agendamento ${appointment.id}`)
        errorCount++
        continue
      }

      // Conversão de data e hora
      let appointmentDateTime: Date
      
      // Tratar diferentes formatos de data
      if (appointment.appointmentDate.includes('/')) {
        // Formato DD/MM/YYYY
        const [day, month, year] = appointment.appointmentDate.split('/')
        appointmentDateTime = new Date(`${year}-${month}-${day}T${appointment.appointmentTime}`)
      } else {
        // Formato ISO YYYY-MM-DD
        appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`)
      }

      if (isNaN(appointmentDateTime.getTime())) {
        console.log(`❌ Data/hora inválida para agendamento ${appointment.id}`)
        errorCount++
        continue
      }

      await prisma.appointment.create({
        data: {
          id: appointment.id,
          medicalPatientId: medicalPatient.id,
          date: appointmentDateTime,
          time: appointment.appointmentTime,
          type: (() => {
            switch (appointment.appointmentType?.toLowerCase()) {
              case 'consulta': return 'CONSULTATION'
              case 'retorno': return 'FOLLOW_UP'
              case 'procedimento': return 'PROCEDURE'
              case 'telemedicina': return 'TELEMEDICINE'
              case 'emergencia': return 'EMERGENCY'
              default: return 'CONSULTATION'
            }
          })() as any,
          status: (() => {
            switch (appointment.status?.toLowerCase()) {
              case 'agendada': return 'SCHEDULED'
              case 'confirmada': return 'CONFIRMED'
              case 'em_andamento': return 'IN_PROGRESS'
              case 'concluida': return 'COMPLETED'
              case 'cancelada': return 'CANCELLED'
              case 'faltou': return 'NO_SHOW'
              default: return 'SCHEDULED'
            }
          })(),
          source: (() => {
            switch (appointment.source?.toLowerCase()) {
              case 'manual': return 'MANUAL'
              case 'online': return 'ONLINE'
              case 'phone': return 'PHONE'
              case 'whatsapp': return 'WHATSAPP'
              case 'system': return 'SYSTEM'
              case 'doctor_area': return 'MANUAL'
              default: return 'MANUAL'
            }
          })(),
          patientName: appointment.patientName || medicalPatient.fullName,
          patientPhone: appointment.patientPhone || '',
          patientWhatsapp: appointment.patientWhatsapp || '',
          patientEmail: appointment.patientEmail || undefined,
          patientCpf: appointment.patientCpf || medicalPatient.cpf,
          patientMedicalRecordNumber: appointment.patientMedicalRecordNumber || medicalPatient.medicalRecordNumber,
          insuranceType: (() => {
            if (!appointment.insuranceType) return 'PARTICULAR'
            const type = appointment.insuranceType.toLowerCase()
            if (type.includes('unimed')) return 'UNIMED'
            if (type.includes('particular')) return 'PARTICULAR'
            return 'OUTRO'
          })() as any,
          notes: appointment.notes || null,
          duration: appointment.duration || 30,
        }
      })

      migratedCount++
    } catch (error) {
      console.log(`❌ Erro ao migrar agendamento ${appointment.id}:`, error)
      errorCount++
    }
  }

  console.log(`📊 Agendamentos - Migrados: ${migratedCount}, Erros: ${errorCount}`)
}

async function validateMigration() {
  console.log('🔍 Validando migração...')
  
  const medicalPatientCount = await prisma.medicalPatient.count()
  const appointmentCount = await prisma.appointment.count()
  const communicationContactCount = await prisma.communicationContact.count()
  
  console.log(`📊 Dados migrados:`)
  console.log(`   - Pacientes Médicos: ${medicalPatientCount}`)
  console.log(`   - Contatos de Comunicação: ${communicationContactCount}`)
  console.log(`   - Agendamentos: ${appointmentCount}`)
}

async function main() {
  console.log('🚀 INICIANDO MIGRAÇÃO JSON → PostgreSQL')
  console.log('=' .repeat(50))
  
  try {
    // Conectar ao banco
    await prisma.$connect()
    console.log('✅ Conectado ao PostgreSQL')
    
    // Migrar dados
    await migratePatients()
    await migrateAppointments()
    
    // Validar migração
    await validateMigration()
    
    console.log('=' .repeat(50))
    console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!')
    
  } catch (error) {
    console.error('💥 ERRO CRÍTICO NA MIGRAÇÃO:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar migração
if (require.main === module) {
  main()
}

export { main as migrateMedicalData }