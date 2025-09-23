'use client'

import Script from 'next/script'

interface MedicalSchemaProps {
  type: 'specialty' | 'condition' | 'procedure' | 'faq'
  data: any
}

export default function AdvancedMedicalSchema({
  type,
  data,
}: MedicalSchemaProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'specialty':
        return {
          '@context': 'https://schema.org',
          '@type': 'MedicalSpecialty',
          name: 'Coloproctologia',
          description:
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
          practitioner: {
            '@type': 'Person',
            name: 'Dr. João Vitor Viana',
            jobTitle: 'Coloproctologista',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'João Pessoa',
              addressRegion: 'PB',
              addressCountry: 'BR',
            },
          },
        }

      case 'condition':
        return {
          '@context': 'https://schema.org',
          '@type': 'MedicalCondition',
          name: data.name,
          description: data.description,
          code: {
            '@type': 'MedicalCode',
            codeValue: data.codeValue,
            codingSystem: 'ICD-10',
          },
          possibleTreatment: {
            '@type': 'MedicalTherapy',
            name: data.treatment,
          },
          riskFactor: data.riskFactors,
          typicalTest: {
            '@type': 'MedicalTest',
            name: data.testName,
          },
          associatedAnatomy: {
            '@type': 'AnatomicalStructure',
            name: data.anatomy,
          },
        }

      case 'procedure':
        return {
          '@context': 'https://schema.org',
          '@type': 'MedicalProcedure',
          name: data.name,
          description: data.description,
          procedureType: {
            '@type': 'MedicalProcedureType',
            name: data.type,
          },
          bodyLocation: {
            '@type': 'AnatomicalStructure',
            name: data.bodyLocation,
          },
          preparation: data.preparation,
          howPerformed: data.howPerformed,
          followup: data.followup,
          performer: {
            '@type': 'Person',
            name: 'Dr. João Vitor Viana',
            jobTitle: 'Coloproctologista',
          },
        }

      case 'faq':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.questions.map((q: any) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.answer,
            },
          })),
        }

      default:
        return {}
    }
  }

  return (
    <Script
      id={`advanced-medical-schema-${type}`}
      type="application/ld+json"
      strategy="beforeInteractive"
    >
      {JSON.stringify(getStructuredData())}
    </Script>
  )
}

// Componentes específicos para condições médicas
export function HemorroidsSchema() {
  const data = {
    name: 'Hemorroidas',
    description:
      'Veias dilatadas e inflamadas na região anal que causam dor, coceira e sangramento',
    codeValue: 'K64',
    treatment:
      'Tratamento clínico conservador, procedimentos minimamente invasivos ou cirurgia',
    riskFactors: [
      'Constipação crônica',
      'Gravidez',
      'Obesidade',
      'Sedentarismo',
      'Idade avançada',
    ],
    testName: 'Exame Proctológico',
    anatomy: 'Ânus e Reto',
  }

  return <AdvancedMedicalSchema type='condition' data={data} />
}

export function ColonoscopySchema() {
  const data = {
    name: 'Colonoscopia',
    description:
      'Exame endoscópico para visualização completa do intestino grosso',
    type: 'Procedimento Diagnóstico',
    bodyLocation: 'Intestino Grosso',
    preparation: [
      'Jejum de 12 horas',
      'Preparo intestinal com laxantes',
      'Suspensão de medicamentos específicos',
    ],
    howPerformed:
      'Inserção de endoscópio flexível através do ânus para visualização completa do cólon',
    followup: 'Acompanhamento médico conforme achados do exame',
  }

  return <AdvancedMedicalSchema type='procedure' data={data} />
}

export function MedicalFAQSchema({
  questions,
}: {
  questions: Array<{ question: string; answer: string }>
}) {
  return <AdvancedMedicalSchema type='faq' data={{ questions }} />
}
