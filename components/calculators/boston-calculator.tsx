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

interface BostonParameter {
  rightColon: number
  transverseColon: number
  leftColon: number
}

const preparationScores = [
  {
    score: 0,
    description: 'Inadequado',
    details:
      'Mucosa do segmento não vista devido a fezes sólidas que não podem ser removidas',
  },
  {
    score: 1,
    description: 'Ruim',
    details:
      'Porção da mucosa vista, mas outras áreas não são bem visualizadas devido a coloração, fezes residuais e/ou líquido opaco',
  },
  {
    score: 2,
    description: 'Bom',
    details:
      'Coloração leve, pequenas quantidades de fezes residuais e/ou líquido opaco, mas mucosa bem vista',
  },
  {
    score: 3,
    description: 'Excelente',
    details:
      'Toda mucosa bem vista, sem fezes residuais, líquido opaco ou coloração',
  },
]

const BostonCalculator: React.FC<{
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}> = ({ onSaveResult, darkMode = false }) => {
  const [parameters, setParameters] = useState<BostonParameter>({
    rightColon: -1,
    transverseColon: -1,
    leftColon: -1,
  })

  const handleParameterChange = (key: keyof BostonParameter, value: string) => {
    setParameters(prev => ({ ...prev, [key]: parseInt(value) }))
  }

  const getResult = () => {
    if (
      parameters.rightColon === -1 ||
      parameters.transverseColon === -1 ||
      parameters.leftColon === -1
    ) {
      return null
    }

    const totalScore =
      parameters.rightColon + parameters.transverseColon + parameters.leftColon

    let quality = ''
    let adequacy = ''
    let recommendation = ''

    if (totalScore >= 6) {
      quality = 'Preparo adequado'
      adequacy = 'Exame pode ser realizado com segurança'
      recommendation = 'Colonoscopia de rastreamento em 10 anos (se normal)'
    } else if (totalScore >= 4) {
      quality = 'Preparo limítrofe'
      adequacy = 'Exame pode ser realizado, mas com limitações'
      recommendation =
        'Repetir colonoscopia em 1-3 anos ou considerar novo preparo'
    } else {
      quality = 'Preparo inadequado'
      adequacy = 'Exame comprometido'
      recommendation = 'Repetir exame com novo preparo intestinal'
    }

    // Verificar se algum segmento tem score 0
    const hasZeroScore =
      parameters.rightColon === 0 ||
      parameters.transverseColon === 0 ||
      parameters.leftColon === 0
    if (hasZeroScore) {
      quality = 'Preparo inadequado'
      adequacy = 'Segmento não visualizado'
      recommendation = 'Repetir exame com novo preparo intestinal'
    }

    return {
      totalScore,
      quality,
      adequacy,
      recommendation,
      segmentScores: {
        right: parameters.rightColon,
        transverse: parameters.transverseColon,
        left: parameters.leftColon,
      },
    }
  }

  const result = getResult()

  return (
    <BaseCalculator
      title='Escala de Boston'
      description='Avaliação da qualidade do preparo intestinal para colonoscopia'
      onSaveResult={onSaveResult}
      darkMode={darkMode}
      isComplete={!!result}
      calculatorData={
        result
          ? {
              calculatorType: 'Escala de Boston',
              parameters,
              result,
              timestamp: new Date().toISOString(),
            }
          : undefined
      }
    >
      <div className='space-y-6'>
        <CalculatorQuestion
          question='Cólon Direito (ceco e cólon ascendente)'
          required
        >
          <Select
            value={parameters.rightColon.toString()}
            onValueChange={value => handleParameterChange('rightColon', value)}
          >
            <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
              <SelectValue placeholder='Selecione a pontuação' />
            </SelectTrigger>
            <SelectContent className='bg-gray-800 border-gray-600'>
              {preparationScores.map(score => (
                <SelectItem
                  key={score.score}
                  value={score.score.toString()}
                  className='text-white hover:bg-gray-700'
                >
                  <div className='flex flex-col'>
                    <span className='font-medium'>
                      {score.score} - {score.description}
                    </span>
                    <span className='text-sm text-gray-400'>
                      {score.details}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CalculatorQuestion>

        <CalculatorQuestion
          question='Cólon Transverso (incluindo flexuras)'
          required
        >
          <Select
            value={parameters.transverseColon.toString()}
            onValueChange={value =>
              handleParameterChange('transverseColon', value)
            }
          >
            <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
              <SelectValue placeholder='Selecione a pontuação' />
            </SelectTrigger>
            <SelectContent className='bg-gray-800 border-gray-600'>
              {preparationScores.map(score => (
                <SelectItem
                  key={score.score}
                  value={score.score.toString()}
                  className='text-white hover:bg-gray-700'
                >
                  <div className='flex flex-col'>
                    <span className='font-medium'>
                      {score.score} - {score.description}
                    </span>
                    <span className='text-sm text-gray-400'>
                      {score.details}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CalculatorQuestion>

        <CalculatorQuestion
          question='Cólon Esquerdo (descendente, sigmoide e reto)'
          required
        >
          <Select
            value={parameters.leftColon.toString()}
            onValueChange={value => handleParameterChange('leftColon', value)}
          >
            <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
              <SelectValue placeholder='Selecione a pontuação' />
            </SelectTrigger>
            <SelectContent className='bg-gray-800 border-gray-600'>
              {preparationScores.map(score => (
                <SelectItem
                  key={score.score}
                  value={score.score.toString()}
                  className='text-white hover:bg-gray-700'
                >
                  <div className='flex flex-col'>
                    <span className='font-medium'>
                      {score.score} - {score.description}
                    </span>
                    <span className='text-sm text-gray-400'>
                      {score.details}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CalculatorQuestion>

        {result && (
          <CalculatorCard title='Resultado da Avaliação'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-blue-900/20 p-4 rounded-lg border border-blue-700'>
                  <h4 className='font-semibold text-blue-300 mb-2'>
                    Pontuação Total
                  </h4>
                  <p className='text-2xl font-bold text-white'>
                    {result.totalScore}/9
                  </p>
                  <div className='text-sm text-gray-300 mt-2'>
                    <p>Direito: {result.segmentScores.right}</p>
                    <p>Transverso: {result.segmentScores.transverse}</p>
                    <p>Esquerdo: {result.segmentScores.left}</p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    result.totalScore >= 6
                      ? 'bg-green-900/20 border-green-700'
                      : result.totalScore >= 4
                        ? 'bg-yellow-900/20 border-yellow-700'
                        : 'bg-red-900/20 border-red-700'
                  }`}
                >
                  <h4
                    className={`font-semibold mb-2 ${
                      result.totalScore >= 6
                        ? 'text-green-300'
                        : result.totalScore >= 4
                          ? 'text-yellow-300'
                          : 'text-red-300'
                    }`}
                  >
                    Qualidade do Preparo
                  </h4>
                  <p className='text-white font-medium'>{result.quality}</p>
                  <p className='text-gray-300 text-sm mt-1'>
                    {result.adequacy}
                  </p>
                </div>

                <div className='bg-orange-900/20 p-4 rounded-lg border border-orange-700'>
                  <h4 className='font-semibold text-orange-300 mb-2'>
                    Recomendação
                  </h4>
                  <p className='text-white text-sm'>{result.recommendation}</p>
                </div>
              </div>
            </div>
          </CalculatorCard>
        )}

        <CalculatorCard title='Critérios de Pontuação'>
          <div className='space-y-3'>
            {preparationScores.map(score => (
              <div
                key={score.score}
                className='flex items-start py-3 border-b border-gray-700 last:border-b-0'
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white font-bold ${
                    score.score === 0
                      ? 'bg-red-600'
                      : score.score === 1
                        ? 'bg-orange-600'
                        : score.score === 2
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                  }`}
                >
                  {score.score}
                </div>
                <div className='flex-1'>
                  <p className='font-medium text-white'>{score.description}</p>
                  <p className='text-gray-300 text-sm mt-1'>{score.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CalculatorCard>

        <CalculatorCard title='Interpretação'>
          <div className='text-gray-300 space-y-2'>
            <p>
              <strong className='text-green-400'>6-9 pontos:</strong> Preparo
              adequado - Exame confiável
            </p>
            <p>
              <strong className='text-yellow-400'>4-5 pontos:</strong> Preparo
              limítrofe - Considerar repetição
            </p>
            <p>
              <strong className='text-red-400'>0-3 pontos:</strong> Preparo
              inadequado - Repetir exame
            </p>
            <p className='text-sm mt-3'>
              <strong>Nota:</strong> Qualquer segmento com pontuação 0 torna o
              exame inadequado
            </p>
          </div>
        </CalculatorCard>

        <CalculatorCard title='Instruções de Uso'>
          <div className='text-gray-300 space-y-2'>
            <p>1. Avalie cada segmento do cólon separadamente</p>
            <p>2. Considere a pior área de cada segmento para pontuação</p>
            <p>3. Some as pontuações dos três segmentos</p>
            <p>4. Interprete o resultado conforme os critérios acima</p>
          </div>
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}

export default BostonCalculator
