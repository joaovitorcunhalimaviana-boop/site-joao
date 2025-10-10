import { NextRequest, NextResponse } from 'next/server'
import {
  getAllAppointments,
  getAppointmentsByDate,
  updateAppointment,
  createAppointment,
  deleteAppointment,
  getAllPatients,
  getPatientById,
  createOrUpdatePatient,
  getMedicalPatientById,
  getCommunicationContactById,
} from '../../../lib/unified-patient-system-prisma'

// GET - Obter agendamentos, agenda diária ou estatísticas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const date = searchParams.get('date')
    const patientId = searchParams.get('patientId')

    switch (action) {
      case 'all-appointments':
        const allAppointments = await getAllAppointments()
        return NextResponse.json({
          success: true,
          appointments: allAppointments,
        })

      case 'appointments-by-date':
        if (!date) {
          return NextResponse.json(
            { success: false, error: 'Data é obrigatória' },
            { status: 400 }
          )
        }
        const appointmentsByDate = await getAppointmentsByDate(date)
        return NextResponse.json({
          success: true,
          appointments: appointmentsByDate,
        })

      case 'daily-agenda':
        if (!date) {
          return NextResponse.json(
            { success: false, error: 'Data é obrigatória' },
            { status: 400 }
          )
        }
        const dailyAppointments = await getAppointmentsByDate(date)
        return NextResponse.json({ success: true, agenda: dailyAppointments })

      case 'all-patients':
        const allPatients = await getAllPatients()

        // Mapear dados dos pacientes para formato compatível
        const patientsWithContactData = await Promise.all(allPatients.map(async patient => {
          // Buscar dados do contato de comunicação
          const communicationContact = await getCommunicationContactById(patient.communicationContactId)

          return {
            id: patient.id,
            name: patient.fullName,
            cpf: patient.cpf,
            medicalRecordNumber: patient.medicalRecordNumber,
            phone: communicationContact?.whatsapp || '',
            whatsapp: communicationContact?.whatsapp || '',
            email: communicationContact?.email || '',
            birthDate: communicationContact?.birthDate || '',
            insuranceType: patient.insuranceType,
            insurancePlan: patient.insurancePlan,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
          }
        }))

        return NextResponse.json({
          success: true,
          patients: patientsWithContactData,
        })

      case 'appointment-by-id':
        const appointmentId = searchParams.get('appointmentId')
        if (!appointmentId) {
          return NextResponse.json(
            { success: false, error: 'ID do agendamento é obrigatório' },
            { status: 400 }
          )
        }
        const allAppointmentsForId = await getAllAppointments()
        const appointment = allAppointmentsForId.find(
          apt => apt.id === appointmentId
        )
        if (!appointment) {
          return NextResponse.json(
            { success: false, error: 'Agendamento não encontrado' },
            { status: 404 }
          )
        }
        return NextResponse.json({ success: true, appointment })

      case 'patient-by-id':
        if (!patientId) {
          return NextResponse.json(
            { success: false, error: 'ID do paciente é obrigatório' },
            { status: 400 }
          )
        }
        const medicalPatient = await getPatientById(patientId)
        if (!medicalPatient) {
          return NextResponse.json(
            { success: false, error: 'Paciente não encontrado' },
            { status: 404 }
          )
        }

        // Buscar dados do contato de comunicação para campos adicionais
        const patientContact = await getCommunicationContactById(medicalPatient.communicationContactId)

        // Formato unificado com todos os dados necessários
        const unifiedPatient = {
          id: medicalPatient.id,
          name: medicalPatient.fullName,
          fullName: medicalPatient.fullName,
          cpf: medicalPatient.cpf,
          medicalRecordNumber: medicalPatient.medicalRecordNumber,
          phone: patientContact?.whatsapp || '',
          whatsapp: patientContact?.whatsapp || '',
          email: patientContact?.email || '',
          birthDate: patientContact?.birthDate || '',
          insuranceType: medicalPatient.insuranceType,
          insurancePlan: medicalPatient.insurancePlan,
          createdAt: medicalPatient.createdAt,
          updatedAt: medicalPatient.updatedAt,
          isActive: medicalPatient.isActive,
        }

        return NextResponse.json({ success: true, patient: unifiedPatient })

      case 'stats':
        const statsAppointments = await getAllAppointments()
        const statsPatients = await getAllPatients()
        const stats = {
          totalAppointments: statsAppointments.length,
          totalPatients: statsPatients.length,
          appointmentsByStatus: {
            SCHEDULED: statsAppointments.filter(apt => apt.status === 'SCHEDULED')
              .length,
            CONFIRMED: statsAppointments.filter(
              apt => apt.status === 'CONFIRMED'
            ).length,
            CANCELLED: statsAppointments.filter(
              apt => apt.status === 'CANCELLED'
            ).length,
            COMPLETED: statsAppointments.filter(
              apt => apt.status === 'COMPLETED'
            ).length,
            IN_PROGRESS: statsAppointments.filter(
              apt => apt.status === 'IN_PROGRESS'
            ).length,
            NO_SHOW: statsAppointments.filter(
              apt => apt.status === 'NO_SHOW'
            ).length,
          },
        }
        return NextResponse.json({ success: true, stats })

      case 'get-patient':
        const getPatientId = searchParams.get('patientId')
        if (!getPatientId) {
          return NextResponse.json(
            { success: false, error: 'ID do paciente é obrigatório' },
            { status: 400 }
          )
        }

        const getPatient = await getMedicalPatientById(getPatientId)
        if (!getPatient) {
          return NextResponse.json(
            { success: false, error: 'Paciente não encontrado' },
            { status: 404 }
          )
        }

        // Incluir dados do contato de comunicação
        const patientCommunicationContact = await getCommunicationContactById(
          getPatient.communicationContactId
        )

        // Combinar dados do paciente médico com dados de comunicação para compatibilidade com o frontend
        const combinedPatientData = {
          ...getPatient,
          // Campos esperados pelo frontend vindos do CommunicationContact
          name: patientCommunicationContact?.name || getPatient.fullName,
          phone: patientCommunicationContact?.whatsapp || '',
          whatsapp: patientCommunicationContact?.whatsapp || '',
          birthDate: patientCommunicationContact?.birthDate || '',
          // Manter dados originais também
          communicationContact: patientCommunicationContact,
        }

        return NextResponse.json({
          success: true,
          patient: combinedPatientData,
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Erro na API GET:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

// DELETE - Remover consultas canceladas ou excluir agendamento específico
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, appointmentId } = body

    switch (action) {
      case 'delete-appointment':
        if (!appointmentId) {
          return NextResponse.json(
            { success: false, error: 'ID do agendamento é obrigatório' },
            { status: 400 }
          )
        }

        const deleteResult = await deleteAppointment(appointmentId)
        
        if (!deleteResult.success) {
          const statusCode = deleteResult.message.includes('não encontrado') ? 404 : 500
          return NextResponse.json(
            { success: false, error: deleteResult.message },
            { status: statusCode }
          )
        }

        return NextResponse.json({
          success: true,
          message: deleteResult.message,
        })

      case 'remove-cancelled-appointments':
        const allAppointments3 = await getAllAppointments()
        const cancelledAppointments = allAppointments3.filter(
          apt => apt.status === 'CANCELLED'
        )
        const activeAppointments = allAppointments3.filter(
          apt => apt.status !== 'CANCELLED'
        )

        // Salvar apenas os agendamentos não cancelados
        const fs2 = require('fs').promises
        const path2 = require('path')
        const appointmentsPath2 = path2.join(
          process.cwd(),
          'data',
          'unified-appointments.json'
        )

        await fs2.writeFile(
          appointmentsPath2,
          JSON.stringify(activeAppointments, null, 2)
        )

        console.log(
          `🗑️ ${cancelledAppointments.length} consultas canceladas foram removidas`
        )

        return NextResponse.json({
          success: true,
          removedCount: cancelledAppointments.length,
          message: `${cancelledAppointments.length} consultas canceladas foram removidas com sucesso`,
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Erro na API DELETE:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

// POST - Criar agendamento, paciente ou atualizar status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create-appointment':
        const {
          patientId,
          patientName,
          patientPhone,
          patientWhatsapp,
          patientEmail,
          patientBirthDate,
          insuranceType,
          insurancePlan,
          appointmentDate,
          appointmentTime,
          appointmentType,
          source,
          notes,
          createdBy,
        } = body

        if (
          !patientId ||
          !patientName ||
          (!patientPhone && !patientWhatsapp) ||
          !appointmentDate ||
          !appointmentTime
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Campos obrigatórios: ID do Paciente, Nome do Paciente, Telefone ou WhatsApp do Paciente, Data do Agendamento e Horário do Agendamento',
            },
            { status: 400 }
          )
        }

        const appointmentResult = await createAppointment({
          patientId: patientId,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          appointmentType: appointmentType || 'CONSULTATION',
          status: 'SCHEDULED',
          notes: notes,
        })

        return NextResponse.json({
          success: true,
          appointment: appointmentResult,
          message: 'Agendamento criado com sucesso',
        })

      case 'create_patient':
      case 'create-patient':
        const {
          name,
          phone,
          whatsapp,
          email,
          birthDate,
          cpf,
          insurance,
          medicalRecord,
        } = body

        if (!name || !phone) {
          return NextResponse.json(
            { success: false, error: 'Nome e telefone são obrigatórios' },
            { status: 400 }
          )
        }

        // Criar novo paciente usando Prisma service
        const patientData = {
          fullName: name,
          whatsapp: whatsapp || phone,
          email: email,
          birthDate: birthDate,
          cpf: cpf || '',
          insuranceType: insurance?.type || 'PARTICULAR',
          insurancePlan: insurance?.plan,
        }

        const patientResult = await createOrUpdatePatient(patientData)

        return NextResponse.json({
          success: true,
          patient: patientResult,
          message: 'Paciente criado com sucesso',
        })

      case 'update-status':
        const { appointmentId, status, statusNotes } = body

        if (!appointmentId || !status) {
          return NextResponse.json(
            {
              success: false,
              error: 'ID do agendamento e status são obrigatórios',
            },
            { status: 400 }
          )
        }

        const updateResult = await updateAppointment(appointmentId, {
          status: status,
          notes: statusNotes,
        })
        return NextResponse.json(updateResult)

      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Erro na API POST:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

// PUT - Atualizar agendamento ou paciente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'update-appointment-status':
        const { appointmentId, status, notes } = body

        if (!appointmentId || !status) {
          return NextResponse.json(
            {
              success: false,
              error: 'ID do agendamento e status são obrigatórios',
            },
            { status: 400 }
          )
        }

        const result = await updateAppointment(appointmentId, {
          status: status,
          notes: notes,
        })
        return NextResponse.json(result)

      case 'update-appointment':
        const {
          appointmentId: updateId,
          appointmentDate,
          appointmentTime,
          appointmentType,
          notes: updateNotes,
        } = body

        if (
          !updateId ||
          !appointmentDate ||
          !appointmentTime ||
          !appointmentType
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Todos os campos são obrigatórios para atualizar o agendamento',
            },
            { status: 400 }
          )
        }

        const updateResult = await updateAppointment(updateId, {
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          appointmentType: appointmentType,
          notes: updateNotes,
        })
        return NextResponse.json(updateResult)

      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('❌ Erro na API PUT:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
