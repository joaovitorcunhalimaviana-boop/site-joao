'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import BaseCalculator, {
  CalculatorCard,
  CalculatorQuestion,
  CalculatorResult,
} from './base-calculator'

interface BMICalculatorProps {
  onSave: (result: any) => void
  darkMode?: boolean
}

export default function BMICalculator({
  onSave,
  darkMode = true,
}: BMICalculatorProps) {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [notes, setNotes] = useState('')

  const calculateBMI = () => {
    const weightNum = parseFloat(weight)
    const heightNum = parseFloat(height) / 100 // converter cm para metros

    if (weightNum > 0 && heightNum > 0) {
      return weightNum / (heightNum * heightNum)
    }
    return 0
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return {
        category: 'Abaixo do peso',
        color: 'text-blue-400',
        risk: 'Baixo risco',
        description: 'Abaixo do peso - Baixo risco',
      }
    if (bmi < 25)
      return {
        category: 'Peso normal',
        color: 'text-green-400',
        risk: 'Risco normal',
        description: 'Peso normal - Risco normal',
      }
    if (bmi < 30)
      return {
        category: 'Sobrepeso',
        color: 'text-yellow-400',
        risk: 'Risco aumentado',
        description: 'Sobrepeso - Risco aumentado',
      }
    if (bmi < 35)
      return {
        category: 'Obesidade Grau I',
        color: 'text-orange-400',
        risk: 'Risco moderado',
        description: 'Obesidade Grau I - Risco moderado',
      }
    if (bmi < 40)
      return {
        category: 'Obesidade Grau II',
        color: 'text-red-400',
        risk: 'Risco alto',
        description: 'Obesidade Grau II - Risco alto',
      }
    return {
      category: 'Obesidade Grau III',
      color: 'text-red-600',
      risk: 'Risco muito alto',
      description: 'Obesidade Grau III - Risco muito alto',
    }
  }

  const handleSave = () => {
    const bmi = calculateBMI()
    const category = getBMICategory(bmi)

    const result = {
      calculatorName: 'IMC (Índice de Massa Corporal)',
      weight: parseFloat(weight),
      height: parseFloat(height),
      bmi: bmi.toFixed(1),
      category: category.category,
      risk: category.risk,
      notes,
      timestamp: new Date().toISOString(),
    }
    onSave(result)
  }

  const handleReset = () => {
    setWeight('')
    setHeight('')
    setNotes('')
  }

  const isComplete =
    weight !== '' &&
    height !== '' &&
    parseFloat(weight) > 0 &&
    parseFloat(height) > 0
  const bmi = calculateBMI()
  const category = getBMICategory(bmi)

  const calculatorData = {
    calculatorName: 'Calculadora de IMC',
    calculatorType: 'bmi',
    type: 'bmi',
    weight: parseFloat(weight) || 0,
    height: parseFloat(height) || 0,
    bmi: bmi.toFixed(1),
    result: {
      bmi: bmi.toFixed(1),
      category: category.category,
      interpretation: category.description,
    },
    category: category.category,
    interpretation: category.description,
    notes,
    date: new Date().toISOString(),
  }

  const resultComponent = isComplete ? (
    <div className='space-y-4'>
      <CalculatorCard title='Resultado do IMC'>
        <div className='text-center space-y-4'>
          <div className='text-4xl font-bold text-white'>{bmi.toFixed(1)}</div>
          <div className={`text-xl font-semibold ${category.color}`}>
            {category.category}
          </div>
          <div className='text-gray-300'>{category.risk}</div>

          <div className='w-full bg-gray-700 rounded-full h-3 mt-4'>
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                bmi < 18.5
                  ? 'bg-blue-500'
                  : bmi < 25
                    ? 'bg-green-500'
                    : bmi < 30
                      ? 'bg-yellow-500'
                      : bmi < 35
                        ? 'bg-orange-500'
                        : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((bmi / 40) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Interpretação'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <h3 className='text-blue-400 font-medium mb-2'>
            Índice de Massa Corporal (IMC)
          </h3>
          <p className='text-gray-300 text-sm mb-3'>
            O IMC é uma medida que relaciona peso e altura para avaliar se uma
            pessoa está dentro do peso ideal.
          </p>
          <div className='text-sm text-gray-300 space-y-1'>
            <p>
              <strong>Abaixo de 18,5:</strong> Abaixo do peso
            </p>
            <p>
              <strong>18,5 - 24,9:</strong> Peso normal
            </p>
            <p>
              <strong>25,0 - 29,9:</strong> Sobrepeso
            </p>
            <p>
              <strong>30,0 - 34,9:</strong> Obesidade Grau I
            </p>
            <p>
              <strong>35,0 - 39,9:</strong> Obesidade Grau II
            </p>
            <p>
              <strong>≥ 40,0:</strong> Obesidade Grau III
            </p>
          </div>
        </div>
      </CalculatorCard>
    </div>
  ) : null

  return (
    <BaseCalculator
      title='IMC - Índice de Massa Corporal'
      description='Cálculo do Índice de Massa Corporal baseado no peso e altura'
      result={resultComponent}
      onSaveResult={handleSave}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-6'>
        <CalculatorCard title='Dados Antropométricos'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <CalculatorQuestion question='Peso (kg)' required>
              <Input
                type='number'
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder='Ex: 70'
                min='1'
                max='500'
                step='0.1'
                className='bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              />
            </CalculatorQuestion>

            <CalculatorQuestion question='Altura (cm)' required>
              <Input
                type='number'
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder='Ex: 175'
                min='50'
                max='250'
                step='0.1'
                className='bg-gray-800 border-gray-600 text-white placeholder-gray-400'
              />
            </CalculatorQuestion>
          </div>
        </CalculatorCard>

        <CalculatorCard title='Observações Clínicas'>
          <Textarea
            placeholder='Adicione observações sobre o paciente, contexto clínico ou recomendações...'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[100px]'
          />
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}
