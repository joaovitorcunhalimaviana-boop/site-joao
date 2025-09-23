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

export default function ParisPage() {
  const router = useRouter()
  const [morphology, setMorphology] = useState('')

  const getInterpretation = (type: string) => {
    switch (type) {
      case '0-ip':
        return {
          level: '0-Ip (Pediculado)',
          color: 'text-blue-600',
          description: 'Lesão polipóide pediculada',
          details: 'Lesão com pedículo bem definido, elevada &gt;2,5mm',
          management: 'Polipectomia com alça',
          risk: 'Baixo risco de invasão submucosa profunda',
        }
      case '0-is':
        return {
          level: '0-Is (Séssil)',
          color: 'text-green-600',
          description: 'Lesão polipóide séssil',
          details: 'Lesão elevada &gt;2,5mm sem pedículo',
          management: 'EMR ou ESD dependendo do tamanho',
          risk: 'Risco baixo a moderado dependendo do tamanho',
        }
      case '0-iia':
        return {
          level: '0-IIa (Plana elevada)',
          color: 'text-yellow-600',
          description: 'Lesão superficial elevada',
          details: 'Lesão ligeiramente elevada &lt;2,5mm',
          management: 'EMR ou ESD',
          risk: 'Risco moderado, requer avaliação cuidadosa',
        }
      case '0-iib':
        return {
          level: '0-IIb (Plana)',
          color: 'text-orange-600',
          description: 'Lesão completamente plana',
          details: 'Lesão sem elevação ou depressão',
          management: 'ESD preferível',
          risk: 'Risco moderado a alto',
        }
      case '0-iic':
        return {
          level: '0-IIc (Deprimida)',
          color: 'text-red-600',
          description: 'Lesão superficial deprimida',
          details: 'Lesão com depressão superficial',
          management: 'ESD obrigatória',
          risk: 'Alto risco de invasão submucosa',
        }
      case '0-iii':
        return {
          level: '0-III (Escavada)',
          color: 'text-red-800',
          description: 'Lesão ulcerada/escavada',
          details: 'Lesão com ulceração profunda',
          management: 'Cirurgia (ressecção segmentar)',
          risk: 'Muito alto risco de invasão profunda',
        }
      default:
        return {
          level: 'Selecione um tipo',
          color: 'text-gray-500',
          description: 'Escolha a morfologia da lesão',
          details: '',
          management: '',
          risk: '',
        }
    }
  }

  const interpretation = getInterpretation(morphology)

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
              Classificação de Paris
            </h1>
            <p className='text-gray-200'>
              Classificação morfológica de lesões colorretais superficiais
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Formulário */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>
                Morfologia da Lesão
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <label className='text-gray-700 font-medium block mb-3'>
                  Tipo Morfológico
                </label>
                <Select value={morphology} onValueChange={setMorphology}>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione a morfologia' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0-ip'>0-Ip - Pediculado</SelectItem>
                    <SelectItem value='0-is'>0-Is - Séssil</SelectItem>
                    <SelectItem value='0-iia'>0-IIa - Plana elevada</SelectItem>
                    <SelectItem value='0-iib'>
                      0-IIb - Completamente plana
                    </SelectItem>
                    <SelectItem value='0-iic'>
                      0-IIc - Superficial deprimida
                    </SelectItem>
                    <SelectItem value='0-iii'>
                      0-III - Escavada/Ulcerada
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-gray-800 mb-3'>
                  Características Morfológicas:
                </h3>
                <div className='space-y-3 text-sm'>
                  <div>
                    <span className='font-medium text-blue-700'>0-Ip:</span>
                    <p className='text-gray-600 ml-2'>
                      Pedículo bem definido, altura &gt;2,5mm
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-green-700'>0-Is:</span>
                    <p className='text-gray-600 ml-2'>
                      Elevada &gt;2,5mm, sem pedículo
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-yellow-700'>0-IIa:</span>
                    <p className='text-gray-600 ml-2'>
                      Ligeiramente elevada &lt;2,5mm
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-orange-700'>0-IIb:</span>
                    <p className='text-gray-600 ml-2'>Completamente plana</p>
                  </div>
                  <div>
                    <span className='font-medium text-red-700'>0-IIc:</span>
                    <p className='text-gray-600 ml-2'>
                      Superficialmente deprimida
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-red-800'>0-III:</span>
                    <p className='text-gray-600 ml-2'>
                      Profundamente escavada/ulcerada
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-blue-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-blue-800 mb-2'>
                  Importância Clínica:
                </h3>
                <p className='text-sm text-blue-700'>
                  A morfologia da lesão correlaciona-se com o risco de invasão
                  submucosa e determina a estratégia terapêutica mais adequada.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>
                Classificação Paris
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center mb-6'>
                <div
                  className={`text-3xl font-bold ${interpretation.color} mb-2`}
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

              {interpretation.management && (
                <div className='space-y-4'>
                  <div className='bg-green-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-green-800 mb-2'>
                      Tratamento Recomendado:
                    </h3>
                    <p className='text-sm text-green-700'>
                      {interpretation.management}
                    </p>
                  </div>

                  <div className='bg-orange-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-orange-800 mb-2'>
                      Risco de Invasão:
                    </h3>
                    <p className='text-sm text-orange-700'>
                      {interpretation.risk}
                    </p>
                  </div>

                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-gray-800 mb-2'>
                      Técnicas de Ressecção:
                    </h3>
                    <ul className='text-sm text-gray-600 space-y-1'>
                      <li>
                        • <strong>Polipectomia:</strong> Lesões pediculadas
                        pequenas
                      </li>
                      <li>
                        • <strong>EMR:</strong> Lesões &lt;20mm, baixo risco
                      </li>
                      <li>
                        • <strong>ESD:</strong> Lesões &gt;20mm, alto risco,
                        morfologia complexa
                      </li>
                      <li>
                        • <strong>Cirurgia:</strong> Lesões não ressecáveis
                        endoscopicamente
                      </li>
                    </ul>
                  </div>

                  <div className='bg-purple-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-purple-800 mb-2'>
                      Fatores de Risco para Invasão Submucosa:
                    </h3>
                    <ul className='text-sm text-purple-700 space-y-1'>
                      <li>• Morfologia deprimida (0-IIc, 0-III)</li>
                      <li>• Tamanho &gt;20mm</li>
                      <li>• Padrão de criptas irregular (Kudo V)</li>
                      <li>• Vascularização irregular (J-NET 2B/3)</li>
                    </ul>
                  </div>

                  <div className='bg-yellow-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-yellow-800 mb-2'>
                      Combinações Morfológicas:
                    </h3>
                    <p className='text-sm text-yellow-700'>
                      Lesões podem apresentar morfologia mista (ex: 0-IIa+IIc).
                      A presença de componente deprimido sempre indica maior
                      risco.
                    </p>
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
