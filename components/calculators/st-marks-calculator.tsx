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

interface StMarksAnswers {
  [key: string]: number
}

const stMarksQuestions = [
  {
    id: 'solid_incontinence',
    question: 'Incontinência para fezes sólidas',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente (menos de 1x/mês)' },
      { value: 2, label: 'Às vezes (menos de 1x/semana)' },
      { value: 3, label: 'Usualmente (menos de 1x/dia)' },
      { value: 4, label: 'Sempre (≥ 1x/dia)' },
    ],
  },
  {
    id: 'liquid_incontinence',
    question: 'Incontinência para fezes líquidas',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente (menos de 1x/mês)' },
      { value: 2, label: 'Às vezes (menos de 1x/semana)' },
      { value: 3, label: 'Usualmente (menos de 1x/dia)' },
      { value: 4, label: 'Sempre (≥ 1x/dia)' },
    ],
  },
  {
    id: 'gas_incontinence',
    question: 'Incontinência para gases',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente (menos de 1x/mês)' },
      { value: 2, label: 'Às vezes (menos de 1x/semana)' },
      { value: 3, label: 'Usualmente (menos de 1x/dia)' },
      { value: 4, label: 'Sempre (≥ 1x/dia)' },
    ],
  },
  {
    id: 'pad_wearing',
    question: 'Uso de absorvente',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 2, label: 'Ocasionalmente' },
      { value: 4, label: 'Sempre' },
    ],
  },
  {
    id: 'constipating_medicines',
    question: 'Uso de medicamentos constipantes',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 2, label: 'Ocasionalmente' },
      { value: 4, label: 'Sempre' },
    ],
  },
  {
    id: 'urgency',
    question: 'Urgência (incapacidade de adiar a evacuação por 15 minutos)',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Ocasionalmente' },
      { value: 2, label: 'Usualmente' },
      { value: 3, label: 'Sempre' },
    ],
  },
]

interface StMarksCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

export default function StMarksCalculator({
  onSaveResult,
  darkMode = true,
}: StMarksCalculatorProps) {
  const [answers, setAnswers] = useState<StMarksAnswers>({})
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
    if (score <= 12)
      return { text: 'Incontinência leve a moderada', color: 'yellow' as const, category: 'Leve a Moderada' }
    return { text: 'Incontinência severa', color: 'red' as const, category: 'Severa' }
  }

  const isComplete = Object.keys(answers).length === stMarksQuestions.length
  const score = calculateScore()
  const interpretation = getScoreInterpretation(score)

  const calculatorData = {
    calculatorName: "Escala de Incontinência de St. Mark's",
    calculatorType: 'st-marks',
    type: 'st-marks',
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
        label="St. Mark's Score (Vaizey)"
        value={`${score}/24`}
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
            <span>1-12 pontos:</span>
            <span className='text-yellow-400'>
              Incontinência leve a moderada
            </span>
          </div>
          <div className='flex justify-between'>
            <span>13-24 pontos:</span>
            <span className='text-red-400'>Incontinência severa</span>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <BaseCalculator
      title="Escala de St. Mark's (Vaizey Score)"
      description='Avaliação da incontinência anal - modificação da escala Wexner'
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-6'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <h3 className='text-blue-400 font-medium mb-2'>
            Escala de St. Mark's
          </h3>
          <p className='text-gray-300 text-sm'>
            Modificação da escala de Wexner para avaliação da incontinência
            anal, incluindo urgência e uso de medicamentos.
          </p>
        </div>

        {stMarksQuestions.map(question => (
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
                      <span className='font-medium text-white mr-2'>
                        {option.value}
                      </span>
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
