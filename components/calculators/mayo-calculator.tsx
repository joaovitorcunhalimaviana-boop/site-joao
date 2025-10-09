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

interface MayoAnswers {
  [key: string]: number
}

const mayoQuestions = [
  {
    id: 'erythema',
    question: 'Eritema',
    options: [
      { value: 0, label: 'Normal ou inativo' },
      { value: 1, label: 'Eritema leve' },
      { value: 2, label: 'Eritema moderado' },
      { value: 3, label: 'Eritema severo' },
    ],
  },
  {
    id: 'vascular_pattern',
    question: 'Padrão vascular',
    options: [
      { value: 0, label: 'Padrão vascular normal' },
      { value: 1, label: 'Padrão vascular diminuído' },
      { value: 2, label: 'Padrão vascular marcadamente diminuído' },
      { value: 3, label: 'Padrão vascular completamente obscurecido' },
    ],
  },
  {
    id: 'friability',
    question: 'Friabilidade',
    options: [
      { value: 0, label: 'Ausente' },
      { value: 1, label: 'Friabilidade leve' },
      { value: 2, label: 'Friabilidade moderada' },
      { value: 3, label: 'Friabilidade severa' },
    ],
  },
  {
    id: 'erosions_ulcers',
    question: 'Erosões e úlceras',
    options: [
      { value: 0, label: 'Ausentes' },
      { value: 1, label: 'Erosões superficiais' },
      { value: 2, label: 'Úlceras bem definidas' },
      { value: 3, label: 'Úlceras extensas' },
    ],
  },
]

interface MayoCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

export default function MayoCalculator({
  onSaveResult,
  darkMode = true,
}: MayoCalculatorProps) {
  const [answers, setAnswers] = useState<MayoAnswers>({})
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
    if (score === 0) return { text: 'Mucosa normal', color: 'green' as const, category: 'Normal' }
    if (score <= 2) return { text: 'Doença leve', color: 'yellow' as const, category: 'Leve' }
    if (score <= 6) return { text: 'Doença moderada', color: 'yellow' as const, category: 'Moderada' }
    return { text: 'Doença severa', color: 'red' as const, category: 'Severa' }
  }

  const isComplete = Object.keys(answers).length === mayoQuestions.length
  const score = calculateScore()
  const interpretation = getScoreInterpretation(score)

  const calculatorData = {
    calculatorName: 'Mayo Endoscopic Score',
    calculatorType: 'mayo',
    type: 'mayo',
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
        label='Mayo Endoscopic Score'
        value={`${score}/12`}
        interpretation={interpretation.text}
        color={interpretation.color}
      />

      <div className='bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4'>
        <h4 className='text-white font-medium mb-3'>Interpretação</h4>
        <div className='space-y-2 text-sm text-gray-300'>
          <div className='flex justify-between'>
            <span>0 pontos:</span>
            <span className='text-green-400'>Mucosa normal</span>
          </div>
          <div className='flex justify-between'>
            <span>1-2 pontos:</span>
            <span className='text-yellow-400'>Doença leve</span>
          </div>
          <div className='flex justify-between'>
            <span>3-6 pontos:</span>
            <span className='text-yellow-400'>Doença moderada</span>
          </div>
          <div className='flex justify-between'>
            <span>7-12 pontos:</span>
            <span className='text-red-400'>Doença severa</span>
          </div>
        </div>
      </div>

      <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
        <h4 className='text-blue-400 font-medium mb-3'>
          Detalhamento por Parâmetro
        </h4>
        <div className='space-y-2 text-sm'>
          {mayoQuestions.map(question => {
            const answer = answers[question.id as keyof typeof answers]
            const option = question.options.find(opt => opt.value === answer)
            return (
              <div key={question.id} className='flex justify-between'>
                <span className='text-gray-300'>{question.question}:</span>
                <span className='text-white font-medium'>
                  {answer !== undefined
                    ? `${answer} - ${option?.label}`
                    : 'Não avaliado'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  ) : null

  return (
    <BaseCalculator
      title='Mayo Endoscopic Score'
      description='Avaliação endoscópica da severidade da colite ulcerativa'
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
            Mayo Endoscopic Score
          </h3>
          <p className='text-gray-300 text-sm'>
            Avaliação endoscópica da atividade da colite ulcerativa baseada em 4
            parâmetros. Cada parâmetro é pontuado de 0 a 3 pontos.
          </p>
        </div>

        {mayoQuestions.map(question => (
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
                    className='flex items-start space-x-3'
                  >
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`${question.id}-${option.value}`}
                      className='border-gray-600 text-blue-400 mt-1'
                    />
                    <div className='flex-1'>
                      <Label
                        htmlFor={`${question.id}-${option.value}`}
                        className='text-gray-300 hover:text-white cursor-pointer block'
                      >
                        <span className='font-medium text-white mr-2'>
                          {option.value}
                        </span>
                        {option.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CalculatorQuestion>
          </CalculatorCard>
        ))}

        {/* Notes */}
        <CalculatorCard title='Observações Endoscópicas'>
          <Textarea
            placeholder='Adicione observações sobre os achados endoscópicos, localização das lesões, extensão da doença ou outros detalhes relevantes...'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[100px]'
          />
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}
