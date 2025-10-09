'use client'

import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import BaseCalculator, {
  CalculatorCard,
  CalculatorQuestion,
  CalculatorResult,
} from './base-calculator'

interface WexnerAnswers {
  [key: string]: number
}

const wexnerQuestions = [
  {
    id: 'solid_stool',
    question: '1. Incontinência para fezes sólidas',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente (menos de 1x/mês)' },
      { value: 2, label: 'Às vezes (menos de 1x/semana, 1x/mês ou mais)' },
      { value: 3, label: 'Usualmente (menos de 1x/dia, 1x/semana ou mais)' },
      { value: 4, label: 'Sempre (≥ 1x/dia)' },
    ],
  },
  {
    id: 'liquid_stool',
    question: '2. Incontinência para fezes líquidas',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente (menos de 1x/mês)' },
      { value: 2, label: 'Às vezes (menos de 1x/semana, 1x/mês ou mais)' },
      { value: 3, label: 'Usualmente (menos de 1x/dia, 1x/semana ou mais)' },
      { value: 4, label: 'Sempre (≥ 1x/dia)' },
    ],
  },
  {
    id: 'gas',
    question: '3. Incontinência para gases',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente (menos de 1x/mês)' },
      { value: 2, label: 'Às vezes (menos de 1x/semana, 1x/mês ou mais)' },
      { value: 3, label: 'Usualmente (menos de 1x/dia, 1x/semana ou mais)' },
      { value: 4, label: 'Sempre (≥ 1x/dia)' },
    ],
  },
  {
    id: 'pad_wearing',
    question: '4. Uso de absorvente/fralda',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente (menos de 1x/mês)' },
      { value: 2, label: 'Às vezes (menos de 1x/semana, 1x/mês ou mais)' },
      { value: 3, label: 'Usualmente (menos de 1x/dia, 1x/semana ou mais)' },
      { value: 4, label: 'Sempre (≥ 1x/dia)' },
    ],
  },
  {
    id: 'lifestyle_alteration',
    question: '5. Alteração do estilo de vida',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente (menos de 1x/mês)' },
      { value: 2, label: 'Às vezes (menos de 1x/semana, 1x/mês ou mais)' },
      { value: 3, label: 'Usualmente (menos de 1x/dia, 1x/semana ou mais)' },
      { value: 4, label: 'Sempre (≥ 1x/dia)' },
    ],
  },
]

interface WexnerCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

export default function WexnerCalculator({
  onSaveResult,
  darkMode = true,
}: WexnerCalculatorProps) {
  const [answers, setAnswers] = useState<WexnerAnswers>({})
  const [notes, setNotes] = useState('')

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value),
    }))
  }

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0)
  }

  const getScoreInterpretation = (score: number) => {
    if (score === 0)
      return { text: 'Continência perfeita', color: 'green' as const, category: 'Perfeita' }
    if (score <= 9)
      return { text: 'Incontinência leve', color: 'yellow' as const, category: 'Leve' }
    if (score <= 14)
      return { text: 'Incontinência moderada', color: 'yellow' as const, category: 'Moderada' }
    return { text: 'Incontinência severa', color: 'red' as const, category: 'Severa' }
  }

  const isComplete = Object.keys(answers).length === wexnerQuestions.length
  const score = calculateScore()
  const interpretation = getScoreInterpretation(score)

  const calculatorData = {
    calculatorName: 'Score de Wexner',
    calculatorType: 'wexner',
    type: 'wexner',
    answers,
    score,
    result: {
      score,
      interpretation: interpretation.text,
      category: interpretation.category,
    },
    interpretation: interpretation.text,
    notes,
    date: new Date().toISOString(),
  }

  const handleReset = () => {
    setAnswers({})
    setNotes('')
  }

  const resultComponent = isComplete ? (
    <div className='space-y-4'>
      <CalculatorResult
        label='Score de Wexner'
        value={`${score}/20`}
        interpretation={interpretation.text}
        color={interpretation.color}
      />

      <div className='bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4'>
        <h4 className='text-white font-medium mb-3'>Interpretação</h4>
        <div className='space-y-2 text-sm text-gray-300'>
          <div className='flex justify-between'>
            <span>0 pontos:</span>
            <span className='text-green-400'>Continência perfeita</span>
          </div>
          <div className='flex justify-between'>
            <span>1-9 pontos:</span>
            <span className='text-yellow-400'>Incontinência leve</span>
          </div>
          <div className='flex justify-between'>
            <span>10-14 pontos:</span>
            <span className='text-yellow-400'>Incontinência moderada</span>
          </div>
          <div className='flex justify-between'>
            <span>15-20 pontos:</span>
            <span className='text-red-400'>Incontinência severa</span>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <BaseCalculator
      title='Score de Wexner'
      description='Cleveland Clinic Incontinence Score - Avaliação da incontinência fecal'
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-6'>
        {wexnerQuestions.map(question => (
          <CalculatorCard key={question.id} title={question.question}>
            <CalculatorQuestion question='' required>
              <RadioGroup
                value={answers[question.id]?.toString() || ''}
                onValueChange={value => handleAnswerChange(question.id, value)}
                className='space-y-2'
              >
                {question.options.map(option => (
                  <div
                    key={option.value}
                    className='flex items-center space-x-2'
                  >
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`${question.id}-${option.value}`}
                      className='border-gray-600 text-blue-400'
                    />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className='text-gray-300 hover:text-white cursor-pointer flex-1'
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CalculatorQuestion>
          </CalculatorCard>
        ))}

        {/* Notes */}
        <CalculatorCard title='Observações Clínicas'>
          <Textarea
            placeholder='Adicione observações sobre o paciente, sintomas adicionais ou contexto clínico...'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[100px]'
          />
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}
