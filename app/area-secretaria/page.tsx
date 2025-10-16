'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import BackgroundPattern from '../../components/ui/background-pattern'
import { BrazilianDateInput } from '../../components/ui/brazilian-date-input'
import { BrazilianDatePicker } from '../../components/ui/brazilian-date-picker'
import { TimePicker } from '../../components/ui/time-picker'
import { InteractiveCalendar } from '../../components/ui/interactive-calendar'
import { isoDateToBrazilianDisplay, getTodayISO } from '../../lib/date-utils'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  whatsapp: string
  birthDate: string
  cpf: string
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
  }
  createdAt: string
}

interface Consultation {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  type: string
  status: 'agendada' | 'confirmada' | 'cancelada' | 'concluida'
  notes?: string
  // Dados adicionais do paciente vindos diretamente da API
  patientPhone?: string
  patientWhatsapp?: string
  patientEmail?: string
  patientCpf?: string
  insuranceType?: string
}

export default function AreaSecretaria() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO())
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [showNewConsultationForm, setShowNewConsultationForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)


  // Estados para o formulário de novo paciente
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    birthDate: '',
    cpf: '',
    insurance: {
      type: 'particular' as 'particular' | 'unimed' | 'outro',
      plan: '',
    },
  })

  // Estados para o formulário de nova consulta
  const [newConsultation, setNewConsultation] = useState({
    patientId: '',
    patientName: '',
    date: getTodayISO(),
    time: '',
    type: 'CONSULTATION',
    status: 'agendada' as 'agendada' | 'confirmada' | 'cancelada' | 'concluida',
    notes: '',
  })

  // Filtrar pacientes apenas com CPF
  const validPatients = useMemo(() => {
    return patients.filter(patient => patient.cpf && patient.cpf.trim() !== '')
  }, [patients])

  // Filtrar consultas por status
  const todayConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      const consultationDate = consultation.date
      // Usar data atual sem conversão de fuso horário para evitar inconsistências
      const today = new Date().toISOString().split('T')[0]
      console.log('🔍 Filtro de consultas:', {
        consultationDate,
        today,
        status: consultation.status,
        patientName: consultation.patientName
      })
      return (
        consultationDate === today &&
        (consultation.status === 'agendada' || consultation.status === 'confirmada' || 
         consultation.status === 'scheduled' || consultation.status === 'confirmed')
      )
    })
  }, [consultations])

  // Filtrar consultas pelo dia selecionado no calendário/data picker
  const selectedDayConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      const consultationDate = consultation.date
      const selected = selectedDate
      // Mostrar todas as consultas do dia selecionado, independentemente do status
      return consultationDate === selected
    })
  }, [consultations, selectedDate])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log('📊 Carregando dados diretamente do Prisma...')

      // Carregar pacientes médicos diretamente da API Prisma
      const patientsResponse = await fetch('/api/unified-system/medical-patients', {
        credentials: 'include' // Inclui cookies na requisição
      })
      if (patientsResponse.ok) {
        const apiData = await patientsResponse.json()
        const patientsData = apiData.patients || []
        console.log('✅ Pacientes carregados da API:', patientsData.length)
        console.log('📋 Dados dos pacientes:', patientsData)
        
        // Mapear dados dos pacientes para o formato esperado pelo frontend
        const mappedPatients = patientsData.map((patient: any) => ({
          id: patient.id,
          name: patient.fullName || patient.name || 'Nome não disponível',
          email: patient.email || '',
          phone: patient.phone || '',
          whatsapp: patient.whatsapp || '',
          birthDate: patient.birthDate || '',
          cpf: patient.cpf || '',
          insurance: {
            type: patient.insurance?.type || patient.insuranceType || 'particular',
            plan: patient.insurance?.plan || patient.insurancePlan || ''
          },
          isActive: patient.isActive ?? true,
          createdAt: patient.createdAt || new Date().toISOString()
        }))
        
        console.log('📋 Pacientes mapeados:', mappedPatients)
        setPatients(mappedPatients)
      } else {
        console.error('❌ Erro ao carregar pacientes:', patientsResponse.status)
        setPatients([])
      }

      // Carregar agendamentos diretamente da API Prisma
      const appointmentsResponse = await fetch('/api/unified-appointments?action=all-appointments', {
        credentials: 'include' // Inclui cookies na requisição
      })
      if (appointmentsResponse.ok) {
        const apiData = await appointmentsResponse.json()
        const appointments = apiData.appointments || []
        const consultationsData = appointments.map((apt: any) => {
          // Mapear status da API para o formato esperado pelo frontend
          let mappedStatus = apt.status
          if (apt.status === 'SCHEDULED' || apt.status === 'scheduled') mappedStatus = 'agendada'
          if (apt.status === 'CONFIRMED' || apt.status === 'confirmed') mappedStatus = 'confirmada'
          if (apt.status === 'COMPLETED' || apt.status === 'completed') mappedStatus = 'realizada'
          if (apt.status === 'CANCELLED' || apt.status === 'cancelled') mappedStatus = 'cancelada'
          if (apt.status === 'NO_SHOW' || apt.status === 'no_show') mappedStatus = 'faltou'
          
          console.log('🔍 Mapeando consulta:', {
            appointmentId: apt.id,
            medicalPatientId: apt.medicalPatientId,
            communicationContactId: apt.communicationContactId,
            patientName: apt.patientName
          })
          
          return {
            id: apt.id,
            patientId: apt.medicalPatientId || apt.patientId || apt.communicationContactId,
            patientName: apt.patientName || 'Nome não disponível',
            date: apt.date || apt.appointmentDate,
            time: apt.time || apt.appointmentTime,
            type: apt.type || apt.appointmentType || 'CONSULTATION',
            status: mappedStatus,
            notes: apt.notes || '',
            // Dados adicionais do paciente vindos diretamente da API
            patientPhone: apt.patientPhone || apt.patientWhatsapp || '',
            patientWhatsapp: apt.patientWhatsapp || apt.patientPhone || '',
            patientEmail: apt.patientEmail || '',
            patientCpf: apt.patientCpf || '',
            insuranceType: apt.insuranceType || 'particular'
          }
        })
        console.log('✅ Consultas carregadas da API:', consultationsData.length)
        setConsultations(consultationsData)
      } else {
        console.error('❌ Erro ao carregar agendamentos:', appointmentsResponse.status)
        setConsultations([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      setPatients([])
      setConsultations([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include' // Inclui cookies na requisição
        })

        if (!response.ok) {
          console.error('Erro na autenticação:', response.status)
          router.push('/login-secretaria')
          return
        }

        const data = await response.json()
        if (!data.authenticated || !data.user) {
          console.error('Usuário não autenticado')
          router.push('/login-secretaria')
          return
        }

        const userRole = data.user.role?.toLowerCase()
        if (!data.user.areas?.includes('secretaria')) {
          console.error('Usuário sem permissão: ', userRole)
          router.push('/unauthorized')
          return
        }

        loadData()
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error)
        router.push('/login-secretaria')
      }
    }
    checkAuth()
  }, [loadData, router])

  // Filtrar pacientes baseado no termo de busca
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients

    const term = searchTerm.toLowerCase()
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(term) ||
        patient.phone.includes(term) ||
        patient.whatsapp.includes(term) ||
        patient.email?.toLowerCase().includes(term)
    )
  }, [patients, searchTerm])

  // Função para criar novo paciente
  const handleCreatePatient = async () => {
    // Validar campos obrigatórios
    if (!newPatient.name || !newPatient.email || !newPatient.phone || !newPatient.cpf) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    // Validar CPF
    const cpfNumbers = newPatient.cpf.replace(/\D/g, '')
    if (cpfNumbers.length !== 11) {
      alert('Por favor, insira um CPF válido')
      return
    }

    // Verificar se CPF já existe
    const existingPatient = patients.find(p => p.cpf === newPatient.cpf)
    if (existingPatient) {
      alert('Já existe um paciente cadastrado com este CPF')
      return
    }

    try {
      const response = await fetch('/api/unified-system/medical-patients', {
        credentials: 'include', // Inclui cookies na requisição
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: newPatient.name,
          cpf: newPatient.cpf,
          email: newPatient.email,
          phone: newPatient.phone,
          whatsapp: newPatient.whatsapp,
          birthDate: newPatient.birthDate,
          insurance: newPatient.insurance,
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        const createdPatient = responseData.patient
        
        // Mapear os dados do paciente para o formato esperado pelo frontend
        const patientForFrontend = {
          id: createdPatient.id,
          name: createdPatient.name || createdPatient.fullName,
          email: createdPatient.email,
          phone: createdPatient.phone,
          whatsapp: createdPatient.whatsapp,
          birthDate: createdPatient.birthDate,
          cpf: createdPatient.cpf,
          insurance: createdPatient.insurance,
          createdAt: createdPatient.createdAt
        }
        
        setPatients([...patients, patientForFrontend])

        setShowNewPatientForm(false)
        setNewPatient({
          name: '',
          email: '',
          phone: '',
          whatsapp: '',
          birthDate: '',
          cpf: '',
          insurance: {
            type: 'particular',
            plan: '',
          },
        })
        alert('Paciente criado com sucesso!')
      } else {
        const errorData = await response.json()
        if (errorData.message && errorData.message.includes('CPF')) {
          alert('Este CPF já está cadastrado no sistema')
        } else {
          alert(`Erro ao criar paciente: ${errorData.message || errorData.error || 'Erro desconhecido'}`)
        }
      }
    } catch (error) {
      console.error('Erro ao criar paciente:', error)
      alert('Erro ao criar paciente. Tente novamente.')
    }
  }

  // Função para criar nova consulta
  const handleCreateConsultation = async () => {
    try {
      const patientId = selectedPatient?.id || newConsultation.patientId
      const appointmentDate = newConsultation.date
      
      console.log('🔍 [DEBUG] Iniciando criação de consulta:', {
        patientId,
        selectedPatient: selectedPatient?.name,
        appointmentDate,
        newConsultationPatientId: newConsultation.patientId,
        selectedPatientId: selectedPatient?.id
      })
      
      console.log('🔍 [DEBUG] João Vítor ID esperado: cmgla4agm000dvd24ujkmiw10')
      console.log('🔍 [DEBUG] PatientId sendo usado:', patientId)
      
      // Verificar se paciente pode agendar nova consulta usando sistema unificado
      try {
        console.log('🔍 [DEBUG] Fazendo requisição para check-can-schedule...')
        const response = await fetch('/api/unified-appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check-can-schedule', patientId })
        })
        
        console.log('🔍 [DEBUG] Resposta da API:', {
          status: response.status,
          ok: response.ok
        })
        
        const canScheduleData = await response.json()
        console.log('🔍 [DEBUG] Dados da validação:', canScheduleData)
        
        if (!canScheduleData.canSchedule) {
          console.log('❌ [DEBUG] Paciente não pode agendar:', canScheduleData.reason)
          alert(canScheduleData.reason || 'Este paciente já possui uma consulta ativa. Aguarde a conclusão para agendar uma nova.')
          return
        }
        
        console.log('✅ [DEBUG] Paciente pode agendar consulta')
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao verificar disponibilidade:', error)
        // Fallback para verificação local
        const activeConsultation = consultations.find(consultation => 
          consultation.patientId === patientId && 
          (consultation.status === 'agendada' || consultation.status === 'confirmada')
        )
        
        if (activeConsultation) {
          alert(`Este paciente já possui uma consulta ativa agendada para ${activeConsultation.date} às ${activeConsultation.time}. Aguarde a conclusão desta consulta para agendar uma nova.`)
          return
        }
      }
      
      // Verificar se já existe consulta para este paciente na mesma data E HORÁRIO
      const existingConsultation = consultations.find(consultation => 
        consultation.patientId === patientId && 
        consultation.date === appointmentDate &&
        consultation.time === newConsultation.time &&
        (consultation.status === 'agendada' || consultation.status === 'confirmada')
      )
      
      if (existingConsultation) {
        alert('Este paciente já possui uma consulta agendada para esta data e horário. Escolha um horário diferente.')
        return
      }
      
      const consultationData = {
        action: 'create-appointment',
        patientId: patientId,
        patientName: selectedPatient?.name || newConsultation.patientName,
        patientPhone: selectedPatient?.phone,
        patientWhatsapp: selectedPatient?.whatsapp,
        patientEmail: selectedPatient?.email,
        patientCpf: selectedPatient?.cpf,
        insuranceType: selectedPatient?.insurance?.type || 'particular',
        appointmentDate: newConsultation.date,
        appointmentTime: newConsultation.time,
        appointmentType: newConsultation.type,
        notes: newConsultation.notes,
        source: 'secretary',
        createdBy: 'secretary'
      }

      const response = await fetch('/api/unified-appointments', {
        credentials: 'include', // Inclui cookies na requisição
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData),
      })

      if (response.ok) {
        const result = await response.json()
        const created = result.appointment || result

        // Mapear status para o formato exibido na tela
        let mappedStatus = created.status
        if (mappedStatus === 'SCHEDULED' || mappedStatus === 'scheduled') mappedStatus = 'agendada'
        if (mappedStatus === 'CONFIRMED' || mappedStatus === 'confirmed') mappedStatus = 'confirmada'
        if (mappedStatus === 'COMPLETED' || mappedStatus === 'completed') mappedStatus = 'concluida'
        if (mappedStatus === 'CANCELLED' || mappedStatus === 'cancelled') mappedStatus = 'cancelada'

        const newConsultationFormatted: Consultation = {
          id: created.id,
          patientId: patientId || created.patientId || created.communicationContactId || created.medicalPatientId,
          patientName: selectedPatient?.name || newConsultation.patientName || created.patientName || 'Paciente',
          date: created.date || created.appointmentDate || newConsultation.date,
          time: created.time || created.appointmentTime || newConsultation.time,
          type: created.type || created.appointmentType || 'CONSULTATION',
          status: mappedStatus as any,
          notes: created.notes || '',
        }

        setConsultations([...consultations, newConsultationFormatted])

        setShowNewConsultationForm(false)
        setSelectedPatient(null)
        setNewConsultation({
          patientId: '',
          patientName: '',
          date: getTodayISO(),
          time: '',
          type: 'CONSULTATION',
          status: 'agendada',
          notes: '',
        })
        alert('Consulta agendada com sucesso!')
      } else {
        const errorData = await response.json()
        alert(`Erro ao agendar consulta: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error)
      alert('Erro ao agendar consulta. Tente novamente.')
    }
  }

  // Função para atualizar consulta
  const handleUpdateConsultation = async () => {
    if (!editingConsultation) return

    try {
      const response = await fetch(`/api/unified-appointments/${editingConsultation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingConsultation),
      })

      if (response.ok) {
        const updatedConsultation = await response.json()
        const updatedConsultations = consultations.map((consultation) =>
          consultation.id === editingConsultation.id
            ? {
                ...consultation,
                ...updatedConsultation,
                date: updatedConsultation.date || updatedConsultation.appointmentDate,
                time: updatedConsultation.time || updatedConsultation.appointmentTime,
                type: updatedConsultation.type || updatedConsultation.appointmentType || 'CONSULTATION',
              }
            : consultation
        )

        setConsultations(updatedConsultations)

        setEditingConsultation(null)
        alert('Consulta atualizada com sucesso!')
      } else {
        const errorData = await response.json()
        alert(`Erro ao atualizar consulta: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error)
      alert('Erro ao atualizar consulta. Tente novamente.')
    }
  }

  // Função para deletar paciente
  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return

    try {
      const patientResponse = await fetch(`/api/unified-system/medical-patients?id=${patientId}`)
      if (patientResponse.ok) {
        const patientData = await patientResponse.json()

        const response = await fetch(`/api/unified-system/medical-patients/${patientId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          const updatedPatients = patients.filter((patient) => patient.id !== patientId)
          setPatients(updatedPatients)

          alert('Paciente excluído com sucesso!')
        } else {
          const errorData = await response.json()
          alert(`Erro ao excluir paciente: ${errorData.error || 'Erro desconhecido'}`)
        }
      }
    } catch (error) {
      console.error('Erro ao excluir paciente:', error)
      alert('Erro ao excluir paciente. Tente novamente.')
    }
  }

  // Função para deletar consulta
  const handleDeleteConsultation = async (consultationId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta consulta?')) return

    try {
      const response = await fetch(`/api/unified-appointments/${consultationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const updatedConsultations = consultations.filter(
          (consultation) => consultation.id !== consultationId
        )
        setConsultations(updatedConsultations)

        alert('Consulta cancelada com sucesso!')
      } else {
        const errorData = await response.json()
        alert(`Erro ao cancelar consulta: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error)
      alert('Erro ao cancelar consulta. Tente novamente.')
    }
  }

  const getCurrentConsultations = () => {
    return selectedDayConsultations
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4'></div>
          <p className='text-gray-300'>Carregando área da secretária...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />

      <div className='relative isolate'>
        {/* Header */}
        <div className='pt-32 pb-8'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700'>
                  <svg className='w-8 h-8 text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                  </svg>
                </div>
                <div>
                  <h1 className='text-4xl font-bold text-white'>Área da Secretária</h1>
                  <p className='text-gray-300 text-lg'>Gestão de pacientes e agendamentos</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/')}
                className='bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 text-blue-400 px-6 py-3 rounded-xl hover:bg-blue-600/30 hover:border-blue-400/50 transition-all duration-200'
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='mx-auto max-w-7xl px-6 lg:px-8 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
              <div className='flex items-center'>
                <div className='p-3 bg-blue-900/20 rounded-xl'>
                  <svg className='w-6 h-6 text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-300'>Total de Pacientes</p>
                  <p className='text-2xl font-bold text-white'>{validPatients.length}</p>
                </div>
              </div>
            </div>

            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
              <div className='flex items-center'>
                <div className='p-3 bg-green-900/20 rounded-xl'>
                  <svg className='w-6 h-6 text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-300'>Consultas Hoje</p>
                  <p className='text-2xl font-bold text-white'>{todayConsultations.length}</p>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Seção de Pacientes */}
        <div className='mx-auto max-w-7xl px-6 lg:px-8 mb-8'>
          <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700'>
            <div className='p-6 border-b border-gray-700'>
              <div className='flex justify-between items-center'>
                <h2 className='text-2xl font-bold text-white'>Pacientes</h2>
                <button
                  onClick={() => setShowNewPatientForm(true)}
                  className='bg-green-600/20 backdrop-blur-sm border border-green-500/30 text-green-400 px-4 py-2 rounded-xl hover:bg-green-600/30 hover:border-green-400/50 transition-all duration-200'
                >
                  + Novo Paciente
                </button>
              </div>
            </div>

            {/* Busca de pacientes */}
            <div className='p-6'>
              <input
                type='text'
                placeholder='Buscar paciente por nome, telefone ou email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm'
              />
            </div>

            {/* Lista de pacientes */}
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-700'>
                <thead className='bg-gray-800/50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Paciente
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      WhatsApp
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Data Nascimento
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-700'>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className='px-6 py-8 text-center text-gray-400'>
                      <div className='flex flex-col items-center'>
                        <svg className='w-12 h-12 text-gray-500 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                        Nenhum paciente encontrado
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className='hover:bg-gray-800/30 transition-colors duration-200'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-white flex items-center gap-2'>
                            {patient.name}
                            {/* Buscar número do prontuário se disponível */}
                            {patient.medicalRecordNumber && (
                              <span className='text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded'>
                                #{patient.medicalRecordNumber}
                              </span>
                            )}
                          </div>
                          <div className='text-sm text-gray-300'>
                            {patient.email || 'Email não informado'}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                        {patient.whatsapp || 'Não informado'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                        {patient.birthDate ? (() => {
                          // Evitar problemas de timezone fazendo parsing manual
                          const [year, month, day] = patient.birthDate.split('-')
                          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR')
                        })() : 'Não informado'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <button
                          onClick={() => {
                            setSelectedPatient(patient)
                            setShowNewConsultationForm(true)
                          }}
                          className='text-blue-400 hover:text-blue-300 mr-4 transition-colors duration-200'
                        >
                          Agendar
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className='text-red-400 hover:text-red-300 transition-colors duration-200'
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Agenda */}
        <div className='mx-auto max-w-7xl px-6 lg:px-8 mb-8'>
          <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700'>
            <div className='p-6 border-b border-gray-700'>
              <div className='flex justify-between items-center'>
                <h2 className='text-2xl font-bold text-white'>Agenda do Dia</h2>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className='bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl hover:bg-blue-600/30 hover:border-blue-400/50 transition-all duration-200'
                  >
                    {showCalendar ? 'Ocultar' : 'Mostrar'} Calendário
                  </button>
                </div>
              </div>
            </div>

            {/* Seletor de data */}
            <div className='p-6'>
              <BrazilianDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                label='Data selecionada'
              />
            </div>

            {/* Calendário */}
            {showCalendar && (
              <div className='p-6 border-t border-gray-700'>
                <InteractiveCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  appointments={consultations}
                />
              </div>
            )}

            {/* Título da seção */}
            <div className='p-6 border-b border-gray-700'>
              <h3 className='text-lg font-semibold text-white'>
                Consultas Totais ({selectedDayConsultations.length})
              </h3>
            </div>

            {/* Lista de consultas */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      WhatsApp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Convênio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Consulta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/50 divide-y divide-gray-700">
                  {getCurrentConsultations().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Nenhuma consulta agendada para hoje
                        </div>
                      </td>
                    </tr>
                  ) : (
                    getCurrentConsultations().map((consultation) => {
                      const patient = patients.find(p => p.id === consultation.patientId)
                      
                      // Usar dados da consulta como prioridade, depois dados do paciente encontrado
                      const displayName = consultation.patientName || patient?.name || 'Paciente não identificado'
                      const displayPhone = consultation.patientPhone || patient?.phone || '-'
                      const displayWhatsapp = consultation.patientWhatsapp || patient?.whatsapp || '-'
                      const displayInsuranceType = consultation.insuranceType || patient?.insurance?.type || 'particular'
                      
                      console.log('🔍 Exibindo consulta:', {
                        consultationId: consultation.id,
                        patientId: consultation.patientId,
                        patientFound: !!patient,
                        displayName,
                        displayPhone,
                        displayWhatsapp,
                        displayInsuranceType
                      })
                      
                      return (
                        <tr key={consultation.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-100">
                              {displayName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {displayPhone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {displayWhatsapp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                              displayInsuranceType === 'particular'
                                ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50'
                                : displayInsuranceType === 'unimed'
                                ? 'bg-green-900/30 text-green-300 border border-green-700/50'
                                : 'bg-gray-800/30 text-gray-300 border border-gray-600/50'
                            }`}>
                              {displayInsuranceType === 'particular' ? 'Particular' :
                               displayInsuranceType === 'unimed' ? 'Unimed' : 'Outro'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-200">
                              {isoDateToBrazilianDisplay(consultation.date)} às {consultation.time}
                            </div>
                            <div className="text-sm text-gray-400">
                              Status: {consultation.status}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setEditingConsultation(consultation)}
                              className="text-blue-400 hover:text-blue-300 mr-4 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteConsultation(consultation.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Cancelar
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </div>

      {/* Modal para novo paciente */}
      {showNewPatientForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-100">Novo Paciente</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  value={newPatient.cpf}
                  onChange={(e) => {
                    // Formatar CPF automaticamente
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 11) {
                      value = value.replace(/(\d{3})(\d)/, '$1.$2')
                      value = value.replace(/(\d{3})(\d)/, '$1.$2')
                      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                      setNewPatient({ ...newPatient, cpf: value })
                    }
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => {
                    // Formatar telefone automaticamente com DDD
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 11) {
                      if (value.length <= 2) {
                        value = value.replace(/(\d{0,2})/, '($1')
                      } else if (value.length <= 7) {
                        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2')
                      } else {
                        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
                      }
                      setNewPatient({ ...newPatient, phone: value })
                    }
                  }}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={newPatient.whatsapp}
                  onChange={(e) => {
                    // Formatar WhatsApp automaticamente com DDD
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 11) {
                      if (value.length <= 2) {
                        value = value.replace(/(\d{0,2})/, '($1')
                      } else if (value.length <= 7) {
                        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2')
                      } else {
                        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
                      }
                      setNewPatient({ ...newPatient, whatsapp: value })
                    }
                  }}  
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Data de Nascimento
                </label>
                <BrazilianDateInput
                  value={newPatient.birthDate}
                  onChange={(value) => setNewPatient({ ...newPatient, birthDate: value })}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Convênio
                </label>
                <select
                  value={newPatient.insurance.type}
                  onChange={(e) => {
                    const selectedType = e.target.value as 'particular' | 'unimed' | 'outro'
                    let planValue = ''
                    
                    // Definir plano automaticamente baseado no tipo
                    if (selectedType === 'particular') {
                      planValue = '' // Particular não tem plano
                    } else if (selectedType === 'unimed') {
                      planValue = 'Unimed' // Unimed já é o plano
                    } else {
                      planValue = '' // Outro: usuário digita
                    }
                    
                    setNewPatient({
                      ...newPatient,
                      insurance: {
                        type: selectedType,
                        plan: planValue
                      }
                    })
                  }}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="particular">Particular</option>
                  <option value="unimed">Unimed</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {newPatient.insurance.type === 'outro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Plano
                  </label>
                  <input
                    type="text"
                    value={newPatient.insurance.plan}
                    onChange={(e) => setNewPatient({
                      ...newPatient,
                      insurance: { ...newPatient.insurance, plan: e.target.value }
                    })}
                    placeholder="Digite o nome do plano"
                    className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewPatientForm(false)}
                className="px-4 py-2 text-gray-300 border border-gray-600/50 rounded-md hover:bg-gray-800/30 transition-colors backdrop-blur-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePatient}
                className="px-4 py-2 bg-blue-600/80 text-white rounded-md hover:bg-blue-600 transition-colors backdrop-blur-sm"
              >
                Criar Paciente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nova consulta */}
      {showNewConsultationForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-100">
              {selectedPatient ? `Agendar consulta para ${selectedPatient.name}` : 'Nova Consulta'}
            </h3>

            <div className="space-y-4">
              {!selectedPatient && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Paciente
                  </label>
                  <select
                    value={newConsultation.patientId}
                    onChange={(e) => {
                      const patient = patients.find(p => p.id === e.target.value)
                      setNewConsultation({
                        ...newConsultation,
                        patientId: e.target.value,
                        patientName: patient?.name || ''
                      })
                    }}
                    className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="">Selecione um paciente</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Data
                </label>
                <BrazilianDateInput
                  value={newConsultation.date}
                  onChange={(value) => setNewConsultation({ ...newConsultation, date: value })}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Horário
                </label>
                <TimePicker
                  value={newConsultation.time}
                  onChange={(value) => setNewConsultation({ ...newConsultation, time: value })}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Consulta
                </label>
                <select
                  value={newConsultation.type}
                  onChange={(e) => setNewConsultation({ ...newConsultation, type: e.target.value })}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="CONSULTATION">Consulta</option>
                  <option value="RETURN">Retorno</option>
                  <option value="EXAM">Exame</option>
                  <option value="PROCEDURE">Procedimento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  value={newConsultation.notes}
                  onChange={(e) => setNewConsultation({ ...newConsultation, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewConsultationForm(false)
                  setSelectedPatient(null)
                }}
                className="px-4 py-2 text-gray-300 border border-gray-600/50 rounded-md hover:bg-gray-800/30 transition-colors backdrop-blur-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateConsultation}
                className="px-4 py-2 bg-blue-600/80 text-white rounded-md hover:bg-blue-600 transition-colors backdrop-blur-sm"
              >
                Agendar Consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar consulta */}
      {editingConsultation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-100">Editar Consulta</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Data
                </label>
                <BrazilianDateInput
                  value={editingConsultation.date}
                  onChange={(value) => setEditingConsultation({ ...editingConsultation, date: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Horário
                </label>
                <TimePicker
                  value={editingConsultation.time}
                  onChange={(value) => setEditingConsultation({ ...editingConsultation, time: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={editingConsultation.status}
                  onChange={(e) => setEditingConsultation({
                    ...editingConsultation,
                    status: e.target.value as 'agendada' | 'confirmada' | 'cancelada' | 'concluida'
                  })}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="agendada">Agendada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  value={editingConsultation.notes || ''}
                  onChange={(e) => setEditingConsultation({ ...editingConsultation, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-blue-900/50 border border-blue-600/50 rounded-md text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingConsultation(null)}
                className="px-4 py-2 text-gray-300 border border-gray-600/50 rounded-md hover:bg-gray-800/30 transition-colors backdrop-blur-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateConsultation}
                className="px-4 py-2 bg-blue-600/80 text-white rounded-md hover:bg-blue-600 transition-colors backdrop-blur-sm"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
