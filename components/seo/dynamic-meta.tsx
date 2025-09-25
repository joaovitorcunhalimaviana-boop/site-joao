'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import Head from 'next/head'

interface PageMeta {
  title: string
  description: string
  keywords: string
  canonical?: string
  ogImage?: string
}

const pageMetaData: Record<string, PageMeta> = {
  '/': {
    title: 'Dr. João Vítor Viana - Proctologista de João Pessoa/PB',
    description:
      'Dr. João Vítor Viana é proctologista de João Pessoa/PB. Especialista em hemorroidas, fístula anal, fissura anal e plicoma. Agende sua consulta.',
    keywords:
      'proctologista João Pessoa, médico hemorroidas, coloproctologista PB, fístula anal, fissura anal, plicoma',
  },
  '/hemorroidas': {
    title: 'Tratamento de Hemorroidas em João Pessoa - Dr. João Vítor Viana',
    description:
      'Tratamento especializado de hemorroidas em João Pessoa/PB. Dr. João Vítor Viana oferece técnicas modernas e minimamente invasivas.',
    keywords:
      'tratamento hemorroidas João Pessoa, médico hemorroidas PB, cirurgia hemorroidas, hemorroidas internas externas',
  },
  '/fistula-anal': {
    title: 'Tratamento de Fístula Anal em João Pessoa - Dr. João Vítor Viana',
    description:
      'Especialista em fístula anal em João Pessoa/PB. Dr. João Vítor Viana realiza cirurgias preservadoras do esfíncter com excelentes resultados.',
    keywords:
      'fístula anal João Pessoa, cirurgia fístula anal PB, médico fístula anal, tratamento fístula',
  },
  '/fissura-anal': {
    title: 'Tratamento de Fissura Anal em João Pessoa - Dr. João Vítor Viana',
    description:
      'Tratamento conservador e cirúrgico de fissura anal em João Pessoa/PB. Dr. João Vítor Viana oferece as melhores opções terapêuticas.',
    keywords:
      'fissura anal João Pessoa, tratamento fissura anal PB, médico fissura anal, esfincterotomia',
  },
  '/plicoma': {
    title: 'Tratamento de Plicoma em João Pessoa - Dr. João Vítor Viana',
    description:
      'Remoção de plicoma em João Pessoa/PB. Dr. João Vítor Viana realiza cirurgia de plicoma com técnica refinada e excelente resultado estético.',
    keywords:
      'plicoma João Pessoa, cirurgia plicoma PB, remoção plicoma, médico plicoma',
  },
  '/faq': {
    title:
      'Perguntas Frequentes - Dr. João Vítor Viana | Proctologista João Pessoa',
    description:
      'Tire suas dúvidas sobre hemorroidas, fístula anal, fissura anal e plicoma. Dr. João Vítor Viana responde as principais perguntas sobre proctologia em João Pessoa/PB.',
    keywords:
      'FAQ proctologia, dúvidas hemorroidas, perguntas fístula anal, fissura anal dúvidas, plicoma perguntas, proctologista João Pessoa FAQ',
  },
  '/agendamento': {
    title:
      'Agendar Consulta - Dr. João Vítor Viana | Proctologista João Pessoa',
    description:
      'Agende sua consulta com Dr. João Vítor Viana, proctologista em João Pessoa/PB. Atendimento humanizado e tecnologia de ponta.',
    keywords:
      'agendar consulta proctologista João Pessoa, consulta médica PB, agendamento online',
  },
  '/teleconsulta': {
    title: 'Teleconsulta Proctológica - Dr. João Vítor Viana | João Pessoa',
    description:
      'Teleconsulta com proctologista em João Pessoa/PB. Dr. João Vítor Viana oferece consultas online seguras e eficazes.',
    keywords:
      'teleconsulta proctologia, consulta online João Pessoa, telemedicina PB, consulta virtual',
  },
  '/avaliacoes': {
    title:
      'Avaliações de Pacientes - Dr. João Vítor Viana | Proctologista João Pessoa',
    description:
      'Veja as avaliações dos pacientes do Dr. João Vítor Viana, proctologista em João Pessoa/PB. Depoimentos reais de tratamentos bem-sucedidos.',
    keywords:
      'avaliações proctologista João Pessoa, depoimentos pacientes, reviews médico PB',
  },
}

export default function DynamicMeta() {
  const pathname = usePathname()
  const baseUrl = 'https://drjoaovitorviana.com.br'

  const meta = pageMetaData[pathname] || pageMetaData['/']
  const canonical = meta.canonical || `${baseUrl}${pathname}`
  const ogImage = meta.ogImage || `${baseUrl}/og-image.jpg`

  return (
    <Head>
      {/* Canonical URL */}
      <link rel='canonical' href={canonical} />

      {/* Additional Meta Tags */}
      <meta name='author' content='Dr. João Vítor Viana' />
      <meta
        name='robots'
        content='index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
      />
      <meta name='googlebot' content='index, follow' />

      {/* Geo Tags */}
      <meta name='geo.region' content='BR-PB' />
      <meta name='geo.placename' content='João Pessoa' />
      <meta name='geo.position' content='-7.1195;-34.8450' />
      <meta name='ICBM' content='-7.1195, -34.8450' />

      {/* Medical/Health Tags */}
      <meta name='medical.specialty' content='Proctologia' />
      <meta name='medical.location' content='João Pessoa, Paraíba, Brasil' />
      <meta name='health.professional' content='Dr. João Vítor Viana' />

      {/* Business Tags */}
      <meta name='business.hours' content='Mo-Fr 08:00-18:00' />
      <meta name='business.phone' content='+5583999999999' />
      <meta
        name='business.address'
        content='Rua das Trincheiras, 456, João Pessoa, PB'
      />

      {/* Social Media Optimization */}
      <meta property='og:locale' content='pt_BR' />
      <meta
        property='og:site_name'
        content='Dr. João Vítor Viana - Proctologista'
      />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:alt' content={meta.title} />

      {/* Twitter Additional */}
      <meta name='twitter:site' content='@drjoaovitorviana' />
      <meta name='twitter:creator' content='@drjoaovitorviana' />

      {/* App/PWA Tags */}
      <meta name='application-name' content='Dr. João Vítor Viana' />
      <meta name='apple-mobile-web-app-title' content='Dr. João Vítor Viana' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='default' />

      {/* Performance Hints */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        crossOrigin='anonymous'
      />
      <link rel='dns-prefetch' href='https://www.google-analytics.com' />

      {/* Structured Data for Current Page */}
      <Script
        id='dynamic-meta-schema'
        type='application/ld+json'
        strategy='beforeInteractive'
      >
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: meta.title,
          description: meta.description,
          url: canonical,
          inLanguage: 'pt-BR',
          isPartOf: {
            '@type': 'WebSite',
            name: 'Dr. João Vítor Viana - Proctologista',
            url: baseUrl,
          },
          about: {
            '@type': 'MedicalSpecialty',
            name: 'Proctologia',
          },
          provider: {
            '@type': 'Physician',
            name: 'Dr. João Vítor Viana',
            medicalSpecialty: 'Proctologia',
          },
        })}
      </Script>
    </Head>
  )
}
