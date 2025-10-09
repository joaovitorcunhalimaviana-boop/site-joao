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
  const [activeTab, setActiveTab] = useState<'today' | 'scheduled' | 'all'>('today')

  // Estados para o formulário de novo paciente
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    birthDate: '',
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

  // Filtrar consultas por status
  const todayConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      const consultationDate = consultation.date
      const today = getTodayISO()
      return (
        consultationDate === today &&
        (consultation.status === 'agendada' || consultation.status === 'confirmada')
      )
    })
  }, [consultations])

  const scheduledConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      const consultationDate = consultation.date
      const today = getTodayISO()
      return (
        consultationDate > today &&
        (consultation.status === 'agendada' || consultation.status === 'confirmada')
      )
    })
  }, [consultations])

  const allActiveConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      return (
        consultation.status === 'agendada' || consultation.status === 'confirmada'
      )
    })
  }, [consultations])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log('📊 Carregando dados diretamente do Prisma...')

      // Carregar pacientes médicos diretamente da API Prisma
      const patientsResponse = await fetch('/api/unified-system/medical-patients')
      if (patientsResponse.ok) {
        const apiData = await patientsResponse.json()
        const patientsData = apiData.patients || []
        console.log('✅ Pacientes carregados da API:', patientsData.length)
        setPatients(patientsData)
      } else {
        console.error('❌ Erro ao carregar pacientes:', patientsResponse.status)
        setPatients([])
      }

      // Carregar agendamentos diretamente da API Prisma
      const appointmentsResponse = await fetch('/api/unified-appointments?action=all-appointments')
      if (appointmentsResponse.ok) {
        const apiData = await appointmentsResponse.json()
        const appointments = apiData.appointments || []
        const consultationsData = appointments.map((apt: any) => ({
          id: apt.id,
          patientId: apt.patientId || apt.communicationContactId || apt.medicalPatientId,
          patientName: apt.patientName,
          date: apt.date || apt.appointmentDate,
          time: apt.time || apt.appointmentTime,
          type: apt.type || apt.appointmentType || 'CONSULTATION',
          status: apt.status,
          notes: apt.notes || '',
        }))
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
    loadData()
  }, [loadData])

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
    try {
      const response = await fetch('/api/unified-system/medical-patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPatient),
      })

      if (response.ok) {
        const createdPatient = await response.json()
        setPatients([...patients, createdPatient])

        setShowNewPatientForm(false)
        setNewPatient({
          name: '',
          email: '',
          phone: '',
          whatsapp: '',
          birthDate: '',
          insurance: {
            type: 'particular',
            plan: '',
          },
        })
        alert('Paciente criado com sucesso!')
      } else {
        const errorData = await response.json()
        alert(`Erro ao criar paciente: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao criar paciente:', error)
      alert('Erro ao criar paciente. Tente novamente.')
    }
  }

  // Função para criar nova consulta
  const handleCreateConsultation = async () => {
    try {
      const consultationData = {
        ...newConsultation,
        patientId: selectedPatient?.id || newConsultation.patientId,
        patientName: selectedPatient?.name || newConsultation.patientName,
      }

      const response = await fetch('/api/unified-appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData),
      })

      if (response.ok) {
        const createdConsultation = await response.json()
        const newConsultationFormatted: Consultation = {
          id: createdConsultation.id,
          patientId: createdConsultation.patientId || createdConsultation.communicationContactId || createdConsultation.medicalPatientId,
          patientName: createdConsultation.patientName,
          date: createdConsultation.date || createdConsultation.appointmentDate,
          time: createdConsultation.time || createdConsultation.appointmentTime,
          type: createdConsultation.type || createdConsultation.appointmentType || 'CONSULTATION',
          status: createdConsultation.status,
          notes: createdConsultation.notes || '',
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
    switch (activeTab) {
      case 'today':
        return todayConsultations
      case 'scheduled':
        return scheduledConsultations
      case 'all':
        return allActiveConsultations
      default:
        return todayConsultations
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BackgroundPattern />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Área da Secretária</h1>
              <p className="text-gray-600 mt-2">Gestão de pacientes e agendamentos</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Consultas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{todayConsultations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendadas</p>
                <p className="text-2xl font-bold text-gray-900">{scheduledConsultations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Pacientes */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Pacientes</h2>
            <button
              onClick={() => setShowNewPatientForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Novo Paciente
            </button>
          </div>

          {/* Busca de pacientes */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar paciente por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Lista de pacientes */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Convênio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Nenhuma consulta agendada para hoje
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.whatsapp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.insurance.type === 'particular'
                            ? 'bg-blue-100 text-blue-800'
                            : patient.insurance.type === 'unimed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.insurance.type === 'particular' ? 'Particular' : 
                           patient.insurance.type === 'unimed' ? 'Unimed' : 'Outro'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient)
                            setShowNewConsultationForm(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Agendar
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-red-600 hover:text-red-900"
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

        {/* Seção de Agenda */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Agenda do Dia</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showCalendar ? 'Ocultar' : 'Mostrar'} Calendário
              </button>
            </div>
          </div>

          {/* Seletor de data */}
          <div className="mb-6">
            <BrazilianDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              label="Data selecionada"
            />
          </div>

          {/* Calendário */}
          {showCalendar && (
            <div className="mb-6">
              <InteractiveCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                appointments={consultations}
              />
            </div>
          )}

          {/* Tabs para diferentes visualizações */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('today')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'today'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pacientes do Dia ({todayConsultations.length})
                </button>
                <button
                  onClick={() => setActiveTab('scheduled')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'scheduled'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Agendados ({scheduledConsultations.length})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Todos os Pacientes ({allActiveConsultations.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Lista de consultas */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Convênio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consulta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentConsultations().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Nenhuma consulta agendada para hoje
                      </div>
                    </td>
                  </tr>
                ) : (
                  getCurrentConsultations().map((consultation) => {
                    const patient = patients.find(p => p.id === consultation.patientId)
                    return (
                      <tr key={consultation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {consultation.patientName || patient?.name || 'Nome não encontrado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient?.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient?.whatsapp || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              patient.insurance.type === 'particular'
                                ? 'bg-blue-100 text-blue-800'
                                : patient.insurance.type === 'unimed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {patient.insurance.type === 'particular' ? 'Particular' : 
                               patient.insurance.type === 'unimed' ? 'Unimed' : 'Outro'}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {isoDateToBrazilianDisplay(consultation.date)} às {consultation.time}
                          </div>
                          <div className="text-sm text-gray-500">
                            Status: {consultation.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setEditingConsultation(consultation)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteConsultation(consultation.id)}
                            className="text-red-600 hover:text-red-900"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Novo Paciente</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={newPatient.whatsapp}
                  onChange={(e) => setNewPatient({ ...newPatient, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <BrazilianDateInput
                  value={newPatient.birthDate}
                  onChange={(value) => setNewPatient({ ...newPatient, birthDate: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Convênio
                </label>
                <select
                  value={newPatient.insurance.type}
                  onChange={(e) => setNewPatient({
                    ...newPatient,
                    insurance: {
                      ...newPatient.insurance,
                      type: e.target.value as 'particular' | 'unimed' | 'outro'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="particular">Particular</option>
                  <option value="unimed">Unimed</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {newPatient.insurance.type !== 'particular' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plano
                  </label>
                  <input
                    type="text"
                    value={newPatient.insurance.plan}
                    onChange={(e) => setNewPatient({
                      ...newPatient,
                      insurance: { ...newPatient.insurance, plan: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewPatientForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePatient}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Criar Paciente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nova consulta */}
      {showNewConsultationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {selectedPatient ? `Agendar consulta para ${selectedPatient.name}` : 'Nova Consulta'}
            </h3>
            
            <div className="space-y-4">
              {!selectedPatient && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <BrazilianDateInput
                  value={newConsultation.date}
                  onChange={(value) => setNewConsultation({ ...newConsultation, date: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário
                </label>
                <TimePicker
                  value={newConsultation.time}
                  onChange={(value) => setNewConsultation({ ...newConsultation, time: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Consulta
                </label>
                <select
                  value={newConsultation.type}
                  onChange={(e) => setNewConsultation({ ...newConsultation, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CONSULTATION">Consulta</option>
                  <option value="RETURN">Retorno</option>
                  <option value="EXAM">Exame</option>
                  <option value="PROCEDURE">Procedimento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={newConsultation.notes}
                  onChange={(e) => setNewConsultation({ ...newConsultation, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewConsultationForm(false)
                  setSelectedPatient(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateConsultation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Agendar Consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar consulta */}
      {editingConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar Consulta</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <BrazilianDateInput
                  value={editingConsultation.date}
                  onChange={(value) => setEditingConsultation({ ...editingConsultation, date: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário
                </label>
                <TimePicker
                  value={editingConsultation.time}
                  onChange={(value) => setEditingConsultation({ ...editingConsultation, time: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingConsultation.status}
                  onChange={(e) => setEditingConsultation({
                    ...editingConsultation,
                    status: e.target.value as 'agendada' | 'confirmada' | 'cancelada' | 'concluida'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="agendada">Agendada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={editingConsultation.notes || ''}
                  onChange={(e) => setEditingConsultation({ ...editingConsultation, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingConsultation(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateConsultation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
