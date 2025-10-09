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

interface BaronAnswers {
  [key: string]: number
}

const baronQuestions = [
  {
    id: 'size_of_most_ulcerated_area',
    question: 'Tamanho da maior área ulcerada',
    options: [
      {
        value: 0,
        label:
          '0 - Mucosa normal ou cicatrizada, eritema, perda leve da vascularização',
      },
      { value: 1, label: '1 - Pequenas erosões ou úlceras superficiais' },
      {
        value: 2,
        label: '2 - Úlceras superficiais maiores ou pequenas úlceras profundas',
      },
      {
        value: 3,
        label:
          '3 - Úlceras profundas maiores cobrindo mais de 30% da superfície',
      },
    ],
  },
  {
    id: 'ulcerated_surface',
    question: 'Porcentagem da superfície ulcerada',
    options: [
      { value: 0, label: '0 - Mucosa normal' },
      { value: 1, label: '1 - Menos de 10%' },
      { value: 2, label: '2 - 10-30%' },
      { value: 3, label: '3 - Mais de 30%' },
    ],
  },
  {
    id: 'presence_of_narrowing',
    question: 'Presença de estreitamento',
    options: [
      { value: 0, label: '0 - Ausente' },
      { value: 1, label: '1 - Único, pode ser atravessado' },
      { value: 2, label: '2 - Múltiplo, pode ser atravessado' },
      { value: 3, label: '3 - Não pode ser atravessado' },
    ],
  },
]

interface BaronCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

export default function BaronCalculator({
  onSaveResult,
  darkMode = true,
}: BaronCalculatorProps) {
  const [answers, setAnswers] = useState<BaronAnswers>({})
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
      return { text: 'Remissão endoscópica', color: 'green' as const, category: 'Remissão' }
    if (score <= 3) return { text: 'Doença leve', color: 'yellow' as const, category: 'Leve' }
    if (score <= 6) return { text: 'Doença moderada', color: 'yellow' as const, category: 'Moderada' }
    return { text: 'Doença severa', color: 'red' as const, category: 'Severa' }
  }

  const isComplete = Object.keys(answers).length === baronQuestions.length
  const score = calculateScore()
  const interpretation = getScoreInterpretation(score)

  const calculatorData = {
    calculatorName: 'Baron Score',
    calculatorType: 'baron',
    type: 'baron',
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
        label='Baron Score'
        value={`${score}/9`}
        interpretation={interpretation.text}
        color={interpretation.color}
      />

      <div className='bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4'>
        <h4 className='text-white font-medium mb-3'>Interpretação</h4>
        <div className='space-y-2 text-sm text-gray-300'>
          <div className='flex justify-between'>
            <span>0 pontos:</span>
            <span className='text-green-400'>Remissão endoscópica</span>
          </div>
          <div className='flex justify-between'>
            <span>1-3 pontos:</span>
            <span className='text-yellow-400'>Doença leve</span>
          </div>
          <div className='flex justify-between'>
            <span>4-6 pontos:</span>
            <span className='text-orange-400'>Doença moderada</span>
          </div>
          <div className='flex justify-between'>
            <span>7-9 pontos:</span>
            <span className='text-red-400'>Doença severa</span>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <BaseCalculator
      title='Baron Score'
      description='Avaliação endoscópica da atividade da doença de Crohn'
      result={resultComponent}
      onSaveResult={onSaveResult || undefined}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-6'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <h3 className='text-blue-400 font-medium mb-2'>Baron Score</h3>
          <p className='text-gray-300 text-sm'>
            Índice endoscópico para avaliação da atividade da doença de Crohn,
            baseado na extensão e profundidade das úlceras e presença de
            estreitamentos.
          </p>
        </div>

        {baronQuestions.map(question => (
          <CalculatorCard key={question.id} title={question.question}>
            <CalculatorQuestion question='' required>
              <RadioGroup
                value={answers[question.id]?.toString() || ''}
                onValueChange={value => handleAnswerChange(question.id, value)}
                className='space-y-3'
              >
                {question.options.map(option => (
                  <div
                    key={option.value}
                    className='flex items-start space-x-2'
                  >
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`${question.id}-${option.value}`}
                      className='border-gray-600 text-blue-400 mt-1'
                    />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className='text-gray-300 hover:text-white cursor-pointer flex-1 leading-relaxed'
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
            placeholder='Adicione observações sobre os achados endoscópicos, localização das lesões ou contexto clínico...'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[100px]'
          />
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}
