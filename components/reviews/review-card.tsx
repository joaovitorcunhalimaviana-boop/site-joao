'use client'

import { Star, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ReviewCardProps {
  id: string
  patientName: string
  patientAvatar?: string
  rating: number
  comment: string
  date: string
  verified?: boolean
}

export default function ReviewCard({
  id,
  patientName,
  patientAvatar,
  rating,
  comment,
  date,
  verified = false,
}: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString))
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className='w-full bg-gray-900/50 border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200'>
      <CardContent className='p-6'>
        <div className='flex items-start space-x-4'>
          <Avatar className='w-12 h-12'>
            <AvatarImage
              src={patientAvatar}
              alt={`Foto do paciente ${patientName} que avaliou Dr. João Vitor Viana`}
            />
            <AvatarFallback className='bg-blue-600 text-white'>
              {patientAvatar ? (
                <User className='w-6 h-6' />
              ) : (
                getInitials(patientName)
              )}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center space-x-2'>
                <h4 className='font-semibold text-white truncate'>
                  {patientName}
                </h4>
                {verified && (
                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white'>
                    Verificado
                  </span>
                )}
              </div>
              <time className='text-sm text-gray-400 flex-shrink-0'>
                {formatDate(date)}
              </time>
            </div>

            <div className='flex items-center mb-3'>
              <div className='flex space-x-1 mr-2'>{renderStars(rating)}</div>
              <span className='text-sm font-medium text-gray-300'>
                {rating}.0
              </span>
            </div>

            <p className='text-gray-300 leading-relaxed'>{comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
