'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalculatorIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import StMarksCalculator from '@/components/calculators/st-marks-calculator'
import PacScoresCalculator from '@/components/calculators/pac-scores-calculator'
import RomaIVCalculator from '@/components/calculators/roma-iv-calculator'
import IBDQCalculator from '@/components/calculators/ibdq-calculator'
import ConstipacaoCalculator from '@/components/calculators/constipacao-calculator'
import CDAICalculator from '@/components/calculators/cdai-calculator'
import BMICalculator from '@/components/calculators/bmi-calculator'
import HarveyBradshawCalculator from '@/components/calculators/harvey-bradshaw-calculator'
import TrueloveWittsCalculator from '@/components/calculators/truelove-witts-calculator'

interface MedicalCalculatorsProps {
  patientName: string
  onSaveToRecord?: (calculatorName: string, result: any) => void
}

type CalculatorType =
  | 'wexner'
  | 'bristol'
  | 'st-marks'
  | 'pac-sym'
  | 'roma-iv'
  | 'ibdq'
  | 'constipacao'
  | 'cdai'
  | 'bmi'
  | 'harvey-bradshaw'
  | 'truelove-witts'

const calculatorOptions = [
  { value: 'wexner', label: 'Wexner (Incontinência Fecal)' },
  { value: 'bristol', label: 'Bristol (Escala de Fezes)' },
  { value: 'st-marks', label: "St. Mark's (Incontinência Fecal)" },
  { value: 'pac-sym', label: 'PAC-SYM & PAC-QOL (Constipação)' },
  { value: 'roma-iv', label: 'Roma IV (Distúrbios Funcionais)' },
  { value: 'ibdq', label: 'IBDQ (Qualidade de Vida - DII)' },
  { value: 'constipacao', label: 'Escala de Constipação' },
  { value: 'cdai', label: 'CDAI (Atividade da Doença de Crohn)' },
  { value: 'bmi', label: 'IMC (Índice de Massa Corporal)' },
  { value: 'harvey-bradshaw', label: 'Harvey-Bradshaw Index (Doença de Crohn)' },
  { value: 'truelove-witts', label: 'Truelove-Witts (Retocolite Ulcerativa)' },
]

// Score de Wexner para Incontinência Fecal
const WexnerCalculator = ({ onSave }: { onSave: (result: any) => void }) => {
  const [scores, setScores] = useState({
    solid: 0,
    liquid: 0,
    gas: 0,
    wearsPad: 0,
    lifestyleAlteration: 0,
  })

  const questions = [
    {
      key: 'solid',
      label: 'Incontinência para fezes sólidas',
      options: ['Nunca', 'Raramente', 'Às vezes', 'Geralmente', 'Sempre'],
    },
    {
      key: 'liquid',
      label: 'Incontinência para fezes líquidas',
      options: ['Nunca', 'Raramente', 'Às vezes', 'Geralmente', 'Sempre'],
    },
    {
      key: 'gas',
      label: 'Incontinência para gases',
      options: ['Nunca', 'Raramente', 'Às vezes', 'Geralmente', 'Sempre'],
    },
    {
      key: 'wearsPad',
      label: 'Usa absorvente/fralda',
      options: ['Nunca', 'Raramente', 'Às vezes', 'Geralmente', 'Sempre'],
    },
    {
      key: 'lifestyleAlteration',
      label: 'Alteração no estilo de vida',
      options: ['Nunca', 'Raramente', 'Às vezes', 'Geralmente', 'Sempre'],
    },
  ]

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  )

  const getInterpretation = (score: number) => {
    if (score === 0) return 'Continência perfeita'
    if (score <= 9) return 'Incontinência leve'
    if (score <= 14) return 'Incontinência moderada'
    return 'Incontinência grave'
  }

  const handleScoreChange = (key: string, value: string) => {
    setScores(prev => ({ ...prev, [key]: parseInt(value) }))
  }

  const handleSave = () => {
    const result = {
      calculatorName: 'Score de Wexner',
      totalScore,
      interpretation: getInterpretation(totalScore),
      details: scores,
      timestamp: new Date().toISOString(),
    }
    onSave(result)
  }

  return (
    <div className='space-y-4'>
      {questions.map(question => (
        <div key={question.key}>
          <Label className='text-white mb-2 block'>{question.label}</Label>
          <Select
            onValueChange={value => handleScoreChange(question.key, value)}
          >
            <SelectTrigger className='bg-gray-700 border-gray-600 text-white'>
              <SelectValue placeholder='Selecione uma opção' />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      <div className='mt-6 p-4 bg-gray-700 rounded-lg'>
        <p className='text-white font-medium'>Score Total: {totalScore}/20</p>
        <p className='text-gray-300'>{getInterpretation(totalScore)}</p>
      </div>

      <Button
        onClick={handleSave}
        className='w-full bg-blue-600 hover:bg-blue-700'
      >
        Salvar no Prontuário
      </Button>
    </div>
  )
}

// Escala de Bristol
const BristolCalculator = ({ onSave }: { onSave: (result: any) => void }) => {
  const [selectedType, setSelectedType] = useState('')
  const [observations, setObservations] = useState('')

  const bristolTypes = [
    {
      type: '1',
      description: 'Pedaços duros separados, como nozes (difícil de passar)',
      interpretation: 'Constipação severa',
    },
    {
      type: '2',
      description: 'Em forma de salsicha, mas segmentada',
      interpretation: 'Constipação leve',
    },
    {
      type: '3',
      description: 'Como uma salsicha, mas com rachaduras na superfície',
      interpretation: 'Normal',
    },
    {
      type: '4',
      description: 'Como uma salsicha ou serpente, lisa e macia',
      interpretation: 'Normal',
    },
    {
      type: '5',
      description: 'Pedaços macios com bordas bem definidas',
      interpretation: 'Falta de fibras',
    },
    {
      type: '6',
      description: 'Pedaços fofos com bordas irregulares, fezes pastosas',
      interpretation: 'Diarreia leve',
    },
    {
      type: '7',
      description: 'Aquosa, sem pedaços sólidos, completamente líquida',
      interpretation: 'Diarreia severa',
    },
  ]

  const handleSave = () => {
    if (!selectedType) return

    const selectedBristol = bristolTypes.find(t => t.type === selectedType)
    const result = {
      calculatorName: 'Escala de Bristol',
      type: selectedType,
      description: selectedBristol?.description,
      interpretation: selectedBristol?.interpretation,
      observations,
      timestamp: new Date().toISOString(),
    }
    onSave(result)
  }

  return (
    <div className='space-y-4'>
      <div>
        <Label className='text-white mb-2 block'>
          Tipo de Fezes (Escala de Bristol)
        </Label>
        <Select onValueChange={setSelectedType}>
          <SelectTrigger className='bg-gray-700 border-gray-600 text-white'>
            <SelectValue placeholder='Selecione o tipo' />
          </SelectTrigger>
          <SelectContent>
            {bristolTypes.map(type => (
              <SelectItem key={type.type} value={type.type}>
                Tipo {type.type}: {type.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedType && (
        <div className='p-4 bg-gray-700 rounded-lg'>
          <p className='text-white font-medium'>Tipo {selectedType}</p>
          <p className='text-gray-300'>
            {bristolTypes.find(t => t.type === selectedType)?.interpretation}
          </p>
        </div>
      )}

      <div>
        <Label className='text-white mb-2 block'>Observações</Label>
        <Textarea
          value={observations}
          onChange={e => setObservations(e.target.value)}
          placeholder='Observações adicionais...'
          className='bg-gray-700 border-gray-600 text-white placeholder-gray-400'
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={!selectedType}
        className='w-full bg-blue-600 hover:bg-blue-700'
      >
        Salvar no Prontuário
      </Button>
    </div>
  )
}

// Placeholder para outras calculadoras
const GenericCalculator = ({
  calculatorName,
  onSave,
}: {
  calculatorName: string
  onSave: (result: any) => void
}) => {
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState('')

  const handleSave = () => {
    const calculatorResult = {
      calculatorName,
      result,
      notes,
      timestamp: new Date().toISOString(),
    }
    onSave(calculatorResult)
  }

  return (
    <div className='space-y-4'>
      <div className='p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg'>
        <p className='text-yellow-400 text-sm'>
          Esta calculadora está em desenvolvimento. Use os campos abaixo para
          registrar manualmente os resultados.
        </p>
      </div>

      <div>
        <Label className='text-white mb-2 block'>Resultado</Label>
        <Input
          value={result}
          onChange={e => setResult(e.target.value)}
          placeholder='Digite o resultado calculado'
          className='bg-gray-700 border-gray-600 text-white placeholder-gray-400'
        />
      </div>

      <div>
        <Label className='text-white mb-2 block'>Observações</Label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder='Observações e detalhes do cálculo...'
          className='bg-gray-700 border-gray-600 text-white placeholder-gray-400'
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={!result}
        className='w-full bg-blue-600 hover:bg-blue-700'
      >
        Salvar no Prontuário
      </Button>
    </div>
  )
}

export default function MedicalCalculators({
  patientName,
  onSaveToRecord,
}: MedicalCalculatorsProps) {
  const [selectedCalculator, setSelectedCalculator] = useState<
    CalculatorType | ''
  >('')
  const [savedResults, setSavedResults] = useState<any[]>([])

  const handleSaveResult = (result: any) => {
    setSavedResults(prev => [...prev, result])
    onSaveToRecord?.(result.calculatorName, result)

    // Show success message
    alert(`${result.calculatorName} salvo no prontuário de ${patientName}!`)
  }

  const renderCalculator = () => {
    switch (selectedCalculator) {
      case 'wexner':
        return <WexnerCalculator onSave={handleSaveResult} />
      case 'bristol':
        return <BristolCalculator onSave={handleSaveResult} />
      case 'st-marks':
        return (
          <StMarksCalculator onSaveResult={handleSaveResult} darkMode={true} />
        )
      case 'pac-sym':
        return (
          <PacScoresCalculator
            onSaveResult={handleSaveResult}
            darkMode={true}
          />
        )
      case 'roma-iv':
        return (
          <RomaIVCalculator onSaveResult={handleSaveResult} darkMode={true} />
        )
      case 'ibdq':
        return (
          <IBDQCalculator onSaveResult={handleSaveResult} darkMode={true} />
        )
      case 'constipacao':
        return (
          <ConstipacaoCalculator
            onSaveResult={handleSaveResult}
            darkMode={true}
          />
        )
      case 'cdai':
        return (
          <CDAICalculator onSaveResult={handleSaveResult} darkMode={true} />
        )
      case 'bmi':
        return <BMICalculator onSave={handleSaveResult} />
      case 'harvey-bradshaw':
        return (
          <HarveyBradshawCalculator
            onSaveResult={handleSaveResult}
            darkMode={true}
          />
        )
      case 'truelove-witts':
        return (
          <TrueloveWittsCalculator
            onSaveResult={handleSaveResult}
            darkMode={true}
          />
        )
      default:
        if (selectedCalculator) {
          const calculator = calculatorOptions.find(
            c => c.value === selectedCalculator
          )
          return (
            <GenericCalculator
              calculatorName={calculator?.label || ''}
              onSave={handleSaveResult}
            />
          )
        }
        return null
    }
  }

  return (
    <Card className='bg-gray-800/60 border-gray-700'>
      <CardHeader>
        <CardTitle className='text-white flex items-center'>
          <CalculatorIcon className='h-5 w-5 mr-2' />
          Calculadoras Médicas
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label className='text-white mb-2 block'>
            Escolha uma calculadora
          </Label>
          <Select
            onValueChange={value =>
              setSelectedCalculator(value as CalculatorType)
            }
          >
            <SelectTrigger className='bg-gray-700 border-gray-600 text-white'>
              <SelectValue placeholder='Selecione uma calculadora' />
            </SelectTrigger>
            <SelectContent>
              {calculatorOptions.map(option => (
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
                calculatorOptions.find(c => c.value === selectedCalculator)
                  ?.label
              }
            </h3>
            {renderCalculator()}
          </div>
        )}

        {savedResults.length > 0 && (
          <div className='mt-6'>
            <h4 className='text-white font-medium mb-2'>
              Resultados Salvos nesta Sessão:
            </h4>
            <div className='space-y-2'>
              {savedResults.map((result, index) => (
                <div key={index} className='p-3 bg-gray-700 rounded-lg'>
                  <p className='text-white font-medium'>
                    {result.calculatorName}
                  </p>
                  <p className='text-gray-300 text-sm'>
                    {new Date(result.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
