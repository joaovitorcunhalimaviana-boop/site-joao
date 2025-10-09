'use client'

import React, { Suspense, lazy, ComponentType, memo, useMemo, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-optimized'
import { createOptimizedLazy } from '@/lib/bundle-optimizer'

// Tipos para code splitting
interface RouteConfig {
  path: string
  component: () => Promise<{ default: ComponentType<any> }>
  preload?: boolean
  priority?: 'high' | 'medium' | 'low'
  dependencies?: string[]
  fallback?: ComponentType
}

interface DynamicRouteProps {
  routes: RouteConfig[]
  fallback?: ComponentType
  onRouteChange?: (path: string) => void
}

interface LazyModuleProps<T extends Record<string, any> = Record<string, any>> {
  loader: () => Promise<{ default: ComponentType<T> }>
  fallback?: ComponentType
  errorBoundary?: ComponentType<{ error: Error; retry: () => void }>
  preload?: boolean
  props?: T
}

// Configuração de rotas com code splitting
const routeConfigs: RouteConfig[] = [
  {
    path: '/area-medica',
    component: () => import('@/app/area-medica/page'),
    preload: true,
    priority: 'high',
    dependencies: ['dashboard', 'charts'],
  },
  {
    path: '/area-secretaria',
    component: () => import('@/app/area-secretaria/page'),
    preload: true,
    priority: 'high',
    dependencies: ['forms', 'calendar'],
  },
  {
    path: '/area-medica/atendimento',
    component: () => import('@/app/area-medica/atendimento/[id]/page'),
    preload: false,
    priority: 'medium',
    dependencies: ['forms', 'medical-records'],
  },
  {
    path: '/area-medica/cirurgias',
    component: () => import('@/app/area-medica/cirurgias/page'),
    preload: false,
    priority: 'low',
    dependencies: ['calendar', 'forms'],
  },
  {
    path: '/area-medica/relatorios',
    component: () => import('@/app/area-medica/relatorios/page'),
    preload: false,
    priority: 'medium',
    dependencies: ['charts', 'export'],
  },
]

// Componentes lazy otimizados
const LazyMedicalArea = createOptimizedLazy(
  () => import('@/app/area-medica/page'),
  'medical-area',
  { strategy: { preload: true, priority: 'high' } }
)

const LazySecretaryArea = createOptimizedLazy(
  () => import('@/app/area-secretaria/page'),
  'secretary-area',
  { strategy: { preload: true, priority: 'high' } }
)

const LazyConsultation = createOptimizedLazy(
  () => import('@/app/area-medica/atendimento/[id]/page'),
  'consultation',
  { strategy: { preload: false, priority: 'medium' } }
)

const LazySurgeries = createOptimizedLazy(
  () => import('@/app/area-medica/cirurgias/page'),
  'surgeries',
  { strategy: { preload: false, priority: 'low' } }
)

const LazyReports = createOptimizedLazy(
  () => import('@/app/area-medica/relatorios/page'),
  'reports',
  { strategy: { preload: false, priority: 'medium' } }
)

// Error Boundary para componentes lazy
class LazyErrorBoundary extends React.Component<
  { 
    children: React.ReactNode
    fallback?: ComponentType<{ error: Error; retry: () => void }>
    onError?: (error: Error) => void
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo)
    this.props.onError?.(error)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      return (
        <div className="p-4 border border-red-300 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-semibold mb-2">Erro ao carregar componente</h3>
          <p className="text-red-600 text-sm mb-3">{this.state.error.message}</p>
          <button
            onClick={this.retry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Componente para carregamento dinâmico de módulos
export const LazyModule = memo(<T extends Record<string, any> = Record<string, any>>({
  loader,
  fallback: CustomFallback,
  errorBoundary: ErrorBoundary,
  preload = false,
  props,
}: LazyModuleProps<T>) => {
  const LazyComponent = useMemo(() => {
    const chunkName = loader.toString().match(/import\(['"`](.+?)['"`]\)/)?.[1] || 'unknown'
    
    return createOptimizedLazy(
      loader,
      chunkName.replace(/[^a-zA-Z0-9]/g, '-'),
      {
        strategy: { 
          preload,
          priority: preload ? 'high' : 'medium'
        }
      }
    )
  }, [loader, preload])

  const FallbackComponent = CustomFallback || LoadingSpinner

  return (
    <LazyErrorBoundary fallback={ErrorBoundary}>
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    </LazyErrorBoundary>
  )
})

LazyModule.displayName = 'LazyModule'

// Roteador dinâmico com code splitting
export const DynamicRouter = memo<DynamicRouteProps>(({
  routes,
  fallback: DefaultFallback,
  onRouteChange,
}) => {
  const pathname = usePathname()
  const router = useRouter()

  // Encontrar rota correspondente
  const currentRoute = useMemo(() => {
    return routes.find(route => {
      if (route.path === pathname) return true
      
      // Suporte a rotas dinâmicas
      const routePattern = route.path.replace(/\[.*?\]/g, '[^/]+')
      const regex = new RegExp(`^${routePattern}$`)
      return regex.test(pathname)
    })
  }, [routes, pathname])

  // Preload de rotas relacionadas
  const preloadRelatedRoutes = useCallback(() => {
    if (!currentRoute?.dependencies) return

    const relatedRoutes = routes.filter(route =>
      currentRoute.dependencies?.some(dep =>
        route.path.includes(dep) || route.dependencies?.includes(dep)
      )
    )

    relatedRoutes.forEach(route => {
      if (route.preload) {
        // Preload da rota
        route.component().catch(console.warn)
      }
    })
  }, [currentRoute, routes])

  // Preload ao montar o componente
  React.useEffect(() => {
    preloadRelatedRoutes()
  }, [preloadRelatedRoutes])

  // Notificar mudança de rota
  React.useEffect(() => {
    onRouteChange?.(pathname)
  }, [pathname, onRouteChange])

  if (!currentRoute) {
    const FallbackComponent = DefaultFallback || (() => (
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Página não encontrada</h2>
        <p className="text-gray-600">A rota {pathname} não foi configurada.</p>
      </div>
    ))
    
    return <FallbackComponent />
  }

  return (
    <LazyModule
      loader={currentRoute.component}
      preload={currentRoute.preload}
      fallback={currentRoute.fallback || DefaultFallback}
    />
  )
})

DynamicRouter.displayName = 'DynamicRouter'

// Hook para gerenciamento de code splitting
export function useCodeSplitting() {
  const [loadedChunks, setLoadedChunks] = React.useState<Set<string>>(new Set())
  const [loadingChunks, setLoadingChunks] = React.useState<Set<string>>(new Set())
  const [failedChunks, setFailedChunks] = React.useState<Set<string>>(new Set())

  const loadChunk = useCallback(async (
    chunkName: string,
    loader: () => Promise<any>
  ) => {
    if (loadedChunks.has(chunkName) || loadingChunks.has(chunkName)) {
      return
    }

    setLoadingChunks(prev => new Set([...prev, chunkName]))

    try {
      await loader()
      setLoadedChunks(prev => new Set([...prev, chunkName]))
      setFailedChunks(prev => {
        const newSet = new Set(prev)
        newSet.delete(chunkName)
        return newSet
      })
    } catch (error) {
      setFailedChunks(prev => new Set([...prev, chunkName]))
      console.error(`Failed to load chunk ${chunkName}:`, error)
    } finally {
      setLoadingChunks(prev => {
        const newSet = new Set(prev)
        newSet.delete(chunkName)
        return newSet
      })
    }
  }, [loadedChunks, loadingChunks])

  const preloadChunks = useCallback(async (chunks: Array<{
    name: string
    loader: () => Promise<any>
  }>) => {
    const promises = chunks.map(chunk => loadChunk(chunk.name, chunk.loader))
    await Promise.allSettled(promises)
  }, [loadChunk])

  const retryFailedChunks = useCallback(async () => {
    const retryPromises = Array.from(failedChunks).map(async (chunkName) => {
      // Tentar recarregar chunks que falharam
      const route = routeConfigs.find(r => r.path.includes(chunkName))
      if (route) {
        await loadChunk(chunkName, route.component)
      }
    })

    await Promise.allSettled(retryPromises)
  }, [failedChunks, loadChunk])

  const getChunkStatus = useCallback((chunkName: string) => {
    if (loadedChunks.has(chunkName)) return 'loaded'
    if (loadingChunks.has(chunkName)) return 'loading'
    if (failedChunks.has(chunkName)) return 'failed'
    return 'pending'
  }, [loadedChunks, loadingChunks, failedChunks])

  return {
    loadChunk,
    preloadChunks,
    retryFailedChunks,
    getChunkStatus,
    loadedCount: loadedChunks.size,
    loadingCount: loadingChunks.size,
    failedCount: failedChunks.size,
  }
}

// Utilitários para code splitting
export const CodeSplittingUtils = {
  // Mapear componentes para chunks
  componentChunkMap: new Map([
    ['MedicalArea', LazyMedicalArea],
    ['SecretaryArea', LazySecretaryArea],
    ['Consultation', LazyConsultation],
    ['Surgeries', LazySurgeries],
    ['Reports', LazyReports],
  ]),

  // Obter componente lazy por nome
  getLazyComponent: (name: string) => {
    return CodeSplittingUtils.componentChunkMap.get(name)
  },

  // Preload baseado em rota
  preloadByRoute: (pathname: string) => {
    const route = routeConfigs.find(r => pathname.startsWith(r.path))
    if (route?.preload) {
      route.component().catch(console.warn)
    }
  },

  // Preload baseado em interação do usuário
  preloadOnHover: (componentName: string) => {
    const component = CodeSplittingUtils.getLazyComponent(componentName)
    if (component) {
      // Preload será feito automaticamente pelo createOptimizedLazy
      console.log(`Preloading ${componentName} on hover`)
    }
  },

  // Análise de performance de chunks
  analyzeChunkPerformance: () => {
    const performance = (window as any).performance
    if (!performance) return null

    const entries = performance.getEntriesByType('navigation')
    const resources = performance.getEntriesByType('resource')
    
    const chunkEntries = resources.filter((entry: any) => 
      entry.name.includes('chunks') && entry.name.endsWith('.js')
    )

    return chunkEntries.map((entry: any) => ({
      name: entry.name.split('/').pop(),
      loadTime: entry.responseEnd - entry.requestStart,
      size: entry.transferSize,
      cached: entry.transferSize === 0,
    }))
  },
}

// Componente de fallback otimizado
export const OptimizedFallback = memo<{ 
  message?: string
  showProgress?: boolean
}>(({ 
  message = 'Carregando...', 
  showProgress = false 
}) => {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    if (!showProgress) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 10
      })
    }, 100)

    return () => clearInterval(interval)
  }, [showProgress])

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <LoadingSpinner />
      <p className="mt-4 text-gray-600">{message}</p>
      {showProgress && (
        <div className="mt-2 w-48 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
})

OptimizedFallback.displayName = 'OptimizedFallback'