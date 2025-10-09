'use client'

import { useState, useEffect } from 'react'
import { Star, Filter, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ReviewCard from './review-card'
import ReviewForm from './review-form'

interface Review {
  id: string
  patientName: string
  patientAvatar?: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

interface ReviewsStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewsStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  })
  const [filterRating, setFilterRating] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filterRating === 'all') return true
      return review.rating === parseInt(filterRating)
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        default:
          return 0
      }
    })

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    }

    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${sizeClasses[size]} ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingPercentage = (rating: number) => {
    if (stats.totalReviews === 0) return 0
    return Math.round(
      (stats.ratingDistribution[rating] / stats.totalReviews) * 100
    )
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      {/* Formulário de Avaliação */}
      <div className='mb-12'>
        <Card className='bg-gray-900/50 border-blue-800/30'>
          <CardHeader className='pb-4'>
            <CardTitle className='text-xl font-semibold text-white text-center'>
              Deixe sua Avaliação
            </CardTitle>
            <p className='text-sm text-gray-300 text-center'>
              Sua opinião é muito importante para nós!
            </p>
          </CardHeader>

          <CardContent>
            <ReviewForm onClose={() => {}} onSubmit={fetchReviews} />
          </CardContent>
        </Card>
      </div>

      {/* Algumas Avaliações Recentes */}
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-white mb-6 text-center'>
          Algumas Avaliações Recentes
        </h2>
        <div className='space-y-4'>
          {filteredAndSortedReviews.slice(0, 3).length > 0 ? (
            filteredAndSortedReviews
              .slice(0, 3)
              .map(review => <ReviewCard key={review.id} {...review} />)
          ) : (
            <Card className='bg-gray-900/50 border-gray-700'>
              <CardContent className='py-12 text-center'>
                <p className='text-gray-300 mb-4'>
                  Ainda não há avaliações. Seja o primeiro a avaliar!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
