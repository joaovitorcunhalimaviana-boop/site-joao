'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalculatorIcon } from '@heroicons/react/24/outline'
import MayoCalculator from '@/components/calculators/mayo-calculator'
import BaronCalculator from '@/components/calculators/baron-calculator'
import JNETCalculator from '@/components/calculators/jnet-calculator'
import UCEISCalculator from '@/components/calculators/uceis-calculator'
import KudoCalculator from '@/components/calculators/kudo-calculator'
import ParisCalculator from '@/components/calculators/paris-calculator'
import BostonCalculator from '@/components/calculators/boston-calculator'

interface EndoscopicCalculatorsProps {
  onSaveToRecord?: (calculatorName: string, result: any) => void
}

type EndoscopicCalculatorType =
  | 'mayo'
  | 'baron'
  | 'jnet'
  | 'uceis'
  | 'kudo'
  | 'paris'
  | 'boston'

const endoscopicCalculatorOptions = [
  { value: 'mayo', label: 'Mayo Endoscopic Score (Colite Ulcerativa)' },
  { value: 'baron', label: 'Baron Score (Colite Ulcerativa)' },
  { value: 'jnet', label: 'J-NET (Japan NBI Expert Team)' },
  { value: 'uceis', label: 'UCEIS (Índice Endoscópico de Severidade)' },
  { value: 'kudo', label: 'Kudo (Padrão de Criptas)' },
  { value: 'paris', label: 'Paris (Lesões Superficiais)' },
  { value: 'boston', label: 'Boston (Preparo Intestinal)' },
]

export default function EndoscopicCalculators({
  onSaveToRecord,
}: EndoscopicCalculatorsProps) {
  const [selectedCalculator, setSelectedCalculator] =
    useState<EndoscopicCalculatorType | null>(null)
  const [savedResults, setSavedResults] = useState<any[]>([])

  const handleSaveResult = (calculatorName: string, result: any) => {
    const newResult = {
      id: Date.now(),
      calculatorName,
      result,
      timestamp: new Date().toISOString(),
    }
    setSavedResults(prev => [...prev, newResult])
    
    if (onSaveToRecord) {
      onSaveToRecord(calculatorName, result)
    }
  }

  const renderCalculator = () => {
    const commonProps = {
      onSave: (result: any) =>
        handleSaveResult(
          endoscopicCalculatorOptions.find(c => c.value === selectedCalculator)
            ?.label || '',
          result
        ),
    }

    switch (selectedCalculator) {
      case 'mayo':
        return <MayoCalculator {...commonProps} />
      case 'baron':
        return <BaronCalculator {...commonProps} />
      case 'jnet':
        return <JNETCalculator {...commonProps} />
      case 'uceis':
        return <UCEISCalculator {...commonProps} />
      case 'kudo':
        return <KudoCalculator {...commonProps} />
      case 'paris':
        return <ParisCalculator {...commonProps} />
      case 'boston':
        return <BostonCalculator {...commonProps} />
      default:
        return null
    }
  }

  return (
    <Card className='bg-blue-900/20 backdrop-blur-sm border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300'>
      <CardHeader>
        <CardTitle className='text-blue-300 flex items-center'>
          <CalculatorIcon className='h-5 w-5 mr-2' />
          Calculadoras Endoscópicas
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label className='text-white mb-2 block'>
            Escolha uma calculadora endoscópica
          </Label>
          <Select
            onValueChange={value =>
              setSelectedCalculator(value as EndoscopicCalculatorType)
            }
          >
            <SelectTrigger className='bg-gray-700 border-gray-600 text-white'>
              <SelectValue placeholder='Selecione uma calculadora' />
            </SelectTrigger>
            <SelectContent>
              {endoscopicCalculatorOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCalculator && (
          <div className='mt-6'>
            <h3 className='text-lg font-medium text-white mb-4'>
              {
                endoscopicCalculatorOptions.find(c => c.value === selectedCalculator)
                  ?.label
              }
            </h3>
            {renderCalculator()}
          </div>
        )}

        {savedResults.length > 0 && (
          <div className='mt-6'>
            <h3 className='text-lg font-medium text-white mb-4'>
              Resultados Salvos
            </h3>
            <div className='space-y-2'>
              {savedResults.map(result => (
                <div
                  key={result.id}
                  className='bg-gray-700/50 border border-gray-600 rounded-lg p-3'
                >
                  <div className='flex justify-between items-start'>
                    <div>
                      <h4 className='text-white font-medium'>
                        {result.calculatorName}
                      </h4>
                      <p className='text-gray-300 text-sm mt-1'>
                        {JSON.stringify(result.result)}
                      </p>
                    </div>
                    <span className='text-gray-400 text-xs'>
                      {new Date(result.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}