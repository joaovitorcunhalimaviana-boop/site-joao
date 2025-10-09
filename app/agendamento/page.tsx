'use client'

import { useState } from 'react'
import Calendar from '../../components/ui/calendar'
import TimeSlots from '../../components/ui/time-slots'
import AppointmentForm from '../../components/ui/appointment-form'
import { formatDateToBrazilian } from '@/lib/date-utils'

import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import BackgroundPattern from '../../components/ui/background-pattern'
import {
  CheckCircleIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

type Step = 'date' | 'time' | 'form' | 'success'

interface AppointmentData {
  fullName: string
  cpf: string
  email: string
  whatsapp: string
  birthDate: string
  insuranceType: 'unimed' | 'particular' | ''
}

const AgendamentoPage = () => {
  const [currentStep, setCurrentStep] = useState<Step>('date')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | undefined>()
  const [appointmentData, setAppointmentData] = useState<
    AppointmentData | undefined
  >()

  const handleDateSelect = (date: Date) => {
    if (!date) return

    setSelectedDate(date)
    setCurrentStep('time')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setCurrentStep('form')
  }

  const handleFormSubmit = (data: AppointmentData) => {
    setAppointmentData(data)
    setCurrentStep('success')
  }

  const handleBackToDate = () => {
    setCurrentStep('date')
    setSelectedDate(undefined)
    setSelectedTime(undefined)
  }

  const handleBackToTime = () => {
    setCurrentStep('time')
    setSelectedTime(undefined)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'date':
        return 'Selecione a Data'
      case 'time':
        return 'Escolha o Horário'
      case 'form':
        return 'Dados do Paciente'
      case 'success':
        return 'Agendamento Confirmado'
      default:
        return ''
    }
  }

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='agendamento' />
      <div className='pt-32 pb-12'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Page Title */}
          <div className='text-center mb-8'>
            <div
              className='inline-block p-3 bg-blue-900/20 rounded-2xl mb-6'
              style={{ padding: '12px !important' }}
            >
              <svg
                className='w-8 h-8 text-blue-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                style={{ width: '56px !important', height: '56px !important' }}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
            <h1
              className='text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight'
              style={{
                fontSize: 'clamp(3.5rem, 8vw, 6rem) !important',
                fontWeight: 'bold !important',
                marginBottom: '1.5rem !important',
              }}
            >
              Agendamento
              <span
                className='block text-blue-400 mt-2'
                style={{
                  display: 'block !important',
                  marginTop: '0.5rem !important',
                  fontSize: 'inherit !important',
                }}
              >
                de Consultas
              </span>
            </h1>
            <p
              className='text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed'
              style={{
                fontSize: '1.25rem !important',
                lineHeight: '1.75 !important',
                maxWidth: '48rem !important',
              }}
            >
              Agende sua consulta com o Dr. João Vitor Viana de forma rápida e
              prática através dos nossos
              <span className='text-blue-400 font-bold'>
                {' '}
                canais de atendimento
              </span>
            </p>
            <div
              className='mt-6 h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mx-auto'
              style={{
                marginTop: '1.5rem !important',
                height: '4px !important',
                width: '5rem !important',
              }}
            ></div>
          </div>

          {/* Progress Steps */}
          <div className='mb-8'>
            <div className='flex items-center justify-center space-x-4'>
              {/* Step 1: Date */}
              <div className='flex items-center'>
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    currentStep === 'date' || !selectedDate
                      ? 'bg-blue-600 text-white'
                      : 'bg-green-500 text-white'
                  }
                `}
                >
                  {selectedDate ? <CheckCircleIcon className='h-5 w-5' /> : '1'}
                </div>
                <span className='ml-2 text-sm font-medium text-gray-300'>
                  Data
                </span>
              </div>

              <div className='w-8 h-0.5 bg-gray-600'></div>

              {/* Step 2: Time */}
              <div className='flex items-center'>
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    currentStep === 'time'
                      ? 'bg-blue-600 text-white'
                      : selectedTime
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                  }
                `}
                >
                  {selectedTime ? <CheckCircleIcon className='h-5 w-5' /> : '2'}
                </div>
                <span className='ml-2 text-sm font-medium text-gray-300'>
                  Horário
                </span>
              </div>

              <div className='w-8 h-0.5 bg-gray-600'></div>

              {/* Step 3: Form */}
              <div className='flex items-center'>
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    currentStep === 'form'
                      ? 'bg-blue-600 text-white'
                      : appointmentData
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-300'
                  }
                `}
                >
                  {appointmentData ? (
                    <CheckCircleIcon className='h-5 w-5' />
                  ) : (
                    '3'
                  )}
                </div>
                <span className='ml-2 text-sm font-medium text-gray-300'>
                  Dados
                </span>
              </div>

              <div className='w-8 h-0.5 bg-gray-600'></div>

              {/* Step 4: Success */}
              <div className='flex items-center'>
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    currentStep === 'success'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }
                `}
                >
                  {currentStep === 'success' ? (
                    <CheckCircleIcon className='h-5 w-5' />
                  ) : (
                    '4'
                  )}
                </div>
                <span className='ml-2 text-sm font-medium text-gray-300'>
                  Confirmação
                </span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className='bg-gray-900 rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-white mb-6 text-center'>
              {getStepTitle()}
            </h2>

            {currentStep === 'date' && (
              <div>
                <Calendar
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate || new Date()}
                />

                {/* Seção de Preços - Abaixo do Calendário */}
                <div className='mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700 max-w-sm mx-auto'>
                  <div className='text-center'>
                    <h3 className='text-lg font-semibold text-white mb-3'>
                      Valor da Consulta
                    </h3>
                    <div className='text-2xl font-bold text-white'>
                      R$ 400,00
                    </div>
                    <p className='text-gray-400 text-sm mt-2'>
                      Consulta Particular
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'time' && selectedDate && (
              <div>
                <div className='mb-4 text-center'>
                  <p className='text-gray-300'>
                    Data selecionada:{' '}
                    <span className='text-white font-medium'>
                      {formatDate(selectedDate)}
                    </span>
                  </p>
                </div>
                <TimeSlots
                  selectedDate={selectedDate}
                  onTimeSelect={handleTimeSelect}
                />
                <div className='mt-6 text-center'>
                  <button
                    onClick={handleBackToDate}
                    className='inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    <ArrowLeftIcon className='h-4 w-4 mr-2' />
                    Voltar para Data
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'form' && selectedDate && selectedTime && (
              <div>
                <div className='mb-4 text-center'>
                  <p className='text-gray-300'>
                    <span className='text-white font-medium'>
                      {formatDate(selectedDate)}
                    </span>{' '}
                    às{' '}
                    <span className='text-white font-medium'>
                      {selectedTime}
                    </span>
                  </p>
                </div>
                <AppointmentForm
                  onSubmit={handleFormSubmit}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onBack={() => setCurrentStep('time')}
                />
                <div className='mt-6 text-center'>
                  <button
                    onClick={handleBackToTime}
                    className='inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    <ArrowLeftIcon className='h-4 w-4 mr-2' />
                    Voltar para Horário
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'success' &&
              appointmentData &&
              selectedDate &&
              selectedTime && (
                <div className='text-center'>
                  <div className='mb-6'>
                    <CheckCircleIcon className='h-16 w-16 text-green-500 mx-auto mb-4' />
                    <h3 className='text-2xl font-bold text-white mb-2'>
                      Consulta Confirmada
                    </h3>
                    <p className='text-gray-300 mb-4 text-lg'>
                      Você receberá uma notificação pelo WhatsApp.
                    </p>
                  </div>

                  <div className='space-y-4'>
                    <button
                      onClick={() => {
                        setCurrentStep('date')
                        setSelectedDate(undefined)
                        setSelectedTime(undefined)
                        setAppointmentData(undefined)
                      }}
                      className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    >
                      Novo Agendamento
                    </button>

                    <button
                      onClick={() => (window.location.href = '/')}
                      className='w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                    >
                      Voltar ao Início
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AgendamentoPage
