'use client'

import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import BaseCalculator, {
  CalculatorCard,
  CalculatorQuestion,
  CalculatorResult,
} from './base-calculator'

interface HarveyBradshawAnswers {
  [key: string]: number
}

const harveyBradshawQuestions = [
  {
    id: 'general_wellbeing',
    question: '1. Bem-estar geral',
    type: 'radio' as const,
    options: [
      { value: 0, label: '0 - Muito bem' },
      { value: 1, label: '1 - Ligeiramente abaixo da média' },
      { value: 2, label: '2 - Ruim' },
      { value: 3, label: '3 - Muito ruim' },
      { value: 4, label: '4 - Terrível' },
    ],
  },
  {
    id: 'abdominal_pain',
    question: '2. Dor abdominal',
    type: 'radio' as const,
    options: [
      { value: 0, label: '0 - Nenhuma' },
      { value: 1, label: '1 - Leve' },
      { value: 2, label: '2 - Moderada' },
      { value: 3, label: '3 - Severa' },
    ],
  },
  {
    id: 'liquid_stools',
    question: '3. Número de evacuações líquidas por dia',
    type: 'number' as const,
    placeholder: 'Ex: 3',
    unit: 'evacuações/dia',
  },
  {
    id: 'abdominal_mass',
    question: '4. Massa abdominal',
    type: 'radio' as const,
    options: [
      { value: 0, label: '0 - Nenhuma' },
      { value: 1, label: '1 - Duvidosa' },
      { value: 2, label: '2 - Definida' },
      { value: 3, label: '3 - Definida e dolorosa' },
    ],
  },
  {
    id: 'complications',
    question: '5. Complicações',
    type: 'radio' as const,
    options: [
      { value: 0, label: '0 - Nenhuma' },
      { value: 1, label: '1 - Uma complicação por item' },
    ],
    description: 'Artralgia, uveíte, eritema nodoso, úlceras aftosas, pioderma gangrenoso, fissura anal, nova fístula, abscesso',
  },
]

export default function HarveyBradshawCalculator({
  onSaveResult,
  darkMode = true,
}: {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}) {
  const [answers, setAnswers] = useState<HarveyBradshawAnswers>({})
  const [notes, setNotes] = useState('')

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseFloat(value) || 0,
    }))
  }

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, value) => sum + value, 0)
  }

  const getInterpretation = (score: number) => {
    if (score < 5) {
      return {
        text: 'Remissão',
        color: 'green' as 'green',
        description: 'Doença inativa ou em remissão',
      }
    } else if (score <= 7) {
      return {
        text: 'Atividade leve',
        color: 'yellow' as 'yellow',
        description: 'Atividade leve da doença',
      }
    } else if (score <= 16) {
      return {
        text: 'Atividade moderada',
        color: 'yellow' as 'yellow',
        description: 'Atividade moderada da doença',
      }
    } else {
      return {
        text: 'Atividade severa',
        color: 'red' as 'red',
        description: 'Atividade severa da doença',
      }
    }
  }

  const isComplete = harveyBradshawQuestions.every(q => 
    answers[q.id] !== undefined && answers[q.id] !== null
  )

  const score = calculateScore()
  const interpretation = getInterpretation(score)

  const handleReset = () => {
    setAnswers({})
    setNotes('')
  }

  const resultComponent = isComplete ? (
    <div className="space-y-4">
      <CalculatorResult
        label="Harvey-Bradshaw Index"
        value={`${score} pontos`}
        interpretation={interpretation.text}
        color={interpretation.color}
      />

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Interpretação</h4>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>&lt; 5 pontos:</span>
            <span className="text-green-400">Remissão</span>
          </div>
          <div className="flex justify-between">
            <span>5-7 pontos:</span>
            <span className="text-yellow-400">Atividade leve</span>
          </div>
          <div className="flex justify-between">
            <span>8-16 pontos:</span>
            <span className="text-orange-400">Atividade moderada</span>
          </div>
          <div className="flex justify-between">
            <span>&gt; 16 pontos:</span>
            <span className="text-red-400">Atividade severa</span>
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-900/30 rounded">
          <p className="text-xs text-blue-300">
            {interpretation.description}
          </p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <BaseCalculator
      title="Harvey-Bradshaw Index"
      description="Índice simplificado para avaliação da atividade da Doença de Crohn"
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={
        isComplete
          ? {
              calculatorName: 'Harvey-Bradshaw Index',
              calculatorType: 'Harvey-Bradshaw Index',
              parameters: answers,
              result: {
                score,
                interpretation: interpretation.text,
                description: interpretation.description,
              },
              notes,
              timestamp: new Date().toISOString(),
            }
          : undefined
      }
    >
      <div className="space-y-6">
        {harveyBradshawQuestions.map((question) => (
          <CalculatorQuestion
            key={question.id}
            question={question.question}
            required
          >
            {question.description && (
              <p className="text-sm text-gray-400 mb-3">
                {question.description}
              </p>
            )}
            
            {question.type === 'radio' ? (
              <RadioGroup
                value={answers[question.id]?.toString() || ''}
                onValueChange={(value) => handleAnswerChange(question.id, value)}
                className="space-y-2"
              >
                {question.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`${question.id}-${option.value}`}
                      className="border-gray-600 text-blue-400"
                    />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="text-gray-300 cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder={question.placeholder}
                  value={answers[question.id]?.toString() || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  min="0"
                  step="1"
                />
                {question.unit && (
                  <p className="text-xs text-gray-400">{question.unit}</p>
                )}
              </div>
            )}
          </CalculatorQuestion>
        ))}

        <CalculatorCard title="Observações Clínicas">
          <textarea
            placeholder="Observações adicionais, medicações em uso, histórico clínico relevante..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
          />
        </CalculatorCard>

        <CalculatorCard title="Sobre o Harvey-Bradshaw Index">
          <div className="text-gray-300 space-y-3 text-sm">
            <p>
              O Harvey-Bradshaw Index (HBI) é uma versão simplificada do CDAI 
              (Crohn's Disease Activity Index) para avaliação da atividade da 
              Doença de Crohn.
            </p>
            <div>
              <h4 className="font-medium text-white mb-2">Vantagens:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Mais simples e rápido que o CDAI</li>
                <li>• Não requer exames laboratoriais</li>
                <li>• Boa correlação com o CDAI</li>
                <li>• Útil para monitoramento clínico</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Limitações:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Subjetivo em alguns parâmetros</li>
                <li>• Não inclui dados laboratoriais</li>
                <li>• Menos validado que o CDAI</li>
              </ul>
            </div>
          </div>
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}