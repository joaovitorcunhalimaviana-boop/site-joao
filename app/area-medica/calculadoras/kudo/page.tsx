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

export default function KudoPage() {
  const router = useRouter()
  const [pitPattern, setPitPattern] = useState('')

  const getInterpretation = (pattern: string) => {
    switch (pattern) {
      case 'type1':
        return {
          level: 'Tipo I',
          color: 'text-blue-600',
          description: 'Normal ou arredondado',
          details:
            'Criptas regulares em tamanho e arranjo. Observados na mucosa normal',
          histology: 'Mucosa normal',
          management: 'Nenhuma ação necessária',
        }
      case 'type2':
        return {
          level: 'Tipo II',
          color: 'text-green-600',
          description: 'Estrelado',
          details:
            'Abertura das criptas em forma de estrela e com arranjo uniforme. Observados em pólipos hiperplásicos',
          histology: 'Pólipos hiperplásicos (e lesões serrilhadas)',
          management: 'Polipectomia se >10mm',
        }
      case 'type3l':
        return {
          level: 'Tipo III-L',
          color: 'text-yellow-600',
          description: 'Tubular grande',
          details:
            'Criptas cuja abertura luminal tem forma tubular e alongada com arranjo regular. Associado a lesões polipoides',
          histology: 'Adenomas tubulares com baixo grau de displasia',
          management: 'Polipectomia ou EMR',
        }
      case 'type3s':
        return {
          level: 'Tipo III-S',
          color: 'text-yellow-700',
          description: 'Tubular pequeno',
          details:
            'Criptas têm diâmetro menor de sua abertura e com arranjo compactado. Mais frequente em lesões deprimidas',
          histology: 'Adenomas tubulares com baixo grau de displasia',
          management: 'Polipectomia ou EMR',
        }
      case 'type4':
        return {
          level: 'Tipo IV',
          color: 'text-orange-600',
          description: 'Ramificado',
          details:
            'Presença de criptas tortuosas, exuberantes e ramificadas. Associado a lesões protrusas',
          histology: 'Adenomas com componente viloso',
          management: 'Polipectomia ou EMR',
        }
      case 'typevi':
        return {
          level: 'Tipo Vi',
          color: 'text-red-600',
          description: 'Desestruturado irregular',
          details:
            'Padrão mais estruturado de criptas irregulares ou encobertas. Observado em adenomas com displasia de alto grau',
          histology:
            'Adenomas com displasia de alto grau ou carcinoma com mínima invasão da submucosa',
          management: 'EMR ou ESD',
        }
      case 'typevn':
        return {
          level: 'Tipo Vn',
          color: 'text-red-700',
          description: 'Desestruturado não-estrutural',
          details:
            'Superfície da lesão rugosa e exibe ulcerações. Há apagamento das criptas. Carcinomas não precoces',
          histology: 'Carcinomas não precoces',
          management: 'Ressecção cirúrgica',
        }
      default:
        return {
          level: 'Selecione um padrão',
          color: 'text-gray-500',
          description: 'Escolha o padrão de criptas (pit pattern)',
          details: '',
          histology: '',
          management: '',
        }
    }
  }

  const interpretation = getInterpretation(pitPattern)

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
              Classificação de Kudo
            </h1>
            <p className='text-gray-200'>
              Classificação de padrões de criptas (pit pattern) para pólipos
              colorretais
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Formulário */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>
                Padrão de Criptas (Pit Pattern)
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <label className='text-gray-700 font-medium block mb-3'>
                  Tipo de Padrão
                </label>
                <Select value={pitPattern} onValueChange={setPitPattern}>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o padrão de criptas' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='type1'>
                      Tipo I - Normal ou arredondado
                    </SelectItem>
                    <SelectItem value='type2'>Tipo II - Estrelado</SelectItem>
                    <SelectItem value='type3l'>
                      Tipo III-L - Tubular grande
                    </SelectItem>
                    <SelectItem value='type3s'>
                      Tipo III-S - Tubular pequeno
                    </SelectItem>
                    <SelectItem value='type4'>Tipo IV - Ramificado</SelectItem>
                    <SelectItem value='typevi'>
                      Tipo Vi - Desestruturado irregular
                    </SelectItem>
                    <SelectItem value='typevn'>
                      Tipo Vn - Desestruturado não-estrutural
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-gray-800 mb-3'>
                  Características dos Padrões:
                </h3>
                <div className='space-y-3 text-sm'>
                  <div>
                    <span className='font-medium text-blue-700'>Tipo I:</span>
                    <p className='text-gray-600 ml-2'>
                      Criptas regulares em tamanho e arranjo
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-green-700'>Tipo II:</span>
                    <p className='text-gray-600 ml-2'>
                      Abertura das criptas em forma de estrela
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-yellow-700'>
                      Tipo III-L:
                    </span>
                    <p className='text-gray-600 ml-2'>
                      Criptas com abertura tubular e alongada
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-yellow-800'>
                      Tipo III-S:
                    </span>
                    <p className='text-gray-600 ml-2'>
                      Criptas com menor diâmetro e arranjo compactado
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-orange-700'>
                      Tipo IV:
                    </span>
                    <p className='text-gray-600 ml-2'>
                      Criptas tortuosas, exuberantes e ramificadas
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-red-700'>Tipo Vi:</span>
                    <p className='text-gray-600 ml-2'>
                      Padrão estruturado de criptas irregulares
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-red-800'>Tipo Vn:</span>
                    <p className='text-gray-600 ml-2'>
                      Superfície rugosa com apagamento das criptas
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-blue-50 p-4 rounded-lg'>
                <h3 className='font-semibold text-blue-800 mb-2'>Técnica:</h3>
                <p className='text-sm text-blue-700'>
                  Utiliza magnificação endoscópica com cromoscopia (índigo
                  carmim 0,2-0,4%) para realçar o padrão das criptas na
                  superfície da mucosa.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className='bg-white/95 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-gray-800'>Resultado Kudo</CardTitle>
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
                      Acurácia da Classificação:
                    </h3>
                    <ul className='text-sm text-gray-600 space-y-1'>
                      <li>• Tipos I-III: 85-95% de correlação histológica</li>
                      <li>• Tipo IV: 80-90% para displasia de alto grau</li>
                      <li>• Tipo V: &gt;90% para carcinoma</li>
                    </ul>
                  </div>

                  <div className='bg-yellow-50 p-4 rounded-lg'>
                    <h3 className='font-semibold text-yellow-800 mb-2'>
                      Considerações:
                    </h3>
                    <ul className='text-sm text-yellow-700 space-y-1'>
                      <li>• Requer magnificação endoscópica</li>
                      <li>• Cromoscopia melhora a visualização</li>
                      <li>• Experiência do endoscopista é fundamental</li>
                      <li>• Preparação intestinal deve ser excelente</li>
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
