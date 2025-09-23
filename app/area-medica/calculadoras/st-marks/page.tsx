'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../../components/ui/header'
import BackgroundPattern from '../../../../components/ui/background-pattern'
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

interface StMarksQuestion {
  id: string
  question: string
  options: { value: number; label: string }[]
}

const stMarksQuestions: StMarksQuestion[] = [
  {
    id: 'never_wear_pad',
    question: 'Nunca usa absorvente ou fralda',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 4, label: 'Às vezes' },
      { value: 8, label: 'Sempre' },
    ],
  },
  {
    id: 'loose_stool_pad',
    question: 'Usa absorvente para fezes líquidas',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 2, label: 'Às vezes' },
      { value: 4, label: 'Sempre' },
    ],
  },
  {
    id: 'solid_stool_pad',
    question: 'Usa absorvente para fezes sólidas',
    options: [
      { value: 0, label: 'Nunca' },
      { value: 2, label: 'Às vezes' },
      { value: 4, label: 'Sempre' },
    ],
  },
  {
    id: 'lifestyle_alteration',
    question: 'Alteração do estilo de vida',
    options: [
      { value: 0, label: 'Nenhuma' },
      { value: 1, label: 'Ocasional' },
      { value: 2, label: 'Adaptação' },
      { value: 3, label: 'Severa limitação' },
      { value: 4, label: 'Incapacitante' },
    ],
  },
]

const getIncontinenceGrade = (score: number) => {
  if (score === 0)
    return {
      grade: 'Perfeita continência',
      color: 'text-green-600',
      description: 'Sem episódios de incontinência',
    }
  if (score <= 8)
    return {
      grade: 'Boa continência',
      color: 'text-blue-600',
      description: 'Incontinência mínima',
    }
  if (score <= 14)
    return {
      grade: 'Continência regular',
      color: 'text-yellow-600',
      description: 'Incontinência moderada',
    }
  return {
    grade: 'Incontinência severa',
    color: 'text-red-600',
    description: 'Incontinência significativa',
  }
}

export default function StMarksPage() {
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
    return Object.values(answers).reduce((sum, score) => sum + score, 0)
  }

  const isComplete = Object.keys(answers).length === stMarksQuestions.length
  const totalScore = calculateScore()
  const incontinenceGrade = getIncontinenceGrade(totalScore)

  const resetForm = () => {
    setAnswers({})
    setNotes('')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <BackgroundPattern />
      <Header />
      <div className='relative z-10 container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-8'>
            <div className='flex items-center gap-4 mb-6'>
              <Button
                variant='outline'
                onClick={() => router.push('/area-medica/calculadoras')}
                className='flex items-center gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                Voltar
              </Button>
              <Button
                variant='outline'
                onClick={resetForm}
                className='flex items-center gap-2'
              >
                <RotateCcw className='h-4 w-4' />
                Reiniciar
              </Button>
            </div>

            <div className='text-center mb-8'>
              <h1 className='text-4xl font-bold text-gray-900 mb-4'>
                Escore de Incontinência de St. Mark's
              </h1>
              <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                Avaliação da gravidade da incontinência fecal baseada em
                sintomas e impacto na qualidade de vida.
              </p>
            </div>

            {/* Questions */}
            <div className='space-y-6'>
              {stMarksQuestions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      {index + 1}. {question.question}
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
                          />
                          <Label
                            htmlFor={`${question.id}-${option.value}`}
                            className='flex-1 cursor-pointer'
                          >
                            <span className='font-medium text-blue-600 mr-2'>
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
            </div>

            {/* Results */}
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calculator className='h-5 w-5' />
                  Resultado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isComplete ? (
                  <div className='space-y-4'>
                    <div className='text-center'>
                      <div className='text-4xl font-bold text-blue-600 mb-2'>
                        {totalScore}
                      </div>
                      <div className='text-sm text-gray-500'>de 24 pontos</div>
                    </div>
                    <div className={`text-center p-4 rounded-lg bg-gray-50`}>
                      <div
                        className={`text-xl font-bold ${incontinenceGrade.color} mb-1`}
                      >
                        {incontinenceGrade.grade}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {incontinenceGrade.description}
                      </div>
                    </div>
                    <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
                      <h4 className='font-semibold text-blue-900 mb-2'>
                        Interpretação
                      </h4>
                      <div className='text-sm text-blue-800 space-y-1'>
                        <p>
                          <strong>0 pontos:</strong> Perfeita continência
                        </p>
                        <p>
                          <strong>1-8 pontos:</strong> Boa continência
                          (incontinência mínima)
                        </p>
                        <p>
                          <strong>9-14 pontos:</strong> Continência regular
                          (incontinência moderada)
                        </p>
                        <p>
                          <strong>15-24 pontos:</strong> Incontinência severa
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center text-gray-500'>
                    <Calculator className='h-12 w-12 mx-auto mb-3 opacity-50' />
                    <p>Complete todas as questões para ver o resultado</p>
                    <p className='text-sm mt-1'>
                      {Object.keys(answers).length} de {stMarksQuestions.length}{' '}
                      questões respondidas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle>Observações Clínicas</CardTitle>
                <CardDescription>
                  Adicione informações relevantes sobre o paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder='Ex: Medicações em uso, cirurgias prévias, comorbidades...'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className='min-h-[100px]'
                />
              </CardContent>
            </Card>

            {/* Clinical Information */}
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Informações Clínicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4 text-sm text-gray-700'>
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Sobre o Escore de St. Mark's
                    </h4>
                    <p>
                      O Escore de Incontinência de St. Mark's é uma ferramenta
                      validada para avaliar a gravidade da incontinência fecal.
                      Considera tanto a frequência dos episódios quanto o
                      impacto na qualidade de vida do paciente.
                    </p>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Aplicação Clínica
                    </h4>
                    <ul className='list-disc list-inside space-y-1'>
                      <li>Avaliação inicial da gravidade da incontinência</li>
                      <li>Monitoramento da resposta ao tratamento</li>
                      <li>Comparação de diferentes modalidades terapêuticas</li>
                      <li>Indicação para procedimentos cirúrgicos</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Limitações
                    </h4>
                    <p>
                      O escore deve ser interpretado em conjunto com a história
                      clínica completa, exame físico e outros exames
                      complementares quando indicados.
                    </p>
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
