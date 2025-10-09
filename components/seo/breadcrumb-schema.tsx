'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

interface BreadcrumbItem {
  name: string
  url: string
}

const pathMap: Record<string, string> = {
  '/': 'Início',
  '/especialidades': 'Especialidades',
  '/agendamento': 'Agendamento',
  '/teleconsulta': 'Teleconsulta',
  '/hemorroidas': 'Tratamento de Hemorroidas',
  '/fistula-anal': 'Tratamento de Fístula Anal',
  '/fissura-anal': 'Tratamento de Fissura Anal',
  '/plicoma': 'Tratamento de Plicoma',
  '/faq': 'Perguntas Frequentes',
  '/avaliacoes': 'Avaliações de Pacientes',
  '/contato': 'Contato',
  '/urgencias': 'Urgências Proctológicas',
  '/visitas-domiciliares': 'Visitas Domiciliares',
}

export default function BreadcrumbSchema() {
  const pathname = usePathname()
  const baseUrl = 'https://drjoaovitorviana.com.br'

  // Gerar breadcrumbs baseado no caminho atual
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        name: 'Dr. João Vítor Viana - Proctologista João Pessoa',
        url: baseUrl,
      },
    ]

    if (pathname !== '/') {
      const pathName =
        pathMap[pathname] || pathname.replace('/', '').replace('-', ' ')
      breadcrumbs.push({
        name: pathName,
        url: `${baseUrl}${pathname}`,
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Não mostrar breadcrumb se for apenas a home
  if (breadcrumbs.length <= 1) {
    return null
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <>
      {/* Schema Markup */}
      <Script
        id='breadcrumb-schema'
        type='application/ld+json'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  )
}
