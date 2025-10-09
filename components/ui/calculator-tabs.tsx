'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calculator,
  ArrowLeft,
  Save,
  FileText,
  User,
  ChevronDown,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Import calculator components
import WexnerCalculator from '../calculators/wexner-calculator'
import PacScoresCalculator from '../calculators/pac-scores-calculator'
import RomaIVCalculator from '../calculators/roma-iv-calculator'
import MayoCalculator from '../calculators/mayo-calculator'
import BaronCalculator from '../calculators/baron-calculator'
import StMarksCalculator from '../calculators/st-marks-calculator'
import IBDQCalculator from '../calculators/ibdq-calculator'
import BristolCalculator from '../calculators/bristol-calculator'
import ConstipacaoCalculator from '../calculators/constipacao-calculator'
import CDAICalculator from '../calculators/cdai-calculator'
import HarveyBradshawCalculator from '../calculators/harvey-bradshaw-calculator'
import TrueloveWittsCalculator from '../calculators/truelove-witts-calculator'
import JNETCalculator from '../calculators/jnet-calculator'
import UCEISCalculator from '../calculators/uceis-calculator'
import KudoCalculator from '../calculators/kudo-calculator'
import ParisCalculator from '../calculators/paris-calculator'
import BostonCalculator from '../calculators/boston-calculator'

interface Calculator {
  id: string
  name: string
  description: string
  category: 'clinical' | 'endoscopic'
  component: React.ComponentType<any>
}

const calculators: Calculator[] = [
  // Escalas Clínicas
  {
    id: 'wexner',
    name: 'Score de Wexner',
    description: 'Avaliação da incontinência fecal',
    category: 'clinical',
    component: WexnerCalculator,
  },
  {
    id: 'st-marks',
    name: "Escala de St. Mark's",
    description: 'Avaliação da incontinência anal',
    category: 'clinical',
    component: StMarksCalculator,
  },
  {
    id: 'pac-scores',
    name: 'PAC-SYM & PAC-QOL',
    description: 'Avaliação de sintomas e qualidade de vida',
    category: 'clinical',
    component: PacScoresCalculator,
  },
  {
    id: 'roma-iv',
    name: 'Roma IV',
    description: 'Critérios para Síndrome do Intestino Irritável',
    category: 'clinical',
    component: RomaIVCalculator,
  },
  {
    id: 'ibdq',
    name: 'IBDQ',
    description: 'Inflammatory Bowel Disease Questionnaire',
    category: 'clinical',
    component: IBDQCalculator,
  },
  {
    id: 'bristol',
    name: 'Escala de Bristol',
    description: 'Classificação da forma das fezes',
    category: 'clinical',
    component: BristolCalculator,
  },
  {
    id: 'constipacao',
    name: 'Escala de Constipação',
    description: 'Avaliação de sintomas de constipação',
    category: 'clinical',
    component: ConstipacaoCalculator,
  },
  {
    id: 'cdai',
    name: 'CDAI',
    description: "Crohn's Disease Activity Index",
    category: 'clinical',
    component: CDAICalculator,
  },
  {
    id: 'harvey-bradshaw',
    name: 'Harvey-Bradshaw Index',
    description: 'Avaliação simplificada da atividade da Doença de Crohn',
    category: 'clinical',
    component: HarveyBradshawCalculator,
  },
  {
    id: 'truelove-witts',
    name: 'Truelove-Witts',
    description: 'Critérios de gravidade da colite ulcerativa aguda',
    category: 'clinical',
    component: TrueloveWittsCalculator,
  },
  // Escalas Endoscópicas
  {
    id: 'mayo',
    name: 'Mayo Endoscopic Score',
    description: 'Avaliação endoscópica da colite ulcerativa',
    category: 'endoscopic',
    component: MayoCalculator,
  },
  {
    id: 'baron',
    name: 'Baron Score',
    description: 'Classificação endoscópica da colite ulcerativa',
    category: 'endoscopic',
    component: BaronCalculator,
  },
  {
    id: 'jnet',
    name: 'J-NET',
    description: 'Japan NBI Expert Team Classification',
    category: 'endoscopic',
    component: JNETCalculator,
  },
  {
    id: 'uceis',
    name: 'UCEIS',
    description: 'Ulcerative Colitis Endoscopic Index of Severity',
    category: 'endoscopic',
    component: UCEISCalculator,
  },
  {
    id: 'kudo',
    name: 'Kudo',
    description: 'Classificação de Kudo para Padrão de Criptas',
    category: 'endoscopic',
    component: KudoCalculator,
  },
  {
    id: 'paris',
    name: 'Paris',
    description: 'Classificação de Paris para Lesões Superficiais',
    category: 'endoscopic',
    component: ParisCalculator,
  },
  {
    id: 'boston',
    name: 'Boston',
    description: 'Escala de Boston para Preparo Intestinal',
    category: 'endoscopic',
    component: BostonCalculator,
  },
]

interface CalculatorTabsProps {
  onSaveToRecord?: (
    calculatorId: string,
    result: any,
    patientId?: string
  ) => void
}

export default function CalculatorTabs({
  onSaveToRecord,
}: CalculatorTabsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [activeCalculator, setActiveCalculator] = useState<string>('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [calculatorResult, setCalculatorResult] = useState<any>(null)
  const router = useRouter()

  const activeCalc = calculators.find(calc => calc.id === activeCalculator)
  const ActiveComponent = activeCalc?.component

  // Filtrar calculadoras por categoria selecionada
  const filteredCalculators = selectedCategory
    ? calculators.filter(calc => calc.category === selectedCategory)
    : []

  const handleSaveResult = (result: any) => {
    setCalculatorResult(result)
    setShowSaveModal(true)
  }

  const confirmSaveToRecord = (patientId: string) => {
    if (onSaveToRecord && calculatorResult) {
      onSaveToRecord(activeCalculator, calculatorResult, patientId)
      setShowSaveModal(false)
      setCalculatorResult(null)
    }
  }

  return (
    <div className='min-h-screen'>
      <div className='relative isolate'>
        <div className='pt-8 pb-8'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            {/* Action Bar */}
            <div className='flex items-center justify-end mb-8'>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  onClick={() => router.push('/area-medica')}
                  className='flex items-center gap-2 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-900/50'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Voltar
                </Button>
              </div>
            </div>

            {/* Calculator Selection */}
            <div className='mb-8'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Category Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    1. Escolha o Tipo de Escala:
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={value => {
                      setSelectedCategory(value)
                      setActiveCalculator('') // Reset calculator selection
                    }}
                  >
                    <SelectTrigger className='w-full bg-gray-900/50 backdrop-blur-sm border-gray-700 text-white hover:bg-gray-800/50'>
                      <div className='flex items-center gap-2'>
                        <Calculator className='h-4 w-4 text-blue-400' />
                        <SelectValue placeholder='Selecione o tipo' />
                      </div>
                    </SelectTrigger>
                    <SelectContent className='bg-gray-900 border-gray-700'>
                      <SelectItem
                        value='clinical'
                        className='text-white hover:bg-gray-800 focus:bg-gray-800'
                      >
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-blue-400' />
                          <span>Escalas Clínicas</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value='endoscopic'
                        className='text-white hover:bg-gray-800 focus:bg-gray-800'
                      >
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-green-400' />
                          <span>Escalas Endoscópicas</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Calculator Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    2. Selecione a Calculadora:
                  </label>
                  <Select
                    value={activeCalculator}
                    onValueChange={setActiveCalculator}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger
                      className={`w-full bg-gray-900/50 backdrop-blur-sm border-gray-700 text-white hover:bg-gray-800/50 ${
                        !selectedCategory ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className='flex items-center gap-2'>
                        <Calculator className='h-4 w-4 text-blue-400' />
                        <SelectValue
                          placeholder={
                            selectedCategory
                              ? 'Escolha uma calculadora'
                              : 'Primeiro selecione o tipo'
                          }
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent className='bg-gray-900 border-gray-700'>
                      {filteredCalculators.map(calc => (
                        <SelectItem
                          key={calc.id}
                          value={calc.id}
                          className='text-white hover:bg-gray-800 focus:bg-gray-800'
                        >
                          <div className='flex flex-col'>
                            <span className='font-medium'>{calc.name}</span>
                            <span className='text-xs text-gray-400'>
                              {calc.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selected Calculator Info */}
              {activeCalc && (
                <div className='mt-4 flex items-center gap-4 p-3 bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-lg'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        activeCalc.category === 'clinical'
                          ? 'bg-blue-400'
                          : 'bg-green-400'
                      }`}
                    />
                    <span className='text-sm text-gray-300 uppercase tracking-wide'>
                      {activeCalc.category === 'clinical'
                        ? 'Escala Clínica'
                        : 'Escala Endoscópica'}
                    </span>
                  </div>
                  <div className='h-4 w-px bg-gray-600' />
                  <div>
                    <span className='font-medium text-white'>
                      {activeCalc.name}
                    </span>
                    <span className='text-gray-400 ml-2'>•</span>
                    <span className='text-gray-400 ml-2'>
                      {activeCalc.description}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Calculator Content */}
            {activeCalc && (
              <div className='bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6'>
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-white mb-2'>
                    {activeCalc.name}
                  </h2>
                  <p className='text-gray-300'>{activeCalc.description}</p>
                </div>

                {ActiveComponent && (
                  <ActiveComponent
                    onSaveResult={handleSaveResult}
                    darkMode={true}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save to Record Modal */}
      {showSaveModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <Card className='w-full max-w-md bg-gray-900 border-gray-700'>
            <CardHeader>
              <CardTitle className='text-white flex items-center gap-2'>
                <Save className='h-5 w-5' />
                Salvar no Prontuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-300 mb-4'>
                Deseja salvar o resultado desta calculadora no prontuário de um
                paciente?
              </p>

              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  onClick={() => setShowSaveModal(false)}
                  className='flex-1 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800'
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Implementar seleção de paciente
                    confirmSaveToRecord('patient-id')
                  }}
                  className='flex-1 bg-blue-600 hover:bg-blue-700 text-white'
                >
                  <User className='h-4 w-4 mr-2' />
                  Selecionar Paciente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
