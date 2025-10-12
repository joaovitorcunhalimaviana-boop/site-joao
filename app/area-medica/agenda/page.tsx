'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../../../components/ui/header'
import BackgroundPattern from '../../../components/ui/background-pattern'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import {
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

interface Doctor {
  name: string
  email: string
  specialty: string
  crm: string
}

interface ScheduleSlot {
  id: string
  date: string // Data específica no formato YYYY-MM-DD
  time: string
  isActive: boolean
  createdAt: string
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function AgendaManagementPageContent() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '09:00',
    displayDate: '', // Para mostrar no formato brasileiro
  })
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Detectar se veio da área da secretária
  const fromSecretary = searchParams.get('from') === 'secretary'

  // Funções utilitárias para o calendário
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const parseDate = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00')
  }

  // Função para formatar data no padrão brasileiro
  const formatDateBR = (dateString: string): string => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  // Função para converter data brasileira para ISO
  const parseDateBR = (dateStringBR: string): string => {
    if (!dateStringBR || dateStringBR.length !== 10) return ''
    const [day, month, year] = dateStringBR.split('/')
    if (
      !day ||
      !month ||
      !year ||
      day.length !== 2 ||
      month.length !== 2 ||
      year.length !== 4
    ) {
      return ''
    }
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isToday = (date: string): boolean => {
    return date === formatDate(new Date())
  }

  const isPastDate = (date: string): boolean => {
    return new Date(date) < new Date(formatDate(new Date()))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const isAuthenticated = await checkAuth()
      if (isAuthenticated) {
        loadScheduleSlots()
      }
    }
    initializeAuth()
  }, [])

  const checkAuth = async () => {
    let doctorData = localStorage.getItem('doctor')
    if (doctorData) {
      setDoctor(JSON.parse(doctorData))
      return true
    }
    
    // Se não há dados no localStorage, tentar obter do servidor
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated && data.user) {
          const doctorInfo = {
            name: data.user.name,
            email: data.user.email,
            specialty: 'Coloproctologia',
            crm: 'CRM/DF 12345'
          }
          localStorage.setItem('doctor', JSON.stringify(doctorInfo))
          setDoctor(doctorInfo)
          return true
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    }
    
    // Se chegou até aqui, não está autenticado
    router.push('/login-medico')
    return false
  }

  const loadScheduleSlots = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/schedule-slots')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('Slots carregados da API:', data.slots)
          setScheduleSlots(data.slots)
        } else {
          console.error('Erro ao carregar slots:', data.error)
          // Começar com array vazio em vez de slots padrão
          console.log('Iniciando com array vazio')
          setScheduleSlots([])
        }
      } else {
        throw new Error('Falha na requisição')
      }
    } catch (error) {
      console.error('Erro ao carregar slots:', error)
      // Começar com array vazio em vez de slots padrão
      console.log('Erro na requisição - iniciando com array vazio')
      setScheduleSlots([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSlot = async () => {
    console.log('Tentando adicionar slot:', newSlot)

    if (!newSlot.date || !newSlot.time) {
      console.log('Dados faltando - date:', newSlot.date, 'time:', newSlot.time)
      showMessage('error', 'Por favor, selecione uma data e horário.')
      return
    }

    // Validar se a data está no formato correto e não é passada
    const selectedDate = new Date(newSlot.date + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isNaN(selectedDate.getTime())) {
      console.log('Data inválida:', newSlot.date)
      showMessage(
        'error',
        'Por favor, insira uma data válida no formato DD/MM/AAAA.'
      )
      return
    }

    if (selectedDate < today) {
      showMessage('error', 'Não é possível agendar horários em datas passadas.')
      return
    }

    // Verificar se já existe um slot para esta data e horário
    const existingSlot = scheduleSlots.find(
      slot => slot.date === newSlot.date && slot.time === newSlot.time
    )

    if (existingSlot) {
      showMessage(
        'error',
        'Já existe um horário agendado para esta data e hora.'
      )
      return
    }

    try {
      console.log('Enviando para API:', {
        date: newSlot.date,
        time: newSlot.time,
      })

      const response = await fetch('/api/schedule-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: newSlot.date,
          time: newSlot.time,
        }),
      })

      const data = await response.json()
      console.log('Resposta da API:', data)

      if (data.success) {
        // Recarregar todos os slots da API
        await loadScheduleSlots()
        setShowAddModal(false)
        setNewSlot({ date: '', time: '09:00', displayDate: '' })
        showMessage('success', 'Horário adicionado com sucesso!')
      } else {
        showMessage('error', data.error || 'Erro ao adicionar horário')
      }
    } catch (error) {
      console.error('Erro ao adicionar horário:', error)
      showMessage('error', 'Erro de conexão. Tente novamente.')
    }
  }

  const toggleSlotStatus = async (slotId: string) => {
    try {
      const response = await fetch(`/api/schedule-slots/${slotId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setScheduleSlots(prev =>
            prev.map(slot =>
              slot.id === slotId ? { ...slot, isActive: !slot.isActive } : slot
            )
          )
          setMessage({
            type: 'success',
            text: 'Status do horário atualizado com sucesso!',
          })
        } else {
          setMessage({
            type: 'error',
            text: data.error || 'Erro ao atualizar status do horário.',
          })
        }
      } else {
        throw new Error('Falha na requisição')
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      // Fallback: atualizar localmente
      setScheduleSlots(prev =>
        prev.map(slot =>
          slot.id === slotId ? { ...slot, isActive: !slot.isActive } : slot
        )
      )
      setMessage({
        type: 'success',
        text: 'Status do horário atualizado com sucesso!',
      })
    }
  }

  const deleteScheduleSlot = async (slotId: string) => {
    try {
      console.log('Tentando remover slot:', slotId)
      const response = await fetch(`/api/schedule-slots/${slotId}`, {
        method: 'DELETE',
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data)
        if (data.success) {
          setScheduleSlots(prev => prev.filter(slot => slot.id !== slotId))
          setMessage({
            type: 'success',
            text: 'Horário removido com sucesso!',
          })
        } else {
          setMessage({
            type: 'error',
            text: data.error || 'Erro ao remover horário.',
          })
        }
      } else {
        const errorData = await response.text()
        console.error('Erro na resposta:', errorData)
        throw new Error(`Falha na requisição: ${response.status}`)
      }
    } catch (error) {
      console.error('Erro ao remover slot:', error)
      setMessage({
        type: 'error',
        text: `Erro ao remover slot: ${error}`,
      })
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const getSlotsForDate = (date: string) => {
    return (scheduleSlots || [])
      .filter(slot => slot.date === date)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDayOfMonth = getFirstDayOfMonth(currentDate)

    const days: JSX.Element[] = []

    // Dias vazios no início do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className='h-24 p-2'></div>)
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(new Date(year, month, day))
      const daySlots = getSlotsForDate(date)
      const isSelected = selectedDate === date
      const isPast = isPastDate(date)
      const isTodayDate = isToday(date)

      days.push(
        <div
          key={day}
          className={`h-24 p-2 border border-gray-700/30 rounded-lg cursor-pointer transition-all duration-300 ${
            isSelected
              ? 'bg-blue-900/40 border-blue-500/50 shadow-lg shadow-blue-500/25'
              : isPast
                ? 'bg-gray-800/20 border-gray-600/20 cursor-not-allowed opacity-50'
                : 'bg-gray-800/30 hover:bg-gray-700/40 hover:border-gray-600/50'
          } ${isTodayDate ? 'ring-2 ring-blue-400/50' : ''}`}
          onClick={() => !isPast && setSelectedDate(isSelected ? null : date)}
        >
          <div className='flex justify-between items-start mb-1'>
            <span
              className={`text-sm font-medium ${
                isTodayDate
                  ? 'text-blue-400'
                  : isPast
                    ? 'text-gray-500'
                    : 'text-white'
              }`}
            >
              {day}
            </span>
            {daySlots.length > 0 && (
              <span className='text-xs bg-blue-600/80 text-white px-1.5 py-0.5 rounded-full'>
                {daySlots.length}
              </span>
            )}
          </div>
          <div className='space-y-1'>
            {daySlots.slice(0, 2).map(slot => (
              <div
                key={slot.id}
                className={`text-xs px-2 py-1 rounded-md ${
                  slot.isActive
                    ? 'bg-green-600/80 text-white'
                    : 'bg-gray-600/80 text-gray-300'
                }`}
              >
                {slot.time}
              </div>
            ))}
            {daySlots.length > 2 && (
              <div className='text-xs text-gray-400 px-2'>
                +{daySlots.length - 2} mais
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const activeSlots =
    scheduleSlots?.filter(slot => slot.isActive && !isPastDate(slot.date))
      ?.length || 0
  const inactiveSlots =
    scheduleSlots?.filter(slot => !slot.isActive && !isPastDate(slot.date))
      ?.length || 0

  if (!doctor) {
    return null
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      <BackgroundPattern />
      <Header />

      <div className='relative z-10 container mx-auto px-4 py-8 pt-24'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Menu Lateral ou Botão Voltar */}
          <div className='lg:w-1/4'>
            {fromSecretary ? (
              <button
                onClick={() => router.push('/area-secretaria')}
                className='flex items-center gap-3 px-4 py-3 bg-gray-800/60 hover:bg-gray-700/60 text-white rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500'
              >
                <ArrowLeftIcon className='h-5 w-5' />
                Voltar para Área da Secretária
              </button>
            ) : (
              <MedicalAreaMenu />
            )}
          </div>

          {/* Conteudo Principal */}
          <div className='lg:w-3/4'>
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h1 className='text-2xl font-bold text-white flex items-center'>
                    <div className='p-2 bg-blue-900/20 rounded-lg mr-3'>
                      <CalendarDaysIcon className='h-6 w-6 text-blue-400' />
                    </div>
                    Gestão de Agenda
                  </h1>
                  <p className='text-gray-300 mt-2'>
                    Gerencie os horários disponíveis para agendamento por data
                    específica
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25'
                >
                  <PlusIcon className='h-5 w-5 mr-2' />
                  Adicionar Horário
                </button>
              </div>

              {/* Mensagem de Feedback */}
              {message && (
                <div
                  className={`mb-6 p-4 rounded-lg backdrop-blur-sm ${
                    message.type === 'success'
                      ? 'bg-green-900/30 border border-green-700/50 text-green-300'
                      : 'bg-red-900/30 border border-red-700/50 text-red-300'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {isLoading ? (
                <div className='flex justify-center items-center py-12'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400'></div>
                  <span className='ml-3 text-gray-300'>
                    Carregando horários...
                  </span>
                </div>
              ) : (
                <>
                  {/* Navegação do Calendário */}
                  <div className='mb-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <h2 className='text-xl font-semibold text-white flex items-center'>
                        <div className='p-2 bg-blue-900/20 rounded-lg mr-3'>
                          <CalendarDaysIcon className='h-5 w-5 text-blue-400' />
                        </div>
                        Calendário de Agendamentos
                      </h2>
                      <div className='flex items-center space-x-4'>
                        <button
                          onClick={() => navigateMonth('prev')}
                          className='p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-300 border border-gray-600/30'
                        >
                          <ChevronLeftIcon className='h-5 w-5 text-gray-300' />
                        </button>
                        <span className='text-lg font-medium text-white min-w-[200px] text-center'>
                          {MONTHS[currentDate.getMonth()]}{' '}
                          {currentDate.getFullYear()}
                        </span>
                        <button
                          onClick={() => navigateMonth('next')}
                          className='p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-300 border border-gray-600/30'
                        >
                          <ChevronRightIcon className='h-5 w-5 text-gray-300' />
                        </button>
                      </div>
                    </div>

                    {/* Cabeçalho dos dias da semana */}
                    <div className='grid grid-cols-7 gap-2 mb-2'>
                      {DAYS_OF_WEEK.map(day => (
                        <div
                          key={day}
                          className='text-center text-sm font-medium text-gray-400 py-2'
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Grade do calendário */}
                    <div className='grid grid-cols-7 gap-2 mb-6'>
                      {renderCalendar()}
                    </div>
                  </div>

                  {/* Detalhes da data selecionada */}
                  {selectedDate && (
                    <div className='mb-6'>
                      <div className='bg-blue-900/10 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30'>
                        <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                          <div className='p-2 bg-blue-900/30 rounded-lg mr-3'>
                            <ClockIcon className='h-5 w-5 text-blue-400' />
                          </div>
                          Horários para{' '}
                          {new Date(
                            selectedDate + 'T00:00:00'
                          ).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h3>

                        <div className='flex items-center justify-between mb-4'>
                          <p className='text-gray-300'>
                            Gerencie os horários disponíveis para esta data
                            específica
                          </p>
                          <button
                            onClick={() => {
                              setNewSlot({
                                date: selectedDate,
                                time: '09:00',
                                displayDate: formatDateBR(selectedDate),
                              })
                              setShowAddModal(true)
                            }}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25'
                          >
                            <PlusIcon className='h-4 w-4 mr-2' />
                            Adicionar Horário
                          </button>
                        </div>

                        <div className='space-y-3'>
                          {getSlotsForDate(selectedDate).map(slot => (
                            <div
                              key={slot.id}
                              className={`flex items-center justify-between p-4 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                                slot.isActive
                                  ? 'bg-green-900/20 border border-green-700/40 hover:bg-green-900/30'
                                  : 'bg-gray-800/40 border border-gray-600/40 hover:bg-gray-800/60'
                              }`}
                            >
                              <div className='flex items-center'>
                                <span
                                  className={`inline-block w-3 h-3 rounded-full mr-3 ${
                                    slot.isActive
                                      ? 'bg-green-400'
                                      : 'bg-gray-400'
                                  }`}
                                ></span>
                                <span className='text-white font-medium text-lg'>
                                  {slot.time}
                                </span>
                                <span
                                  className={`ml-3 px-2 py-1 rounded-full text-xs ${
                                    slot.isActive
                                      ? 'bg-green-600/80 text-white'
                                      : 'bg-gray-600/80 text-gray-300'
                                  }`}
                                >
                                  {slot.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <button
                                  onClick={() => toggleSlotStatus(slot.id)}
                                  className={`p-2 rounded-lg transition-all duration-300 ${
                                    slot.isActive
                                      ? 'text-yellow-400 hover:bg-yellow-900/30 hover:shadow-lg hover:shadow-yellow-500/25'
                                      : 'text-green-400 hover:bg-green-900/30 hover:shadow-lg hover:shadow-green-500/25'
                                  }`}
                                  title={slot.isActive ? 'Desativar' : 'Ativar'}
                                >
                                  {slot.isActive ? (
                                    <XMarkIcon className='h-5 w-5' />
                                  ) : (
                                    <CheckIcon className='h-5 w-5' />
                                  )}
                                </button>
                                <button
                                  onClick={() => deleteScheduleSlot(slot.id)}
                                  className='p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25'
                                  title='Remover'
                                >
                                  <TrashIcon className='h-5 w-5' />
                                </button>
                              </div>
                            </div>
                          ))}

                          {getSlotsForDate(selectedDate).length === 0 && (
                            <div className='text-center py-8 text-gray-400'>
                              <ClockIcon className='h-12 w-12 mx-auto mb-3 opacity-50' />
                              <p>Nenhum horário cadastrado para esta data</p>
                              <p className='text-sm mt-1'>
                                Clique em "Adicionar Horário" para começar
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resumo dos horários */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                    <div className='bg-green-900/20 backdrop-blur-sm rounded-xl p-6 border border-green-700/30 hover:bg-green-900/25 transition-all duration-300'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-green-300 text-sm font-medium'>
                            Horários Ativos
                          </p>
                          <p className='text-2xl font-bold text-white'>
                            {activeSlots}
                          </p>
                        </div>
                        <div className='p-3 bg-green-900/30 rounded-xl'>
                          <CheckIcon className='h-6 w-6 text-green-400' />
                        </div>
                      </div>
                    </div>

                    <div className='bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30 hover:bg-gray-800/40 transition-all duration-300'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-gray-300 text-sm font-medium'>
                            Horários Inativos
                          </p>
                          <p className='text-2xl font-bold text-white'>
                            {inactiveSlots}
                          </p>
                        </div>
                        <div className='p-3 bg-gray-700/30 rounded-xl'>
                          <XMarkIcon className='h-6 w-6 text-gray-400' />
                        </div>
                      </div>
                    </div>

                    <div className='bg-blue-900/20 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30 hover:bg-blue-900/25 transition-all duration-300'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-blue-300 text-sm font-medium'>
                            Total de Horários
                          </p>
                          <p className='text-2xl font-bold text-white'>
                            {scheduleSlots?.length || 0}
                          </p>
                        </div>
                        <div className='p-3 bg-blue-900/30 rounded-xl'>
                          <CalendarDaysIcon className='h-6 w-6 text-blue-400' />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Horário */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl'>
            <h2 className='text-xl font-bold text-white mb-4 flex items-center'>
              <div className='p-2 bg-blue-900/20 rounded-lg mr-3'>
                <PlusIcon className='h-5 w-5 text-blue-400' />
              </div>
              Adicionar Horário
            </h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Data
                </label>
                <input
                  type='text'
                  placeholder='dd/mm/aaaa'
                  value={newSlot.displayDate}
                  onChange={e => {
                    const value = e.target.value
                    // Permitir apenas números e barras
                    const cleanValue = value.replace(/[^\d/]/g, '')

                    // Aplicar máscara DD/MM/YYYY
                    let maskedValue = cleanValue
                    if (
                      cleanValue.length >= 2 &&
                      cleanValue.charAt(2) !== '/'
                    ) {
                      maskedValue =
                        cleanValue.slice(0, 2) + '/' + cleanValue.slice(2)
                    }
                    if (
                      cleanValue.length >= 5 &&
                      cleanValue.charAt(5) !== '/'
                    ) {
                      maskedValue =
                        maskedValue.slice(0, 5) + '/' + maskedValue.slice(5)
                    }
                    if (maskedValue.length > 10) {
                      maskedValue = maskedValue.slice(0, 10)
                    }

                    setNewSlot({
                      ...newSlot,
                      displayDate: maskedValue,
                      date:
                        maskedValue.length === 10
                          ? parseDateBR(maskedValue)
                          : '',
                    })
                  }}
                  className='w-full bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Horário
                </label>
                <div className='flex space-x-2'>
                  <select
                    value={newSlot.time.split(':')[0]}
                    onChange={e => {
                      const hour = e.target.value.padStart(2, '0')
                      const minute = newSlot.time.split(':')[1] || '00'
                      setNewSlot({ ...newSlot, time: `${hour}:${minute}` })
                    }}
                    className='flex-1 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300'
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, '0')}>
                        {i.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className='flex items-center text-gray-300 px-2'>
                    :
                  </span>
                  <select
                    value={newSlot.time.split(':')[1] || '00'}
                    onChange={e => {
                      const hour = newSlot.time.split(':')[0] || '09'
                      const minute = e.target.value
                      setNewSlot({ ...newSlot, time: `${hour}:${minute}` })
                    }}
                    className='flex-1 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300'
                  >
                    {['00', '15', '30', '45'].map(minute => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewSlot({ date: '', time: '09:00', displayDate: '' })
                }}
                className='px-4 py-2 text-gray-300 hover:text-white transition-colors hover:bg-gray-800/30 rounded-lg'
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSlot}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25'
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AgendaManagementPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-black flex items-center justify-center'>
          <div className='text-white'>Carregando...</div>
        </div>
      }
    >
      <AgendaManagementPageContent />
    </Suspense>
  )
}
