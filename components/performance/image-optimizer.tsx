'use client'

import React, { useState, useCallback, useMemo, memo } from 'react'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'

// Tipos para otimização de imagens
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  className?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

interface LazyImageProps extends OptimizedImageProps {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

interface ImageGalleryProps {
  images: Array<{
    id: string
    src: string
    alt: string
    thumbnail?: string
    width?: number
    height?: number
  }>
  columns?: number
  gap?: number
  lazyLoad?: boolean
  quality?: number
}

// Componente de imagem otimizada com lazy loading
export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  className = '',
  sizes,
  fill = false,
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Gerar blur data URL automaticamente se não fornecido
  const defaultBlurDataURL = useMemo(() => {
    if (blurDataURL) return blurDataURL
    
    // Criar um blur data URL simples baseado nas dimensões
    const canvas = document.createElement('canvas')
    canvas.width = 10
    canvas.height = 10
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, 10, 10)
      return canvas.toDataURL()
    }
    
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  }, [blurDataURL])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Otimizar sizes baseado no viewport
  const optimizedSizes = useMemo(() => {
    if (sizes) return sizes
    
    if (fill) return '100vw'
    
    if (width && height) {
      return `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`
    }
    
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  }, [sizes, fill, width, height])

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Erro ao carregar imagem</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        sizes={optimizedSizes}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${objectFit ? `object-${objectFit}` : ''}`}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

// Componente de imagem com lazy loading usando Intersection Observer
export const LazyImage = memo<LazyImageProps>(({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  ...imageProps
}) => {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce,
  })

  return (
    <div ref={ref}>
      {inView ? (
        <OptimizedImage {...imageProps} />
      ) : (
        <div 
          className={`bg-gray-200 animate-pulse ${imageProps.className || ''}`}
          style={{ 
            width: imageProps.width, 
            height: imageProps.height,
            aspectRatio: imageProps.width && imageProps.height 
              ? `${imageProps.width}/${imageProps.height}` 
              : undefined
          }}
        />
      )}
    </div>
  )
})

LazyImage.displayName = 'LazyImage'

// Galeria de imagens otimizada
export const OptimizedImageGallery = memo<ImageGalleryProps>(({
  images,
  columns = 3,
  gap = 16,
  lazyLoad = true,
  quality = 75,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
  }), [columns, gap])

  const handleImageClick = useCallback((imageId: string) => {
    setSelectedImage(imageId)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null)
  }, [])

  const selectedImageData = useMemo(() => 
    images.find(img => img.id === selectedImage),
    [images, selectedImage]
  )

  return (
    <>
      <div style={gridStyle} className="w-full">
        {images.map((image) => {
          const ImageComponent = lazyLoad ? LazyImage : OptimizedImage
          
          return (
            <div
              key={image.id}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleImageClick(image.id)}
            >
              <ImageComponent
                src={image.thumbnail || image.src}
                alt={image.alt}
                width={image.width || 300}
                height={image.height || 200}
                quality={quality}
                className="w-full h-auto rounded-lg"
                objectFit="cover"
              />
            </div>
          )
        })}
      </div>

      {/* Modal para visualização em tela cheia */}
      {selectedImage && selectedImageData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white text-2xl z-10 hover:text-gray-300"
            >
              ×
            </button>
            <OptimizedImage
              src={selectedImageData.src}
              alt={selectedImageData.alt}
              width={selectedImageData.width || 800}
              height={selectedImageData.height || 600}
              quality={90}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  )
})

OptimizedImageGallery.displayName = 'OptimizedImageGallery'

// Hook para otimização de imagens
export function useImageOptimization() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(src)) {
        resolve()
        return
      }

      const img = typeof window !== 'undefined' ? new (window as any).Image() : null
      
      if (!img) {
        resolve()
        return
      }
      
      img.onload = () => {
        setLoadedImages(prev => new Set(Array.from(prev).concat(src)))
        resolve()
      }
      
      img.onerror = () => {
        setFailedImages(prev => new Set(Array.from(prev).concat(src)))
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      img.src = src
    })
  }, [loadedImages])

  const preloadImages = useCallback(async (sources: string[]) => {
    const promises = sources.map(src => preloadImage(src))
    
    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.warn('Some images failed to preload:', error)
    }
  }, [preloadImage])

  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src)
  }, [loadedImages])

  const isImageFailed = useCallback((src: string) => {
    return failedImages.has(src)
  }, [failedImages])

  const clearCache = useCallback(() => {
    setLoadedImages(new Set())
    setFailedImages(new Set())
  }, [])

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    isImageFailed,
    clearCache,
    loadedCount: loadedImages.size,
    failedCount: failedImages.size,
  }
}

// Utilitários para otimização de imagens
export const ImageOptimizer = {
  // Gerar srcSet otimizado
  generateSrcSet: (baseSrc: string, widths: number[]) => {
    return widths
      .map(width => `${baseSrc}?w=${width} ${width}w`)
      .join(', ')
  },

  // Calcular qualidade baseada no tamanho
  calculateQuality: (width: number, height: number) => {
    const pixels = width * height
    
    if (pixels > 1000000) return 60 // Imagens grandes
    if (pixels > 500000) return 75  // Imagens médias
    return 85 // Imagens pequenas
  },

  // Gerar blur data URL
  generateBlurDataURL: (width: number, height: number, color = '#f3f4f6') => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(width, 10)
    canvas.height = Math.min(height, 10)
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return canvas.toDataURL()
    }
    
    return ''
  },

  // Detectar formato de imagem suportado
  getSupportedFormat: () => {
    const canvas = document.createElement('canvas')
    
    // Verificar suporte a WebP
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp'
    }
    
    // Verificar suporte a AVIF
    if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif'
    }
    
    return 'jpeg'
  },
}