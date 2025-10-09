'use client'

import React, { useState, useMemo, useCallback, memo } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import BaseCalculator, {
  CalculatorCard,
  CalculatorQuestion,
} from './base-calculator'

interface CDAIParameter {
  id: string
  label: string
  type: 'number' | 'radio'
  multiplier: number
  options?: { value: number; label: string }[]
  unit?: string
  placeholder?: string
}

const cdaiParameters: CDAIParameter[] = [
  {
    id: 'liquidStools',
    label: 'Número de evacuações líquidas/pastosas (últimos 7 dias)',
    type: 'number',
    multiplier: 2,
    placeholder: 'Ex: 14 (média de 2 por dia)',
  },
  {
    id: 'abdominalPain',
    label: 'Dor abdominal (últimos 7 dias)',
    type: 'radio',
    multiplier: 5,
    options: [
      { value: 0, label: '0 - Ausente' },
      { value: 1, label: '1 - Leve' },
      { value: 2, label: '2 - Moderada' },
      { value: 3, label: '3 - Severa' },
    ],
  },
  {
    id: 'generalWellbeing',
    label: 'Bem-estar geral (últimos 7 dias)',
    type: 'radio',
    multiplier: 7,
    options: [
      { value: 0, label: '0 - Excelente' },
      { value: 1, label: '1 - Bom' },
      { value: 2, label: '2 - Regular' },
      { value: 3, label: '3 - Ruim' },
      { value: 4, label: '4 - Péssimo' },
    ],
  },
  {
    id: 'extraintestinal',
    label: 'Manifestações extraintestinais',
    type: 'radio',
    multiplier: 20,
    options: [
      { value: 0, label: 'Nenhuma' },
      { value: 1, label: 'Artrite/artralgia' },
      { value: 2, label: 'Irite/uveíte' },
      { value: 3, label: 'Eritema nodoso/pioderma gangrenoso' },
      { value: 4, label: 'Fissura/fístula/abscesso anal' },
      { value: 5, label: 'Outras fístulas' },
      { value: 6, label: 'Febre maior que 37.8°C' },
    ],
  },
  {
    id: 'antidiarrheal',
    label: 'Uso de antidiarreicos',
    type: 'radio',
    multiplier: 30,
    options: [
      { value: 0, label: 'Não' },
      { value: 1, label: 'Sim' },
    ],
  },
  {
    id: 'abdominalMass',
    label: 'Massa abdominal palpável',
    type: 'radio',
    multiplier: 10,
    options: [
      { value: 0, label: 'Ausente' },
      { value: 2, label: 'Questionável' },
      { value: 5, label: 'Presente' },
    ],
  },
  {
    id: 'hematocrit',
    label: 'Hematócrito (%)',
    type: 'number',
    multiplier: 6,
    unit: '%',
    placeholder: 'Ex: 35',
  },
  {
    id: 'weight',
    label: 'Peso atual (kg)',
    type: 'number',
    multiplier: 1,
    unit: 'kg',
    placeholder: 'Ex: 70',
  },
  {
    id: 'standardWeight',
    label: 'Peso padrão/ideal (kg)',
    type: 'number',
    multiplier: 1,
    unit: 'kg',
    placeholder: 'Ex: 75',
  },
]

interface CDAICalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

const CDAICalculator = memo(function CDAICalculator({
  onSaveResult,
  darkMode = true,
}: CDAICalculatorProps) {
  const [values, setValues] = useState<{ [key: string]: number }>({})

  const handleValueChange = useCallback((parameterId: string, value: number) => {
    setValues(prev => ({ ...prev, [parameterId]: value }))
  }, [])

  const calculateCDAI = useMemo(() => {
    let total = 0

    // Calcular cada componente
    cdaiParameters.forEach(param => {
      const value = values[param.id] || 0
      if (param.id === 'hematocrit') {
        // Fórmula especial para hematócrito: (47 - hematócrito) * 6
        const hematocrit = value
        const hematocritScore = (47 - hematocrit) * param.multiplier
        total += Math.max(0, hematocritScore) // Não permitir valores negativos
      } else if (param.id === 'weight' || param.id === 'standardWeight') {
        // Peso será calculado separadamente
        return
      } else {
        total += value * param.multiplier
      }
    })

    // Calcular componente do peso: ((peso padrão - peso atual) / peso padrão) * 100
    const currentWeight = values['weight'] || 0
    const standardWeight = values['standardWeight'] || 0
    if (standardWeight > 0) {
      const weightLossPercentage =
        ((standardWeight - currentWeight) / standardWeight) * 100
      total += Math.max(0, weightLossPercentage) // Apenas perda de peso conta
    }

    return Math.round(total)
  }, [values])

  const getActivityLevel = useCallback((score: number) => {
    if (score < 150)
      return {
        level: 'Remissão',
        color: 'text-green-400',
        description: 'Doença em remissão',
        management: 'Manter tratamento atual, monitoramento regular',
      }
    if (score < 220)
      return {
        level: 'Leve',
        color: 'text-yellow-400',
        description: 'Atividade leve da doença',
        management: 'Considerar ajuste terapêutico, acompanhamento próximo',
      }
    if (score < 450)
      return {
        level: 'Moderada',
        color: 'text-orange-400',
        description: 'Atividade moderada da doença',
        management: 'Intensificação do tratamento, avaliação especializada',
      }
    return {
      level: 'Severa',
      color: 'text-red-400',
      description: 'Atividade severa da doença',
      management: 'Tratamento intensivo urgente, considerar hospitalização',
    }
  }, [])

  const handleReset = useCallback(() => {
    setValues({})
  }, [])

  const requiredFields = useMemo(() => [
    'liquidStools',
    'abdominalPain',
    'generalWellbeing',
    'hematocrit',
    'weight',
    'standardWeight',
  ], [])

  const isComplete = useMemo(() => 
    requiredFields.every(
      field => values[field] !== undefined && values[field] !== null
    ), [requiredFields, values]
  )

  const score = calculateCDAI
  const activity = useMemo(() => getActivityLevel(score), [getActivityLevel, score])

  const calculatorData = useMemo(() => ({
    calculatorName: 'CDAI (Atividade da Doença de Crohn)',
    calculatorType: 'CDAI',
    type: 'CDAI',
    score,
    result: {
      score,
      activity: activity.level,
      interpretation: activity.description,
    },
    activity: activity.level,
    interpretation: activity.description,
    values,
    timestamp: new Date().toISOString(),
  }), [score, activity, values])

  const resultComponent = useMemo(() => isComplete ? (
    <div className='space-y-4'>
      <CalculatorCard title='Resultado CDAI'>
        <div className='space-y-4'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-white mb-2'>{score}</div>
            <div className={`text-xl font-semibold ${activity.color} mb-2`}>
              {activity.level}
            </div>
            <p className='text-gray-300'>{activity.description}</p>
          </div>

          <div className='w-full bg-gray-700 rounded-full h-3'>
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                activity.level === 'Remissão'
                  ? 'bg-green-500'
                  : activity.level === 'Leve'
                    ? 'bg-yellow-500'
                    : activity.level === 'Moderada'
                      ? 'bg-orange-500'
                      : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((score / 450) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Conduta Sugerida'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <p className='text-gray-300 text-sm'>{activity.management}</p>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Interpretação'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <h3 className='text-blue-400 font-medium mb-2'>
            CDAI - Crohn's Disease Activity Index
          </h3>
          <p className='text-gray-300 text-sm mb-3'>
            Índice composto para avaliação da atividade da Doença de Crohn,
            considerando sintomas clínicos, exames laboratoriais e estado
            nutricional.
          </p>
          <div className='text-sm text-gray-300 space-y-1'>
            <p>
              <strong>&lt; 150:</strong> Remissão
            </p>
            <p>
              <strong>150-219:</strong> Atividade leve
            </p>
            <p>
              <strong>220-449:</strong> Atividade moderada
            </p>
            <p>
              <strong>≥ 450:</strong> Atividade severa
            </p>
          </div>
        </div>
      </CalculatorCard>
    </div>
  ) : null, [isComplete, score, activity])

  return (
    <BaseCalculator
      title="CDAI - Crohn's Disease Activity Index"
      description='Avaliação da atividade da Doença de Crohn'
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-4'>
        <div className='bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4'>
          <div className='flex justify-between items-center mb-2'>
            <h3 className='text-white font-medium'>Progresso</h3>
            <div className='text-sm text-gray-300'>
              {Object.keys(values).length} de {cdaiParameters.length} parâmetros
            </div>
          </div>
          <div className='w-full bg-gray-700 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{
                width: `${(Object.keys(values).length / cdaiParameters.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {cdaiParameters.map(param => (
          <CalculatorCard key={param.id} title={param.label}>
            <CalculatorQuestion question='' required>
              {param.type === 'radio' ? (
                <RadioGroup
                  value={values[param.id]?.toString() || ''}
                  onValueChange={value =>
                    handleValueChange(param.id, parseInt(value))
                  }
                  className='space-y-2'
                >
                  {param.options?.map(option => (
                    <div
                      key={option.value}
                      className='flex items-center space-x-2'
                    >
                      <RadioGroupItem
                        value={option.value.toString()}
                        id={`${param.id}-${option.value}`}
                        className='border-gray-600 text-blue-400'
                      />
                      <Label
                        htmlFor={`${param.id}-${option.value}`}
                        className='text-gray-300 cursor-pointer flex-1'
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className='flex items-center gap-2'>
                  <Input
                    type='number'
                    placeholder={param.placeholder}
                    value={values[param.id] || ''}
                    onChange={e =>
                      handleValueChange(
                        param.id,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className='bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  />
                  {param.unit && (
                    <span className='text-gray-400 text-sm'>{param.unit}</span>
                  )}
                </div>
              )}
            </CalculatorQuestion>
          </CalculatorCard>
        ))}
      </div>
    </BaseCalculator>
  )
})

export default CDAICalculator
