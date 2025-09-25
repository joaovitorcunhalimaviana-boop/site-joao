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

interface KudoParameter {
  pitPattern: string
  surfacePattern: string
  vascularPattern: string
}

const pitPatterns = [
  {
    type: 'I',
    description:
      'Normal ou arredondado - criptas regulares em tamanho e arranjo',
    histology: 'Mucosa normal',
    management: 'Nenhuma ação necessária',
  },
  {
    type: 'II',
    description:
      'Estrelado - abertura das criptas em forma de estrela com arranjo uniforme',
    histology: 'Pólipos hiperplásicos (e lesões serrilhadas)',
    management: 'Polipectomia se >10mm',
  },
  {
    type: 'IIIL',
    description:
      'Tubular grande - criptas com abertura tubular e alongada, arranjo regular',
    histology: 'Adenomas tubulares com baixo grau de displasia',
    management: 'Polipectomia ou EMR',
  },
  {
    type: 'IIIS',
    description:
      'Tubular pequeno - criptas com menor diâmetro e arranjo compactado',
    histology: 'Adenomas tubulares com baixo grau de displasia',
    management: 'Polipectomia ou EMR',
  },
  {
    type: 'IV',
    description: 'Ramificado - criptas tortuosas, exuberantes e ramificadas',
    histology: 'Adenomas com componente viloso',
    management: 'Polipectomia ou EMR',
  },
  {
    type: 'Vi',
    description:
      'Desestruturado irregular - padrão mais estruturado de criptas irregulares',
    histology:
      'Adenomas com displasia de alto grau ou carcinoma com mínima invasão da submucosa',
    management: 'EMR ou ESD',
  },
  {
    type: 'Vn',
    description:
      'Desestruturado não-estrutural - superfície rugosa com ulcerações e apagamento das criptas',
    histology: 'Carcinomas não precoces',
    management: 'Ressecção cirúrgica',
  },
]

const KudoCalculator: React.FC<{
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}> = ({ onSaveResult, darkMode = false }) => {
  const [parameters, setParameters] = useState<KudoParameter>({
    pitPattern: '',
    surfacePattern: '',
    vascularPattern: '',
  })

  const handleParameterChange = (key: keyof KudoParameter, value: string) => {
    setParameters(prev => ({ ...prev, [key]: value }))
  }

  const getResult = () => {
    if (!parameters.pitPattern) return null

    const pattern = pitPatterns.find(p => p.type === parameters.pitPattern)
    if (!pattern) return null

    return {
      type: pattern.type,
      description: pattern.description,
      histology: pattern.histology,
      management: pattern.management,
      recommendation: `Padrão ${pattern.type}: ${pattern.histology}. Conduta: ${pattern.management}`,
    }
  }

  const result = getResult()

  const handleSave = () => {
    if (result && onSaveResult) {
      onSaveResult({
        calculatorType: 'Classificação de Kudo',
        parameters,
        result,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <BaseCalculator
      title='Classificação de Kudo'
      description='Classificação endoscópica de pólipos colorretais baseada no padrão de criptas (pit pattern)'
      onSaveResult={onSaveResult}
      isComplete={!!result}
      calculatorData={{
        type: 'Kudo',
        result,
        timestamp: new Date().toISOString(),
      }}
      darkMode={darkMode}
    >
      <div className='space-y-6'>
        <CalculatorQuestion question='Padrão de Criptas (Pit Pattern)' required>
          <Select
            value={parameters.pitPattern}
            onValueChange={value => handleParameterChange('pitPattern', value)}
          >
            <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
              <SelectValue placeholder='Selecione o padrão' />
            </SelectTrigger>
            <SelectContent className='bg-gray-800 border-gray-600'>
              {pitPatterns.map(pattern => (
                <SelectItem
                  key={pattern.type}
                  value={pattern.type}
                  className='text-white hover:bg-gray-700'
                >
                  <div className='flex flex-col'>
                    <span className='font-medium'>Tipo {pattern.type}</span>
                    <span className='text-sm text-gray-400'>
                      {pattern.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CalculatorQuestion>

        {result && (
          <CalculatorCard title='Resultado da Classificação'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-blue-900/20 p-4 rounded-lg border border-blue-700'>
                  <h4 className='font-semibold text-blue-300 mb-2'>
                    Padrão Identificado
                  </h4>
                  <p className='text-white font-medium'>Tipo {result.type}</p>
                  <p className='text-gray-300 text-sm'>{result.description}</p>
                </div>

                <div className='bg-green-900/20 p-4 rounded-lg border border-green-700'>
                  <h4 className='font-semibold text-green-300 mb-2'>
                    Histologia Esperada
                  </h4>
                  <p className='text-white'>{result.histology}</p>
                </div>
              </div>

              <div className='bg-orange-900/20 p-4 rounded-lg border border-orange-700'>
                <h4 className='font-semibold text-orange-300 mb-2'>
                  Conduta Recomendada
                </h4>
                <p className='text-white'>{result.management}</p>
              </div>
            </div>
          </CalculatorCard>
        )}

        <CalculatorCard title='Interpretação dos Padrões'>
          <div className='space-y-3'>
            {pitPatterns.map(pattern => (
              <div
                key={pattern.type}
                className='flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0'
              >
                <div>
                  <span className='font-medium text-white'>
                    Tipo {pattern.type}:
                  </span>
                  <span className='text-gray-300 ml-2'>
                    {pattern.description}
                  </span>
                </div>
                <span className='text-sm text-gray-400'>
                  {pattern.histology}
                </span>
              </div>
            ))}
          </div>
        </CalculatorCard>

        <CalculatorCard title='Instruções de Uso'>
          <div className='text-gray-300 space-y-2'>
            <p>1. Examine a lesão com magnificação de imagem (zoom óptico)</p>
            <p>2. Observe o padrão das aberturas das criptas na superfície</p>
            <p>3. Classifique conforme os tipos I-V da classificação de Kudo</p>
            <p>4. Considere a conduta baseada no padrão identificado</p>
          </div>
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}

export default KudoCalculator
