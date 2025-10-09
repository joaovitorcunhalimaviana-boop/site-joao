'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'

interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  entries: PerformanceEntry[]
}

// Função para enviar métricas para analytics
function sendToAnalytics(metric: WebVitalsMetric) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      ),
      custom_map: {
        metric_rating: metric.rating,
        metric_delta: metric.delta,
      },
    })
  }

  // Console log para desenvolvimento
  if (process.env['NODE_ENV'] === 'development') {
    console.log('Web Vitals:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    })
  }

  // Enviar para API própria (opcional)
  if (process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT']) {
    fetch(process.env['NEXT_PUBLIC_ANALYTICS_ENDPOINT'], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'web-vitals',
        metric: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      }),
    }).catch(error => {
      console.error('Failed to send Web Vitals:', error)
    })
  }
}

// Função para determinar se a métrica é boa, precisa melhorar ou ruim
function getMetricRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'CLS':
      return value <= 0.1
        ? 'good'
        : value <= 0.25
          ? 'needs-improvement'
          : 'poor'
    case 'INP':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor'
    case 'FCP':
      return value <= 1800
        ? 'good'
        : value <= 3000
          ? 'needs-improvement'
          : 'poor'
    case 'LCP':
      return value <= 2500
        ? 'good'
        : value <= 4000
          ? 'needs-improvement'
          : 'poor'
    case 'TTFB':
      return value <= 800
        ? 'good'
        : value <= 1800
          ? 'needs-improvement'
          : 'poor'
    default:
      return 'good'
  }
}

// Hook personalizado para Web Vitals
export function useWebVitals() {
  useEffect(() => {
    // Só executar no cliente
    if (typeof window === 'undefined') return

    const handleMetric = (metric: any) => {
      const enhancedMetric: WebVitalsMetric = {
        ...metric,
        rating: getMetricRating(metric.name, metric.value),
      }
      sendToAnalytics(enhancedMetric)
    }

    // Coletar todas as métricas Core Web Vitals
    onCLS(handleMetric)
    onINP(handleMetric)
    onFCP(handleMetric)
    onLCP(handleMetric)
    onTTFB(handleMetric)

    // Métricas customizadas adicionais
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        console.log('Network Info:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        })
      }
    }

    // Performance Observer para métricas customizadas
    if ('PerformanceObserver' in window) {
      try {
        // Observar navegação
        const navObserver = new PerformanceObserver(list => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              console.log('Navigation Timing:', {
                domContentLoaded:
                  navEntry.domContentLoadedEventEnd -
                  navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
              })
            }
          })
        })
        navObserver.observe({ entryTypes: ['navigation'] })

        // Observar recursos
        const resourceObserver = new PerformanceObserver(list => {
          const entries = list.getEntries()
          const slowResources = entries.filter(entry => entry.duration > 1000)
          if (slowResources.length > 0) {
            console.log(
              'Slow Resources:',
              slowResources.map(entry => ({
                name: entry.name,
                duration: entry.duration,
                size: (entry as any).transferSize || 0,
              }))
            )
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })

        // Cleanup
        return () => {
          navObserver.disconnect()
          resourceObserver.disconnect()
        }
      } catch (error) {
        console.error('Performance Observer error:', error)
      }
    }

    // Return undefined para satisfazer o TypeScript
    return undefined
  }, [])
}

// Componente para incluir no layout
export default function WebVitals() {
  useWebVitals()
  return null
}

// Componente para exibir métricas em desenvolvimento
export function WebVitalsDebug() {
  useWebVitals()

  if (process.env['NODE_ENV'] !== 'development') {
    return null
  }

  return (
    <div className='fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50'>
      <div>Web Vitals Debug Mode</div>
      <div className='text-xs opacity-70'>Check console for metrics</div>
    </div>
  )
}

// Função para reportar erros customizados
export function reportError(error: Error, context?: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      custom_map: {
        error_context: context || 'unknown',
        error_stack: error.stack,
      },
    })
  }

  console.error('Custom Error Report:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: Date.now(),
    url: window?.location?.href,
  })
}

// Hook para monitorar performance de componentes
export function useComponentPerformance(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (duration > 100) {
        // Log apenas se demorar mais que 100ms
        console.log(
          `Component Performance: ${componentName} took ${duration.toFixed(2)}ms`
        )
      }
    }
  }, [])
}

