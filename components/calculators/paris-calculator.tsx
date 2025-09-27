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

interface ParisParameter {
  morphology: string
  size: string
  location: string
}

const morphologyTypes = [
  {
    type: '0-Ip',
    description: 'Pólipo pediculado',
    characteristics: 'Lesão com pedículo bem definido',
    management: 'Polipectomia com alça',
  },
  {
    type: '0-Is',
    description: 'Pólipo séssil',
    characteristics: 'Lesão elevada sem pedículo',
    management: 'Polipectomia ou EMR',
  },
  {
    type: '0-IIa',
    description: 'Lesão superficial elevada',
    characteristics: 'Elevação sutil menor que 2.5mm',
    management: 'EMR ou ESD',
  },
  {
    type: '0-IIb',
    description: 'Lesão superficial plana',
    characteristics: 'Lesão completamente plana',
    management: 'EMR ou ESD',
  },
  {
    type: '0-IIc',
    description: 'Lesão superficial deprimida',
    characteristics: 'Depressão sutil na mucosa',
    management: 'ESD preferencial',
  },
  {
    type: '0-III',
    description: 'Lesão escavada/ulcerada',
    characteristics: 'Ulceração profunda',
    management: 'Ressecção cirúrgica',
  },
  {
    type: '0-3',
    description: 'Lesão mista/complexa',
    characteristics: 'Combinação de diferentes morfologias',
    management: 'Avaliação individualizada - ESD ou cirurgia',
  },
]

const ParisCalculator: React.FC<{
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}> = ({ onSaveResult, darkMode = false }) => {
  const [parameters, setParameters] = useState<ParisParameter>({
    morphology: '',
    size: '',
    location: '',
  })

  const handleParameterChange = (key: keyof ParisParameter, value: string) => {
    setParameters(prev => ({ ...prev, [key]: value }))
  }

  const getResult = () => {
    if (!parameters.morphology) return null

    const morphology = morphologyTypes.find(
      m => m.type === parameters.morphology
    )
    if (!morphology) return null

    let riskAssessment = 'Baixo risco'
    let additionalNotes = ''

    if (
      parameters.morphology === '0-IIc' ||
      parameters.morphology === '0-III'
    ) {
      riskAssessment = 'Alto risco'
      additionalNotes = 'Maior probabilidade de invasão submucosa'
    } else if (
      parameters.morphology === '0-IIa' &&
      parameters.size === 'maior20mm'
    ) {
      riskAssessment = 'Risco moderado'
      additionalNotes = 'Considerar ESD para ressecção em bloco'
    }

    return {
      type: morphology.type,
      description: morphology.description,
      characteristics: morphology.characteristics,
      management: morphology.management,
      riskAssessment,
      additionalNotes,
      recommendation: `Lesão ${morphology.type}: ${morphology.description}. Conduta: ${morphology.management}`,
    }
  }

  const result = getResult()

  const handleSave = () => {
    if (result && onSaveResult) {
      onSaveResult({
        calculatorType: 'Classificação de Paris',
        parameters,
        result,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <BaseCalculator
      title='Classificação de Paris'
      description='Classificação morfológica de lesões colorretais superficiais'
      onSaveResult={onSaveResult}
      isComplete={!!result}
      calculatorData={{
        type: 'Paris',
        result,
        timestamp: new Date().toISOString(),
      }}
      darkMode={darkMode}
    >
      <div className='space-y-6'>
        <CalculatorQuestion question='Morfologia da Lesão' required>
          <Select
            value={parameters.morphology}
            onValueChange={value => handleParameterChange('morphology', value)}
          >
            <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
              <SelectValue placeholder='Selecione o tipo morfológico' />
            </SelectTrigger>
            <SelectContent className='bg-gray-800 border-gray-600'>
              {morphologyTypes.map(type => (
                <SelectItem
                  key={type.type}
                  value={type.type}
                  className='text-white hover:bg-gray-700'
                >
                  <div className='flex flex-col'>
                    <span className='font-medium'>{type.type}</span>
                    <span className='text-sm text-gray-400'>
                      {type.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CalculatorQuestion>

        <CalculatorQuestion question='Tamanho da Lesão'>
          <Select
            value={parameters.size}
            onValueChange={value => handleParameterChange('size', value)}
          >
            <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
              <SelectValue placeholder='Selecione o tamanho' />
            </SelectTrigger>
            <SelectContent className='bg-gray-800 border-gray-600'>
              <SelectItem
                value='menor10mm'
                className='text-white hover:bg-gray-700'
              >
                Menor que 10mm
              </SelectItem>
              <SelectItem
                value='10-20mm'
                className='text-white hover:bg-gray-700'
              >
                10-20mm
              </SelectItem>
              <SelectItem
                value='maior20mm'
                className='text-white hover:bg-gray-700'
              >
                Maior que 20mm
              </SelectItem>
            </SelectContent>
          </Select>
        </CalculatorQuestion>

        <CalculatorQuestion question='Localização'>
          <Select
            value={parameters.location}
            onValueChange={value => handleParameterChange('location', value)}
          >
            <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
              <SelectValue placeholder='Selecione a localização' />
            </SelectTrigger>
            <SelectContent className='bg-gray-800 border-gray-600'>
              <SelectItem value='reto' className='text-white hover:bg-gray-700'>
                Reto
              </SelectItem>
              <SelectItem
                value='sigmoide'
                className='text-white hover:bg-gray-700'
              >
                Sigmoide
              </SelectItem>
              <SelectItem
                value='colon-esquerdo'
                className='text-white hover:bg-gray-700'
              >
                Cólon esquerdo
              </SelectItem>
              <SelectItem
                value='colon-direito'
                className='text-white hover:bg-gray-700'
              >
                Cólon direito
              </SelectItem>
            </SelectContent>
          </Select>
        </CalculatorQuestion>

        {result && (
          <CalculatorCard title='Resultado da Classificação'>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-blue-900/20 p-4 rounded-lg border border-blue-700'>
                  <h4 className='font-semibold text-blue-300 mb-2'>
                    Tipo Morfológico
                  </h4>
                  <p className='text-white font-medium'>{result.type}</p>
                  <p className='text-gray-300 text-sm'>{result.description}</p>
                  <p className='text-gray-400 text-xs mt-1'>
                    {result.characteristics}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-lg border ${
                    result.riskAssessment === 'Alto risco'
                      ? 'bg-red-900/20 border-red-700'
                      : result.riskAssessment === 'Risco moderado'
                        ? 'bg-yellow-900/20 border-yellow-700'
                        : 'bg-green-900/20 border-green-700'
                  }`}
                >
                  <h4
                    className={`font-semibold mb-2 ${
                      result.riskAssessment === 'Alto risco'
                        ? 'text-red-300'
                        : result.riskAssessment === 'Risco moderado'
                          ? 'text-yellow-300'
                          : 'text-green-300'
                    }`}
                  >
                    Avaliação de Risco
                  </h4>
                  <p className='text-white'>{result.riskAssessment}</p>
                  {result.additionalNotes && (
                    <p className='text-gray-300 text-sm mt-1'>
                      {result.additionalNotes}
                    </p>
                  )}
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

        <CalculatorCard title='Tipos Morfológicos'>
          <div className='space-y-3'>
            {morphologyTypes.map(type => (
              <div
                key={type.type}
                className='flex justify-between items-start py-2 border-b border-gray-700 last:border-b-0'
              >
                <div className='flex-1'>
                  <span className='font-medium text-white'>{type.type}:</span>
                  <span className='text-gray-300 ml-2'>{type.description}</span>
                  <p className='text-gray-400 text-sm mt-1'>
                    {type.characteristics}
                  </p>
                </div>
                <span className='text-sm text-gray-400 ml-4'>
                  {type.management}
                </span>
              </div>
            ))}
          </div>
        </CalculatorCard>

        <CalculatorCard title='Instruções de Uso'>
          <div className='text-gray-300 space-y-2'>
            <p>1. Observe a morfologia da lesão em visão endoscópica</p>
            <p>2. Classifique conforme os tipos 0-I, 0-II ou 0-III</p>
            <p>3. Avalie tamanho e localização para planejamento terapêutico</p>
            <p>4. Considere técnica de ressecção baseada na classificação</p>
          </div>
        </CalculatorCard>
      </div>
    </BaseCalculator>
  )
}

export default ParisCalculator
