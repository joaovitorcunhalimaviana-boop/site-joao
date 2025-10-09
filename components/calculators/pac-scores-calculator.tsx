'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BaseCalculator, {
  CalculatorCard,
  CalculatorQuestion,
  CalculatorResult,
} from './base-calculator'

interface PACAnswers {
  [key: string]: number
}

const pacSymQuestions = [
  {
    id: 'abdominal_discomfort',
    question: 'Desconforto abdominal',
    domain: 'abdominal',
  },
  { id: 'abdominal_pain', question: 'Dor abdominal', domain: 'abdominal' },
  { id: 'bloating', question: 'Distensão abdominal', domain: 'abdominal' },
  { id: 'stomach_cramps', question: 'Cólicas estomacais', domain: 'abdominal' },
  {
    id: 'painful_bowel_movements',
    question: 'Evacuações dolorosas',
    domain: 'rectal',
  },
  {
    id: 'rectal_burning',
    question: 'Queimação retal durante evacuação',
    domain: 'rectal',
  },
  {
    id: 'incomplete_bowel_movements',
    question: 'Sensação de evacuação incompleta',
    domain: 'rectal',
  },
  { id: 'straining', question: 'Esforço para evacuar', domain: 'stool' },
  {
    id: 'bowel_movement_frequency',
    question: 'Frequência das evacuações',
    domain: 'stool',
  },
  { id: 'hard_stool', question: 'Fezes endurecidas', domain: 'stool' },
  { id: 'small_stool', question: 'Fezes pequenas', domain: 'stool' },
  {
    id: 'bright_red_blood',
    question: 'Sangue vermelho vivo nas fezes',
    domain: 'stool',
  },
]

const pacQolQuestions = [
  {
    id: 'physical_discomfort',
    question: 'Desconforto físico',
    domain: 'physical',
  },
  {
    id: 'eating_less',
    question: 'Comer menos do que o normal',
    domain: 'physical',
  },
  { id: 'food_enjoyment', question: 'Prazer em comer', domain: 'physical' },
  {
    id: 'daily_activities',
    question: 'Atividades diárias',
    domain: 'physical',
  },
  {
    id: 'worry_symptoms',
    question: 'Preocupação com os sintomas',
    domain: 'psychosocial',
  },
  {
    id: 'worry_not_finding_bathroom',
    question: 'Preocupação em não encontrar banheiro',
    domain: 'psychosocial',
  },
  {
    id: 'embarrassment',
    question: 'Constrangimento pelos sintomas',
    domain: 'psychosocial',
  },
  {
    id: 'irritability',
    question: 'Irritabilidade devido aos sintomas',
    domain: 'psychosocial',
  },
  {
    id: 'unproductive',
    question: 'Sentir-se improdutivo',
    domain: 'psychosocial',
  },
  {
    id: 'obsessed_bowel_movements',
    question: 'Obsessão com evacuações',
    domain: 'psychosocial',
  },
  {
    id: 'control_over_life',
    question: 'Controle sobre a vida',
    domain: 'psychosocial',
  },
  {
    id: 'energy_concentration',
    question: 'Energia e concentração',
    domain: 'psychosocial',
  },
  {
    id: 'avoid_public_places',
    question: 'Evitar lugares públicos',
    domain: 'worries',
  },
  {
    id: 'avoid_situations_no_bathroom',
    question: 'Evitar situações sem banheiro próximo',
    domain: 'worries',
  },
  {
    id: 'avoid_wearing_tight_clothes',
    question: 'Evitar roupas apertadas',
    domain: 'worries',
  },
  {
    id: 'avoid_physical_activity',
    question: 'Evitar atividade física',
    domain: 'worries',
  },
  {
    id: 'plan_activities_around_bowels',
    question: 'Planejar atividades em torno das evacuações',
    domain: 'worries',
  },
  { id: 'avoid_traveling', question: 'Evitar viajar', domain: 'worries' },
  {
    id: 'avoid_going_out_evening',
    question: 'Evitar sair à noite',
    domain: 'worries',
  },
  {
    id: 'avoid_going_out_without_medication',
    question: 'Evitar sair sem medicação',
    domain: 'worries',
  },
  {
    id: 'avoid_eating_before_going_out',
    question: 'Evitar comer antes de sair',
    domain: 'worries',
  },
  { id: 'avoid_intimacy', question: 'Evitar intimidade', domain: 'worries' },
  {
    id: 'avoid_staying_overnight',
    question: 'Evitar pernoitar fora de casa',
    domain: 'worries',
  },
  {
    id: 'difficult_to_be_around_people',
    question: 'Dificuldade em estar perto de pessoas',
    domain: 'worries',
  },
  {
    id: 'others_annoyed',
    question: 'Outros ficam irritados com meus problemas intestinais',
    domain: 'satisfaction',
  },
  {
    id: 'burden_to_family',
    question: 'Ser um fardo para a família',
    domain: 'satisfaction',
  },
  {
    id: 'less_enjoyable_life',
    question: 'Vida menos prazerosa',
    domain: 'satisfaction',
  },
  {
    id: 'never_feel_completely_healthy',
    question: 'Nunca se sentir completamente saudável',
    domain: 'satisfaction',
  },
]

const responseOptions = [
  { value: 0, label: 'Ausente' },
  { value: 1, label: 'Leve' },
  { value: 2, label: 'Moderado' },
  { value: 3, label: 'Severo' },
  { value: 4, label: 'Muito severo' },
]

interface PACScoresCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

const PACScoresCalculator = memo(function PACScoresCalculator({
  onSaveResult,
  darkMode = true,
}: PACScoresCalculatorProps) {
  const [symAnswers, setSymAnswers] = useState<PACAnswers>({})
  const [qolAnswers, setQolAnswers] = useState<PACAnswers>({})
  const [notes, setNotes] = useState('')
  const [activeTab, setActiveTab] = useState('pac-sym')

  const handleSymAnswerChange = useCallback((questionId: string, value: string) => {
    setSymAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value),
    }))
  }, [])

  const handleQolAnswerChange = useCallback((questionId: string, value: string) => {
    setQolAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value),
    }))
  }, [])

  const calculatePACSymScore = useMemo(() => {
    const total = Object.values(symAnswers).reduce(
      (sum, value) => sum + value,
      0
    )
    return pacSymQuestions.length > 0 ? total / pacSymQuestions.length : 0
  }, [symAnswers])

  const calculatePACQolScore = useMemo(() => {
    const total = Object.values(qolAnswers).reduce(
      (sum, value) => sum + value,
      0
    )
    return pacQolQuestions.length > 0 ? total / pacQolQuestions.length : 0
  }, [qolAnswers])

  const getSymInterpretation = useCallback((score: number) => {
    if (score < 1) return { text: 'Sintomas mínimos', color: 'green' as const }
    if (score < 2) return { text: 'Sintomas leves', color: 'yellow' as const }
    if (score < 3)
      return { text: 'Sintomas moderados', color: 'yellow' as const }
    return { text: 'Sintomas severos', color: 'red' as const }
  }, [])

  const getQolInterpretation = useCallback((score: number) => {
    if (score < 1)
      return {
        text: 'Impacto mínimo na qualidade de vida',
        color: 'green' as const,
      }
    if (score < 2)
      return {
        text: 'Impacto leve na qualidade de vida',
        color: 'yellow' as const,
      }
    if (score < 3)
      return {
        text: 'Impacto moderado na qualidade de vida',
        color: 'yellow' as const,
      }
    return {
        text: 'Impacto severo na qualidade de vida',
        color: 'red' as const,
      }
  }, [])

  const isSymComplete = useMemo(() =>
    Object.keys(symAnswers).length === pacSymQuestions.length, [symAnswers])
  const isQolComplete = useMemo(() =>
    Object.keys(qolAnswers).length === pacQolQuestions.length, [qolAnswers])
  const isComplete = useMemo(() => isSymComplete && isQolComplete, [isSymComplete, isQolComplete])

  const symScore = calculatePACSymScore
  const qolScore = calculatePACQolScore
  const symInterpretation = useMemo(() => getSymInterpretation(symScore), [getSymInterpretation, symScore])
  const qolInterpretation = useMemo(() => getQolInterpretation(qolScore), [getQolInterpretation, qolScore])

  const calculatorData = useMemo(() => ({
    calculatorName: 'PAC-SYM & PAC-QOL (Constipação)',
    calculatorType: 'pac-scores',
    type: 'pac-scores',
    symAnswers,
    qolAnswers,
    symScore: Number(symScore.toFixed(2)),
    qolScore: Number(qolScore.toFixed(2)),
    result: {
      symScore: Number(symScore.toFixed(2)),
      qolScore: Number(qolScore.toFixed(2)),
      symInterpretation: symInterpretation.text,
      qolInterpretation: qolInterpretation.text,
    },
    symInterpretation: symInterpretation.text,
    qolInterpretation: qolInterpretation.text,
    interpretation: `PAC-SYM: ${symInterpretation.text}, PAC-QOL: ${qolInterpretation.text}`,
    notes,
    date: new Date().toISOString(),
  }), [symAnswers, qolAnswers, symScore, qolScore, symInterpretation, qolInterpretation, notes])

  const handleReset = useCallback(() => {
    setSymAnswers({})
    setQolAnswers({})
    setNotes('')
  }, [])

  const resultComponent = useMemo(() => isComplete ? (
    <div className='space-y-4'>
      <CalculatorResult
        label='PAC-SYM Score'
        value={symScore.toFixed(2)}
        interpretation={symInterpretation.text}
        color={symInterpretation.color}
      />

      <CalculatorResult
        label='PAC-QOL Score'
        value={qolScore.toFixed(2)}
        interpretation={qolInterpretation.text}
        color={qolInterpretation.color}
      />

      <div className='bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4'>
        <h4 className='text-white font-medium mb-3'>
          Interpretação dos Scores
        </h4>
        <div className='space-y-3 text-sm text-gray-300'>
          <div>
            <p className='font-medium text-white mb-1'>PAC-SYM (Sintomas):</p>
            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span>&lt; 1.0:</span>
                <span className='text-green-400'>Sintomas mínimos</span>
              </div>
              <div className='flex justify-between'>
                <span>1.0 - 1.9:</span>
                <span className='text-yellow-400'>Sintomas leves</span>
              </div>
              <div className='flex justify-between'>
                <span>2.0 - 2.9:</span>
                <span className='text-yellow-400'>Sintomas moderados</span>
              </div>
              <div className='flex justify-between'>
                <span>≥ 3.0:</span>
                <span className='text-red-400'>Sintomas severos</span>
              </div>
            </div>
          </div>

          <div>
            <p className='font-medium text-white mb-1'>
              PAC-QOL (Qualidade de Vida):
            </p>
            <div className='space-y-1'>
              <div className='flex justify-between'>
                <span>&lt; 1.0:</span>
                <span className='text-green-400'>Impacto mínimo</span>
              </div>
              <div className='flex justify-between'>
                <span>1.0 - 1.9:</span>
                <span className='text-yellow-400'>Impacto leve</span>
              </div>
              <div className='flex justify-between'>
                <span>2.0 - 2.9:</span>
                <span className='text-yellow-400'>Impacto moderado</span>
              </div>
              <div className='flex justify-between'>
                <span>≥ 3.0:</span>
                <span className='text-red-400'>Impacto severo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null, [isComplete, symScore, qolScore, symInterpretation, qolInterpretation])

  return (
    <BaseCalculator
      title='PAC-SYM & PAC-QOL'
      description='Patient Assessment of Constipation - Avaliação de sintomas e qualidade de vida na constipação'
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-2 bg-gray-900/50 backdrop-blur-sm border border-gray-700'>
            <TabsTrigger
              value='pac-sym'
              className='data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300'
            >
              PAC-SYM ({Object.keys(symAnswers).length}/{pacSymQuestions.length}
              )
            </TabsTrigger>
            <TabsTrigger
              value='pac-qol'
              className='data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300'
            >
              PAC-QOL ({Object.keys(qolAnswers).length}/{pacQolQuestions.length}
              )
            </TabsTrigger>
          </TabsList>

          <TabsContent value='pac-sym' className='space-y-4'>
            <div className='text-center mb-4'>
              <h3 className='text-lg font-semibold text-white mb-2'>
                PAC-SYM - Avaliação de Sintomas
              </h3>
              <p className='text-gray-300 text-sm'>
                Avalie a intensidade dos sintomas nas últimas 2 semanas
              </p>
            </div>

            {pacSymQuestions.map(question => (
              <CalculatorCard key={question.id} title={question.question}>
                <RadioGroup
                  value={symAnswers[question.id]?.toString() || ''}
                  onValueChange={value =>
                    handleSymAnswerChange(question.id, value)
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
                        id={`sym-${question.id}-${option.value}`}
                        className='border-gray-600 text-blue-400'
                      />
                      <Label
                        htmlFor={`sym-${question.id}-${option.value}`}
                        className='text-gray-300 hover:text-white cursor-pointer flex-1'
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CalculatorCard>
            ))}
          </TabsContent>

          <TabsContent value='pac-qol' className='space-y-4'>
            <div className='text-center mb-4'>
              <h3 className='text-lg font-semibold text-white mb-2'>
                PAC-QOL - Qualidade de Vida
              </h3>
              <p className='text-gray-300 text-sm'>
                Avalie o impacto na qualidade de vida nas últimas 2 semanas
              </p>
            </div>

            {pacQolQuestions.map(question => (
              <CalculatorCard key={question.id} title={question.question}>
                <RadioGroup
                  value={qolAnswers[question.id]?.toString() || ''}
                  onValueChange={value =>
                    handleQolAnswerChange(question.id, value)
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
                        id={`qol-${question.id}-${option.value}`}
                        className='border-gray-600 text-green-400'
                      />
                      <Label
                        htmlFor={`qol-${question.id}-${option.value}`}
                        className='text-gray-300 hover:text-white cursor-pointer flex-1'
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CalculatorCard>
            ))}
          </TabsContent>
        </Tabs>

        {/* Notes */}
        <CalculatorCard title='Observações Clínicas'>
          <Textarea
            placeholder='Adicione observações sobre o paciente, sintomas adicionais ou contexto clínico...'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[100px]'
          />
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
})

export default PACScoresCalculator
