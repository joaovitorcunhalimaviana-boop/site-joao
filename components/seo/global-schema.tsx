'use client'

import Script from 'next/script'

export default function GlobalSchema() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'MedicalOrganization', 'MedicalClinic'],
    '@id': 'https://drjoaovitorviana.com.br/#organization',
    name: 'Dr. João Vítor Viana - Proctologista João Pessoa',
    alternateName: 'Clínica de Proctologia João Pessoa',
    description:
      'Proctologista de João Pessoa/PB. Dr. João Vítor Viana, especialista em hemorroidas, fístula anal, fissura anal e plicoma. Tratamentos modernos e cirurgias minimamente invasivas.',
    url: 'https://drjoaovitorviana.com.br',
    logo: {
      '@type': 'ImageObject',
      url: 'https://drjoaovitorviana.com.br/images/logo.png',
      width: 300,
      height: 100,
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://drjoaovitorviana.com.br/images/clinica.jpg',
      width: 1200,
      height: 630,
    },
    telephone: '+55-83-99999-9999',
    email: 'contato@drjoaovitorviana.com.br',
    medicalSpecialty: ['Proctology', 'Coloproctology', 'Gastroenterology'],
    availableService: [
      {
        '@type': 'MedicalProcedure',
        name: 'Tratamento de Hemorroidas',
        description: 'Tratamento completo de hemorroidas internas e externas',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Cirurgia de Fístula Anal',
        description:
          'Fistulotomia e fistulectomia para tratamento de fístulas anais',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Tratamento de Fissura Anal',
        description:
          'Esfincterotomia e tratamentos conservadores para fissuras',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Remoção de Plicoma',
        description: 'Cirurgia para remoção de plicomas e pele extra anal',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua das Trincheiras, 456',
      addressLocality: 'João Pessoa',
      addressRegion: 'Paraíba',
      postalCode: '58040-000',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-7.1195',
      longitude: '-34.8450',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'João Pessoa',
        containedInPlace: {
          '@type': 'State',
          name: 'Paraíba',
        },
      },
      {
        '@type': 'City',
        name: 'Campina Grande',
      },
      {
        '@type': 'State',
        name: 'Paraíba',
      },
    ],
    founder: {
      '@type': 'Person',
      name: 'Dr. João Vitor Viana',
      jobTitle: 'Proctologista',
      worksFor: {
        '@type': 'MedicalOrganization',
        name: 'Dr. João Vítor Viana - Proctologista João Pessoa',
      },
      sameAs: [
        'https://www.instagram.com/drjoaovitorviana',
        'https://www.facebook.com/drjoaovitorviana',
      ],
    },
    sameAs: [
      'https://www.instagram.com/drjoaovitorviana',
      'https://www.facebook.com/drjoaovitorviana',
      'https://www.linkedin.com/in/drjoaovitorviana',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+55-83-99999-9999',
        contactType: 'customer service',
        availableLanguage: 'Portuguese',
        areaServed: 'BR',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00',
        },
      },
      {
        '@type': 'ContactPoint',
        contactType: 'emergency',
        telephone: '+55-83-99999-9999',
        availableLanguage: 'Portuguese',
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '12:00',
      },
    ],
    paymentAccepted: ['Cash', 'Credit Card', 'Health Insurance'],
    currenciesAccepted: 'BRL',
    priceRange: '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços de Coloproctologia',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'MedicalService',
            name: 'Tratamento de Hemorroidas',
            description:
              'Tratamento clínico e cirúrgico especializado para hemorroidas',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'MedicalService',
            name: 'Tratamento de Fissura Anal',
            description:
              'Tratamento especializado para fissura anal com técnicas modernas',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'MedicalService',
            name: 'Colonoscopia',
            description: 'Exame endoscópico diagnóstico do intestino grosso',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'MedicalService',
            name: 'Consulta Coloproctológica',
            description: 'Consulta especializada em coloproctologia',
          },
        },
      ],
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://drjoaovitorviana.com.br/#website',
    name: 'Dr. João Vitor Viana - Coloproctologista em João Pessoa',
    description:
      'Site oficial do Dr. João Vitor Viana, coloproctologista em João Pessoa. Especialista em hemorroidas, fissura anal, constipação e doenças intestinais.',
    url: 'https://drjoaovitorviana.com.br',
    publisher: {
      '@id': 'https://drjoaovitorviana.com.br/#organization',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://drjoaovitorviana.com.br/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'pt-BR',
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      '@id': 'https://drjoaovitorviana.com.br/#organization',
    },
  }

  return (
    <>
      <Script
        id='organization-schema'
        type='application/ld+json'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id='website-schema'
        type='application/ld+json'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  )
}
