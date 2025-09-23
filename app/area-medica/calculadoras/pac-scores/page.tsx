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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Calculator, FileText, RotateCcw } from 'lucide-react'

interface PACQuestion {
  id: string
  question: string
  domain?: string
}

const pacSymQuestions: PACQuestion[] = [
  {
    id: 'abdominal_discomfort',
    question: 'Desconforto abdominal',
    domain: 'Desconforto Abdominal',
  },
  {
    id: 'abdominal_pain',
    question: 'Dor abdominal',
    domain: 'Desconforto Abdominal',
  },
  {
    id: 'abdominal_bloating',
    question: 'Distensão abdominal',
    domain: 'Desconforto Abdominal',
  },
  {
    id: 'stomach_cramps',
    question: 'Cólicas no estômago',
    domain: 'Desconforto Abdominal',
  },
  {
    id: 'rectal_burning',
    question: 'Queimação retal durante ou após evacuação',
    domain: 'Sintomas Retais',
  },
  {
    id: 'rectal_bleeding',
    question: 'Sangramento retal ou anal durante ou após evacuação',
    domain: 'Sintomas Retais',
  },
  {
    id: 'rectal_tearing',
    question: 'Sensação de rasgadura retal ou anal durante ou após evacuação',
    domain: 'Sintomas Retais',
  },
  {
    id: 'incomplete_evacuation',
    question: 'Sensação de evacuação incompleta',
    domain: 'Sintomas de Evacuação',
  },
  {
    id: 'straining',
    question: 'Esforço excessivo durante evacuação',
    domain: 'Sintomas de Evacuação',
  },
  {
    id: 'stool_consistency',
    question: 'Fezes duras ou em pedaços',
    domain: 'Características das Fezes',
  },
  {
    id: 'stool_frequency',
    question: 'Menos de 3 evacuações por semana',
    domain: 'Frequência de Evacuação',
  },
  {
    id: 'bowel_movement_time',
    question: 'Tempo prolongado no banheiro',
    domain: 'Sintomas de Evacuação',
  },
]

const pacQolQuestions: PACQuestion[] = [
  {
    id: 'worry_constipation',
    question: 'Preocupação com constipação',
    domain: 'Preocupações',
  },
  {
    id: 'worry_not_knowing_when',
    question: 'Preocupação em não saber quando conseguirá evacuar',
    domain: 'Preocupações',
  },
  {
    id: 'worry_not_finding_bathroom',
    question: 'Preocupação em não encontrar banheiro quando necessário',
    domain: 'Preocupações',
  },
  {
    id: 'embarrassment',
    question: 'Constrangimento por causa da constipação',
    domain: 'Impacto Social',
  },
  {
    id: 'obsession_bowel_movements',
    question: 'Obsessão com evacuações',
    domain: 'Impacto Psicológico',
  },
  {
    id: 'difficulty_planning',
    question: 'Dificuldade para planejar atividades sociais',
    domain: 'Impacto Social',
  },
  {
    id: 'less_likely_to_go_out',
    question: 'Menor probabilidade de sair de casa',
    domain: 'Impacto Social',
  },
  {
    id: 'irritability',
    question: 'Irritabilidade devido à constipação',
    domain: 'Impacto Psicológico',
  },
  {
    id: 'decreased_appetite',
    question: 'Diminuição do apetite',
    domain: 'Impacto Físico',
  },
  {
    id: 'anxiety_bowel_movements',
    question: 'Ansiedade sobre evacuações',
    domain: 'Impacto Psicológico',
  },
  {
    id: 'tired_all_the_time',
    question: 'Sensação de cansaço constante',
    domain: 'Impacto Físico',
  },
  {
    id: 'less_active',
    question: 'Menor atividade física',
    domain: 'Impacto Físico',
  },
  { id: 'avoid_travel', question: 'Evitar viagens', domain: 'Impacto Social' },
  {
    id: 'take_laxatives',
    question: 'Necessidade de usar laxantes',
    domain: 'Tratamento',
  },
  {
    id: 'control_over_life',
    question: 'Sensação de falta de controle sobre a vida',
    domain: 'Impacto Psicológico',
  },
  {
    id: 'accidents',
    question: 'Preocupação com acidentes (escape fecal)',
    domain: 'Preocupações',
  },
  {
    id: 'productivity',
    question: 'Diminuição da produtividade',
    domain: 'Impacto no Trabalho',
  },
  {
    id: 'concentration',
    question: 'Dificuldade de concentração',
    domain: 'Impacto Cognitivo',
  },
  {
    id: 'avoid_wearing_clothes',
    question: 'Evitar usar certas roupas',
    domain: 'Impacto na Aparência',
  },
  {
    id: 'body_image',
    question: 'Preocupação com a imagem corporal',
    domain: 'Impacto na Aparência',
  },
  {
    id: 'sexual_activity',
    question: 'Impacto na atividade sexual',
    domain: 'Impacto Sexual',
  },
  {
    id: 'enjoy_life_less',
    question: 'Menor prazer na vida',
    domain: 'Qualidade de Vida Geral',
  },
  {
    id: 'stress_relationships',
    question: 'Estresse nos relacionamentos',
    domain: 'Impacto nos Relacionamentos',
  },
  {
    id: 'discuss_constipation',
    question: 'Desconforto para discutir constipação',
    domain: 'Impacto Social',
  },
  {
    id: 'feel_depressed',
    question: 'Sentimentos depressivos',
    domain: 'Impacto Psicológico',
  },
  {
    id: 'eating_habits',
    question: 'Mudança nos hábitos alimentares',
    domain: 'Impacto Alimentar',
  },
  {
    id: 'sleep_disturbance',
    question: 'Distúrbios do sono',
    domain: 'Impacto no Sono',
  },
  {
    id: 'feel_feminine_masculine',
    question: 'Impacto na sensação de feminilidade/masculinidade',
    domain: 'Impacto na Identidade',
  },
]

const responseOptions = [
  { value: 0, label: 'Ausente' },
  { value: 1, label: 'Leve' },
  { value: 2, label: 'Moderado' },
  { value: 3, label: 'Grave' },
  { value: 4, label: 'Muito Grave' },
]

const qolResponseOptions = [
  { value: 0, label: 'Nenhum pouco' },
  { value: 1, label: 'Um pouco' },
  { value: 2, label: 'Moderadamente' },
  { value: 3, label: 'Bastante' },
  { value: 4, label: 'Extremamente' },
]

export default function PACScoresPage() {
  const router = useRouter()
  const [symAnswers, setSymAnswers] = useState<Record<string, number>>({})
  const [qolAnswers, setQolAnswers] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')
  const [activeTab, setActiveTab] = useState('pac-sym')

  const handleSymAnswerChange = (questionId: string, value: string) => {
    setSymAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value),
    }))
  }

  const handleQolAnswerChange = (questionId: string, value: string) => {
    setQolAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value),
    }))
  }

  const calculateSymScore = () => {
    return Object.values(symAnswers).reduce((sum, score) => sum + score, 0)
  }

  const calculateQolScore = () => {
    return Object.values(qolAnswers).reduce((sum, score) => sum + score, 0)
  }

  const getSymSeverity = (score: number) => {
    if (score === 0) return { level: 'Sem sintomas', color: 'text-green-600' }
    if (score <= 12) return { level: 'Leve', color: 'text-yellow-600' }
    if (score <= 24) return { level: 'Moderado', color: 'text-orange-600' }
    return { level: 'Grave', color: 'text-red-600' }
  }

  const getQolImpact = (score: number) => {
    if (score === 0) return { level: 'Sem impacto', color: 'text-green-600' }
    if (score <= 28) return { level: 'Impacto leve', color: 'text-yellow-600' }
    if (score <= 56)
      return { level: 'Impacto moderado', color: 'text-orange-600' }
    return { level: 'Impacto grave', color: 'text-red-600' }
  }

  const symScore = calculateSymScore()
  const qolScore = calculateQolScore()
  const symComplete = Object.keys(symAnswers).length === pacSymQuestions.length
  const qolComplete = Object.keys(qolAnswers).length === pacQolQuestions.length

  const resetForm = () => {
    setSymAnswers({})
    setQolAnswers({})
    setNotes('')
    setActiveTab('pac-sym')
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
                Escalas PAC-SYM e PAC-QOL
              </h1>
              <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                Avaliação de sintomas e qualidade de vida relacionados à
                constipação funcional.
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='pac-sym'>PAC-SYM (Sintomas)</TabsTrigger>
                <TabsTrigger value='pac-qol'>
                  PAC-QOL (Qualidade de Vida)
                </TabsTrigger>
              </TabsList>

              <TabsContent value='pac-sym' className='space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>PAC-SYM - Escala de Sintomas</CardTitle>
                    <CardDescription>
                      Avalie a intensidade dos sintomas nas últimas 2 semanas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-6'>
                      {pacSymQuestions.map((question, index) => (
                        <Card key={question.id} className=''>
                          <CardHeader>
                            <CardTitle className='text-lg'>
                              {index + 1}. {question.question}
                            </CardTitle>
                            {question.domain && (
                              <CardDescription>
                                Domínio: {question.domain}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <RadioGroup
                              value={symAnswers[question.id]?.toString() || ''}
                              onValueChange={value =>
                                handleSymAnswerChange(question.id, value)
                              }
                            >
                              {responseOptions.map(option => (
                                <div
                                  key={option.value}
                                  className='flex items-center space-x-2'
                                >
                                  <RadioGroupItem
                                    value={option.value.toString()}
                                    id={`sym-${question.id}-${option.value}`}
                                  />
                                  <Label
                                    htmlFor={`sym-${question.id}-${option.value}`}
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
                  </CardContent>
                </Card>

                {/* PAC-SYM Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Calculator className='h-5 w-5' />
                      Resultado PAC-SYM
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {symComplete ? (
                      <div className='space-y-4'>
                        <div className='text-center'>
                          <div className='text-4xl font-bold text-blue-600 mb-2'>
                            {symScore}
                          </div>
                          <div className='text-sm text-gray-500'>
                            de 48 pontos
                          </div>
                        </div>
                        <div
                          className={`text-center p-4 rounded-lg bg-gray-50`}
                        >
                          <div
                            className={`text-xl font-bold ${getSymSeverity(symScore).color} mb-1`}
                          >
                            {getSymSeverity(symScore).level}
                          </div>
                          <div className='text-sm text-gray-600'>
                            {Math.round((symScore / 48) * 100)}% da pontuação
                            máxima
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className='text-center text-gray-500'>
                        <Calculator className='h-12 w-12 mx-auto mb-3 opacity-50' />
                        <p>Complete todas as questões para ver o resultado</p>
                        <p className='text-sm mt-1'>
                          {Object.keys(symAnswers).length} de{' '}
                          {pacSymQuestions.length} questões respondidas
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='pac-qol' className='space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>PAC-QOL - Escala de Qualidade de Vida</CardTitle>
                    <CardDescription>
                      Avalie o impacto da constipação na sua qualidade de vida
                      nas últimas 2 semanas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-6'>
                      {pacQolQuestions.map((question, index) => (
                        <Card key={question.id} className=''>
                          <CardHeader>
                            <CardTitle className='text-lg'>
                              {index + 1}. {question.question}
                            </CardTitle>
                            {question.domain && (
                              <CardDescription>
                                Domínio: {question.domain}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <RadioGroup
                              value={qolAnswers[question.id]?.toString() || ''}
                              onValueChange={value =>
                                handleQolAnswerChange(question.id, value)
                              }
                            >
                              {qolResponseOptions.map(option => (
                                <div
                                  key={option.value}
                                  className='flex items-center space-x-2'
                                >
                                  <RadioGroupItem
                                    value={option.value.toString()}
                                    id={`qol-${question.id}-${option.value}`}
                                  />
                                  <Label
                                    htmlFor={`qol-${question.id}-${option.value}`}
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
                  </CardContent>
                </Card>

                {/* PAC-QOL Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Calculator className='h-5 w-5' />
                      Resultado PAC-QOL
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {qolComplete ? (
                      <div className='space-y-4'>
                        <div className='text-center'>
                          <div className='text-4xl font-bold text-blue-600 mb-2'>
                            {qolScore}
                          </div>
                          <div className='text-sm text-gray-500'>
                            de 112 pontos
                          </div>
                        </div>
                        <div
                          className={`text-center p-4 rounded-lg bg-gray-50`}
                        >
                          <div
                            className={`text-xl font-bold ${getQolImpact(qolScore).color} mb-1`}
                          >
                            {getQolImpact(qolScore).level}
                          </div>
                          <div className='text-sm text-gray-600'>
                            {Math.round((qolScore / 112) * 100)}% da pontuação
                            máxima
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className='text-center text-gray-500'>
                        <Calculator className='h-12 w-12 mx-auto mb-3 opacity-50' />
                        <p>Complete todas as questões para ver o resultado</p>
                        <p className='text-sm mt-1'>
                          {Object.keys(qolAnswers).length} de{' '}
                          {pacQolQuestions.length} questões respondidas
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

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
                  placeholder='Ex: Medicações em uso, comorbidades, fatores que podem influenciar os sintomas...'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className='min-h-[100px]'
                />
              </CardContent>
            </Card>

            {/* Combined Results */}
            {(symComplete || qolComplete) && (
              <Card className='mt-6'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <FileText className='h-5 w-5' />
                    Resumo dos Resultados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {symComplete && (
                      <div className='p-4 bg-blue-50 rounded-lg'>
                        <h3 className='font-semibold text-blue-900 mb-2'>
                          PAC-SYM (Sintomas)
                        </h3>
                        <div className='text-2xl font-bold text-blue-600 mb-1'>
                          {symScore}/48
                        </div>
                        <div
                          className={`font-medium ${getSymSeverity(symScore).color}`}
                        >
                          {getSymSeverity(symScore).level}
                        </div>
                      </div>
                    )}
                    {qolComplete && (
                      <div className='p-4 bg-green-50 rounded-lg'>
                        <h3 className='font-semibold text-green-900 mb-2'>
                          PAC-QOL (Qualidade de Vida)
                        </h3>
                        <div className='text-2xl font-bold text-green-600 mb-1'>
                          {qolScore}/112
                        </div>
                        <div
                          className={`font-medium ${getQolImpact(qolScore).color}`}
                        >
                          {getQolImpact(qolScore).level}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                    <p className='text-xs text-gray-700'>
                      <strong>Interpretação:</strong> Pontuações mais altas
                      indicam maior gravidade dos sintomas (PAC-SYM) e maior
                      impacto na qualidade de vida (PAC-QOL). Estas escalas são
                      úteis para monitoramento da resposta ao tratamento.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
