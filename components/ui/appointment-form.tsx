'use client'

import { useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { scheduleDailyAgenda } from '../../lib/daily-agenda-scheduler'
import {
  UnifiedAppointment,
} from '../../lib/unified-patient-system-types'
import { validateCPF, formatCPF } from '../../lib/validation-schemas'
import { brazilianDateToISO } from '../../lib/date-utils'

interface AppointmentData {
  fullName: string
  cpf: string
  email: string
  phone: string
  whatsapp: string
  birthDate: string
  insuranceType: 'unimed' | 'particular' | ''
}

interface AppointmentErrors {
  fullName?: string
  cpf?: string
  email?: string
  phone?: string
  whatsapp?: string
  birthDate?: string
  insuranceType?: string
}

interface AppointmentFormProps {
  selectedDate: Date
  selectedTime: string
  onSubmit: (data: AppointmentData) => void
  onBack: () => void
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  selectedDate,
  selectedTime,
  onSubmit,
  onBack,
}) => {
  const [formData, setFormData] = useState<AppointmentData>({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    whatsapp: '',
    birthDate: '',
    insuranceType: '',
  })
  const [errors, setErrors] = useState<AppointmentErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [existingAppointment, setExistingAppointment] =
    useState<UnifiedAppointment | null>(null)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const validateForm = (): boolean => {
    const newErrors: AppointmentErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório'
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido. Verifique o número digitado.'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (
      !/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/.test(
        formData.phone.replace(/\D/g, '')
      )
    ) {
      newErrors.phone = 'Número de telefone inválido'
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório'
    } else if (
      !/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/.test(
        formData.whatsapp.replace(/\D/g, '')
      )
    ) {
      newErrors.whatsapp = 'Número de WhatsApp inválido'
    }

    if (!formData.birthDate.trim()) {
      newErrors.birthDate = 'Data de nascimento é obrigatória'
    } else {
      // Validar formato dd/mm/aaaa
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
      const match = formData.birthDate.match(dateRegex)

      if (!match) {
        newErrors.birthDate = 'Data deve estar no formato dd/mm/aaaa'
      } else {
        const [, day, month, year] = match
        const dayNum = parseInt(day, 10)
        const monthNum = parseInt(month, 10)
        const yearNum = parseInt(year, 10)

        // Validar se é uma data válida
        if (monthNum < 1 || monthNum > 12) {
          newErrors.birthDate = 'Mês inválido'
        } else if (dayNum < 1 || dayNum > 31) {
          newErrors.birthDate = 'Dia inválido'
        } else {
          // Criar data no formato ISO para validação
          const birthDate = new Date(yearNum, monthNum - 1, dayNum)
          const today = new Date()

          if (birthDate >= today) {
            newErrors.birthDate =
              'Data de nascimento deve ser anterior à data atual'
          } else if (yearNum < 1900) {
            newErrors.birthDate = 'Ano deve ser maior que 1900'
          }
        }
      }
    }

    if (!formData.insuranceType) {
      newErrors.insuranceType = 'Tipo de plano é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof AppointmentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    handleInputChange('phone', formatted)
  }

  const handleWhatsAppChange = (value: string) => {
    const formatted = formatPhone(value)
    handleInputChange('whatsapp', formatted)
  }

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')

    // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (digits.length <= 2) {
      return `(${digits}`
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    } else if (digits.length <= 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Converter data de nascimento do formato brasileiro para ISO
      const birthDateISO = brazilianDateToISO(formData.birthDate)

      // 1. CRÍTICO: Criar o agendamento primeiro (bloqueia UI)
      const response = await fetch('/api/public-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          birthDate: birthDateISO,
          insuranceType: formData.insuranceType as 'unimed' | 'particular',
          selectedDate: selectedDate.toISOString().split('T')[0], // Apenas YYYY-MM-DD
          selectedTime: selectedTime,
        }),
      })

      const appointmentResult = await response.json()
      console.log('📊 Resultado da API:', appointmentResult)

      if (!appointmentResult.success) {
        console.log(
          '❌ Erro no createPublicAppointment:',
          appointmentResult.error
        )
        if (
          appointmentResult.error === 'existing_appointment' &&
          appointmentResult.existingAppointment
        ) {
          setExistingAppointment(appointmentResult.existingAppointment)
          setShowRescheduleDialog(true)
          setIsSubmitting(false)
          return
        }
        throw new Error(appointmentResult.error || 'Erro ao criar agendamento')
      }

      console.log(
        '✅ Agendamento salvo no sistema unificado:',
        appointmentResult.appointment
      )

      // 2. OTIMIZAÇÃO: Liberar UI imediatamente após agendamento criado
      setIsSubmitting(false)
      onSubmit(formData)

      // 3. BACKGROUND: Processar notificações e lembretes em paralelo (não bloqueia UI)
      const backgroundTasks = [
        // Notificações WhatsApp
        sendNotifications({
          ...formData,
          selectedDate: formatDate(selectedDate),
          selectedTime,
        }).catch(error => {
          console.warn('⚠️ Erro nas notificações WhatsApp:', error)
          return []
        }),

        // Sistema de lembretes
        fetch('/api/reminder-system', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'schedule',
            patientName: formData.fullName,
            whatsapp: formData.whatsapp,
            appointmentDate: selectedDate,
            appointmentTime: selectedTime,
            insuranceType: formData.insuranceType,
            email: formData.email,
          }),
        }).then(res => res.json()).catch(error => {
          console.warn('⚠️ Erro no sistema de lembretes:', error)
          return { success: false, error: error.message }
        }),

        // Email de boas-vindas removido - sistema usa apenas Telegram
        Promise.resolve({ success: true, message: 'Email system removed' }),

        // Agenda diária
        scheduleDailyAgenda({
          patientName: formData.fullName,
          appointmentDate: selectedDate.toISOString().split('T')[0],
          appointmentTime: selectedTime,
          whatsapp: formData.whatsapp,
          insuranceType:
            formData.insuranceType === 'particular' ? 'private' : 'unimed',
        }).catch(error => {
          console.warn('⚠️ Erro na agenda diária:', error)
          return { success: false, error: error.message }
        })
      ]

      // Executar todas as tarefas em paralelo sem bloquear
      Promise.all(backgroundTasks).then(([notifications, reminders, welcomeEmail, agenda]) => {
        console.log('🚀 Processamento em background concluído:')
        console.log('📧 Notificações:', notifications)
        console.log('⏰ Lembretes:', reminders)
        console.log('📬 Email de boas-vindas:', welcomeEmail)
        console.log('📅 Agenda:', agenda)
      })

    } catch (error) {
      console.error('❌ Erro crítico no agendamento:', error)
      setIsSubmitting(false)
      alert('Erro ao criar agendamento. Tente novamente.')
    }
  }

  const sendNotifications = async (
    data: AppointmentData & { selectedDate: string; selectedTime: string }
  ) => {
    const notifications: string[] = []

    // Enviar confirmação WhatsApp melhorada
    try {
      const response = await fetch('/api/whatsapp-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        console.log('✅ Sistema de confirmação WhatsApp ativado!')
        console.log('\n📱 LINKS GERADOS:')
        console.log('👤 Para o paciente:', result.patientWhatsAppLink)
        console.log('👨‍⚕️ Para o médico:', result.doctorWhatsAppLink)
        console.log('\n📋 MENSAGENS:')
        console.log('📤 Confirmação para paciente:')
        console.log(result.patientMessage)
        console.log('\n🚨 Notificação para médico:')
        console.log(result.doctorMessage)

        notifications.push('whatsapp-confirmation')

        // Mostrar mensagem de sucesso simplificada
        alert('Agendamento marcado. Você receberá a confirmação através do WhatsApp.')
      } else {
        console.log('❌ Erro no sistema de confirmação:', result.error)
        alert('Agendamento marcado. Você receberá a confirmação através do WhatsApp.')
      }
    } catch (error) {
      console.error('❌ Erro na confirmação WhatsApp:', error)
      alert('Agendamento marcado. Você receberá a confirmação através do WhatsApp.')
    }

    return notifications
  }

  const handleReschedule = async () => {
    if (!existingAppointment) return

    try {
      setIsSubmitting(true)

      // Cancelar a consulta existente via API
      const cancelResponse = await fetch(`/api/unified-appointments/${existingAppointment.id}`, {
        method: 'DELETE',
      })

      if (!cancelResponse.ok) {
        throw new Error('Erro ao cancelar consulta existente')
      }

      // Criar nova consulta
      const birthDateISO = brazilianDateToISO(formData.birthDate)

      const response = await fetch('/api/public-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          birthDate: birthDateISO,
          insuranceType: formData.insuranceType as 'unimed' | 'particular',
          selectedDate: selectedDate.toISOString().split('T')[0], // Apenas YYYY-MM-DD
          selectedTime: selectedTime,
        }),
      })

      const appointmentResult = await response.json()

      if (!appointmentResult.success) {
        throw new Error(
          appointmentResult.error || 'Erro ao criar novo agendamento'
        )
      }

      console.log('✅ Consulta reagendada com sucesso')

      // Enviar notificações
      await sendNotifications({
        ...formData,
        selectedDate: formatDate(selectedDate),
        selectedTime,
      })

      // Agendar lembretes
      await scheduleDailyAgenda({
        patientName: formData.fullName,
        appointmentDate: selectedDate.toISOString().split('T')[0],
        appointmentTime: selectedTime,
        whatsapp: formData.whatsapp,
        insuranceType:
          formData.insuranceType === 'particular' ? 'private' : 'unimed',
      })

      onSubmit(formData)
    } catch (error) {
      console.error('❌ Erro ao reagendar:', error)
      alert('Erro ao reagendar consulta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
      setShowRescheduleDialog(false)
      setExistingAppointment(null)
    }
  }

  const handleCancelReschedule = () => {
    setShowRescheduleDialog(false)
    setExistingAppointment(null)
    setIsSubmitting(false)
    onBack() // Volta para a página inicial
  }

  // Diálogo de reagendamento
  if (showRescheduleDialog && existingAppointment) {
    return (
      <div className='bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-2xl mx-auto border border-gray-700'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4'>
            <svg
              className='h-6 w-6 text-yellow-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-white mb-2'>
            Consulta já agendada
          </h3>
          <div className='text-gray-300 mb-6'>
            <p className='mb-2'>Você já possui uma consulta agendada para:</p>
            <div className='bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30'>
              <p className='font-semibold text-yellow-300'>
                {existingAppointment.date
                  .split('-')
                  .reverse()
                  .join('/')}{' '}
                às {existingAppointment.time}
              </p>
            </div>
            <p className='mt-4 text-sm'>
              Deseja reagendar para a nova data selecionada?
            </p>
            <div className='bg-blue-500/10 p-4 rounded-lg border border-blue-500/30 mt-3'>
              <p className='font-semibold text-blue-300'>
                {formatDate(selectedDate)} às {selectedTime}
              </p>
            </div>
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <button
              type='button'
              onClick={handleCancelReschedule}
              className='flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors'
            >
              Cancelar
            </button>
            <button
              type='button'
              onClick={handleReschedule}
              disabled={isSubmitting}
              className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'Reagendando...' : 'Reagendar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-2xl mx-auto border border-gray-700'>
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-3 bg-blue-500/20 rounded-xl'>
            <svg
              className='w-6 h-6 text-blue-400'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' />
            </svg>
          </div>
          <h2 className='text-2xl font-bold text-white'>
            Confirmar Agendamento
          </h2>
        </div>
        <div className='bg-blue-500/10 p-5 rounded-xl border border-blue-500/30'>
          <div className='flex items-center mb-3'>
            <CheckCircleIcon className='h-6 w-6 text-blue-400 mr-3' />
            <span className='font-semibold text-blue-300 text-lg'>
              Data e horário selecionados:
            </span>
          </div>
          <p className='text-blue-200 capitalize text-lg font-medium'>
            {formatDate(selectedDate)} às {selectedTime}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Nome Completo */}
        <div>
          <label
            htmlFor='fullName'
            className='block text-sm font-medium text-gray-300 mb-3'
          >
            Nome Completo *
          </label>
          <input
            type='text'
            id='fullName'
            value={formData.fullName}
            onChange={e => handleInputChange('fullName', e.target.value)}
            className={`
              w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400
              ${errors.fullName ? 'border-red-500 bg-red-900/20' : 'border-gray-600'}
            `}
            placeholder='Digite seu nome completo'
          />
          {errors.fullName && (
            <p className='mt-2 text-sm text-red-400 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {errors.fullName}
            </p>
          )}
        </div>

        {/* CPF */}
        <div>
          <label
            htmlFor='cpf'
            className='block text-sm font-medium text-gray-300 mb-3'
          >
            CPF *
          </label>
          <input
            type='text'
            id='cpf'
            value={formData.cpf}
            onChange={e => {
              const cleanValue = e.target.value.replace(/\D/g, '')
              const formatted =
                cleanValue.length === 11 ? formatCPF(cleanValue) : cleanValue
              handleInputChange('cpf', formatted)
            }}
            className={`
              w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400
              ${errors.cpf ? 'border-red-500 bg-red-900/20' : 'border-gray-600'}
            `}
            placeholder='000.000.000-00'
            maxLength={14}
          />
          {errors.cpf && (
            <p className='mt-2 text-sm text-red-400 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {errors.cpf}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-300 mb-3'
          >
            Email *
          </label>
          <input
            type='email'
            id='email'
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            className={`
              w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400
              ${errors.email ? 'border-red-500 bg-red-900/20' : 'border-gray-600'}
            `}
            placeholder='seu@email.com'
          />
          {errors.email && (
            <p className='mt-2 text-sm text-red-400 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label
            htmlFor='phone'
            className='block text-sm font-medium text-gray-300 mb-3'
          >
            Telefone *
          </label>
          <input
            type='tel'
            id='phone'
            value={formData.phone}
            onChange={e => handlePhoneChange(e.target.value)}
            className={`
              w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400
              ${errors.phone ? 'border-red-500 bg-red-900/20' : 'border-gray-600'}
            `}
            placeholder='(11) 3333-4444'
            maxLength={15}
          />
          {errors.phone && (
            <p className='mt-2 text-sm text-red-400 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {errors.phone}
            </p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label
            htmlFor='whatsapp'
            className='block text-sm font-medium text-gray-300 mb-3'
          >
            WhatsApp *
          </label>
          <input
            type='tel'
            id='whatsapp'
            value={formData.whatsapp}
            onChange={e => handleWhatsAppChange(e.target.value)}
            className={`
              w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400
              ${errors.whatsapp ? 'border-red-500 bg-red-900/20' : 'border-gray-600'}
            `}
            placeholder='(11) 99999-9999'
            maxLength={15}
          />
          {errors.whatsapp && (
            <p className='mt-2 text-sm text-red-400 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {errors.whatsapp}
            </p>
          )}
        </div>

        {/* Data de Nascimento */}
        <div>
          <label
            htmlFor='birthDate'
            className='block text-sm font-medium text-gray-300 mb-3'
          >
            Data de Nascimento *
          </label>
          <input
            type='text'
            id='birthDate'
            placeholder='dd/mm/aaaa'
            value={formData.birthDate}
            onChange={e => {
              // Formatar automaticamente para dd/mm/aaaa
              let value = e.target.value.replace(/\D/g, '')
              if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2)
              }
              if (value.length >= 5) {
                value = value.substring(0, 5) + '/' + value.substring(5, 9)
              }
              handleInputChange('birthDate', value)
            }}
            className={`
              w-full px-4 py-3 bg-gray-700/50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white
              ${errors.birthDate ? 'border-red-500 bg-red-900/20' : 'border-gray-600'}
            `}
            maxLength={10}
          />
          {errors.birthDate && (
            <p className='mt-2 text-sm text-red-400 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {errors.birthDate}
            </p>
          )}
        </div>

        {/* Tipo de Plano */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-4'>
            Tipo de Plano *
          </label>
          <div className='space-y-4'>
            <label
              className={`flex items-center p-5 border rounded-xl cursor-pointer transition-all ${
                formData.insuranceType === 'unimed'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:bg-gray-700/30'
              }`}
            >
              <input
                type='radio'
                name='insuranceType'
                value='unimed'
                checked={formData.insuranceType === 'unimed'}
                onChange={e =>
                  handleInputChange('insuranceType', e.target.value)
                }
                className='h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-600 bg-gray-700'
              />
              <div className='ml-4'>
                <div className='text-base font-semibold text-white'>UNIMED</div>
                <div className='text-sm text-gray-400'>
                  Atendimento via convênio UNIMED
                </div>
              </div>
            </label>

            <label
              className={`flex items-center p-5 border rounded-xl cursor-pointer transition-all ${
                formData.insuranceType === 'particular'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:bg-gray-700/30'
              }`}
            >
              <input
                type='radio'
                name='insuranceType'
                value='particular'
                checked={formData.insuranceType === 'particular'}
                onChange={e =>
                  handleInputChange('insuranceType', e.target.value)
                }
                className='h-5 w-5 text-green-500 focus:ring-green-500 border-gray-600 bg-gray-700'
              />
              <div className='ml-4'>
                <div className='text-base font-semibold text-white'>
                  Particular
                </div>
                <div className='text-sm text-gray-400'>
                  Atendimento particular (sem convênio)
                </div>
              </div>
            </label>
          </div>
          {errors.insuranceType && (
            <p className='mt-3 text-sm text-red-400 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {errors.insuranceType}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-700'>
          <button
            type='button'
            onClick={onBack}
            className='flex-1 px-6 py-4 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-all font-medium bg-gray-700/30'
          >
            <svg
              className='w-5 h-5 inline mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            Voltar
          </button>
          <button
            type='submit'
            disabled={isSubmitting}
            className={`
              flex-1 px-6 py-4 rounded-xl font-semibold transition-all shadow-lg
              ${
                isSubmitting
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white inline'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Confirmando...
              </>
            ) : (
              <>
                <svg
                  className='w-5 h-5 inline mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                Confirmar Agendamento
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AppointmentForm
