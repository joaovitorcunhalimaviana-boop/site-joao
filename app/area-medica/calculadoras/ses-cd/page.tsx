'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function SESCDPage() {
  const router = useRouter()
  const [scores, setScores] = useState({
    ulceration: '',
    extent: '',
    narrowing: '',
    segments: 5, // Número de segmentos avaliados
  })

  const calculateSESCD = () => {
    const ulceration = parseInt(scores.ulceration) || 0
    const extent = parseInt(scores.extent) || 0
    const narrowing = parseInt(scores.narrowing) || 0
    const segments = parseInt(scores.segments.toString()) || 5

    return (ulceration + extent + narrowing) * segments
  }

  const getInterpretation = (score: number) => {
    if (score === 0)
      return {
        level: 'Remissão',
        color: 'text-green-600',
        description: 'Ausência de atividade endoscópica',
      }
    if (score <= 6)
      return {
        level: 'Atividade Leve',
        color: 'text-yellow-600',
        description: 'Atividade endoscópica leve',
      }
    if (score <= 15)
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

  const totalScore = calculateSESCD()
  const interpretation = getInterpretation(totalScore)

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4'>
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
              SES-CD - Simple Endoscopic Score for Crohn's Disease
            </h1>
            <p className='text-blue-200'>
              Avaliação endoscópica da atividade da doença de Crohn
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Formulário */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>
                Parâmetros Endoscópicos
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <Label
                  htmlFor='ulceration'
                  className='text-gray-700 font-medium'
                >
                  Ulceração (0-3)
                </Label>
                <Select
                  value={scores.ulceration}
                  onValueChange={value =>
                    setScores({ ...scores, ulceration: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o grau de ulceração' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>0 - Ausente</SelectItem>
                    <SelectItem value='1'>
                      1 - Úlceras aftosas (≤5mm)
                    </SelectItem>
                    <SelectItem value='2'>
                      2 - Úlceras grandes (&gt;5mm)
                    </SelectItem>
                    <SelectItem value='3'>
                      3 - Úlceras muito grandes (&gt;2cm)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='extent' className='text-gray-700 font-medium'>
                  Extensão da Superfície Ulcerada (0-3)
                </Label>
                <Select
                  value={scores.extent}
                  onValueChange={value =>
                    setScores({ ...scores, extent: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione a extensão' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>0 - Ausente</SelectItem>
                    <SelectItem value='1'>1 - &lt;10% da superfície</SelectItem>
                    <SelectItem value='2'>2 - 10-30% da superfície</SelectItem>
                    <SelectItem value='3'>3 - &gt;30% da superfície</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor='narrowing'
                  className='text-gray-700 font-medium'
                >
                  Estreitamento (0-3)
                </Label>
                <Select
                  value={scores.narrowing}
                  onValueChange={value =>
                    setScores({ ...scores, narrowing: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o grau de estreitamento' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>0 - Ausente</SelectItem>
                    <SelectItem value='1'>
                      1 - Estreitamento único, passível de transposição
                    </SelectItem>
                    <SelectItem value='2'>
                      2 - Estreitamentos múltiplos, passíveis de transposição
                    </SelectItem>
                    <SelectItem value='3'>
                      3 - Estreitamento não transponível
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='segments' className='text-gray-700 font-medium'>
                  Número de Segmentos Avaliados
                </Label>
                <Input
                  id='segments'
                  type='number'
                  min='1'
                  max='5'
                  value={scores.segments}
                  onChange={e =>
                    setScores({
                      ...scores,
                      segments: parseInt(e.target.value) || 5,
                    })
                  }
                  className='mt-1'
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Segmentos: íleo, cólon direito, cólon transverso, cólon
                  esquerdo, reto
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>Resultado SES-CD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center mb-6'>
                <div className='text-6xl font-bold text-blue-600 mb-2'>
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
                    <li>• 0: Remissão endoscópica</li>
                    <li>• 1-6: Atividade leve</li>
                    <li>• 7-15: Atividade moderada</li>
                    <li>• ≥16: Atividade severa</li>
                  </ul>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-800 mb-2'>Fórmula:</h3>
                  <p className='text-sm text-gray-600'>
                    SES-CD = (Ulceração + Extensão + Estreitamento) × Número de
                    segmentos
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
