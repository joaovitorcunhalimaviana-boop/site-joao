import { NextRequest, NextResponse } from 'next/server'
import {
  getAllAppointments,
  getAppointmentsByDate,
  updateAppointment,
  createAppointment,
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
        const patientsWithContactData = allPatients.map(patient => {
          return {
            id: patient.id,
            name: patient.fullName,
            cpf: patient.cpf,
            medicalRecordNumber: patient.numeroRegistroMedico,
            phone: patient.telefone || '',
            whatsapp: patient.telefone || '',
            email: patient.email,
            birthDate: patient.dataNascimento,
            insuranceType: patient.insurance?.type,
            insurancePlan: patient.insurance?.plan,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
          }
        })

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

        // Formato unificado com todos os dados necessários
        const unifiedPatient = {
          id: medicalPatient.id,
          name: medicalPatient.fullName,
          fullName: medicalPatient.fullName,
          cpf: medicalPatient.cpf,
          medicalRecordNumber: medicalPatient.numeroRegistroMedico,
          phone: medicalPatient.telefone || '',
          whatsapp: medicalPatient.telefone || '',
          email: medicalPatient.email || '',
          birthDate: medicalPatient.dataNascimento || '',
          insuranceType: medicalPatient.insurance?.type,
          insurancePlan: medicalPatient.insurance?.plan,
          createdAt: medicalPatient.createdAt,
          updatedAt: medicalPatient.updatedAt,
          isActive: medicalPatient.isActive,
          // Dados médicos originais
          insurance: medicalPatient.insurance,
          medicalInfo: medicalPatient.medicalInfo,
          consents: medicalPatient.consents,
        }

        return NextResponse.json({ success: true, patient: unifiedPatient })

      case 'stats':
        const statsAppointments = await getAllAppointments()
        const statsPatients = await getAllPatients()
        const stats = {
          totalAppointments: statsAppointments.length,
          totalPatients: statsPatients.length,
          appointmentsByStatus: {
            agendada: statsAppointments.filter(apt => apt.status === 'agendada')
              .length,
            confirmada: statsAppointments.filter(
              apt => apt.status === 'confirmada'
            ).length,
            cancelada: statsAppointments.filter(
              apt => apt.status === 'cancelada'
            ).length,
            realizada: statsAppointments.filter(
              apt => apt.status === 'concluida'
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

        const deleteAppointments = await getAllAppointments()
        const appointmentExists = deleteAppointments.find(
          apt => apt.id === appointmentId
        )

        if (!appointmentExists) {
          return NextResponse.json(
            { success: false, error: 'Agendamento não encontrado' },
            { status: 404 }
          )
        }

        const allAppointments2 = await getAllAppointments()
        const filteredAppointments = allAppointments2.filter(
          apt => apt.id !== appointmentId
        )

        // Salvar os agendamentos sem o excluído
        const fs = require('fs').promises
        const path = require('path')

        // Remover de unified-appointments.json
        const appointmentsPath = path.join(
          process.cwd(),
          'data',
          'unified-appointments.json'
        )

        await fs.writeFile(
          appointmentsPath,
          JSON.stringify(filteredAppointments, null, 2)
        )

        // Remover também de unified-system/appointments.json
        const unifiedSystemAppointmentsPath = path.join(
          process.cwd(),
          'data',
          'unified-system',
          'appointments.json'
        )

        try {
          // Ler o arquivo do sistema unificado
          const unifiedSystemData = await fs.readFile(
            unifiedSystemAppointmentsPath,
            'utf8'
          )
          const unifiedSystemAppointments = JSON.parse(unifiedSystemData)

          // Filtrar o agendamento excluído
          const filteredUnifiedSystemAppointments =
            unifiedSystemAppointments.filter(apt => apt.id !== appointmentId)

          // Salvar o arquivo atualizado
          await fs.writeFile(
            unifiedSystemAppointmentsPath,
            JSON.stringify(filteredUnifiedSystemAppointments, null, 2)
          )

          console.log(
            `🗑️ Agendamento ${appointmentId} foi excluído de ambos os arquivos`
          )
        } catch (error) {
          console.log(`⚠️ Erro ao remover do sistema unificado: ${error}`)
        }

        return NextResponse.json({
          success: true,
          message: 'Agendamento excluído com sucesso',
        })

      case 'remove-cancelled-appointments':
        const allAppointments3 = await getAllAppointments()
        const cancelledAppointments = allAppointments3.filter(
          apt => apt.status === 'cancelada'
        )
        const activeAppointments = allAppointments3.filter(
          apt => apt.status !== 'cancelada'
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
          dataConsulta: appointmentDate,
          horaConsulta: appointmentTime,
          tipoConsulta: appointmentType || 'consulta',
          status: 'agendada',
          observacoes: notes,
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
          telefone: whatsapp || phone,
          email: email,
          dataNascimento: birthDate,
          cpf: cpf || '',
          insurance: insurance || { type: 'particular' },
          isActive: true,
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
