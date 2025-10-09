import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, Heart, Stethoscope } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'pulse' | 'medical' | 'skeleton'
  text?: string
  className?: string
  fullScreen?: boolean
  overlay?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

// Componente principal de loading
export function Loading({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  fullScreen = false,
  overlay = false,
}: LoadingProps) {
  const LoadingIcon = () => {
    switch (variant) {
      case 'medical':
        return (
          <div className='relative'>
            <Stethoscope
              className={cn(sizeClasses[size], 'animate-pulse text-blue-600')}
            />
            <Heart
              className={cn(
                sizeClasses[size],
                'absolute top-0 left-0 animate-ping text-red-500 opacity-75'
              )}
            />
          </div>
        )
      case 'pulse':
        return (
          <div
            className={cn(
              'rounded-full bg-blue-600 animate-pulse',
              sizeClasses[size]
            )}
          />
        )
      case 'skeleton':
        return (
          <div className='space-y-2'>
            <div className='h-4 bg-gray-200 rounded animate-pulse' />
            <div className='h-4 bg-gray-200 rounded animate-pulse w-3/4' />
            <div className='h-4 bg-gray-200 rounded animate-pulse w-1/2' />
          </div>
        )
      default:
        return (
          <Loader2
            className={cn(sizeClasses[size], 'animate-spin text-blue-600')}
          />
        )
    }
  }

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen && 'min-h-screen',
        className
      )}
    >
      <LoadingIcon />
      {text && (
        <p
          className={cn(
            'text-gray-600 font-medium animate-pulse',
            textSizeClasses[size]
          )}
        >
          {text}
        </p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className='fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center'>
        {content}
      </div>
    )
  }

  return content
}

// Loading específico para botões
export function ButtonLoading({
  size = 'sm',
  className,
}: {
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <Loader2
      className={cn(
        'animate-spin',
        size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
        className
      )}
    />
  )
}

// Loading para cards
export function CardLoading({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <div className='h-6 bg-gray-200 rounded animate-pulse' />
      <div className='space-y-2'>
        <div className='h-4 bg-gray-200 rounded animate-pulse' />
        <div className='h-4 bg-gray-200 rounded animate-pulse w-3/4' />
        <div className='h-4 bg-gray-200 rounded animate-pulse w-1/2' />
      </div>
      <div className='flex gap-2'>
        <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
        <div className='h-8 w-16 bg-gray-200 rounded animate-pulse' />
      </div>
    </div>
  )
}

// Loading para tabelas
export function TableLoading({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div
        className='grid gap-4'
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className='h-6 bg-gray-200 rounded animate-pulse' />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className='grid gap-4'
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className='h-4 bg-gray-100 rounded animate-pulse'
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Loading para listas
export function ListLoading({
  items = 5,
  className,
}: {
  items?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gray-200 rounded-full animate-pulse' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-gray-200 rounded animate-pulse' />
            <div className='h-3 bg-gray-100 rounded animate-pulse w-2/3' />
          </div>
        </div>
      ))}
    </div>
  )
}

// Loading para formulários
export function FormLoading({
  fields = 4,
  className,
}: {
  fields?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className='space-y-2'>
          <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
          <div className='h-10 bg-gray-100 rounded animate-pulse' />
        </div>
      ))}
      <div className='flex gap-2 pt-4'>
        <div className='h-10 w-24 bg-blue-200 rounded animate-pulse' />
        <div className='h-10 w-20 bg-gray-200 rounded animate-pulse' />
      </div>
    </div>
  )
}

// Loading para páginas médicas
export function MedicalPageLoading() {
  return (
    <div className='container mx-auto px-4 py-8 space-y-8'>
      {/* Header */}
      <div className='space-y-4'>
        <div className='h-8 bg-gray-200 rounded animate-pulse w-1/2' />
        <div className='h-4 bg-gray-100 rounded animate-pulse w-3/4' />
      </div>

      {/* Content sections */}
      <div className='grid md:grid-cols-3 gap-8'>
        <div className='md:col-span-2 space-y-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='space-y-3'>
              <div className='h-6 bg-gray-200 rounded animate-pulse w-1/3' />
              <div className='space-y-2'>
                <div className='h-4 bg-gray-100 rounded animate-pulse' />
                <div className='h-4 bg-gray-100 rounded animate-pulse w-5/6' />
                <div className='h-4 bg-gray-100 rounded animate-pulse w-4/6' />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className='space-y-4'>
          <div className='h-6 bg-gray-200 rounded animate-pulse w-1/2' />
          <CardLoading />
          <CardLoading />
        </div>
      </div>
    </div>
  )
}

// Loading para calculadoras médicas
export function CalculatorLoading() {
  return (
    <div className='max-w-2xl mx-auto p-6 space-y-6'>
      <div className='text-center space-y-2'>
        <div className='h-8 bg-gray-200 rounded animate-pulse w-1/2 mx-auto' />
        <div className='h-4 bg-gray-100 rounded animate-pulse w-3/4 mx-auto' />
      </div>

      <div className='bg-white rounded-lg border p-6'>
        <FormLoading fields={6} />
      </div>

      <div className='bg-blue-50 rounded-lg p-6'>
        <div className='h-6 bg-blue-200 rounded animate-pulse w-1/3 mb-4' />
        <div className='space-y-2'>
          <div className='h-4 bg-blue-100 rounded animate-pulse' />
          <div className='h-4 bg-blue-100 rounded animate-pulse w-2/3' />
        </div>
      </div>
    </div>
  )
}

// Hook para estados de loading
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState)

  const startLoading = React.useCallback(() => setIsLoading(true), [])
  const stopLoading = React.useCallback(() => setIsLoading(false), [])
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), [])

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading,
  }
}

// Componente de loading com timeout
export function LoadingWithTimeout({
  timeout = 10000,
  onTimeout,
  ...props
}: LoadingProps & {
  timeout?: number
  onTimeout?: () => void
}) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout?.()
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout, onTimeout])

  return <Loading {...props} />
}
