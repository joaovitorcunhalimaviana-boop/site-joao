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

interface TrueloveWittsAnswers {
  [key: string]: number | string
}

const trueloveWittsQuestions = [
  {
    id: 'bowel_movements',
    question: '1. Número de evacuações por dia',
    type: 'number' as const,
    placeholder: 'Ex: 8',
    unit: 'evacuações/dia',
  },
  {
    id: 'blood_in_stool',
    question: '2. Sangue nas fezes',
    type: 'radio' as const,
    options: [
      { value: 0, label: 'Ausente' },
      { value: 1, label: 'Presente' },
    ],
  },
  {
    id: 'temperature',
    question: '3. Temperatura corporal',
    type: 'number' as const,
    placeholder: 'Ex: 37.5',
    unit: '°C',
    step: '0.1',
  },
  {
    id: 'pulse',
    question: '4. Frequência cardíaca',
    type: 'number' as const,
    placeholder: 'Ex: 90',
    unit: 'bpm',
  },
  {
    id: 'hemoglobin',
    question: '5. Hemoglobina',
    type: 'number' as const,
    placeholder: 'Ex: 10.5',
    unit: 'g/dL',
    step: '0.1',
  },
  {
    id: 'esr',
    question: '6. VHS (Velocidade de Hemossedimentação)',
    type: 'number' as const,
    placeholder: 'Ex: 30',
    unit: 'mm/h',
  },
]

export default function TrueloveWittsCalculator({
  onSaveResult,
  darkMode = true,
}: {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}) {
  const [answers, setAnswers] = useState<TrueloveWittsAnswers>({})
  const [notes, setNotes] = useState('')

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: questionId === 'blood_in_stool' ? parseInt(value) : parseFloat(value) || 0,
    }))
  }

  const getClassification = () => {
    const bowelMovements = Number(answers.bowel_movements) || 0
    const bloodInStool = Number(answers.blood_in_stool) || 0
    const temperature = Number(answers.temperature) || 0
    const pulse = Number(answers.pulse) || 0
    const hemoglobin = Number(answers.hemoglobin) || 0
    const esr = Number(answers.esr) || 0

    // Critérios para colite severa (Truelove-Witts)
    const severeCriteria = {
      bowelMovements: bowelMovements >= 6,
      bloodInStool: bloodInStool === 1,
      temperature: temperature > 37.8,
      pulse: pulse > 90,
      hemoglobin: hemoglobin < 10.5,
      esr: esr > 30,
    }

    const severeCriteriaCount = Object.values(severeCriteria).filter(Boolean).length

    // Classificação baseada nos critérios
    if (severeCriteriaCount >= 4 && severeCriteria.bowelMovements && severeCriteria.bloodInStool) {
      return {
        classification: 'Colite Severa',
        color: 'red' as 'red',
        description: 'Paciente apresenta critérios para colite ulcerativa severa',
        recommendation: 'Hospitalização e tratamento intensivo recomendados',
        risk: 'Alto risco de complicações',
      }
    } else if (severeCriteriaCount >= 2) {
      return {
        classification: 'Colite Moderada',
        color: 'yellow' as 'yellow',
        description: 'Paciente apresenta alguns critérios de gravidade',
        recommendation: 'Monitorização próxima e ajuste terapêutico',
        risk: 'Risco moderado',
      }
    } else {
      return {
        classification: 'Colite Leve',
        color: 'green' as 'green',
        description: 'Paciente não preenche critérios de gravidade',
        recommendation: 'Tratamento ambulatorial adequado',
        risk: 'Baixo risco',
      }
    }
  }

  const isComplete = trueloveWittsQuestions.every(q => 
    answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== ''
  )

  const classification = isComplete ? getClassification() : null

  const handleReset = () => {
    setAnswers({})
    setNotes('')
  }

  const resultComponent = isComplete && classification ? (
    <div className="space-y-4">
      <CalculatorResult
        label="Classificação Truelove-Witts"
        value={classification.classification}
        interpretation={classification.description}
        color={classification.color}
      />

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Critérios de Gravidade</h4>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-gray-300 font-medium mb-2">Critérios Clínicos:</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Evacuações/dia:</span>
                  <span className={Number(answers.bowel_movements) >= 6 ? 'text-red-400' : 'text-green-400'}>
                    {answers.bowel_movements} {Number(answers.bowel_movements) >= 6 ? '(≥6)' : '(<6)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sangue nas fezes:</span>
                  <span className={Number(answers.blood_in_stool) === 1 ? 'text-red-400' : 'text-green-400'}>
                    {Number(answers.blood_in_stool) === 1 ? 'Presente' : 'Ausente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Temperatura:</span>
                  <span className={Number(answers.temperature) > 37.8 ? 'text-red-400' : 'text-green-400'}>
                    {answers.temperature}°C {Number(answers.temperature) > 37.8 ? '(>37.8)' : '(≤37.8)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frequência cardíaca:</span>
                  <span className={Number(answers.pulse) > 90 ? 'text-red-400' : 'text-green-400'}>
                    {answers.pulse} bpm {Number(answers.pulse) > 90 ? '(>90)' : '(≤90)'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-gray-300 font-medium mb-2">Critérios Laboratoriais:</h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Hemoglobina:</span>
                  <span className={Number(answers.hemoglobin) < 10.5 ? 'text-red-400' : 'text-green-400'}>
                    {answers.hemoglobin} g/dL {Number(answers.hemoglobin) < 10.5 ? '(<10.5)' : '(≥10.5)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">VHS:</span>
                  <span className={Number(answers.esr) > 30 ? 'text-red-400' : 'text-green-400'}>
                    {answers.esr} mm/h {Number(answers.esr) > 30 ? '(>30)' : '(≤30)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-900/30 rounded">
          <div className="text-xs space-y-1">
            <p className="text-blue-300">
              <strong>Recomendação:</strong> {classification.recommendation}
            </p>
            <p className="text-blue-300">
              <strong>Nível de risco:</strong> {classification.risk}
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <BaseCalculator
      title="Critérios de Truelove-Witts"
      description="Avaliação da gravidade da colite ulcerativa aguda"
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={
        isComplete && classification
          ? {
              calculatorName: 'Truelove-Witts (Retocolite Ulcerativa)',
              calculatorType: 'Truelove-Witts',
              parameters: answers,
              result: {
                classification: classification.classification,
                description: classification.description,
                recommendation: classification.recommendation,
                risk: classification.risk,
                interpretation: classification.description,
              },
              notes,
              timestamp: new Date().toISOString(),
            }
          : undefined
      }
    >
      <div className="space-y-6">
        {trueloveWittsQuestions.map((question) => (
          <CalculatorQuestion
            key={question.id}
            question={question.question}
            required
          >
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
                  step={question.step || "1"}
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
            placeholder="Observações adicionais, sintomas associados, medicações em uso, histórico clínico relevante..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
          />
        </CalculatorCard>

        <CalculatorCard title="Sobre os Critérios de Truelove-Witts">
          <div className="text-gray-300 space-y-3 text-sm">
            <p>
              Os critérios de Truelove-Witts foram estabelecidos em 1955 para 
              classificar a gravidade da colite ulcerativa aguda e determinar 
              a necessidade de hospitalização.
            </p>
            <div>
              <h4 className="font-medium text-white mb-2">Critérios para Colite Severa:</h4>
              <ul className="space-y-1 text-xs">
                <li>• ≥6 evacuações sanguinolentas por dia</li>
                <li>• Temperatura {'>'}37.8°C</li>
                <li>• Frequência cardíaca {'>'}90 bpm</li>
                <li>• Hemoglobina &lt;10.5 g/dL</li>
                <li>• VHS {'>'}30 mm/h</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Importância Clínica:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Identifica pacientes com risco de complicações</li>
                <li>• Orienta decisão de hospitalização</li>
                <li>• Guia intensidade do tratamento</li>
                <li>• Prediz necessidade de colectomia</li>
              </ul>
            </div>
          </div>
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}