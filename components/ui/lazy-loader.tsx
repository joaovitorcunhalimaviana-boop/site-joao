'use client'

import React, { Suspense, lazy, ComponentType } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Interface para props do componente de loading
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

// Componente de loading personalizado
export function LoadingSpinner({
  size = 'md',
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div
      className={cn('flex flex-col items-center justify-center p-8', className)}
    >
      <Loader2
        className={cn('animate-spin text-blue-600', sizeClasses[size])}
      />
      {text && (
        <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>{text}</p>
      )}
    </div>
  )
}

// Interface para props do LazyWrapper
interface LazyWrapperProps {
  fallback?: React.ComponentType<any>
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
  className?: string
  loadingText?: string
}

// Componente de erro padrão
function DefaultErrorFallback({
  error,
  retry,
}: {
  error: Error
  retry: () => void
}) {
  return (
    <div className='flex flex-col items-center justify-center p-8 text-center'>
      <div className='rounded-lg bg-red-50 p-4 dark:bg-red-900/20'>
        <h3 className='text-lg font-semibold text-red-800 dark:text-red-200'>
          Erro ao carregar componente
        </h3>
        <p className='mt-2 text-sm text-red-600 dark:text-red-300'>
          {error.message || 'Ocorreu um erro inesperado'}
        </p>
        <button
          onClick={retry}
          className='mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

// Hook para lazy loading com error boundary
export function useLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyWrapperProps = {}
) {
  const {
    fallback: CustomFallback,
    errorFallback: CustomErrorFallback = DefaultErrorFallback,
    className,
    loadingText = 'Carregando...',
  } = options

  const LazyComponent = lazy(importFn)
  const FallbackComponent =
    CustomFallback ||
    (() => <LoadingSpinner className={className} text={loadingText} />)

  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <ErrorBoundary fallback={CustomErrorFallback}>
        <Suspense fallback={<FallbackComponent />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

// Error Boundary para capturar erros de lazy loading
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode
    fallback: React.ComponentType<{ error: Error; retry: () => void }>
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback
      return <FallbackComponent error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

// HOC para lazy loading de páginas
export function withLazyLoading<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyWrapperProps = {}
) {
  return useLazyComponent(importFn, options)
}

// Componente para lazy loading de imagens
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  placeholder = '/placeholder.svg',
  className,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [isInView, setIsInView] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  // Intersection Observer para lazy loading
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder enquanto carrega */}
      {!isLoaded && !hasError && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800'>
          <LoadingSpinner size='sm' />
        </div>
      )}

      {/* Imagem principal */}
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Fallback em caso de erro */}
      {hasError && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800'>
          <div className='text-center'>
            <div className='text-gray-400 dark:text-gray-600'>📷</div>
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              Erro ao carregar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook para preload de componentes
export function usePreloadComponent(importFn: () => Promise<any>) {
  React.useEffect(() => {
    // Preload após um pequeno delay para não bloquear o carregamento inicial
    const timer = setTimeout(() => {
      importFn().catch(console.error)
    }, 100)

    return () => clearTimeout(timer)
  }, [importFn])
}

// Componente para lazy loading de seções
interface LazySectionProps {
  children: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  fallback?: React.ReactNode
}

export function LazySection({
  children,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const sectionRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div ref={sectionRef} className={className}>
      {isVisible ? children : fallback || <LoadingSpinner />}
    </div>
  )
}

// Utilitário para code splitting de rotas
export const createLazyRoute = (importFn: () => Promise<any>) => {
  return lazy(importFn)
}

// Presets comuns de lazy loading
export const LazyPresets = {
  // Para componentes de dashboard
  dashboard: {
    loadingText: 'Carregando dashboard...',
    className: 'min-h-[400px]',
  },

  // Para modais
  modal: {
    loadingText: 'Carregando...',
    className: 'min-h-[200px]',
  },

  // Para páginas completas
  page: {
    loadingText: 'Carregando página...',
    className: 'min-h-screen',
  },

  // Para componentes pequenos
  component: {
    loadingText: '',
    className: 'min-h-[100px]',
  },
}
