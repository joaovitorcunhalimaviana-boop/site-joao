'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function UCEISPage() {
  const router = useRouter()
  const [scores, setScores] = useState({
    vascularPattern: '',
    bleeding: '',
    erosionsUlcers: '',
  })

  const calculateUCEIS = () => {
    const vascular = parseInt(scores.vascularPattern) || 0
    const bleeding = parseInt(scores.bleeding) || 0
    const erosions = parseInt(scores.erosionsUlcers) || 0

    return vascular + bleeding + erosions
  }

  const getInterpretation = (score: number) => {
    if (score <= 1)
      return {
        level: 'Remissão',
        color: 'text-green-600',
        description: 'Atividade endoscópica mínima ou ausente',
      }
    if (score <= 4)
      return {
        level: 'Atividade Leve',
        color: 'text-yellow-600',
        description: 'Atividade endoscópica leve',
      }
    if (score <= 6)
      return {
        level: 'Atividade Moderada',
        color: 'text-orange-600',
        description: 'Atividade endoscópica moderada',
      }
    return {
      level: 'Atividade Severa',
      color: 'text-red-600',
      description: 'Atividade endoscópica severa',
    }
  }

  const totalScore = calculateUCEIS()
  const interpretation = getInterpretation(totalScore)

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex items-center mb-8'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='text-white hover:bg-white/10 mr-4'
          >
            <ArrowLeftIcon className='h-5 w-5 mr-2' />
            Voltar
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-white mb-2'>
              UCEIS - Ulcerative Colitis Endoscopic Index of Severity
            </h1>
            <p className='text-gray-200'>
              Índice endoscópico de severidade da colite ulcerativa
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Formulário */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>Parâmetros UCEIS</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <label className='text-gray-700 font-medium block mb-3'>
                  Padrão Vascular (0-2)
                </label>
                <Select
                  value={scores.vascularPattern}
                  onValueChange={value =>
                    setScores({ ...scores, vascularPattern: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o padrão vascular' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>
                      0 - Normal: padrão vascular claro com arborização
                    </SelectItem>
                    <SelectItem value='1'>
                      1 - Parcialmente obscurecido
                    </SelectItem>
                    <SelectItem value='2'>
                      2 - Completamente obscurecido
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='text-gray-700 font-medium block mb-3'>
                  Sangramento (0-3)
                </label>
                <Select
                  value={scores.bleeding}
                  onValueChange={value =>
                    setScores({ ...scores, bleeding: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o grau de sangramento' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>0 - Ausente</SelectItem>
                    <SelectItem value='1'>
                      1 - Mucosa com sangue na luz
                    </SelectItem>
                    <SelectItem value='2'>
                      2 - Sangramento leve ao toque
                    </SelectItem>
                    <SelectItem value='3'>
                      3 - Sangramento espontâneo à frente do endoscópio
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='text-gray-700 font-medium block mb-3'>
                  Erosões e Úlceras (0-3)
                </label>
                <Select
                  value={scores.erosionsUlcers}
                  onValueChange={value =>
                    setScores({ ...scores, erosionsUlcers: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o grau de erosões/úlceras' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>0 - Ausente</SelectItem>
                    <SelectItem value='1'>
                      1 - Erosões (defeito &lt;5mm)
                    </SelectItem>
                    <SelectItem value='2'>
                      2 - Úlceras superficiais (defeito &ge;5mm)
                    </SelectItem>
                    <SelectItem value='3'>
                      3 - Úlceras profundas (escavadas)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-gray-800 mb-2'>
                  Pontuação Atual:
                </h3>
                <div className='space-y-1 text-sm'>
                  <div>Padrão Vascular: {scores.vascularPattern || '0'}</div>
                  <div>Sangramento: {scores.bleeding || '0'}</div>
                  <div>Erosões/Úlceras: {scores.erosionsUlcers || '0'}</div>
                  <div className='font-semibold pt-2 border-t'>
                    Total: {totalScore}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>Resultado UCEIS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center mb-6'>
                <div className='text-6xl font-bold text-gray-600 mb-2'>
                  {totalScore}
                </div>
                <div
                  className={`text-xl font-semibold ${interpretation.color} mb-2`}
                >
                  {interpretation.level}
                </div>
                <p className='text-gray-600'>{interpretation.description}</p>
              </div>

              <div className='space-y-4'>
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-blue-800 mb-2'>
                    Interpretação:
                  </h3>
                  <ul className='text-sm text-blue-700 space-y-1'>
                    <li>• 0-1: Remissão endoscópica</li>
                    <li>• 2-4: Atividade leve</li>
                    <li>• 5-6: Atividade moderada</li>
                    <li>• 7-8: Atividade severa</li>
                  </ul>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-800 mb-2'>
                    Sobre o UCEIS:
                  </h3>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Validado para colite ulcerativa</li>
                    <li>• Boa correlação inter-observador</li>
                    <li>• Útil para ensaios clínicos</li>
                    <li>• Preditor de resposta terapêutica</li>
                  </ul>
                </div>

                <div className='bg-yellow-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-yellow-800 mb-2'>
                    Nota Importante:
                  </h3>
                  <p className='text-sm text-yellow-700'>
                    O UCEIS deve ser aplicado no segmento mais severamente
                    afetado durante a colonoscopia.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
