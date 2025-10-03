'use client'

// Sistema de otimização de bundle e code splitting - Versão Otimizada

import { lazy, ComponentType, LazyExoticComponent, Suspense } from 'react'
import { cacheManager } from './cache-manager'

// Tipos para otimização de bundle
interface BundleAnalytics {
  chunkName: string
  size: number
  loadTime: number
  errorCount: number
  successCount: number
  lastLoaded: number
}

interface LoadingStrategy {
  preload?: boolean
  priority?: 'high' | 'medium' | 'low'
  timeout?: number
  retries?: number
  fallback?: ComponentType
}

interface ChunkLoadOptions {
  strategy?: LoadingStrategy
  analytics?: boolean
  cache?: boolean
}

// Gerenciador de analytics de bundle otimizado
class OptimizedBundleAnalyticsManager {
  private analytics = new Map<string, BundleAnalytics>()
  private observers: ((analytics: BundleAnalytics) => void)[] = []
  private preloadQueue = new Set<string>()
  private loadingPromises = new Map<string, Promise<any>>()

  // Registrar carregamento de chunk com otimizações
  recordChunkLoad(chunkName: string, loadTime: number, success: boolean) {
    const existing = this.analytics.get(chunkName) || {
      chunkName,
      size: 0,
      loadTime: 0,
      errorCount: 0,
      successCount: 0,
      lastLoaded: 0,
    }

    const updated: BundleAnalytics = {
      ...existing,
      loadTime: success 
        ? (existing.loadTime * existing.successCount + loadTime) / (existing.successCount + 1)
        : existing.loadTime,
      errorCount: success ? existing.errorCount : existing.errorCount + 1,
      successCount: success ? existing.successCount + 1 : existing.successCount,
      lastLoaded: Date.now(),
    }

    this.analytics.set(chunkName, updated)
    this.notifyObservers(updated)
  }

  // Preload inteligente baseado em analytics
  async intelligentPreload(chunkName: string, importFn: () => Promise<any>) {
    if (this.preloadQueue.has(chunkName) || this.loadingPromises.has(chunkName)) {
      return this.loadingPromises.get(chunkName)
    }

    this.preloadQueue.add(chunkName)
    const startTime = performance.now()

    try {
      const promise = importFn()
      this.loadingPromises.set(chunkName, promise)
      
      const result = await promise
      const loadTime = performance.now() - startTime
      
      this.recordChunkLoad(chunkName, loadTime, true)
      return result
    } catch (error) {
      const loadTime = performance.now() - startTime
      this.recordChunkLoad(chunkName, loadTime, false)
      throw error
    } finally {
      this.preloadQueue.delete(chunkName)
    }
  }

  // Obter analytics de um chunk
  getChunkAnalytics(chunkName: string): BundleAnalytics | null {
    return this.analytics.get(chunkName) || null
  }

  // Obter todas as analytics
  getAllAnalytics(): BundleAnalytics[] {
    return Array.from(this.analytics.values())
  }

  // Observar mudanças nas analytics
  subscribe(observer: (analytics: BundleAnalytics) => void): () => void {
    this.observers.push(observer)
    return () => {
      const index = this.observers.indexOf(observer)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }

  private notifyObservers(analytics: BundleAnalytics) {
    // Throttle notifications para evitar spam
    requestIdleCallback(() => {
      this.observers.forEach(observer => observer(analytics))
    })
  }

  // Obter chunks com pior performance
  getWorstPerformingChunks(limit = 5): BundleAnalytics[] {
    return Array.from(this.analytics.values())
      .sort((a, b) => {
        const aScore = a.loadTime + a.errorCount * 1000
        const bScore = b.loadTime + b.errorCount * 1000
        return bScore - aScore
      })
      .slice(0, limit)
  }

  // Limpar analytics antigas
  cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) {
    const now = Date.now()
    for (const [chunkName, analytics] of this.analytics.entries()) {
      if (now - analytics.lastLoaded > maxAge) {
        this.analytics.delete(chunkName)
      }
    }
  }

  // Otimizar ordem de carregamento baseado em prioridade
  getPriorityLoadOrder(): string[] {
    return Array.from(this.analytics.values())
      .sort((a, b) => {
        // Priorizar chunks com maior taxa de sucesso e menor tempo de carregamento
        const aScore = (a.successCount / (a.successCount + a.errorCount)) / a.loadTime
        const bScore = (b.successCount / (b.successCount + b.errorCount)) / b.loadTime
        return bScore - aScore
      })
      .map(analytics => analytics.chunkName)
  }
}

// Gerenciador de preload inteligente
class PreloadManager {
  private preloadedChunks = new Set<string>()
  private preloadQueue: Array<{ chunkName: string; priority: number }> = []
  private isProcessing = false

  // Adicionar chunk à fila de preload
  addToQueue(
    chunkName: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) {
    if (this.preloadedChunks.has(chunkName)) {
      return
    }

    const priorityMap = { high: 3, medium: 2, low: 1 }
    const priorityValue = priorityMap[priority]

    // Remover se já existe na fila
    this.preloadQueue = this.preloadQueue.filter(
      item => item.chunkName !== chunkName
    )

    // Adicionar com nova prioridade
    this.preloadQueue.push({ chunkName, priority: priorityValue })

    // Ordenar por prioridade
    this.preloadQueue.sort((a, b) => b.priority - a.priority)

    this.processQueue()
  }

  // Processar fila de preload
  private async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift()
      if (!item || this.preloadedChunks.has(item.chunkName)) {
        continue
      }

      try {
        await this.preloadChunk(item.chunkName)
        this.preloadedChunks.add(item.chunkName)
      } catch (error) {
        console.warn(
          `Falha ao fazer preload do chunk ${item.chunkName}:`,
          error
        )
      }

      // Pequena pausa para não bloquear a thread principal
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    this.isProcessing = false
  }

  // Fazer preload de um chunk específico
  private async preloadChunk(chunkName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'script'
      link.href = `/_next/static/chunks/${chunkName}.js`

      link.onload = () => {
        document.head.removeChild(link)
        resolve()
      }

      link.onerror = () => {
        document.head.removeChild(link)
        reject(new Error(`Failed to preload chunk: ${chunkName}`))
      }

      document.head.appendChild(link)
    })
  }

  // Verificar se chunk foi precarregado
  isPreloaded(chunkName: string): boolean {
    return this.preloadedChunks.has(chunkName)
  }

  // Limpar preloads antigos
  clear() {
    this.preloadedChunks.clear()
    this.preloadQueue = []
  }
}

// Instâncias globais otimizadas
const bundleAnalytics = new OptimizedBundleAnalyticsManager()
const preloadManager = new PreloadManager()

// Função para criar componentes lazy com otimizações avançadas
export function createOptimizedLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  chunkName: string,
  options: ChunkLoadOptions = {}
): LazyExoticComponent<T> {
  const { strategy = {}, analytics = true, cache = true } = options

  const {
    preload = false,
    priority = 'medium',
    timeout = 10000,
    retries = 3,
  } = strategy

  // Fazer preload se solicitado
  if (preload) {
    preloadManager.addToQueue(chunkName, priority)
  }

  // Wrapper para importação com retry e analytics otimizado
  const wrappedImport = async (): Promise<{ default: T }> => {
    const startTime = performance.now()
    let lastError: Error | null = null

    // Tentar cache primeiro com verificação otimizada
    if (cache) {
      const cached = cacheManager.memory.get<{ default: T }>(
        `chunk_${chunkName}`
      )
      if (cached) {
        if (analytics) {
          bundleAnalytics.recordChunkLoad(
            chunkName,
            performance.now() - startTime,
            true
          )
        }
        return cached
      }
    }

    // Usar preload inteligente se disponível
    try {
      const result = await bundleAnalytics.intelligentPreload(chunkName, importFn)
      
      // Cachear resultado com TTL otimizado
      if (cache) {
        cacheManager.memory.set(`chunk_${chunkName}`, result, {
          ttl: 30 * 60 * 1000, // 30 minutos
          tags: ['chunks', `chunk_${chunkName}`],
        })
      }

      return result
    } catch (error) {
      // Fallback para carregamento com retry
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), timeout)
          })

          const result = await Promise.race([importFn(), timeoutPromise])
          const loadTime = performance.now() - startTime

          // Cachear resultado
          if (cache) {
            cacheManager.memory.set(`chunk_${chunkName}`, result, {
              ttl: 30 * 60 * 1000,
              tags: ['chunks', `chunk_${chunkName}`],
            })
          }

          // Registrar analytics
          if (analytics) {
            bundleAnalytics.recordChunkLoad(chunkName, loadTime, true)
          }

          return result
        } catch (error) {
          lastError = error as Error

          if (attempt < retries) {
            // Esperar antes de tentar novamente (backoff exponencial)
            await new Promise(resolve =>
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            )
          }
        }
      }

      // Registrar falha nas analytics
      if (analytics) {
        bundleAnalytics.recordChunkLoad(chunkName, performance.now() - startTime, false)
      }

      throw (
        lastError ||
        new Error(
          `Failed to load chunk ${chunkName} after ${retries + 1} attempts`
        )
      )
    }
  }

  return lazy(wrappedImport)
}

// Hook para monitorar performance de chunks
export function useBundleAnalytics(chunkName?: string) {
  const [analytics, setAnalytics] = React.useState<BundleAnalytics[]>(() =>
    chunkName
      ? ([bundleAnalytics.getChunkAnalytics(chunkName)].filter(
          Boolean
        ) as BundleAnalytics[])
      : bundleAnalytics.getAllAnalytics()
  )

  React.useEffect(() => {
    const unsubscribe = bundleAnalytics.subscribe(updated => {
      if (!chunkName || updated.chunkName === chunkName) {
        setAnalytics(current => {
          const filtered = current.filter(
            a => a.chunkName !== updated.chunkName
          )
          return [...filtered, updated]
        })
      }
    })

    return unsubscribe
  }, [chunkName])

  return {
    analytics,
    worstPerforming: bundleAnalytics.getWorstPerformingChunks(),
    cleanup: () => bundleAnalytics.cleanup(),
  }
}

// Utilitários para otimização de bundle
export const BundleOptimizer = {
  // Precarregar chunks baseado em rota atual
  preloadForRoute: (routeName: string) => {
    const routeChunks: Record<string, string[]> = {
      '/dashboard': ['dashboard', 'charts', 'tables'],
      '/patients': ['patients', 'forms', 'calendar'],
      '/appointments': ['calendar', 'forms', 'notifications'],
      '/reports': ['charts', 'export', 'pdf-generator'],
    }

    const chunks = routeChunks[routeName] || []
    chunks.forEach(chunk => {
      preloadManager.addToQueue(chunk, 'high')
    })
  },

  // Precarregar chunks baseado no comportamento do usuário
  preloadByUserBehavior: () => {
    // Analisar histórico de navegação
    const navigationHistory =
      cacheManager.persistent.get<string[]>('navigation_history') || []

    // Identificar padrões comuns
    const patterns =
      BundleOptimizer.analyzeNavigationPatterns(navigationHistory)

    // Precarregar chunks mais prováveis
    patterns.forEach(pattern => {
      preloadManager.addToQueue(pattern.chunkName, 'medium')
    })
  },

  // Analisar padrões de navegação
  analyzeNavigationPatterns: (
    history: string[]
  ): Array<{ chunkName: string; probability: number }> => {
    const transitions: Record<string, Record<string, number>> = {}

    // Contar transições
    for (let i = 0; i < history.length - 1; i++) {
      const from = history[i]
      const to = history[i + 1]

      if (!transitions[from]) transitions[from] = {}
      transitions[from][to] = (transitions[from][to] || 0) + 1
    }

    // Calcular probabilidades
    const patterns: Array<{ chunkName: string; probability: number }> = []

    for (const [from, destinations] of Object.entries(transitions)) {
      const total = Object.values(destinations).reduce(
        (sum, count) => sum + count,
        0
      )

      for (const [to, count] of Object.entries(destinations)) {
        patterns.push({
          chunkName: to,
          probability: count / total,
        })
      }
    }

    return patterns.sort((a, b) => b.probability - a.probability)
  },

  // Otimizar carregamento baseado na conexão
  optimizeForConnection: () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection

      if (connection) {
        const { effectiveType, downlink } = connection

        // Ajustar estratégia baseada na conexão
        if (effectiveType === '4g' && downlink > 2) {
          // Conexão rápida - precarregar agressivamente
          preloadManager.addToQueue('dashboard', 'high')
          preloadManager.addToQueue('patients', 'high')
        } else if (effectiveType === '3g' || downlink < 1) {
          // Conexão lenta - precarregar apenas essencial
          preloadManager.addToQueue('dashboard', 'low')
        }
      }
    }
  },

  // Limpar caches de chunks não utilizados
  cleanupUnusedChunks: () => {
    const analytics = bundleAnalytics.getAllAnalytics()
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas

    analytics.forEach(chunk => {
      if (now - chunk.lastLoaded > maxAge && chunk.successCount === 0) {
        cacheManager.memory.delete(`chunk_${chunk.chunkName}`)
      }
    })

    bundleAnalytics.cleanup()
  },

  // Obter relatório de performance
  getPerformanceReport: () => {
    const analytics = bundleAnalytics.getAllAnalytics()
    const totalChunks = analytics.length
    const totalLoadTime = analytics.reduce(
      (sum, chunk) => sum + chunk.loadTime,
      0
    )
    const totalErrors = analytics.reduce(
      (sum, chunk) => sum + chunk.errorCount,
      0
    )
    const totalSuccess = analytics.reduce(
      (sum, chunk) => sum + chunk.successCount,
      0
    )

    return {
      totalChunks,
      averageLoadTime: totalChunks > 0 ? totalLoadTime / totalChunks : 0,
      errorRate:
        totalSuccess > 0 ? totalErrors / (totalErrors + totalSuccess) : 0,
      worstPerforming: bundleAnalytics.getWorstPerformingChunks(3),
      cacheHitRate: cacheManager.getStats().hitRate,
    }
  },
}

// Componente para monitoramento de performance
export function BundlePerformanceMonitor({
  onReport,
}: {
  onReport?: (
    report: ReturnType<typeof BundleOptimizer.getPerformanceReport>
  ) => void
}) {
  React.useEffect(() => {
    const interval = setInterval(() => {
      const report = BundleOptimizer.getPerformanceReport()
      onReport?.(report)

      // Log automático se performance estiver ruim
      if (report.errorRate > 0.1 || report.averageLoadTime > 5000) {
        console.warn('Bundle performance degraded:', report)
      }
    }, 30000) // A cada 30 segundos

    return () => clearInterval(interval)
  }, [onReport])

  return null
}

// Middleware para otimização automática
export function setupBundleOptimization() {
  // Otimizar baseado na conexão
  BundleOptimizer.optimizeForConnection()

  // Limpeza automática
  setInterval(
    () => {
      BundleOptimizer.cleanupUnusedChunks()
    },
    60 * 60 * 1000
  ) // A cada hora

  // Preload baseado em comportamento
  setTimeout(() => {
    BundleOptimizer.preloadByUserBehavior()
  }, 5000) // Após 5 segundos
}

// Exportar instâncias e utilitários
export {
  bundleAnalytics,
  preloadManager,
  OptimizedBundleAnalyticsManager as BundleAnalyticsManager,
  PreloadManager,
}

// Importar React para hooks
import React from 'react'
