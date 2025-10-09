'use client'

import React, { Suspense } from 'react'
import { LoadingSpinner } from '../ui/loading-optimized'

// Lazy loading para componentes pesados da área médica
export const LazyMedicalCalculators = React.lazy(() => 
  import('../ui/medical-calculators').then(module => ({ default: module.default }))
)

export const LazyPrescriptionForm = React.lazy(() => 
  import('../ui/prescription-form').then(module => ({ default: module.default }))
)

export const LazySpecialPrescriptionForm = React.lazy(() => 
  import('../ui/special-prescription-form').then(module => ({ default: module.default }))
)

export const LazyAntimicrobialPrescriptionForm = React.lazy(() => 
  import('../ui/antimicrobial-prescription-form').then(module => ({ default: module.default }))
)

export const LazyMedicalDeclarationForm = React.lazy(() => 
  import('../ui/medical-declaration-form').then(module => ({ default: module.default }))
)

export const LazyMedicalCertificateForm = React.lazy(() => 
  import('../ui/medical-certificate-form').then(module => ({ default: module.default }))
)

export const LazyMedicalImageUpload = React.lazy(() => 
  import('../ui/medical-image-upload').then(module => ({ default: module.default }))
)

export const LazyInteractiveCalendar = React.lazy(() => 
  import('../ui/interactive-calendar').then(module => ({ default: module.InteractiveCalendar }))
)

export const LazyReminderAdmin = React.lazy(() => 
  import('../ui/reminder-admin').then(module => ({ default: module.default }))
)

// Wrapper components com Suspense
export const MedicalCalculatorsLazy: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="lg" />}>
    <LazyMedicalCalculators {...props} />
  </Suspense>
)

export const PrescriptionFormLazy: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="md" />}>
    <LazyPrescriptionForm {...props} />
  </Suspense>
)

export const SpecialPrescriptionFormLazy: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="md" />}>
    <LazySpecialPrescriptionForm {...props} />
  </Suspense>
)

export const AntimicrobialPrescriptionFormLazy: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="md" />}>
    <LazyAntimicrobialPrescriptionForm {...props} />
  </Suspense>
)

export const MedicalDeclarationFormLazy: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="md" />}>
    <LazyMedicalDeclarationForm {...props} />
  </Suspense>
)

export const MedicalCertificateFormLazy: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="md" />}>
    <LazyMedicalCertificateForm {...props} />
  </Suspense>
)

export const MedicalImageUploadLazy: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="md" />}>
    <LazyMedicalImageUpload {...props} />
  </Suspense>
)

export const InteractiveCalendarLazy: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="lg" />}>
    <LazyInteractiveCalendar {...props} />
  </Suspense>
)

export const ReminderAdminLazy: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner size="lg" />}>
    <LazyReminderAdmin {...props} />
  </Suspense>
)

// Hook para preload de componentes
export const usePreloadComponents = () => {
  React.useEffect(() => {
    // Preload componentes críticos após 2 segundos
    const timer = setTimeout(() => {
      // Verificar se o método preload existe antes de chamar
      if ('preload' in LazyMedicalCalculators && typeof LazyMedicalCalculators.preload === 'function') {
        LazyMedicalCalculators.preload()
      }
      if ('preload' in LazyInteractiveCalendar && typeof LazyInteractiveCalendar.preload === 'function') {
        LazyInteractiveCalendar.preload()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])
}