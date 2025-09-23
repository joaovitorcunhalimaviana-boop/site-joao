'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import Header from '../../../../components/ui/header'
import BackgroundPattern from '../../../../components/ui/background-pattern'

interface BaronQuestion {
  id: string
  question: string
  options: { value: number; label: string }[]
}

const baronQuestions: BaronQuestion[] = [
  {
    id: 'frequency',
    question: 'Frequência de evacuações por semana',
    options: [
      { value: 0, label: '1-2 vezes por semana' },
      { value: 1, label: '3-6 vezes por semana' },
      { value: 2, label: '1 vez por dia' },
      { value: 3, label: '2 ou mais vezes por dia' },
    ],
  },
  {
    id: 'difficulty',
    question: 'Dificuldade para evacuar',
    options: [
      { value: 0, label: 'Sempre' },
      { value: 1, label: 'Frequentemente' },
      { value: 2, label: 'Às vezes' },
      { value: 3, label: 'Nunca' },
    ],
  },
  {
    id: 'completeness',
    question: 'Sensação de evacuação incompleta',
    options: [
      { value: 0, label: 'Sempre' },
      { value: 1, label: 'Frequentemente' },
      { value: 2, label: 'Às vezes' },
      { value: 3, label: 'Nunca' },
    ],
  },
  {
    id: 'pain',
    question: 'Dor abdominal',
    options: [
      { value: 0, label: 'Severa' },
      { value: 1, label: 'Moderada' },
      { value: 2, label: 'Leve' },
      { value: 3, label: 'Ausente' },
    ],
  },
  {
    id: 'time',
    question: 'Tempo gasto no banheiro (minutos)',
    options: [
      { value: 0, label: 'Mais de 30' },
      { value: 1, label: '10-30' },
      { value: 2, label: '5-10' },
      { value: 3, label: 'Menos de 5' },
    ],
  },
  {
    id: 'assistance',
    question: 'Tipo de assistência para evacuação',
    options: [
      { value: 0, label: 'Ajuda manual ou enema' },
      { value: 1, label: 'Laxantes' },
      { value: 2, label: 'Sem assistência' },
    ],
  },
  {
    id: 'attempts',
    question: 'Tentativas malsucedidas de evacuação por 24h',
    options: [
      { value: 0, label: 'Mais de 3' },
      { value: 1, label: '1-3' },
      { value: 2, label: 'Nenhuma' },
    ],
  },
  {
    id: 'history',
    question: 'História de constipação',
    options: [
      { value: 0, label: 'Mais de 20 anos' },
      { value: 1, label: '10-20 anos' },
      { value: 2, label: 'Menos de 10 anos' },
    ],
  },
]

export default function BaronScore() {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResult, setShowResult] = useState(false)

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value),
    }))
  }

  const calculateScore = () => {
    const totalScore = Object.values(answers).reduce(
      (sum, score) => sum + score,
      0
    )
    return totalScore
  }

  const getInterpretation = (score: number) => {
    if (score >= 20) {
      return {
        level: 'Normal',
        description: 'Função intestinal normal',
        color: 'text-green-600',
      }
    } else if (score >= 10) {
      return {
        level: 'Constipação Leve',
        description: 'Constipação leve a moderada',
        color: 'text-yellow-600',
      }
    } else {
      return {
        level: 'Constipação Severa',
        description: 'Constipação severa',
        color: 'text-red-600',
      }
    }
  }

  const handleCalculate = () => {
    if (Object.keys(answers).length === baronQuestions.length) {
      setShowResult(true)
    }
  }

  const handleReset = () => {
    setAnswers({})
    setShowResult(false)
  }

  const score = calculateScore()
  const interpretation = getInterpretation(score)
  const allQuestionsAnswered =
    Object.keys(answers).length === baronQuestions.length

  return (
    <div className='min-h-screen bg-gray-900 relative'>
      <BackgroundPattern />
      <Header />

      <div className='relative z-10 container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-8'>
            <div className='flex items-center justify-center gap-3 mb-4'>
              <Calculator className='h-8 w-8 text-blue-400' />
              <h1 className='text-3xl font-bold text-white'>Baron Score</h1>
            </div>
            <p className='text-gray-300 text-lg'>
              Avaliação da constipação funcional
            </p>
          </div>

          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader>
              <CardTitle className='text-white'>
                Questionário Baron Score
              </CardTitle>
              <CardDescription className='text-gray-300'>
                Responda todas as perguntas para calcular o score
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {baronQuestions.map(question => (
                <div key={question.id} className='space-y-3'>
                  <Label className='text-white font-medium'>
                    {question.question}
                  </Label>
                  <RadioGroup
                    value={answers[question.id]?.toString() || ''}
                    onValueChange={value =>
                      handleAnswerChange(question.id, value)
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
                          className='text-gray-300 cursor-pointer'
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}

              <div className='flex gap-4 pt-6'>
                <Button
                  onClick={handleCalculate}
                  disabled={!allQuestionsAnswered}
                  className='bg-blue-600 hover:bg-blue-700 text-white'
                >
                  Calcular Score
                </Button>
                <Button
                  onClick={handleReset}
                  variant='outline'
                  className='border-gray-600 text-gray-300 hover:bg-gray-700'
                >
                  Limpar
                </Button>
              </div>

              {showResult && (
                <Card className='bg-gray-700 border-gray-600 mt-6'>
                  <CardHeader>
                    <CardTitle className='text-white'>Resultado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div className='text-center'>
                        <div className='text-3xl font-bold text-blue-400 mb-2'>
                          {score} pontos
                        </div>
                        <div
                          className={`text-xl font-semibold ${interpretation.color} mb-2`}
                        >
                          {interpretation.level}
                        </div>
                        <p className='text-gray-300'>
                          {interpretation.description}
                        </p>
                      </div>

                      <div className='bg-gray-800 p-4 rounded-lg'>
                        <h4 className='font-semibold text-white mb-2'>
                          Interpretação:
                        </h4>
                        <ul className='text-gray-300 space-y-1 text-sm'>
                          <li>• 20-24 pontos: Função intestinal normal</li>
                          <li>• 10-19 pontos: Constipação leve a moderada</li>
                          <li>• 0-9 pontos: Constipação severa</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
