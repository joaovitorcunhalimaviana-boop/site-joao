'use client'

import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface CalendarProps {
  onDateSelect: (date: Date) => void
  selectedDate?: Date
}

interface ScheduleSlot {
  id: string
  date: string
  time: string
  isActive: boolean
  createdAt: string
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const today = new Date()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Load available dates from schedule slots
  useEffect(() => {
    loadAvailableDates()
  }, [currentMonth])

  const loadAvailableDates = async () => {
    setIsLoading(true)
    console.log('🔄 [Calendar] Carregando datas disponíveis...')
    try {
      const response = await fetch('/api/schedule-slots')
      console.log('📡 [Calendar] Resposta da API:', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📦 [Calendar] Dados recebidos:', data)

        if (data.success) {
          console.log('✅ [Calendar] Total de slots:', data.slots.length)

          // Extract unique dates from active slots
          const dates = data.slots
            .filter((slot: ScheduleSlot) => {
              console.log('🔍 [Calendar] Verificando slot:', {
                date: slot.date,
                time: slot.time,
                isActive: slot.isActive
              })
              return slot.isActive
            })
            .map((slot: ScheduleSlot) => slot.date)

          console.log('📅 [Calendar] Datas extraídas (com duplicatas):', dates)

          // Remove duplicates
          const uniqueDates = [...new Set(dates)]
          console.log('✨ [Calendar] Datas únicas:', uniqueDates)

          setAvailableDates(uniqueDates)
        }
      }
    } catch (error) {
      console.error('❌ [Calendar] Erro ao carregar datas disponíveis:', error)
      // Fallback: no available dates
      setAvailableDates([])
    }
    setIsLoading(false)
    console.log('🏁 [Calendar] Carregamento finalizado')
  }

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Generate calendar days
  const calendarDays: (Date | null)[] = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day))
  }

  const monthNames = [
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

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const isDateAvailable = (date: Date) => {
    if (!date) return false

    // Skip past dates (compare only date part, not time)
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
    if (dateOnly < todayOnly) return false

    // Check if date is in available dates from schedule slots
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
    const isAvailable = availableDates.includes(dateStr)

    // Debug log for specific dates
    if (date.getDate() === 13 || date.getDate() === 20 || date.getDate() === 27) {
      console.log('🔎 [Calendar] Verificando disponibilidade:', {
        dia: date.getDate(),
        dateStr: dateStr,
        availableDates: availableDates,
        isAvailable: isAvailable
      })
    }

    return isAvailable
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const handleDateClick = (date: Date) => {
    if (!date || !isDateAvailable(date)) {
      return
    }

    // Create a new Date object to avoid reference issues
    const selectedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
    onDateSelect(selectedDate)
  }

  return (
    <div className='bg-gray-900/50 backdrop-blur-sm rounded-lg shadow-lg p-6 max-w-md mx-auto border border-gray-700'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <button
          onClick={goToPreviousMonth}
          className='p-2 hover:bg-gray-800 rounded-full transition-colors'
        >
          <ChevronLeftIcon className='h-5 w-5 text-gray-300' />
        </button>

        <h2 className='text-lg font-semibold text-white'>
          {monthNames[month]} {year}
        </h2>

        <button
          onClick={goToNextMonth}
          className='p-2 hover:bg-gray-800 rounded-full transition-colors'
        >
          <ChevronRightIcon className='h-5 w-5 text-gray-300' />
        </button>
      </div>

      {/* Day names */}
      <div className='grid grid-cols-7 gap-1 mb-2'>
        {dayNames.map(day => (
          <div
            key={day}
            className='text-center text-sm font-medium text-gray-400 py-2'
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className='grid grid-cols-7 gap-1'>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={index} className='h-10' />
          }

          const available = isDateAvailable(date)
          const selected = isDateSelected(date)

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={!available}
              className={`
                h-10 w-10 rounded-full text-sm font-medium transition-all duration-200
                ${
                  selected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 ring-2 ring-blue-400'
                    : available
                      ? 'bg-green-600/80 text-white hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/50 border-2 border-green-400 font-bold'
                      : 'text-gray-600 cursor-not-allowed'
                }
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className='mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700'>
        <p className='text-sm font-medium text-white mb-3 text-center'>Legenda:</p>
        <div className='flex flex-col gap-2 text-xs'>
          <div className='flex items-center justify-center gap-2'>
            <div className='w-6 h-6 rounded-full bg-green-600/80 border-2 border-green-400'></div>
            <span className='text-gray-300'>Datas com horários disponíveis</span>
          </div>
          <div className='flex items-center justify-center gap-2'>
            <div className='w-6 h-6 rounded-full bg-blue-600 ring-2 ring-blue-400'></div>
            <span className='text-gray-300'>Data selecionada</span>
          </div>
          <div className='flex items-center justify-center gap-2'>
            <div className='w-6 h-6 rounded-full text-gray-600 flex items-center justify-center text-[10px]'>X</div>
            <span className='text-gray-300'>Datas indisponíveis</span>
          </div>
        </div>
        {isLoading && (
          <p className='text-center text-blue-400 mt-3 animate-pulse'>
            Carregando datas disponíveis...
          </p>
        )}
        {!isLoading && availableDates.length === 0 && (
          <p className='text-center text-yellow-400 mt-3'>
            ⚠️ Nenhuma data disponível. Contate o médico.
          </p>
        )}
        {!isLoading && availableDates.length > 0 && (
          <p className='text-center text-green-400 mt-3'>
            ✅ {availableDates.length} data{availableDates.length > 1 ? 's' : ''} disponível{availableDates.length > 1 ? 'eis' : ''}
          </p>
        )}
      </div>
    </div>
  )
}

export default Calendar
