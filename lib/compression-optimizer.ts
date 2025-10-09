'use client'

// Sistema de compressão de dados e otimização de bundle

import React from 'react'
import { cacheManager } from './cache-manager'

// Tipos para compressão
interface CompressionOptions {
  algorithm?: 'gzip' | 'brotli' | 'deflate'
  level?: number
  threshold?: number
  mimeTypes?: string[]
}

interface CompressionResult {
  compressed: string | ArrayBuffer
  originalSize: number
  compressedSize: number
  ratio: number
  algorithm: string
}

interface BundleOptimizationConfig {
  minify?: boolean
  treeshake?: boolean
  splitChunks?: boolean
  compression?: CompressionOptions
  caching?: boolean
}

// Classe para compressão de dados
class DataCompressor {
  private compressionCache = new Map<string, CompressionResult>()

  // Compressão usando CompressionStream (se disponível)
  async compressData(
    data: string | ArrayBuffer,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const {
      algorithm = 'gzip',
      level = 6,
      threshold = 1024,
    } = options

    const dataString = typeof data === 'string' ? data : new TextDecoder().decode(data)
    const originalSize = new Blob([dataString]).size

    // Não comprimir se menor que o threshold
    if (originalSize < threshold) {
      return {
        compressed: dataString,
        originalSize,
        compressedSize: originalSize,
        ratio: 1,
        algorithm: 'none',
      }
    }

    // Verificar cache
    const cacheKey = `${algorithm}_${level}_${this.hashString(dataString)}`
    const cached = this.compressionCache.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      let compressed: string | ArrayBuffer

      if ('CompressionStream' in window) {
        // Usar API nativa de compressão
        compressed = await this.compressWithNativeAPI(dataString, algorithm)
      } else {
        // Fallback para compressão manual
        compressed = await this.compressWithFallback(dataString, algorithm)
      }

      const compressedSize = new Blob([compressed]).size
      const ratio = originalSize / compressedSize

      const result: CompressionResult = {
        compressed,
        originalSize,
        compressedSize,
        ratio,
        algorithm,
      }

      // Cachear resultado
      this.compressionCache.set(cacheKey, result)

      return result
    } catch (error) {
      console.warn('Compression failed, returning original data:', error)
      return {
        compressed: dataString,
        originalSize,
        compressedSize: originalSize,
        ratio: 1,
        algorithm: 'none',
      }
    }
  }

  // Descompressão
  async decompressData(
    compressedData: string | ArrayBuffer,
    algorithm: string
  ): Promise<string> {
    if (algorithm === 'none') {
      return typeof compressedData === 'string' 
        ? compressedData 
        : new TextDecoder().decode(compressedData)
    }

    try {
      if ('DecompressionStream' in window) {
        return await this.decompressWithNativeAPI(compressedData, algorithm)
      } else {
        return await this.decompressWithFallback(compressedData, algorithm)
      }
    } catch (error) {
      console.error('Decompression failed:', error)
      throw error
    }
  }

  // Compressão com API nativa
  private async compressWithNativeAPI(
    data: string,
    algorithm: string
  ): Promise<ArrayBuffer> {
    const stream = new CompressionStream(algorithm as any)
    const writer = stream.writable.getWriter()
    const reader = stream.readable.getReader()

    // Escrever dados
    await writer.write(new TextEncoder().encode(data))
    await writer.close()

    // Ler dados comprimidos
    const chunks: Uint8Array[] = []
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        chunks.push(value)
      }
    }

    // Combinar chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return result.buffer
  }

  // Descompressão com API nativa
  private async decompressWithNativeAPI(
    compressedData: string | ArrayBuffer,
    algorithm: string
  ): Promise<string> {
    const stream = new DecompressionStream(algorithm as any)
    const writer = stream.writable.getWriter()
    const reader = stream.readable.getReader()

    // Converter para ArrayBuffer se necessário
    const buffer = typeof compressedData === 'string'
      ? new TextEncoder().encode(compressedData).buffer
      : compressedData

    // Escrever dados comprimidos
    await writer.write(new Uint8Array(buffer))
    await writer.close()

    // Ler dados descomprimidos
    const chunks: Uint8Array[] = []
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        chunks.push(value)
      }
    }

    // Combinar e decodificar
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return new TextDecoder().decode(result)
  }

  // Fallback para compressão (implementação simples)
  private async compressWithFallback(
    data: string,
    algorithm: string
  ): Promise<string> {
    // Implementação básica de compressão LZ77-like
    return this.lz77Compress(data)
  }

  // Fallback para descompressão
  private async decompressWithFallback(
    compressedData: string | ArrayBuffer,
    algorithm: string
  ): Promise<string> {
    const dataString = typeof compressedData === 'string'
      ? compressedData
      : new TextDecoder().decode(compressedData)
    
    return this.lz77Decompress(dataString)
  }

  // Compressão LZ77 simples
  private lz77Compress(data: string): string {
    const result: string[] = []
    let i = 0

    while (i < data.length) {
      let matchLength = 0
      let matchDistance = 0

      // Procurar por correspondências
      for (let j = Math.max(0, i - 255); j < i; j++) {
        let length = 0
        while (
          i + length < data.length &&
          j + length < i &&
          data[i + length] === data[j + length] &&
          length < 255
        ) {
          length++
        }

        if (length > matchLength) {
          matchLength = length
          matchDistance = i - j
        }
      }

      if (matchLength >= 3) {
        // Codificar correspondência
        result.push(`<${matchDistance},${matchLength}>`)
        i += matchLength
      } else {
        // Codificar literal
        result.push(data[i])
        i++
      }
    }

    return result.join('')
  }

  // Descompressão LZ77 simples
  private lz77Decompress(data: string): string {
    const result: string[] = []
    let i = 0

    while (i < data.length) {
      if (data[i] === '<') {
        // Decodificar correspondência
        const endIndex = data.indexOf('>', i)
        const match = data.substring(i + 1, endIndex)
        const [distance, length] = match.split(',').map(Number)

        const startPos = result.length - distance
        for (let j = 0; j < length; j++) {
          result.push(result[startPos + j])
        }

        i = endIndex + 1
      } else {
        // Decodificar literal
        result.push(data[i])
        i++
      }
    }

    return result.join('')
  }

  // Hash simples para cache
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Converter para 32bit
    }
    return hash.toString(36)
  }

  // Limpar cache
  clearCache(): void {
    this.compressionCache.clear()
  }

  // Estatísticas de compressão
  getCompressionStats(): {
    cacheSize: number
    totalCompressions: number
    averageRatio: number
  } {
    const results = Array.from(this.compressionCache.values())
    const totalRatio = results.reduce((sum, result) => sum + result.ratio, 0)

    return {
      cacheSize: this.compressionCache.size,
      totalCompressions: results.length,
      averageRatio: results.length > 0 ? totalRatio / results.length : 1,
    }
  }
}

// Otimizador de bundle
class BundleOptimizer {
  private config: BundleOptimizationConfig
  private compressor: DataCompressor

  constructor(config: BundleOptimizationConfig = {}) {
    this.config = {
      minify: true,
      treeshake: true,
      splitChunks: true,
      compression: { algorithm: 'gzip', level: 6 },
      caching: true,
      ...config,
    }
    this.compressor = new DataCompressor()
  }

  // Otimizar JavaScript
  async optimizeJavaScript(code: string): Promise<string> {
    let optimizedCode = code

    // Minificação básica
    if (this.config.minify) {
      optimizedCode = this.minifyJavaScript(optimizedCode)
    }

    // Tree shaking básico
    if (this.config.treeshake) {
      optimizedCode = this.treeShakeCode(optimizedCode)
    }

    // Compressão
    if (this.config.compression) {
      const compressed = await this.compressor.compressData(
        optimizedCode,
        this.config.compression
      )
      
      // Retornar código comprimido se houver benefício
      if (compressed.ratio > 1.2) {
        return compressed.compressed as string
      }
    }

    return optimizedCode
  }

  // Otimizar CSS
  async optimizeCSS(css: string): Promise<string> {
    let optimizedCSS = css

    // Minificação de CSS
    if (this.config.minify) {
      optimizedCSS = this.minifyCSS(optimizedCSS)
    }

    // Compressão
    if (this.config.compression) {
      const compressed = await this.compressor.compressData(
        optimizedCSS,
        this.config.compression
      )
      
      if (compressed.ratio > 1.2) {
        return compressed.compressed as string
      }
    }

    return optimizedCSS
  }

  // Minificação básica de JavaScript
  private minifyJavaScript(code: string): string {
    return code
      // Remover comentários
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      // Remover espaços extras
      .replace(/\s+/g, ' ')
      // Remover espaços ao redor de operadores
      .replace(/\s*([{}();,:])\s*/g, '$1')
      .trim()
  }

  // Minificação básica de CSS
  private minifyCSS(css: string): string {
    return css
      // Remover comentários
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remover espaços extras
      .replace(/\s+/g, ' ')
      // Remover espaços ao redor de caracteres especiais
      .replace(/\s*([{}();,:])\s*/g, '$1')
      // Remover último ponto e vírgula
      .replace(/;}/g, '}')
      .trim()
  }

  // Tree shaking básico
  private treeShakeCode(code: string): string {
    // Implementação básica - remover exports não utilizados
    const lines = code.split('\n')
    const usedExports = new Set<string>()
    const exportLines = new Map<string, number>()

    // Encontrar exports
    lines.forEach((line, index) => {
      const exportMatch = line.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/)
      if (exportMatch) {
        exportLines.set(exportMatch[1], index)
      }
    })

    // Encontrar imports/usos
    lines.forEach(line => {
      exportLines.forEach((_, exportName) => {
        if (line.includes(exportName) && !line.startsWith('export')) {
          usedExports.add(exportName)
        }
      })
    })

    // Remover exports não utilizados
    const filteredLines = lines.filter((line, index) => {
      for (const [exportName, exportIndex] of exportLines) {
        if (index === exportIndex && !usedExports.has(exportName)) {
          return false
        }
      }
      return true
    })

    return filteredLines.join('\n')
  }

  // Analisar bundle
  analyzeBundleSize(code: string): {
    originalSize: number
    minifiedSize: number
    gzipSize: number
    savings: {
      minification: number
      compression: number
      total: number
    }
  } {
    const originalSize = new Blob([code]).size
    const minified = this.minifyJavaScript(code)
    const minifiedSize = new Blob([minified]).size

    // Estimativa de compressão gzip (aproximada)
    const gzipSize = Math.floor(minifiedSize * 0.7) // Estimativa conservadora

    return {
      originalSize,
      minifiedSize,
      gzipSize,
      savings: {
        minification: ((originalSize - minifiedSize) / originalSize) * 100,
        compression: ((minifiedSize - gzipSize) / minifiedSize) * 100,
        total: ((originalSize - gzipSize) / originalSize) * 100,
      },
    }
  }
}

// Instâncias globais
const dataCompressor = new DataCompressor()
const bundleOptimizer = new BundleOptimizer()

// Hooks para compressão
export function useDataCompression() {
  const compressData = React.useCallback(async (
    data: string | ArrayBuffer,
    options?: CompressionOptions
  ) => {
    return await dataCompressor.compressData(data, options)
  }, [])

  const decompressData = React.useCallback(async (
    compressedData: string | ArrayBuffer,
    algorithm: string
  ) => {
    return await dataCompressor.decompressData(compressedData, algorithm)
  }, [])

  const getStats = React.useCallback(() => {
    return dataCompressor.getCompressionStats()
  }, [])

  return {
    compressData,
    decompressData,
    getStats,
    clearCache: () => dataCompressor.clearCache(),
  }
}

// Utilitários de compressão
export const CompressionUtils = {
  // Comprimir dados para localStorage
  compressForStorage: async (data: any): Promise<string> => {
    const jsonString = JSON.stringify(data)
    const compressed = await dataCompressor.compressData(jsonString)
    
    return JSON.stringify({
      data: compressed.compressed,
      algorithm: compressed.algorithm,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
    })
  },

  // Descomprimir dados do localStorage
  decompressFromStorage: async (compressedString: string): Promise<any> => {
    const { data, algorithm } = JSON.parse(compressedString)
    const decompressed = await dataCompressor.decompressData(data, algorithm)
    return JSON.parse(decompressed)
  },

  // Comprimir resposta de API
  compressApiResponse: async (response: any): Promise<CompressionResult> => {
    const jsonString = JSON.stringify(response)
    return await dataCompressor.compressData(jsonString)
  },

  // Otimizar bundle
  optimizeBundle: bundleOptimizer,

  // Analisar tamanho de dados
  analyzeDataSize: (data: any) => {
    const jsonString = JSON.stringify(data)
    const size = new Blob([jsonString]).size
    
    return {
      size,
      sizeFormatted: CompressionUtils.formatBytes(size),
      estimatedGzipSize: Math.floor(size * 0.7),
      canBenefit: size > 1024, // Benefício se > 1KB
    }
  },

  // Formatar bytes
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },
}

export { DataCompressor, BundleOptimizer }