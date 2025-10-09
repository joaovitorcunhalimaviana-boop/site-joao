'use client'

import { useCallback, useMemo, useRef, useState, useEffect } from 'react'

// Hook para memoização avançada com TTL (Time To Live)
export function useMemoWithTTL<T>(
  factory: () => T,
  deps: React.DependencyList,
  ttl: number = 5 * 60 * 1000 // 5 minutos por padrão
): T {
  const cacheRef = useRef<{
    value: T
    timestamp: number
    deps: React.DependencyList
  } | null>(null)

  return useMemo(() => {
    const now = Date.now()
    const cache = cacheRef.current

    // Verificar se o cache é válido
    const isCacheValid =
      cache &&
      now - cache.timestamp < ttl &&
      cache.deps.length === deps.length &&
      cache.deps.every((dep, index) => Object.is(dep, deps[index]))

    if (isCacheValid) {
      return cache.value
    }

    // Criar novo valor e atualizar cache
    const newValue = factory()
    cacheRef.current = {
      value: newValue,
      timestamp: now,
      deps: [...deps],
    }

    return newValue
  }, deps)
}

// Hook para debounce com memoização
export function useDebouncedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  delay: number = 300
): T | undefined {
  const [debouncedValue, setDebouncedValue] = useState<T | undefined>(undefined)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const memoizedFactory = useCallback(factory, deps)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(memoizedFactory())
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [memoizedFactory, delay])

  return debouncedValue
}

// Hook para memoização de funções assíncronas
export function useAsyncMemo<T>(
  asyncFactory: () => Promise<T>,
  deps: React.DependencyList,
  initialValue?: T
): { data: T | undefined; loading: boolean; error: Error | null } {
  const [state, setState] = useState<{
    data: T | undefined
    loading: boolean
    error: Error | null
  }>({
    data: initialValue,
    loading: false,
    error: null,
  })

  const memoizedFactory = useCallback(asyncFactory, deps)

  useEffect(() => {
    let cancelled = false

    setState(prev => ({ ...prev, loading: true, error: null }))

    memoizedFactory()
      .then(result => {
        if (!cancelled) {
          setState({ data: result, loading: false, error: null })
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState(prev => ({ ...prev, loading: false, error }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [memoizedFactory])

  return state
}

// Hook para memoização de cálculos pesados
export function useHeavyComputation<T>(
  computation: () => T,
  deps: React.DependencyList,
  options: {
    enableProfiling?: boolean
    warningThreshold?: number // em ms
  } = {}
): T {
  const { enableProfiling = false, warningThreshold = 100 } = options

  return useMemo(() => {
    const startTime = enableProfiling ? performance.now() : 0

    const result = computation()

    if (enableProfiling) {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (duration > warningThreshold) {
        console.warn(
          `Heavy computation took ${duration.toFixed(2)}ms, consider optimization`,
          { deps, duration }
        )
      } else {
        console.log(`Computation completed in ${duration.toFixed(2)}ms`)
      }
    }

    return result
  }, deps)
}

// Hook para memoização de listas com comparação customizada
export function useMemoizedList<T>(
  list: T[],
  compareFn?: (a: T, b: T) => boolean,
  keyExtractor?: (item: T) => string | number
): T[] {
  const previousListRef = useRef<T[]>([])
  const memoizedListRef = useRef<T[]>([])

  return useMemo(() => {
    const previousList = previousListRef.current

    // Se não há função de comparação, usar comparação padrão
    if (!compareFn && !keyExtractor) {
      if (list.length !== previousList.length) {
        previousListRef.current = list
        memoizedListRef.current = [...list]
        return memoizedListRef.current
      }

      const hasChanged = list.some(
        (item, index) => !Object.is(item, previousList[index])
      )

      if (hasChanged) {
        previousListRef.current = list
        memoizedListRef.current = [...list]
      }

      return memoizedListRef.current
    }

    // Usar keyExtractor se fornecido
    if (keyExtractor) {
      const currentKeys = list.map(keyExtractor)
      const previousKeys = previousList.map(keyExtractor)

      const hasChanged =
        currentKeys.length !== previousKeys.length ||
        currentKeys.some((key, index) => key !== previousKeys[index])

      if (hasChanged) {
        previousListRef.current = list
        memoizedListRef.current = [...list]
      }

      return memoizedListRef.current
    }

    // Usar função de comparação customizada
    if (list.length !== previousList.length) {
      previousListRef.current = list
      memoizedListRef.current = [...list]
      return memoizedListRef.current
    }

    const hasChanged = list.some(
      (item, index) => !compareFn!(item, previousList[index])
    )

    if (hasChanged) {
      previousListRef.current = list
      memoizedListRef.current = [...list]
    }

    return memoizedListRef.current
  }, [list, compareFn, keyExtractor])
}

// Hook para memoização de objetos com deep comparison
export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>()

  return useMemo(() => {
    if (!ref.current || !deepEqual(ref.current.deps, deps)) {
      ref.current = {
        deps: [...deps],
        value: factory(),
      }
    }
    return ref.current.value
  }, deps)
}

// Função auxiliar para comparação profunda
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (a == null || b == null) return a === b

  if (typeof a !== typeof b) return false

  if (typeof a !== 'object') return a === b

  if (Array.isArray(a) !== Array.isArray(b)) return false

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  return keysA.every(key => deepEqual(a[key], b[key]))
}

// Hook para cache de resultados de API
export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    staleWhileRevalidate?: boolean
    retryOnError?: boolean
    maxRetries?: number
  } = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos
    staleWhileRevalidate = true,
    retryOnError = true,
    maxRetries = 3,
  } = options

  const cacheRef = useRef<
    Map<
      string,
      {
        data: T
        timestamp: number
        error: Error | null
      }
    >
  >(new Map())

  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: Error | null
  }>({ data: null, loading: false, error: null })

  const fetchData = useCallback(
    async (retryCount = 0) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        const data = await fetcher()
        const now = Date.now()

        cacheRef.current.set(key, {
          data,
          timestamp: now,
          error: null,
        })

        setState({ data, loading: false, error: null })
      } catch (error) {
        const err = error as Error

        if (retryOnError && retryCount < maxRetries) {
          // Retry com backoff exponencial
          setTimeout(
            () => {
              fetchData(retryCount + 1)
            },
            Math.pow(2, retryCount) * 1000
          )
        } else {
          setState(prev => ({ ...prev, loading: false, error: err }))
        }
      }
    },
    [key, fetcher, retryOnError, maxRetries]
  )

  useEffect(() => {
    const cached = cacheRef.current.get(key)
    const now = Date.now()

    if (cached && now - cached.timestamp < ttl) {
      // Cache válido
      setState({ data: cached.data, loading: false, error: cached.error })

      if (staleWhileRevalidate && now - cached.timestamp > ttl / 2) {
        // Revalidar em background se passou da metade do TTL
        fetchData()
      }
    } else {
      // Cache inválido ou inexistente
      fetchData()
    }
  }, [key, ttl, staleWhileRevalidate, fetchData])

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key)
    fetchData()
  }, [key, fetchData])

  return {
    ...state,
    refetch: fetchData,
    invalidate: invalidateCache,
  }
}

// Hook para memoização de componentes filhos
export function useChildrenMemo(
  children: React.ReactNode,
  deps: React.DependencyList
): React.ReactNode {
  return useMemo(() => children, deps)
}

// Hook para otimização de event handlers
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef<T>(callback)
  const depsRef = useRef<React.DependencyList>(deps)

  // Atualizar callback se as dependências mudaram
  if (!deps.every((dep, index) => Object.is(dep, depsRef.current[index]))) {
    callbackRef.current = callback
    depsRef.current = deps
  }

  return useCallback(callbackRef.current, [])
}

// Utilitários para performance profiling
export const PerformanceUtils = {
  // Medir tempo de execução
  measureTime: <T>(fn: () => T, label?: string): T => {
    const start = performance.now()
    const result = fn()
    const end = performance.now()

    if (label) {
      console.log(`${label}: ${(end - start).toFixed(2)}ms`)
    }

    return result
  },

  // Medir tempo de execução assíncrona
  measureAsyncTime: async <T>(
    fn: () => Promise<T>,
    label?: string
  ): Promise<T> => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()

    if (label) {
      console.log(`${label}: ${(end - start).toFixed(2)}ms`)
    }

    return result
  },

  // Throttle para funções
  throttle: <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
    let lastCall = 0
    return ((...args: any[]) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        return fn(...args)
      }
    }) as T
  },

  // Debounce para funções
  debounce: <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }) as T
  },
}
