import { NextRequest, NextResponse } from 'next/server'
import {
  getAllAppointments,
  getAppointmentsByDate,
  updateAppointment,
  createAppointment,
  getAllMedicalPatients,
  getMedicalPatientById,
  createMedicalPatient,
  getCommunicationContactById,
} from '../../../lib/unified-patient-system'

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
        const allPatients = await getAllMedicalPatients()
        
        // Combinar dados de pacientes médicos com contatos de comunicação
        const patientsWithContactData = allPatients.map(patient => {
          const contact = getCommunicationContactById(patient.communicationContactId)
          return {
            id: patient.id,
            name: patient.fullName,
            cpf: patient.cpf,
            medicalRecordNumber: patient.medicalRecordNumber,
            phone: contact?.whatsapp || '',
            whatsapp: contact?.whatsapp || '',
            email: contact?.email,
            birthDate: contact?.birthDate,
            insuranceType: patient.insurance.type,
            insurancePlan: patient.insurance.plan,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt
          }
        })
        
        return NextResponse.json({ success: true, patients: patientsWithContactData })

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
        const medicalPatient = await getMedicalPatientById(patientId)
        if (!medicalPatient) {
          return NextResponse.json(
            { success: false, error: 'Paciente não encontrado' },
            { status: 404 }
          )
        }
        
        // Buscar dados de comunicação para incluir informações de contato
        const communicationContact = getCommunicationContactById(medicalPatient.communicationContactId)
        
        // Formato unificado com todos os dados necessários
        const unifiedPatient = {
          id: medicalPatient.id,
          name: medicalPatient.fullName,
          fullName: medicalPatient.fullName,
          cpf: medicalPatient.cpf,
          medicalRecordNumber: medicalPatient.medicalRecordNumber,
          phone: communicationContact?.whatsapp || '',
          whatsapp: communicationContact?.whatsapp || '',
          email: communicationContact?.email || '',
          birthDate: communicationContact?.birthDate || '',
          insuranceType: medicalPatient.insurance.type,
          insurancePlan: medicalPatient.insurance.plan,
          createdAt: medicalPatient.createdAt,
          updatedAt: medicalPatient.updatedAt,
          isActive: medicalPatient.isActive,
          // Dados médicos originais
          insurance: medicalPatient.insurance,
          medicalInfo: medicalPatient.medicalInfo,
          consents: medicalPatient.consents
        }
        
        return NextResponse.json({ success: true, patient: unifiedPatient })

      case 'stats':
        const statsAppointments = await getAllAppointments()
        const statsPatients = await getAllMedicalPatients()
        const stats = {
          totalAppointments: statsAppointments.length,
          totalPatients: statsPatients.length,
          appointmentsByStatus: {
            agendada: statsAppointments.filter(apt => apt.status === 'agendada').length,
            confirmada: statsAppointments.filter(apt => apt.status === 'confirmada').length,
            cancelada: statsAppointments.filter(apt => apt.status === 'cancelada').length,
            realizada: statsAppointments.filter(apt => apt.status === 'concluida').length
          }
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
        const patientCommunicationContact = getCommunicationContactById(getPatient.communicationContactId)
        
        // Combinar dados do paciente médico com dados de comunicação para compatibilidade com o frontend
        const combinedPatientData = {
          ...getPatient,
          // Campos esperados pelo frontend vindos do CommunicationContact
          name: patientCommunicationContact?.name || getPatient.fullName,
          phone: patientCommunicationContact?.whatsapp || '',
          whatsapp: patientCommunicationContact?.whatsapp || '',
          birthDate: patientCommunicationContact?.birthDate || '',
          // Manter dados originais também
          communicationContact: patientCommunicationContact
        }

        return NextResponse.json({ success: true, patient: combinedPatientData })

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
          const unifiedSystemData = await fs.readFile(unifiedSystemAppointmentsPath, 'utf8')
          const unifiedSystemAppointments = JSON.parse(unifiedSystemData)
          
          // Filtrar o agendamento excluído
          const filteredUnifiedSystemAppointments = unifiedSystemAppointments.filter(
            apt => apt.id !== appointmentId
          )
          
          // Salvar o arquivo atualizado
          await fs.writeFile(
            unifiedSystemAppointmentsPath,
            JSON.stringify(filteredUnifiedSystemAppointments, null, 2)
          )
          
          console.log(`🗑️ Agendamento ${appointmentId} foi excluído de ambos os arquivos`)
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
          !patientPhone ||
          !appointmentDate ||
          !appointmentTime
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Campos obrigatórios: patientId, patientName, patientPhone, appointmentDate, appointmentTime',
            },
            { status: 400 }
          )
        }

        const appointmentResult = await createAppointment({
          communicationContactId: patientId,
          appointmentDate,
          appointmentTime,
          appointmentType: appointmentType || 'consulta',
          source: source || 'doctor_area',
          notes,
        }, createdBy)

        return NextResponse.json(appointmentResult)

      case 'create_patient':
      case 'create-patient':
        const { patientData } = body
        const {
          name,
          phone,
          whatsapp,
          email,
          birthDate,
          cpf,
          insurance,
          medicalRecord,
        } = patientData || body

        if (!name || !phone) {
          return NextResponse.json(
            { success: false, error: 'Nome e telefone são obrigatórios' },
            { status: 400 }
          )
        }

        const patientResult = await createMedicalPatient({
          cpf: cpf || '',
          fullName: name,
          communicationContactId: phone, // This should be a valid communication contact ID
        })

        return NextResponse.json(patientResult)

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

        const updateResult = await updateAppointment(
          appointmentId,
          { status: status, notes: statusNotes }
        )
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

        const result = await updateAppointment(
          appointmentId,
          { status: status, notes: notes }
        )
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
