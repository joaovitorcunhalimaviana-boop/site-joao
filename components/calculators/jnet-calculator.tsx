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

interface JNETClassification {
  type: string
  level: string
  color: string
  description: string
  details: string
  histology: string
  management: string
  characteristics: string[]
}

const jnetClassifications: JNETClassification[] = [
  {
    type: 'type1',
    level: 'Tipo 1',
    color: 'text-green-400',
    description: 'Lesão hiperplásica',
    details:
      'Padrão vascular regular ou ausente, superfície lisa, sem depressão',
    histology: 'Pólipo hiperplásico',
    management: 'Pode ser deixado sem ressecção se menor que 10mm',
    characteristics: [
      'Padrão vascular regular ou ausente',
      'Superfície lisa e homogênea',
      'Sem depressão central',
      'Coloração similar à mucosa normal',
    ],
  },
  {
    type: 'type2a',
    level: 'Tipo 2A',
    color: 'text-yellow-400',
    description: 'Adenoma de baixo grau',
    details:
      'Padrão vascular regular, superfície com padrão tubular/papilar regular',
    histology: 'Adenoma tubular/tubuloviloso de baixo grau',
    management: 'Ressecção endoscópica (polipectomia/EMR)',
    characteristics: [
      'Padrão vascular regular e fino',
      'Superfície com padrão tubular/papilar regular',
      'Coloração levemente avermelhada',
      'Bordas bem definidas',
    ],
  },
  {
    type: 'type2b',
    level: 'Tipo 2B',
    color: 'text-orange-400',
    description: 'Adenoma de alto grau ou carcinoma superficial',
    details:
      'Padrão vascular irregular, superfície irregular, pode ter depressão',
    histology: 'Adenoma de alto grau ou carcinoma in situ/intramucoso',
    management: 'EMR ou ESD dependendo do tamanho',
    characteristics: [
      'Padrão vascular irregular e espesso',
      'Superfície irregular com padrão cerebriforme',
      'Pode apresentar depressão central',
      'Coloração mais avermelhada',
    ],
  },
  {
    type: 'type3',
    level: 'Tipo 3',
    color: 'text-red-400',
    description: 'Carcinoma invasivo',
    details:
      'Padrão vascular amorfo, superfície irregular com áreas avasculares',
    histology: 'Carcinoma com invasão da submucosa profunda',
    management: 'Cirurgia (ressecção segmentar)',
    characteristics: [
      'Padrão vascular amorfo ou ausente',
      'Superfície muito irregular',
      'Áreas avasculares (brancas)',
      'Depressão central pronunciada',
      'Bordas irregulares e mal definidas',
    ],
  },
]

interface JNETCalculatorProps {
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

export default function JNETCalculator({
  onSaveResult,
  darkMode = true,
}: JNETCalculatorProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [lesionSize, setLesionSize] = useState<string>('')
  const [location, setLocation] = useState<string>('')

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
  }

  const handleReset = () => {
    setSelectedType('')
    setLesionSize('')
    setLocation('')
  }

  const selectedClassification = jnetClassifications.find(
    c => c.type === selectedType
  )
  const isComplete = selectedType !== '' && lesionSize !== '' && location !== ''

  const calculatorData = selectedClassification
    ? {
        type: 'JNET',
        classification: selectedClassification.level,
        lesionSize,
        location,
        histology: selectedClassification.histology,
        management: selectedClassification.management,
        timestamp: new Date().toISOString(),
      }
    : null

  const resultComponent = selectedClassification ? (
    <div className='space-y-4'>
      <CalculatorCard title='Classificação J-NET'>
        <div className='space-y-4'>
          <div className='text-center'>
            <div
              className={`text-2xl font-bold ${selectedClassification.color} mb-2`}
            >
              {selectedClassification.level}
            </div>
            <p className='text-gray-300 text-lg mb-2'>
              {selectedClassification.description}
            </p>
            <div className='text-sm text-gray-400'>
              Tamanho: {lesionSize} | Localização: {location}
            </div>
          </div>

          <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
            <h4 className='text-blue-400 font-medium mb-2'>
              Características Endoscópicas
            </h4>
            <div className='space-y-1'>
              {selectedClassification.characteristics.map((char, index) => (
                <div key={index} className='flex items-start gap-2'>
                  <span className='text-blue-400 mt-1'>•</span>
                  <span className='text-gray-300 text-sm'>{char}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Histologia Esperada'>
        <div className='bg-purple-900/20 border border-purple-700 rounded-lg p-4'>
          <p className='text-gray-300 text-sm'>
            {selectedClassification.histology}
          </p>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Conduta Recomendada'>
        <div className='bg-green-900/20 border border-green-700 rounded-lg p-4'>
          <p className='text-gray-300 text-sm'>
            {selectedClassification.management}
          </p>
        </div>
      </CalculatorCard>

      <CalculatorCard title='Sobre a Classificação J-NET'>
        <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
          <h3 className='text-blue-400 font-medium mb-2'>
            J-NET Classification
          </h3>
          <p className='text-gray-300 text-sm mb-3'>
            Sistema de classificação endoscópica para pólipos colorretais
            baseado no padrão vascular e de superfície, desenvolvido pela Japan
            NBI Expert Team.
          </p>
          <div className='text-sm text-gray-300 space-y-1'>
            <p>
              <strong>Tipo 1:</strong> Lesão hiperplásica (baixo risco)
            </p>
            <p>
              <strong>Tipo 2A:</strong> Adenoma de baixo grau
            </p>
            <p>
              <strong>Tipo 2B:</strong> Adenoma de alto grau/carcinoma
              superficial
            </p>
            <p>
              <strong>Tipo 3:</strong> Carcinoma invasivo (alto risco)
            </p>
          </div>
        </div>
      </CalculatorCard>
    </div>
  ) : null

  return (
    <BaseCalculator
      title='Classificação J-NET'
      description='Japan NBI Expert Team - Classificação endoscópica de pólipos colorretais'
      result={resultComponent}
      onSaveResult={onSaveResult}
      onReset={handleReset}
      isComplete={isComplete}
      calculatorData={calculatorData}
      darkMode={darkMode}
    >
      <div className='space-y-4'>
        <CalculatorCard title='Características da Lesão'>
          <div className='space-y-4'>
            <CalculatorQuestion question='Classificação J-NET' required>
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                  <SelectValue placeholder='Selecione a classificação' />
                </SelectTrigger>
                <SelectContent className='bg-gray-800 border-gray-600'>
                  {jnetClassifications.map(classification => (
                    <SelectItem
                      key={classification.type}
                      value={classification.type}
                      className='text-white hover:bg-gray-700'
                    >
                      <div className='flex flex-col'>
                        <span className={`font-medium ${classification.color}`}>
                          {classification.level}
                        </span>
                        <span className='text-sm text-gray-400'>
                          {classification.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CalculatorQuestion>

            <CalculatorQuestion question='Tamanho da lesão' required>
              <Select value={lesionSize} onValueChange={setLesionSize}>
                <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                  <SelectValue placeholder='Selecione o tamanho' />
                </SelectTrigger>
                <SelectContent className='bg-gray-800 border-gray-600'>
                  <SelectItem
                    value='menor5mm'
                    className='text-white hover:bg-gray-700'
                  >
                    &lt; 5mm
                  </SelectItem>
                  <SelectItem
                    value='5-10mm'
                    className='text-white hover:bg-gray-700'
                  >
                    5-10mm
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
                    &gt; 20mm
                  </SelectItem>
                </SelectContent>
              </Select>
            </CalculatorQuestion>

            <CalculatorQuestion question='Localização' required>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className='bg-gray-800 border-gray-600 text-white'>
                  <SelectValue placeholder='Selecione a localização' />
                </SelectTrigger>
                <SelectContent className='bg-gray-800 border-gray-600'>
                  <SelectItem
                    value='Ceco'
                    className='text-white hover:bg-gray-700'
                  >
                    Ceco
                  </SelectItem>
                  <SelectItem
                    value='Cólon ascendente'
                    className='text-white hover:bg-gray-700'
                  >
                    Cólon ascendente
                  </SelectItem>
                  <SelectItem
                    value='Flexura hepática'
                    className='text-white hover:bg-gray-700'
                  >
                    Flexura hepática
                  </SelectItem>
                  <SelectItem
                    value='Cólon transverso'
                    className='text-white hover:bg-gray-700'
                  >
                    Cólon transverso
                  </SelectItem>
                  <SelectItem
                    value='Flexura esplênica'
                    className='text-white hover:bg-gray-700'
                  >
                    Flexura esplênica
                  </SelectItem>
                  <SelectItem
                    value='Cólon descendente'
                    className='text-white hover:bg-gray-700'
                  >
                    Cólon descendente
                  </SelectItem>
                  <SelectItem
                    value='Sigmoide'
                    className='text-white hover:bg-gray-700'
                  >
                    Sigmoide
                  </SelectItem>
                  <SelectItem
                    value='Reto'
                    className='text-white hover:bg-gray-700'
                  >
                    Reto
                  </SelectItem>
                </SelectContent>
              </Select>
            </CalculatorQuestion>
          </div>
        </CalculatorCard>

        {!selectedType && (
          <CalculatorCard title='Instruções'>
            <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
              <h3 className='text-blue-400 font-medium mb-2'>
                Como usar a Classificação J-NET
              </h3>
              <div className='text-gray-300 text-sm space-y-2'>
                <p>1. Observe o padrão vascular da lesão com NBI</p>
                <p>2. Avalie a superfície e presença de depressões</p>
                <p>3. Classifique conforme os critérios J-NET</p>
                <p>4. Considere tamanho e localização para conduta</p>
              </div>
            </div>
          </CalculatorCard>
        )}
      </div>
    </BaseCalculator>
  )
}
