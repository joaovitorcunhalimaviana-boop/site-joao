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

interface WexnerQuestion {
  id: string
  question: string
  type: 'frequency' | 'lifestyle'
}

const wexnerQuestions: WexnerQuestion[] = [
  {
    id: 'solid_stool',
    question: 'Incontinência para fezes sólidas',
    type: 'frequency',
  },
  {
    id: 'liquid_stool',
    question: 'Incontinência para fezes líquidas',
    type: 'frequency',
  },
  {
    id: 'gas',
    question: 'Incontinência para gases',
    type: 'frequency',
  },
  {
    id: 'wears_pad',
    question: 'Usa absorvente ou fralda',
    type: 'frequency',
  },
  {
    id: 'lifestyle_alteration',
    question: 'Alteração do estilo de vida',
    type: 'lifestyle',
  },
]

const frequencyOptions = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Raramente (< 1x/mês)' },
  { value: 2, label: 'Às vezes (< 1x/semana, ≥ 1x/mês)' },
  { value: 3, label: 'Geralmente (< 1x/dia, ≥ 1x/semana)' },
  { value: 4, label: 'Sempre (≥ 1x/dia)' },
]

const lifestyleOptions = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Ocasionalmente' },
  { value: 2, label: 'Algumas vezes' },
  { value: 3, label: 'A maior parte do tempo' },
  { value: 4, label: 'Sempre' },
]

const getIncontinenceGrade = (score: number) => {
  if (score === 0)
    return {
      grade: 'Perfeita continência',
      color: 'text-green-600',
      description: 'Sem episódios de incontinência',
    }
  if (score <= 9)
    return {
      grade: 'Boa continência',
      color: 'text-blue-600',
      description: 'Incontinência leve',
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
    description: 'Incontinência grave',
  }
}

export default function WexnerPage() {
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

  const isComplete = Object.keys(answers).length === wexnerQuestions.length
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
                Escore de Incontinência de Wexner
              </h1>
              <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                Escala validada para avaliação da gravidade da incontinência
                fecal baseada na frequência dos sintomas.
              </p>
            </div>

            {/* Questions */}
            <div className='space-y-6'>
              {wexnerQuestions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      {index + 1}. {question.question}
                    </CardTitle>
                    <CardDescription>
                      {question.type === 'frequency'
                        ? 'Frequência dos episódios nas últimas 4 semanas'
                        : 'Devido aos problemas intestinais, com que frequência você altera seu estilo de vida?'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[question.id]?.toString() || ''}
                      onValueChange={value =>
                        handleAnswerChange(question.id, value)
                      }
                    >
                      {(question.type === 'frequency'
                        ? frequencyOptions
                        : lifestyleOptions
                      ).map(option => (
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
                      <div className='text-sm text-gray-500'>de 20 pontos</div>
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
                          <strong>1-9 pontos:</strong> Boa continência
                          (incontinência leve)
                        </p>
                        <p>
                          <strong>10-14 pontos:</strong> Continência regular
                          (incontinência moderada)
                        </p>
                        <p>
                          <strong>15-20 pontos:</strong> Incontinência severa
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center text-gray-500'>
                    <Calculator className='h-12 w-12 mx-auto mb-3 opacity-50' />
                    <p>Complete todas as questões para ver o resultado</p>
                    <p className='text-sm mt-1'>
                      {Object.keys(answers).length} de {wexnerQuestions.length}{' '}
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
                  placeholder='Ex: Medicações em uso, cirurgias prévias, comorbidades, trauma obstétrico...'
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
                      Sobre o Escore de Wexner
                    </h4>
                    <p>
                      O Escore de Incontinência de Wexner (Cleveland Clinic
                      Florida Fecal Incontinence Score) é uma ferramenta
                      amplamente utilizada para avaliar a gravidade da
                      incontinência fecal. Foi desenvolvido para fornecer uma
                      medida objetiva e reprodutível da função esfincteriana.
                    </p>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Aplicação Clínica
                    </h4>
                    <ul className='list-disc list-inside space-y-1'>
                      <li>
                        Avaliação pré-operatória de pacientes candidatos a
                        cirurgia
                      </li>
                      <li>
                        Monitoramento da resposta ao tratamento conservador
                      </li>
                      <li>
                        Comparação de resultados entre diferentes técnicas
                        cirúrgicas
                      </li>
                      <li>Seguimento pós-operatório de longo prazo</li>
                      <li>Pesquisa clínica em incontinência fecal</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Vantagens
                    </h4>
                    <ul className='list-disc list-inside space-y-1'>
                      <li>Fácil aplicação e compreensão</li>
                      <li>Validado internacionalmente</li>
                      <li>Correlação com qualidade de vida</li>
                      <li>Sensível a mudanças clínicas</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Considerações
                    </h4>
                    <p>
                      O escore deve ser interpretado em conjunto com a avaliação
                      clínica completa, incluindo história detalhada, exame
                      físico e exames complementares quando indicados. Mudanças
                      de 5 ou mais pontos são consideradas clinicamente
                      significativas.
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
