'use client'

import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import BaseCalculator, {
  CalculatorCard,
  CalculatorQuestion,
} from './base-calculator'

interface UCEISParameter {
  id: string
  label: string
  options: { value: string; label: string; description: string }[]
}

const uceisParameters: UCEISParameter[] = [
  {
    id: 'vascularPattern',
    label: 'Padrão Vascular (0-2)',
    options: [
      {
        value: '0',
        label: '0 - Normal',
        description: 'Padrão vascular claro com arborização',
      },
      {
        value: '1',
        label: '1 - Parcialmente obscurecido',
        description: 'Padrão vascular parcialmente visível',
      },
      {
        value: '2',
        label: '2 - Completamente obscurecido',
        description: 'Padrão vascular não visível',
      },
    ],
  },
  {
    id: 'bleeding',
    label: 'Sangramento (0-3)',
    options: [
      { value: '0', label: '0 - Ausente', description: 'Sem sangramento' },
      {
        value: '1',
        label: '1 - Mucosa com sangue na luz',
        description: 'Sangue visível na luz intestinal',
      },
      {
        value: '2',
        label: '2 - Sangramento leve ao toque',
        description: 'Sangramento quando tocado pelo endoscópio',
      },
      {
        value: '3',
        label: '3 - Sangramento espontâneo',
        description: 'Sangramento espontâneo à frente do endoscópio',
      },
    ],
  },
  {
    id: 'erosionsUlcers',
    label: 'Erosões e Úlceras (0-3)',
    options: [
      {
        value: '0',
        label: '0 - Ausente',
        description: 'Sem erosões ou úlceras',
      },
      {
        value: '1',
        label: '1 - Erosões',
        description: 'Defeito mucoso menor que 5mm',
      },
      {
        value: '2',
        label: '2 - Úlceras superficiais',
        description: 'Defeito mucoso ≥5mm, superficial',
      },
      {
        value: '3',
        label: '3 - Úlceras profundas',
        description: 'Úlceras escavadas e profundas',
      },
    ],
  },
]

interface UCEISCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

export default function UCEISCalculator({
  onSaveResult,
  darkMode = true,
}: UCEISCalculatorProps) {
  const [scores, setScores] = useState<Record<string, string>>({
    vascularPattern: '',
    bleeding: '',
    erosionsUlcers: '',
  })

  const handleScoreChange = (parameterId: string, value: string) => {
    setScores(prev => ({ ...prev, [parameterId]: value }))
  }

  const handleReset = () => {
    setScores({
      vascularPattern: '',
      bleeding: '',
      erosionsUlcers: '',
    })
  }

  const calculateUCEIS = () => {
    const vascular = parseInt(scores['vascularPattern']) || 0
    const bleeding = parseInt(scores['bleeding']) || 0
    const erosions = parseInt(scores['erosionsUlcers']) || 0

    return vascular + bleeding + erosions
  }

  const getInterpretation = (score: number) => {
    if (score <= 1)
      return {
        level: 'Remissão',
        color: 'text-green-400',
        description: 'Atividade endoscópica mínima ou ausente',
        management: 'Manter tratamento atual, considerar redução gradual',
      }
    if (score <= 4)
      return {
        level: 'Atividade Leve',
        color: 'text-yellow-400',
        description: 'Atividade endoscópica leve',
        management: 'Otimizar tratamento anti-inflamatório',
      }
    if (score <= 6)
      return {
        level: 'Atividade Moderada',
        color: 'text-orange-400',
        description: 'Atividade endoscópica moderada',
        management: 'Intensificar tratamento, considerar imunossupressores',
      }
    return {
      level: 'Atividade Severa',
      color: 'text-red-400',
      description: 'Atividade endoscópica severa',
      management: 'Tratamento intensivo, considerar biológicos ou cirurgia',
    }
  }

  const totalScore = calculateUCEIS()
  const interpretation = getInterpretation(totalScore)
  const isComplete = Object.values(scores).every(score => score !== '')

  const calculatorData = isComplete
    ? {
        type: 'UCEIS',
        totalScore,
        interpretation: interpretation.level,
        vascularPattern: scores['vascularPattern'],
        bleeding: scores['bleeding'],
        erosionsUlcers: scores['erosionsUlcers'],
        timestamp: new Date().toISOString(),
      }
    : null

  const resultComponent = isComplete ? (
    <div className='space-y-4'>
      <CalculatorCard title='Resultado UCEIS'>
        <div className='text-center space-y-4'>
          <div className='text-6xl font-bold text-white mb-2'>{totalScore}</div>
          <div
            className={`text-2xl font-semibold ${interpretation.color} mb-2`}
          >
            {interpretation.level}
          </div>
          <p className='text-gray-300'>{interpretation.description}</p>

          <div className='bg-gray-800/50 rounded-lg p-4 text-left'>
            <h4 className='text-white font-medium mb-2'>
              Pontuação Detalhada:
            </h4>
            <div className='space-y-1 text-sm text-gray-300'>
              <div>Padrão Vascular: {scores['vascularPattern']}</div>
              <div>Sangramento: {scores['bleeding']}</div>
              <div>Erosões/Úlceras: {scores['erosionsUlcers']}</div>
              <div className='font-semibold pt-2 border-t border-gray-600 text-white'>
                Total: {totalScore}
              </div>
            </div>
          </div>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Conduta Sugerida'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <p className='text-gray-300 text-sm'>{interpretation.management}</p>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Interpretação UCEIS'>
        <div className='bg-purple-900/20 border border-purple-700 rounded-lg p-4'>
          <div className='text-sm text-gray-300 space-y-2'>
            <div className='flex justify-between'>
              <span>0-1 pontos:</span>
              <span className='text-green-400'>Remissão endoscópica</span>
            </div>
            <div className='flex justify-between'>
              <span>2-4 pontos:</span>
              <span className='text-yellow-400'>Atividade leve</span>
            </div>
            <div className='flex justify-between'>
              <span>5-6 pontos:</span>
              <span className='text-orange-400'>Atividade moderada</span>
            </div>
            <div className='flex justify-between'>
              <span>7-8 pontos:</span>
              <span className='text-red-400'>Atividade severa</span>
            </div>
          </div>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Sobre o UCEIS'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <h3 className='text-blue-400 font-medium mb-2'>
            Ulcerative Colitis Endoscopic Index of Severity
          </h3>
          <div className='text-sm text-gray-300 space-y-2'>
            <p>
              • Índice validado para avaliação endoscópica da colite ulcerativa
            </p>
            <p>• Boa correlação inter-observador e reprodutibilidade</p>
            <p>• Útil para ensaios clínicos e monitoramento terapêutico</p>
            <p>• Preditor de resposta ao tratamento</p>
            <p>• Deve ser aplicado no segmento mais severamente afetado</p>
          </div>
        </div>
      </CalculatorCard>
    </div>
  ) : null

  return (
    <BaseCalculator
      title='UCEIS'
      description='Ulcerative Colitis Endoscopic Index of Severity'
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-4'>
        <CalculatorCard title='Parâmetros UCEIS'>
          <div className='space-y-4'>
            {uceisParameters.map(parameter => (
              <CalculatorQuestion
                key={parameter.id}
                question={parameter.label}
                required
              >
                <Select
                  value={scores[parameter.id]}
                  onValueChange={value =>
                    handleScoreChange(parameter.id, value)
                  }
                >
                  <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                    <SelectValue
                      placeholder={`Selecione ${parameter.label.toLowerCase()}`}
                    />
                  </SelectTrigger>
                  <SelectContent className='bg-gray-800 border-gray-600'>
                    {parameter.options.map(option => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className='text-white hover:bg-gray-700'
                      >
                        <div className='flex flex-col'>
                          <span className='font-medium'>{option.label}</span>
                          <span className='text-sm text-gray-400'>
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CalculatorQuestion>
            ))}
          </div>
        </CalculatorCard>

        <CalculatorCard title='Instruções'>
          <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
            <h3 className='text-blue-400 font-medium mb-2'>
              Como aplicar o UCEIS
            </h3>
            <div className='text-gray-300 text-sm space-y-2'>
              <p>1. Avalie o segmento mais severamente afetado</p>
              <p>2. Observe o padrão vascular da mucosa</p>
              <p>3. Identifique presença e intensidade do sangramento</p>
              <p>
                4. Classifique erosões e úlceras conforme tamanho e profundidade
              </p>
              <p>5. Some os três parâmetros para obter o escore total</p>
            </div>
          </div>
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}
