import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import GlobalSchema from '../components/seo/global-schema'
import LocalBusinessSchema from '../components/seo/local-business-schema'
import FAQSchema from '../components/seo/faq-schema'
import BreadcrumbSchema from '@/components/seo/breadcrumb-schema'
import LocalSEOSchema from '@/components/seo/local-seo-schema'
import BirthdayInitializer from '@/components/birthday-initializer'
import ErrorBoundary from '@/components/error-boundary'
import { defaultMetadata } from '@/lib/seo-metadata'
import {
  generateDoctorStructuredData,
  generateMedicalOrganizationStructuredData,
  generateWebsiteStructuredData,
} from '@/lib/seo-metadata'
import ClientAnalytics from '@/components/client-analytics'
import { DataProtectionProvider } from '../components/DataProtectionProvider'
// import WebVitals from '@/components/performance/web-vitals'

const inter = Inter({ subsets: ['latin'] })

// Usar metadata centralizada com customizações específicas
export const metadata: Metadata = {
  ...defaultMetadata,
  title: {
    default: 'Dr. João Vítor Viana - Coloproctologista em João Pessoa',
    template: '%s | Dr. João Vítor Viana - Coloproctologista',
  },
  description:
    'Dr. João Vítor Viana - Proctologista e Coloproctologista em João Pessoa/PB. Especialista em hemorroidas, fissura anal, fístula, plicoma, constipação intestinal. Agendamento online, teleconsulta e visitas domiciliares. Atendimento particular e convênios.',
  keywords: [
    'proctologista João Pessoa',
    'coloproctologista João Pessoa',
    'médico hemorróida João Pessoa',
    'médico fissura anal João Pessoa',
    'médico fístula João Pessoa',
    'médico plicoma João Pessoa',
    'médico constipação intestinal João Pessoa',
    'cirurgião colorretal João Pessoa',
    'especialista intestino João Pessoa',
    'colonoscopia João Pessoa',
    'retossigmoidoscopia João Pessoa',
    'hemorroidas tratamento João Pessoa',
    'fissura anal tratamento João Pessoa',
    'constipação tratamento João Pessoa',
    'doença de Crohn João Pessoa',
    'colite ulcerativa João Pessoa',
    'síndrome intestino irritável João Pessoa',
    'câncer colorretal João Pessoa',
    'pólipos intestinais João Pessoa',
    'agendamento proctologista João Pessoa',
    'teleconsulta proctologia',
    'visita domiciliar proctologista',
    'urgência proctológica João Pessoa',
    'Dr João Vítor Viana',
    'Paraíba PB',
    'Nordeste Brasil',
  ],
  openGraph: {
    ...defaultMetadata.openGraph,
    title:
      'Dr. João Vítor Viana - Proctologista e Coloproctologista em João Pessoa/PB',
    description:
      'Proctologista em João Pessoa. Especialista em hemorroidas, fissura anal, fístula, plicoma e constipação intestinal. Agendamento online, teleconsulta e visitas domiciliares.',
    siteName: 'Dr. João Vítor Viana',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dr. João Vítor Viana - Coloproctologista',
      },
    ],
  },
  twitter: {
    ...defaultMetadata.twitter,
    title: 'Dr. João Vítor Viana - Proctologista João Pessoa',
    description:
      'Proctologista especialista em hemorroidas, fissura anal, fístula e plicoma em João Pessoa/PB. Agendamento online e teleconsulta disponível.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='pt-BR' suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body
        className={cn(
          inter.className,
          'min-h-screen bg-background font-sans antialiased'
        )}
      >
        <ClientAnalytics />
        <ErrorBoundary>
          <DataProtectionProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              <BirthdayInitializer />
              <GlobalSchema />
              <LocalBusinessSchema />
              <LocalSEOSchema />
              <FAQSchema />
              <BreadcrumbSchema />
              {/* <WebVitals /> */}
              <main id='main-content'>{children}</main>
              <Toaster />
            </ThemeProvider>
          </DataProtectionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
