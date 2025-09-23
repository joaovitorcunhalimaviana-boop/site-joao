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

export default function MayoEndoscopicPage() {
  const router = useRouter()
  const [endoscopicScore, setEndoscopicScore] = useState('')

  const getInterpretation = (score: number) => {
    switch (score) {
      case 0:
        return {
          level: 'Normal ou Remissão',
          color: 'text-green-600',
          description:
            'Mucosa normal ou inativa, eritema leve, diminuição do padrão vascular, leve friabilidade',
        }
      case 1:
        return {
          level: 'Doença Leve',
          color: 'text-yellow-600',
          description:
            'Eritema, diminuição do padrão vascular, friabilidade leve',
        }
      case 2:
        return {
          level: 'Doença Moderada',
          color: 'text-orange-600',
          description:
            'Eritema acentuado, ausência do padrão vascular, friabilidade, erosões',
        }
      case 3:
        return {
          level: 'Doença Severa',
          color: 'text-red-600',
          description: 'Sangramento espontâneo, ulceração',
        }
      default:
        return {
          level: 'Selecione um valor',
          color: 'text-gray-500',
          description: 'Escolha o subscore endoscópico',
        }
    }
  }

  const score = parseInt(endoscopicScore) || 0
  const interpretation = getInterpretation(score)

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
              Mayo Endoscopic Score
            </h1>
            <p className='text-gray-200'>
              Subscore endoscópico do Mayo para colite ulcerativa
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Formulário */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>
                Avaliação Endoscópica
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <label className='text-gray-700 font-medium block mb-3'>
                  Subscore Endoscópico
                </label>
                <Select
                  value={endoscopicScore}
                  onValueChange={setEndoscopicScore}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o subscore endoscópico' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>0 - Normal ou inativo</SelectItem>
                    <SelectItem value='1'>1 - Doença leve</SelectItem>
                    <SelectItem value='2'>2 - Doença moderada</SelectItem>
                    <SelectItem value='3'>3 - Doença severa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-gray-800 mb-3'>
                  Critérios Detalhados:
                </h3>
                <div className='space-y-3 text-sm'>
                  <div>
                    <span className='font-medium text-green-700'>
                      0 - Normal/Inativo:
                    </span>
                    <p className='text-gray-600 ml-2'>
                      Mucosa normal ou inativa, eritema leve, diminuição do
                      padrão vascular, leve friabilidade
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-yellow-700'>
                      1 - Leve:
                    </span>
                    <p className='text-gray-600 ml-2'>
                      Eritema, diminuição do padrão vascular, friabilidade leve
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-orange-700'>
                      2 - Moderado:
                    </span>
                    <p className='text-gray-600 ml-2'>
                      Eritema acentuado, ausência do padrão vascular,
                      friabilidade, erosões
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-red-700'>
                      3 - Severo:
                    </span>
                    <p className='text-gray-600 ml-2'>
                      Sangramento espontâneo, ulceração
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center mb-6'>
                <div className='text-6xl font-bold text-gray-600 mb-2'>
                  {score}
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
                    Sobre o Mayo Endoscopic Score:
                  </h3>
                  <ul className='text-sm text-blue-700 space-y-1'>
                    <li>• Componente do Mayo Score completo</li>
                    <li>• Avalia atividade endoscópica na colite ulcerativa</li>
                    <li>
                      • Usado para monitoramento da resposta ao tratamento
                    </li>
                    <li>• Correlaciona-se com sintomas clínicos</li>
                  </ul>
                </div>

                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-gray-800 mb-2'>
                    Interpretação Clínica:
                  </h3>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Score 0-1: Remissão endoscópica</li>
                    <li>• Score 2-3: Atividade endoscópica</li>
                    <li>• Meta terapêutica: Score ≤1</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
