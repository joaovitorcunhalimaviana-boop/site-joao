'use client'

import React, { useState, useMemo, useCallback, memo } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BaseCalculator, {
  CalculatorCard,
  CalculatorQuestion,
} from './base-calculator'

interface IBDQQuestion {
  id: string
  question: string
  domain: 'bowel' | 'systemic' | 'emotional' | 'social'
}

const ibdqQuestions: IBDQQuestion[] = [
  // Sintomas Intestinais (10 questões)
  {
    id: 'q1',
    question: 'Com que frequência você teve evacuações líquidas durante o dia?',
    domain: 'bowel',
  },
  {
    id: 'q2',
    question:
      'Com que frequência você teve evacuações líquidas durante a noite?',
    domain: 'bowel',
  },
  {
    id: 'q3',
    question: 'Com que frequência você teve urgência para evacuar?',
    domain: 'bowel',
  },
  {
    id: 'q4',
    question: 'Com que frequência você teve cólicas abdominais?',
    domain: 'bowel',
  },
  {
    id: 'q5',
    question: 'Com que frequência você teve sangue nas fezes?',
    domain: 'bowel',
  },
  {
    id: 'q6',
    question: 'Com que frequência você teve gases ou flatulência?',
    domain: 'bowel',
  },
  {
    id: 'q7',
    question: 'Com que frequência você se sentiu inchado?',
    domain: 'bowel',
  },
  {
    id: 'q8',
    question: 'Com que frequência você teve incontinência fecal?',
    domain: 'bowel',
  },
  {
    id: 'q9',
    question: 'Com que frequência você teve náuseas ou vômitos?',
    domain: 'bowel',
  },
  {
    id: 'q10',
    question: 'Com que frequência você teve dor abdominal?',
    domain: 'bowel',
  },

  // Sintomas Sistêmicos (5 questões)
  {
    id: 'q11',
    question: 'Com que frequência você se sentiu cansado ou fatigado?',
    domain: 'systemic',
  },
  {
    id: 'q12',
    question: 'Com que frequência você teve problemas para dormir?',
    domain: 'systemic',
  },
  {
    id: 'q13',
    question: 'Com que frequência você se sentiu sem energia?',
    domain: 'systemic',
  },
  {
    id: 'q14',
    question: 'Com que frequência você teve febre?',
    domain: 'systemic',
  },
  {
    id: 'q15',
    question: 'Com que frequência você perdeu peso?',
    domain: 'systemic',
  },

  // Função Emocional (12 questões)
  {
    id: 'q16',
    question: 'Com que frequência você se sentiu irritado ou com raiva?',
    domain: 'emotional',
  },
  {
    id: 'q17',
    question: 'Com que frequência você se sentiu deprimido ou desanimado?',
    domain: 'emotional',
  },
  {
    id: 'q18',
    question: 'Com que frequência você se preocupou em ter câncer?',
    domain: 'emotional',
  },
  {
    id: 'q19',
    question: 'Com que frequência você se sentiu relaxado e livre de tensão?',
    domain: 'emotional',
  },
  {
    id: 'q20',
    question: 'Com que frequência você se preocupou em precisar de cirurgia?',
    domain: 'emotional',
  },
  {
    id: 'q21',
    question: 'Com que frequência você se sentiu bem consigo mesmo?',
    domain: 'emotional',
  },
  {
    id: 'q22',
    question: 'Com que frequência você se preocupou com sua aparência?',
    domain: 'emotional',
  },
  {
    id: 'q23',
    question: 'Com que frequência você se sentiu confiante e no controle?',
    domain: 'emotional',
  },
  {
    id: 'q24',
    question:
      'Com que frequência você se preocupou em ser um fardo para outros?',
    domain: 'emotional',
  },
  {
    id: 'q25',
    question:
      'Com que frequência você se sentiu envergonhado por sua condição?',
    domain: 'emotional',
  },
  {
    id: 'q26',
    question: 'Com que frequência você se sentiu atraente?',
    domain: 'emotional',
  },
  {
    id: 'q27',
    question: 'Com que frequência você se sentiu otimista sobre o futuro?',
    domain: 'emotional',
  },

  // Função Social (5 questões)
  {
    id: 'q28',
    question: 'Com que frequência você teve que cancelar compromissos sociais?',
    domain: 'social',
  },
  {
    id: 'q29',
    question: 'Com que frequência você evitou sair de casa?',
    domain: 'social',
  },
  {
    id: 'q30',
    question: 'Com que frequência você teve dificuldades no trabalho/escola?',
    domain: 'social',
  },
  {
    id: 'q31',
    question: 'Com que frequência você teve que ficar perto de um banheiro?',
    domain: 'social',
  },
  {
    id: 'q32',
    question: 'Com que frequência você teve dificuldades para viajar?',
    domain: 'social',
  },
]

const responseOptions = [
  { value: 1, label: '1 - Todo o tempo' },
  { value: 2, label: '2 - Na maior parte do tempo' },
  { value: 3, label: '3 - Uma boa parte do tempo' },
  { value: 4, label: '4 - Algumas vezes' },
  { value: 5, label: '5 - Poucas vezes' },
  { value: 6, label: '6 - Quase nunca' },
  { value: 7, label: '7 - Nunca' },
]

interface IBDQCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

const IBDQCalculator = memo(function IBDQCalculator({
  onSaveResult,
  darkMode = true,
}: IBDQCalculatorProps) {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [currentPage, setCurrentPage] = useState(0)
  const questionsPerPage = 5

  const totalPages = useMemo(() => Math.ceil(ibdqQuestions.length / questionsPerPage), [questionsPerPage])

  const handleAnswerChange = useCallback((questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }, [])

  const calculateDomainScore = useCallback((domain: string) => {
    const domainQuestions = ibdqQuestions.filter(q => q.domain === domain)
    const domainAnswers = domainQuestions.map(q => answers[q.id] || 0)
    const sum = domainAnswers.reduce((acc, val) => acc + val, 0)
    return domainAnswers.length > 0 ? sum : 0
  }, [answers])

  const calculateTotalScore = useMemo(() => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0)
  }, [answers])

  const getQualityOfLife = useCallback((score: number) => {
    if (score >= 170)
      return {
        level: 'Excelente',
        color: 'text-green-400',
        description: 'Qualidade de vida excelente',
      }
    if (score >= 140)
      return {
        level: 'Boa',
        color: 'text-blue-400',
        description: 'Boa qualidade de vida',
      }
    if (score >= 110)
      return {
        level: 'Regular',
        color: 'text-yellow-400',
        description: 'Qualidade de vida regular',
      }
    if (score >= 80)
      return {
        level: 'Ruim',
        color: 'text-orange-400',
        description: 'Qualidade de vida comprometida',
      }
    return {
      level: 'Muito Ruim',
      color: 'text-red-400',
      description: 'Qualidade de vida muito comprometida',
    }
  }, [])

  const handleReset = useCallback(() => {
    setAnswers({})
    setCurrentPage(0)
  }, [])

  const isComplete = useMemo(() => Object.keys(answers).length === ibdqQuestions.length, [answers])
  const totalScore = calculateTotalScore
  const qualityOfLife = useMemo(() => getQualityOfLife(totalScore), [getQualityOfLife, totalScore])
  const currentQuestions = useMemo(() => ibdqQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  ), [currentPage, questionsPerPage])

  const bowelScore = useMemo(() => calculateDomainScore('bowel'), [calculateDomainScore])
  const systemicScore = useMemo(() => calculateDomainScore('systemic'), [calculateDomainScore])
  const emotionalScore = useMemo(() => calculateDomainScore('emotional'), [calculateDomainScore])
  const socialScore = useMemo(() => calculateDomainScore('social'), [calculateDomainScore])

  const calculatorData = useMemo(() => ({
    calculatorName: 'IBDQ (Qualidade de Vida na DII)',
    calculatorType: 'IBDQ',
    type: 'IBDQ',
    totalScore,
    qualityOfLife: qualityOfLife.level,
    result: {
      totalScore,
      qualityOfLife: qualityOfLife.level,
      interpretation: qualityOfLife.description,
    },
    interpretation: qualityOfLife.description,
    domainScores: {
      bowel: bowelScore,
      systemic: systemicScore,
      emotional: emotionalScore,
      social: socialScore,
    },
    answers,
    timestamp: new Date().toISOString(),
  }), [totalScore, qualityOfLife, bowelScore, systemicScore, emotionalScore, socialScore, answers])

  const resultComponent = useMemo(() => isComplete ? (
    <div className='space-y-4'>
      <CalculatorCard title='Resultado IBDQ'>
        <div className='space-y-4'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-white mb-2'>
              {totalScore}/224
            </div>
            <div className={`text-lg font-semibold ${qualityOfLife.color}`}>
              {qualityOfLife.level}
            </div>
            <p className='text-gray-300 text-sm mt-1'>
              {qualityOfLife.description}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-3'>
              <h4 className='text-blue-400 font-medium mb-1'>
                Sintomas Intestinais
              </h4>
              <div className='text-white font-semibold'>{bowelScore}/70</div>
            </div>
            <div className='bg-purple-900/20 border border-purple-700 rounded-lg p-3'>
              <h4 className='text-purple-400 font-medium mb-1'>
                Sintomas Sistêmicos
              </h4>
              <div className='text-white font-semibold'>{systemicScore}/35</div>
            </div>
            <div className='bg-green-900/20 border border-green-700 rounded-lg p-3'>
              <h4 className='text-green-400 font-medium mb-1'>
                Função Emocional
              </h4>
              <div className='text-white font-semibold'>
                {emotionalScore}/84
              </div>
            </div>
            <div className='bg-orange-900/20 border border-orange-700 rounded-lg p-3'>
              <h4 className='text-orange-400 font-medium mb-1'>
                Função Social
              </h4>
              <div className='text-white font-semibold'>{socialScore}/35</div>
            </div>
          </div>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Interpretação'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <h3 className='text-blue-400 font-medium mb-2'>
            IBDQ - Questionário de Qualidade de Vida
          </h3>
          <p className='text-gray-300 text-sm mb-3'>
            O IBDQ avalia o impacto da doença inflamatória intestinal na
            qualidade de vida do paciente.
          </p>
          <div className='text-sm text-gray-300 space-y-1'>
            <p>
              <strong>Pontuação:</strong> 32-224 pontos (maior pontuação =
              melhor qualidade de vida)
            </p>
            <p>
              <strong>Domínios:</strong> Intestinal, Sistêmico, Emocional e
              Social
            </p>
            <p>
              <strong>Aplicação:</strong> Doença de Crohn e Colite Ulcerativa
            </p>
          </div>
        </div>
      </CalculatorCard>
    </div>
  ) : null, [isComplete, totalScore, qualityOfLife, bowelScore, systemicScore, emotionalScore, socialScore])

  return (
    <BaseCalculator
      title='IBDQ - Questionário de Qualidade de Vida'
      description='Avaliação da qualidade de vida em pacientes com doença inflamatória intestinal'
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-6'>
        <div className='bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-white font-medium'>
              Página {currentPage + 1} de {totalPages}
            </h3>
            <div className='text-sm text-gray-300'>
              {Object.keys(answers).length} de {ibdqQuestions.length} questões
            </div>
          </div>

          <div className='w-full bg-gray-700 rounded-full h-2 mb-4'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{
                width: `${(Object.keys(answers).length / ibdqQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className='space-y-4'>
          {currentQuestions.map(question => (
            <CalculatorCard key={question.id} title={question.question}>
              <CalculatorQuestion question='' required>
                <RadioGroup
                  value={answers[question.id]?.toString() || ''}
                  onValueChange={value =>
                    handleAnswerChange(question.id, parseInt(value))
                  }
                  className='space-y-2'
                >
                  {responseOptions.map(option => (
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

        <div className='flex justify-between'>
          <Button
            variant='outline'
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className='flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
          >
            <ChevronLeft className='h-4 w-4' />
            Anterior
          </Button>

          <Button
            variant='outline'
            onClick={() =>
              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
            }
            disabled={currentPage === totalPages - 1}
            className='flex items-center gap-2 bg-gray-800 border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
          >
            Próxima
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </BaseCalculator>
  )
})

export default IBDQCalculator
