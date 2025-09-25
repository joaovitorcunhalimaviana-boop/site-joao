import Script from 'next/script'

export default function LocalBusinessSchema() {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'Physician', 'LocalBusiness'],
    '@id': 'https://drjoaovitorviana.com.br/#localbusiness',
    name: 'Dr. João Vítor Viana - Proctologista João Pessoa',
    alternateName: [
      'Proctologista João Pessoa',
      'Médico Hemorróida João Pessoa',
      'Especialista Fístula Anal João Pessoa',
      'Cirurgião Proctológico João Pessoa',
    ],
    description:
      'Proctologista de João Pessoa/PB. Especialista em hemorroidas, fístula anal, fissura anal e plicoma. Atendimento humanizado com tecnologia de ponta.',
    url: 'https://drjoaovitorviana.com.br',
    telephone: '+5583999999999',
    email: 'contato@drjoaovitorviana.com.br',
    priceRange: '$$',
    currenciesAccepted: 'BRL',
    paymentAccepted: [
      'Dinheiro',
      'Cartão de Crédito',
      'Cartão de Débito',
      'PIX',
      'Planos de Saúde',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua das Trincheiras, 456',
      addressLocality: 'João Pessoa',
      addressRegion: 'PB',
      postalCode: '58040-000',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -7.1195,
      longitude: -34.845,
    },
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
    areaServed: [
      {
        '@type': 'City',
        name: 'João Pessoa',
        sameAs: 'https://pt.wikipedia.org/wiki/João_Pessoa',
      },
      {
        '@type': 'City',
        name: 'Campina Grande',
      },
      {
        '@type': 'City',
        name: 'Bayeux',
      },
      {
        '@type': 'City',
        name: 'Santa Rita',
      },
      {
        '@type': 'City',
        name: 'Cabedelo',
      },
      {
        '@type': 'State',
        name: 'Paraíba',
      },
    ],
    medicalSpecialty: ['Proctologia', 'Coloproctologia', 'Cirurgia Geral'],
    availableService: [
      {
        '@type': 'MedicalProcedure',
        name: 'Tratamento de Hemorroidas João Pessoa',
        description:
          'Tratamento completo de hemorroidas internas e externas com técnicas modernas',
        procedureType: 'Cirúrgico e Conservador',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Cirurgia de Fístula Anal João Pessoa',
        description:
          'Fistulotomia e fistulectomia para tratamento definitivo de fístulas anais',
        procedureType: 'Cirúrgico',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Tratamento de Fissura Anal João Pessoa',
        description:
          'Esfincterotomia lateral e tratamentos conservadores para fissuras anais',
        procedureType: 'Cirúrgico e Conservador',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Remoção de Plicoma João Pessoa',
        description:
          'Cirurgia para remoção de plicomas e excesso de pele perianal',
        procedureType: 'Cirúrgico',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Colonoscopia João Pessoa',
        description: 'Exame diagnóstico do intestino grosso',
        procedureType: 'Diagnóstico',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Anuscopia João Pessoa',
        description: 'Exame do canal anal e reto',
        procedureType: 'Diagnóstico',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços Proctológicos',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Consulta Proctológica',
            description: 'Consulta especializada em proctologia',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Cirurgia de Hemorroidas',
            description:
              'Procedimento cirúrgico para tratamento de hemorroidas',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Teleconsulta',
            description: 'Consulta médica online',
          },
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Maria Silva',
        },
        reviewBody:
          'Excelente profissional! Dr. João Vítor é muito atencioso e competente. Resolveu meu problema de hemorroidas com muito cuidado.',
      },
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'João Santos',
        },
        reviewBody:
          'Excelente proctologista de João Pessoa! Tratamento humanizado e resultados excelentes na cirurgia de fístula anal.',
      },
    ],
    sameAs: [
      'https://www.instagram.com/drjoaovitorviana',
      'https://www.facebook.com/drjoaovitorviana',
      'https://www.linkedin.com/in/drjoaovitorviana',
    ],
    knowsAbout: [
      'Hemorroidas',
      'Fístula Anal',
      'Fissura Anal',
      'Plicoma',
      'Constipação',
      'Doenças Anorretais',
      'Cirurgia Proctológica',
      'Colonoscopia',
      'Proctologia',
      'Coloproctologia',
    ],
    makesOffer: {
      '@type': 'Offer',
      name: 'Consulta Proctológica Especializada',
      description: 'Avaliação completa e tratamento de doenças proctológicas',
      seller: {
        '@type': 'Person',
        name: 'Dr. João Vítor Viana',
      },
    },
  }

  return (
    <Script
      id='local-business-schema'
      type='application/ld+json'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(localBusinessSchema),
      }}
    />
  )
}
