import Script from 'next/script'

export default function LocalSEOSchema() {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'Physician', 'LocalBusiness'],
    name: 'Dr. João Vítor Viana - Proctologista',
    alternateName: [
      'Proctologista de João Pessoa',
      'Dr. João Vítor Viana Coloproctologista',
      'Proctologista João Pessoa PB',
    ],
    description:
      'Dr. João Vítor Viana é proctologista de João Pessoa/PB, especialista em hemorroidas, fístula anal, fissura anal e plicoma. Atendimento humanizado com mais de 10 anos de experiência.',
    url: 'https://drjoaovitorviana.com.br',
    logo: 'https://drjoaovitorviana.com.br/logo.svg',
    image: [
      'https://drjoaovitorviana.com.br/dr-joao-vitor-viana.jpg',
      'https://drjoaovitorviana.com.br/consultorio-joao-pessoa.jpg',
      'https://drjoaovitorviana.com.br/equipamentos-modernos.jpg',
    ],

    // Informações de Contato
    telephone: '+5583999999999',
    email: 'contato@drjoaovitorviana.com.br',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+5583999999999',
        contactType: 'customer service',
        availableLanguage: 'Portuguese',
        areaServed: ['João Pessoa', 'Paraíba', 'Nordeste', 'Brasil'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00',
        },
      },
      {
        '@type': 'ContactPoint',
        telephone: '+5583999999999',
        contactType: 'emergency',
        availableLanguage: 'Portuguese',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '00:00',
          closes: '23:59',
        },
      },
    ],

    // Endereço Detalhado
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua das Trincheiras, 456',
      addressLocality: 'João Pessoa',
      addressRegion: 'PB',
      postalCode: '58000-000',
      addressCountry: 'BR',
    },

    // Coordenadas Geográficas
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -7.1195,
      longitude: -34.845,
    },

    // Área de Atendimento
    areaServed: [
      {
        '@type': 'City',
        name: 'João Pessoa',
        containedInPlace: {
          '@type': 'State',
          name: 'Paraíba',
          containedInPlace: {
            '@type': 'Country',
            name: 'Brasil',
          },
        },
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
    ],

    // Horário de Funcionamento
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

    // Especialidades Médicas
    medicalSpecialty: ['Proctologia', 'Coloproctologia', 'Cirurgia Geral'],

    // Serviços Disponíveis
    availableService: [
      {
        '@type': 'MedicalProcedure',
        name: 'Tratamento de Hemorroidas',
        description:
          'Tratamento conservador e cirúrgico de hemorroidas internas e externas',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Cirurgia de Fístula Anal',
        description:
          'Fistulotomia e fistulectomia com preservação do esfíncter',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Tratamento de Fissura Anal',
        description: 'Tratamento conservador e esfincterotomia lateral',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Remoção de Plicoma',
        description: 'Cirurgia estética para remoção de excesso de pele anal',
      },
      {
        '@type': 'MedicalService',
        name: 'Teleconsulta',
        description: 'Consultas médicas online seguras e eficazes',
      },
      {
        '@type': 'MedicalService',
        name: 'Visitas Domiciliares',
        description: 'Atendimento médico no conforto de sua casa',
      },
    ],

    // Informações do Médico
    founder: {
      '@type': 'Physician',
      name: 'Dr. João Vítor Viana',
      givenName: 'João Vítor',
      familyName: 'Viana',
      honorificPrefix: 'Dr.',
      medicalSpecialty: 'Proctologia',
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: 'Universidade Federal da Paraíba',
      },
      memberOf: [
        {
          '@type': 'Organization',
          name: 'Sociedade Brasileira de Coloproctologia',
        },
        {
          '@type': 'Organization',
          name: 'Conselho Regional de Medicina da Paraíba',
        },
      ],
      yearsOfExperience: 10,
    },

    // Avaliações e Reviews
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '127',
      reviewCount: '89',
    },

    // Redes Sociais
    sameAs: [
      'https://www.facebook.com/drjoaovitorviana',
      'https://www.instagram.com/drjoaovitorviana',
      'https://www.linkedin.com/in/drjoaovitorviana',
      'https://www.youtube.com/drjoaovitorviana',
    ],

    // Formas de Pagamento
    paymentAccepted: [
      'Cash',
      'Credit Card',
      'Debit Card',
      'PIX',
      'Health Insurance',
    ],

    // Faixa de Preço
    priceRange: '$$',

    // Certificações
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Medical License',
        recognizedBy: {
          '@type': 'Organization',
          name: 'Conselho Regional de Medicina da Paraíba',
        },
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Medical Specialty',
        recognizedBy: {
          '@type': 'Organization',
          name: 'Sociedade Brasileira de Coloproctologia',
        },
      },
    ],

    // Idiomas
    knowsLanguage: [
      {
        '@type': 'Language',
        name: 'Portuguese',
        alternateName: 'pt-BR',
      },
      {
        '@type': 'Language',
        name: 'English',
        alternateName: 'en',
      },
    ],
  }

  return (
    <Script
      id='local-seo-schema'
      type='application/ld+json'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(localBusinessSchema),
      }}
    />
  )
}
