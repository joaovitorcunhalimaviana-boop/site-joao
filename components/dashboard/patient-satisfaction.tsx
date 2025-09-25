'use client'

import { useState, useEffect } from 'react'
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Star, Heart, TrendingUp } from 'lucide-react'

interface SatisfactionData {
  overallRating: number
  totalReviews: number
  ratingDistribution: { stars: number; count: number; percentage: number }[]
  recentReviews: {
    id: string
    patientName: string
    rating: number
    comment: string
    date: string
    category: string
  }[]
  categoryRatings: {
    category: string
    rating: number
    trend: number
  }[]
  monthlyTrends: {
    month: string
    rating: number
    reviewCount: number
  }[]
}

interface PatientSatisfactionProps {
  className?: string
}

export default function PatientSatisfaction({
  className = '',
}: PatientSatisfactionProps) {
  const [satisfactionData, setSatisfactionData] = useState<SatisfactionData>({
    overallRating: 4.7,
    totalReviews: 342,
    ratingDistribution: [
      { stars: 5, count: 198, percentage: 58 },
      { stars: 4, count: 89, percentage: 26 },
      { stars: 3, count: 34, percentage: 10 },
      { stars: 2, count: 15, percentage: 4 },
      { stars: 1, count: 6, percentage: 2 },
    ],
    recentReviews: [
      {
        id: '1',
        patientName: 'Maria S.',
        rating: 5,
        comment:
          'Excelente atendimento! Dr. João é muito atencioso e explicou tudo detalhadamente sobre meu tratamento.',
        date: '2024-01-15',
        category: 'Consulta de Rotina',
      },
      {
        id: '2',
        patientName: 'Carlos M.',
        rating: 5,
        comment:
          'Profissional excepcional. Conseguiu diagnosticar rapidamente meu problema e o tratamento está funcionando perfeitamente.',
        date: '2024-01-14',
        category: 'Primeira Consulta',
      },
      {
        id: '3',
        patientName: 'Ana P.',
        rating: 4,
        comment:
          'Muito bom atendimento, apenas o tempo de espera foi um pouco longo.',
        date: '2024-01-13',
        category: 'Retorno',
      },
      {
        id: '4',
        patientName: 'Roberto L.',
        rating: 5,
        comment: 'Recomendo totalmente! Médico muito competente e humano.',
        date: '2024-01-12',
        category: 'Consulta de Rotina',
      },
    ],
    categoryRatings: [
      { category: 'Qualidade do Atendimento', rating: 4.8, trend: 2.3 },
      { category: 'Tempo de Espera', rating: 4.2, trend: -1.2 },
      { category: 'Comunicação', rating: 4.9, trend: 3.1 },
      { category: 'Instalações', rating: 4.6, trend: 1.8 },
      { category: 'Eficácia do Tratamento', rating: 4.7, trend: 2.7 },
    ],
    monthlyTrends: [
      { month: 'Ago', rating: 4.5, reviewCount: 45 },
      { month: 'Set', rating: 4.6, reviewCount: 52 },
      { month: 'Out', rating: 4.4, reviewCount: 48 },
      { month: 'Nov', rating: 4.7, reviewCount: 61 },
      { month: 'Dez', rating: 4.8, reviewCount: 58 },
      { month: 'Jan', rating: 4.7, reviewCount: 78 },
    ],
  })

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    }

    return (
      <div className='flex items-center space-x-1'>
        {[1, 2, 3, 4, 5].map(star => (
          <div key={star} className='relative'>
            {rating >= star ? (
              <StarIconSolid
                className={`${sizeClasses[size]} text-yellow-400`}
              />
            ) : rating >= star - 0.5 ? (
              <div className='relative'>
                <Star className={`${sizeClasses[size]} text-gray-600`} />
                <div className='absolute inset-0 overflow-hidden w-1/2'>
                  <StarIconSolid
                    className={`${sizeClasses[size]} text-yellow-400`}
                  />
                </div>
              </div>
            ) : (
              <Star className={`${sizeClasses[size]} text-gray-600`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className='h-4 w-4 text-green-400' />
    }
    return <TrendingUp className='h-4 w-4 text-red-400 rotate-180' />
  }

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-green-400' : 'text-red-400'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Overall Rating */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <div className='flex items-center justify-between mb-4'>
            <div className='p-3 bg-yellow-900/20 rounded-xl'>
              <StarIconSolid className='h-8 w-8 text-yellow-400' />
            </div>
            <div className='text-right'>
              <p className='text-3xl font-bold text-white'>
                {satisfactionData.overallRating}
              </p>
              <p className='text-sm text-gray-400'>de 5.0</p>
            </div>
          </div>
          <p className='text-sm font-medium text-gray-300 mb-2'>
            Avaliação Geral
          </p>
          {renderStars(satisfactionData.overallRating, 'lg')}
          <p className='text-xs text-gray-400 mt-2'>
            Baseado em {satisfactionData.totalReviews} avaliações
          </p>
        </div>

        {/* Total Reviews */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <div className='flex items-center justify-between mb-4'>
            <div className='p-3 bg-blue-900/20 rounded-xl'>
              <ChatBubbleLeftRightIcon className='h-8 w-8 text-blue-400' />
            </div>
            <div className='text-right'>
              <p className='text-3xl font-bold text-white'>
                {satisfactionData.totalReviews}
              </p>
              <p className='text-sm text-gray-400'>avaliações</p>
            </div>
          </div>
          <p className='text-sm font-medium text-gray-300'>
            Total de Avaliações
          </p>
          <p className='text-xs text-green-400 mt-2'>↑ 23% vs mês anterior</p>
        </div>

        {/* Recommendation Rate */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <div className='flex items-center justify-between mb-4'>
            <div className='p-3 bg-green-900/20 rounded-xl'>
              <Heart className='h-8 w-8 text-green-400' />
            </div>
            <div className='text-right'>
              <p className='text-3xl font-bold text-white'>94%</p>
              <p className='text-sm text-gray-400'>recomendam</p>
            </div>
          </div>
          <p className='text-sm font-medium text-gray-300'>
            Taxa de Recomendação
          </p>
          <p className='text-xs text-green-400 mt-2'>↑ 5% vs mês anterior</p>
        </div>
      </div>

      {/* Rating Distribution & Category Ratings */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Rating Distribution */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <h3 className='text-lg font-semibold text-white mb-6 flex items-center'>
            <StarIconSolid className='h-5 w-5 mr-2 text-yellow-400' />
            Distribuição de Avaliações
          </h3>
          <div className='space-y-4'>
            {satisfactionData.ratingDistribution.map(item => (
              <div key={item.stars} className='flex items-center space-x-3'>
                <div className='flex items-center space-x-1 w-16'>
                  <span className='text-sm text-gray-300'>{item.stars}</span>
                  <StarIconSolid className='h-3 w-3 text-yellow-400' />
                </div>
                <div className='flex-1 bg-gray-700 rounded-full h-3 overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500'
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className='flex items-center space-x-2 w-20'>
                  <span className='text-sm text-white font-medium'>
                    {item.count}
                  </span>
                  <span className='text-xs text-gray-400'>
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Ratings */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <h3 className='text-lg font-semibold text-white mb-6 flex items-center'>
            <UserGroupIcon className='h-5 w-5 mr-2 text-blue-400' />
            Avaliações por Categoria
          </h3>
          <div className='space-y-4'>
            {satisfactionData.categoryRatings.map((category, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm text-gray-300'>
                      {category.category}
                    </span>
                    <div className='flex items-center space-x-2'>
                      <span className='text-sm text-white font-medium'>
                        {category.rating}
                      </span>
                      <div className='flex items-center space-x-1'>
                        {getTrendIcon(category.trend)}
                        <span
                          className={`text-xs ${getTrendColor(category.trend)}`}
                        >
                          {Math.abs(category.trend).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {renderStars(category.rating, 'sm')}
                    <div className='flex-1 bg-gray-700 rounded-full h-2 overflow-hidden ml-2'>
                      <div
                        className='h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500'
                        style={{ width: `${(category.rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
        <h3 className='text-lg font-semibold text-white mb-6 flex items-center'>
          <ChatBubbleLeftRightIcon className='h-5 w-5 mr-2 text-green-400' />
          Avaliações Recentes
        </h3>
        <div className='space-y-4'>
          {satisfactionData.recentReviews.map(review => (
            <div
              key={review.id}
              className='bg-gray-800/50 rounded-xl p-4 border border-gray-600'
            >
              <div className='flex items-start justify-between mb-3'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                    <span className='text-white font-medium text-sm'>
                      {review.patientName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className='text-white font-medium'>
                      {review.patientName}
                    </p>
                    <div className='flex items-center space-x-2'>
                      {renderStars(review.rating, 'sm')}
                      <span className='text-xs text-gray-400'>
                        {formatDate(review.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className='text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded-full'>
                  {review.category}
                </span>
              </div>
              <p className='text-gray-300 text-sm leading-relaxed'>
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
        <h3 className='text-lg font-semibold text-white mb-6 flex items-center'>
          <TrendingUp className='h-5 w-5 mr-2 text-purple-400' />
          Tendência Mensal
        </h3>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          {satisfactionData.monthlyTrends.map((month, index) => (
            <div key={index} className='text-center'>
              <div className='bg-gray-800/50 rounded-xl p-4 border border-gray-600'>
                <p className='text-sm text-gray-400 mb-2'>{month.month}</p>
                <p className='text-xl font-bold text-white mb-1'>
                  {month.rating}
                </p>
                {renderStars(month.rating, 'sm')}
                <p className='text-xs text-gray-400 mt-2'>
                  {month.reviewCount} avaliações
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
