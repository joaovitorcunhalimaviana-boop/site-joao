'use client'

import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import BaseCalculator, {
  CalculatorCard,
  CalculatorQuestion,
  CalculatorResult,
} from './base-calculator'

interface RomaAnswers {
  [key: string]: boolean
}

const romaCriteria = [
  {
    id: 'recurrent_pain',
    question:
      'Dor abdominal recorrente, em média, pelo menos 1 dia por semana nos últimos 3 meses',
    required: true,
  },
  {
    id: 'pain_defecation',
    question: 'Dor relacionada à defecação',
    required: false,
  },
  {
    id: 'pain_frequency',
    question: 'Dor associada a uma mudança na frequência das evacuações',
    required: false,
  },
  {
    id: 'pain_consistency',
    question: 'Dor associada a uma mudança na forma (aparência) das fezes',
    required: false,
  },
]

const siiSubtypes = {
  'SII-C': {
    name: 'SII com Constipação',
    description:
      'Fezes duras ou em caroços ≥25% e fezes moles ≤25% das evacuações',
  },
  'SII-D': {
    name: 'SII com Diarreia',
    description:
      'Fezes moles ≥25% e fezes duras ou em caroços ≤25% das evacuações',
  },
  'SII-M': {
    name: 'SII Misto',
    description:
      'Fezes duras ou em caroços ≥25% e fezes moles ≥25% das evacuações',
  },
  'SII-U': {
    name: 'SII Não Classificado',
    description: 'Critérios insuficientes para SII-C, SII-D ou SII-M',
  },
}

interface RomaIVCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

export default function RomaIVCalculator({
  onSaveResult,
  darkMode = true,
}: RomaIVCalculatorProps) {
  const [answers, setAnswers] = useState<RomaAnswers>({})
  const [notes, setNotes] = useState('')
  const [selectedSubtype, setSelectedSubtype] = useState<string>('')

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value === 'true',
    }))
  }

  const handleSubtypeChange = (subtype: string) => {
    setSelectedSubtype(subtype)
  }

  const checkRomaCriteria = () => {
    // Critério obrigatório: dor abdominal recorrente
    if (!answers.recurrent_pain) {
      return {
        meets: false,
        reason: 'Critério obrigatório não atendido: dor abdominal recorrente',
      }
    }

    // Pelo menos 2 dos 3 critérios associados
    const associatedCriteria = [
      answers.pain_defecation,
      answers.pain_frequency,
      answers.pain_consistency,
    ].filter(Boolean).length

    if (associatedCriteria >= 2) {
      return { meets: true, reason: 'Critérios de Roma IV atendidos' }
    }

    return {
      meets: false,
      reason: `Apenas ${associatedCriteria} de 3 critérios associados atendidos (necessário ≥2)`,
    }
  }

  const isComplete = Object.keys(answers).length === romaCriteria.length
  const romaResult = checkRomaCriteria()

  const calculatorData = {
    type: 'roma-iv',
    answers,
    meetsRomaCriteria: romaResult.meets,
    reason: romaResult.reason,
    subtype: selectedSubtype,
    notes,
    date: new Date().toISOString(),
  }

  const handleReset = () => {
    setAnswers({})
    setSelectedSubtype('')
    setNotes('')
  }

  const resultComponent = isComplete ? (
    <div className='space-y-4'>
      <CalculatorResult
        label='Critérios de Roma IV'
        value={romaResult.meets ? 'ATENDIDOS' : 'NÃO ATENDIDOS'}
        interpretation={romaResult.reason}
        color={romaResult.meets ? 'green' : 'red'}
      />

      {romaResult.meets && (
        <div className='bg-green-900/20 border border-green-700 rounded-lg p-4'>
          <h4 className='text-green-400 font-medium mb-3'>
            Diagnóstico: Síndrome do Intestino Irritável
          </h4>

          <div className='space-y-3'>
            <div>
              <p className='text-white font-medium mb-2'>
                Selecione o subtipo baseado no padrão das fezes:
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {Object.entries(siiSubtypes).map(([key, subtype]) => (
                  <div
                    key={key}
                    onClick={() => handleSubtypeChange(key)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSubtype === key
                        ? 'border-green-500 bg-green-900/30'
                        : 'border-gray-600 bg-gray-800/50 hover:border-green-600'
                    }`}
                  >
                    <div className='flex items-center justify-between mb-1'>
                      <span className='font-medium text-white'>
                        {subtype.name}
                      </span>
                      {selectedSubtype === key && (
                        <Badge className='bg-green-600 text-white'>
                          Selecionado
                        </Badge>
                      )}
                    </div>
                    <p className='text-gray-300 text-sm'>
                      {subtype.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4'>
        <h4 className='text-white font-medium mb-3'>Status dos Critérios</h4>
        <div className='space-y-2'>
          {romaCriteria.map(criterion => {
            const isAnswered = answers.hasOwnProperty(criterion.id)
            const isMet = answers[criterion.id]

            return (
              <div
                key={criterion.id}
                className='flex items-center justify-between'
              >
                <span className='text-gray-300 text-sm flex-1'>
                  {criterion.question}
                  {criterion.required && (
                    <span className='text-red-400 ml-1'>*</span>
                  )}
                </span>
                <div className='flex items-center gap-2'>
                  {!isAnswered ? (
                    <Badge
                      variant='outline'
                      className='border-gray-600 text-gray-400'
                    >
                      Não respondido
                    </Badge>
                  ) : isMet ? (
                    <Badge className='bg-green-600 text-white'>Sim</Badge>
                  ) : (
                    <Badge className='bg-red-600 text-white'>Não</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
        <h4 className='text-blue-400 font-medium mb-3'>Subtipos de SII</h4>
        <div className='space-y-3 text-sm'>
          {Object.entries(siiSubtypes).map(([key, subtype]) => (
            <div key={key}>
              <p className='font-medium text-white'>
                {key} - {subtype.name}
              </p>
              <p className='text-gray-300'>{subtype.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null

  return (
    <BaseCalculator
      title='Roma IV'
      description='Critérios diagnósticos para Síndrome do Intestino Irritável'
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-6'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <h3 className='text-blue-400 font-medium mb-2'>
            Critérios de Roma IV para SII
          </h3>
          <p className='text-gray-300 text-sm'>
            Dor abdominal recorrente, em média, pelo menos 1 dia por semana nos
            últimos 3 meses, associada com 2 ou mais dos seguintes critérios:
          </p>
        </div>

        {romaCriteria.map(criterion => (
          <CalculatorCard
            key={criterion.id}
            title={`${criterion.question}${criterion.required ? ' *' : ''}`}
          >
            <CalculatorQuestion question='' required={criterion.required}>
              <div className='flex items-center gap-2 mb-2'>
                {criterion.required && (
                  <Badge className='bg-red-600 text-white text-xs'>
                    Obrigatório
                  </Badge>
                )}
              </div>
              <RadioGroup
                value={answers[criterion.id]?.toString() || ''}
                onValueChange={value => handleAnswerChange(criterion.id, value)}
                className='space-y-2'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value='true'
                    id={`${criterion.id}-yes`}
                    className='border-gray-600 text-green-400'
                  />
                  <Label
                    htmlFor={`${criterion.id}-yes`}
                    className='text-gray-300 hover:text-white cursor-pointer'
                  >
                    Sim
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value='false'
                    id={`${criterion.id}-no`}
                    className='border-gray-600 text-red-400'
                  />
                  <Label
                    htmlFor={`${criterion.id}-no`}
                    className='text-gray-300 hover:text-white cursor-pointer'
                  >
                    Não
                  </Label>
                </div>
              </RadioGroup>
            </CalculatorQuestion>
          </CalculatorCard>
        ))}

        {/* Notes */}
        <CalculatorCard title='Observações Clínicas'>
          <Textarea
            placeholder='Adicione observações sobre o paciente, sintomas adicionais, duração dos sintomas ou contexto clínico...'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[100px]'
          />
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}
