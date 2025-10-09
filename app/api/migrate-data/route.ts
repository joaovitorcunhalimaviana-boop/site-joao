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
          // Verificar se o paciente já existe
          const existingPatient = await prisma.patient.findFirst({
            where: {
              OR: [
                { cpf: patientData.cpf },
                {
                  AND: [
                    { name: patientData.name },
                    { phone: patientData.phone },
                  ],
                },
              ],
            },
          })

          if (existingPatient) {
            console.log(`⚠️ Paciente já existe: ${patientData.name}`)
            continue
          }

          // Criar novo paciente
          await prisma.patient.create({
            data: {
              id: patientData.id,
              name: patientData.name,
              cpf: patientData.cpf,
              email: patientData.email,
              phone: patientData.phone,
              whatsapp: patientData.whatsapp,
              birthDate: patientData.birthDate
                ? new Date(patientData.birthDate)
                : null,
              insuranceType: patientData.insurance?.type || 'particular',
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

          // Verificar se o paciente existe
          const patient = await prisma.patient.findUnique({
            where: { id: appointmentData.patientId },
          })

          if (!patient) {
            console.log(
              `⚠️ Paciente não encontrado para agendamento: ${appointmentData.patientId}`
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
              patientId: appointmentData.patientId,
              date: new Date(
                `${appointmentData.date}T${appointmentData.time}:00`
              ),
              time: appointmentData.time,
              type: type as any,
              status: status as any,
              reason: appointmentData.notes,
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
