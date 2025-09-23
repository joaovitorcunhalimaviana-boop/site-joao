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

interface MayoParameter {
  id: string
  title: string
  description: string
  options: { value: number; label: string; description: string }[]
}

const mayoParameters: MayoParameter[] = [
  {
    id: 'stoolFrequency',
    title: 'Frequência das evacuações',
    description: 'Baseada no número de evacuações por dia',
    options: [
      {
        value: 0,
        label: '0 - Normal',
        description: 'Número normal de evacuações para o paciente',
      },
      {
        value: 1,
        label: '1 - Leve aumento',
        description: '1-2 evacuações/dia a mais que o normal',
      },
      {
        value: 2,
        label: '2 - Aumento moderado',
        description: '3-4 evacuações/dia a mais que o normal',
      },
      {
        value: 3,
        label: '3 - Aumento severo',
        description: '≥5 evacuações/dia a mais que o normal',
      },
    ],
  },
  {
    id: 'rectalBleeding',
    title: 'Sangramento retal',
    description: 'Presença de sangue nas fezes',
    options: [
      { value: 0, label: '0 - Ausente', description: 'Sem sangue visível' },
      {
        value: 1,
        label: '1 - Sangue visível < 50% das evacuações',
        description: 'Sangue ocasional',
      },
      {
        value: 2,
        label: '2 - Sangue visível ≥ 50% das evacuações',
        description: 'Sangue na maioria das evacuações',
      },
      {
        value: 3,
        label: '3 - Sangue sozinho passa',
        description: 'Sangramento sem fezes',
      },
    ],
  },
  {
    id: 'endoscopy',
    title: 'Achados endoscópicos',
    description: 'Aparência da mucosa à colonoscopia/sigmoidoscopia',
    options: [
      {
        value: 0,
        label: '0 - Normal ou inativo',
        description: 'Mucosa normal ou cicatrizada',
      },
      {
        value: 1,
        label: '1 - Doença leve',
        description:
          'Eritema, diminuição do padrão vascular, friabilidade leve',
      },
      {
        value: 2,
        label: '2 - Doença moderada',
        description:
          'Eritema marcante, ausência do padrão vascular, friabilidade, erosões',
      },
      {
        value: 3,
        label: '3 - Doença severa',
        description: 'Ulceração espontânea, sangramento',
      },
    ],
  },
  {
    id: 'physicianAssessment',
    title: 'Avaliação global do médico',
    description: 'Impressão clínica geral da atividade da doença',
    options: [
      { value: 0, label: '0 - Normal', description: 'Paciente assintomático' },
      {
        value: 1,
        label: '1 - Doença leve',
        description: 'Sintomas leves que não interferem na função',
      },
      {
        value: 2,
        label: '2 - Doença moderada',
        description: 'Sintomas que interferem na função',
      },
      {
        value: 3,
        label: '3 - Doença severa',
        description: 'Sintomas incapacitantes',
      },
    ],
  },
]

export default function MayoScorePage() {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')

  const handleScoreChange = (parameterId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [parameterId]: parseInt(value),
    }))
  }

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((sum, value) => sum + value, 0)
  }

  const calculateClinicalScore = () => {
    // Mayo clínico = frequência + sangramento + avaliação médica (sem endoscopia)
    const clinicalParams = [
      'stoolFrequency',
      'rectalBleeding',
      'physicianAssessment',
    ]
    return clinicalParams.reduce((sum, param) => sum + (scores[param] || 0), 0)
  }

  const getActivityLevel = (score: number, isClinical: boolean = false) => {
    if (isClinical) {
      if (score <= 2)
        return {
          level: 'Remissão',
          color: 'text-green-600',
          description: 'Doença inativa',
        }
      if (score <= 4)
        return {
          level: 'Leve',
          color: 'text-yellow-600',
          description: 'Atividade leve',
        }
      if (score <= 6)
        return {
          level: 'Moderada',
          color: 'text-orange-600',
          description: 'Atividade moderada',
        }
      return {
        level: 'Severa',
        color: 'text-red-600',
        description: 'Atividade severa',
      }
    } else {
      if (score <= 2)
        return {
          level: 'Remissão',
          color: 'text-green-600',
          description: 'Doença inativa',
        }
      if (score <= 5)
        return {
          level: 'Leve',
          color: 'text-yellow-600',
          description: 'Atividade leve',
        }
      if (score <= 8)
        return {
          level: 'Moderada',
          color: 'text-orange-600',
          description: 'Atividade moderada',
        }
      return {
        level: 'Severa',
        color: 'text-red-600',
        description: 'Atividade severa',
      }
    }
  }

  const isComplete = Object.keys(scores).length === mayoParameters.length
  const totalScore = calculateTotalScore()
  const clinicalScore = calculateClinicalScore()
  const totalActivity = getActivityLevel(totalScore, false)
  const clinicalActivity = getActivityLevel(clinicalScore, true)

  const handlePrint = () => {
    window.print()
  }

  const handleReset = () => {
    setScores({})
    setNotes('')
  }

  return (
    <div className='min-h-screen bg-gray-900 relative'>
      <BackgroundPattern />
      <Header />
      <div className='relative z-10 p-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <Button
              variant='outline'
              onClick={() => router.push('/area-medica/calculadoras')}
              className='flex items-center gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              Voltar
            </Button>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={handleReset}
                className='flex items-center gap-2'
              >
                <RotateCcw className='h-4 w-4' />
                Limpar
              </Button>
              <Button onClick={handlePrint} className='flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Imprimir
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className='text-center mb-8'>
            <div className='flex items-center justify-center gap-3 mb-4'>
              <Calculator className='h-8 w-8 text-blue-400' />
              <h1 className='text-3xl font-bold text-white'>Mayo Score</h1>
            </div>
            <p className='text-gray-300 max-w-2xl mx-auto'>
              Índice para avaliação da atividade da Retocolite Ulcerativa
              baseado em 4 parâmetros clínicos e endoscópicos. Pontuação máxima:
              12 pontos.
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Parameters */}
            <div className='lg:col-span-2 space-y-6'>
              {mayoParameters.map((param, index) => (
                <Card key={param.id}>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <span className='bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
                        {index + 1}
                      </span>
                      {param.title}
                    </CardTitle>
                    <CardDescription>{param.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={scores[param.id]?.toString() || ''}
                      onValueChange={value =>
                        handleScoreChange(param.id, value)
                      }
                    >
                      {param.options.map(option => (
                        <div
                          key={option.value}
                          className='flex items-start space-x-2 p-3 rounded-lg hover:bg-gray-50'
                        >
                          <RadioGroupItem
                            value={option.value.toString()}
                            id={`${param.id}-${option.value}`}
                            className='mt-1'
                          />
                          <Label
                            htmlFor={`${param.id}-${option.value}`}
                            className='flex-1 cursor-pointer'
                          >
                            <div className='font-medium text-blue-600 mb-1'>
                              {option.label}
                            </div>
                            <div className='text-sm text-gray-600'>
                              {option.description}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Observações Clínicas</CardTitle>
                  <CardDescription>
                    Adicione informações relevantes sobre o paciente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder='Ex: Medicações em uso, exames laboratoriais, biópsias...'
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className='min-h-[100px]'
                  />
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className='space-y-6'>
              {/* Total Mayo Score */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calculator className='h-5 w-5' />
                    Mayo Score Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isComplete ? (
                    <div className='space-y-4'>
                      <div className='text-center'>
                        <div className='text-4xl font-bold text-blue-600 mb-2'>
                          {totalScore}
                        </div>
                        <div className='text-sm text-gray-500'>
                          de 12 pontos
                        </div>
                      </div>
                      <div className={`text-center p-4 rounded-lg bg-gray-50`}>
                        <div
                          className={`text-xl font-bold ${totalActivity.color} mb-1`}
                        >
                          {totalActivity.level}
                        </div>
                        <div className='text-sm text-gray-600'>
                          {totalActivity.description}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center text-gray-500'>
                      <Calculator className='h-12 w-12 mx-auto mb-3 opacity-50' />
                      <p>Complete todos os parâmetros para ver o resultado</p>
                      <p className='text-sm mt-2'>
                        {Object.keys(scores).length} de {mayoParameters.length}{' '}
                        respondidos
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clinical Mayo Score */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calculator className='h-5 w-5' />
                    Mayo Clínico
                  </CardTitle>
                  <CardDescription>
                    Sem endoscopia (3 parâmetros)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(scores).length >= 3 ? (
                    <div className='space-y-4'>
                      <div className='text-center'>
                        <div className='text-3xl font-bold text-green-600 mb-2'>
                          {clinicalScore}
                        </div>
                        <div className='text-sm text-gray-500'>de 9 pontos</div>
                      </div>
                      <div className={`text-center p-3 rounded-lg bg-gray-50`}>
                        <div
                          className={`text-lg font-bold ${clinicalActivity.color} mb-1`}
                        >
                          {clinicalActivity.level}
                        </div>
                        <div className='text-xs text-gray-600'>
                          {clinicalActivity.description}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center text-gray-500 text-sm'>
                      <p>Complete os 3 primeiros parâmetros</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interpretation Guide */}
              <Card>
                <CardHeader>
                  <CardTitle>Interpretação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-medium mb-2'>Mayo Total (0-12)</h4>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between items-center'>
                          <span>0-2 pontos</span>
                          <span className='text-green-600 font-medium'>
                            Remissão
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span>3-5 pontos</span>
                          <span className='text-yellow-600 font-medium'>
                            Leve
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span>6-8 pontos</span>
                          <span className='text-orange-600 font-medium'>
                            Moderada
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span>9-12 pontos</span>
                          <span className='text-red-600 font-medium'>
                            Severa
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className='font-medium mb-2'>Mayo Clínico (0-9)</h4>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between items-center'>
                          <span>0-2 pontos</span>
                          <span className='text-green-600 font-medium'>
                            Remissão
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span>3-4 pontos</span>
                          <span className='text-yellow-600 font-medium'>
                            Leve
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span>5-6 pontos</span>
                          <span className='text-orange-600 font-medium'>
                            Moderada
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span>7-9 pontos</span>
                          <span className='text-red-600 font-medium'>
                            Severa
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
