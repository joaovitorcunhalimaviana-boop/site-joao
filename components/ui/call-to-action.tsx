'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  PhoneIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

interface CTAProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children: React.ReactNode
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
  fullWidth?: boolean
  disabled?: boolean
}

export function CallToAction({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  href,
  onClick,
  icon,
  fullWidth = false,
  disabled = false,
}: CTAProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    {
      'w-full': fullWidth,
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
    },
    className
  )

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600',
    secondary:
      'bg-gray-700 text-white hover:bg-gray-600 border border-gray-700',
    outline:
      'bg-transparent text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-400',
  }

  const content = (
    <>
      {icon && <span className='mr-2'>{icon}</span>}
      {children}
      <ArrowRightIcon className='ml-2 w-4 h-4' />
    </>
  )

  const classes = cn(baseClasses, variantClasses[variant])

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  )
}

// CTAs específicos para o site médico
export function AgendarConsultaCTA({ className = '' }: { className?: string }) {
  return (
    <CallToAction
      href='/agendamento'
      variant='primary'
      size='lg'
      icon={<CalendarDaysIcon className='w-5 h-5' />}
      className={className}
    >
      Agendar Consulta
    </CallToAction>
  )
}

export function WhatsAppCTA({ className = '' }: { className?: string }) {
  return (
    <CallToAction
      href='https://wa.me/5583991221599?text=Olá! Gostaria de agendar uma consulta com Dr. João Vítor Viana.'
      variant='secondary'
      size='lg'
      icon={<ChatBubbleLeftRightIcon className='w-5 h-5' />}
      className={className}
    >
      WhatsApp
    </CallToAction>
  )
}

export function TelefoneCTA({ className = '' }: { className?: string }) {
  return (
    <CallToAction
      href='tel:+5583991221599'
      variant='outline'
      size='md'
      icon={<PhoneIcon className='w-4 h-4' />}
      className={className}
    >
      (83) 9 9122-1599
    </CallToAction>
  )
}

// Seção CTA completa
export function CTASection({
  title = 'Precisa de ajuda?',
  subtitle = 'Entre em contato conosco e agende sua consulta',
  className = '',
}: {
  title?: string
  subtitle?: string
  className?: string
}) {
  return (
    <section className={cn('py-16 bg-transparent', className)}>
      <div className='max-w-4xl mx-auto px-4 text-center'>
        <h2 className='text-3xl font-bold text-white mb-4'>{title}</h2>
        <p className='text-lg text-gray-300 mb-8'>{subtitle}</p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <AgendarConsultaCTA />
          <WhatsAppCTA />
        </div>

        <div className='mt-8 text-sm text-gray-400'>
          <p>Consultas presenciais, teleconsultas e visitas domiciliares</p>
        </div>
      </div>
    </section>
  )
}
