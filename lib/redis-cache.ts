// Sistema de cache Redis para produção
// Para desenvolvimento, usa cache em memória como fallback

import { CacheManager } from './cache-manager'

interface RedisCacheOptions {
  ttl?: number
  tags?: string[]
}

class RedisCache {
  private memoryFallback: CacheManager
  private isRedisAvailable: boolean = false

  constructor() {
    this.memoryFallback = new CacheManager()
    this.checkRedisConnection()
  }

  private async checkRedisConnection() {
    try {
      // Em produção, você conectaria ao Redis aqui
      // const redis = new Redis(process.env.REDIS_URL)
      // await redis.ping()
      // this.isRedisAvailable = true
      
      // Para desenvolvimento, usar cache em memória
      this.isRedisAvailable = false
      console.log('📦 Cache Redis não disponível, usando cache em memória')
    } catch (error) {
      console.warn('⚠️ Redis não disponível, usando cache em memória:', error)
      this.isRedisAvailable = false
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisAvailable) {
      try {
        // Em produção: return await redis.get(key)
        return null
      } catch (error) {
        console.warn('Erro ao buscar do Redis, usando fallback:', error)
      }
    }
    
    // Fallback para cache em memória
    return this.memoryFallback.get<T>(key)
  }

  async set<T>(key: string, value: T, options: RedisCacheOptions = {}): Promise<boolean> {
    const { ttl = 5 * 60 * 1000, tags = [] } = options

    if (this.isRedisAvailable) {
      try {
        // Em produção: await redis.setex(key, Math.floor(ttl / 1000), JSON.stringify(value))
        // return true
      } catch (error) {
        console.warn('Erro ao salvar no Redis, usando fallback:', error)
      }
    }
    
    // Fallback para cache em memória
    return this.memoryFallback.set(key, value, { ttl, tags })
  }

  async delete(key: string): Promise<boolean> {
    if (this.isRedisAvailable) {
      try {
        // Em produção: await redis.del(key)
        // return true
      } catch (error) {
        console.warn('Erro ao deletar do Redis, usando fallback:', error)
      }
    }
    
    // Fallback para cache em memória
    return this.memoryFallback.delete(key)
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    if (this.isRedisAvailable) {
      try {
        // Em produção, implementar invalidação por tags no Redis
        // return deletedCount
      } catch (error) {
        console.warn('Erro ao invalidar tags no Redis, usando fallback:', error)
      }
    }
    
    // Fallback para cache em memória
    return this.memoryFallback.invalidateByTags(tags)
  }

  async clear(): Promise<void> {
    if (this.isRedisAvailable) {
      try {
        // Em produção: await redis.flushdb()
      } catch (error) {
        console.warn('Erro ao limpar Redis, usando fallback:', error)
      }
    }
    
    // Fallback para cache em memória
    this.memoryFallback.clear()
  }

  getStats() {
    return this.memoryFallback.getStats()
  }
}

// Instância global do cache Redis
export const redisCache = new RedisCache()

// Utilitários para cache de API com Redis
export const ApiRedisCache = {
  // Cache para requisições GET
  get: async <T>(
    url: string,
    options: RequestInit & RedisCacheOptions = {}
  ): Promise<T> => {
    const { ttl = 5 * 60 * 1000, tags = [], ...fetchOptions } = options
    const cacheKey = `api:${url}:${JSON.stringify(fetchOptions)}`

    // Tentar cache primeiro
    const cached = await redisCache.get<T>(cacheKey)
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
    await redisCache.set(cacheKey, data, { ttl, tags: ['api', ...tags] })

    return data
  },

  // Cache direto para dados
  set: async <T>(
    key: string,
    value: T,
    options: RedisCacheOptions = {}
  ): Promise<boolean> => {
    return await redisCache.set(key, value, options)
  },

  // Invalidar cache por tags
  invalidateByTags: async (tags: string[]): Promise<number> => {
    return await redisCache.invalidateByTags(tags)
  },

  // Invalidar cache de API por padrão de URL
  invalidateByUrl: async (urlPattern: string): Promise<number> => {
    // Em produção, implementar busca por padrão no Redis
    // Por enquanto, usar invalidação por tags
    return await redisCache.invalidateByTags([`url:${urlPattern}`])
  },

  // Cache específico para dados de pacientes
  patients: {
    get: (page: number, limit: number, search?: string) => 
      redisCache.get(`patients:${page}:${limit}:${search || ''}`),
    
    set: (page: number, limit: number, search: string | undefined, data: any) => 
      redisCache.set(`patients:${page}:${limit}:${search || ''}`, data, { 
        ttl: 2 * 60 * 1000, // 2 minutos
        tags: ['patients'] 
      }),
    
    invalidate: () => redisCache.invalidateByTags(['patients'])
  },

  // Cache específico para dados de agendamentos
  appointments: {
    get: (date?: string, page?: number, limit?: number) => 
      redisCache.get(`appointments:${date || 'all'}:${page || 1}:${limit || 20}`),
    
    set: (date: string | undefined, page: number | undefined, limit: number | undefined, data: any) => 
      redisCache.set(`appointments:${date || 'all'}:${page || 1}:${limit || 20}`, data, { 
        ttl: 2 * 60 * 1000, // 2 minutos
        tags: ['appointments'] 
      }),
    
    invalidate: () => redisCache.invalidateByTags(['appointments'])
  }
}

export default redisCache