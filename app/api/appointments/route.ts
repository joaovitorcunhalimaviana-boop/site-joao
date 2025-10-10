import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limiter'
import { prisma } from '@/lib/prisma'
import { sendTelegramAppointmentNotification, AppointmentNotificationData } from '@/lib/telegram-notifications'

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key'

// Função para verificar autenticação
async function verifyAuth() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch (error) {
    return null
  }
}

// GET - Listar agendamentos
export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.APPOINTMENTS,
    async () => {
      try {
        const auth = await verifyAuth()

        if (!auth) {
          return NextResponse.json(
            { success: false, error: 'Acesso negado' },
            { status: 401 }
          )
        }

        // Buscar consultas do PostgreSQL
        const consultas = await prisma.appointment.findMany({
          include: {
            medicalPatient: {
              select: {
                id: true,
                fullName: true,
              },
            },
            communicationContact: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { appointmentDate: 'desc' },
        })

        const appointments = consultas.map(consulta => ({
          id: consulta.id,
          patientId: consulta.medicalPatientId || consulta.communicationContactId,
          patientName: consulta.medicalPatient?.fullName || consulta.communicationContact?.name || 'Não informado',
          appointmentDate: consulta.appointmentDate,
          appointmentTime: consulta.appointmentTime,
          appointmentType: consulta.type,
          status: consulta.status,
          notes: consulta.notes,
        }))

        return NextResponse.json({
          success: true,
          appointments,
        })
      } catch (error) {
        console.error('❌ [API] Error listing appointments:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
        return NextResponse.json(
          { success: false, error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'APPOINTMENTS_LIST_ACCESS',
      resourceName: 'Appointments API',
    }
  )
}

// POST - Criar novo agendamento
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.APPOINTMENTS,
    async () => {
      try {
        const auth = await verifyAuth()

        if (!auth) {
          return NextResponse.json(
            { success: false, error: 'Acesso negado' },
            { status: 401 }
          )
        }

        const { patientId, patientName, patientPhone, patientWhatsapp, patientEmail, patientCpf, patientBirthDate, insuranceType, insurancePlan, date, time, type, notes } =
          await request.json()

        if (!patientId || !patientName || !date || !time || !type) {
          return NextResponse.json(
            { success: false, error: 'Dados obrigatórios não fornecidos' },
            { status: 400 }
          )
        }

        // Verificar se o paciente existe como MedicalPatient ou CommunicationContact
        let medicalPatient = await prisma.medicalPatient.findUnique({
          where: { id: patientId },
        })

        let communicationContact = null
        if (!medicalPatient) {
          communicationContact = await prisma.communicationContact.findUnique({
            where: { id: patientId },
          })
        }

        // Se não existir, criar novo contato de comunicação
        if (!medicalPatient && !communicationContact && (patientPhone || patientWhatsapp)) {
          communicationContact = await prisma.communicationContact.create({
            data: {
              name: patientName,
              email: patientEmail || undefined,
              whatsapp: patientWhatsapp || patientPhone || undefined,
              birthDate: patientBirthDate || undefined,
            },
          })
        }

        if (!medicalPatient && !communicationContact) {
          return NextResponse.json(
            { success: false, error: 'Paciente não encontrado e dados insuficientes para criar novo paciente' },
            { status: 400 }
          )
        }

        // Criar nova consulta
        const newConsulta = await prisma.appointment.create({
          data: {
            medicalPatientId: medicalPatient?.id,
            communicationContactId: communicationContact?.id,
            appointmentDate: date,
            appointmentTime: time,
            type: type,
            status: 'SCHEDULED',
            notes,
            insuranceType: insuranceType || 'PARTICULAR',
            insurancePlan: insurancePlan,
          },
          include: {
            medicalPatient: true,
            communicationContact: true,
          },
        })

        // Enviar notificação Telegram
        try {
          const notificationData: AppointmentNotificationData = {
            patientName: patientName,
            patientEmail: patientEmail,
            patientPhone: patientPhone || patientWhatsapp || '',
            patientWhatsapp: patientWhatsapp || patientPhone || '',
            appointmentDate: date,
            appointmentTime: time,
            insuranceType: (insuranceType || 'particular') as 'unimed' | 'particular' | 'outro',
            appointmentType: type,
            source: 'secretary_area',
            notes: notes,
          }

          await sendTelegramAppointmentNotification(notificationData)
          console.log('✅ [API /appointments] Notificação Telegram enviada')
        } catch (notifError) {
          console.error('⚠️ [API /appointments] Erro ao enviar notificação Telegram:', notifError)
          // Não bloqueia criação do agendamento
        }

        const newAppointment = {
          id: newConsulta.id,
          patientId: newConsulta.medicalPatientId || newConsulta.communicationContactId,
          patientName: newConsulta.medicalPatient?.fullName || newConsulta.communicationContact?.name || patientName,
          appointmentDate: newConsulta.appointmentDate,
          appointmentTime: newConsulta.appointmentTime,
          appointmentType: newConsulta.type,
          status: newConsulta.status,
          notes: newConsulta.notes,
          createdAt: newConsulta.createdAt.toISOString(),
        }

        return NextResponse.json({
          success: true,
          appointment: newAppointment,
        })
      } catch (error) {
        console.error('❌ [API] Error creating appointment:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
        return NextResponse.json(
          { success: false, error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'APPOINTMENT_CREATE',
      resourceName: 'Appointments API',
    }
  )
}

// PUT - Atualizar agendamento
export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAuth()

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 401 }
      )
    }

    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar no PostgreSQL
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        medicalPatient: true,
        communicationContact: true,
      },
    })

    return NextResponse.json({
      success: true,
      appointment: {
        id: updatedAppointment.id,
        patientId: updatedAppointment.medicalPatientId || updatedAppointment.communicationContactId,
        patientName: updatedAppointment.medicalPatient?.fullName || updatedAppointment.communicationContact?.name || 'Não informado',
        appointmentDate: updatedAppointment.appointmentDate,
        appointmentTime: updatedAppointment.appointmentTime,
        appointmentType: updatedAppointment.type,
        status: updatedAppointment.status,
        notes: updatedAppointment.notes,
      },
    })
  } catch (error) {
    console.error('❌ [API] Error updating appointment:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar agendamento
export async function DELETE(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.APPOINTMENTS,
    async () => {
      try {
        const auth = await verifyAuth()

        if (!auth) {
          return NextResponse.json(
            { success: false, error: 'Acesso negado' },
            { status: 401 }
          )
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID do agendamento é obrigatório' },
            { status: 400 }
          )
        }

        // Cancelar no PostgreSQL
        const cancelledAppointment = await prisma.appointment.update({
          where: { id },
          data: { status: 'CANCELLED' },
        })

        return NextResponse.json({
          success: true,
          message: 'Agendamento cancelado com sucesso',
        })
      } catch (error) {
        console.error('❌ [API] Error canceling appointment:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
        return NextResponse.json(
          { success: false, error: 'Erro interno do servidor' },
          { status: 500 }
        )
      }
    },
    {
      auditAction: 'APPOINTMENT_CANCEL',
      resourceName: 'Appointments API',
    }
  )
}
