'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface CalendarProps {
  onDateSelect: (date: string) => void
  selectedDate?: string
}

interface PatientAppointment {
  id: string
  patientName: string
  status: 'agendada' | 'confirmada' | 'cancelada' | 'concluida'
  time: string
  date?: string
}

interface CalendarWithPatientsProps extends CalendarProps {
  appointments: PatientAppointment[]
}

export function InteractiveCalendar({
  onDateSelect,
  selectedDate,
  appointments,
}: CalendarWithPatientsProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateState, setSelectedDateState] = useState(selectedDate || '')

  const today = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Get previous month's last days to fill the calendar
  const prevMonth = new Date(currentYear, currentMonth - 1, 0)
  const daysInPrevMonth = prevMonth.getDate()

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

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

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

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day)
    const dateString = clickedDate.toISOString().split('T')[0]
    setSelectedDateState(dateString)
    onDateSelect(dateString)
  }

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    )
  }

  const isSelected = (day: number) => {
    const dateString = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split('T')[0]
    return selectedDateState === dateString
  }

  const hasAppointments = (day: number) => {
    const dateString = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split('T')[0]
    return appointments.some(apt => {
      // Se o appointment tem uma propriedade date, use ela
      if (apt.date) {
        return apt.date === dateString
      }
      // Caso contrário, assume que o id pode conter informação de data
      return apt.id === dateString
    })
  }

  // Generate calendar days
  const calendarDays: JSX.Element[] = []

  // Previous month's days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    calendarDays.push(
      <button
        key={`prev-${day}`}
        className='h-10 w-10 text-gray-500 hover:bg-gray-700/30 rounded-lg transition-colors'
        disabled
      >
        {day}
      </button>
    )
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const isCurrentDay = isToday(day)
    const isSelectedDay = isSelected(day)
    const hasAppts = hasAppointments(day)

    calendarDays.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`
          h-10 w-10 rounded-lg transition-all font-medium relative
          ${
            isSelectedDay
              ? 'bg-blue-500 text-white shadow-lg'
              : isCurrentDay
                ? 'bg-green-500 text-white'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
          }
          ${hasAppts ? 'ring-2 ring-blue-400' : ''}
        `}
      >
        {day}
        {hasAppts && (
          <div className='absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full'></div>
        )}
      </button>
    )
  }

  // Next month's days to fill the grid
  const remainingCells = 42 - calendarDays.length
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push(
      <button
        key={`next-${day}`}
        className='h-10 w-10 text-gray-500 hover:bg-gray-700/30 rounded-lg transition-colors'
        disabled
      >
        {day}
      </button>
    )
  }

  // Get appointments for selected date
  const selectedDateAppointments = selectedDateState
    ? appointments.filter(apt => {
        if (apt.date) {
          return apt.date === selectedDateState
        }
        return apt.id === selectedDateState
      })
    : []

  return (
    <div className='bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-xl font-semibold text-white'>
          Calendário de Agendamentos
        </h3>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Calendar */}
        <div>
          {/* Calendar Header */}
          <div className='flex items-center justify-between mb-4'>
            <button
              onClick={() => navigateMonth('prev')}
              className='p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors'
            >
              <ChevronLeftIcon className='h-5 w-5' />
            </button>

            <h4 className='text-lg font-semibold text-white'>
              {monthNames[currentMonth]} {currentYear}
            </h4>

            <button
              onClick={() => navigateMonth('next')}
              className='p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors'
            >
              <ChevronRightIcon className='h-5 w-5' />
            </button>
          </div>

          {/* Week days */}
          <div className='grid grid-cols-7 gap-1 mb-2'>
            {weekDays.map(day => (
              <div
                key={day}
                className='h-8 flex items-center justify-center text-sm font-medium text-gray-400'
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className='grid grid-cols-7 gap-1'>{calendarDays}</div>

          {/* Legend */}
          <div className='mt-4 flex flex-wrap gap-4 text-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <span className='text-gray-300'>Hoje</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
              <span className='text-gray-300'>Selecionado</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 border-2 border-blue-400 rounded-full'></div>
              <span className='text-gray-300'>Com agendamentos</span>
            </div>
          </div>
        </div>

        {/* Selected Date Appointments */}
        <div>
          <h4 className='text-lg font-semibold text-white mb-4'>
            {selectedDateState
              ? `Agendamentos - ${new Date(selectedDateState + 'T00:00:00').toLocaleDateString('pt-BR')}`
              : 'Selecione uma data'}
          </h4>

          {selectedDateState ? (
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {selectedDateAppointments.length > 0 ? (
                selectedDateAppointments.map((appointment, index) => {
                  const isPast =
                    new Date(selectedDateState) <
                    new Date(new Date().toISOString().split('T')[0])
                  const isCompleted = appointment.status === 'concluida'

                  return (
                    <div
                      key={index}
                      className={`
                        p-4 rounded-lg border transition-all
                        ${
                          isPast || isCompleted
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        }
                      `}
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium'>
                            {appointment.patientName}
                          </p>
                          <p className='text-sm opacity-75'>
                            {appointment.time}
                          </p>
                        </div>
                        <div
                          className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${
                            isPast || isCompleted
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }
                        `}
                        >
                          {isPast || isCompleted ? 'Atendido' : 'Agendado'}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className='text-center py-8 text-gray-400'>
                  <p>Nenhum agendamento para esta data</p>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-400'>
              <p>Clique em uma data no calendário para ver os agendamentos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
