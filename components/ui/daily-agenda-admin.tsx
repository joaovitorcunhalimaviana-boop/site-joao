'use client'

import { useState, useEffect } from 'react'
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import {
  checkPendingDailyAgendas,
  scheduleMultipleDailyAgendas,
} from '../../lib/daily-agenda-scheduler'
import { formatDateTimeToBrazilian } from '@/lib/date-utils'

interface DailyAgendaStats {
  totalScheduled: number
  todaysSent: number
  upcomingAgendas: number
}

const DailyAgendaAdmin: React.FC = () => {
  const [stats, setStats] = useState<DailyAgendaStats>({
    totalScheduled: 0,
    todaysSent: 0,
    upcomingAgendas: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [testDate, setTestDate] = useState('')
  const [lastAgendaSent, setLastAgendaSent] = useState<string | null>(null)

  useEffect(() => {
    loadStats()

    // Definir data padrão para amanhã
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setTestDate(tomorrow.toISOString().split('T')[0])
  }, [])

  const loadStats = async () => {
    try {
      // Simular estatísticas (em produção, viria de uma API)
      setStats({
        totalScheduled: 0,
        todaysSent: 0,
        upcomingAgendas: 0,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const checkPendingAgendas = async () => {
    setIsLoading(true)
    try {
      await checkPendingDailyAgendas()
      alert(
        '✅ Verificação de agendas pendentes concluída! Verifique o console para detalhes.'
      )
      await loadStats()
    } catch (error) {
      console.error('Erro ao verificar agendas pendentes:', error)
      alert('❌ Erro ao verificar agendas pendentes')
    } finally {
      setIsLoading(false)
    }
  }

  const sendTestAgenda = async () => {
    if (!testDate) {
      alert('Por favor, selecione uma data para teste')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/daily-agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetDate: testDate,
          appointments: [
            {
              patientName: 'Paciente Teste',
              appointmentTime: '09:00',
              whatsapp: '(83) 99999-9999',
              insuranceType: 'private',
            },
            {
              patientName: 'Outro Paciente',
              appointmentTime: '14:30',
              whatsapp: '(83) 88888-8888',
              insuranceType: 'unimed',
            },
          ],
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(
          `✅ Agenda de teste enviada com sucesso!\n\nData: ${testDate}\nPacientes: ${result.totalPatients}\n\nVerifique o Telegram para ver a mensagem.`
        )
        setLastAgendaSent(formatDateTimeToBrazilian(new Date()))
        await loadStats()
      } else {
        alert(`❌ Erro ao enviar agenda de teste: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao enviar agenda de teste:', error)
      alert('❌ Erro ao enviar agenda de teste')
    } finally {
      setIsLoading(false)
    }
  }

  const scheduleAllPendingAgendas = async () => {
    setIsLoading(true)
    try {
      // Buscar todas as consultas futuras
      const response = await fetch(
        '/api/reminder-system?action=upcoming&limit=100'
      )
      const result = await response.json()

      if (result.success && result.data) {
        const futureAppointments = result.data
          .filter((reminder: any) => {
            const appointmentDate = new Date(
              reminder.patientData?.appointmentDate
            )
            return appointmentDate > new Date()
          })
          .map((reminder: any) => ({
            patientName:
              reminder.patientData?.patientName ||
              reminder.patientData?.fullName,
            appointmentDate: reminder.patientData?.appointmentDate,
            appointmentTime: reminder.patientData?.appointmentTime,
            whatsapp: reminder.patientData?.whatsapp,
            insuranceType:
              reminder.patientData?.insuranceType === 'particular'
                ? 'private'
                : 'unimed',
          }))

        if (futureAppointments.length > 0) {
          await scheduleMultipleDailyAgendas(futureAppointments)
          alert(
            `✅ ${futureAppointments.length} agendas diárias foram programadas!\n\nVerifique o console para detalhes dos agendamentos.`
          )
        } else {
          alert('ℹ️ Nenhuma consulta futura encontrada para agendar.')
        }
      }

      await loadStats()
    } catch (error) {
      console.error('Erro ao agendar todas as agendas:', error)
      alert('❌ Erro ao agendar todas as agendas pendentes')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-3'>
          <CalendarDaysIcon className='h-8 w-8 text-blue-400' />
          <div>
            <h2 className='text-2xl font-bold text-white'>
              Painel de Agenda Diária
            </h2>
            <p className='text-gray-400'>
              Sistema automático de agenda via Telegram
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
        <div className='bg-gray-800 border border-gray-600 rounded-lg p-4'>
          <div className='flex items-center space-x-3'>
            <CalendarDaysIcon className='h-6 w-6 text-blue-400' />
            <div>
              <p className='text-sm text-gray-400'>Agendas Programadas</p>
              <p className='text-2xl font-bold text-white'>
                {stats.totalScheduled}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-gray-800 border border-gray-600 rounded-lg p-4'>
          <div className='flex items-center space-x-3'>
            <CheckCircleIcon className='h-6 w-6 text-green-400' />
            <div>
              <p className='text-sm text-gray-400'>Enviadas Hoje</p>
              <p className='text-2xl font-bold text-white'>
                {stats.todaysSent}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-gray-800 border border-gray-600 rounded-lg p-4'>
          <div className='flex items-center space-x-3'>
            <ClockIcon className='h-6 w-6 text-yellow-400' />
            <div>
              <p className='text-sm text-gray-400'>Próximas Agendas</p>
              <p className='text-2xl font-bold text-white'>
                {stats.upcomingAgendas}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className='space-y-6'>
        {/* Verificar Agendas Pendentes */}
        <div className='bg-gray-800 border border-gray-600 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Verificar Agendas Pendentes
          </h3>
          <p className='text-gray-300 mb-4'>
            Verifica se há agendas que deveriam ter sido enviadas e as envia
            imediatamente.
          </p>
          <button
            onClick={checkPendingAgendas}
            disabled={isLoading}
            className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors'
          >
            {isLoading ? 'Verificando...' : 'Verificar Agendas Pendentes'}
          </button>
        </div>

        {/* Teste de Agenda */}
        <div className='bg-gray-800 border border-gray-600 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Teste de Agenda Diária
          </h3>
          <p className='text-gray-300 mb-4'>
            Envia uma agenda de teste para a data selecionada com pacientes
            fictícios.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 items-end'>
            <div className='flex-1'>
              <label
                htmlFor='testDate'
                className='block text-sm font-medium text-gray-300 mb-2'
              >
                Data para Teste
              </label>
              <input
                type='date'
                id='testDate'
                value={testDate}
                onChange={e => setTestDate(e.target.value)}
                className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <button
              onClick={sendTestAgenda}
              disabled={isLoading || !testDate}
              className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors'
            >
              {isLoading ? 'Enviando...' : 'Enviar Teste'}
            </button>
          </div>
          {lastAgendaSent && (
            <p className='text-sm text-green-400 mt-2'>
              ✅ Última agenda de teste enviada: {lastAgendaSent}
            </p>
          )}
        </div>

        {/* Agendar Todas as Agendas */}
        <div className='bg-gray-800 border border-gray-600 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Agendar Todas as Agendas Futuras
          </h3>
          <p className='text-gray-300 mb-4'>
            Programa automaticamente agendas diárias para todas as consultas
            futuras já cadastradas.
          </p>
          <button
            onClick={scheduleAllPendingAgendas}
            disabled={isLoading}
            className='bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors'
          >
            {isLoading ? 'Agendando...' : 'Agendar Todas as Agendas'}
          </button>
        </div>
      </div>

      {/* Informações */}
      <div className='mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg'>
        <p className='text-blue-200 text-sm'>
          <span className='font-medium'>📅 Como funciona:</span> O sistema envia
          automaticamente uma agenda via Telegram às 20:00 do dia anterior a
          cada consulta, listando todos os pacientes agendados para aquela data.
        </p>
      </div>
    </div>
  )
}

export default DailyAgendaAdmin
