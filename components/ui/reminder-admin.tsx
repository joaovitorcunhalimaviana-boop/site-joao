'use client'

import { useState, useEffect } from 'react'
import { formatDateToBrazilian } from '@/lib/date-utils'
import {
  ClockIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PlusIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

interface ReminderStats {
  total: number
  pending: number
  sent: number
  failed: number
  byType: Record<string, number>
}

interface UpcomingReminder {
  appointmentId: string
  reminderType: '24h'
  scheduledTime: string
  patientData: {
    patientName: string
    whatsapp: string
    appointmentDate: string
    appointmentTime: string
  }
  status: 'pending' | 'sent' | 'failed'
}

const ReminderAdmin: React.FC = () => {
  const [stats, setStats] = useState<ReminderStats | null>(null)
  const [upcomingReminders, setUpcomingReminders] = useState<
    UpcomingReminder[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    whatsapp: '',
    appointmentDate: '',
    appointmentTime: '',
    insuranceType: 'Unimed',
    email: '',
  })

  const loadData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reminder-system')
      const result = await response.json()

      if (result.success) {
        setStats(result.data.stats)
        setUpcomingReminders(result.data.upcoming)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkReminders = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reminder-system?action=check')
      const result = await response.json()

      if (result.success) {
        alert('✅ Verificação de lembretes executada!')
        await loadData() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao verificar lembretes:', error)
      alert('❌ Erro ao verificar lembretes')
    } finally {
      setIsLoading(false)
    }
  }

  const scheduleTestAppointment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reminder-system?action=test')
      const result = await response.json()

      if (result.success) {
        alert(
          `✅ Consulta de teste agendada!\nPaciente: ${result.data.patientName}\nData: ${result.data.appointmentDate} às ${result.data.appointmentTime}`
        )
        await loadData() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao agendar teste:', error)
      alert('❌ Erro ao agendar consulta de teste')
    } finally {
      setIsLoading(false)
    }
  }

  const scheduleAppointment = async () => {
    if (
      !newAppointment.patientName ||
      !newAppointment.whatsapp ||
      !newAppointment.appointmentDate ||
      !newAppointment.appointmentTime
    ) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/reminder-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'schedule',
          ...newAppointment,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(
          `✅ Consulta agendada com sucesso!\n${result.reminderCount} lembretes programados`
        )
        setShowScheduleForm(false)
        setNewAppointment({
          patientName: '',
          whatsapp: '',
          appointmentDate: '',
          appointmentTime: '',
          insuranceType: 'Unimed',
          email: '',
        })
        await loadData() // Recarregar dados
      } else {
        alert(`❌ Erro: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error)
      alert('❌ Erro ao agendar consulta')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getReminderTypeColor = (type: string) => {
    return 'text-blue-400' // Sempre azul para lembretes de 24h
  }

  const getReminderTypeIcon = (type: string) => {
    return <ClockIcon className='h-4 w-4' /> // Sempre ícone de relógio para lembretes de 24h
  }

  return (
    <div className='bg-gray-900 rounded-lg p-6 border border-gray-700'>
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-white flex items-center'>
            <ChartBarIcon className='h-5 w-5 mr-2' />
            Painel de Lembretes Automáticos (24h)
          </h3>
          <div className='flex space-x-2'>
            <button
              onClick={loadData}
              disabled={isLoading}
              className='px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </button>
            <button
              onClick={checkReminders}
              disabled={isLoading}
              className='px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center'
            >
              <PlayIcon className='h-4 w-4 mr-1' />
              Verificar Agora
            </button>
          </div>
        </div>

        {lastUpdate && (
          <p className='text-gray-400 text-sm'>
            Última atualização: {lastUpdate.toLocaleString('pt-BR')}
          </p>
        )}
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-gray-800 p-4 rounded-lg border border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Total</p>
                <p className='text-2xl font-bold text-white'>{stats.total}</p>
              </div>
              <ClockIcon className='h-8 w-8 text-gray-500' />
            </div>
          </div>

          <div className='bg-gray-800 p-4 rounded-lg border border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Pendentes</p>
                <p className='text-2xl font-bold text-yellow-400'>
                  {stats.pending}
                </p>
              </div>
              <BellIcon className='h-8 w-8 text-yellow-500' />
            </div>
          </div>

          <div className='bg-gray-800 p-4 rounded-lg border border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Enviados</p>
                <p className='text-2xl font-bold text-green-400'>
                  {stats.sent}
                </p>
              </div>
              <CheckCircleIcon className='h-8 w-8 text-green-500' />
            </div>
          </div>

          <div className='bg-gray-800 p-4 rounded-lg border border-gray-700'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Falharam</p>
                <p className='text-2xl font-bold text-red-400'>
                  {stats.failed}
                </p>
              </div>
              <XCircleIcon className='h-8 w-8 text-red-500' />
            </div>
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className='mb-6'>
        <h4 className='text-white font-medium mb-3'>Ações Rápidas</h4>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={scheduleTestAppointment}
            disabled={isLoading}
            className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm flex items-center'
          >
            <PlusIcon className='h-4 w-4 mr-1' />
            Agendar Teste
          </button>

          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm flex items-center'
          >
            <PlusIcon className='h-4 w-4 mr-1' />
            Nova Consulta
          </button>
        </div>
      </div>

      {/* Formulário de Nova Consulta */}
      {showScheduleForm && (
        <div className='mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700'>
          <h4 className='text-white font-medium mb-4'>Agendar Nova Consulta</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <input
              type='text'
              placeholder='Nome do Paciente *'
              value={newAppointment.patientName}
              onChange={e =>
                setNewAppointment({
                  ...newAppointment,
                  patientName: e.target.value,
                })
              }
              className='px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500'
            />
            <input
              type='text'
              placeholder='WhatsApp *'
              value={newAppointment.whatsapp}
              onChange={e =>
                setNewAppointment({
                  ...newAppointment,
                  whatsapp: e.target.value,
                })
              }
              className='px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500'
            />
            <input
              type='date'
              value={newAppointment.appointmentDate}
              onChange={e =>
                setNewAppointment({
                  ...newAppointment,
                  appointmentDate: e.target.value,
                })
              }
              className='px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500'
            />
            <input
              type='time'
              value={newAppointment.appointmentTime}
              onChange={e =>
                setNewAppointment({
                  ...newAppointment,
                  appointmentTime: e.target.value,
                })
              }
              className='px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500'
            />
            <select
              value={newAppointment.insuranceType}
              onChange={e =>
                setNewAppointment({
                  ...newAppointment,
                  insuranceType: e.target.value,
                })
              }
              className='px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500'
            >
              <option value='Unimed'>Unimed</option>
              <option value='Particular'>Particular</option>
            </select>
            <input
              type='email'
              placeholder='Email (opcional)'
              value={newAppointment.email}
              onChange={e =>
                setNewAppointment({ ...newAppointment, email: e.target.value })
              }
              className='px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex justify-end space-x-2 mt-4'>
            <button
              onClick={() => setShowScheduleForm(false)}
              className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
            >
              Cancelar
            </button>
            <button
              onClick={scheduleAppointment}
              disabled={isLoading}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50'
            >
              {isLoading ? 'Agendando...' : 'Agendar'}
            </button>
          </div>
        </div>
      )}

      {/* Próximos Lembretes */}
      <div>
        <h4 className='text-white font-medium mb-3'>
          Próximos Lembretes ({upcomingReminders.length})
        </h4>
        {upcomingReminders.length > 0 ? (
          <div className='space-y-2 max-h-64 overflow-y-auto'>
            {upcomingReminders.map((reminder, index) => (
              <div
                key={index}
                className='bg-gray-800 p-3 rounded border border-gray-700'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`flex items-center ${getReminderTypeColor(reminder.reminderType)}`}
                    >
                      {getReminderTypeIcon(reminder.reminderType)}
                      <span className='ml-1 text-sm font-medium'>
                        {reminder.reminderType}
                      </span>
                    </div>
                    <div>
                      <p className='text-white text-sm font-medium'>
                        {reminder.patientData.patientName}
                      </p>
                      <p className='text-gray-400 text-xs'>
                        Consulta:{' '}
                        {reminder.patientData.appointmentDate
                          .split('-')
                          .reverse()
                          .join('/')}{' '}
                        às {reminder.patientData.appointmentTime}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-gray-300 text-sm'>
                      {formatDateToBrazilian(new Date(reminder.scheduledTime))}
                    </p>
                    <p className='text-gray-400 text-xs'>
                      {new Intl.DateTimeFormat('pt-BR', {
                        timeZone: 'America/Sao_Paulo',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(reminder.scheduledTime))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8'>
            <BellIcon className='h-12 w-12 text-gray-500 mx-auto mb-2' />
            <p className='text-gray-400'>Nenhum lembrete agendado</p>
          </div>
        )}
      </div>

      <div className='mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg'>
        <p className='text-blue-200 text-sm'>
          <span className='font-medium'>💡 Dica:</span> O sistema agenda
          automaticamente lembretes de 24h para todas as consultas. Use
          "Verificar Agora" para processar lembretes pendentes.
        </p>
      </div>
    </div>
  )
}

export default ReminderAdmin
