'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Fallback component for errors
const ErrorFallback = () => null

// Dynamic imports with robust error handling
const GoogleAnalytics = dynamic(
  () => import('@/components/analytics/google-analytics').catch((error) => {
    console.warn('Failed to load GoogleAnalytics:', error)
    return { default: ErrorFallback }
  }),
  {
    ssr: false,
    loading: () => null,
  }
)

const PerformanceOptimizer = dynamic(
  () => import('@/components/performance/performance-optimizer').catch((error) => {
    console.warn('Failed to load PerformanceOptimizer:', error)
    return { default: ErrorFallback }
  }),
  {
    ssr: false,
    loading: () => null,
  }
)

export default function ClientAnalytics() {
  return (
    <>
      <Suspense fallback={null}>
        <GoogleAnalytics />
      </Suspense>
      <Suspense fallback={null}>
        <PerformanceOptimizer />
      </Suspense>
    </>
  )
}