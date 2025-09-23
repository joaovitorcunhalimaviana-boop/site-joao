'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import BaseCalculator, { CalculatorCard } from './base-calculator'

interface BristolType {
  type: number
  name: string
  description: string
  characteristics: string
  transitTime: string
  recommendations: string[]
  color: string
}

const bristolTypes: BristolType[] = [
  {
    type: 1,
    name: 'Tipo 1',
    description: 'Pedaços duros e separados, como nozes',
    characteristics: 'Constipação severa',
    transitTime: 'Tempo de trânsito muito longo (mais de 100 horas)',
    recommendations: [
      'Aumentar ingesta de fibras',
      'Aumentar hidratação',
      'Exercícios físicos regulares',
      'Considerar laxantes se necessário',
    ],
    color: 'text-red-400',
  },
  {
    type: 2,
    name: 'Tipo 2',
    description: 'Em forma de salsicha, mas segmentada',
    characteristics: 'Constipação leve',
    transitTime: 'Tempo de trânsito longo (72-100 horas)',
    recommendations: [
      'Aumentar fibras na dieta',
      'Melhorar hidratação',
      'Atividade física regular',
      'Estabelecer rotina intestinal',
    ],
    color: 'text-orange-400',
  },
  {
    type: 3,
    name: 'Tipo 3',
    description: 'Como salsicha, mas com rachaduras na superfície',
    characteristics: 'Normal (tendendo à constipação)',
    transitTime: 'Tempo de trânsito normal-longo (48-72 horas)',
    recommendations: [
      'Manter dieta equilibrada',
      'Hidratação adequada',
      'Atividade física regular',
      'Monitorar padrão intestinal',
    ],
    color: 'text-yellow-400',
  },
  {
    type: 4,
    name: 'Tipo 4',
    description: 'Como salsicha ou cobra, lisa e macia',
    characteristics: 'Normal - Ideal',
    transitTime: 'Tempo de trânsito ideal (24-48 horas)',
    recommendations: [
      'Manter hábitos atuais',
      'Dieta balanceada',
      'Hidratação regular',
      'Atividade física constante',
    ],
    color: 'text-green-400',
  },
  {
    type: 5,
    name: 'Tipo 5',
    description: 'Pedaços macios com bordas bem definidas',
    characteristics: 'Normal (tendendo à diarreia)',
    transitTime: 'Tempo de trânsito normal-rápido (12-24 horas)',
    recommendations: [
      'Monitorar frequência',
      'Manter hidratação',
      'Dieta equilibrada',
      'Evitar alimentos irritantes',
    ],
    color: 'text-blue-400',
  },
  {
    type: 6,
    name: 'Tipo 6',
    description: 'Pedaços fofos com bordas irregulares',
    characteristics: 'Diarreia leve',
    transitTime: 'Tempo de trânsito rápido (6-12 horas)',
    recommendations: [
      'Aumentar fibras solúveis',
      'Manter hidratação',
      'Evitar alimentos gordurosos',
      'Considerar probióticos',
    ],
    color: 'text-indigo-400',
  },
  {
    type: 7,
    name: 'Tipo 7',
    description: 'Aquosa, sem pedaços sólidos',
    characteristics: 'Diarreia severa',
    transitTime: 'Tempo de trânsito muito rápido (menos de 6 horas)',
    recommendations: [
      'Reidratação urgente',
      'Dieta BRAT (banana, arroz, maçã, torrada)',
      'Evitar laticínios temporariamente',
      'Procurar avaliação médica se persistir',
    ],
    color: 'text-purple-400',
  },
]

interface BristolCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

export default function BristolCalculator({
  onSaveResult,
  darkMode = true,
}: BristolCalculatorProps) {
  const [selectedType, setSelectedType] = useState<number | null>(null)

  const handleTypeSelect = (type: number) => {
    setSelectedType(type)
  }

  const handleReset = () => {
    setSelectedType(null)
  }

  const selectedBristol = selectedType
    ? bristolTypes.find(t => t.type === selectedType)
    : null
  const isComplete = selectedType !== null

  const calculatorData = selectedBristol
    ? {
        type: 'Bristol',
        selectedType: selectedType,
        classification: selectedBristol.characteristics,
        transitTime: selectedBristol.transitTime,
        recommendations: selectedBristol.recommendations,
        timestamp: new Date().toISOString(),
      }
    : null

  const resultComponent = selectedBristol ? (
    <div className='space-y-4'>
      <CalculatorCard title='Resultado da Escala de Bristol'>
        <div className='space-y-4'>
          <div className='text-center'>
            <div className='text-4xl mb-2'>🎯</div>
            <div className={`text-2xl font-bold ${selectedBristol.color} mb-2`}>
              {selectedBristol.name}
            </div>
            <p className='text-gray-300 text-lg mb-2'>
              {selectedBristol.description}
            </p>
            <div className={`text-lg font-semibold ${selectedBristol.color}`}>
              {selectedBristol.characteristics}
            </div>
          </div>

          <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
            <h4 className='text-blue-400 font-medium mb-2'>
              Tempo de Trânsito
            </h4>
            <p className='text-gray-300 text-sm'>
              {selectedBristol.transitTime}
            </p>
          </div>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Recomendações'>
        <div className='space-y-3'>
          {selectedBristol.recommendations.map((rec, index) => (
            <div key={index} className='flex items-start gap-2'>
              <span className='text-blue-400 mt-1'>•</span>
              <span className='text-gray-300 text-sm'>{rec}</span>
            </div>
          ))}
        </div>
      </CalculatorCard>

      <CalculatorCard title='Sobre a Escala de Bristol'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <h3 className='text-blue-400 font-medium mb-2'>Escala de Bristol</h3>
          <p className='text-gray-300 text-sm mb-3'>
            Ferramenta médica para classificar a forma das fezes humanas em sete
            categorias, desenvolvida na Universidade de Bristol.
          </p>
          <div className='text-sm text-gray-300 space-y-1'>
            <p>
              <strong>Aplicação:</strong> Avaliação do tempo de trânsito
              intestinal
            </p>
            <p>
              <strong>Tipos 1-2:</strong> Constipação
            </p>
            <p>
              <strong>Tipos 3-5:</strong> Normal
            </p>
            <p>
              <strong>Tipos 6-7:</strong> Diarreia
            </p>
          </div>
        </div>
      </CalculatorCard>
    </div>
  ) : null

  return (
    <BaseCalculator
      title='Escala de Bristol'
      description='Classificação da forma das fezes para avaliação do trânsito intestinal'
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-6'>
        <CalculatorCard title='Selecione o Tipo de Fezes'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {bristolTypes.map(type => (
              <Button
                key={type.type}
                variant={selectedType === type.type ? 'default' : 'outline'}
                onClick={() => handleTypeSelect(type.type)}
                className={`h-auto p-4 text-left flex flex-col items-start gap-2 ${
                  selectedType === type.type
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className='flex items-center gap-2 w-full'>
                  <span className='text-2xl'>🎯</span>
                  <span
                    className={`font-semibold ${selectedType === type.type ? 'text-white' : type.color}`}
                  >
                    {type.name}
                  </span>
                </div>
                <p
                  className={`text-sm text-left ${
                    selectedType === type.type
                      ? 'text-blue-100'
                      : 'text-gray-400'
                  }`}
                >
                  {type.description}
                </p>
                <p
                  className={`text-xs font-medium ${
                    selectedType === type.type ? 'text-blue-200' : type.color
                  }`}
                >
                  {type.characteristics}
                </p>
              </Button>
            ))}
          </div>
        </CalculatorCard>

        {!selectedType && (
          <CalculatorCard title='Instruções'>
            <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
              <h3 className='text-blue-400 font-medium mb-2'>
                Como usar a Escala de Bristol
              </h3>
              <div className='text-gray-300 text-sm space-y-2'>
                <p>1. Observe a forma e consistência das fezes</p>
                <p>2. Compare com os tipos apresentados acima</p>
                <p>3. Selecione o tipo que mais se assemelha</p>
                <p>4. Veja a interpretação e recomendações</p>
              </div>
            </div>
          </CalculatorCard>
        )}
      </div>
    </BaseCalculator>
  )
}
