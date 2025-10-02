'use client'

import { useEffect } from 'react'
import Head from 'next/head'

interface PageSpeedOptimizerProps {
  preloadImages?: string[]
  preloadFonts?: string[]
  criticalCSS?: string
  enableResourceHints?: boolean
}

export default function PageSpeedOptimizer({
  preloadImages = [],
  preloadFonts = [],
  criticalCSS,
  enableResourceHints = true,
}: PageSpeedOptimizerProps) {
  useEffect(() => {
    // Preload de imagens críticas
    preloadImages.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })

    // Lazy loading para imagens não críticas
    const images = document.querySelectorAll('img[data-src]')
    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset['src'] || ''
          img.classList.remove('lazy')
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))

    // Cleanup
    return () => {
      images.forEach(img => imageObserver.unobserve(img))
    }
  }, [preloadImages])

  return (
    <Head>
      {/* Resource Hints */}
      {enableResourceHints && (
        <>
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link
            rel='preconnect'
            href='https://fonts.gstatic.com'
            crossOrigin='anonymous'
          />
          <link rel='dns-prefetch' href='https://www.google-analytics.com' />
          <link rel='dns-prefetch' href='https://www.googletagmanager.com' />
        </>
      )}

      {/* Preload Critical Fonts */}
      {preloadFonts.map((font, index) => (
        <link
          key={index}
          rel='preload'
          href={font}
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />
      ))}

      {/* Critical CSS Inline */}
      {criticalCSS && (
        <style
          dangerouslySetInnerHTML={{
            __html: criticalCSS,
          }}
        />
      )}

      {/* Performance Optimization Meta Tags */}
      <meta httpEquiv='x-dns-prefetch-control' content='on' />
      <meta name='format-detection' content='telephone=no' />

      {/* Viewport Optimization */}
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, viewport-fit=cover'
      />
    </Head>
  )
}

// Hook para otimização de performance
export function usePageSpeedOptimization() {
  useEffect(() => {
    // Preload de recursos críticos
    const preloadCriticalResources = () => {
      // Preload do CSS crítico
      const criticalCSS = document.querySelector('style[data-critical]')
      if (criticalCSS) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'style'
        link.href =
          'data:text/css;base64,' + btoa(criticalCSS.textContent || '')
        document.head.appendChild(link)
      }
    }

    // Otimização de imagens
    const optimizeImages = () => {
      const images = document.querySelectorAll('img')
      images.forEach(img => {
        // Adicionar loading lazy para imagens não críticas
        if (!img.hasAttribute('loading') && !img.closest('[data-critical]')) {
          img.loading = 'lazy'
        }

        // Adicionar decode async
        img.decoding = 'async'

        // Otimizar srcset para diferentes densidades
        if (!img.srcset && img.src) {
          const src = img.src
          if (src.includes('.jpg') || src.includes('.png')) {
            img.srcset = `${src} 1x, ${src.replace(/\.(jpg|png)/, '@2x.$1')} 2x`
          }
        }
      })
    }

    // Otimização de fontes
    const optimizeFonts = () => {
      // Preload de fontes críticas
      const fontLinks = document.querySelectorAll(
        'link[href*="fonts.googleapis.com"]'
      )
      fontLinks.forEach(link => {
        const preloadLink = document.createElement('link')
        preloadLink.rel = 'preload'
        preloadLink.as = 'style'
        preloadLink.href = link.getAttribute('href') || ''
        document.head.insertBefore(preloadLink, link)
      })
    }

    // Executar otimizações
    preloadCriticalResources()
    optimizeImages()
    optimizeFonts()

    // Service Worker para cache
    if ('serviceWorker' in navigator && process.env['NODE_ENV'] === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('Service Worker registration failed:', error)
      })
    }
  }, [])

  // Função para medir Core Web Vitals
  const measureWebVitals = () => {
    if (typeof window !== 'undefined') {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('LCP:', lastEntry.startTime)
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries()
        entries.forEach(entry => {
          const fidEntry = entry as any
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime)
        })
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries()
        entries.forEach(entry => {
          const clsEntry = entry as any
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value
          }
        })
        console.log('CLS:', clsValue)
      }).observe({ entryTypes: ['layout-shift'] })
    }
  }

  return {
    measureWebVitals,
  }
}

// Componente para Critical CSS
export function CriticalCSS({ css }: { css: string }) {
  return (
    <style
      data-critical
      dangerouslySetInnerHTML={{
        __html: css,
      }}
    />
  )
}

// Componente para Lazy Image
interface LazyImageProps {
  src: string
  alt: string
  className?: string
  critical?: boolean
  width?: number
  height?: number
}

export function LazyImage({
  src,
  alt,
  className,
  critical = false,
  width,
  height,
}: LazyImageProps) {
  return (
    <img
      src={critical ? src : undefined}
      data-src={critical ? undefined : src}
      alt={alt}
      className={`${className} ${critical ? '' : 'lazy'}`}
      loading={critical ? 'eager' : 'lazy'}
      decoding='async'
      width={width}
      height={height}
    />
  )
}

