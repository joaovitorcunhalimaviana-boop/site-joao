'use client'

// Sistema de monitoramento de performance e analytics

import React from 'react'
import { cacheManager } from './cache-manager'

// Tipos para monitoramento de performance
interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  
  // Métricas customizadas
  pageLoadTime?: number
  domContentLoaded?: number
  resourceLoadTime?: number
  apiResponseTime?: number
  renderTime?: number
  
  // Métricas de memória
  usedJSHeapSize?: number
  totalJSHeapSize?: number
  jsHeapSizeLimit?: number
  
  // Métricas de rede
  connectionType?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  
  // Timestamp
  timestamp: number
  url: string
  userAgent: string
}

interface PerformanceThresholds {
  fcp: { good: number; poor: number }
  lcp: { good: number; poor: number }
  fid: { good: number; poor: number }
  cls: { good: number; poor: number }
  ttfb: { good: number; poor: number }
}

interface PerformanceAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  metric: string
  value: number
  threshold: number
  message: string
  timestamp: number
  url: string
}

// Thresholds baseados no Core Web Vitals
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  ttfb: { good: 800, poor: 1800 },
}

// Classe principal de monitoramento
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private alerts: PerformanceAlert[] = []
  private thresholds: PerformanceThresholds
  private observers: Map<string, PerformanceObserver> = new Map()
  private isMonitoring = false
  private maxMetricsHistory = 100

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds }
    this.initializeMonitoring()
  }

  // Inicializar monitoramento
  private initializeMonitoring() {
    if (typeof window === 'undefined') return

    // Monitorar Core Web Vitals
    this.observeCoreWebVitals()
    
    // Monitorar recursos
    this.observeResourceTiming()
    
    // Monitorar navegação
    this.observeNavigationTiming()
    
    // Monitorar memória
    this.observeMemoryUsage()
    
    // Monitorar rede
    this.observeNetworkInformation()

    this.isMonitoring = true
  }

  // Observar Core Web Vitals
  private observeCoreWebVitals() {
    // First Contentful Paint
    this.createObserver('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('fcp', entry.startTime)
        }
      })
    })

    // Largest Contentful Paint
    this.createObserver('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        this.recordMetric('lcp', lastEntry.startTime)
      }
    })

    // First Input Delay
    this.createObserver('first-input', (entries) => {
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime
        this.recordMetric('fid', fid)
      })
    })

    // Cumulative Layout Shift
    this.createObserver('layout-shift', (entries) => {
      let clsValue = 0
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      if (clsValue > 0) {
        this.recordMetric('cls', clsValue)
      }
    })
  }

  // Observar timing de recursos
  private observeResourceTiming() {
    this.createObserver('resource', (entries) => {
      entries.forEach((entry: any) => {
        const resourceTime = entry.responseEnd - entry.startTime
        this.recordMetric('resourceLoadTime', resourceTime)
      })
    })
  }

  // Observar timing de navegação
  private observeNavigationTiming() {
    this.createObserver('navigation', (entries) => {
      entries.forEach((entry) => {
        const navEntry = entry as PerformanceNavigationTiming
        
        // Time to First Byte
        const ttfb = navEntry.responseStart - navEntry.requestStart
        this.recordMetric('ttfb', ttfb)
        
        // DOM Content Loaded
        const dcl = navEntry.domContentLoadedEventEnd - (navEntry as any).navigationStart
        this.recordMetric('domContentLoaded', dcl)
        
        // Page Load Time
        const plt = navEntry.loadEventEnd - (navEntry as any).navigationStart
        this.recordMetric('pageLoadTime', plt)
      })
    })
  }

  // Observar uso de memória
  private observeMemoryUsage() {
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory
      
      setInterval(() => {
        this.recordMetric('usedJSHeapSize', memoryInfo.usedJSHeapSize)
        this.recordMetric('totalJSHeapSize', memoryInfo.totalJSHeapSize)
        this.recordMetric('jsHeapSizeLimit', memoryInfo.jsHeapSizeLimit)
      }, 5000) // A cada 5 segundos
    }
  }

  // Observar informações de rede
  private observeNetworkInformation() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      const updateNetworkInfo = () => {
        this.recordMetric('connectionType', connection.type)
        this.recordMetric('effectiveType', connection.effectiveType)
        this.recordMetric('downlink', connection.downlink)
        this.recordMetric('rtt', connection.rtt)
      }

      updateNetworkInfo()
      connection.addEventListener('change', updateNetworkInfo)
    }
  }

  // Criar observer genérico
  private createObserver(
    type: string,
    callback: (entries: PerformanceEntry[]) => void
  ) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries())
      })
      
      observer.observe({ type, buffered: true })
      this.observers.set(type, observer)
    } catch (error) {
      console.warn(`Failed to create observer for ${type}:`, error)
    }
  }

  // Registrar métrica
  private recordMetric(name: string, value: number | string) {
    const currentMetrics = this.getCurrentMetrics()
    
    if (typeof value === 'number') {
      (currentMetrics as any)[name] = value
      
      // Verificar thresholds
      this.checkThreshold(name, value)
    }

    // Atualizar métricas atuais
    this.updateCurrentMetrics(currentMetrics)
  }

  // Verificar thresholds
  private checkThreshold(metricName: string, value: number) {
    const threshold = (this.thresholds as any)[metricName]
    if (!threshold) return

    let alertType: 'info' | 'warning' | 'error' = 'info'
    let message = ''

    if (value > threshold.poor) {
      alertType = 'error'
      message = `${metricName} está muito alto: ${value.toFixed(2)}ms (limite: ${threshold.poor}ms)`
    } else if (value > threshold.good) {
      alertType = 'warning'
      message = `${metricName} precisa melhorar: ${value.toFixed(2)}ms (ideal: <${threshold.good}ms)`
    } else {
      alertType = 'info'
      message = `${metricName} está bom: ${value.toFixed(2)}ms`
    }

    this.createAlert(alertType, metricName, value, threshold.poor, message)
  }

  // Criar alerta
  private createAlert(
    type: 'warning' | 'error' | 'info',
    metric: string,
    value: number,
    threshold: number,
    message: string
  ) {
    const alert: PerformanceAlert = {
      id: `${Date.now()}_${metric}`,
      type,
      metric,
      value,
      threshold,
      message,
      timestamp: Date.now(),
      url: window.location.href,
    }

    this.alerts.push(alert)
    
    // Manter apenas os últimos 50 alertas
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50)
    }

    // Emitir evento customizado
    window.dispatchEvent(new CustomEvent('performance-alert', { detail: alert }))
  }

  // Obter métricas atuais
  private getCurrentMetrics(): PerformanceMetrics {
    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }
  }

  // Atualizar métricas atuais
  private updateCurrentMetrics(metrics: PerformanceMetrics) {
    this.metrics.push(metrics)
    
    // Manter histórico limitado
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory)
    }

    // Cachear métricas
    cacheManager.memory.set('performance_metrics', this.metrics, {
      ttl: 5 * 60 * 1000, // 5 minutos
      tags: ['performance'],
    })
  }

  // Métodos públicos
  
  // Obter todas as métricas
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  // Obter métricas mais recentes
  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }

  // Obter alertas
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts]
  }

  // Obter alertas por tipo
  getAlertsByType(type: 'warning' | 'error' | 'info'): PerformanceAlert[] {
    return this.alerts.filter(alert => alert.type === type)
  }

  // Calcular estatísticas
  getStatistics(): {
    averages: Partial<PerformanceMetrics>
    medians: Partial<PerformanceMetrics>
    percentiles: { p95: Partial<PerformanceMetrics>; p99: Partial<PerformanceMetrics> }
  } {
    if (this.metrics.length === 0) {
      return { averages: {}, medians: {}, percentiles: { p95: {}, p99: {} } }
    }

    const numericMetrics = ['fcp', 'lcp', 'fid', 'cls', 'ttfb', 'pageLoadTime', 'domContentLoaded']
    const averages: any = {}
    const medians: any = {}
    const p95: any = {}
    const p99: any = {}

    numericMetrics.forEach(metric => {
      const values = this.metrics
        .map(m => (m as any)[metric])
        .filter(v => typeof v === 'number')
        .sort((a, b) => a - b)

      if (values.length > 0) {
        // Média
        averages[metric] = values.reduce((sum, val) => sum + val, 0) / values.length

        // Mediana
        const mid = Math.floor(values.length / 2)
        medians[metric] = values.length % 2 === 0
          ? (values[mid - 1] + values[mid]) / 2
          : values[mid]

        // Percentis
        p95[metric] = values[Math.floor(values.length * 0.95)]
        p99[metric] = values[Math.floor(values.length * 0.99)]
      }
    })

    return { averages, medians, percentiles: { p95, p99 } }
  }

  // Medir tempo de execução de função
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    
    this.recordMetric(`custom_${name}`, end - start)
    return result
  }

  // Medir tempo de execução de função async
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    
    this.recordMetric(`custom_${name}`, end - start)
    return result
  }

  // Marcar evento customizado
  markEvent(name: string, detail?: any) {
    performance.mark(name)
    
    if (detail) {
      this.recordMetric(`event_${name}`, performance.now())
    }
  }

  // Medir entre dois eventos
  measureBetweenMarks(startMark: string, endMark: string, name?: string) {
    const measureName = name || `${startMark}-to-${endMark}`
    performance.measure(measureName, startMark, endMark)
    
    const measure = performance.getEntriesByName(measureName)[0]
    if (measure) {
      this.recordMetric(`measure_${measureName}`, measure.duration)
    }
  }

  // Limpar dados
  clearData() {
    this.metrics = []
    this.alerts = []
    cacheManager.memory.delete('performance_metrics')
  }

  // Parar monitoramento
  stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.isMonitoring = false
  }

  // Exportar dados
  exportData(): {
    metrics: PerformanceMetrics[]
    alerts: PerformanceAlert[]
    statistics: ReturnType<PerformanceMonitor['getStatistics']>
    timestamp: number
  } {
    return {
      metrics: this.getMetrics(),
      alerts: this.getAlerts(),
      statistics: this.getStatistics(),
      timestamp: Date.now(),
    }
  }
}

// Instância global
const performanceMonitor = new PerformanceMonitor()

// Hook para usar o monitor de performance
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics[]>([])
  const [alerts, setAlerts] = React.useState<PerformanceAlert[]>([])

  React.useEffect(() => {
    // Atualizar dados iniciais
    setMetrics(performanceMonitor.getMetrics())
    setAlerts(performanceMonitor.getAlerts())

    // Escutar alertas
    const handleAlert = (event: CustomEvent<PerformanceAlert>) => {
      setAlerts(prev => [...prev, event.detail])
    }

    window.addEventListener('performance-alert', handleAlert as EventListener)

    // Atualizar métricas periodicamente
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics())
    }, 1000)

    return () => {
      window.removeEventListener('performance-alert', handleAlert as EventListener)
      clearInterval(interval)
    }
  }, [])

  return {
    metrics,
    alerts,
    latestMetrics: performanceMonitor.getLatestMetrics(),
    statistics: performanceMonitor.getStatistics(),
    measureFunction: performanceMonitor.measureFunction.bind(performanceMonitor),
    measureAsyncFunction: performanceMonitor.measureAsyncFunction.bind(performanceMonitor),
    markEvent: performanceMonitor.markEvent.bind(performanceMonitor),
    clearData: performanceMonitor.clearData.bind(performanceMonitor),
    exportData: performanceMonitor.exportData.bind(performanceMonitor),
  }
}

// Utilitários de performance
export const PerformanceUtils = {
  // Formatar tempo
  formatTime: (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  },

  // Classificar performance
  classifyPerformance: (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = (DEFAULT_THRESHOLDS as any)[metric]
    if (!thresholds) return 'good'

    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.poor) return 'needs-improvement'
    return 'poor'
  },

  // Obter cor baseada na performance
  getPerformanceColor: (classification: string): string => {
    switch (classification) {
      case 'good': return '#10b981' // green
      case 'needs-improvement': return '#f59e0b' // yellow
      case 'poor': return '#ef4444' // red
      default: return '#6b7280' // gray
    }
  },

  // Calcular score de performance (0-100)
  calculatePerformanceScore: (metrics: PerformanceMetrics): number => {
    const weights = { fcp: 0.15, lcp: 0.25, fid: 0.25, cls: 0.25, ttfb: 0.1 }
    let totalScore = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([metric, weight]) => {
      const value = (metrics as any)[metric]
      if (typeof value === 'number') {
        const classification = PerformanceUtils.classifyPerformance(metric, value)
        let score = 0
        
        switch (classification) {
          case 'good': score = 90; break
          case 'needs-improvement': score = 50; break
          case 'poor': score = 25; break
        }
        
        totalScore += score * weight
        totalWeight += weight
      }
    })

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
  },
}

export { PerformanceMonitor, performanceMonitor }