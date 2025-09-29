'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/ui/header'
import BackgroundPattern from '../../../components/ui/background-pattern'
import Footer from '../../../components/ui/footer'
import AdvancedMetrics from '../../../components/dashboard/advanced-metrics'
import TrendAnalysis from '../../../components/dashboard/trend-analysis'
import PatientSatisfaction from '../../../components/dashboard/patient-satisfaction'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import {
  ChartBarIcon,
  ArrowLeftIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import { TrendingUp, Star } from 'lucide-react'

export default function RelatoriosAvancadosPage() {
  const [activeTab, setActiveTab] = useState<
    'metrics' | 'trends' | 'satisfaction'
  >('metrics')
  const router = useRouter()

  const exportAllData = () => {
    // Simular exportação de todos os dados
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `relatorio-completo-${timestamp}.pdf`

    // Em uma implementação real, isso geraria um PDF com todos os dados
    alert(`Exportando relatório completo como ${filename}...`)
  }

  const printAllReports = () => {
    window.print()
  }

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='area-medica' />

      <div className='relative isolate'>
        {/* Header */}
        <div className='pt-32 pb-8'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700'>
                  <ChartBarIcon className='w-8 h-8 text-blue-400' />
                </div>
                <div>
                  <h1 className='text-4xl font-bold text-white'>
                    Relatórios Avançados
                  </h1>
                  <p className='text-gray-300 text-lg mt-2'>
                    Análise detalhada de métricas e indicadores
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3 relative z-10'>
                <button
                  onClick={exportAllData}
                  className='flex items-center px-3 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-900/50 rounded-lg transition-all duration-200 border border-gray-700 backdrop-blur-sm'
                >
                  <ArrowDownTrayIcon className='h-4 w-4 mr-1' />
                  Exportar PDF
                </button>
                <button
                  onClick={printAllReports}
                  className='flex items-center px-3 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-900/50 rounded-lg transition-all duration-200 border border-gray-700 backdrop-blur-sm'
                >
                  <PrinterIcon className='h-4 w-4 mr-1' />
                  Imprimir
                </button>
                <MedicalAreaMenu currentPage='relatorios-avancados' />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='mx-auto max-w-7xl px-6 lg:px-8 pb-20'>
          {/* Navigation Tabs */}
          <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 mb-8'>
            <div className='border-b border-gray-700'>
              <nav className='-mb-px flex'>
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`py-5 px-8 text-sm font-semibold border-b-3 transition-all duration-200 flex items-center ${
                    activeTab === 'metrics'
                      ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/30'
                  }`}
                >
                  <ChartBarIcon className='h-5 w-5 mr-2' />
                  Métricas Avançadas
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`py-5 px-8 text-sm font-semibold border-b-3 transition-all duration-200 flex items-center ${
                    activeTab === 'trends'
                      ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/30'
                  }`}
                >
                  <TrendingUp className='h-5 w-5 mr-2' />
                  Análise de Tendências
                </button>
                <button
                  onClick={() => setActiveTab('satisfaction')}
                  className={`py-5 px-8 text-sm font-semibold border-b-3 transition-all duration-200 flex items-center ${
                    activeTab === 'satisfaction'
                      ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/30'
                  }`}
                >
                  <Star className='h-5 w-5 mr-2' />
                  Satisfação do Paciente
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className='space-y-8'>
            {activeTab === 'metrics' && (
              <div>
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-white mb-2'>
                    Métricas Avançadas
                  </h2>
                  <p className='text-gray-300'>
                    Visão detalhada dos KPIs principais, gráficos de desempenho
                    e análises comparativas.
                  </p>
                </div>
                <AdvancedMetrics />
              </div>
            )}

            {activeTab === 'trends' && (
              <div>
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-white mb-2'>
                    Análise de Tendências
                  </h2>
                  <p className='text-gray-300'>
                    Acompanhe a evolução do consultório ao longo do tempo com
                    análises detalhadas de tendências.
                  </p>
                </div>
                <TrendAnalysis />
              </div>
            )}

            {activeTab === 'satisfaction' && (
              <div>
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-white mb-2'>
                    Satisfação do Paciente
                  </h2>
                  <p className='text-gray-300'>
                    Monitore a satisfação dos pacientes com análises detalhadas
                    de avaliações e feedback.
                  </p>
                </div>
                <PatientSatisfaction />
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-blue-900/20 rounded-xl'>
                  <ChartBarIcon className='h-8 w-8 text-blue-400' />
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-white'>15</p>
                  <p className='text-sm text-gray-400'>KPIs</p>
                </div>
              </div>
              <p className='text-sm font-medium text-gray-300'>
                Métricas Monitoradas
              </p>
              <p className='text-xs text-green-400 mt-1'>Todas atualizadas</p>
            </div>

            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-green-900/20 rounded-xl'>
                  <TrendingUp className='h-8 w-8 text-green-400' />
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-white'>12</p>
                  <p className='text-sm text-gray-400'>meses</p>
                </div>
              </div>
              <p className='text-sm font-medium text-gray-300'>
                Histórico de Dados
              </p>
              <p className='text-xs text-blue-400 mt-1'>
                Tendências disponíveis
              </p>
            </div>

            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
              <div className='flex items-center justify-between mb-4'>
                <div className='p-3 bg-yellow-900/20 rounded-xl'>
                  <Star className='h-8 w-8 text-yellow-400' />
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-white'>4.7</p>
                  <p className='text-sm text-gray-400'>de 5.0</p>
                </div>
              </div>
              <p className='text-sm font-medium text-gray-300'>
                Satisfação Média
              </p>
              <p className='text-xs text-green-400 mt-1'>
                ↑ 0.2 vs mês anterior
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='mt-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
            <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
              <CalendarIcon className='h-5 w-5 mr-2 text-blue-400' />
              Ações Rápidas
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <button
                onClick={() => router.push('/area-medica/relatorios')}
                className='flex items-center justify-center px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-200 border border-blue-600/30'
              >
                <CalendarIcon className='h-5 w-5 mr-2' />
                Relatórios Básicos
              </button>
              <button
                onClick={() => router.push('/area-medica')}
                className='flex items-center justify-center px-4 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all duration-200 border border-green-600/30'
              >
                <ChartBarIcon className='h-5 w-5 mr-2' />
                Dashboard Principal
              </button>
              <button
                onClick={() => router.push('/avaliacoes')}
                className='flex items-center justify-center px-4 py-3 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-all duration-200 border border-yellow-600/30'
              >
                <Star className='h-5 w-5 mr-2' />
                Ver Avaliações
              </button>
              <button
                onClick={exportAllData}
                className='flex items-center justify-center px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all duration-200 border border-purple-600/30'
              >
                <ArrowDownTrayIcon className='h-5 w-5 mr-2' />
                Exportar Dados
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
