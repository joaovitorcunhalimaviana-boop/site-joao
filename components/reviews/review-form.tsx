'use client'

import { useState } from 'react'
import { Star, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface ReviewFormProps {
  onClose: () => void
  onSubmit: () => void
}

export default function ReviewForm({ onClose, onSubmit }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    rating: 0,
    comment: '',
    phone: '',
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const handleRatingHover = (rating: number) => {
    setHoveredRating(rating)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patientName.trim()) {
      toast.error('Por favor, informe seu nome')
      return
    }

    if (!formData.email.trim()) {
      toast.error('Por favor, informe seu email')
      return
    }

    if (formData.rating === 0) {
      toast.error('Por favor, selecione uma avaliação')
      return
    }

    if (!formData.comment.trim()) {
      toast.error('Por favor, escreva um comentário')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: formData.patientName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          rating: formData.rating,
          comment: formData.comment.trim(),
        }),
      })

      if (response.ok) {
        toast.success(
          'Avaliação enviada com sucesso! Obrigado pelo seu feedback.'
        )
        onSubmit()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao enviar avaliação')
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      toast.error('Erro ao enviar avaliação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      const isActive = starValue <= (hoveredRating || formData.rating)

      return (
        <button
          key={index}
          type='button'
          onClick={() => handleRatingClick(starValue)}
          onMouseEnter={() => handleRatingHover(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className='p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded'
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              isActive
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          />
        </button>
      )
    })
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Muito insatisfeito'
      case 2:
        return 'Insatisfeito'
      case 3:
        return 'Neutro'
      case 4:
        return 'Satisfeito'
      case 5:
        return 'Muito satisfeito'
      default:
        return 'Selecione uma avaliação'
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='patientName' className='text-gray-300'>
            Nome completo *
          </Label>
          <Input
            id='patientName'
            type='text'
            value={formData.patientName}
            onChange={e =>
              setFormData(prev => ({ ...prev, patientName: e.target.value }))
            }
            placeholder='Seu nome completo'
            className='bg-gray-800 border-gray-600 text-white placeholder-gray-400'
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email' className='text-gray-300'>
            Email *
          </Label>
          <Input
            id='email'
            type='email'
            value={formData.email}
            onChange={e =>
              setFormData(prev => ({ ...prev, email: e.target.value }))
            }
            placeholder='seu@email.com'
            className='bg-gray-800 border-gray-600 text-white placeholder-gray-400'
            required
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='phone' className='text-gray-300'>
          Telefone (opcional)
        </Label>
        <Input
          id='phone'
          type='tel'
          value={formData.phone}
          onChange={e =>
            setFormData(prev => ({ ...prev, phone: e.target.value }))
          }
          placeholder='(61) 99999-9999'
          className='bg-gray-800 border-gray-600 text-white placeholder-gray-400'
        />
      </div>

      <div className='space-y-3'>
        <Label className='text-gray-300'>Avaliação *</Label>
        <div className='flex flex-col items-center space-y-2'>
          <div className='flex space-x-1'>{renderStars()}</div>
          <p className='text-sm text-gray-400 font-medium'>
            {getRatingText(hoveredRating || formData.rating)}
          </p>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='comment' className='text-gray-300'>
          Comentário *
        </Label>
        <Textarea
          id='comment'
          value={formData.comment}
          onChange={e =>
            setFormData(prev => ({ ...prev, comment: e.target.value }))
          }
          placeholder='Conte-nos sobre sua experiência...'
          rows={4}
          className='bg-gray-800 border-gray-600 text-white placeholder-gray-400'
          required
          maxLength={500}
        />
        <p className='text-xs text-gray-500 text-right'>
          {formData.comment.length}/500 caracteres
        </p>
      </div>

      <div className='flex justify-center pt-4'>
        <Button
          type='submit'
          className='bg-navy-800 hover:bg-navy-700 px-8'
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className='flex items-center space-x-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              <span>Enviando...</span>
            </div>
          ) : (
            <div className='flex items-center space-x-2'>
              <Send className='w-4 h-4' />
              <span>Enviar Avaliação</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  )
}
