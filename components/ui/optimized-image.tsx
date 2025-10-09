'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// Interface expandida para props da imagem otimizada
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  containerClassName?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
  showLoader?: boolean
  loaderClassName?: string
  errorClassName?: string
  enableIntersectionObserver?: boolean
  rootMargin?: string
  threshold?: number
  enableRetry?: boolean
  maxRetries?: number
  retryDelay?: number
}

// Hook para Intersection Observer
function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, options, hasIntersected])

  return { isIntersecting, hasIntersected }
}

// Componente principal OptimizedImage
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc,
  showLoader = true,
  loaderClassName,
  errorClassName,
  enableIntersectionObserver = true,
  rootMargin = '50px',
  threshold = 0.1,
  enableRetry = true,
  maxRetries = 3,
  retryDelay = 1000,
}: OptimizedImageProps) {
  const imgRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [retryCount, setRetryCount] = useState(0)

  // Intersection Observer para lazy loading
  const { hasIntersected } = useIntersectionObserver(imgRef, {
    rootMargin,
    threshold,
  })

  // Determinar se deve carregar a imagem
  const shouldLoad = priority || !enableIntersectionObserver || hasIntersected

  // Gerar blur placeholder se não fornecido
  const defaultBlurDataURL = `data:image/svg+xml;base64,${btoa(
    `<svg width="${width || 400}" height="${
      height || 300
    }" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>`
  )}`

  // Handlers de eventos
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    if (enableRetry && retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        setCurrentSrc(`${src}?retry=${retryCount + 1}`)
      }, retryDelay)
    } else if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setRetryCount(0)
    } else {
      setIsLoading(false)
      setHasError(true)
      onError?.()
    }
  }, [
    enableRetry,
    retryCount,
    maxRetries,
    retryDelay,
    fallbackSrc,
    currentSrc,
    src,
    onError,
  ])

  // Reset quando src muda
  useEffect(() => {
    setCurrentSrc(src)
    setIsLoading(true)
    setHasError(false)
    setRetryCount(0)
  }, [src])

  // Componente de placeholder
  const renderPlaceholder = () => (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-gray-100',
        loaderClassName
      )}
    >
      {showLoader && <Loader2 className='w-6 h-6 animate-spin text-gray-400' />}
    </div>
  )

  // Componente de erro
  const renderError = () => (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400',
        errorClassName
      )}
    >
      <svg
        className='w-8 h-8 mb-2'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
        />
      </svg>
      <span className='text-xs text-center'>Erro ao carregar imagem</span>
    </div>
  )

  if (hasError && !fallbackSrc) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
        }}
      >
        {renderError()}
      </div>
    )
  }

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        isLoading && 'animate-pulse bg-gray-200',
        className
      )}
    >
      {shouldLoad && (
        <Image
          src={currentSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          placeholder={
            placeholder === 'blur' || placeholder === 'empty'
              ? placeholder
              : 'empty'
          }
          blurDataURL={blurDataURL || defaultBlurDataURL}
          sizes={sizes}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            fill && `object-${objectFit}`
          )}
          style={!fill ? { objectFit } : undefined}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className='absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse' />
      )}
    </div>
  )
}

// Hook para otimização de imagens
export function useImageOptimization() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const preloadImage = (src: string) => {
    if (loadedImages.has(src)) return Promise.resolve()

    return new Promise<void>((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, src]))
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  const preloadImages = async (sources: string[]) => {
    try {
      await Promise.all(sources.map(preloadImage))
    } catch (error) {
      console.warn('Erro ao pré-carregar imagens:', error)
    }
  }

  const isImageLoaded = (src: string) => loadedImages.has(src)

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    loadedImages: Array.from(loadedImages),
  }
}

// Componente para galeria de imagens otimizada
interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    width?: number
    height?: number
  }>
  className?: string
  imageClassName?: string
  columns?: number
  gap?: number
}

export function ImageGallery({
  images,
  className,
  imageClassName,
  columns = 3,
  gap = 4,
}: ImageGalleryProps) {
  const { preloadImages } = useImageOptimization()

  useEffect(() => {
    const imageSources = images.map(img => img.src)
    preloadImages(imageSources)
  }, [images, preloadImages])

  return (
    <div
      className={cn('grid', `grid-cols-${columns}`, `gap-${gap}`, className)}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={imageClassName}
          enableIntersectionObserver
        />
      ))}
    </div>
  )
}

export default OptimizedImage
