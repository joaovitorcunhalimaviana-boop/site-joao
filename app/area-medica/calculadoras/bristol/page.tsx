'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../../components/ui/header'
import BackgroundPattern from '../../../../components/ui/background-pattern'
import { Button } from '../../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card'
import {
  ArrowLeftIcon,
  PrinterIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

interface BristolType {
  type: number
  name: string
  description: string
  characteristics: string
  image: string
}

const bristolTypes: BristolType[] = [
  {
    type: 1,
    name: 'Tipo 1',
    description: 'Pedaços duros e separados, como nozes',
    characteristics: 'Constipação severa - Tempo de trânsito muito longo',
    image: '🔴',
  },
  {
    type: 2,
    name: 'Tipo 2',
    description: 'Em forma de salsicha, mas segmentada',
    characteristics: 'Constipação leve - Tempo de trânsito longo',
    image: '🟠',
  },
  {
    type: 3,
    name: 'Tipo 3',
    description: 'Como salsicha, mas com rachaduras na superfície',
    characteristics: 'Normal (tendendo à constipação)',
    image: '🟡',
  },
  {
    type: 4,
    name: 'Tipo 4',
    description: 'Como salsicha ou cobra, lisa e macia',
    characteristics: 'Normal - Ideal',
    image: '🟢',
  },
  {
    type: 5,
    name: 'Tipo 5',
    description: 'Pedaços macios com bordas bem definidas',
    characteristics: 'Normal (tendendo à diarreia)',
    image: '🔵',
  },
  {
    type: 6,
    name: 'Tipo 6',
    description: 'Pedaços fofos com bordas irregulares',
    characteristics: 'Diarreia leve - Tempo de trânsito rápido',
    image: '🟣',
  },
  {
    type: 7,
    name: 'Tipo 7',
    description: 'Aquosa, sem pedaços sólidos',
    characteristics: 'Diarreia severa - Tempo de trânsito muito rápido',
    image: '🟤',
  },
]

export default function BristolScalePage() {
  const [selectedType, setSelectedType] = useState<number | null>(null)
  const router = useRouter()

  const handlePrint = () => {
    window.print()
  }

  const handleReset = () => {
    setSelectedType(null)
  }

  const getInterpretation = (type: number) => {
    if (type <= 2) {
      return {
        category: 'Constipação',
        severity: type === 1 ? 'Severa' : 'Leve',
        color: 'text-red-400',
        bgColor: 'bg-red-900 bg-opacity-20 border-red-700',
        recommendations: [
          'Aumentar ingesta de fibras',
          'Aumentar ingesta hídrica',
          'Exercícios físicos regulares',
          'Considerar laxantes se necessário',
        ],
      }
    } else if (type >= 3 && type <= 5) {
      return {
        category: 'Normal',
        severity: type === 4 ? 'Ideal' : 'Aceitável',
        color: 'text-green-400',
        bgColor: 'bg-green-900 bg-opacity-20 border-green-700',
        recommendations: [
          'Manter hábitos alimentares atuais',
          'Continuar hidratação adequada',
          'Manter atividade física regular',
        ],
      }
    } else {
      return {
        category: 'Diarreia',
        severity: type === 7 ? 'Severa' : 'Leve',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900 bg-opacity-20 border-yellow-700',
        recommendations: [
          'Hidratação adequada',
          'Dieta BRAT (banana, arroz, maçã, torrada)',
          'Evitar alimentos irritantes',
          'Procurar avaliação médica se persistir',
        ],
      }
    }
  }

  return (
    <div className='min-h-screen bg-black'>
      <Header />
      <BackgroundPattern />

      <div className='relative isolate'>
        <div className='pt-20 pb-8'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='max-w-6xl mx-auto'>
              {/* Header */}
              <div className='flex items-center justify-between mb-8'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700'>
                    <ClipboardDocumentListIcon className='w-8 h-8 text-blue-400' />
                  </div>
                  <div>
                    <h1 className='text-4xl font-bold text-white'>
                      Escala de Bristol
                    </h1>
                    <p className='text-gray-300 text-lg mt-2'>
                      Classificação da consistência das fezes
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Button
                    variant='outline'
                    onClick={() => router.push('/area-medica/calculadoras')}
                    className='flex items-center gap-2 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-900/50'
                  >
                    <ArrowLeftIcon className='h-4 w-4' />
                    Voltar
                  </Button>
                  <Button
                    onClick={handlePrint}
                    variant='outline'
                    className='flex items-center gap-2 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-900/50'
                  >
                    <PrinterIcon className='h-4 w-4' />
                    Imprimir
                  </Button>
                  <Button
                    onClick={handleReset}
                    className='flex items-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white'
                  >
                    <ArrowPathIcon className='h-4 w-4 mr-2' />
                    Limpar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Informações sobre a escala */}
        <Card className='mb-8 bg-gray-800 border-gray-700'>
          <CardHeader>
            <CardTitle className='text-white'>
              Sobre a Escala de Bristol
            </CardTitle>
            <CardDescription className='text-gray-300'>
              A Escala de Bristol é uma ferramenta médica desenvolvida na
              Universidade de Bristol para classificar a forma das fezes humanas
              em sete categorias. É amplamente utilizada em medicina e pesquisa
              para avaliar o tempo de trânsito intestinal.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tipos de Bristol */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
          {bristolTypes.map(type => (
            <Card
              key={type.type}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedType === type.type
                  ? 'bg-blue-900 border-blue-600 ring-2 ring-blue-500'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedType(type.type)}
            >
              <CardContent className='p-4'>
                <div className='text-center mb-3'>
                  <div className='text-4xl mb-2'>{type.image}</div>
                  <h3 className='text-lg font-semibold text-white'>
                    {type.name}
                  </h3>
                </div>
                <p className='text-sm text-gray-300 mb-2 text-center'>
                  {type.description}
                </p>
                <p className='text-xs text-gray-400 text-center'>
                  {type.characteristics}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resultado */}
        {selectedType && (
          <Card className='bg-gray-800 border-gray-700'>
            <CardHeader>
              <CardTitle className='text-white'>
                Interpretação - Tipo {selectedType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const interpretation = getInterpretation(selectedType)
                return (
                  <div>
                    <div
                      className={`p-4 rounded-lg border mb-6 ${interpretation.bgColor}`}
                    >
                      <div className='flex items-center justify-between mb-4'>
                        <div>
                          <h3
                            className={`text-xl font-bold ${interpretation.color}`}
                          >
                            {interpretation.category}
                          </h3>
                          <p className='text-gray-300'>
                            Severidade: {interpretation.severity}
                          </p>
                        </div>
                        <div className='text-4xl'>
                          {
                            bristolTypes.find(t => t.type === selectedType)
                              ?.image
                          }
                        </div>
                      </div>

                      <div className='mb-4'>
                        <h4 className='text-white font-semibold mb-2'>
                          Descrição:
                        </h4>
                        <p className='text-gray-300'>
                          {
                            bristolTypes.find(t => t.type === selectedType)
                              ?.description
                          }
                        </p>
                      </div>

                      <div>
                        <h4 className='text-white font-semibold mb-2'>
                          Recomendações:
                        </h4>
                        <ul className='text-gray-300 space-y-1'>
                          {interpretation.recommendations.map((rec, index) => (
                            <li key={index} className='flex items-start'>
                              <span className='text-blue-400 mr-2'>•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className='bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700 p-4'>
                      <p className='text-sm text-blue-200'>
                        <strong>Nota Clínica:</strong> A Escala de Bristol é uma
                        ferramenta de avaliação. Mudanças persistentes no padrão
                        intestinal devem ser avaliadas por um profissional de
                        saúde.
                      </p>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {!selectedType && (
          <Card className='bg-gray-800 border-gray-700'>
            <CardContent className='p-8 text-center'>
              <p className='text-gray-400 text-lg'>
                Selecione um tipo acima para ver a interpretação
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
