import React, { useState, useEffect } from 'react'
import { Input } from './input'

interface BrazilianDatePickerProps {
  value: string // formato YYYY-MM-DD
  onChange: (value: string) => void // retorna formato YYYY-MM-DD
  className?: string
  placeholder?: string
  required?: boolean
  min?: string
  max?: string
}

export function BrazilianDatePicker({
  value,
  onChange,
  className = '',
  placeholder = 'DD/MM/AAAA',
  required = false,
  min,
  max,
}: BrazilianDatePickerProps) {
  // Estado interno para o valor de exibição
  const [displayValue, setDisplayValue] = useState('')

  // Sincronizar com o valor externo
  useEffect(() => {
    if (value && typeof value === 'string') {
      const parts = value.split('-')
      if (parts.length === 3) {
        setDisplayValue(`${parts[2]}/${parts[1]}/${parts[0]}`)
      }
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, '') // Remove tudo que não é dígito

    // Limitar a 8 dígitos (DDMMAAAA)
    if (inputValue.length > 8) {
      inputValue = inputValue.slice(0, 8)
    }

    // Aplicar máscara DD/MM/AAAA
    let formattedValue = ''
    if (inputValue.length >= 1) {
      formattedValue = inputValue.slice(0, 2)
    }
    if (inputValue.length >= 3) {
      formattedValue += '/' + inputValue.slice(2, 4)
    }
    if (inputValue.length >= 5) {
      formattedValue += '/' + inputValue.slice(4, 8)
    }

    // Atualizar o estado interno
    setDisplayValue(formattedValue)

    // Se a data estiver completa (DD/MM/AAAA), converter para YYYY-MM-DD
    if (inputValue.length === 8) {
      const day = inputValue.slice(0, 2)
      const month = inputValue.slice(2, 4)
      const year = inputValue.slice(4, 8)

      // Validar data básica
      const dayNum = parseInt(day)
      const monthNum = parseInt(month)
      const yearNum = parseInt(year)

      if (
        dayNum >= 1 &&
        dayNum <= 31 &&
        monthNum >= 1 &&
        monthNum <= 12 &&
        yearNum >= 1900
      ) {
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        onChange(isoDate)
      }
    } else {
      // Se não estiver completa, não chamar onChange ainda
      // Não chamar onChange('') para evitar problemas com validação
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de navegação e edição
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]

    if (allowedKeys.includes(e.key)) {
      return
    }

    // Permitir apenas números
    if (!/\d/.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <Input
      type='text'
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={className}
      placeholder={placeholder}
      required={required}
      maxLength={10} // DD/MM/AAAA
    />
  )
}

export default BrazilianDatePicker
