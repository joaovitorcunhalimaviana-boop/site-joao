import { renderHook, act } from '@testing-library/react'
import { useCalculator } from '@/hooks/use-calculator'
import type { CalculatorConfig } from '@/hooks/use-calculator'

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Configuração de teste para calculadora IBDQ
const mockIBDQConfig: CalculatorConfig = {
  name: 'IBDQ Calculator',
  title: 'IBDQ Calculator',
  description: 'Calculadora IBDQ para qualidade de vida',
  fields: [
    {
      name: 'bowel_symptoms',
      label: 'Sintomas Intestinais',
      type: 'number',
      min: 1,
      max: 7,
      required: true,
    },
    {
      name: 'systemic_symptoms',
      label: 'Sintomas Sistêmicos',
      type: 'number',
      min: 1,
      max: 7,
      required: true,
    },
    {
      name: 'emotional_function',
      label: 'Função Emocional',
      type: 'number',
      min: 1,
      max: 7,
      required: true,
    },
    {
      name: 'social_function',
      label: 'Função Social',
      type: 'number',
      min: 1,
      max: 7,
      required: true,
    },
  ],
  calculateResult: fields => {
    const total = Object.values(fields).reduce((sum: number, value) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      return sum + (isNaN(numValue as number) ? 0 : (numValue as number))
    }, 0)

    return {
      score: total,
      interpretation:
        total >= 20
          ? 'Boa qualidade de vida'
          : 'Qualidade de vida comprometida',
      recommendation: total >= 20 ? 'Manter cuidados' : 'Buscar tratamento',
      category: total >= 20 ? 'normal' : 'abnormal',
    }
  },
}

describe('useCalculator Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('Inicialização', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      expect(result.current.values).toEqual({})
      expect(result.current.result).toBeNull()
      expect(result.current.isComplete).toBe(false)
      expect(result.current.validationErrors).toEqual([])
      expect(result.current.metrics.completionRate).toBe(0)
    })

    it('deve carregar dados salvos do localStorage', () => {
      const savedData = {
        bowel_symptoms: 5,
        systemic_symptoms: 4,
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData))

      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      expect(result.current.values).toEqual(savedData)
    })
  })

  describe('Atualização de campos', () => {
    it('deve atualizar campo corretamente', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 6)
      })

      expect(result.current.values['bowel_symptoms']).toBe(6)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('deve validar campo obrigatório', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', '')
      })

      expect(result.current.validationErrors.length).toBeGreaterThan(0)
    })

    it('deve validar valor mínimo', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 0)
      })

      expect(result.current.hasErrors).toBe(true)
    })

    it('deve validar valor máximo', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 10)
      })

      expect(result.current.hasErrors).toBe(true)
    })
  })

  describe('Cálculo de resultados', () => {
    it('deve calcular resultado quando todos os campos estão preenchidos', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 6)
        result.current.updateField('systemic_symptoms', 5)
        result.current.updateField('emotional_function', 7)
        result.current.updateField('social_function', 6)
      })

      expect(result.current.result).toEqual({
        total: 24,
        interpretation: 'Boa qualidade de vida',
        category: 'normal',
      })
      expect(result.current.isComplete).toBe(true)
    })

    it('deve calcular taxa de completude corretamente', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 6)
        result.current.updateField('systemic_symptoms', 5)
      })

      expect(result.current.metrics.completionRate).toBe(50) // 2 de 4 campos
    })
  })

  describe('Reset de dados', () => {
    it('deve resetar todos os campos e resultados', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      // Preencher alguns campos
      act(() => {
        result.current.updateField('bowel_symptoms', 6)
        result.current.updateField('systemic_symptoms', 5)
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.values).toEqual({})
      expect(result.current.result).toBeNull()
      expect(result.current.validationErrors).toEqual([])
      expect(result.current.metrics.completionRate).toBe(0)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'calculator_ibdq'
      )
    })
  })

  describe('Exportação de dados', () => {
    it('deve exportar dados em formato JSON', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 6)
        result.current.updateField('systemic_symptoms', 5)
        result.current.updateField('emotional_function', 7)
        result.current.updateField('social_function', 6)
      })

      it('deve exportar dados usando a função exportData', () => {
        const { result } = renderHook(() => useCalculator(mockIBDQConfig))

        act(() => {
          result.current.updateField('bowel_symptoms', 6)
          result.current.updateField('systemic_symptoms', 5)
          result.current.updateField('emotional_function', 7)
          result.current.updateField('social_function', 6)
        })

        // Testar se a função exportData existe
        expect(typeof result.current.exportResult).toBe('function')
      })

      it('deve permitir salvar resultado', () => {
        const { result } = renderHook(() => useCalculator(mockIBDQConfig))

        act(() => {
          result.current.updateField('bowel_symptoms', 6)
          result.current.updateField('systemic_symptoms', 5)
        })

        // Testar se a função saveResult existe
        expect(typeof result.current.saveResult).toBe('function')
      })
    })
  })

  describe('Validação de formulário', () => {
    it('deve retornar true quando todos os campos obrigatórios estão válidos', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 6)
        result.current.updateField('systemic_symptoms', 5)
        result.current.updateField('emotional_function', 7)
        result.current.updateField('social_function', 6)
      })

      expect(result.current.hasErrors).toBe(false)
    })

    it('deve retornar false quando há campos obrigatórios vazios', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 6)
        // Deixar outros campos vazios
      })

      expect(result.current.validationErrors.length).toBeGreaterThan(0)
    })

    it('deve retornar false quando há erros de validação', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 10) // Valor inválido
      })

      expect(result.current.hasErrors).toBe(true)
    })
  })

  describe('Métricas de performance', () => {
    it('deve calcular tempo de preenchimento', async () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      const startTime = Date.now()

      act(() => {
        result.current.updateField('bowel_symptoms', 6)
      })

      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 100))

      act(() => {
        result.current.updateField('systemic_symptoms', 5)
        result.current.updateField('emotional_function', 7)
        result.current.updateField('social_function', 6)
      })

      const calculationTime = result.current.metrics.calculationTime
      expect(calculationTime).toBeGreaterThan(0)
      expect(calculationTime).toBeLessThan(1000) // Menos de 1 segundo para o teste
    })

    it('deve contar número de mudanças', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 6)
        result.current.updateField('bowel_symptoms', 7) // Mudança
        result.current.updateField('systemic_symptoms', 5)
      })

      expect(result.current.metrics.fieldChanges).toBe(3)
    })
  })

  describe('Estado de Acessibilidade', () => {
    it('deve indicar se há erros', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 10) // Valor inválido
      })

      expect(result.current.hasErrors).toBe(true)
    })

    it('deve calcular porcentagem de completude', () => {
      const { result } = renderHook(() => useCalculator(mockIBDQConfig))

      act(() => {
        result.current.updateField('bowel_symptoms', 6)
        result.current.updateField('systemic_symptoms', 5)
      })

      expect(result.current.completionPercentage).toBeGreaterThan(0)
    })
  })
})
