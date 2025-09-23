'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Hook para lazy loading de componentes
export function useLazyComponent<T>(
  importFn: () => Promise<{ default: T }>,
  options: {
    delay?: number
    fallback?: React.ComponentType
    preload?: boolean
  } = {}
) {
  const [Component, setComponent] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { delay = 0, preload = false } = options

  const loadComponent = useCallback(async () => {
    if (Component) return

    setIsLoading(true)
    setError(null)

    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const module = await importFn()
      setComponent(module.default)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [Component, importFn, delay])

  useEffect(() => {
    if (preload) {
      loadComponent()
    }
  }, [preload, loadComponent])

  return {
    Component,
    isLoading,
    error,
    loadComponent,
  }
}

// Hook para intersection observer (lazy loading)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [hasIntersected, options])

  return {
    elementRef,
    isIntersecting,
    hasIntersected,
  }
}

// Hook para prefetch de rotas
export function usePrefetch() {
  const router = useRouter()
  const prefetchedRoutes = useRef<Set<string>>(new Set())

  const prefetchRoute = useCallback(
    (href: string) => {
      if (prefetchedRoutes.current.has(href)) return

      prefetchedRoutes.current.add(href)
      router.prefetch(href)
    },
    [router]
  )

  const prefetchOnHover = useCallback(
    (href: string) => {
      return {
        onMouseEnter: () => prefetchRoute(href),
        onFocus: () => prefetchRoute(href),
      }
    },
    [prefetchRoute]
  )

  return {
    prefetchRoute,
    prefetchOnHover,
    isPrefetched: (href: string) => prefetchedRoutes.current.has(href),
  }
}

// Hook para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook para throttle
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

// Hook para medir performance
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<{
    loadTime?: number
    renderTime?: number
    interactionTime?: number
  }>({})

  const startTime = useRef<number>()
  const renderStartTime = useRef<number>()

  const startMeasurement = useCallback(
    (type: 'load' | 'render' | 'interaction') => {
      const now = performance.now()
      if (type === 'load') startTime.current = now
      if (type === 'render') renderStartTime.current = now
    },
    []
  )

  const endMeasurement = useCallback(
    (type: 'load' | 'render' | 'interaction') => {
      const now = performance.now()

      setMetrics(prev => {
        const newMetrics = { ...prev }

        if (type === 'load' && startTime.current) {
          newMetrics.loadTime = now - startTime.current
        }
        if (type === 'render' && renderStartTime.current) {
          newMetrics.renderTime = now - renderStartTime.current
        }
        if (type === 'interaction') {
          newMetrics.interactionTime = now
        }

        return newMetrics
      })
    },
    []
  )

  // Medir Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('LCP:', lastEntry.startTime)
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // Browser não suporta
    }

    return () => observer.disconnect()
  }, [])

  return {
    metrics,
    startMeasurement,
    endMeasurement,
  }
}

// Hook para virtual scrolling
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items
    .slice(startIndex, endIndex + 1)
    .map((item, index) => ({
      item,
      index: startIndex + index,
    }))

  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useThrottle((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, 16) // ~60fps

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  }
}

// Hook para cache de dados
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300000
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map())

  const fetchData = useCallback(async () => {
    const cached = cache.current.get(key)
    const now = Date.now()

    if (cached && now - cached.timestamp < ttl) {
      setData(cached.data)
      return cached.data
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      cache.current.set(key, { data: result, timestamp: now })
      setData(result)
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, ttl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const invalidateCache = useCallback(() => {
    cache.current.delete(key)
  }, [key])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    invalidateCache,
  }
}

export default {
  useLazyComponent,
  useIntersectionObserver,
  usePrefetch,
  useDebounce,
  useThrottle,
  usePerformanceMetrics,
  useVirtualScroll,
  useCache,
}
