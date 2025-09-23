'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Calculator, FileText, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '../../../../components/ui/header'
import BackgroundPattern from '../../../../components/ui/background-pattern'

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
      { value: 3, label: '< 1 vez por semana' },
      { value: 4, label: '< 1 vez por mês' },
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
      { value: 0, label: '< 5 minutos' },
      { value: 1, label: '5-10 minutos' },
      { value: 2, label: '10-20 minutos' },
      { value: 3, label: '20-30 minutos' },
      { value: 4, label: '> 30 minutos' },
    ],
  },
  {
    id: 'assistance',
    question: 'Tipo de assistência',
    options: [
      { value: 0, label: 'Sem assistência' },
      { value: 1, label: 'Estimulantes/laxantes' },
      { value: 2, label: 'Enemas digitais' },
      { value: 3, label: 'Enemas/supositórios' },
      { value: 4, label: 'Manobras manuais' },
    ],
  },
  {
    id: 'attempts',
    question: 'Tentativas de evacuação por 24h',
    options: [
      { value: 0, label: '1-3' },
      { value: 1, label: '3-6' },
      { value: 2, label: '6-9' },
      { value: 3, label: '9-12' },
      { value: 4, label: '> 12' },
    ],
  },
  {
    id: 'history',
    question: 'História de constipação',
    options: [
      { value: 0, label: '< 1 ano' },
      { value: 1, label: '1-5 anos' },
      { value: 2, label: '5-10 anos' },
      { value: 3, label: '10-20 anos' },
      { value: 4, label: '> 20 anos' },
    ],
  },
]

export default function ConstipationScorePage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, number>>({})
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
    if (score <= 15)
      return {
        level: 'Normal',
        color: 'text-green-600',
        description: 'Função intestinal normal',
      }
    if (score <= 20)
      return {
        level: 'Leve',
        color: 'text-yellow-600',
        description: 'Constipação leve',
      }
    if (score <= 25)
      return {
        level: 'Moderada',
        color: 'text-orange-600',
        description: 'Constipação moderada',
      }
    return {
      level: 'Severa',
      color: 'text-red-600',
      description: 'Constipação severa',
    }
  }

  const isComplete =
    Object.keys(answers).length === constipationQuestions.length
  const score = calculateScore()
  const interpretation = getScoreInterpretation(score)

  const handlePrint = () => {
    window.print()
  }

  const handleReset = () => {
    setAnswers({})
    setNotes('')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900'>
      <Header currentPage='Calculadoras Médicas' />
      <BackgroundPattern />

      <div className='relative z-10 max-w-4xl mx-auto p-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <Button
            variant='outline'
            onClick={() => router.push('/area-medica/calculadoras')}
            className='flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
          >
            <ArrowLeft className='h-4 w-4' />
            Voltar
          </Button>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handleReset}
              className='flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
            >
              <RotateCcw className='h-4 w-4' />
              Limpar
            </Button>
            <Button
              onClick={handlePrint}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white'
            >
              <FileText className='h-4 w-4' />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center gap-3 mb-4'>
            <Calculator className='h-8 w-8 text-blue-400' />
            <h1 className='text-3xl font-bold text-white'>
              Score de Constipação
            </h1>
          </div>
          <p className='text-gray-300 max-w-2xl mx-auto'>
            Avaliação quantitativa da constipação funcional baseada em 8
            parâmetros clínicos. Pontuação máxima: 32 pontos.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Questions */}
          <div className='lg:col-span-2 space-y-6'>
            {constipationQuestions.map((question, index) => (
              <Card key={question.id} className='bg-gray-800 border-gray-700'>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center gap-2 text-white'>
                    <span className='bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
                      {index + 1}
                    </span>
                    {question.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[question.id]?.toString() || ''}
                    onValueChange={value =>
                      handleAnswerChange(question.id, value)
                    }
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
                          className='flex-1 cursor-pointer text-gray-300'
                        >
                          <span className='font-medium text-blue-400 mr-2'>
                            {option.value}
                          </span>
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}

            {/* Notes */}
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white'>
                  Observações Clínicas
                </CardTitle>
                <CardDescription className='text-gray-400'>
                  Adicione informações relevantes sobre o paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder='Ex: Sintomas associados, medicações em uso, exames complementares...'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className='min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                />
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className='space-y-6'>
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Calculator className='h-5 w-5 text-blue-400' />
                  Resultado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isComplete ? (
                  <div className='space-y-4'>
                    <div className='text-center'>
                      <div className='text-4xl font-bold text-blue-400 mb-2'>
                        {score}
                      </div>
                      <div className='text-sm text-gray-400'>de 32 pontos</div>
                    </div>
                    <div
                      className={`text-center p-4 rounded-lg bg-gray-700 border border-gray-600`}
                    >
                      <div
                        className={`text-xl font-bold ${interpretation.color} mb-1`}
                      >
                        {interpretation.level}
                      </div>
                      <div className='text-sm text-gray-300'>
                        {interpretation.description}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center text-gray-400'>
                    <Calculator className='h-12 w-12 mx-auto mb-3 opacity-50' />
                    <p>Complete todas as questões para ver o resultado</p>
                    <p className='text-sm mt-2'>
                      {Object.keys(answers).length} de{' '}
                      {constipationQuestions.length} respondidas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interpretation Guide */}
            <Card className='bg-gray-800 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white'>Interpretação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>0-15 pontos</span>
                    <span className='text-green-400 font-medium'>Normal</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>16-20 pontos</span>
                    <span className='text-yellow-400 font-medium'>Leve</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>21-25 pontos</span>
                    <span className='text-orange-400 font-medium'>
                      Moderada
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>26-32 pontos</span>
                    <span className='text-red-400 font-medium'>Severa</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
