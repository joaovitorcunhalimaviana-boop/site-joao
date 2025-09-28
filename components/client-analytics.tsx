'use client'

import dynamic from 'next/dynamic'

// Importação dinâmica para evitar ChunkLoadError
const GoogleAnalytics = dynamic(
  () => import('@/components/analytics/google-analytics'),
  { 
    ssr: false,
    loading: () => null
  }
)

const PerformanceOptimizer = dynamic(
  () => import('@/components/performance/performance-optimizer'),
  { 
    ssr: false,
    loading: () => null
  }
)

export default function ClientAnalytics() {
  return (
    <>
      <GoogleAnalytics />
      <PerformanceOptimizer />
    </>
  )
}