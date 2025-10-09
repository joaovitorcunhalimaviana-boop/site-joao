'use client'

import { useState } from 'react'
import {
  ArrowPathIcon,
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface RescheduleDemoProps {
  patientData?: {
    fullName: string
    whatsapp: string
    selectedDate: string
    selectedTime: string
  }
}

const RescheduleDemo: React.FC<RescheduleDemoProps> = ({ patientData }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [showNewDateForm, setShowNewDateForm] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  const handleRescheduleAction = async (
    action: 'request' | 'confirm' | 'cancel'
  ) => {
    if (!patientData) {
      alert('Dados do paciente não disponíveis')
      return
    }

    if (action === 'confirm' && (!newDate || !newTime)) {
      alert('Para confirmar reagendamento, informe nova data e horário')
      return
    }

    setIsLoading(true)

    try {
      const requestBody: any = {
        fullName: patientData.fullName,
        whatsapp: patientData.whatsapp,
        currentDate: patientData.selectedDate,
        currentTime: patientData.selectedTime,
        action,
      }

      if (action === 'confirm') {
        requestBody.newDate = newDate
        requestBody.newTime = newTime
      }

      const response = await fetch('/api/reschedule-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (response.ok) {
        console.log(`✅ Reagendamento ${action} processado com sucesso!`)
        console.log('🔗 Link para paciente:', result.patientWhatsAppLink)
        console.log('🔗 Link para médico:', result.doctorWhatsAppLink)
        console.log('📱 Mensagem para paciente:', result.patientMessage)
        console.log('📱 Mensagem para médico:', result.doctorMessage)

        setLastResult(result)
        setShowNewDateForm(false)
        setNewDate('')
        setNewTime('')

        const actionText = {
          request: 'Solicitação de reagendamento',
          confirm: 'Reagendamento confirmado',
          cancel: 'Cancelamento processado',
        }[action]

        alert(
          `✅ ${actionText}!\n\nVerifique o console (F12) para os links do WhatsApp.`
        )
      } else {
        console.log('❌ Erro no reagendamento:', result.error)
        alert('❌ Erro no reagendamento. Verifique o console.')
      }
    } catch (error) {
      console.error('❌ Erro na comunicação:', error)
      alert('❌ Erro na comunicação. Verifique o console.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!patientData) {
    return (
      <div className='bg-gray-900 rounded-lg p-6 border border-gray-700'>
        <div className='text-center'>
          <ArrowPathIcon className='h-12 w-12 text-gray-500 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-white mb-2'>
            Sistema de Reagendamento
          </h3>
          <p className='text-gray-400'>
            Complete um agendamento para testar o sistema de reagendamento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gray-900 rounded-lg p-6 border border-gray-700'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-white mb-2 flex items-center'>
          <ArrowPathIcon className='h-5 w-5 mr-2' />
          Sistema de Reagendamento
        </h3>
        <p className='text-gray-400 text-sm'>
          Gerencie reagendamentos e cancelamentos para:{' '}
          <span className='text-white font-medium'>{patientData.fullName}</span>
        </p>
      </div>

      <div className='bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700'>
        <h4 className='font-medium text-white mb-3'>Consulta Atual:</h4>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
          <p className='text-gray-300'>
            <span className='text-white'>Paciente:</span> {patientData.fullName}
          </p>
          <p className='text-gray-300'>
            <span className='text-white'>WhatsApp:</span> {patientData.whatsapp}
          </p>
          <p className='text-gray-300'>
            <span className='text-white'>Data:</span> {patientData.selectedDate}
          </p>
          <p className='text-gray-300'>
            <span className='text-white'>Horário:</span>{' '}
            {patientData.selectedTime}
          </p>
        </div>
      </div>

      <div className='space-y-4'>
        <h4 className='font-medium text-white'>Ações Disponíveis:</h4>

        {/* Solicitar Reagendamento */}
        <div className='flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700'>
          <div className='flex items-center'>
            <CalendarIcon className='h-5 w-5 text-blue-400 mr-3' />
            <div>
              <p className='text-white font-medium'>Solicitar Reagendamento</p>
              <p className='text-gray-400 text-sm'>
                Paciente solicita mudança de data/horário
              </p>
            </div>
          </div>
          <button
            onClick={() => handleRescheduleAction('request')}
            disabled={isLoading}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm'
          >
            {isLoading ? 'Processando...' : 'Solicitar'}
          </button>
        </div>

        {/* Confirmar Reagendamento */}
        <div className='p-4 bg-gray-800 rounded-lg border border-gray-700'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center'>
              <CheckCircleIcon className='h-5 w-5 text-green-400 mr-3' />
              <div>
                <p className='text-white font-medium'>
                  Confirmar Reagendamento
                </p>
                <p className='text-gray-400 text-sm'>
                  Confirmar nova data e horário
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNewDateForm(!showNewDateForm)}
              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm'
            >
              {showNewDateForm ? 'Cancelar' : 'Confirmar'}
            </button>
          </div>

          {showNewDateForm && (
            <div className='mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Nova Data
                  </label>
                  <input
                    type='date'
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Novo Horário
                  </label>
                  <input
                    type='time'
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  />
                </div>
              </div>
              <button
                onClick={() => handleRescheduleAction('confirm')}
                disabled={isLoading || !newDate || !newTime}
                className='w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Confirmando...' : 'Confirmar Reagendamento'}
              </button>
            </div>
          )}
        </div>

        {/* Cancelar Consulta */}
        <div className='flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700'>
          <div className='flex items-center'>
            <XMarkIcon className='h-5 w-5 text-red-400 mr-3' />
            <div>
              <p className='text-white font-medium'>Cancelar Consulta</p>
              <p className='text-gray-400 text-sm'>
                Cancelar definitivamente a consulta
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja cancelar a consulta?')) {
                handleRescheduleAction('cancel')
              }
            }}
            disabled={isLoading}
            className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm'
          >
            {isLoading ? 'Cancelando...' : 'Cancelar'}
          </button>
        </div>
      </div>

      {lastResult && (
        <div className='mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg'>
          <div className='flex items-center mb-2'>
            <CheckCircleIcon className='h-5 w-5 text-green-400 mr-2' />
            <p className='text-green-200 font-medium'>
              Ação '{lastResult.action}' processada com sucesso!
            </p>
          </div>
          <p className='text-green-300 text-sm'>
            Verifique o console para os links do WhatsApp gerados
          </p>
        </div>
      )}

      <div className='mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg'>
        <p className='text-yellow-200 text-sm'>
          <span className='font-medium'>⚠️ Importante:</span> Este é um sistema
          de demonstração. Em produção, estas ações seriam integradas com a
          agenda médica e sistema de notificações automáticas.
        </p>
      </div>
    </div>
  )
}

export default RescheduleDemo
