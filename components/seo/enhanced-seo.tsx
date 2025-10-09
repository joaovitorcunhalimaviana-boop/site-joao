'use client'

import Script from 'next/script'
import Head from 'next/head'
import { BreadcrumbStructuredData } from './breadcrumbs'

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'profile'
  structuredData?: object
  breadcrumbs?: Array<{ label: string; href: string }>
  noIndex?: boolean
}

export default function EnhancedSEO({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage = '/og-image.jpg',
  ogType = 'website',
  structuredData,
  breadcrumbs,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title.includes('Dr. João Vítor Viana')
    ? title
    : `${title} | Dr. João Vítor Viana - Coloproctologista`

  const baseUrl = 'https://drjoaovitorviana.com.br'
  const fullCanonicalUrl = canonicalUrl
    ? `${baseUrl}${canonicalUrl}`
    : undefined
  const fullOgImage = ogImage.startsWith('http')
    ? ogImage
    : `${baseUrl}${ogImage}`

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name='description' content={description} />

        {keywords.length > 0 && (
          <meta name='keywords' content={keywords.join(', ')} />
        )}

        {fullCanonicalUrl && <link rel='canonical' href={fullCanonicalUrl} />}

        {noIndex && <meta name='robots' content='noindex, nofollow' />}

        {/* Open Graph */}
        <meta property='og:title' content={fullTitle} />
        <meta property='og:description' content={description} />
        <meta property='og:type' content={ogType} />
        <meta property='og:image' content={fullOgImage} />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
        <meta property='og:site_name' content='Dr. João Vítor Viana' />
        <meta property='og:locale' content='pt_BR' />

        {fullCanonicalUrl && (
          <meta property='og:url' content={fullCanonicalUrl} />
        )}

        {/* Twitter Card */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={fullTitle} />
        <meta name='twitter:description' content={description} />
        <meta name='twitter:image' content={fullOgImage} />

        {/* Medical specific meta tags */}
        <meta name='author' content='Dr. João Vítor Viana' />
        <meta name='geo.region' content='BR-PB' />
        <meta name='geo.placename' content='João Pessoa' />
        <meta name='geo.position' content='-7.1195;-34.8450' />
        <meta name='ICBM' content='-7.1195, -34.8450' />

        {/* Viewport and mobile optimization */}
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=5'
        />
        <meta name='format-detection' content='telephone=yes' />

        {/* Preconnect to external domains */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
      </Head>

      {/* Structured Data */}
      {structuredData && (
        <Script
          id='enhanced-seo-schema'
          type='application/ld+json'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      {/* Breadcrumb Structured Data */}
      {breadcrumbs && breadcrumbs.length > 1 && (
        <BreadcrumbStructuredData items={breadcrumbs} />
      )}
    </>
  )
}

// Hook para gerar structured data médico
interface MedicalStructuredDataProps {
  condition?: string
  treatment?: string
  doctor?: string
  description?: string
  symptoms?: string[]
  treatments?: string[]
}

export function useMedicalStructuredData({
  condition,
  treatment,
  doctor = 'Dr. João Vítor Viana',
  description,
  symptoms = [],
  treatments = [],
}: MedicalStructuredDataProps) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Dr. João Vítor Viana - Coloproctologista',
    description: 'Especialista em coloproctologia em João Pessoa/PB',
    url: 'https://drjoaovitorviana.com.br',
    telephone: '+5583999999999',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Exemplo, 123',
      addressLocality: 'João Pessoa',
      addressRegion: 'PB',
      postalCode: '58000-000',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -7.1195,
      longitude: -34.845,
    },
    openingHours: ['Mo-Fr 08:00-18:00'],
    priceRange: '$$',
    paymentAccepted: 'Cash, Credit Card, Health Insurance',
  }

  if (condition && treatment) {
    return {
      ...baseStructuredData,
      '@type': ['MedicalBusiness', 'MedicalClinic'],
      medicalSpecialty: 'Coloproctology',
      availableService: {
        '@type': 'MedicalTherapy',
        name: treatment,
        description: `Tratamento de ${condition} com ${treatment}`,
        provider: {
          '@type': 'Physician',
          name: doctor,
          medicalSpecialty: 'Coloproctology',
        },
      },
    }
  }

  return baseStructuredData
}
