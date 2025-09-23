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

interface IBDQQuestion {
  id: string
  question: string
  domain: string
}

const ibdqQuestions: IBDQQuestion[] = [
  {
    id: '1',
    question:
      'Com que frequência você teve que adiar ou cancelar um compromisso social devido aos seus problemas intestinais?',
    domain: 'social',
  },
  {
    id: '2',
    question:
      'Com que frequência você teve dificuldade em fazer planos para o futuro devido aos seus problemas intestinais?',
    domain: 'social',
  },
  {
    id: '3',
    question:
      'Com que frequência você se sentiu deprimido ou desencorajado devido aos seus problemas intestinais?',
    domain: 'emocional',
  },
  {
    id: '4',
    question:
      'Com que frequência você se sentiu irritado devido aos seus problemas intestinais?',
    domain: 'emocional',
  },
  {
    id: '5',
    question: 'Com que frequência você se sentiu relaxado e livre de tensão?',
    domain: 'emocional',
  },
  {
    id: '6',
    question:
      'Com que frequência você teve problemas em dormir devido aos seus problemas intestinais?',
    domain: 'sistêmico',
  },
  {
    id: '7',
    question:
      'Com que frequência você se sentiu cansado ou fatigado devido aos seus problemas intestinais?',
    domain: 'sistêmico',
  },
  {
    id: '8',
    question:
      'Com que frequência você teve que evitar situações onde não havia banheiro por perto?',
    domain: 'social',
  },
  {
    id: '9',
    question: 'Com que frequência você teve dificuldade em manter seu peso?',
    domain: 'sistêmico',
  },
  {
    id: '10',
    question:
      'Com que frequência você se sentiu com raiva devido aos seus problemas intestinais?',
    domain: 'emocional',
  },
  {
    id: '11',
    question: 'Com que frequência você teve cólicas abdominais?',
    domain: 'intestinal',
  },
  {
    id: '12',
    question:
      'Com que frequência você se sentiu satisfeito ou feliz com sua vida pessoal?',
    domain: 'emocional',
  },
  {
    id: '13',
    question: 'Com que frequência você teve fezes soltas?',
    domain: 'intestinal',
  },
  {
    id: '14',
    question: 'Com que frequência você se sentiu preocupado em ter câncer?',
    domain: 'emocional',
  },
  {
    id: '15',
    question: 'Com que frequência você teve flatulência (gases)?',
    domain: 'intestinal',
  },
  {
    id: '16',
    question:
      'Com que frequência você se sentiu incapaz de lidar com situações?',
    domain: 'emocional',
  },
  {
    id: '17',
    question:
      'Com que frequência você teve que evitar beber líquidos para reduzir os movimentos intestinais?',
    domain: 'social',
  },
  {
    id: '18',
    question: 'Com que frequência você teve dor abdominal?',
    domain: 'intestinal',
  },
  {
    id: '19',
    question: 'Com que frequência você teve problemas com vazamentos de fezes?',
    domain: 'intestinal',
  },
  {
    id: '20',
    question: 'Com que frequência você se sentiu bem?',
    domain: 'sistêmico',
  },
  {
    id: '21',
    question:
      'Com que frequência você teve movimentos intestinais frequentes durante o dia?',
    domain: 'intestinal',
  },
  {
    id: '22',
    question:
      'Com que frequência você se sentiu preocupado em não encontrar um banheiro?',
    domain: 'social',
  },
  {
    id: '23',
    question: 'Com que frequência você teve náusea?',
    domain: 'sistêmico',
  },
  {
    id: '24',
    question:
      'Com que frequência outras pessoas ficaram incomodadas pelos seus problemas intestinais?',
    domain: 'social',
  },
  {
    id: '25',
    question:
      'Com que frequência você se sentiu envergonhado devido aos seus problemas intestinais?',
    domain: 'emocional',
  },
  {
    id: '26',
    question:
      'Com que frequência você teve que evitar comer para reduzir os movimentos intestinais?',
    domain: 'social',
  },
  {
    id: '27',
    question:
      'Com que frequência você se sentiu incapaz de sair de casa devido aos seus problemas intestinais?',
    domain: 'social',
  },
  {
    id: '28',
    question:
      'Com que frequência você se sentiu com falta de compreensão de outras pessoas?',
    domain: 'social',
  },
  {
    id: '29',
    question: 'Com que frequência você teve urgência para evacuar?',
    domain: 'intestinal',
  },
  {
    id: '30',
    question: 'Com que frequência você se sentiu fisicamente fraco?',
    domain: 'sistêmico',
  },
  {
    id: '31',
    question:
      'Com que frequência você teve menos prazer ou satisfação em comer?',
    domain: 'social',
  },
  {
    id: '32',
    question: 'Com que frequência você teve que fazer esforço para evacuar?',
    domain: 'intestinal',
  },
]

const responseOptions = [
  { value: 1, label: 'Todo o tempo' },
  { value: 2, label: 'Na maior parte do tempo' },
  { value: 3, label: 'Uma boa parte do tempo' },
  { value: 4, label: 'Algumas vezes' },
  { value: 5, label: 'Poucas vezes' },
  { value: 6, label: 'Quase nunca' },
  { value: 7, label: 'Nunca' },
]

const positiveQuestions = ['5', '12', '20']

export default function IBDQPage() {
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
    let totalScore = 0

    Object.entries(answers).forEach(([questionId, score]) => {
      if (positiveQuestions.includes(questionId)) {
        totalScore += 8 - score
      } else {
        totalScore += score
      }
    })

    return totalScore
  }

  const getQualityLevel = (score: number) => {
    if (score >= 168)
      return {
        level: 'Excelente',
        color: 'text-green-600',
        description: 'Qualidade de vida muito boa',
      }
    if (score >= 140)
      return {
        level: 'Boa',
        color: 'text-blue-600',
        description: 'Qualidade de vida boa',
      }
    if (score >= 112)
      return {
        level: 'Regular',
        color: 'text-yellow-600',
        description: 'Qualidade de vida moderada',
      }
    if (score >= 84)
      return {
        level: 'Ruim',
        color: 'text-orange-600',
        description: 'Qualidade de vida comprometida',
      }
    return {
      level: 'Muito Ruim',
      color: 'text-red-600',
      description: 'Qualidade de vida muito comprometida',
    }
  }

  const isComplete = Object.keys(answers).length === ibdqQuestions.length
  const totalScore = calculateScore()
  const qualityLevel = getQualityLevel(totalScore)

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
                IBDQ - Questionário de Qualidade de Vida
              </h1>
              <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                Inflammatory Bowel Disease Questionnaire - Avalia o impacto da
                doença inflamatória intestinal na qualidade de vida.
              </p>
            </div>

            <div className='space-y-6'>
              {ibdqQuestions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      {index + 1}. {question.question}
                    </CardTitle>
                    <CardDescription>
                      Domínio: {question.domain} • Nas últimas 2 semanas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[question.id]?.toString() || ''}
                      onValueChange={value =>
                        handleAnswerChange(question.id, value)
                      }
                    >
                      {responseOptions.map(option => (
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
                      <div className='text-sm text-gray-500'>de 224 pontos</div>
                    </div>
                    <div className={`text-center p-4 rounded-lg bg-gray-50`}>
                      <div
                        className={`text-xl font-bold ${qualityLevel.color} mb-1`}
                      >
                        {qualityLevel.level}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {qualityLevel.description}
                      </div>
                    </div>
                    <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
                      <h4 className='font-semibold text-blue-900 mb-2'>
                        Interpretação
                      </h4>
                      <div className='text-sm text-blue-800 space-y-1'>
                        <p>
                          <strong>168-224 pontos:</strong> Excelente qualidade
                          de vida
                        </p>
                        <p>
                          <strong>140-167 pontos:</strong> Boa qualidade de vida
                        </p>
                        <p>
                          <strong>112-139 pontos:</strong> Qualidade de vida
                          regular
                        </p>
                        <p>
                          <strong>84-111 pontos:</strong> Qualidade de vida ruim
                        </p>
                        <p>
                          <strong>32-83 pontos:</strong> Qualidade de vida muito
                          ruim
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center text-gray-500'>
                    <Calculator className='h-12 w-12 mx-auto mb-3 opacity-50' />
                    <p>Complete todas as questões para ver o resultado</p>
                    <p className='text-sm mt-1'>
                      {Object.keys(answers).length} de {ibdqQuestions.length}{' '}
                      questões respondidas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className='mt-6'>
              <CardHeader>
                <CardTitle>Observações Clínicas</CardTitle>
                <CardDescription>
                  Adicione informações relevantes sobre o paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder='Ex: Tipo de DII, medicações em uso, atividade da doença...'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className='min-h-[100px]'
                />
              </CardContent>
            </Card>

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
                      Sobre o IBDQ
                    </h4>
                    <p>
                      O IBDQ é um questionário específico para avaliar a
                      qualidade de vida relacionada à saúde em pacientes com
                      doença inflamatória intestinal (DII), incluindo doença de
                      Crohn e retocolite ulcerativa.
                    </p>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Domínios Avaliados
                    </h4>
                    <ul className='list-disc list-inside space-y-1'>
                      <li>
                        <strong>Sintomas Intestinais:</strong> Dor, urgência,
                        frequência evacuatória
                      </li>
                      <li>
                        <strong>Sintomas Sistêmicos:</strong> Fadiga, sono,
                        bem-estar geral
                      </li>
                      <li>
                        <strong>Aspectos Emocionais:</strong> Humor, ansiedade,
                        preocupações
                      </li>
                      <li>
                        <strong>Aspectos Sociais:</strong> Trabalho,
                        relacionamentos, atividades
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Aplicação Clínica
                    </h4>
                    <p>
                      Útil para monitorar a resposta ao tratamento, comparar
                      diferentes terapias e avaliar o impacto da doença na vida
                      do paciente de forma padronizada.
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
