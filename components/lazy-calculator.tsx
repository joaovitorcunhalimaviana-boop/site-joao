'use client'

import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import ErrorBoundary from './error-boundary'

// Lazy load all calculator components
const BaronCalculator = lazy(() => import('./calculators/baron-calculator'))
const MayoCalculator = lazy(() => import('./calculators/mayo-calculator'))
const CDAICalculator = lazy(() => import('./calculators/cdai-calculator'))
const UCEISCalculator = lazy(() => import('./calculators/uceis-calculator'))
const BostonCalculator = lazy(() => import('./calculators/boston-calculator'))
const BristolCalculator = lazy(() => import('./calculators/bristol-calculator'))
const WexnerCalculator = lazy(() => import('./calculators/wexner-calculator'))
const StMarksCalculator = lazy(
  () => import('./calculators/st-marks-calculator')
)
const ConstipacaoCalculator = lazy(
  () => import('./calculators/constipacao-calculator')
)
const RomaIVCalculator = lazy(() => import('./calculators/roma-iv-calculator'))
const IBDQCalculator = lazy(() => import('./calculators/ibdq-calculator'))
const PACScoresCalculator = lazy(
  () => import('./calculators/pac-scores-calculator')
)
const JNETCalculator = lazy(() => import('./calculators/jnet-calculator'))
const KudoCalculator = lazy(() => import('./calculators/kudo-calculator'))
const ParisCalculator = lazy(() => import('./calculators/paris-calculator'))

// Loading skeleton component
const CalculatorSkeleton = () => (
  <Card className='w-full'>
    <CardHeader>
      <Skeleton className='h-6 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
    </CardHeader>
    <CardContent className='space-y-4'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
      <div className='flex gap-2'>
        <Skeleton className='h-10 flex-1' />
        <Skeleton className='h-10 flex-1' />
      </div>
    </CardContent>
  </Card>
)

interface LazyCalculatorProps {
  type: string
  onSaveResult?: (result: any) => void
  darkMode?: boolean
}

const LazyCalculator = ({
  type,
  onSaveResult,
  darkMode,
}: LazyCalculatorProps) => {
  const getCalculatorComponent = () => {
    switch (type) {
      case 'baron':
        return (
          <BaronCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'mayo':
        return (
          <MayoCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'cdai':
        return (
          <CDAICalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'uceis':
        return (
          <UCEISCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'boston':
        return (
          <BostonCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'bristol':
        return (
          <BristolCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'wexner':
        return (
          <WexnerCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'st-marks':
        return (
          <StMarksCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'constipacao':
        return (
          <ConstipacaoCalculator
            onSaveResult={onSaveResult}
            darkMode={darkMode}
          />
        )
      case 'roma-iv':
        return (
          <RomaIVCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'ibdq':
        return (
          <IBDQCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'pac-scores':
        return (
          <PACScoresCalculator
            onSaveResult={onSaveResult}
            darkMode={darkMode}
          />
        )
      case 'jnet':
        return (
          <JNETCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'kudo':
        return (
          <KudoCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      case 'paris':
        return (
          <ParisCalculator onSaveResult={onSaveResult} darkMode={darkMode} />
        )
      default:
        return <div>Calculadora não encontrada</div>
    }
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<CalculatorSkeleton />}>
        {getCalculatorComponent()}
      </Suspense>
    </ErrorBoundary>
  )
}

export default LazyCalculator
