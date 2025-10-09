import { Metadata } from 'next'

// Configuração base de SEO
export const BASE_SEO_CONFIG = {
  siteName: 'Dr. João Vítor Viana - Coloproctologista em João Pessoa/PB',
  siteUrl:
    process.env['NEXT_PUBLIC_SITE_URL'] || 'https://drjoaovitorviana.com.br',
  description:
    'Dr. João Vítor Viana, especialista em coloproctologia em João Pessoa/PB. Tratamento de hemorroidas, fissuras anais, fístulas e outras condições. Agende sua consulta.',
  keywords: [
    'coloproctologista joão pessoa',
    'dr joão vítor viana',
    'proctologista paraíba',
    'hemorroidas joão pessoa',
    'fissura anal tratamento',
    'fístula anal cirurgia',
    'colonoscopia joão pessoa',
    'câncer colorretal prevenção',
    'constipação intestinal',
    'doença inflamatória intestinal',
    'cirurgia colorretal',
    'consulta proctologia',
    'especialista intestino',
    'médico coloproctologista pb',
  ],
  author: 'Dr. João Vítor Viana',
  locale: 'pt_BR',
}

// Metadata padrão para todas as páginas
export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_SEO_CONFIG.siteUrl),
  title: {
    default: BASE_SEO_CONFIG.siteName,
    template: `%s | ${BASE_SEO_CONFIG.siteName}`,
  },
  description: BASE_SEO_CONFIG.description,
  keywords: BASE_SEO_CONFIG.keywords,
  authors: [{ name: BASE_SEO_CONFIG.author }],
  creator: BASE_SEO_CONFIG.author,
  publisher: BASE_SEO_CONFIG.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: BASE_SEO_CONFIG.locale,
    url: BASE_SEO_CONFIG.siteUrl,
    siteName: BASE_SEO_CONFIG.siteName,
    title: BASE_SEO_CONFIG.siteName,
    description: BASE_SEO_CONFIG.description,
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: BASE_SEO_CONFIG.siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: BASE_SEO_CONFIG.siteName,
    description: BASE_SEO_CONFIG.description,
    images: ['/images/twitter-image.jpg'],
    creator: '@drjoaovitorviana',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env['GOOGLE_SITE_VERIFICATION'],
  },
}

// Função para gerar metadata específica de página
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  path = '',
  image,
  noIndex = false,
  type = 'website',
}: {
  title: string
  description: string
  keywords?: string[]
  path?: string
  image?: string
  noIndex?: boolean
  type?: 'website' | 'article'
}): Metadata {
  const url = `${BASE_SEO_CONFIG.siteUrl}${path}`
  const combinedKeywords = [...BASE_SEO_CONFIG.keywords, ...keywords]

  return {
    title,
    description,
    keywords: combinedKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: BASE_SEO_CONFIG.siteName,
      locale: BASE_SEO_CONFIG.locale,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  }
}

// JSON-LD Structured Data para médico
export function generateDoctorStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: 'Dr. João Vitor Viana',
    jobTitle: 'Coloproctologista',
    description:
      'Especialista em Coloproctologia com foco no tratamento de doenças do intestino grosso, reto e ânus.',
    url: BASE_SEO_CONFIG.siteUrl,
    image: `${BASE_SEO_CONFIG.siteUrl}/images/dr-joao-vitor.jpg`,
    telephone: '+55-11-99999-9999',
    email: 'contato@drjoaovitorviana.com.br',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Exemplo, 123',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      postalCode: '01234-567',
      addressCountry: 'BR',
    },
    medicalSpecialty: ['Coloproctology', 'Colorectal Surgery', 'Proctology'],
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Faculdade de Medicina',
    },
    memberOf: {
      '@type': 'MedicalOrganization',
      name: 'Sociedade Brasileira de Coloproctologia',
    },
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Medical License',
        recognizedBy: {
          '@type': 'Organization',
          name: 'Conselho Regional de Medicina',
        },
      },
    ],
  }
}

// JSON-LD para organização médica
export function generateMedicalOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Consultório Dr. João Vitor Viana',
    description: 'Consultório especializado em Coloproctologia',
    url: BASE_SEO_CONFIG.siteUrl,
    logo: `${BASE_SEO_CONFIG.siteUrl}/images/logo.png`,
    image: `${BASE_SEO_CONFIG.siteUrl}/images/consultorio.jpg`,
    telephone: '+55-11-99999-9999',
    email: 'contato@drjoaovitorviana.com.br',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Exemplo, 123',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      postalCode: '01234-567',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-23.5505',
      longitude: '-46.6333',
    },
    openingHours: ['Mo-Fr 08:00-18:00', 'Sa 08:00-12:00'],
    priceRange: '$$',
    paymentAccepted: ['Cash', 'Credit Card', 'Health Insurance'],
    medicalSpecialty: ['Coloproctology', 'Colorectal Surgery'],
  }
}

// JSON-LD para website médico
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BASE_SEO_CONFIG.siteName,
    description: BASE_SEO_CONFIG.description,
    url: BASE_SEO_CONFIG.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_SEO_CONFIG.siteUrl}/busca?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Person',
      name: BASE_SEO_CONFIG.author,
      jobTitle: 'Coloproctologista',
    },
    inLanguage: 'pt-BR',
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      '@type': 'Person',
      name: BASE_SEO_CONFIG.author,
    },
  }
}

// JSON-LD para artigos médicos
export function generateMedicalArticleStructuredData({
  title,
  description,
  datePublished,
  dateModified,
  path,
  image,
}: {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  path: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: title,
    description,
    url: `${BASE_SEO_CONFIG.siteUrl}${path}`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: BASE_SEO_CONFIG.author,
      jobTitle: 'Coloproctologista',
      url: BASE_SEO_CONFIG.siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: BASE_SEO_CONFIG.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_SEO_CONFIG.siteUrl}/images/logo.png`,
      },
    },
    mainEntity: {
      '@type': 'MedicalCondition',
      name: title,
      description,
    },
    image: image
      ? {
          '@type': 'ImageObject',
          url: image,
          width: 1200,
          height: 630,
        }
      : undefined,
    inLanguage: 'pt-BR',
    isPartOf: {
      '@type': 'WebSite',
      name: BASE_SEO_CONFIG.siteName,
      url: BASE_SEO_CONFIG.siteUrl,
    },
    medicalAudience: {
      '@type': 'Patient',
    },
    about: {
      '@type': 'MedicalSpecialty',
      name: 'Coloproctology',
    },
  }
}

// Função para combinar múltiplos structured data
export function combineStructuredData(...structuredDataObjects: any[]) {
  return structuredDataObjects.filter(Boolean)
}
