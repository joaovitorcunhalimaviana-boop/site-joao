// Sistema de cache inteligente para otimização de performance

// Tipos para o sistema de cache
interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  tags?: string[]
  size?: number
}

interface CacheOptions {
  ttl?: number // Time to live em milliseconds
  maxSize?: number // Tamanho máximo do cache
  maxItems?: number // Número máximo de itens
  tags?: string[] // Tags para invalidação em grupo
  persistent?: boolean // Se deve persistir no localStorage
  compress?: boolean // Se deve comprimir os dados
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  itemCount: number
  hitRate: number
}

// Utilitários para compressão
class CompressionUtils {
  // Compressão simples usando LZ-string (simulação)
  static compress(data: string): string {
    try {
      // Em produção, usar uma biblioteca como lz-string
      return btoa(data)
    } catch {
      return data
    }
  }

  static decompress(compressed: string): string {
    try {
      return atob(compressed)
    } catch {
      return compressed
    }
  }

  // Calcular tamanho aproximado em bytes
  static calculateSize(data: any): number {
    const str = JSON.stringify(data)
    return new Blob([str]).size
  }
}

// Cache em memória com estratégias LRU e TTL
class MemoryCache {
  private cache = new Map<string, CacheItem>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    itemCount: 0,
    hitRate: 0,
  }
  private maxSize: number
  private maxItems: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(maxSize = 50 * 1024 * 1024, maxItems = 1000) {
    // 50MB padrão
    this.maxSize = maxSize
    this.maxItems = maxItems
    this.startCleanup()
  }

  // Iniciar limpeza automática
  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000) // Limpeza a cada minuto
  }

  // Parar limpeza automática
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  // Obter item do cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // Verificar TTL
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key)
      this.updateStats()
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // Atualizar estatísticas de acesso
    item.accessCount++
    item.lastAccessed = Date.now()
    this.stats.hits++
    this.updateHitRate()

    return item.data
  }

  // Definir item no cache
  set<T>(key: string, data: T, options: CacheOptions = {}): boolean {
    const {
      ttl = 5 * 60 * 1000, // 5 minutos padrão
      tags = [],
      compress = false,
    } = options

    let processedData = data
    let size = CompressionUtils.calculateSize(data)

    // Comprimir se solicitado
    if (compress && typeof data === 'string') {
      processedData = CompressionUtils.compress(data) as T
      size = CompressionUtils.calculateSize(processedData)
    }

    const item: CacheItem<T> = {
      data: processedData,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      tags,
      size,
    }

    // Verificar limites antes de adicionar
    if (size > this.maxSize) {
      console.warn(`Item muito grande para cache: ${key} (${size} bytes)`)
      return false
    }

    // Fazer espaço se necessário
    this.makeSpace(size)

    this.cache.set(key, item)
    this.updateStats()
    return true
  }

  // Fazer espaço no cache usando estratégia LRU
  private makeSpace(requiredSize: number) {
    while (
      this.stats.size + requiredSize > this.maxSize ||
      this.stats.itemCount >= this.maxItems
    ) {
      // Encontrar item menos recentemente usado
      let oldestKey = ''
      let oldestTime = Date.now()

      for (const [key, item] of this.cache) {
        if (item.lastAccessed < oldestTime) {
          oldestTime = item.lastAccessed
          oldestKey = key
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey)
      } else {
        break
      }
    }
    this.updateStats()
  }

  // Remover item do cache
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.updateStats()
    }
    return deleted
  }

  // Limpar cache por tags
  invalidateByTags(tags: string[]): number {
    let deleted = 0

    for (const [key, item] of this.cache) {
      if (item.tags && item.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key)
        deleted++
      }
    }

    this.updateStats()
    return deleted
  }

  // Limpeza de itens expirados
  cleanup(): number {
    let cleaned = 0
    const now = Date.now()

    for (const [key, item] of this.cache) {
      if (now > item.timestamp + item.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    this.updateStats()
    return cleaned
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear()
    this.updateStats()
  }

  // Atualizar estatísticas
  private updateStats() {
    this.stats.itemCount = this.cache.size
    this.stats.size = Array.from(this.cache.values()).reduce(
      (total, item) => total + (item.size || 0),
      0
    )
  }

  private updateHitRate() {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  // Obter estatísticas
  getStats(): CacheStats {
    return { ...this.stats }
  }

  // Obter todas as chaves
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Verificar se existe
  has(key: string): boolean {
    return this.cache.has(key)
  }
}

// Cache persistente usando localStorage
class PersistentCache {
  private prefix: string
  private memoryCache: MemoryCache

  constructor(prefix = 'app_cache_', memoryCache?: MemoryCache) {
    this.prefix = prefix
    this.memoryCache = memoryCache || new MemoryCache()
  }

  // Obter item do cache persistente
  get<T>(key: string): T | null {
    // Primeiro tentar cache em memória
    const memoryResult = this.memoryCache.get<T>(key)
    if (memoryResult !== null) {
      return memoryResult
    }

    // Tentar localStorage
    try {
      const stored = localStorage.getItem(this.prefix + key)
      if (!stored) return null

      const item: CacheItem<T> = JSON.parse(stored)

      // Verificar TTL
      if (Date.now() > item.timestamp + item.ttl) {
        localStorage.removeItem(this.prefix + key)
        return null
      }

      // Adicionar de volta ao cache em memória
      this.memoryCache.set(key, item.data, { ttl: item.ttl, tags: item.tags })

      return item.data
    } catch (error) {
      console.warn('Erro ao ler cache persistente:', error)
      return null
    }
  }

  // Definir item no cache persistente
  set<T>(key: string, data: T, options: CacheOptions = {}): boolean {
    const {
      ttl = 24 * 60 * 60 * 1000, // 24 horas padrão para persistente
      tags = [],
      compress = true,
    } = options

    try {
      let processedData = data

      // Comprimir se solicitado
      if (compress && typeof data === 'string') {
        processedData = CompressionUtils.compress(data) as T
      }

      const item: CacheItem<T> = {
        data: processedData,
        timestamp: Date.now(),
        ttl,
        accessCount: 0,
        lastAccessed: Date.now(),
        tags,
        size: CompressionUtils.calculateSize(processedData),
      }

      // Salvar no localStorage
      localStorage.setItem(this.prefix + key, JSON.stringify(item))

      // Também salvar no cache em memória
      this.memoryCache.set(key, data, options)

      return true
    } catch (error) {
      console.warn('Erro ao salvar cache persistente:', error)
      return false
    }
  }

  // Remover item
  delete(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key)
      this.memoryCache.delete(key)
      return true
    } catch (error) {
      console.warn('Erro ao remover cache persistente:', error)
      return false
    }
  }

  // Limpar cache por tags
  invalidateByTags(tags: string[]): number {
    let deleted = 0

    try {
      // Limpar cache em memória
      deleted += this.memoryCache.invalidateByTags(tags)

      // Limpar localStorage
      const keys = Object.keys(localStorage)
      for (const fullKey of keys) {
        if (fullKey.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(localStorage.getItem(fullKey) || '{}')
            if (
              item.tags &&
              item.tags.some((tag: string) => tags.includes(tag))
            ) {
              localStorage.removeItem(fullKey)
              deleted++
            }
          } catch {
            // Ignorar erros de parsing
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao invalidar cache por tags:', error)
    }

    return deleted
  }

  // Limpeza de itens expirados
  cleanup(): number {
    let cleaned = 0
    const now = Date.now()

    try {
      // Limpar cache em memória
      cleaned += this.memoryCache.cleanup()

      // Limpar localStorage
      const keys = Object.keys(localStorage)
      for (const fullKey of keys) {
        if (fullKey.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(localStorage.getItem(fullKey) || '{}')
            if (now > item.timestamp + item.ttl) {
              localStorage.removeItem(fullKey)
              cleaned++
            }
          } catch {
            // Remover itens corrompidos
            localStorage.removeItem(fullKey)
            cleaned++
          }
        }
      }
    } catch (error) {
      console.warn('Erro na limpeza do cache:', error)
    }

    return cleaned
  }

  // Limpar todo o cache
  clear(): void {
    try {
      this.memoryCache.clear()

      const keys = Object.keys(localStorage)
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.warn('Erro ao limpar cache:', error)
    }
  }

  // Obter estatísticas
  getStats(): CacheStats {
    return this.memoryCache.getStats()
  }
}

// Gerenciador principal de cache
class CacheManager {
  private memoryCache: MemoryCache
  private persistentCache: PersistentCache
  private defaultOptions: CacheOptions

  constructor(
    options: {
      maxMemorySize?: number
      maxMemoryItems?: number
      cachePrefix?: string
      defaultTTL?: number
    } = {}
  ) {
    const {
      maxMemorySize = 50 * 1024 * 1024,
      maxMemoryItems = 1000,
      cachePrefix = 'app_cache_',
      defaultTTL = 5 * 60 * 1000,
    } = options

    this.memoryCache = new MemoryCache(maxMemorySize, maxMemoryItems)
    this.persistentCache = new PersistentCache(cachePrefix, this.memoryCache)
    this.defaultOptions = { ttl: defaultTTL }

    // Limpeza automática a cada hora
    setInterval(
      () => {
        this.cleanup()
      },
      60 * 60 * 1000
    )
  }

  // Cache em memória (rápido, temporário)
  memory = {
    get: <T>(key: string): T | null => this.memoryCache.get<T>(key),
    set: <T>(key: string, data: T, options?: CacheOptions): boolean =>
      this.memoryCache.set(key, data, { ...this.defaultOptions, ...options }),
    delete: (key: string): boolean => this.memoryCache.delete(key),
    clear: (): void => this.memoryCache.clear(),
    has: (key: string): boolean => this.memoryCache.has(key),
  }

  // Cache persistente (mais lento, permanente)
  persistent = {
    get: <T>(key: string): T | null => this.persistentCache.get<T>(key),
    set: <T>(key: string, data: T, options?: CacheOptions): boolean =>
      this.persistentCache.set(key, data, {
        ...this.defaultOptions,
        persistent: true,
        ...options,
      }),
    delete: (key: string): boolean => this.persistentCache.delete(key),
    clear: (): void => this.persistentCache.clear(),
  }

  // Métodos principais do cache (delegam para memory cache por padrão)
  get<T>(key: string): T | null {
    return this.memory.get<T>(key)
  }

  set<T>(key: string, data: T, options?: CacheOptions): boolean {
    return this.memory.set(key, data, options)
  }

  delete(key: string): boolean {
    return this.memory.delete(key)
  }

  clear(): void {
    this.memory.clear()
  }

  has(key: string): boolean {
    return this.memory.has(key)
  }

  // Invalidar por tags
  invalidateByTags(tags: string[]): number {
    return (
      this.memoryCache.invalidateByTags(tags) +
      this.persistentCache.invalidateByTags(tags)
    )
  }

  // Limpeza geral
  cleanup(): number {
    return this.memoryCache.cleanup() + this.persistentCache.cleanup()
  }

  // Obter estatísticas combinadas
  getStats(): CacheStats {
    return this.memoryCache.getStats()
  }

  // Destruir cache manager
  destroy(): void {
    this.memoryCache.stopCleanup()
  }
}

// Instância global do cache manager
export const cacheManager = new CacheManager()

// Hook React para usar cache
export function useCache() {
  return {
    memory: cacheManager.memory,
    persistent: cacheManager.persistent,
    invalidateByTags: (tags: string[]) => cacheManager.invalidateByTags(tags),
    cleanup: () => cacheManager.cleanup(),
    getStats: () => cacheManager.getStats(),
  }
}

// Decorador para cache de funções
export function cached<T extends (...args: any[]) => any>(
  fn: T,
  options: CacheOptions & {
    keyGenerator?: (...args: Parameters<T>) => string
    persistent?: boolean
  } = {}
): T {
  const {
    keyGenerator = (...args) => JSON.stringify(args),
    persistent = false,
    ...cacheOptions
  } = options

  const cache = persistent ? cacheManager.persistent : cacheManager.memory

  return ((...args: Parameters<T>) => {
    const key = `fn_${fn.name}_${keyGenerator(...args)}`

    // Tentar obter do cache
    const cached = cache.get(key)
    if (cached !== null) {
      return cached
    }

    // Executar função e cachear resultado
    const result = fn(...args)
    cache.set(key, result, cacheOptions)

    return result
  }) as T
}

// Utilitários para cache de API
export const ApiCache = {
  // Cache para requisições GET
  get: async <T>(
    url: string,
    options: RequestInit & CacheOptions = {}
  ): Promise<T> => {
    const { ttl = 5 * 60 * 1000, tags = [], ...fetchOptions } = options
    const cacheKey = `api_${url}_${JSON.stringify(fetchOptions)}`

    // Tentar cache primeiro
    const cached = cacheManager.memory.get<T>(cacheKey)
    if (cached !== null) {
      return cached
    }

    // Fazer requisição
    const response = await fetch(url, fetchOptions)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Cachear resultado
    cacheManager.memory.set(cacheKey, data, { ttl, tags: ['api', ...tags] })

    return data
  },

  // Invalidar cache de API por padrão de URL
  invalidateByUrl: (urlPattern: string): number => {
    let deleted = 0

    // Usar a instância do MemoryCache diretamente
    if (cacheManager.memory instanceof MemoryCache) {
      const keys = cacheManager.memory.keys()

      for (const key of keys) {
        if (key.startsWith('api_') && key.includes(urlPattern)) {
          if (cacheManager.memory.delete(key)) {
            deleted++
          }
        }
      }
    }

    return deleted
  },
}

// Exportar classes e tipos
export {
  MemoryCache,
  PersistentCache,
  CacheManager,
  CompressionUtils,
  type CacheItem,
  type CacheOptions,
  type CacheStats,
}
