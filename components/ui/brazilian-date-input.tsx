'use client'

import React, { useState, useEffect } from 'react'
import {
  isoDateToBrazilian,
  brazilianDateToISO,
  brazilianDateToISOBrasilia,
  formatDateToISO,
  getBrasiliaDate,
} from '../../lib/date-utils'

interface BrazilianDateInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
  required?: boolean
  min?: string
  placeholder?: string
}

export function BrazilianDateInput({
  value,
  onChange,
  className = '',
  required = false,
  min,
  placeholder = 'dd/mm/aaaa',
}: BrazilianDateInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Converte formato brasileiro (DD/MM/YYYY) para ISO (YYYY-MM-DD) usando date-utils
  const brazilianToISOLocal = (brazilianDate: string): string => {
    if (!brazilianDate) return ''
    const cleanDate = brazilianDate.replace(/\D/g, '')
    if (cleanDate.length !== 8) return ''

    const day = cleanDate.substring(0, 2)
    const month = cleanDate.substring(2, 4)
    const year = cleanDate.substring(4, 8)

    // Validação básica
    if (parseInt(day) > 31 || parseInt(month) > 12) return ''

    // Usar a função do date-utils que considera o fuso horário de Brasília
    const formattedDate = `${day}/${month}/${year}`
    return brazilianDateToISOBrasilia(formattedDate)
  }

  // Formatar entrada enquanto digita
  const formatInput = (input: string): string => {
    const numbers = input.replace(/\D/g, '')
    let formatted = ''

    for (let i = 0; i < numbers.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formatted += '/'
      }
      formatted += numbers[i]
    }

    return formatted
  }

  useEffect(() => {
    if (value && !isFocused) {
      setDisplayValue(isoDateToBrazilian(value))
    }
  }, [value, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatInput(inputValue)
    setDisplayValue(formatted)

    // Se a data está completa, converte para ISO e chama onChange
    if (formatted.length === 10) {
      const isoDate = brazilianToISOLocal(formatted)
      if (isoDate) {
        onChange(isoDate)
      }
    } else if (inputValue === '') {
      onChange('')
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (value) {
      setDisplayValue(isoDateToBrazilian(value))
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (displayValue.length === 10) {
      const isoDate = brazilianToISOLocal(displayValue)
      if (isoDate) {
        onChange(isoDate)
      }
    }
  }

  return (
    <input
      type='text'
      value={displayValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      required={required}
      placeholder={placeholder}
      maxLength={10}
    />
  )
}
