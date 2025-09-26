import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { sanitizeText } from '@/lib/security'
import { formatDateTimeToBrazilian } from '@/lib/date-utils'

// Tipos base para calculadoras
export interface CalculatorField {
  name: string
  label: string
  type: 'select' | 'number' | 'radio' | 'checkbox' | 'text'
  options?: { value: number | string; label: string }[]
  min?: number
  max?: number
  required?: boolean
  description?: string
  validation?: (value: any) => string | null
  sanitize?: boolean
}

export interface ValidationError {
  field: string
  message: string
}

export interface CalculatorMetrics {
  calculationTime: number
  fieldChanges: number
  completionRate: number
}

export interface CalculatorResult {
  score: number
  interpretation: string
  recommendation: string
  category?: string
  details?: Record<string, any>
  timestamp?: string
  calculatorName?: string
  metrics?: CalculatorMetrics
  exportData?: {
    pdf?: boolean
    csv?: boolean
    json?: boolean
  }
}

export interface CalculatorConfig {
  name: string
  title: string
  description: string
  fields: CalculatorField[]
  calculateResult: (values: Record<string, any>) => CalculatorResult | null
  resetValues?: Record<string, any>
}

// Hook principal para calculadoras otimizado
export function useCalculator(config: CalculatorConfig) {
  const [values, setValues] = useState<Record<string, any>>(
    config.resetValues || {}
  )
  const [savedResults, setSavedResults] = useState<CalculatorResult[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  )
  const [isCalculating, setIsCalculating] = useState(false)
  const [metrics, setMetrics] = useState<CalculatorMetrics>({
    calculationTime: 0,
    fieldChanges: 0,
    completionRate: 0,
  })

  const calculationStartTime = useRef<number>(0)

  // Carregar resultados salvos na inicialização
  useEffect(() => {
    loadSavedResults()
  }, [config.name])

  // Validar campo individual
  const validateField = useCallback(
    (field: CalculatorField, value: any): string | null => {
      // Validação de campo obrigatório
      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        return `${field.label} é obrigatório`
      }

      // Validação de tipo número
      if (field.type === 'number' && value !== '' && value !== null) {
        const numValue = Number(value)
        if (isNaN(numValue)) {
          return `${field.label} deve ser um número válido`
        }
        if (field.min !== undefined && numValue < field.min) {
          return `${field.label} deve ser maior ou igual a ${field.min}`
        }
        if (field.max !== undefined && numValue > field.max) {
          return `${field.label} deve ser menor ou igual a ${field.max}`
        }
      }

      // Validação customizada
      if (field.validation) {
        return field.validation(value)
      }

      return null
    },
    []
  )

  // Atualizar valor de campo com validação em tempo real
  const updateField = useCallback(
    (fieldName: string, value: any) => {
      const field = config.fields.find(f => f.name === fieldName)
      if (!field) return

      // Sanitizar entrada se necessário
      let sanitizedValue = value
      if (field.sanitize && typeof value === 'string') {
        sanitizedValue = sanitizeText(value)
      }

      // Atualizar valor
      setValues(prev => ({
        ...prev,
        [fieldName]: sanitizedValue,
      }))

      // Validar campo
      const error = validateField(field, sanitizedValue)
      setValidationErrors(prev => {
        const filtered = prev.filter(e => e.field !== fieldName)
        return error
          ? [...filtered, { field: fieldName, message: error }]
          : filtered
      })

      // Atualizar métricas
      setMetrics(prev => ({
        ...prev,
        fieldChanges: prev.fieldChanges + 1,
      }))

      // Remover anúncio de erro (funcionalidade de acessibilidade removida)
      // if (error) {
      //   announce(`Erro no campo ${field.label}: ${error}`, 'assertive')
      // }
    },
    [config.fields, validateField]
  )

  // Resetar calculadora
  const reset = useCallback(() => {
    setValues(config.resetValues || {})
  }, [config.resetValues])

  // Calcular resultado com métricas de performance
  const result = useMemo(() => {
    if (validationErrors.length > 0) {
      return null
    }

    try {
      setIsCalculating(true)
      calculationStartTime.current = performance.now()

      const calculationResult = config.calculateResult(values)

      const calculationTime = performance.now() - calculationStartTime.current
      setMetrics(prev => ({
        ...prev,
        calculationTime,
      }))

      setIsCalculating(false)

      if (calculationResult) {
        // Remover anúncio de resultado (funcionalidade de acessibilidade removida)
        // announce(`Cálculo concluído. Resultado: ${calculationResult.interpretation}`, 'polite')

        return {
          ...calculationResult,
          metrics: {
            ...metrics,
            calculationTime,
          },
        }
      }

      return calculationResult
    } catch (error) {
      console.error(`Erro na calculadora ${config.name}:`, error)
      setIsCalculating(false)
      // Remover anúncio de erro (funcionalidade de acessibilidade removida)
      // announce('Erro no cálculo. Verifique os dados inseridos.', 'assertive')
      return null
    }
  }, [values, config, validationErrors, metrics])

  // Verificar se todos os campos obrigatórios estão preenchidos
  const isComplete = useMemo(() => {
    const requiredFields = config.fields.filter(field => field.required)
    const completedFields = requiredFields.filter(field => {
      const value = values[field.name]
      return value !== undefined && value !== null && value !== ''
    })

    const completionRate =
      requiredFields.length > 0
        ? (completedFields.length / requiredFields.length) * 100
        : 100

    setMetrics(prev => ({
      ...prev,
      completionRate,
    }))

    return (
      validationErrors.length === 0 &&
      completedFields.length === requiredFields.length
    )
  }, [values, config.fields, validationErrors])

  // Salvar resultado com métricas
  const saveResult = useCallback(() => {
    if (result && isComplete) {
      const resultWithTimestamp = {
        ...result,
        timestamp: new Date().toISOString(),
        calculatorName: config.name,
        metrics: metrics,
        exportData: {
          pdf: true,
          csv: true,
          json: true,
        },
      }
      setSavedResults(prev => [resultWithTimestamp, ...prev])

      // Salvar no localStorage
      try {
        const saved = localStorage.getItem(`calculator_${config.name}_results`)
        const existing = saved ? JSON.parse(saved) : []
        const updated = [resultWithTimestamp, ...existing].slice(0, 50) // Manter apenas 50 resultados
        localStorage.setItem(
          `calculator_${config.name}_results`,
          JSON.stringify(updated)
        )

        // Remover anúncios (funcionalidade de acessibilidade removida)
        // announce('Resultado salvo com sucesso', 'polite')
      } catch (error) {
        console.error('Erro ao salvar resultado:', error)
        // announce('Erro ao salvar resultado', 'assertive')
      }
    }
  }, [result, isComplete, config.name, metrics])

  // Exportar resultado em diferentes formatos
  const exportResult = useCallback(
    (format: 'pdf' | 'csv' | 'json', resultToExport?: CalculatorResult) => {
      const exportData = resultToExport || result
      if (!exportData) return

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `${config.name}_${timestamp}`

      switch (format) {
        case 'json':
          const jsonData = JSON.stringify(exportData, null, 2)
          downloadFile(jsonData, `${filename}.json`, 'application/json')
          break

        case 'csv':
          const csvData = convertToCSV(exportData)
          downloadFile(csvData, `${filename}.csv`, 'text/csv')
          break

        case 'pdf':
          // Implementar exportação PDF (requer biblioteca adicional)
          console.log('Exportação PDF em desenvolvimento')
          break
      }

      // Remover anúncio de exportação (funcionalidade de acessibilidade removida)
      // announce(`Resultado exportado em formato ${format.toUpperCase()}`, 'polite')
    },
    [result, config.name]
  )

  // Função auxiliar para download de arquivo
  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Converter resultado para CSV
  const convertToCSV = (data: CalculatorResult): string => {
    const headers = ['Campo', 'Valor']
    const rows = [
      ['Calculadora', config.name],
      ['Data/Hora', data.timestamp || new Date().toISOString()],
      ['Pontuação', data.score.toString()],
      ['Interpretação', data.interpretation],
      ['Recomendação', data.recommendation],
      ['Categoria', data.category || 'N/A'],
      [
        'Tempo de Cálculo (ms)',
        data.metrics?.calculationTime?.toFixed(2) || 'N/A',
      ],
      ['Mudanças de Campo', data.metrics?.fieldChanges?.toString() || 'N/A'],
      [
        'Taxa de Completude (%)',
        data.metrics?.completionRate?.toFixed(1) || 'N/A',
      ],
    ]

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  // Carregar resultados salvos
  const loadSavedResults = useCallback(() => {
    try {
      const saved = localStorage.getItem(`calculator_${config.name}_results`)
      if (saved) {
        const results = JSON.parse(saved)
        setSavedResults(results)
      }
    } catch (error) {
      console.error('Erro ao carregar resultados salvos:', error)
    }
  }, [config.name])

  // Exportar dados
  const exportData = useCallback(() => {
    const data = {
      calculator: config.name,
      title: config.title,
      currentValues: values,
      currentResult: result,
      savedResults: savedResults,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.name}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [config, values, result, savedResults])

  return {
    // Estado básico
    values,
    result,
    savedResults,
    isComplete,

    // Validação
    validationErrors,
    isCalculating,

    // Métricas
    metrics,

    // Ações
    updateField,
    reset,
    saveResult,
    loadSavedResults,
    exportResult,

    // Utilitários
    validateField,

    // Estado de acessibilidade
    hasErrors: validationErrors.length > 0,
    completionPercentage: metrics.completionRate,
  }
}

// Hook para validação de campos
export function useFieldValidation(field: CalculatorField, value: any) {
  return useMemo(() => {
    const errors: string[] = []

    if (
      field.required &&
      (value === undefined || value === null || value === '')
    ) {
      errors.push('Campo obrigatório')
    }

    if (field.type === 'number' && value !== undefined && value !== null) {
      const numValue = Number(value)
      if (isNaN(numValue)) {
        errors.push('Deve ser um número válido')
      } else {
        if (field.min !== undefined && numValue < field.min) {
          errors.push(`Valor mínimo: ${field.min}`)
        }
        if (field.max !== undefined && numValue > field.max) {
          errors.push(`Valor máximo: ${field.max}`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [field, value])
}

// Utilitários para calculadoras comuns
export const calculatorUtils = {
  // Calcular score total
  calculateTotalScore: (values: Record<string, number>, fields: string[]) => {
    return fields.reduce((total, field) => {
      const value = values[field]
      return total + (typeof value === 'number' ? value : 0)
    }, 0)
  },

  // Interpretar score baseado em ranges
  interpretScore: (
    score: number,
    ranges: { min: number; max: number; label: string; description: string }[]
  ) => {
    for (const range of ranges) {
      if (score >= range.min && score <= range.max) {
        return {
          category: range.label,
          interpretation: range.description,
        }
      }
    }
    return {
      category: 'Indefinido',
      interpretation: 'Score fora dos ranges definidos',
    }
  },

  // Formatar resultado para exibição
  formatResult: (result: CalculatorResult) => {
    return {
      ...result,
      formattedScore: result.score.toFixed(1),
      timestamp: formatDateTimeToBrazilian(new Date()),
    }
  },
}