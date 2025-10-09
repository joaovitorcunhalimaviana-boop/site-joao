import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

// Hook para debounce otimizado
export const useDebounce = <T>(value: T, delay: number): T => {
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

// Hook para busca otimizada com debounce
export const useOptimizedSearch = <T>(
  items: T[],
  searchFields: (keyof T)[],
  delay: number = 300
) => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, delay)

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items

    const lowercaseSearch = debouncedSearchTerm.toLowerCase()
    
    return items.filter(item =>
      searchFields.some(field => {
        const fieldValue = item[field]
        return fieldValue && 
               String(fieldValue).toLowerCase().includes(lowercaseSearch)
      })
    )
  }, [items, searchFields, debouncedSearchTerm])

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  return {
    searchTerm,
    debouncedSearchTerm,
    filteredItems,
    updateSearchTerm
  }
}

// Hook para paginação otimizada
export const useOptimizedPagination = <T>(
  items: T[],
  itemsPerPage: number = 10
) => {
  const [currentPage, setCurrentPage] = useState(1)

  const paginationData = useMemo(() => {
    const totalItems = items.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = items.slice(startIndex, endIndex)

    return {
      currentItems,
      totalItems,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalItems)
    }
  }, [items, itemsPerPage, currentPage])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationData.totalPages)))
  }, [paginationData.totalPages])

  const nextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [paginationData.hasNextPage])

  const prevPage = useCallback(() => {
    if (paginationData.hasPrevPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [paginationData.hasPrevPage])

  // Reset para primeira página quando items mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  return {
    ...paginationData,
    goToPage,
    nextPage,
    prevPage
  }
}

// Hook para loading state otimizado
export const useOptimizedLoading = (initialState: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialState)
  const loadingRef = useRef<boolean>(initialState)

  const startLoading = useCallback(() => {
    if (!loadingRef.current) {
      loadingRef.current = true
      setIsLoading(true)
    }
  }, [])

  const stopLoading = useCallback(() => {
    if (loadingRef.current) {
      loadingRef.current = false
      setIsLoading(false)
    }
  }, [])

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    startLoading()
    try {
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  }
}

// Hook para cache local otimizado
export const useOptimizedCache = <T>(key: string, ttl: number = 300000) => { // 5 min default
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map())

  const get = useCallback((cacheKey: string): T | null => {
    const cached = cache.current.get(cacheKey)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > ttl
    if (isExpired) {
      cache.current.delete(cacheKey)
      return null
    }

    return cached.data
  }, [ttl])

  const set = useCallback((cacheKey: string, data: T) => {
    cache.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    })
  }, [])

  const clear = useCallback((cacheKey?: string) => {
    if (cacheKey) {
      cache.current.delete(cacheKey)
    } else {
      cache.current.clear()
    }
  }, [])

  const has = useCallback((cacheKey: string): boolean => {
    const cached = cache.current.get(cacheKey)
    if (!cached) return false

    const isExpired = Date.now() - cached.timestamp > ttl
    if (isExpired) {
      cache.current.delete(cacheKey)
      return false
    }

    return true
  }, [ttl])

  return { get, set, clear, has }
}

// Hook para throttle otimizado
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastRun.current >= delay) {
      lastRun.current = now
      return callback(...args)
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        lastRun.current = Date.now()
        callback(...args)
      }, delay - (now - lastRun.current))
    }
  }, [callback, delay]) as T
}