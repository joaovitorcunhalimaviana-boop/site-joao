'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/ui/header'
import { InteractiveCalendar } from '../../../components/ui/interactive-calendar'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import {
  ArrowLeftIcon,
  UserGroupIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

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
}

interface Consultation {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  type: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'agendada' | 'confirmada' | 'cancelada' | 'concluida'
  notes?: string
}

interface PatientAppointment {
  id: string
  patientName: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'agendada' | 'confirmada' | 'cancelada' | 'concluida'
  time: string
  date?: string
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
  }
}

export default function RelatoriosPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<
    PatientAppointment[]
  >([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = () => {
      // Sistema simplificado - verificar apenas se há dados do usuário
      const userData = localStorage.getItem('currentUser')
      
      if (userData) {
        const user = JSON.parse(userData)
        console.log('Usuário logado:', user.username)
        setIsAuthenticated(true)
      } else {
        // Para desenvolvimento, permitir acesso sem autenticação
        console.log('Acesso permitido para desenvolvimento')
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      loadDailyAppointments()
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadDayAppointments(selectedDate)
  }, [selectedDate, consultations])

  const loadDailyAppointments = async () => {
    try {
      setIsLoading(true)
      
      // Usar a mesma API que o dashboard médico
      const response = await fetch('/api/unified-appointments?action=all-appointments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Dados recebidos da API unified-appointments:', data)
        
        if (data.success && data.appointments) {
          // Converter agendamentos para formato de consultas
          const consultationsData = data.appointments.map((apt: any) => ({
            id: apt.id,
            patientId: apt.patientId,
            patientName: apt.patientName,
            date: apt.appointmentDate,
            time: apt.appointmentTime,
            type: apt.appointmentType,
            status: apt.status,
            notes: apt.notes || '',
          }))
          
          setConsultations(consultationsData)
          console.log('Consultas carregadas:', consultationsData.length)
        } else {
          console.warn('Formato de dados inesperado:', data)
          setConsultations([])
        }
      } else {
        console.error('Erro na resposta da API:', response.status, response.statusText)
        setConsultations([])
      }
    } catch (error) {
      console.error('Erro ao carregar consultas:', error)
      setConsultations([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadDayAppointments = (date: string) => {
    const dayAppointments = consultations.filter(consultation => {
      const consultationDate = new Date(consultation.date + 'T12:00:00-03:00')
      const selectedDateObj = new Date(date + 'T12:00:00-03:00')
      return consultationDate.toDateString() === selectedDateObj.toDateString()
    })

    const appointments: PatientAppointment[] = dayAppointments.map(
      consultation => ({
        id: consultation.id,
        patientName: consultation.patientName,
        status: consultation.status,
        time: consultation.time,
        date: consultation.date,
        insurance: {
          type: 'particular', // Valor padrão, você pode ajustar conforme necessário
        },
      })
    )

    setSelectedDayAppointments(appointments)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    const dayAppointments = consultations.filter(consultation => {
      const consultationDate = new Date(consultation.date + 'T12:00:00-03:00')
      const selectedDateObj = new Date(date + 'T12:00:00-03:00')
      return consultationDate.toDateString() === selectedDateObj.toDateString()
    })

    if (dayAppointments.length > 0) {
      setShowModal(true)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
      case 'scheduled':
        return 'bg-green-900/20 text-green-400 border border-green-700'
      case 'agendada':
        return 'bg-blue-900/20 text-blue-400 border border-blue-700'
      case 'concluida':
      case 'completed':
        return 'bg-purple-900/20 text-purple-400 border border-purple-700'
      case 'cancelada':
      case 'cancelled':
        return 'bg-red-900/20 text-red-400 border border-red-700'
      default:
        return 'bg-gray-900/20 text-gray-400 border border-gray-700'
    }
  }

  const getInsuranceLabel = (insurance: { type: string; plan?: string }) => {
    switch (insurance.type) {
      case 'particular':
        return 'Particular'
      case 'unimed':
        return `Unimed${insurance.plan ? ` - ${insurance.plan}` : ''}`
      case 'outro':
        return insurance.plan || 'Outro convênio'
      default:
        return 'Não informado'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'Confirmada'
      case 'agendada':
        return 'Agendada'
      case 'concluida':
        return 'Concluída'
      case 'cancelada':
        return 'Cancelada'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black'>
        <Header />
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto'></div>
            <p className='mt-4 text-gray-400'>Carregando relatórios...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black overflow-visible'>
      <Header />

      <div className='mx-auto max-w-7xl px-6 lg:px-8 py-8 pt-24 overflow-visible'>
        <div className='mb-8 overflow-visible'>
          <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-8 relative overflow-visible'>
            <div className='flex justify-between items-center relative z-[99999] overflow-visible'>
              <div className='flex items-center'>
                <div>
                  <h1 className='text-4xl font-bold text-white mb-3 flex items-center'>
                    <div className='p-3 bg-blue-900/20 rounded-xl mr-4'>
                      <ChartBarIcon className='h-8 w-8 text-blue-400' />
                    </div>
                    Relatórios de Atendimentos
                  </h1>
                  <p className='text-gray-300 text-lg'>
                    Calendário de consultas e atendimentos
                  </p>
                </div>
              </div>
              <MedicalAreaMenu currentPage='relatorios' />
            </div>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center text-gray-300 bg-gray-800/30 px-4 py-2 rounded-xl'>
                <CalendarDaysIcon className='h-5 w-5 mr-2' />
                <span className='text-sm'>
                  {new Intl.DateTimeFormat('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'America/Sao_Paulo',
                  }).format(new Date(selectedDate + 'T12:00:00-03:00'))}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Calendário */}
          <div className='lg:col-span-2'>
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-6'>
              <div className='mb-6'>
                <h2 className='text-xl font-semibold text-white mb-3 flex items-center'>
                  <div className='p-2 bg-blue-900/20 rounded-lg mr-3'>
                    <CalendarDaysIcon className='h-5 w-5 text-blue-400' />
                  </div>
                  Calendário de Atendimentos
                </h2>
                <p className='text-sm text-gray-300'>
                  Clique em um dia com atendimentos para ver os detalhes
                </p>
              </div>
              <InteractiveCalendar
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
                appointments={consultations.map(consultation => ({
                  id: consultation.id,
                  date: consultation.date,
                  patientName: consultation.patientName,
                  status: consultation.status as 'scheduled' | 'completed' | 'cancelled',
                  time: consultation.time,
                }))}
              />
            </div>
          </div>

          {/* Detalhes do dia selecionado */}
          <div className='lg:col-span-1'>
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-6'>
              <h2 className='text-xl font-semibold text-white mb-6 flex items-center'>
                <div className='p-2 bg-blue-900/20 rounded-lg mr-3'>
                  <ClockIcon className='h-5 w-5 text-blue-400' />
                </div>
                Atendimentos do Dia
              </h2>

              {selectedDayAppointments.length > 0 ? (
                <div className='space-y-4'>
                  {selectedDayAppointments.map((appointment, index) => (
                    <div
                      key={index}
                      className='bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600 hover:bg-gray-700/50 transition-all duration-200'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <h3 className='font-medium text-white'>
                          {appointment.patientName}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${getStatusColor(appointment.status)}`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      <div className='space-y-2 text-sm text-gray-300'>
                        <div className='flex items-center'>
                          <ClockIcon className='h-4 w-4 mr-2 text-blue-400' />
                          <span>{appointment.time}</span>
                        </div>
                        <div className='flex items-center'>
                          <UserGroupIcon className='h-4 w-4 mr-2 text-blue-400' />
                          <span>
                            {getInsuranceLabel(appointment.insurance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center text-gray-400 py-8'>
                  <div className='p-4 bg-blue-900/10 rounded-xl mb-4'>
                    <CalendarDaysIcon className='h-12 w-12 mx-auto text-blue-400/50' />
                  </div>
                  <p>Nenhum atendimento neste dia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalhes do dia */}
      {showModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl'>
            <div className='flex justify-between items-center p-6 border-b border-gray-700'>
              <h2 className='text-xl font-semibold text-white flex items-center'>
                <div className='p-2 bg-blue-900/20 rounded-lg mr-3'>
                  <CalendarDaysIcon className='h-5 w-5 text-blue-400' />
                </div>
                Atendimentos -{' '}
                {new Date(selectedDate).toLocaleDateString('pt-BR')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <XMarkIcon className='h-6 w-6' />
              </button>
            </div>
            <div className='p-6'>
              {selectedDayAppointments.length > 0 ? (
                <div className='space-y-4'>
                  {selectedDayAppointments.map((appointment, index) => (
                    <div
                      key={index}
                      className='bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <h3 className='font-medium text-white'>
                          {appointment.patientName}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${getStatusColor(appointment.status)}`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      <div className='space-y-2 text-sm text-gray-300'>
                        <div className='flex items-center'>
                          <ClockIcon className='h-4 w-4 mr-2 text-blue-400' />
                          <span>{appointment.time}</span>
                        </div>
                        <div className='flex items-center'>
                          <UserGroupIcon className='h-4 w-4 mr-2 text-blue-400' />
                          <span>
                            {getInsuranceLabel(appointment.insurance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center text-gray-400 py-8'>
                  <div className='p-4 bg-blue-900/10 rounded-xl mb-4'>
                    <CalendarDaysIcon className='h-12 w-12 mx-auto text-blue-400/50' />
                  </div>
                  <p>Nenhum atendimento neste dia</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
