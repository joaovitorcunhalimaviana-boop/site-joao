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

export default function JNETPage() {
  const router = useRouter()
  const [classification, setClassification] = useState('')

  const getInterpretation = (type: string) => {
    switch (type) {
      case 'type1':
        return {
          level: 'Tipo 1',
          color: 'text-green-600',
          description: 'Lesão hiperplásica',
          details:
            'Padrão vascular regular ou ausente, superfície lisa, sem depressão',
          histology: 'Pólipo hiperplásico',
          management: 'Pode ser deixado sem ressecção se <10mm',
        }
      case 'type2a':
        return {
          level: 'Tipo 2A',
          color: 'text-yellow-600',
          description: 'Adenoma de baixo grau',
          details:
            'Padrão vascular regular, superfície com padrão tubular/papilar regular',
          histology: 'Adenoma tubular/tubuloviloso de baixo grau',
          management: 'Ressecção endoscópica (polipectomia/EMR)',
        }
      case 'type2b':
        return {
          level: 'Tipo 2B',
          color: 'text-orange-600',
          description: 'Adenoma de alto grau ou carcinoma superficial',
          details:
            'Padrão vascular irregular, superfície irregular, pode ter depressão',
          histology: 'Adenoma de alto grau ou carcinoma in situ/intramucoso',
          management: 'EMR ou ESD dependendo do tamanho',
        }
      case 'type3':
        return {
          level: 'Tipo 3',
          color: 'text-red-600',
          description: 'Carcinoma invasivo',
          details:
            'Padrão vascular amorfo, superfície irregular com áreas avasculares',
          histology: 'Carcinoma com invasão da submucosa profunda',
          management: 'Cirurgia (ressecção segmentar)',
        }
      default:
        return {
          level: 'Selecione um tipo',
          color: 'text-gray-500',
          description: 'Escolha a classificação J-NET',
          details: '',
          histology: '',
          management: '',
        }
    }
  }

  const interpretation = getInterpretation(classification)

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
              Classificação J-NET
            </h1>
            <p className='text-gray-200'>
              Japan NBI Expert Team - Classificação de pólipos colorretais
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Formulário */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>
                Classificação J-NET
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <label className='text-gray-700 font-medium block mb-3'>
                  Tipo de Lesão (NBI)
                </label>
                <Select
                  value={classification}
                  onValueChange={setClassification}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o tipo J-NET' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='type1'>
                      Tipo 1 - Lesão hiperplásica
                    </SelectItem>
                    <SelectItem value='type2a'>
                      Tipo 2A - Adenoma de baixo grau
                    </SelectItem>
                    <SelectItem value='type2b'>
                      Tipo 2B - Adenoma de alto grau/Ca superficial
                    </SelectItem>
                    <SelectItem value='type3'>
                      Tipo 3 - Carcinoma invasivo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-gray-800 mb-3'>
                  Critérios NBI:
                </h3>
                <div className='space-y-3 text-sm'>
                  <div>
                    <span className='font-medium text-green-700'>Tipo 1:</span>
                    <p className='text-gray-600 ml-2'>
                      Padrão vascular regular/ausente, superfície lisa
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-yellow-700'>
                      Tipo 2A:
                    </span>
                    <p className='text-gray-600 ml-2'>
                      Padrão vascular regular, superfície tubular/papilar
                      regular
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-orange-700'>
                      Tipo 2B:
                    </span>
                    <p className='text-gray-600 ml-2'>
                      Padrão vascular irregular, superfície irregular
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-red-700'>Tipo 3:</span>
                    <p className='text-gray-600 ml-2'>
                      Padrão vascular amorfo, áreas avasculares
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-blue-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-blue-800 mb-2'>Sobre NBI:</h3>
                <p className='text-sm text-blue-700'>
                  Narrow Band Imaging (NBI) é uma técnica endoscópica que
                  utiliza filtros de luz para realçar a vascularização e padrões
                  de superfície da mucosa.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>Resultado J-NET</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center mb-6'>
                <div
                  className={`text-4xl font-bold ${interpretation.color} mb-2`}
                >
                  {interpretation.level}
                </div>
                <div className='text-lg font-semibold text-gray-700 mb-2'>
                  {interpretation.description}
                </div>
                {interpretation.details && (
                  <p className='text-gray-600 text-sm'>
                    {interpretation.details}
                  </p>
                )}
              </div>

              {interpretation.histology && (
                <div className='space-y-4'>
                  <div className='bg-purple-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-purple-800 mb-2'>
                      Histologia Esperada:
                    </h3>
                    <p className='text-sm text-purple-700'>
                      {interpretation.histology}
                    </p>
                  </div>

                  <div className='bg-green-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-green-800 mb-2'>
                      Conduta Recomendada:
                    </h3>
                    <p className='text-sm text-green-700'>
                      {interpretation.management}
                    </p>
                  </div>

                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-gray-800 mb-2'>
                      Acurácia Diagnóstica:
                    </h3>
                    <ul className='text-sm text-gray-600 space-y-1'>
                      <li>• Sensibilidade: 85-90% para adenomas</li>
                      <li>
                        • Especificidade: 80-85% para lesões hiperplásicas
                      </li>
                      <li>• VPP para carcinoma invasivo: &gt;90%</li>
                    </ul>
                  </div>

                  <div className='bg-yellow-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-yellow-800 mb-2'>
                      Limitações:
                    </h3>
                    <ul className='text-sm text-yellow-700 space-y-1'>
                      <li>• Requer experiência em NBI</li>
                      <li>
                        • Lesões &lt;5mm podem ser difíceis de classificar
                      </li>
                      <li>• Preparação intestinal deve ser adequada</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
