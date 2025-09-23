'use client'

import { useState, useEffect } from 'react'
import {
  CalendarIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TrendData {
  period: string
  consultations: number
  revenue: number
  satisfaction: number
  newPatients: number
  returnRate: number
}

interface TrendAnalysisProps {
  className?: string
}

export default function TrendAnalysis({ className = '' }: TrendAnalysisProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'quarter' | 'year'
  >('month')
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Dados simulados para demonstração
  const mockData = {
    week: [
      {
        period: 'Sem 1',
        consultations: 45,
        revenue: 12500,
        satisfaction: 4.6,
        newPatients: 8,
        returnRate: 85,
      },
      {
        period: 'Sem 2',
        consultations: 52,
        revenue: 14200,
        satisfaction: 4.7,
        newPatients: 12,
        returnRate: 87,
      },
      {
        period: 'Sem 3',
        consultations: 48,
        revenue: 13100,
        satisfaction: 4.5,
        newPatients: 9,
        returnRate: 82,
      },
      {
        period: 'Sem 4',
        consultations: 58,
        revenue: 15800,
        satisfaction: 4.8,
        newPatients: 15,
        returnRate: 89,
      },
    ],
    month: [
      {
        period: 'Jan',
        consultations: 156,
        revenue: 42500,
        satisfaction: 4.5,
        newPatients: 28,
        returnRate: 82,
      },
      {
        period: 'Fev',
        consultations: 142,
        revenue: 38900,
        satisfaction: 4.6,
        newPatients: 24,
        returnRate: 85,
      },
      {
        period: 'Mar',
        consultations: 178,
        revenue: 48200,
        satisfaction: 4.7,
        newPatients: 32,
        returnRate: 87,
      },
      {
        period: 'Abr',
        consultations: 165,
        revenue: 45100,
        satisfaction: 4.6,
        newPatients: 29,
        returnRate: 84,
      },
      {
        period: 'Mai',
        consultations: 189,
        revenue: 51300,
        satisfaction: 4.8,
        newPatients: 35,
        returnRate: 89,
      },
      {
        period: 'Jun',
        consultations: 201,
        revenue: 54700,
        satisfaction: 4.7,
        newPatients: 38,
        returnRate: 86,
      },
    ],
    quarter: [
      {
        period: 'Q1 2024',
        consultations: 476,
        revenue: 129600,
        satisfaction: 4.6,
        newPatients: 84,
        returnRate: 85,
      },
      {
        period: 'Q2 2024',
        consultations: 555,
        revenue: 151100,
        satisfaction: 4.7,
        newPatients: 102,
        returnRate: 86,
      },
      {
        period: 'Q3 2024',
        consultations: 612,
        revenue: 166800,
        satisfaction: 4.8,
        newPatients: 118,
        returnRate: 88,
      },
      {
        period: 'Q4 2024',
        consultations: 589,
        revenue: 160300,
        satisfaction: 4.7,
        newPatients: 109,
        returnRate: 87,
      },
    ],
    year: [
      {
        period: '2021',
        consultations: 1890,
        revenue: 515000,
        satisfaction: 4.4,
        newPatients: 285,
        returnRate: 78,
      },
      {
        period: '2022',
        consultations: 2156,
        revenue: 587200,
        satisfaction: 4.5,
        newPatients: 324,
        returnRate: 82,
      },
      {
        period: '2023',
        consultations: 2387,
        revenue: 649800,
        satisfaction: 4.6,
        newPatients: 356,
        returnRate: 85,
      },
      {
        period: '2024',
        consultations: 2232,
        revenue: 607800,
        satisfaction: 4.7,
        newPatients: 413,
        returnRate: 87,
      },
    ],
  }

  useEffect(() => {
    setIsLoading(true)
    // Simular carregamento de dados
    setTimeout(() => {
      setTrendData(mockData[selectedPeriod])
      setIsLoading(false)
    }, 500)
  }, [selectedPeriod])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const calculateTrend = (data: TrendData[], field: keyof TrendData) => {
    if (data.length < 2) return 0
    const current = data[data.length - 1][field] as number
    const previous = data[data.length - 2][field] as number
    return ((current - previous) / previous) * 100
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className='h-4 w-4 text-green-500' />
    } else if (trend < 0) {
      return <TrendingDown className='h-4 w-4 text-red-500' />
    }
    return <div className='h-4 w-4' />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-400'
    if (trend < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const exportData = () => {
    const csvContent = [
      [
        'Período',
        'Consultas',
        'Receita',
        'Satisfação',
        'Novos Pacientes',
        'Taxa de Retorno',
      ],
      ...trendData.map(item => [
        item.period,
        item.consultations.toString(),
        item.revenue.toString(),
        item.satisfaction.toString(),
        item.newPatients.toString(),
        `${item.returnRate}%`,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analise-tendencias-${selectedPeriod}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printReport = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div
        className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700 ${className}`}
      >
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-700 rounded w-1/3'></div>
          <div className='space-y-3'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='h-16 bg-gray-700 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className='p-6 border-b border-gray-700'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold text-white flex items-center'>
            <ChartBarIcon className='h-6 w-6 mr-2 text-blue-400' />
            Análise de Tendências
          </h2>
          <div className='flex items-center space-x-2'>
            <button
              onClick={exportData}
              className='flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200'
            >
              <ArrowDownTrayIcon className='h-4 w-4 mr-1' />
              Exportar
            </button>
            <button
              onClick={printReport}
              className='flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200'
            >
              <PrinterIcon className='h-4 w-4 mr-1' />
              Imprimir
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className='flex space-x-2'>
          {(['week', 'month', 'quarter', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {period === 'week' && 'Semanal'}
              {period === 'month' && 'Mensal'}
              {period === 'quarter' && 'Trimestral'}
              {period === 'year' && 'Anual'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className='p-6'>
        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <div className='bg-gray-800/50 rounded-xl p-4 border border-gray-600'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-gray-400'>Consultas</span>
              <div className='flex items-center space-x-1'>
                {getTrendIcon(calculateTrend(trendData, 'consultations'))}
                <span
                  className={`text-xs ${getTrendColor(calculateTrend(trendData, 'consultations'))}`}
                >
                  {Math.abs(calculateTrend(trendData, 'consultations')).toFixed(
                    1
                  )}
                  %
                </span>
              </div>
            </div>
            <p className='text-2xl font-bold text-white'>
              {trendData.length > 0
                ? trendData[trendData.length - 1].consultations
                : 0}
            </p>
          </div>

          <div className='bg-gray-800/50 rounded-xl p-4 border border-gray-600'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-gray-400'>Receita</span>
              <div className='flex items-center space-x-1'>
                {getTrendIcon(calculateTrend(trendData, 'revenue'))}
                <span
                  className={`text-xs ${getTrendColor(calculateTrend(trendData, 'revenue'))}`}
                >
                  {Math.abs(calculateTrend(trendData, 'revenue')).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className='text-lg font-bold text-white'>
              {trendData.length > 0
                ? formatCurrency(trendData[trendData.length - 1].revenue)
                : formatCurrency(0)}
            </p>
          </div>

          <div className='bg-gray-800/50 rounded-xl p-4 border border-gray-600'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-gray-400'>Satisfação</span>
              <div className='flex items-center space-x-1'>
                {getTrendIcon(calculateTrend(trendData, 'satisfaction'))}
                <span
                  className={`text-xs ${getTrendColor(calculateTrend(trendData, 'satisfaction'))}`}
                >
                  {Math.abs(calculateTrend(trendData, 'satisfaction')).toFixed(
                    1
                  )}
                  %
                </span>
              </div>
            </div>
            <p className='text-2xl font-bold text-white'>
              {trendData.length > 0
                ? trendData[trendData.length - 1].satisfaction.toFixed(1)
                : '0.0'}
            </p>
          </div>

          <div className='bg-gray-800/50 rounded-xl p-4 border border-gray-600'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-gray-400'>Taxa de Retorno</span>
              <div className='flex items-center space-x-1'>
                {getTrendIcon(calculateTrend(trendData, 'returnRate'))}
                <span
                  className={`text-xs ${getTrendColor(calculateTrend(trendData, 'returnRate'))}`}
                >
                  {Math.abs(calculateTrend(trendData, 'returnRate')).toFixed(1)}
                  %
                </span>
              </div>
            </div>
            <p className='text-2xl font-bold text-white'>
              {trendData.length > 0
                ? `${trendData[trendData.length - 1].returnRate}%`
                : '0%'}
            </p>
          </div>
        </div>

        {/* Detailed Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-700'>
                <th className='text-left py-3 px-4 text-sm font-medium text-gray-300'>
                  Período
                </th>
                <th className='text-right py-3 px-4 text-sm font-medium text-gray-300'>
                  Consultas
                </th>
                <th className='text-right py-3 px-4 text-sm font-medium text-gray-300'>
                  Receita
                </th>
                <th className='text-right py-3 px-4 text-sm font-medium text-gray-300'>
                  Satisfação
                </th>
                <th className='text-right py-3 px-4 text-sm font-medium text-gray-300'>
                  Novos Pacientes
                </th>
                <th className='text-right py-3 px-4 text-sm font-medium text-gray-300'>
                  Taxa de Retorno
                </th>
              </tr>
            </thead>
            <tbody>
              {trendData.map((item, index) => {
                const isLatest = index === trendData.length - 1
                return (
                  <tr
                    key={index}
                    className={`border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors ${
                      isLatest ? 'bg-blue-900/10' : ''
                    }`}
                  >
                    <td className='py-3 px-4 text-white font-medium'>
                      {item.period}
                    </td>
                    <td className='py-3 px-4 text-right text-white'>
                      {item.consultations}
                    </td>
                    <td className='py-3 px-4 text-right text-white'>
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className='py-3 px-4 text-right text-white'>
                      {item.satisfaction.toFixed(1)}
                    </td>
                    <td className='py-3 px-4 text-right text-white'>
                      {item.newPatients}
                    </td>
                    <td className='py-3 px-4 text-right text-white'>
                      {item.returnRate}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Insights */}
        <div className='mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-600'>
          <h3 className='text-lg font-semibold text-white mb-3'>
            Insights Principais
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-gray-300 mb-2'>
                <span className='font-medium text-blue-400'>
                  Tendência de Consultas:
                </span>
                {calculateTrend(trendData, 'consultations') > 0
                  ? ' Crescimento'
                  : ' Declínio'}{' '}
                de{' '}
                {Math.abs(calculateTrend(trendData, 'consultations')).toFixed(
                  1
                )}
                % no período
              </p>
              <p className='text-gray-300'>
                <span className='font-medium text-green-400'>Satisfação:</span>
                {calculateTrend(trendData, 'satisfaction') > 0
                  ? ' Melhoria'
                  : ' Redução'}{' '}
                de{' '}
                {Math.abs(calculateTrend(trendData, 'satisfaction')).toFixed(1)}
                % na satisfação
              </p>
            </div>
            <div>
              <p className='text-gray-300 mb-2'>
                <span className='font-medium text-purple-400'>Receita:</span>
                {calculateTrend(trendData, 'revenue') > 0
                  ? ' Aumento'
                  : ' Redução'}{' '}
                de {Math.abs(calculateTrend(trendData, 'revenue')).toFixed(1)}%
                na receita
              </p>
              <p className='text-gray-300'>
                <span className='font-medium text-yellow-400'>Retenção:</span>
                Taxa de retorno de{' '}
                {trendData.length > 0
                  ? trendData[trendData.length - 1].returnRate
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
