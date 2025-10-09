'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react'

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'inline'
  title?: string
  description?: string
  className?: string
}

export default function NewsletterSignup({
  variant = 'default',
  title,
  description,
  className = '',
}: NewsletterSignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferences: {
      healthTips: true,
      appointments: true,
      promotions: false,
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'subscribe',
          ...formData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setIsSubscribed(true)
        setFormData({
          name: '',
          email: '',
          preferences: {
            healthTips: true,
            appointments: true,
            promotions: false,
          },
        })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao processar inscrição. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePreferenceChange = (preference: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: checked,
      },
    }))
  }

  if (isSubscribed && variant !== 'inline') {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Inscrição Realizada!
            </h3>
            <p className='text-gray-600'>
              Obrigado por se inscrever em nosso newsletter. Você receberá
              nossas atualizações em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-blue-50 p-4 rounded-lg ${className}`}>
        <div className='flex items-center mb-3'>
          <Mail className='h-5 w-5 text-blue-600 mr-2' />
          <h3 className='font-semibold text-gray-900'>
            {title || 'Receba Dicas de Saúde'}
          </h3>
        </div>
        <p className='text-sm text-gray-600 mb-4'>
          {description ||
            'Inscreva-se para receber dicas de saúde e novidades sobre nossos serviços.'}
        </p>

        <form onSubmit={handleSubmit} className='space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <Input
              type='text'
              placeholder='Seu nome'
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              required
              className='text-sm'
            />
            <Input
              type='email'
              placeholder='Seu email'
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              required
              className='text-sm'
            />
          </div>

          <Button type='submit' disabled={isLoading} className='w-full'>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Inscrevendo...
              </>
            ) : (
              'Inscrever-se'
            )}
          </Button>
        </form>

        {message && (
          <Alert
            className={`mt-3 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
          >
            {message.type === 'success' ? (
              <CheckCircle className='h-4 w-4 text-green-600' />
            ) : (
              <AlertCircle className='h-4 w-4 text-red-600' />
            )}
            <AlertDescription
              className={
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <div className='flex-1'>
          <Input
            type='email'
            placeholder='Digite seu email'
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            required
          />
        </div>
        <Button
          onClick={e => {
            e.preventDefault()
            if (formData.email) {
              setFormData(prev => ({ ...prev, name: 'Usuário' }))
              handleSubmit(e as any)
            }
          }}
          disabled={isLoading || !formData.email}
        >
          {isLoading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            'Inscrever-se'
          )}
        </Button>

        {message && (
          <Alert
            className={`mt-3 col-span-full ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
          >
            {message.type === 'success' ? (
              <CheckCircle className='h-4 w-4 text-green-600' />
            ) : (
              <AlertCircle className='h-4 w-4 text-red-600' />
            )}
            <AlertDescription
              className={
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Variant padrão
  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <Mail className='h-5 w-5 mr-2 text-blue-600' />
          {title || 'Newsletter de Saúde'}
        </CardTitle>
        <CardDescription>
          {description ||
            'Receba dicas de saúde, novidades sobre tratamentos e informações importantes sobre nossos serviços.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Nome completo</Label>
            <Input
              id='name'
              type='text'
              placeholder='Digite seu nome'
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='Digite seu email'
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className='space-y-3'>
            <Label>Preferências de conteúdo:</Label>

            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='healthTips'
                  checked={formData.preferences.healthTips}
                  onCheckedChange={checked =>
                    handlePreferenceChange('healthTips', checked as boolean)
                  }
                />
                <Label htmlFor='healthTips' className='text-sm font-normal'>
                  Dicas de saúde e prevenção
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='appointments'
                  checked={formData.preferences.appointments}
                  onCheckedChange={checked =>
                    handlePreferenceChange('appointments', checked as boolean)
                  }
                />
                <Label htmlFor='appointments' className='text-sm font-normal'>
                  Lembretes de consultas e exames
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='promotions'
                  checked={formData.preferences.promotions}
                  onCheckedChange={checked =>
                    handlePreferenceChange('promotions', checked as boolean)
                  }
                />
                <Label htmlFor='promotions' className='text-sm font-normal'>
                  Promoções e ofertas especiais
                </Label>
              </div>
            </div>
          </div>

          <Button type='submit' disabled={isLoading} className='w-full'>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Inscrevendo...
              </>
            ) : (
              'Inscrever-se no Newsletter'
            )}
          </Button>
        </form>

        {message && (
          <Alert
            className={`mt-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
          >
            {message.type === 'success' ? (
              <CheckCircle className='h-4 w-4 text-green-600' />
            ) : (
              <AlertCircle className='h-4 w-4 text-red-600' />
            )}
            <AlertDescription
              className={
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <p className='text-xs text-gray-500 mt-4'>
          Ao se inscrever, você concorda em receber emails de nossa clínica.
          Você pode cancelar a inscrição a qualquer momento.
        </p>
      </CardContent>
    </Card>
  )
}
