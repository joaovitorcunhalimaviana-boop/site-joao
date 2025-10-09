// Sistema de validação para formulários médicos
import React from 'react'

// Tipos base para validação
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule
}

// Padrões de validação médica
export const medicalPatterns = {
  // CPF brasileiro
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,

  // Telefone brasileiro
  phone: /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/,

  // CEP brasileiro
  cep: /^\d{5}-?\d{3}$/,

  // Email
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Data no formato DD/MM/AAAA
  date: /^\d{2}\/\d{2}\/\d{4}$/,

  // Hora no formato HH:MM
  time: /^\d{2}:\d{2}$/,

  // Número de registro médico (CRM)
  crm: /^\d{4,6}$/,

  // Cartão SUS
  sus: /^\d{15}$/,

  // Peso (kg)
  weight: /^\d{1,3}(\.\d{1,2})?$/,

  // Altura (cm)
  height: /^\d{2,3}$/,

  // Pressão arterial
  bloodPressure: /^\d{2,3}\/\d{2,3}$/,
}

// Mensagens de erro padrão
export const defaultMessages = {
  required: 'Este campo é obrigatório',
  min: 'Valor deve ser maior que {min}',
  max: 'Valor deve ser menor que {max}',
  minLength: 'Deve ter pelo menos {minLength} caracteres',
  maxLength: 'Deve ter no máximo {maxLength} caracteres',
  pattern: 'Formato inválido',
  email: 'Email inválido',
  cpf: 'CPF inválido',
  phone: 'Telefone inválido',
  cep: 'CEP inválido',
  date: 'Data inválida (DD/MM/AAAA)',
  time: 'Hora inválida (HH:MM)',
  crm: 'CRM inválido',
  sus: 'Cartão SUS inválido',
  weight: 'Peso inválido',
  height: 'Altura inválida',
  bloodPressure: 'Pressão arterial inválida (ex: 120/80)',
}

// Função principal de validação
export function validateField(
  value: any,
  rules: ValidationRule
): ValidationResult {
  const errors: string[] = []

  // Verificar se é obrigatório
  if (
    rules.required &&
    (value === undefined || value === null || value === '')
  ) {
    errors.push(rules.message || defaultMessages.required)
    return { isValid: false, errors }
  }

  // Se não há valor e não é obrigatório, é válido
  if (value === undefined || value === null || value === '') {
    return { isValid: true, errors: [] }
  }

  // Validar valor mínimo
  if (rules.min !== undefined && Number(value) < rules.min) {
    errors.push(
      rules.message || defaultMessages.min.replace('{min}', String(rules.min))
    )
  }

  // Validar valor máximo
  if (rules.max !== undefined && Number(value) > rules.max) {
    errors.push(
      rules.message || defaultMessages.max.replace('{max}', String(rules.max))
    )
  }

  // Validar comprimento mínimo
  if (rules.minLength !== undefined && String(value).length < rules.minLength) {
    errors.push(
      rules.message ||
        defaultMessages.minLength.replace(
          '{minLength}',
          String(rules.minLength)
        )
    )
  }

  // Validar comprimento máximo
  if (rules.maxLength !== undefined && String(value).length > rules.maxLength) {
    errors.push(
      rules.message ||
        defaultMessages.maxLength.replace(
          '{maxLength}',
          String(rules.maxLength)
        )
    )
  }

  // Validar padrão
  if (rules.pattern && !rules.pattern.test(String(value))) {
    errors.push(rules.message || defaultMessages.pattern)
  }

  // Validação customizada
  if (rules.custom) {
    const customError = rules.custom(value)
    if (customError) {
      errors.push(customError)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validar múltiplos campos
export function validateForm(
  data: Record<string, any>,
  validationRules: FieldValidation
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {}

  for (const [fieldName, rules] of Object.entries(validationRules)) {
    results[fieldName] = validateField(data[fieldName], rules)
  }

  return results
}

// Verificar se formulário é válido
export function isFormValid(
  validationResults: Record<string, ValidationResult>
): boolean {
  return Object.values(validationResults).every(result => result.isValid)
}

// Validações específicas para área médica
export const medicalValidators = {
  // Validar CPF
  cpf: (value: string): string | null => {
    if (!value) return null

    const cleanCpf = value.replace(/\D/g, '')

    if (cleanCpf.length !== 11) {
      return defaultMessages.cpf
    }

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return defaultMessages.cpf
    }

    // Validar dígitos verificadores
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
    }

    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCpf.charAt(9))) {
      return defaultMessages.cpf
    }

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
    }

    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCpf.charAt(10))) {
      return defaultMessages.cpf
    }

    return null
  },

  // Validar idade
  age: (value: number): string | null => {
    if (value < 0 || value > 150) {
      return 'Idade deve estar entre 0 e 150 anos'
    }
    return null
  },

  // Validar peso
  weight: (value: number): string | null => {
    if (value < 0.5 || value > 500) {
      return 'Peso deve estar entre 0.5kg e 500kg'
    }
    return null
  },

  // Validar altura
  height: (value: number): string | null => {
    if (value < 30 || value > 250) {
      return 'Altura deve estar entre 30cm e 250cm'
    }
    return null
  },

  // Validar data de nascimento
  birthDate: (value: string): string | null => {
    if (!medicalPatterns.date.test(value)) {
      return defaultMessages.date
    }

    const [day, month, year] = value.split('/').map(Number)
    const date = new Date(year, month - 1, day)
    const today = new Date()

    if (date > today) {
      return 'Data de nascimento não pode ser futura'
    }

    const age = today.getFullYear() - date.getFullYear()
    if (age > 150) {
      return 'Data de nascimento muito antiga'
    }

    return null
  },

  // Validar pressão arterial
  bloodPressure: (value: string): string | null => {
    if (!medicalPatterns.bloodPressure.test(value)) {
      return defaultMessages.bloodPressure
    }

    const [systolic, diastolic] = value.split('/').map(Number)

    if (systolic < 70 || systolic > 300) {
      return 'Pressão sistólica deve estar entre 70 e 300 mmHg'
    }

    if (diastolic < 40 || diastolic > 200) {
      return 'Pressão diastólica deve estar entre 40 e 200 mmHg'
    }

    if (systolic <= diastolic) {
      return 'Pressão sistólica deve ser maior que a diastólica'
    }

    return null
  },
}

// Regras de validação pré-definidas para formulários médicos
export const medicalFormRules = {
  // Dados pessoais
  personalData: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Nome deve ter entre 2 e 100 caracteres',
    },
    email: {
      required: true,
      pattern: medicalPatterns.email,
      message: defaultMessages.email,
    },
    phone: {
      required: true,
      pattern: medicalPatterns.phone,
      message: defaultMessages.phone,
    },
    cpf: {
      required: true,
      custom: medicalValidators.cpf,
    },
    birthDate: {
      required: true,
      custom: medicalValidators.birthDate,
    },
  },

  // Dados médicos
  medicalData: {
    weight: {
      required: false,
      custom: medicalValidators.weight,
    },
    height: {
      required: false,
      custom: medicalValidators.height,
    },
    bloodPressure: {
      required: false,
      custom: medicalValidators.bloodPressure,
    },
  },

  // Agendamento
  appointment: {
    date: {
      required: true,
      custom: (value: string) => {
        if (!medicalPatterns.date.test(value)) {
          return defaultMessages.date
        }

        const [day, month, year] = value.split('/').map(Number)
        const appointmentDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (appointmentDate < today) {
          return 'Data do agendamento não pode ser no passado'
        }

        return null
      },
    },
    time: {
      required: true,
      pattern: medicalPatterns.time,
      message: defaultMessages.time,
    },
    specialty: {
      required: true,
      message: 'Selecione uma especialidade',
    },
  },
}

// Hook para usar validação
export function useValidation(initialRules: FieldValidation = {}) {
  const [rules, setRules] = React.useState(initialRules)
  const [errors, setErrors] = React.useState<Record<string, ValidationResult>>(
    {}
  )

  const validateSingleField = React.useCallback(
    (fieldName: string, value: any) => {
      if (!rules[fieldName]) return { isValid: true, errors: [] }

      const result = validateField(value, rules[fieldName])
      setErrors(prev => ({ ...prev, [fieldName]: result }))
      return result
    },
    [rules]
  )

  const validateAllFields = React.useCallback(
    (data: Record<string, any>) => {
      const results = validateForm(data, rules)
      setErrors(results)
      return results
    },
    [rules]
  )

  const clearErrors = React.useCallback(() => {
    setErrors({})
  }, [])

  const isValid = React.useMemo(() => {
    return isFormValid(errors)
  }, [errors])

  return {
    rules,
    setRules,
    errors,
    validateSingleField,
    validateAllFields,
    clearErrors,
    isValid,
  }
}

export default {
  validateField,
  validateForm,
  isFormValid,
  medicalPatterns,
  medicalValidators,
  medicalFormRules,
  defaultMessages,
}
