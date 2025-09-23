import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WexnerCalculator from '@/components/calculators/wexner-calculator'
import '@testing-library/jest-dom'

// Mock do hook use-calculator
jest.mock('@/hooks/use-calculator', () => ({
  useCalculator: () => ({
    values: {},
    result: null,
    updateField: jest.fn(),
    reset: jest.fn(),
    saveResult: jest.fn(),
    isValid: true,
    errors: {},
  }),
}))

describe('WexnerCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render calculator title and description', () => {
    render(<WexnerCalculator />)

    expect(screen.getByText('Score de Wexner')).toBeInTheDocument()
    expect(
      screen.getByText(/Avaliação da incontinência fecal/)
    ).toBeInTheDocument()
  })

  it('should render all form fields', () => {
    render(<WexnerCalculator />)

    // Verificar se os campos principais estão presentes
    expect(screen.getByText(/Incontinência para gases/)).toBeInTheDocument()
    expect(
      screen.getByText(/Incontinência para fezes líquidas/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Incontinência para fezes sólidas/)
    ).toBeInTheDocument()
    expect(screen.getByText(/Uso de absorventes/)).toBeInTheDocument()
    expect(screen.getByText(/Alteração do estilo de vida/)).toBeInTheDocument()
  })

  it('should have calculate button', () => {
    render(<WexnerCalculator />)

    const calculateButton = screen.getByRole('button', { name: /calcular/i })
    expect(calculateButton).toBeInTheDocument()
  })

  it('should have reset button', () => {
    render(<WexnerCalculator />)

    const resetButton = screen.getByRole('button', { name: /limpar/i })
    expect(resetButton).toBeInTheDocument()
  })

  it('should render information section', () => {
    render(<WexnerCalculator />)

    expect(screen.getByText(/Interpretação/)).toBeInTheDocument()
    expect(
      screen.getByText(/0 pontos: Continência perfeita/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/20 pontos: Incontinência completa/)
    ).toBeInTheDocument()
  })

  it('should display result when calculation is performed', () => {
    // Mock com resultado
    const mockUseCalculator = {
      values: {
        gasIncontinence: 2,
        liquidIncontinence: 1,
        solidIncontinence: 0,
        padUsage: 1,
        lifestyleChange: 1,
      },
      result: {
        total: 5,
        interpretation: 'Incontinência leve',
        category: 'leve',
      },
      updateField: jest.fn(),
      reset: jest.fn(),
      saveResult: jest.fn(),
      isValid: true,
      errors: {},
    }

    jest.doMock('@/hooks/use-calculator', () => ({
      useCalculator: () => mockUseCalculator,
    }))

    render(<WexnerCalculator />)

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Incontinência leve')).toBeInTheDocument()
  })
})

// Testes de integração para cálculo do Score de Wexner
describe('Wexner Score Calculation', () => {
  const calculateWexnerScore = (values: {
    gasIncontinence: number
    liquidIncontinence: number
    solidIncontinence: number
    padUsage: number
    lifestyleChange: number
  }) => {
    const total =
      values.gasIncontinence +
      values.liquidIncontinence +
      values.solidIncontinence +
      values.padUsage +
      values.lifestyleChange

    let interpretation = ''
    let category = ''

    if (total === 0) {
      interpretation = 'Continência perfeita'
      category = 'normal'
    } else if (total <= 9) {
      interpretation = 'Incontinência leve'
      category = 'leve'
    } else if (total <= 14) {
      interpretation = 'Incontinência moderada'
      category = 'moderada'
    } else {
      interpretation = 'Incontinência severa'
      category = 'severa'
    }

    return { total, interpretation, category }
  }

  it('should calculate perfect continence (score 0)', () => {
    const result = calculateWexnerScore({
      gasIncontinence: 0,
      liquidIncontinence: 0,
      solidIncontinence: 0,
      padUsage: 0,
      lifestyleChange: 0,
    })

    expect(result.total).toBe(0)
    expect(result.interpretation).toBe('Continência perfeita')
    expect(result.category).toBe('normal')
  })

  it('should calculate mild incontinence (score 1-9)', () => {
    const result = calculateWexnerScore({
      gasIncontinence: 2,
      liquidIncontinence: 1,
      solidIncontinence: 0,
      padUsage: 1,
      lifestyleChange: 1,
    })

    expect(result.total).toBe(5)
    expect(result.interpretation).toBe('Incontinência leve')
    expect(result.category).toBe('leve')
  })

  it('should calculate moderate incontinence (score 10-14)', () => {
    const result = calculateWexnerScore({
      gasIncontinence: 3,
      liquidIncontinence: 3,
      solidIncontinence: 2,
      padUsage: 2,
      lifestyleChange: 2,
    })

    expect(result.total).toBe(12)
    expect(result.interpretation).toBe('Incontinência moderada')
    expect(result.category).toBe('moderada')
  })

  it('should calculate severe incontinence (score 15-20)', () => {
    const result = calculateWexnerScore({
      gasIncontinence: 4,
      liquidIncontinence: 4,
      solidIncontinence: 4,
      padUsage: 4,
      lifestyleChange: 4,
    })

    expect(result.total).toBe(20)
    expect(result.interpretation).toBe('Incontinência severa')
    expect(result.category).toBe('severa')
  })

  it('should handle edge case at boundary between categories', () => {
    const result = calculateWexnerScore({
      gasIncontinence: 2,
      liquidIncontinence: 2,
      solidIncontinence: 2,
      padUsage: 2,
      lifestyleChange: 1,
    })

    expect(result.total).toBe(9)
    expect(result.interpretation).toBe('Incontinência leve')
    expect(result.category).toBe('leve')
  })
})
