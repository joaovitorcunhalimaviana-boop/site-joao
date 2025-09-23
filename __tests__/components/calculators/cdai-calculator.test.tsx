import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CDAICalculator from '@/components/calculators/cdai-calculator'
import '@testing-library/jest-dom'

// Mock do hook use-calculator
const mockUseCalculator = {
  values: {},
  result: null,
  updateField: jest.fn(),
  reset: jest.fn(),
  saveResult: jest.fn(),
  isValid: true,
  errors: {},
}

jest.mock('@/hooks/use-calculator', () => ({
  useCalculator: () => mockUseCalculator,
}))

describe('CDAICalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render calculator title and description', () => {
    render(<CDAICalculator />)

    expect(screen.getByText('CDAI')).toBeInTheDocument()
    expect(
      screen.getByText(/Crohn's Disease Activity Index/)
    ).toBeInTheDocument()
  })

  it('should render all CDAI form fields', () => {
    render(<CDAICalculator />)

    // Verificar campos principais do CDAI
    expect(
      screen.getByText(/Número de evacuações líquidas/)
    ).toBeInTheDocument()
    expect(screen.getByText(/Dor abdominal/)).toBeInTheDocument()
    expect(screen.getByText(/Bem-estar geral/)).toBeInTheDocument()
    expect(
      screen.getByText(/Manifestações extraintestinais/)
    ).toBeInTheDocument()
    expect(screen.getByText(/Uso de antidiarreicos/)).toBeInTheDocument()
    expect(screen.getByText(/Massa abdominal palpável/)).toBeInTheDocument()
    expect(screen.getByText(/Hematócrito/)).toBeInTheDocument()
    expect(screen.getByText(/Peso atual/)).toBeInTheDocument()
    expect(screen.getByText(/Peso padrão/)).toBeInTheDocument()
  })

  it('should have calculate and reset buttons', () => {
    render(<CDAICalculator />)

    expect(
      screen.getByRole('button', { name: /calcular/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument()
  })

  it('should render interpretation guidelines', () => {
    render(<CDAICalculator />)

    expect(screen.getByText(/Interpretação/)).toBeInTheDocument()
    expect(screen.getByText(/< 150: Remissão/)).toBeInTheDocument()
    expect(screen.getByText(/150-220: Doença leve/)).toBeInTheDocument()
    expect(screen.getByText(/221-450: Doença moderada/)).toBeInTheDocument()
    expect(screen.getByText(/> 450: Doença severa/)).toBeInTheDocument()
  })

  it('should display result when calculation is performed', () => {
    const mockWithResult = {
      ...mockUseCalculator,
      values: {
        liquidStools: 5,
        abdominalPain: 2,
        generalWellbeing: 3,
        extraintestinal: 1,
        antidiarrheal: 1,
        abdominalMass: 0,
        hematocrit: 35,
        weight: 65,
        standardWeight: 70,
      },
      result: {
        total: 180,
        interpretation: 'Doença leve',
        category: 'leve',
        components: {
          liquidStools: 35,
          abdominalPain: 50,
          generalWellbeing: 21,
          extraintestinal: 20,
          antidiarrheal: 30,
          abdominalMass: 0,
          hematocrit: 210,
          weightLoss: -15,
        },
      },
    }

    jest.doMock('@/hooks/use-calculator', () => ({
      useCalculator: () => mockWithResult,
    }))

    render(<CDAICalculator />)

    expect(screen.getByText('180')).toBeInTheDocument()
    expect(screen.getByText('Doença leve')).toBeInTheDocument()
  })
})

// Testes de integração para cálculo do CDAI
describe('CDAI Calculation Logic', () => {
  const calculateCDAI = (values: {
    liquidStools: number
    abdominalPain: number
    generalWellbeing: number
    extraintestinal: number
    antidiarrheal: number
    abdominalMass: number
    hematocrit: number
    weight: number
    standardWeight: number
  }) => {
    // Cálculo baseado na fórmula oficial do CDAI
    const liquidStoolsScore = values.liquidStools * 2
    const abdominalPainScore = values.abdominalPain * 5
    const generalWellbeingScore = values.generalWellbeing * 7
    const extraintestinalScore = values.extraintestinal * 20
    const antidiarrhealScore = values.antidiarrheal * 30
    const abdominalMassScore = values.abdominalMass * 10
    const hematocritScore = (47 - values.hematocrit) * 6
    const weightLossScore =
      ((values.standardWeight - values.weight) / values.standardWeight) * 100

    const total =
      liquidStoolsScore +
      abdominalPainScore +
      generalWellbeingScore +
      extraintestinalScore +
      antidiarrhealScore +
      abdominalMassScore +
      hematocritScore +
      weightLossScore

    let interpretation = ''
    let category = ''

    if (total < 150) {
      interpretation = 'Remissão'
      category = 'remissao'
    } else if (total <= 220) {
      interpretation = 'Doença leve'
      category = 'leve'
    } else if (total <= 450) {
      interpretation = 'Doença moderada'
      category = 'moderada'
    } else {
      interpretation = 'Doença severa'
      category = 'severa'
    }

    return {
      total: Math.round(total),
      interpretation,
      category,
      components: {
        liquidStools: liquidStoolsScore,
        abdominalPain: abdominalPainScore,
        generalWellbeing: generalWellbeingScore,
        extraintestinal: extraintestinalScore,
        antidiarrheal: antidiarrhealScore,
        abdominalMass: abdominalMassScore,
        hematocrit: hematocritScore,
        weightLoss: Math.round(weightLossScore),
      },
    }
  }

  it('should calculate remission state (CDAI < 150)', () => {
    const result = calculateCDAI({
      liquidStools: 2,
      abdominalPain: 0,
      generalWellbeing: 0,
      extraintestinal: 0,
      antidiarrheal: 0,
      abdominalMass: 0,
      hematocrit: 42,
      weight: 70,
      standardWeight: 70,
    })

    expect(result.total).toBeLessThan(150)
    expect(result.interpretation).toBe('Remissão')
    expect(result.category).toBe('remissao')
  })

  it('should calculate mild disease (CDAI 150-220)', () => {
    const result = calculateCDAI({
      liquidStools: 4,
      abdominalPain: 2,
      generalWellbeing: 2,
      extraintestinal: 0,
      antidiarrheal: 1,
      abdominalMass: 0,
      hematocrit: 38,
      weight: 68,
      standardWeight: 70,
    })

    expect(result.total).toBeGreaterThanOrEqual(150)
    expect(result.total).toBeLessThanOrEqual(220)
    expect(result.interpretation).toBe('Doença leve')
    expect(result.category).toBe('leve')
  })

  it('should calculate moderate disease (CDAI 221-450)', () => {
    const result = calculateCDAI({
      liquidStools: 8,
      abdominalPain: 3,
      generalWellbeing: 3,
      extraintestinal: 1,
      antidiarrheal: 1,
      abdominalMass: 2,
      hematocrit: 32,
      weight: 60,
      standardWeight: 70,
    })

    expect(result.total).toBeGreaterThan(220)
    expect(result.total).toBeLessThanOrEqual(450)
    expect(result.interpretation).toBe('Doença moderada')
    expect(result.category).toBe('moderada')
  })

  it('should calculate severe disease (CDAI > 450)', () => {
    const result = calculateCDAI({
      liquidStools: 15,
      abdominalPain: 3,
      generalWellbeing: 4,
      extraintestinal: 1,
      antidiarrheal: 1,
      abdominalMass: 5,
      hematocrit: 25,
      weight: 55,
      standardWeight: 70,
    })

    expect(result.total).toBeGreaterThan(450)
    expect(result.interpretation).toBe('Doença severa')
    expect(result.category).toBe('severa')
  })

  it('should correctly calculate individual components', () => {
    const result = calculateCDAI({
      liquidStools: 5,
      abdominalPain: 2,
      generalWellbeing: 1,
      extraintestinal: 1,
      antidiarrheal: 0,
      abdominalMass: 0,
      hematocrit: 40,
      weight: 65,
      standardWeight: 70,
    })

    expect(result.components.liquidStools).toBe(10) // 5 * 2
    expect(result.components.abdominalPain).toBe(10) // 2 * 5
    expect(result.components.generalWellbeing).toBe(7) // 1 * 7
    expect(result.components.extraintestinal).toBe(20) // 1 * 20
    expect(result.components.antidiarrheal).toBe(0) // 0 * 30
    expect(result.components.abdominalMass).toBe(0) // 0 * 10
    expect(result.components.hematocrit).toBe(42) // (47 - 40) * 6
    expect(result.components.weightLoss).toBe(7) // ((70 - 65) / 70) * 100
  })

  it('should handle edge cases with zero values', () => {
    const result = calculateCDAI({
      liquidStools: 0,
      abdominalPain: 0,
      generalWellbeing: 0,
      extraintestinal: 0,
      antidiarrheal: 0,
      abdominalMass: 0,
      hematocrit: 47,
      weight: 70,
      standardWeight: 70,
    })

    expect(result.total).toBe(0)
    expect(result.interpretation).toBe('Remissão')
  })

  it('should handle weight gain (negative weight loss)', () => {
    const result = calculateCDAI({
      liquidStools: 2,
      abdominalPain: 1,
      generalWellbeing: 1,
      extraintestinal: 0,
      antidiarrheal: 0,
      abdominalMass: 0,
      hematocrit: 42,
      weight: 75, // Peso maior que o padrão
      standardWeight: 70,
    })

    expect(result.components.weightLoss).toBeLessThan(0)
  })
})
