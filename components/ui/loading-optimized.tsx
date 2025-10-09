'use client'

/**
 * @deprecated Este arquivo está duplicado. Use @/components/ui/loading ao invés.
 * Este arquivo será removido em uma versão futura.
 */

import React, { Suspense } from 'react'

// Componente de loading básico otimizado
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = React.memo(({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
    </div>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

// Skeleton loader otimizado para listas
const SkeletonLoader: React.FC<{ rows?: number }> = React.memo(({ rows = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

SkeletonLoader.displayName = 'SkeletonLoader'

// Componente de loading para tabelas
const TableSkeleton: React.FC<{ columns?: number; rows?: number }> = React.memo(({ 
  columns = 4, 
  rows = 5 
}) => {
  return (
    <div className="animate-pulse">
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

TableSkeleton.displayName = 'TableSkeleton'

// HOC para lazy loading de componentes
export const withLazyLoading = <P extends Record<string, any> = Record<string, any>>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = <LoadingSpinner />
) => {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }))
  
  return React.memo((props: P) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  ))
}

// Hook para controle de loading state
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState)
  
  const startLoading = React.useCallback(() => setIsLoading(true), [])
  const stopLoading = React.useCallback(() => setIsLoading(false), [])
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), [])
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading
  }
}

export { LoadingSpinner, SkeletonLoader, TableSkeleton }