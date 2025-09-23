'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/ui/header'
import BackgroundPattern from '../../components/ui/background-pattern'
import BrazilianDatePicker from '../../components/ui/brazilian-date-picker'
import { TimePicker } from '../../components/ui/time-picker'
import MedicalAreaMenu from '../../components/ui/medical-area-menu'
import { 
  UserGroupIcon, 
  CalendarDaysIcon, 
  ArrowRightOnRectangleIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'



interface Doctor {
  name: string
  email: string
  specialty: string
  crm: string
}

interface Patient {
  id: string
  name: string
  phone: string
  whatsapp: string
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
  }
  birthDate?: string
  consultation?: {
    id: string
    time: string
    type: string
    status: string
  }
}

interface DashboardStats {
  totalPatients: number
  todayConsultations: number
  completedToday: number
}

export default function AreaMedicaPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [todayPatients, setTodayPatients] = useState<Patient[]>([])  
  const [attendedPatients, setAttendedPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayConsultations: 0,
    completedToday: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'all' | 'attended'>('today')
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [consultationType, setConsultationType] = useState('consulta')
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0')
  })

  const router = useRouter()

  console.log('🏥 Área Médica - Componente inicializado')

  // Verificar autenticação e carregar dados
  useEffect(() => {
    console.log('🔄 useEffect - Verificando autenticação e carregando dados')
    checkAuth()
    loadDashboardData()
    
    // Recarregar dados quando a página for focada novamente
    const handleFocus = () => {
      console.log('Página focada, recarregando dados...')
      loadDashboardData()
    }
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Página ficou visível, recarregando dados...')
        loadDashboardData()
      }
    }
    
    // Recarregar dados automaticamente a cada minuto
    const autoReloadInterval = setInterval(() => {
      console.log('Recarregamento automático dos dados...')
      loadDashboardData()
    }, 60000) // 1 minuto
    
    // Verificar mudança de dia e limpar dados à meia-noite
    const checkMidnight = () => {
      const now = new Date()
      const brasilia = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
      
      if (brasilia.getHours() === 0 && brasilia.getMinutes() === 0) {
        console.log('Meia-noite detectada - limpando dados do dia anterior')
        setAttendedPatients([]) // Limpar pacientes atendidos
        loadDashboardData() // Recarregar dados do novo dia
      }
    }
    
    // Verificar meia-noite a cada minuto
    const midnightInterval = setInterval(checkMidnight, 60000)
    
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(autoReloadInterval)
      clearInterval(midnightInterval)
    }
  }, [selectedDate])

  const checkAuth = async () => {
    // Sistema simplificado - verificar apenas se há dados do usuário
    const userData = localStorage.getItem('currentUser')
    
    if (userData) {
      const user = JSON.parse(userData)
      setDoctor({
        name: user.name || 'Dr. João Vítor da Cunha Lima Viana',
        email: user.email || 'joao.viana@clinica.com',
        specialty: 'Coloproctologista e Cirurgião Geral',
        crm: 'CRMPB 12831'
      })
    } else {
      // Definir dados padrão se não houver usuário logado
      setDoctor({
        name: 'Dr. João Vítor da Cunha Lima Viana',
        email: 'joao.viana@clinica.com',
        specialty: 'Coloproctologista e Cirurgião Geral',
        crm: 'CRMPB 12831'
      })
    }
  }

  const loadDashboardData = async () => {
    // Cancelar timeout anterior se existir
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
    }
    
    // Capturar o valor atual da data para evitar condições de corrida
    const currentSelectedDate = selectedDate
    
    // Debounce: aguardar 300ms antes de executar
     const timeout = setTimeout(async () => {
       setIsLoading(true)
       
       try {
      console.log('=== CARREGANDO DADOS (SISTEMA UNIFICADO) ===')
      console.log('Data selecionada:', currentSelectedDate)
      
      // Validar se a data está definida antes de fazer a requisição
      if (!currentSelectedDate || currentSelectedDate.trim() === '' || currentSelectedDate.length < 10) {
        console.log('Aguardando seleção de data válida:', currentSelectedDate)
        setIsLoading(false)
        return
      }
      
      // Carregar agenda diária do sistema unificado
      console.log('🔍 Fazendo requisição para:', `/api/unified-appointments?action=daily-agenda&date=${currentSelectedDate}`)
      const dailyAgendaResponse = await fetch(`/api/unified-appointments?action=daily-agenda&date=${currentSelectedDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache'
      })
      console.log('📡 Resposta da API:', dailyAgendaResponse.status, dailyAgendaResponse.statusText)
      
      if (dailyAgendaResponse.ok) {
        const dailyAgendaData = await dailyAgendaResponse.json()
        console.log('Agenda diária recebida:', dailyAgendaData.agenda)
        
        // Converter agendamentos para formato de pacientes
        const todayAppointments = dailyAgendaData.agenda.appointments || []
        const todayPatientsData = todayAppointments.map((apt: any) => ({
          id: apt.patientId,
          name: apt.patientName,
          phone: apt.patientPhone,
          whatsapp: apt.patientWhatsapp,
          email: apt.patientEmail,
          birthDate: apt.patientBirthDate,
          insurance: {
            type: apt.insuranceType || 'particular',
            plan: apt.insurancePlan || null
          },
          consultation: {
            id: apt.id,
            date: apt.appointmentDate,
            time: apt.appointmentTime,
            type: apt.appointmentType,
            status: apt.status,
            notes: apt.notes,
            insuranceType: apt.insuranceType,
            source: apt.source
          }
        }))
        
        // Separar pacientes por status
        const pendingPatientsData = todayPatientsData.filter((p: any) => 
          p.consultation?.status !== 'concluida' && p.consultation?.status !== 'cancelada'
        )
        const attendedPatientsData = todayPatientsData.filter((p: any) => 
          p.consultation?.status === 'concluida'
        )
        
        // Filtrar pacientes únicos para evitar duplicatas (mesmo paciente com múltiplas consultas)
        const uniquePendingPatients = pendingPatientsData.reduce((acc: any[], patient: any) => {
          if (!acc.find(p => p.id === patient.id)) {
            acc.push(patient)
          }
          return acc
        }, [])
        
        const uniqueAttendedPatients = attendedPatientsData.reduce((acc: any[], patient: any) => {
          if (!acc.find(p => p.id === patient.id)) {
            acc.push(patient)
          }
          return acc
        }, [])
        
        setTodayPatients(uniquePendingPatients)  // Só pacientes não atendidos únicos
        setAttendedPatients(uniqueAttendedPatients)
      } else {
        const errorText = await dailyAgendaResponse.text()
        console.error('❌ Erro ao carregar agenda diária:', dailyAgendaResponse.status, dailyAgendaResponse.statusText)
        console.error('❌ Conteúdo da resposta de erro:', errorText)
        // Tentar novamente após um pequeno delay
        setTimeout(() => {
          console.log('🔄 Tentando recarregar agenda diária...')
          loadDashboardData()
        }, 2000)
        return
      }

      // Carregar todos os pacientes do sistema unificado
      const allPatientsResponse = await fetch('/api/unified-appointments?action=all-patients', {
        credentials: 'include',
        cache: 'no-cache'
      })
      
      if (allPatientsResponse.ok) {
        const allPatientsData = await allPatientsResponse.json()
        console.log('Todos os pacientes recebidos:', allPatientsData.patients)
        
        // Converter para formato compatível
        const patientsFormatted = allPatientsData.patients.map((patient: any) => ({
          id: patient.id,
          name: patient.name,
          phone: patient.phone,
          whatsapp: patient.whatsapp,
          email: patient.email,
          birthDate: patient.birthDate,
          cpf: patient.cpf,
          insurance: patient.insurance,
          medicalRecord: patient.medicalRecord
        }))
        
        setPatients(patientsFormatted)
      }
      
      // Carregar estatísticas do sistema unificado
      const statsResponse = await fetch('/api/unified-appointments?action=stats', {
        credentials: 'include',
        cache: 'no-cache'
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('Estatísticas recebidas:', statsData.stats)
        
        setStats({
          totalPatients: statsData.stats.totalPatients || 0,
          todayConsultations: statsData.stats.pendingAppointments || 0,
          completedToday: statsData.stats.completedAppointments || 0
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // Verificar se é um erro de rede
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Erro de conexão com a API. Tentando novamente em 3 segundos...')
        setTimeout(() => {
          loadDashboardData()
        }, 3000)
      } else {
        // Para outros tipos de erro, definir dados padrão
        console.log('Definindo dados padrão devido ao erro:', error)
        setTodayPatients([])
        setAttendedPatients([])
        setPatients([])
        setStats({
          totalPatients: 0,
          todayConsultations: 0,
          completedToday: 0
        })
      }
      } finally {
        setIsLoading(false)
      }
    }, 300)
    
    setLoadingTimeout(timeout)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login-medico')
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const filteredPatients = (
    activeTab === 'today' ? todayPatients : 
    activeTab === 'attended' ? attendedPatients : 
    patients
  ).filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.whatsapp.includes(searchTerm)
  )

  const formatTime = (time: string) => {
    return time.substring(0, 5) // HH:MM
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-100 text-blue-800'
      case 'em-andamento': return 'bg-yellow-100 text-yellow-800'
      case 'concluida': return 'bg-green-100 text-green-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consulta': return 'bg-blue-50 text-blue-700'
      case 'retorno': return 'bg-green-50 text-green-700'
      case 'urgencia': return 'bg-red-50 text-red-700'
      case 'teleconsulta': return 'bg-purple-50 text-purple-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  const removeFromAgenda = async (patientId: string) => {
    const confirmRemove = window.confirm('Você quer realmente remover esse paciente da sua agenda de hoje?')
    if (!confirmRemove) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      console.log('🔍 Buscando agendamentos para:', today)
      
      // Buscar o agendamento do paciente para hoje no sistema unificado
      const appointmentsResponse = await fetch(`/api/unified-appointments?action=appointments-by-date&date=${today}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📡 Response status:', appointmentsResponse.status)
      
      if (!appointmentsResponse.ok) {
        const errorText = await appointmentsResponse.text()
        console.error('❌ Erro na resposta da API:', errorText)
        throw new Error(`Erro HTTP: ${appointmentsResponse.status} - ${errorText}`)
      }
      
      const data = await appointmentsResponse.json()
      console.log('📋 Dados recebidos:', data)
      
      const appointments = data.appointments || []
      const todayAppointment = appointments.find((apt: any) => 
        apt.patientId === patientId && apt.appointmentDate === today
      )
      
      console.log('🎯 Agendamento encontrado:', todayAppointment)
      
      if (todayAppointment) {
        console.log('🔄 Atualizando status para cancelada...')
        
        // Excluir completamente o agendamento
        const deleteResponse = await fetch('/api/unified-appointments', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'delete-appointment',
            appointmentId: todayAppointment.id
          })
        })
        
        console.log('📡 Delete response status:', deleteResponse.status)
        
        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text()
          console.error('❌ Erro ao excluir:', errorText)
          throw new Error(`Erro ao excluir: ${deleteResponse.status} - ${errorText}`)
        }
        
        const deleteResult = await deleteResponse.json()
        console.log('✅ Resultado da exclusão:', deleteResult)
        
        if (deleteResult.success) {
          loadDashboardData() // Recarregar dados
          alert('Paciente removido da agenda com sucesso!')
        } else {
          throw new Error(deleteResult.error || 'Erro desconhecido ao excluir')
        }
      } else {
        console.warn('⚠️ Agendamento não encontrado para hoje')
        alert('Agendamento não encontrado para hoje')
      }
    } catch (error) {
      console.error('❌ Erro completo ao remover da agenda:', error)
      
      // Mostrar erro mais detalhado para o usuário
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          alert('Erro de conexão com a API. Verifique sua conexão com a internet e tente novamente.')
          console.error('Erro de conexão com a API. Tentando novamente em 3 segundos...')
          
          // Tentar novamente após 3 segundos
          setTimeout(() => {
            removeFromAgenda(patientId)
          }, 3000)
        } else {
          alert(`Erro ao remover paciente: ${error.message}`)
        }
      } else {
        alert('Erro desconhecido ao remover paciente da agenda')
      }
    }
  }

  const openScheduleModal = (patientId: string) => {
    setSelectedPatientId(patientId)
    // Usar fuso horário de Brasília
    const today = new Date().toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-')
    setScheduleDate(today)
    setShowScheduleModal(true)
  }

  const closeScheduleModal = () => {
    setShowScheduleModal(false)
    setSelectedPatientId('')
    setScheduleDate('')
    setScheduleTime('09:00')
    setConsultationType('consulta')
  }

  const confirmSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Por favor, selecione data e horário')
      return
    }
    
    try {
      console.log('=== DEBUG AGENDAMENTO (SISTEMA UNIFICADO) ===')
      console.log('Data selecionada:', scheduleDate)
      console.log('Horário selecionado:', scheduleTime)
      console.log('Tipo:', consultationType)
      console.log('Paciente ID:', selectedPatientId)
      
      // Buscar dados do paciente
      const patientResponse = await fetch(`/api/unified-appointments?action=patient-by-id&patientId=${selectedPatientId}`)
      
      if (!patientResponse.ok) {
        alert('Erro ao buscar dados do paciente')
        return
      }
      
      const patientData = await patientResponse.json()
      const patient = patientData.patient
      
      // Criar agendamento no sistema unificado
      const response = await fetch('/api/unified-appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create-appointment',
          patientId: selectedPatientId,
          patientName: patient.name,
          patientPhone: patient.phone,
          patientWhatsapp: patient.whatsapp,
          patientEmail: patient.email,
          patientBirthDate: patient.birthDate,
          insuranceType: patient.insurance?.type || 'particular',
          insurancePlan: patient.insurance?.plan,
          appointmentDate: scheduleDate,
          appointmentTime: scheduleTime,
          appointmentType: consultationType,
          source: 'doctor_area',
          notes: 'Agendado pelo médico',
          createdBy: doctor?.email || 'doctor'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Agendamento criado no sistema unificado:', result)
        loadDashboardData() // Recarregar dados
        closeScheduleModal()
        alert('Paciente agendado com sucesso!')
      } else {
        const errorData = await response.json()
        console.error('Erro na resposta:', errorData)
        alert('Erro ao agendar paciente: ' + (errorData.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro ao adicionar à agenda:', error)
      alert('Erro ao agendar paciente')
    }
  }

  const startConsultation = (patientId: string) => {
    const confirmStart = window.confirm('Você quer realmente iniciar esse atendimento?')
    if (!confirmStart) return
    
    // Encontrar o agendamento do paciente para hoje
    const today = new Date().toISOString().split('T')[0]
    const todayPatient = todayPatients.find(p => p.id === patientId)
    
    if (todayPatient && todayPatient.consultation) {
      // Usar o ID do agendamento, não do paciente
      const appointmentId = todayPatient.consultation.id
      console.log('🚀 Iniciando atendimento - Patient ID:', patientId, 'Appointment ID:', appointmentId)
      router.push(`/area-medica/atendimento/${appointmentId}`)
    } else {
      console.error('❌ Agendamento não encontrado para o paciente:', patientId)
      alert('Erro: Agendamento não encontrado para este paciente.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando área médica...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <BackgroundPattern />
      <Header currentPage="area-medica" />
      
      <div className="relative isolate">
        
        {/* Header */}
        <div className="pt-20 pb-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700">
                  <UserIcon className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Área Médica</h1>
                  <p className="text-gray-300 text-lg mt-2">{doctor?.name} - {doctor?.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <span className="text-sm text-gray-300 bg-gray-900/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">{doctor?.crm}</span>
                
                <MedicalAreaMenu currentPage="dashboard" />
                
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all duration-200 border border-gray-700 backdrop-blur-sm"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-8">
          {/* Estatísticas Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-blue-900/20 rounded-xl">
                  <UserGroupIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total de Pacientes</p>
                  <p className="text-3xl font-bold text-white">{stats.totalPatients}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-blue-900/20 rounded-xl">
                  <CalendarDaysIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Pacientes a Atender</p>
                  <p className="text-3xl font-bold text-white">{stats.todayConsultations}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700">
              <div className="flex items-center">
                <div className="p-3 bg-blue-900/20 rounded-xl">
                  <UserIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Concluídas Hoje</p>
                  <p className="text-3xl font-bold text-white">{stats.completedToday}</p>
                </div>
              </div>
            </div>
          </div>



          {/* Seletor de Data */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Agenda do Dia</h3>
                <p className="text-gray-300">Selecione a data para visualizar os agendamentos</p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-300">Data:</label>
                <BrazilianDatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  placeholder="DD/MM/AAAA"
                />
              </div>
            </div>
          </div>

        {/* Tabs */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('today')}
                className={`py-5 px-8 text-sm font-semibold border-b-3 transition-all duration-200 ${
                  activeTab === 'today'
                    ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/30'
                }`}
              >
                Pacientes do Dia ({todayPatients.length})
              </button>
              <button
                onClick={() => setActiveTab('attended')}
                className={`py-5 px-8 text-sm font-semibold border-b-3 transition-all duration-200 ${
                  activeTab === 'attended'
                    ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/30'
                }`}
              >
                Atendidos ({attendedPatients.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-5 px-8 text-sm font-semibold border-b-3 transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/30'
                }`}
              >
                Todos os Pacientes ({patients.length})
              </button>
            </nav>
          </div>

          <div className="p-6">

            {/* Controles de Pacientes */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Buscar paciente por nome, telefone ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              <button
                onClick={() => router.push('/area-medica/novo-paciente')}
                className="ml-4 bg-blue-600/80 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-blue-500/50 backdrop-blur-sm"
              >
                + Novo Paciente
              </button>
            </div>

            {/* Lista de Pacientes */}
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      WhatsApp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Convênio
                    </th>
                    {activeTab === 'today' && (
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Consulta
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/30 backdrop-blur-sm divide-y divide-gray-700">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === 'today' ? 6 : 5} className="px-6 py-8 text-center">
                        <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">
                          {searchTerm ? 'Nenhum paciente encontrado' : 
                           activeTab === 'today' ? 'Nenhuma consulta agendada para hoje' : 
                           activeTab === 'attended' ? 'Nenhum paciente atendido hoje' :
                           'Nenhum paciente cadastrado'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-700/50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{patient.name}</div>
                            <div className="text-sm text-gray-300">{patient.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {patient.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {patient.whatsapp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {patient.insurance?.type === 'particular' ? 'Particular' : 
                           patient.insurance?.type === 'unimed' ? 'UNIMED' : 
                           patient.insurance?.plan || patient.insurance?.type || 'N/A'}
                        </td>
                        {activeTab === 'today' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {patient.consultation && (
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    getTypeColor(patient.consultation.type)
                                  }`}>
                                    {patient.consultation.type}
                                  </span>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    getStatusColor(patient.consultation.status)
                                  }`}>
                                    {patient.consultation.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 mt-1">
                                  {formatTime(patient.consultation.time)}
                                </p>
                              </div>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/prontuario/${patient.id}`)}
                            className="text-blue-400 hover:text-blue-300 mr-3 transition-colors duration-200"
                          >
                            Ver Prontuário
                          </button>
                          {activeTab === 'today' && patient.consultation ? (
                            <>
                              {patient.consultation.status === 'agendada' ? (
                                <>
                                  <button
                                    onClick={() => startConsultation(patient.id)}
                                    className="text-blue-400 hover:text-blue-300 mr-3 transition-colors duration-200"
                                  >
                                    Iniciar
                                  </button>
                                  <button
                                    onClick={() => removeFromAgenda(patient.id)}
                                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                  >
                                    Remover
                                  </button>
                                </>
                              ) : (
                                <span className="text-green-400 text-sm">Atendimento Concluído</span>
                              )}
                            </>
                          ) : (
                            activeTab === 'all' && !patient.consultation && (
                              <button
                                onClick={() => openScheduleModal(patient.id)}
                                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                              >
                                Agendar
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal de Agendamento */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md mx-4 border border-gray-700 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Agendar Consulta</h3>
                <button
                  onClick={closeScheduleModal}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data
                  </label>
                  <BrazilianDatePicker
                    value={scheduleDate}
                    onChange={setScheduleDate}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    placeholder="DD/MM/AAAA"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Horário
                  </label>
                  <TimePicker
                    value={scheduleTime}
                    onChange={setScheduleTime}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    placeholder="HH:MM"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Consulta
                  </label>
                  <select
                    value={consultationType}
                    onChange={(e) => setConsultationType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="consulta">Consulta</option>
                    <option value="retorno">Retorno</option>
                    <option value="urgencia">Urgência</option>
                    <option value="teleconsulta">Teleconsulta</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeScheduleModal}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSchedule}
                  className="px-6 py-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}