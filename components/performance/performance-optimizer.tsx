'use client'

import { useEffect, memo, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'

// Componente para otimização de performance
const PerformanceOptimizer = memo(() => {
  const router = useRouter()

  useEffect(() => {
    // 1. Preload de rotas críticas
    const criticalRoutes = [
      '/area-medica',
      '/agendamento',
      '/pacientes',
      '/prontuario'
    ]

    criticalRoutes.forEach(route => {
      router.prefetch(route)
    })

    // 2. Otimização de imagens lazy loading
    const images = document.querySelectorAll('img[data-src]')
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const dataSrc = img.getAttribute('data-src')
            if (dataSrc) {
              img.src = dataSrc
              img.removeAttribute('data-src')
              imageObserver.unobserve(img)
            }
          }
        })
      },
      { rootMargin: '50px' }
    )

    images.forEach(img => imageObserver.observe(img))

    // 3. Limpeza de event listeners não utilizados
    const cleanupEventListeners = () => {
      // Remove listeners de scroll desnecessários
      const scrollElements = document.querySelectorAll('[data-scroll-cleanup]')
      scrollElements.forEach(element => {
        element.removeEventListener('scroll', () => {})
      })
    }

    // 4. Otimização de localStorage
    const optimizeLocalStorage = () => {
      try {
        // Limpar dados antigos do localStorage
        const keys = Object.keys(localStorage)
        const now = Date.now()
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)

        keys.forEach(key => {
          if (key.startsWith('temp_') || key.startsWith('cache_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}')
              if (data.timestamp && data.timestamp < oneWeekAgo) {
                localStorage.removeItem(key)
              }
            } catch (e) {
              // Se não conseguir parsear, remove
              localStorage.removeItem(key)
            }
          }
        })
      } catch (error) {
        console.warn('Erro ao otimizar localStorage:', error)
      }
    }

    // 5. Debounce para redimensionamento de janela
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        // Reajustar elementos que dependem do tamanho da janela
        window.dispatchEvent(new Event('optimized-resize'))
      }, 250)
    }

    // 6. Otimização de fontes
    const optimizeFonts = () => {
      // Preload de fontes críticas
      const fontPreloads = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      ]

      fontPreloads.forEach(fontUrl => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'style'
        link.href = fontUrl
        document.head.appendChild(link)
      })
    }

    // 7. Service Worker para cache
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && process.env['NODE_ENV'] === 'production') {
        try {
          await navigator.serviceWorker.register('/sw.js')
          console.log('Service Worker registrado com sucesso')
        } catch (error) {
          console.warn('Erro ao registrar Service Worker:', error)
        }
      }
    }

    // 8. Otimização de CSS crítico
    const optimizeCriticalCSS = () => {
      // Mover CSS não crítico para carregamento assíncrono
      const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-non-critical]')
      nonCriticalCSS.forEach(link => {
        const newLink = link.cloneNode(true) as HTMLLinkElement
        newLink.rel = 'preload'
        newLink.as = 'style'
        newLink.onload = () => {
          newLink.rel = 'stylesheet'
        }
        document.head.appendChild(newLink)
        link.remove()
      })
    }

    // Executar otimizações
    const runOptimizations = async () => {
      optimizeLocalStorage()
      optimizeFonts()
      optimizeCriticalCSS()
      await registerServiceWorker()
    }

    // Executar após um pequeno delay para não bloquear o carregamento inicial
    const optimizationTimer = setTimeout(runOptimizations, 100)

    // Event listeners
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      clearTimeout(optimizationTimer)
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
      images.forEach(img => imageObserver.unobserve(img))
      cleanupEventListeners()
    }
  }, [router])

  // 9. Monitoramento de performance
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Medir Core Web Vitals
      const measureWebVitals = () => {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry.startTime > 2500) {
            console.warn('LCP alto detectado:', lastEntry.startTime)
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach(entry => {
            const fidEntry = entry as PerformanceEventTiming
            if (fidEntry.processingStart && fidEntry.processingStart - fidEntry.startTime > 100) {
              console.warn('FID alto detectado:', fidEntry.processingStart - fidEntry.startTime)
            }
          })
        }).observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        let clsValue = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          if (clsValue > 0.1) {
            console.warn('CLS alto detectado:', clsValue)
          }
        }).observe({ entryTypes: ['layout-shift'] })
      }

      measureWebVitals()
    }
  }, [])

  return null // Este componente não renderiza nada visualmente
})

PerformanceOptimizer.displayName = 'PerformanceOptimizer'

export default PerformanceOptimizer
