'use client'

import Link from 'next/link'
import Script from 'next/script'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

const pathToLabel: Record<string, string> = {
  '/': 'Início',
  '/hemorroidas': 'Hemorroidas',
  '/fistula-anal': 'Fístula Anal',
  '/fissura-anal': 'Fissura Anal',
  '/plicoma': 'Plicoma',
  '/cisto-pilonidal': 'Cisto Pilonidal',
  '/cancer-colorretal': 'Câncer Colorretal',
  '/constipacao-intestinal': 'Constipação Intestinal',
  '/contato': 'Contato',
  '/agendamento': 'Agendamento',
  '/teleconsulta': 'Teleconsulta',
  '/visitas-domiciliares': 'Visitas Domiciliares',
  '/urgencias': 'Urgências',
  '/avaliacoes': 'Avaliações',
  '/especialidades': 'Especialidades',
  '/area-medica': 'Área Médica',
  '/area-secretaria': 'Área Secretaria',
}

export default function Breadcrumbs({
  items,
  className = '',
}: BreadcrumbsProps) {
  const pathname = usePathname()

  // Se items não foi fornecido, gerar automaticamente baseado na URL
  const breadcrumbItems = items || generateBreadcrumbs(pathname)

  if (breadcrumbItems.length <= 1) {
    return null // Não mostrar breadcrumbs na página inicial
  }

  return (
    <nav
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label='Breadcrumb'
    >
      <ol className='flex items-center space-x-2'>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1

          return (
            <li key={item.href} className='flex items-center'>
              {index === 0 && (
                <HomeIcon className='w-4 h-4 text-gray-400 mr-2' />
              )}

              {isLast ? (
                <span className='text-blue-400 font-medium' aria-current='page'>
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className='text-gray-300 hover:text-white transition-colors duration-200'
                  >
                    {item.label}
                  </Link>
                  <ChevronRightIcon className='w-4 h-4 text-gray-500 mx-2' />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Início', href: '/' }]

  let currentPath = ''

  paths.forEach(path => {
    currentPath += `/${path}`
    const label = pathToLabel[currentPath] || formatPathLabel(path)
    breadcrumbs.push({
      label,
      href: currentPath,
    })
  })

  return breadcrumbs
}

function formatPathLabel(path: string): string {
  return path
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Componente para structured data de breadcrumbs
export function BreadcrumbStructuredData({
  items,
}: {
  items: BreadcrumbItem[]
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://drjoaovitorviana.com.br${item.href}`,
    })),
  }

  return (
    <Script
      id='breadcrumb-schema'
      type='application/ld+json'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
