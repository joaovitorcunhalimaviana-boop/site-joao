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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Calculator, FileText, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '../../../../components/ui/header'
import BackgroundPattern from '../../../../components/ui/background-pattern'

interface CDAIParameter {
  id: string
  label: string
  type: 'number' | 'radio'
  multiplier: number
  options?: { value: number; label: string }[]
  unit?: string
  placeholder?: string
}

const cdaiParameters: CDAIParameter[] = [
  {
    id: 'liquidStools',
    label: 'Número de evacuações líquidas/pastosas (últimos 7 dias)',
    type: 'number',
    multiplier: 2,
    placeholder: 'Ex: 14 (média de 2 por dia)',
  },
  {
    id: 'abdominalPain',
    label: 'Dor abdominal (últimos 7 dias)',
    type: 'radio',
    multiplier: 5,
    options: [
      { value: 0, label: '0 - Ausente' },
      { value: 1, label: '1 - Leve' },
      { value: 2, label: '2 - Moderada' },
      { value: 3, label: '3 - Severa' },
    ],
  },
  {
    id: 'generalWellbeing',
    label: 'Bem-estar geral (últimos 7 dias)',
    type: 'radio',
    multiplier: 7,
    options: [
      { value: 0, label: '0 - Excelente' },
      { value: 1, label: '1 - Bom' },
      { value: 2, label: '2 - Regular' },
      { value: 3, label: '3 - Ruim' },
      { value: 4, label: '4 - Péssimo' },
    ],
  },
  {
    id: 'extraintestinal',
    label: 'Manifestações extraintestinais',
    type: 'radio',
    multiplier: 20,
    options: [
      { value: 0, label: 'Nenhuma' },
      { value: 1, label: 'Artrite/artralgia' },
      { value: 2, label: 'Irite/uveíte' },
      { value: 3, label: 'Eritema nodoso/pioderma gangrenoso' },
      { value: 4, label: 'Fissura/fístula/abscesso anal' },
      { value: 5, label: 'Outras fístulas' },
      { value: 6, label: 'Febre > 37.8°C' },
    ],
  },
  {
    id: 'antidiarrheal',
    label: 'Uso de antidiarreicos',
    type: 'radio',
    multiplier: 30,
    options: [
      { value: 0, label: 'Não' },
      { value: 1, label: 'Sim' },
    ],
  },
  {
    id: 'abdominalMass',
    label: 'Massa abdominal palpável',
    type: 'radio',
    multiplier: 10,
    options: [
      { value: 0, label: 'Ausente' },
      { value: 2, label: 'Questionável' },
      { value: 5, label: 'Presente' },
    ],
  },
  {
    id: 'hematocrit',
    label: 'Hematócrito (%)',
    type: 'number',
    multiplier: 6,
    unit: '%',
    placeholder: 'Ex: 35',
  },
  {
    id: 'weight',
    label: 'Peso atual (kg)',
    type: 'number',
    multiplier: 1,
    unit: 'kg',
    placeholder: 'Ex: 70',
  },
  {
    id: 'standardWeight',
    label: 'Peso padrão/ideal (kg)',
    type: 'number',
    multiplier: 1,
    unit: 'kg',
    placeholder: 'Ex: 75',
  },
]

export default function CDAIPage() {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')

  const handleValueChange = (parameterId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setValues(prev => ({
      ...prev,
      [parameterId]: numValue,
    }))
  }

  const calculateCDAI = () => {
    let total = 0

    cdaiParameters.forEach(param => {
      const value = values[param.id] || 0

      if (param.id === 'hematocrit') {
        // Fórmula especial para hematócrito: (47 - hematócrito) × 6
        const hematocrit = value
        const hematocritScore = (47 - hematocrit) * param.multiplier
        total += hematocritScore
      } else if (param.id === 'weight' || param.id === 'standardWeight') {
        // Peso será calculado separadamente
        return
      } else {
        total += value * param.multiplier
      }
    })

    // Cálculo do peso: (peso padrão - peso atual) / peso padrão × 100
    const currentWeight = values['weight'] || 0
    const standardWeight = values['standardWeight'] || 0
    if (standardWeight > 0) {
      const weightLoss =
        ((standardWeight - currentWeight) / standardWeight) * 100
      total += weightLoss
    }

    return Math.round(total)
  }

  const getActivityLevel = (score: number) => {
    if (score < 150)
      return {
        level: 'Remissão',
        color: 'text-green-600',
        description: 'Doença inativa',
      }
    if (score < 220)
      return {
        level: 'Leve',
        color: 'text-yellow-600',
        description: 'Atividade leve',
      }
    if (score < 450)
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

  const requiredFields = [
    'liquidStools',
    'abdominalPain',
    'generalWellbeing',
    'hematocrit',
    'weight',
    'standardWeight',
  ]
  const isComplete = requiredFields.every(
    field => values[field] !== undefined && values[field] !== null
  )
  const score = calculateCDAI()
  const activity = getActivityLevel(score)

  const handlePrint = () => {
    window.print()
  }

  const handleReset = () => {
    setValues({})
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
              CDAI - Crohn's Disease Activity Index
            </h1>
          </div>
          <p className='text-gray-300 max-w-2xl mx-auto'>
            Índice para avaliação da atividade da Doença de Crohn baseado em
            parâmetros clínicos e laboratoriais.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Parameters */}
          <div className='lg:col-span-2 space-y-6'>
            {cdaiParameters.map((param, index) => (
              <Card key={param.id} className='bg-gray-800 border-gray-700'>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center gap-2 text-white'>
                    <span className='bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
                      {index + 1}
                    </span>
                    {param.label}
                    {param.multiplier && (
                      <span className='text-sm text-gray-400 ml-auto'>
                        × {param.multiplier}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {param.type === 'number' ? (
                    <div className='flex gap-2'>
                      <Input
                        type='number'
                        placeholder={param.placeholder}
                        value={values[param.id] || ''}
                        onChange={e =>
                          handleValueChange(param.id, e.target.value)
                        }
                        className='flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                      />
                      {param.unit && (
                        <span className='flex items-center px-3 text-gray-300 bg-gray-700 border border-gray-600 rounded-md'>
                          {param.unit}
                        </span>
                      )}
                    </div>
                  ) : (
                    <RadioGroup
                      value={values[param.id]?.toString() || ''}
                      onValueChange={value =>
                        handleValueChange(param.id, value)
                      }
                    >
                      {param.options?.map(option => (
                        <div
                          key={option.value}
                          className='flex items-center space-x-2'
                        >
                          <RadioGroupItem
                            value={option.value.toString()}
                            id={`${param.id}-${option.value}`}
                            className='border-gray-600 text-blue-400'
                          />
                          <Label
                            htmlFor={`${param.id}-${option.value}`}
                            className='flex-1 cursor-pointer text-gray-300'
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
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
                  placeholder='Ex: Medicações em uso, exames de imagem, endoscopia...'
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
                  Resultado CDAI
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isComplete ? (
                  <div className='space-y-4'>
                    <div className='text-center'>
                      <div className='text-4xl font-bold text-blue-400 mb-2'>
                        {score}
                      </div>
                      <div className='text-sm text-gray-400'>pontos</div>
                    </div>
                    <div
                      className={`text-center p-4 rounded-lg bg-gray-700 border border-gray-600`}
                    >
                      <div
                        className={`text-xl font-bold ${activity.color} mb-1`}
                      >
                        {activity.level}
                      </div>
                      <div className='text-sm text-gray-300'>
                        {activity.description}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center text-gray-400'>
                    <Calculator className='h-12 w-12 mx-auto mb-3 opacity-50' />
                    <p>Complete os campos obrigatórios para ver o resultado</p>
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
                    <span className='text-gray-300'>{'<'} 150</span>
                    <span className='text-green-400 font-medium'>Remissão</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>150-219</span>
                    <span className='text-yellow-400 font-medium'>Leve</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>220-449</span>
                    <span className='text-orange-400 font-medium'>
                      Moderada
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-300'>{'≥'} 450</span>
                    <span className='text-red-400 font-medium'>Severa</span>
                  </div>
                </div>
                <div className='mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg'>
                  <p className='text-xs text-blue-300'>
                    <strong>Nota:</strong> Valores {'<'} 150 indicam remissão
                    clínica. Redução {'≥'} 70 pontos indica resposta clínica
                    significativa.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
