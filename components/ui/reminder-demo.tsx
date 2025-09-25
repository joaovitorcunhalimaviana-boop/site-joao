'use client'

import { useState } from 'react'
import {
  ClockIcon,
  BellIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface ReminderDemoProps {
  patientData?: {
    fullName: string
    whatsapp: string
    selectedDate: string
    selectedTime: string
    insuranceType: string
  }
}

const ReminderDemo: React.FC<ReminderDemoProps> = ({ patientData }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const sendReminder = async (reminderType: '24h') => {
    if (!patientData) {
      alert('Dados do paciente não disponíveis')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/appointment-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...patientData,
          reminderType,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        console.log(`✅ Lembrete ${reminderType} gerado com sucesso!`)
        console.log('🔗 Link WhatsApp:', result.reminderWhatsAppLink)
        console.log('📱 Mensagem:', result.reminderMessage)

        setLastResult(result)

        alert(
          `✅ Lembrete ${reminderType} gerado!\n\nVerifique o console (F12) para o link do WhatsApp.`
        )
      } else {
        console.log('❌ Erro ao gerar lembrete:', result.error)
        alert('❌ Erro ao gerar lembrete. Verifique o console.')
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
          <BellIcon className='h-12 w-12 text-gray-500 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-white mb-2'>
            Sistema de Lembretes
          </h3>
          <p className='text-gray-400'>
            Complete um agendamento para testar os lembretes automáticos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gray-900 rounded-lg p-6 border border-gray-700'>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-white mb-2 flex items-center'>
          <BellIcon className='h-5 w-5 mr-2' />
          Sistema de Lembretes Automáticos
        </h3>
        <p className='text-gray-400 text-sm'>
          Teste os diferentes tipos de lembretes para:{' '}
          <span className='text-white font-medium'>{patientData.fullName}</span>
        </p>
      </div>

      <div className='bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700'>
        <h4 className='font-medium text-white mb-3'>Dados da Consulta:</h4>
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
        <h4 className='font-medium text-white'>Tipos de Lembrete:</h4>

        {/* Lembrete 24h */}
        <div className='flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700'>
          <div className='flex items-center'>
            <ClockIcon className='h-5 w-5 text-blue-400 mr-3' />
            <div>
              <p className='text-white font-medium'>Lembrete 24 horas</p>
              <p className='text-gray-400 text-sm'>
                Enviado 1 dia antes da consulta
              </p>
            </div>
          </div>
          <button
            onClick={() => sendReminder('24h')}
            disabled={isLoading}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm'
          >
            {isLoading ? 'Enviando...' : 'Testar'}
          </button>
        </div>
      </div>

      {lastResult && (
        <div className='mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg'>
          <div className='flex items-center mb-2'>
            <CheckCircleIcon className='h-5 w-5 text-green-400 mr-2' />
            <p className='text-green-200 font-medium'>
              Último lembrete enviado com sucesso!
            </p>
          </div>
          <p className='text-green-300 text-sm'>
            Tipo: {lastResult.reminderType} | Verifique o console para o link do
            WhatsApp
          </p>
        </div>
      )}

      <div className='mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg'>
        <p className='text-blue-200 text-sm'>
          <span className='font-medium'>💡 Dica:</span> Em produção, estes
          lembretes seriam enviados automaticamente nos horários programados.
          Use F12 para ver os links gerados no console.
        </p>
      </div>
    </div>
  )
}

export default ReminderDemo
