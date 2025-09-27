'use client'

import { useState, useEffect } from 'react'

interface TimeSlot {
  time: string
  available: boolean
}

interface TimeSlotsProps {
  selectedDate: Date
  onTimeSelect: (time: string) => void
  selectedTime?: string
}

const TimeSlots: React.FC<TimeSlotsProps> = ({
  selectedDate,
  onTimeSelect,
  selectedTime,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load available time slots when selectedDate changes
  useEffect(() => {
    loadTimeSlots()
  }, [selectedDate])

  const loadTimeSlots = async () => {
    setIsLoading(true)
    try {
      // Buscar slots da API
      const response = await fetch('/api/schedule-slots')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const selectedDateStr = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
          
          // Filtrar slots para a data selecionada e que estejam ativos
          const availableSlots = data.slots
            .filter((slot: any) => slot.date === selectedDateStr && slot.isActive)
            .map((slot: any) => ({
              time: slot.time,
              available: true,
            }))
          
          setTimeSlots(availableSlots)
          setIsLoading(false)
          return
        }
      }
    } catch (error) {
      console.error('Erro ao buscar slots da API:', error)
    }

    // Se não conseguir carregar da API, não mostrar horários
    setTimeSlots([])
    setIsLoading(false)
  }

  // All slots are afternoon slots now
  const afternoonSlots = timeSlots

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const handleTimeClick = (time: string, available: boolean) => {
    if (available) {
      onTimeSelect(time)
    }
  }

  return (
    <div className='bg-gray-900 rounded-lg shadow-lg p-6 max-w-2xl mx-auto border border-gray-700'>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-white mb-2'>
          Horários Disponíveis
        </h2>
        <p className='text-gray-300 capitalize'>{formatDate(selectedDate)}</p>
      </div>

      {/* Afternoon slots */}
      <div>
        <h3 className='text-lg font-medium text-white mb-4 flex items-center'>
          <span className='inline-block w-3 h-3 bg-blue-400 rounded-full mr-2'></span>
          Tarde
        </h3>
      {/* Loading state */}
      {isLoading ? (
        <div className='flex justify-center items-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400'></div>
          <span className='ml-3 text-gray-300'>Carregando horários...</span>
        </div>
      ) : afternoonSlots.length === 0 ? (
        <div className='text-center py-8'>
          <p className='text-gray-400'>Nenhum horário disponível para este dia.</p>
        </div>
      ) : (
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3'>
          {afternoonSlots.map(slot => {
            const isSelected = selectedTime === slot.time
            return (
              <button
                key={slot.time}
                onClick={() => handleTimeClick(slot.time, slot.available)}
                disabled={!slot.available}
                className={`
                  px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md transform scale-105'
                      : slot.available
                        ? 'bg-gray-800 text-white hover:bg-blue-900/50 border border-gray-600 hover:border-blue-400'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                  }
                `}
              >
                {slot.time}
              </button>
            )
          })}
        </div>
      )}
      </div>

      {/* Legend */}
      <div className='mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700'>
        <p className='text-sm text-gray-300 mb-2'>
          <span className='font-medium'>Legenda:</span>
        </p>
        <div className='flex flex-wrap gap-4 text-xs text-gray-300'>
          <div className='flex items-center'>
            <div className='w-3 h-3 bg-blue-600 rounded mr-2'></div>
            <span>Selecionado</span>
          </div>
          <div className='flex items-center'>
            <div className='w-3 h-3 bg-gray-800 border border-gray-600 rounded mr-2'></div>
            <span>Disponível</span>
          </div>
          <div className='flex items-center'>
            <div className='w-3 h-3 bg-gray-700 rounded mr-2'></div>
            <span>Indisponível</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimeSlots
