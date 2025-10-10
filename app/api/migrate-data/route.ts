import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/database'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando migração de dados para o banco de dados...')

    const results = {
      patients: { migrated: 0, errors: 0 },
      appointments: { migrated: 0, errors: 0 },
      total: { migrated: 0, errors: 0 },
    }

    // Migrar pacientes do backup
    try {
      const patientsFile = path.join(process.cwd(), 'data', 'patients.json')
      const patientsData = await fs.readFile(patientsFile, 'utf-8')
      const patients = JSON.parse(patientsData)

      console.log(`📋 Encontrados ${patients.length} pacientes para migrar`)

      for (const patientData of patients) {
        try {
          // Verificar se o paciente médico já existe
          const existingMedicalPatient = await prisma.medicalPatient.findFirst({
            where: {
              cpf: patientData.cpf,
            },
          })

          if (existingMedicalPatient) {
            console.log(`⚠️ Paciente médico já existe: ${patientData.name}`)
            continue
          }

          // Criar ou buscar contato de comunicação
          let communicationContact = await prisma.communicationContact.findFirst({
            where: {
              OR: [
                { email: patientData.email },
                { whatsapp: patientData.phone }
              ]
            }
          })

          if (!communicationContact) {
            communicationContact = await prisma.communicationContact.create({
              data: {
                name: patientData.name,
                email: patientData.email,
                whatsapp: patientData.whatsapp || patientData.phone,
                birthDate: patientData.birthDate,
                createdAt: patientData.createdAt ? new Date(patientData.createdAt) : new Date(),
                updatedAt: patientData.updatedAt ? new Date(patientData.updatedAt) : new Date(),
              }
            })
          }

          // Criar novo paciente médico
          await prisma.medicalPatient.create({
            data: {
              id: patientData.id,
              communicationContactId: communicationContact.id,
              cpf: patientData.cpf,
              fullName: patientData.name,
              insuranceType: patientData.insurance?.type || 'PARTICULAR',
              insurancePlan: patientData.insurance?.plan,
              createdAt: patientData.createdAt
                ? new Date(patientData.createdAt)
                : new Date(),
              updatedAt: patientData.updatedAt
                ? new Date(patientData.updatedAt)
                : new Date(),
            },
          })

          results.patients.migrated++
          console.log(`✅ Paciente migrado: ${patientData.name}`)
        } catch (error) {
          console.error(
            `❌ Erro ao migrar paciente ${patientData.name}:`,
            error
          )
          results.patients.errors++
        }
      }
    } catch (error) {
      console.error('❌ Erro ao ler arquivo de pacientes:', error)
    }

    // Migrar agendamentos do backup
    try {
      const appointmentsFile = path.join(
        process.cwd(),
        'data',
        'unified-appointments.json'
      )
      const appointmentsData = await fs.readFile(appointmentsFile, 'utf-8')
      const appointments = JSON.parse(appointmentsData)

      console.log(
        `📅 Encontrados ${appointments.length} agendamentos para migrar`
      )

      for (const appointmentData of appointments) {
        try {
          // Verificar se o agendamento já existe
          const existingAppointment = await prisma.appointment.findUnique({
            where: { id: appointmentData.id },
          })

          if (existingAppointment) {
            console.log(`⚠️ Agendamento já existe: ${appointmentData.id}`)
            continue
          }

          // Verificar se o paciente médico existe
          const medicalPatient = await prisma.medicalPatient.findUnique({
            where: { id: appointmentData.patientId },
          })

          if (!medicalPatient) {
            console.log(
              `⚠️ Paciente médico não encontrado para agendamento: ${appointmentData.patientId}`
            )
            results.appointments.errors++
            continue
          }

          // Mapear status do sistema antigo para o novo
          let status = 'SCHEDULED'
          switch (appointmentData.status) {
            case 'agendada':
              status = 'SCHEDULED'
              break
            case 'confirmada':
              status = 'CONFIRMED'
              break
            case 'cancelada':
              status = 'CANCELLED'
              break
            case 'concluida':
              status = 'COMPLETED'
              break
          }

          // Mapear tipo do agendamento
          let type = 'CONSULTATION'
          switch (appointmentData.type) {
            case 'consulta':
              type = 'CONSULTATION'
              break
            case 'retorno':
              type = 'FOLLOW_UP'
              break
            case 'procedimento':
              type = 'PROCEDURE'
              break
            case 'telemedicina':
              type = 'TELEMEDICINE'
              break
          }

          // Criar novo agendamento
          await prisma.appointment.create({
            data: {
              id: appointmentData.id,
              medicalPatientId: appointmentData.patientId,
              communicationContactId: medicalPatient.communicationContactId,
              appointmentDate: appointmentData.date,
              appointmentTime: appointmentData.time,
              type: type as any,
              status: status as any,
              notes: appointmentData.notes,
              createdAt: appointmentData.createdAt
                ? new Date(appointmentData.createdAt)
                : new Date(),
              updatedAt: appointmentData.updatedAt
                ? new Date(appointmentData.updatedAt)
                : new Date(),
            },
          })

          results.appointments.migrated++
          console.log(`✅ Agendamento migrado: ${appointmentData.id}`)
        } catch (error) {
          console.error(
            `❌ Erro ao migrar agendamento ${appointmentData.id}:`,
            error
          )
          results.appointments.errors++
        }
      }
    } catch (error) {
      console.error('❌ Erro ao ler arquivo de agendamentos:', error)
    }

    // Calcular totais
    results.total.migrated =
      results.patients.migrated + results.appointments.migrated
    results.total.errors = results.patients.errors + results.appointments.errors

    console.log('📊 Resultado da migração:', results)

    return NextResponse.json({
      success: true,
      message: 'Migração concluída',
      results,
    })
  } catch (error) {
    console.error('❌ Erro geral na migração:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
