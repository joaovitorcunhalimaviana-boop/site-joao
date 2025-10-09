'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface NewsletterFormData {
  name: string
  email: string
  whatsapp: string
  birthDate: string
}

export default function NewsletterSection() {
  const [formData, setFormData] = useState<NewsletterFormData>({
    name: '',
    email: '',
    whatsapp: '',
    birthDate: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (field: keyof NewsletterFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{4})/, '($1) $2')
        .replace(/(\d{2})/, '($1')
    }
    return value
  }

  // Função para formatar data no padrão brasileiro (DD/MM/YYYY)
  const formatDateToBrazilian = (dateString: string) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  // Função para converter data brasileira para formato ISO (YYYY-MM-DD)
  const formatDateToISO = (brazilianDate: string) => {
    if (!brazilianDate) return ''
    const cleanDate = brazilianDate.replace(/\D/g, '')
    if (cleanDate.length === 8) {
      const day = cleanDate.substring(0, 2)
      const month = cleanDate.substring(2, 4)
      const year = cleanDate.substring(4, 8)
      return `${year}-${month}-${day}`
    }
    return ''
  }

  const handleDateChange = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara DD/MM/YYYY
    let formatted = numbers
    if (numbers.length >= 2) {
      formatted = numbers.substring(0, 2) + '/' + numbers.substring(2)
    }
    if (numbers.length >= 4) {
      formatted = numbers.substring(0, 2) + '/' + numbers.substring(2, 4) + '/' + numbers.substring(4, 8)
    }
    
    setFormData(prev => ({
      ...prev,
      birthDate: formatted
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage('Nome é obrigatório')
      return false
    }
    
    if (!formData.email.trim()) {
      setErrorMessage('Email é obrigatório')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Email inválido')
      return false
    }
    
    if (!formData.whatsapp.trim()) {
      setErrorMessage('WhatsApp é obrigatório')
      return false
    }
    
    const whatsappNumbers = formData.whatsapp.replace(/\D/g, '')
    if (whatsappNumbers.length < 10 || whatsappNumbers.length > 11) {
      setErrorMessage('WhatsApp deve ter 10 ou 11 dígitos')
      return false
    }
    
    if (!formData.birthDate) {
      setErrorMessage('Data de nascimento é obrigatória')
      return false
    }
    
    const isoDate = formatDateToISO(formData.birthDate)
    if (!isoDate) {
      setErrorMessage('Data de nascimento inválida')
      return false
    }
    
    const birthDate = new Date(isoDate)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    
    if (age < 0 || age > 120) {
      setErrorMessage('Data de nascimento inválida')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setSubmitStatus('error')
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')
    
    try {
      const isoDate = formatDateToISO(formData.birthDate)
      
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'subscribe',
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp.replace(/\D/g, ''), // Enviar apenas números
          birthDate: isoDate
        }),
      })
      
      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          whatsapp: '',
          birthDate: ''
        })
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.message || 'Erro ao cadastrar na newsletter')
        setSubmitStatus('error')
      }
    } catch (error) {
      setErrorMessage('Erro de conexão. Tente novamente.')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16 bg-black">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Receba Conteúdo Exclusivo
          </h2>
          <p className="text-base text-gray-300">
            Cadastre-se em nossa newsletter e receba dicas de saúde, 
            informações sobre tratamentos e lembretes especiais
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Cadastro Realizado com Sucesso!
              </h3>
              <p className="text-gray-300 mb-4">
                Obrigado por se inscrever em nossa newsletter. 
                Você receberá conteúdos exclusivos em seu email.
              </p>
              <Button 
                onClick={() => setSubmitStatus('idle')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Fazer Novo Cadastro
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h3 className="text-xl text-white mb-6">
                  Newsletter Dr. João Vítor Viana
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Primeira linha: Nome + Data de Nascimento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white text-sm">
                      Nome Completo
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-white text-sm">
                      Data de Nascimento
                    </Label>
                    <Input
                      id="birthDate"
                      type="text"
                      value={formData.birthDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      placeholder="DD/MM/AAAA"
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                {/* Segunda linha: Email + WhatsApp */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-white text-sm">
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', formatWhatsApp(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      maxLength={15}
                      required
                    />
                  </div>
                </div>

                {/* Mensagem de Erro */}
                {submitStatus === 'error' && errorMessage && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 text-sm">{errorMessage}</span>
                  </div>
                )}

                {/* Botão de Submit */}
                <div className="text-center pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-8 py-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Cadastrando...
                      </div>
                    ) : (
                      'Cadastrar na Newsletter'
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}