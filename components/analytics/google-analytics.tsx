'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

interface GoogleAnalyticsProps {
  measurementId?: string
}

export default function GoogleAnalytics({
  measurementId,
}: GoogleAnalyticsProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const GA_MEASUREMENT_ID =
    measurementId || process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID']

  useEffect(() => {
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && !isLoaded && !hasError) {
      try {
        // Configurar dataLayer
        window.dataLayer = window.dataLayer || []

        // Função gtag
        function gtag(...args: any[]) {
          window.dataLayer.push(args)
        }

        // Configuração inicial
        gtag('js', new Date())
        gtag('config', GA_MEASUREMENT_ID, {
          page_title: document.title,
          page_location: window.location.href,
          // Configurações de privacidade
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
        })

        // Eventos personalizados para site médico
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          content_group1: 'Medical Website',
          content_group2: 'Coloproctology',
        })

        // Disponibilizar gtag globalmente
        ;(window as any).gtag = gtag
        setIsLoaded(true)
      } catch (error) {
        console.warn('Error initializing Google Analytics:', error)
        setHasError(true)
      }
    }
  }, [GA_MEASUREMENT_ID, isLoaded, hasError])

  if (!GA_MEASUREMENT_ID || hasError) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy='lazyOnload'
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          console.warn('Google Analytics failed to load:', e)
        }}
      />
      <Script
        id='google-analytics'
        strategy='lazyOnload'
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
            });
          `,
        }}
      />
    </>
  )
}

// Hook para tracking de eventos
export function useGoogleAnalytics() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', eventName, {
        event_category: 'Medical Website',
        event_label: parameters?.['label'] || '',
        value: parameters?.['value'] || 0,
        ...parameters,
      })
    }
  }

  const trackPageView = (url: string, title?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag(
        'config',
        process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'],
        {
          page_path: url,
          page_title: title || document.title,
        }
      )
    }
  }

  const trackAppointmentRequest = (specialty?: string) => {
    trackEvent('appointment_request', {
      event_category: 'Engagement',
      event_label: specialty || 'General',
      specialty: specialty,
    })
  }

  const trackCalculatorUse = (calculatorType: string) => {
    trackEvent('calculator_use', {
      event_category: 'Tools',
      event_label: calculatorType,
      calculator_type: calculatorType,
    })
  }

  const trackContactForm = (formType: string) => {
    trackEvent('contact_form_submit', {
      event_category: 'Lead Generation',
      event_label: formType,
      form_type: formType,
    })
  }

  const trackNewsletterSignup = () => {
    trackEvent('newsletter_signup', {
      event_category: 'Engagement',
      event_label: 'Newsletter',
    })
  }

  const trackPhoneClick = () => {
    trackEvent('phone_click', {
      event_category: 'Contact',
      event_label: 'Phone Number',
    })
  }

  const trackWhatsAppClick = () => {
    trackEvent('whatsapp_click', {
      event_category: 'Contact',
      event_label: 'WhatsApp',
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackAppointmentRequest,
    trackCalculatorUse,
    trackContactForm,
    trackNewsletterSignup,
    trackPhoneClick,
    trackWhatsAppClick,
  }
}

// Declaração de tipos para TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
