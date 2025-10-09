'use client'

/**
 * @deprecated Este arquivo está duplicado. Use @/components/ui/loading ao invés.
 * Este arquivo será removido em uma versão futura.
 *
 * Migração:
 * - LoadingSpinner -> Loading com variant="spinner"
 * - SkeletonLoader -> Loading com variant="skeleton"
 * - CardSkeleton -> CardLoading de @/components/ui/loading
 * - PageLoader -> Loading com fullScreen={true}
 */

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  text,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-600 border-t-blue-400',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className='mt-2 text-sm text-gray-400 animate-pulse'>{text}</p>
      )}
    </div>
  )
}

// Componente para skeleton loading
export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-gray-700 rounded-md', className)} />
  )
}

// Componente para loading de cards
export function CardSkeleton() {
  return (
    <div className='bg-gray-900 rounded-lg p-6 border border-gray-700'>
      <SkeletonLoader className='h-4 w-3/4 mb-4' />
      <SkeletonLoader className='h-3 w-full mb-2' />
      <SkeletonLoader className='h-3 w-2/3 mb-4' />
      <SkeletonLoader className='h-8 w-24' />
    </div>
  )
}

// Componente para loading de página completa
export function PageLoader({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <div className='text-center'>
        <LoadingSpinner size='xl' />
        <p className='mt-4 text-lg text-gray-300'>{text}</p>
      </div>
    </div>
  )
}

// Componente para loading inline
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className='flex items-center space-x-2'>
      <LoadingSpinner size='sm' />
      {text && <span className='text-sm text-gray-400'>{text}</span>}
    </div>
  )
}
