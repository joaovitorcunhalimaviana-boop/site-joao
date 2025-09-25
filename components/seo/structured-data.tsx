'use client'

import Script from 'next/script'

interface StructuredDataProps {
  type:
    | 'doctor'
    | 'medicalBusiness'
    | 'article'
    | 'faq'
    | 'medicalWebPage'
    | 'breadcrumb'
    | 'medicalCondition'
    | 'medicalSpecialty'
    | 'medicalProcedure'
  data?: any
}

interface MedicalCalculatorProps {
  name: string
  description: string
  url: string
  medicalCondition?: string
  purpose?: string
}

export function MedicalCalculatorSchema({
  name,
  description,
  url,
  medicalCondition,
  purpose,
}: MedicalCalculatorProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    about: medicalCondition
      ? {
          '@type': 'MedicalCondition',
          name: medicalCondition,
        }
      : undefined,
    featureList: [
      'Cálculo automático',
      'Interface intuitiva',
      'Resultados instantâneos',
      'Baseado em evidências científicas',
    ],
    isAccessibleForFree: true,
    inLanguage: 'pt-BR',
  }

  return (
    <Script
      id={`medical-calculator-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type='application/ld+json'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'doctor':
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': 'https://drjoaovitorviana.com.br/#doctor',
          name: 'Dr. João Vitor Viana',
          jobTitle: 'Coloproctologista',
          description:
            'Médico especialista em coloproctologia, com foco em hemorroidas, fissura anal, constipação e doenças intestinais.',
          url: 'https://drjoaovitorviana.com.br',
          image:
            'https://drjoaovitorviana.com.br/images/dr-joao-vitor-viana.jpg',
          telephone: '+55-61-99999-9999',
          email: 'contato@drjoaovitorviana.com.br',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'SGAS 915, Lote 69/70',
            addressLocality: 'Brasília',
            addressRegion: 'DF',
            postalCode: '70390-150',
            addressCountry: 'BR',
          },
          worksFor: {
            '@type': 'MedicalOrganization',
            name: 'Clínica Dr. João Vitor Viana',
            url: 'https://drjoaovitorviana.com.br',
          },
          hasCredential: {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'Medical Degree',
            recognizedBy: {
              '@type': 'Organization',
              name: 'Conselho Federal de Medicina',
            },
          },
          knowsAbout: [
            'Coloproctologia',
            'Hemorroidas',
            'Fissura Anal',
            'Constipação Intestinal',
            'Síndrome do Intestino Irritável',
            'Doença de Crohn',
            'Retocolite Ulcerativa',
            'Colonoscopia',
            'Cirurgia Colorretal',
          ],
          medicalSpecialty: [
            {
              '@type': 'MedicalSpecialty',
              name: 'Coloproctologia',
              description:
                'Especialidade médica que trata doenças do intestino grosso, reto e ânus',
            },
            'Hemorroidas',
            'Fissura Anal',
            'Constipação',
            'Colonoscopia',
            'Doença de Crohn',
            'Colite Ulcerativa',
            'Cirurgia Colorretal',
          ],
          sameAs: [
            'https://www.instagram.com/drjoaovitorviana',
            'https://www.facebook.com/drjoaovitorviana',
            'https://www.linkedin.com/in/drjoaovitorviana',
          ],
        }

      case 'medicalSpecialty':
        return {
          '@context': 'https://schema.org',
          '@type': 'MedicalSpecialty',
          name: data?.name || 'Coloproctologia',
          description:
            data?.description ||
            'Especialidade médica focada no diagnóstico e tratamento de doenças do intestino grosso, reto e ânus',
          associatedAnatomy: {
            '@type': 'AnatomicalStructure',
            name: 'Sistema Digestivo Baixo',
          },
          relevantSpecialty: [
            'Gastroenterologia',
            'Cirurgia Geral',
            'Oncologia',
          ],
        }

      case 'medicalCondition':
        return {
          '@context': 'https://schema.org',
          '@type': 'MedicalCondition',
          name: data?.name || 'Hemorroidas',
          description:
            data?.description ||
            'Condição médica caracterizada por veias dilatadas na região anal',
          code: {
            '@type': 'MedicalCode',
            codeValue: data?.codeValue || 'K64',
            codingSystem: 'ICD-10',
          },
          possibleTreatment: {
            '@type': 'MedicalTherapy',
            name: data?.treatment || 'Tratamento Clínico e Cirúrgico',
          },
          riskFactor: data?.riskFactors || [
            'Constipação crônica',
            'Gravidez',
            'Obesidade',
            'Sedentarismo',
          ],
          typicalTest: {
            '@type': 'MedicalTest',
            name: 'Exame Proctológico',
          },
        }

      case 'medicalProcedure':
        return {
          '@context': 'https://schema.org',
          '@type': 'MedicalProcedure',
          name: data?.name || 'Colonoscopia',
          description:
            data?.description ||
            'Exame endoscópico para visualização do intestino grosso',
          procedureType: {
            '@type': 'MedicalProcedureType',
            name: 'Procedimento Diagnóstico',
          },
          bodyLocation: {
            '@type': 'AnatomicalStructure',
            name: 'Intestino Grosso',
          },
          preparation: data?.preparation || [
            'Jejum de 12 horas',
            'Preparo intestinal com laxantes',
            'Suspensão de medicamentos específicos',
          ],
          howPerformed:
            data?.howPerformed ||
            'Inserção de endoscópio flexível através do ânus para visualização completa do cólon',
          followup: 'Acompanhamento médico conforme achados do exame',
        }

      case 'medicalBusiness':
        return {
          '@context': 'https://schema.org',
          '@type': 'MedicalBusiness',
          '@id': 'https://drjoaovitorviana.com.br/#business',
          name: 'Clínica Dr. João Vitor Viana',
          description:
            'Clínica especializada em coloproctologia com atendimento personalizado e tecnologia de ponta.',
          url: 'https://drjoaovitorviana.com.br',
          logo: 'https://drjoaovitorviana.com.br/images/logo.png',
          image: 'https://drjoaovitorviana.com.br/images/clinica.jpg',
          telephone: '+55-61-99999-9999',
          email: 'contato@drjoaovitorviana.com.br',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'SGAS 915, Lote 69/70',
            addressLocality: 'Brasília',
            addressRegion: 'DF',
            postalCode: '70390-150',
            addressCountry: 'BR',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: '-15.8267',
            longitude: '-47.9218',
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
              ],
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
          priceRange: '$$',
          paymentAccepted: [
            'Cash',
            'PIX',
            'Credit Card',
            'Debit Card',
            'Health Insurance',
          ],
          currenciesAccepted: 'BRL',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Serviços Médicos',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'MedicalProcedure',
                  name: 'Consulta Coloproctológica',
                  description: 'Consulta especializada em coloproctologia',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'MedicalProcedure',
                  name: 'Colonoscopia',
                  description: 'Exame endoscópico do intestino grosso',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'MedicalProcedure',
                  name: 'Tratamento de Hemorroidas',
                  description: 'Tratamento clínico e cirúrgico de hemorroidas',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'MedicalService',
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
        }

      case 'faq':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data || [
            {
              '@type': 'Question',
              name: 'Como agendar uma consulta?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Você pode agendar uma consulta através do nosso sistema online, WhatsApp ou telefone. Oferecemos horários flexíveis de segunda a sábado.',
              },
            },
            {
              '@type': 'Question',
              name: 'Quais convênios são aceitos?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Aceitamos os principais convênios médicos. Entre em contato para verificar se seu plano está na nossa rede credenciada.',
              },
            },
            {
              '@type': 'Question',
              name: 'Fazem teleconsulta?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Sim, oferecemos teleconsulta para consultas de retorno e orientações médicas. A primeira consulta deve ser presencial.',
              },
            },
          ],
        }

      default:
        return null
    }
  }

  const structuredData = getStructuredData()

  if (!structuredData) return null

  return (
    <Script
      id={`structured-data-${type}`}
      type='application/ld+json'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
