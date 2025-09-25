'use client'

import dynamic from 'next/dynamic'

// Client-side dynamic imports for analytics and performance components with error handling
export const GoogleAnalytics = dynamic(
  () => import('@/components/analytics/google-analytics').catch((error) => {
    console.warn('Failed to load GoogleAnalytics component:', error)
    // Return a fallback component
    return { default: () => null }
  }),
  {
    ssr: false,
    loading: () => null,
  }
)

export const PerformanceOptimizer = dynamic(
  () => import('@/components/performance/performance-optimizer').catch((error) => {
    console.warn('Failed to load PerformanceOptimizer component:', error)
    // Return a fallback component
    return { default: () => null }
  }),
  {
    ssr: false,
    loading: () => null,
  }
)