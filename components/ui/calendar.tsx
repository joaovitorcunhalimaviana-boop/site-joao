'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface CalendarProps {
  onDateSelect: (date: Date) => void
  selectedDate?: Date
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

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

    // Only allow Mondays (1) and Thursdays (4)
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 1 && dayOfWeek !== 4) return false

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

    return true
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
                h-10 w-10 rounded-full text-sm font-medium transition-colors
                ${
                  selected
                    ? 'bg-blue-600 text-white'
                    : available
                      ? 'hover:bg-blue-900/50 text-white border border-gray-600'
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
      <div className='mt-4 text-xs text-gray-400 text-center'>
        <p>Atendimentos nas segundas e quintas-feiras</p>
        <p>Selecione uma data disponível</p>
      </div>
    </div>
  )
}

export default Calendar
