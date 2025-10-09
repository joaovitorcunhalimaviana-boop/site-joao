'use client'

import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import BaseCalculator, {
  CalculatorCard,
  CalculatorQuestion,
} from './base-calculator'

interface ConstipationQuestion {
  id: string
  question: string
  options: { value: number; label: string }[]
}

const constipationQuestions: ConstipationQuestion[] = [
  {
    id: 'frequency',
    question: 'Frequência de evacuação',
    options: [
      { value: 0, label: '1-2 vezes por dia' },
      { value: 1, label: '2 vezes por semana' },
      { value: 2, label: '1 vez por semana' },
      { value: 3, label: 'Menos de 1 vez por semana' },
      { value: 4, label: 'Menos de 1 vez por mês' },
    ],
  },
  {
    id: 'difficulty',
    question: 'Dificuldade: esforço doloroso para evacuar',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente' },
      { value: 2, label: 'Às vezes' },
      { value: 3, label: 'Geralmente' },
      { value: 4, label: 'Sempre' },
    ],
  },
  {
    id: 'completeness',
    question: 'Sensação de evacuação incompleta',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente' },
      { value: 2, label: 'Às vezes' },
      { value: 3, label: 'Geralmente' },
      { value: 4, label: 'Sempre' },
    ],
  },
  {
    id: 'pain',
    question: 'Dor abdominal',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 1, label: 'Raramente' },
      { value: 2, label: 'Às vezes' },
      { value: 3, label: 'Geralmente' },
      { value: 4, label: 'Sempre' },
    ],
  },
  {
    id: 'time',
    question: 'Tempo no banheiro (minutos por tentativa)',
    options: [
      { value: 0, label: 'Menos de 5 minutos' },
      { value: 1, label: '5-10 minutos' },
      { value: 2, label: '10-20 minutos' },
      { value: 3, label: '20-30 minutos' },
      { value: 4, label: 'Mais de 30 minutos' },
    ],
  },
  {
    id: 'assistance',
    question: 'Tipo de assistência',
    options: [
      { value: 0, label: 'Sem assistência' },
      { value: 1, label: 'Estimulante (laxante, supositório)' },
      { value: 2, label: 'Enema' },
    ],
  },
  {
    id: 'attempts',
    question: 'Tentativas de evacuação por 24 horas',
    options: [
      { value: 0, label: '1-3' },
      { value: 1, label: '4-6' },
      { value: 2, label: '7-9' },
      { value: 3, label: '10+' },
    ],
  },
  {
    id: 'history',
    question: 'História de constipação',
    options: [
      { value: 0, label: 'Menos de 1 ano' },
      { value: 1, label: '1-5 anos' },
      { value: 2, label: '5-20 anos' },
      { value: 3, label: 'Mais de 20 anos' },
    ],
  },
]

interface ConstipacaoCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

export default function ConstipacaoCalculator({
  onSaveResult,
  darkMode = true,
}: ConstipacaoCalculatorProps) {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0)
  }

  const getScoreInterpretation = (score: number) => {
    if (score <= 15)
      return {
        level: 'Normal',
        color: 'text-green-400',
        description: 'Função intestinal normal',
        recommendations: [
          'Manter hábitos saudáveis',
          'Dieta rica em fibras',
          'Hidratação adequada',
          'Exercícios regulares',
        ],
      }
    if (score <= 20)
      return {
        level: 'Leve',
        color: 'text-yellow-400',
        description: 'Constipação leve',
        recommendations: [
          'Aumentar ingesta de fibras',
          'Melhorar hidratação (2-3L/dia)',
          'Atividade física regular',
          'Estabelecer rotina intestinal',
        ],
      }
    if (score <= 25)
      return {
        level: 'Moderada',
        color: 'text-orange-400',
        description: 'Constipação moderada',
        recommendations: [
          'Dieta rica em fibras (25-35g/dia)',
          'Hidratação abundante',
          'Exercícios diários',
          'Considerar probióticos',
          'Avaliação médica recomendada',
        ],
      }
    return {
      level: 'Severa',
      color: 'text-red-400',
      description: 'Constipação severa',
      recommendations: [
        'Avaliação médica urgente',
        'Investigação de causas secundárias',
        'Possível necessidade de laxantes',
        'Acompanhamento especializado',
        'Modificações dietéticas intensivas',
      ],
    }
  }

  const handleReset = () => {
    setAnswers({})
  }

  const isComplete =
    Object.keys(answers).length === constipationQuestions.length
  const score = calculateScore()
  const interpretation = getScoreInterpretation(score)

  const calculatorData = {
    calculatorName: 'Score de Constipação',
    calculatorType: 'Constipacao',
    type: 'Constipacao',
    score,
    severity: interpretation.level,
    result: {
      score,
      severity: interpretation.level,
      interpretation: interpretation.description,
    },
    interpretation: interpretation.description,
    answers,
    timestamp: new Date().toISOString(),
  }

  const resultComponent = isComplete ? (
    <div className='space-y-4'>
      <CalculatorCard title='Resultado do Score de Constipação'>
        <div className='space-y-4'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-white mb-2'>{score}/32</div>
            <div
              className={`text-xl font-semibold ${interpretation.color} mb-2`}
            >
              Constipação {interpretation.level}
            </div>
            <p className='text-gray-300'>{interpretation.description}</p>
          </div>

          <div className='w-full bg-gray-700 rounded-full h-3'>
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                interpretation.level === 'Normal'
                  ? 'bg-green-500'
                  : interpretation.level === 'Leve'
                    ? 'bg-yellow-500'
                    : interpretation.level === 'Moderada'
                      ? 'bg-orange-500'
                      : 'bg-red-500'
              }`}
              style={{ width: `${(score / 32) * 100}%` }}
            />
          </div>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Recomendações'>
        <div className='space-y-3'>
          {interpretation.recommendations.map((rec, index) => (
            <div key={index} className='flex items-start gap-2'>
              <span className='text-blue-400 mt-1'>•</span>
              <span className='text-gray-300 text-sm'>{rec}</span>
            </div>
          ))}
        </div>
      </CalculatorCard>

      <CalculatorCard title='Interpretação'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <h3 className='text-blue-400 font-medium mb-2'>
            Score de Constipação
          </h3>
          <p className='text-gray-300 text-sm mb-3'>
            Avaliação multidimensional da constipação funcional baseada em
            frequência, dificuldade, sintomas associados e impacto na qualidade
            de vida.
          </p>
          <div className='text-sm text-gray-300 space-y-1'>
            <p>
              <strong>Pontuação:</strong> 0-32 pontos
            </p>
            <p>
              <strong>0-15:</strong> Normal
            </p>
            <p>
              <strong>16-20:</strong> Constipação leve
            </p>
            <p>
              <strong>21-25:</strong> Constipação moderada
            </p>
            <p>
              <strong>26-32:</strong> Constipação severa
            </p>
          </div>
        </div>
      </CalculatorCard>
    </div>
  ) : null

  return (
    <BaseCalculator
      title='Score de Constipação'
      description='Avaliação da severidade da constipação funcional'
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
              {Object.keys(answers).length} de {constipationQuestions.length}{' '}
              questões
            </div>
          </div>
          <div className='w-full bg-gray-700 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{
                width: `${(Object.keys(answers).length / constipationQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {constipationQuestions.map(question => (
          <CalculatorCard key={question.id} title={question.question}>
            <CalculatorQuestion question='' required>
              <RadioGroup
                value={answers[question.id]?.toString() || ''}
                onValueChange={value =>
                  handleAnswerChange(question.id, parseInt(value))
                }
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
                      className='text-gray-300 cursor-pointer flex-1'
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CalculatorQuestion>
          </CalculatorCard>
        ))}
      </div>
    </BaseCalculator>
  )
}
