import React, { useState, useRef, useEffect } from 'react'

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
  placeholder?: string
  required?: boolean
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'HH:MM',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Horários sugeridos comuns
  const commonTimes = [
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
  ]

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatTime = (time: string): string => {
    // Remove caracteres não numéricos
    const numbers = time.replace(/\D/g, '')

    if (numbers.length === 0) return ''
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 4) {
      const hours = numbers.slice(0, 2)
      const minutes = numbers.slice(2)
      return `${hours}:${minutes}`
    }

    // Limita a 4 dígitos
    const hours = numbers.slice(0, 2)
    const minutes = numbers.slice(2, 4)
    return `${hours}:${minutes}`
  }

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTime(e.target.value)
    setInputValue(formatted)

    if (validateTime(formatted) || formatted === '') {
      onChange(formatted)
    }
  }

  const handleTimeSelect = (time: string) => {
    setInputValue(time)
    onChange(time)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setIsOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className='relative'>
      <div className='relative'>
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`${className} pr-10`}
          maxLength={5}
        />
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className='absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto'
        >
          <div className='p-2'>
            <div className='text-xs text-gray-400 mb-2 px-2'>
              Horários sugeridos:
            </div>
            <div className='grid grid-cols-3 gap-1'>
              {commonTimes.map(time => (
                <button
                  key={time}
                  type='button'
                  onClick={() => handleTimeSelect(time)}
                  className='px-2 py-1 text-sm text-white hover:bg-gray-600 rounded transition-colors text-center'
                >
                  {time}
                </button>
              ))}
            </div>
            <div className='mt-3 pt-2 border-t border-gray-600'>
              <div className='text-xs text-gray-400 px-2 mb-1'>
                💡 Dica: Digite qualquer horário (ex: 15:45)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
