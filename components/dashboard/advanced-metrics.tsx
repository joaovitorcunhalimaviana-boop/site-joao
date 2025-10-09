'use client'

import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { TrendingUp, TrendingDown, Heart, Star, Activity } from 'lucide-react'

interface MetricsData {
  monthlyConsultations: number[]
  consultationTypes: {
    type: string
    count: number
    percentage: number
    revenue: number
  }[]
  weeklyTrends: { day: string; consultations: number }[]
  monthlyRevenue: number[]
  patientRetention: number
  averageConsultationDuration: number
  diagnosticMetrics: { diagnosis: string; count: number; percentage: number }[]
}

interface AdvancedMetricsProps {
  className?: string
}

// Função para calcular receita baseada no tipo de consulta
const calculateRevenue = (type: string, count: number): number => {
  const pricing = {
    'Consulta Particular': 400,
    'Consulta por Plano': 100, // Atualizado conforme solicitação
  }
  return (pricing[type as keyof typeof pricing] || 0) * count
}

export default function AdvancedMetrics({
  className = '',
}: AdvancedMetricsProps) {
  const [metricsData, setMetricsData] = useState<MetricsData>({
    monthlyConsultations: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    consultationTypes: [
      {
        type: 'Consulta Particular',
        count: 0,
        percentage: 0,
        revenue: calculateRevenue('Consulta Particular', 0),
      },
      {
        type: 'Consulta por Plano',
        count: 0,
        percentage: 0,
        revenue: calculateRevenue('Consulta por Plano', 0),
      },
    ],
    weeklyTrends: [
      { day: 'Seg', consultations: 0 },
      { day: 'Ter', consultations: 0 },
      { day: 'Qua', consultations: 0 },
      { day: 'Qui', consultations: 0 },
      { day: 'Sex', consultations: 0 },
      { day: 'Sáb', consultations: 0 },
    ],
    monthlyRevenue: [],
    patientRetention: 0,
    averageConsultationDuration: 0,
    diagnosticMetrics: [
      { diagnosis: 'Doença Hemorroidária', count: 0, percentage: 0.0 },
      { diagnosis: 'Hérnia Inguinal', count: 0, percentage: 0.0 },
      { diagnosis: 'Fissura Anal', count: 0, percentage: 0.0 },
      { diagnosis: 'Fístula Anal', count: 0, percentage: 0.0 },
      { diagnosis: 'Colelitíase', count: 0, percentage: 0.0 },
      { diagnosis: 'Constipação Intestinal', count: 0, percentage: 0.0 },
      { diagnosis: 'Hérnia Umbilical', count: 0, percentage: 0.0 },
      { diagnosis: 'Doença Pilonidal', count: 0, percentage: 0.0 },
      { diagnosis: 'Incontinência Fecal', count: 0, percentage: 0.0 },
      { diagnosis: 'Câncer Colorretal', count: 0, percentage: 0.0 },
      { diagnosis: 'Doença de Crohn', count: 0, percentage: 0.0 },
      { diagnosis: 'Retocolite Ulcerativa', count: 0, percentage: 0.0 },
      { diagnosis: 'Hérnia Incisional', count: 0, percentage: 0.0 },
      { diagnosis: 'Outras Hérnias', count: 0, percentage: 0.0 },
    ],
  })

  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'year'
  >('month')

  // Calcular receita mensal baseada nos tipos de consulta
  useEffect(() => {
    const totalRevenue = metricsData.consultationTypes.reduce(
      (sum, type) => sum + type.revenue,
      0
    )
    const monthlyRevenueData = metricsData.monthlyConsultations.map(
      consultations => {
        // Distribuir proporcionalmente baseado na média de consultas
        const avgConsultations = metricsData.consultationTypes.reduce(
          (sum, type) => sum + type.count,
          0
        )
        const revenuePerConsultation = totalRevenue / avgConsultations
        return Math.round(consultations * revenuePerConsultation)
      }
    )

    setMetricsData(prev => ({
      ...prev,
      monthlyRevenue: monthlyRevenueData,
    }))
  }, [metricsData.consultationTypes, metricsData.monthlyConsultations])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getMonthName = (monthIndex: number) => {
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]
    return months[monthIndex]
  }

  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 0
    const current = data[data.length - 1]
    const previous = data[data.length - 2]
    return ((current - previous) / previous) * 100
  }

  const consultationsTrend = calculateTrend(metricsData.monthlyConsultations)
  const revenueTrend = calculateTrend(metricsData.monthlyRevenue)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* KPIs Principais */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Retenção de Pacientes */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <div className='flex items-center justify-between mb-4'>
            <div className='p-3 bg-green-900/20 rounded-xl'>
              <Heart className='h-8 w-8 text-green-400' />
            </div>
            <div className='text-right'>
              <p className='text-2xl font-bold text-white'>
                {metricsData.patientRetention}%
              </p>
              <p className='text-xs text-gray-400'>retenção</p>
            </div>
          </div>
          <p className='text-sm font-medium text-gray-300'>
            Retenção de Pacientes
          </p>
          <p className='text-xs text-green-400 mt-1'>↑ 3% vs mês anterior</p>
        </div>

        {/* Duração Média da Consulta */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <div className='flex items-center justify-between mb-4'>
            <div className='p-3 bg-purple-900/20 rounded-xl'>
              <DocumentTextIcon className='h-8 w-8 text-purple-400' />
            </div>
            <div className='text-right'>
              <p className='text-2xl font-bold text-white'>
                {metricsData.averageConsultationDuration}
              </p>
              <p className='text-xs text-gray-400'>minutos</p>
            </div>
          </div>
          <p className='text-sm font-medium text-gray-300'>
            Duração Média da Consulta
          </p>
          <p className='text-xs text-blue-400 mt-1'>Dentro do esperado</p>
        </div>
      </div>

      {/* Gráficos de Tendências */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Consultas Mensais */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-white flex items-center'>
              <ChartBarIcon className='h-5 w-5 mr-2 text-blue-400' />
              Consultas por Mês
            </h3>
            <div className='flex items-center space-x-2'>
              <span
                className={`text-sm ${
                  consultationsTrend > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {consultationsTrend > 0 ? '↑' : '↓'}{' '}
                {Math.abs(consultationsTrend).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className='space-y-3'>
            {metricsData.monthlyConsultations.slice(-6).map((value, index) => {
              const monthIndex = (new Date().getMonth() - 5 + index + 12) % 12
              const maxValue = Math.max(...metricsData.monthlyConsultations)
              const percentage = (value / maxValue) * 100

              return (
                <div key={index} className='flex items-center space-x-3'>
                  <span className='text-sm text-gray-400 w-8'>
                    {getMonthName(monthIndex)}
                  </span>
                  <div className='flex-1 bg-gray-700 rounded-full h-3 overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500'
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className='text-sm text-white font-medium w-8 text-right'>
                    {value}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Receita Mensal */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold text-white flex items-center'>
              <TrendingUp className='h-5 w-5 mr-2 text-green-400' />
              Receita por Mês
            </h3>
            <div className='flex items-center space-x-2'>
              <span
                className={`text-sm ${
                  revenueTrend > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {revenueTrend > 0 ? '↑' : '↓'}{' '}
                {Math.abs(revenueTrend).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className='space-y-3'>
            {metricsData.monthlyRevenue.slice(-6).map((value, index) => {
              const monthIndex = (new Date().getMonth() - 5 + index + 12) % 12
              const maxValue = Math.max(...metricsData.monthlyRevenue)
              const percentage = (value / maxValue) * 100

              return (
                <div key={index} className='flex items-center space-x-3'>
                  <span className='text-sm text-gray-400 w-8'>
                    {getMonthName(monthIndex)}
                  </span>
                  <div className='flex-1 bg-gray-700 rounded-full h-3 overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500'
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className='text-sm text-white font-medium w-20 text-right'>
                    {formatCurrency(value)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Análises Detalhadas */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Tipos de Consulta */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <h3 className='text-lg font-semibold text-white mb-6 flex items-center'>
            <CalendarIcon className='h-5 w-5 mr-2 text-blue-400' />
            Tipos de Consulta
          </h3>
          <div className='space-y-4'>
            {metricsData.consultationTypes.map((type, index) => (
              <div key={index} className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-medium text-gray-300'>
                    {type.type}
                  </span>
                  <div className='text-right'>
                    <span className='text-sm text-white font-bold'>
                      {type.count}
                    </span>
                    <span className='text-xs text-gray-400 ml-2'>
                      ({type.percentage}%)
                    </span>
                  </div>
                </div>
                <div className='flex justify-between items-center text-xs'>
                  <span className='text-gray-400'>
                    Receita: {formatCurrency(type.revenue)}
                  </span>
                  <span className='text-gray-400'>
                    Média: {formatCurrency(type.revenue / type.count)}
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === 0
                        ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                        : 'bg-gradient-to-r from-purple-500 to-purple-400'
                    }`}
                    style={{ width: `${type.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tendências Semanais */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <h3 className='text-lg font-semibold text-white mb-6 flex items-center'>
            <ClockIcon className='h-5 w-5 mr-2 text-yellow-400' />
            Tendências Semanais
          </h3>
          <div className='space-y-3'>
            {metricsData.weeklyTrends.map((day, index) => {
              const maxValue = Math.max(
                ...metricsData.weeklyTrends.map(d => d.consultations)
              )
              const percentage = (day.consultations / maxValue) * 100

              return (
                <div key={index} className='flex items-center space-x-3'>
                  <span className='text-sm text-gray-400 w-8'>{day.day}</span>
                  <div className='flex-1 bg-gray-700 rounded-full h-3 overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500'
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className='text-sm text-white font-medium w-8 text-right'>
                    {day.consultations}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Métricas de Diagnósticos */}
      <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
        <h3 className='text-lg font-semibold text-white mb-6 flex items-center'>
          <Activity className='h-5 w-5 mr-2 text-red-400' />
          Métricas de Diagnósticos
        </h3>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-gray-300 mb-4'>
              Principais Diagnósticos
            </h4>
            {metricsData.diagnosticMetrics
              .slice(0, 7)
              .map((diagnostic, index) => {
                const maxValue = Math.max(
                  ...metricsData.diagnosticMetrics.map(d => d.count)
                )
                const percentage = (diagnostic.count / maxValue) * 100

                return (
                  <div key={index} className='flex items-center space-x-3'>
                    <span className='text-xs text-gray-400 w-32 truncate'>
                      {diagnostic.diagnosis}
                    </span>
                    <div className='flex-1 bg-gray-700 rounded-full h-2 overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500'
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className='text-xs text-white font-medium w-8 text-right'>
                      {diagnostic.count}
                    </span>
                    <span className='text-xs text-gray-400 w-12 text-right'>
                      ({diagnostic.percentage}%)
                    </span>
                  </div>
                )
              })}
          </div>
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-gray-300 mb-4'>
              Outros Diagnósticos
            </h4>
            {metricsData.diagnosticMetrics.slice(7).map((diagnostic, index) => {
              const maxValue = Math.max(
                ...metricsData.diagnosticMetrics.map(d => d.count)
              )
              const percentage = (diagnostic.count / maxValue) * 100

              return (
                <div key={index} className='flex items-center space-x-3'>
                  <span className='text-xs text-gray-400 w-32 truncate'>
                    {diagnostic.diagnosis}
                  </span>
                  <div className='flex-1 bg-gray-700 rounded-full h-2 overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500'
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className='text-xs text-white font-medium w-8 text-right'>
                    {diagnostic.count}
                  </span>
                  <span className='text-xs text-gray-400 w-12 text-right'>
                    ({diagnostic.percentage}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div className='mt-6 pt-4 border-t border-gray-600'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
            <div>
              <p className='text-2xl font-bold text-white'>
                {metricsData.diagnosticMetrics.reduce(
                  (sum, d) => sum + d.count,
                  0
                )}
              </p>
              <p className='text-xs text-gray-400'>Total de Diagnósticos</p>
            </div>
            <div>
              <p className='text-2xl font-bold text-red-400'>
                {metricsData.diagnosticMetrics[0]?.diagnosis.split(' ')[0] ||
                  'N/A'}
              </p>
              <p className='text-xs text-gray-400'>Mais Comum</p>
            </div>
            <div>
              <p className='text-2xl font-bold text-blue-400'>
                {metricsData.diagnosticMetrics.length}
              </p>
              <p className='text-xs text-gray-400'>Tipos Diferentes</p>
            </div>
            <div>
              <p className='text-2xl font-bold text-green-400'>
                {metricsData.diagnosticMetrics[0]?.percentage.toFixed(1)}%
              </p>
              <p className='text-xs text-gray-400'>Prevalência Máxima</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
