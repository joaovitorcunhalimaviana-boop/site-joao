'use client'

import { useState, useEffect } from 'react'
import { Star, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface Testimonial {
  id: string
  patientName: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/reviews')
      if (response.ok) {
        const data = await response.json()
        // Pegar apenas avaliações de 5 estrelas verificadas, ordenadas por data
        const topReviews = data.reviews
          .filter(
            (review: Testimonial) => review.verified && review.rating === 5
          )
          .sort(
            (a: Testimonial, b: Testimonial) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 6)
        setTestimonials(topReviews)
      }
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextTestimonial = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex(
      prev => (prev - 1 + testimonials.length) % testimonials.length
    )
  }

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

  if (loading) {
    return (
      <section className='py-16 bg-gradient-to-b from-gray-900 to-black'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl sm:text-6xl font-bold text-white mb-4'>
              O que Nossos Pacientes Dizem
            </h2>
            <div className='flex justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400'></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className='py-16 bg-black'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-2xl sm:text-4xl font-bold text-white mb-4'>
            O que nossos pacientes dizem
          </h2>
          <p className='text-lg text-gray-300 mb-8'>
            Depoimentos reais de pacientes que confiaram em nosso trabalho
          </p>
          <div className='flex items-center justify-center space-x-2 mb-8'>
            <div className='flex'>{renderStars(5)}</div>
            <span className='text-lg font-semibold text-white'>4.8</span>
            <span className='text-lg text-gray-300'>
              • {testimonials.length}+ avaliações
            </span>
          </div>
        </div>

        {/* Carousel de Depoimentos */}
        <div className='relative'>
          <div className='overflow-hidden'>
            <div
              className='flex transition-transform duration-500 ease-in-out'
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className='w-full flex-shrink-0 px-4'>
                  <Card className='max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-sm border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-xl'>
                    <CardContent className='p-8'>
                      <div className='text-center'>
                        <Quote className='w-12 h-12 text-blue-600 mx-auto mb-6' />

                        <blockquote className='text-lg text-gray-100 leading-relaxed mb-6'>
                          "{testimonial.comment}"
                        </blockquote>

                        <div className='flex justify-center mb-4'>
                          {renderStars(testimonial.rating)}
                        </div>

                        <div className='flex items-center justify-center space-x-2'>
                          <cite className='text-lg font-semibold text-white'>
                            {testimonial.patientName}
                          </cite>
                          {testimonial.verified && (
                            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700'>
                              Verificado
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Controles do Carousel */}
        </div>

        {/* Indicadores */}
        {testimonials.length > 1 && (
          <div className='flex justify-center mt-8 space-x-2'>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-blue-400'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className='text-center mt-12'>
          <p className='text-lg text-gray-300 mb-6'>
            Quer agendar uma consulta ou deixar sua avaliação?
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/avaliacoes'>
              <Button
                variant='outline'
                className='w-full sm:w-auto border-gray-600 text-white hover:bg-white/10'
              >
                Faça sua avaliação
              </Button>
            </Link>
            <Link href='/agendamento'>
              <Button className='w-full sm:w-auto bg-white text-blue-900 hover:bg-gray-50'>
                Agendar Consulta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
