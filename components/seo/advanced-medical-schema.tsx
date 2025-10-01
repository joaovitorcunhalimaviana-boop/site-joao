import Script from 'next/script'

interface MedicalConditionData {
  name: string
  description: string
  codeValue: string
  treatment: string
  riskFactors: string[]
  testName: string
  anatomy: string
}

interface MedicalProcedureData {
  description: string
  type: string
  bodyLocation: string
  preparation: string[]
  howPerformed: string
  followup: string
}

interface MedicalFAQData {
  questions: Array<{ question: string; answer: string }>
}

type MedicalSchemaData = MedicalConditionData | MedicalProcedureData | MedicalFAQData

interface AdvancedMedicalSchemaProps {
  type: 'condition' | 'procedure' | 'faq'
  data: MedicalSchemaData
}

export default function AdvancedMedicalSchema({
  type,
  data,
}: AdvancedMedicalSchemaProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      mainEntity: {
        '@type': 'MedicalCondition',
        name: 'Consulta Médica Especializada',
        description:
          'Informações médicas especializadas em coloproctologia e cirurgia geral',
        medicalSpecialty: {
          '@type': 'MedicalSpecialty',
          name: 'Coloproctologia',
        },
      },
    }

    switch (type) {
      case 'condition':
        const conditionData = data as MedicalConditionData
        return {
          ...baseData,
          mainEntity: {
            '@type': 'MedicalCondition',
            name: conditionData.name,
            description: conditionData.description,
            code: {
              '@type': 'MedicalCode',
              code: conditionData.codeValue,
              codingSystem: 'ICD-10',
            },
            possibleTreatment: {
              '@type': 'MedicalTherapy',
              name: conditionData.treatment,
            },
            riskFactor: conditionData.riskFactors.map((factor) => ({
              '@type': 'MedicalRiskFactor',
              name: factor,
            })),
            associatedAnatomy: {
              '@type': 'AnatomicalStructure',
              name: conditionData.anatomy,
            },
          },
        }

      case 'procedure':
        const procedureData = data as MedicalProcedureData
        return {
          ...baseData,
          mainEntity: {
            '@type': 'MedicalProcedure',
            name: procedureData.type,
            description: procedureData.description,
            bodyLocation: {
              '@type': 'AnatomicalStructure',
              name: procedureData.bodyLocation,
            },
            preparation: procedureData.preparation.join(', '),
            howPerformed: procedureData.howPerformed,
            followup: procedureData.followup,
          },
        }

      case 'faq':
        const faqData = data as MedicalFAQData
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqData.questions.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }

      default:
        return baseData
    }
  }

  return (
    <Script
      id={`advanced-medical-schema-${type}`}
      type='application/ld+json'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  )
}

export function HemorroidsSchema() {
  const data = {
    name: 'Hemorroidas',
    description: 'Veias dilatadas e inflamadas na região anal',
    codeValue: 'K64',
    treatment: 'Tratamento clínico conservador ou cirurgia',
    riskFactors: ['Constipação crônica', 'Gravidez', 'Obesidade'],
    testName: 'Exame Proctológico',
    anatomy: 'Ânus e Reto',
  }
  return <AdvancedMedicalSchema type='condition' data={data} />
}

export function ColonoscopySchema() {
  const data = {
    description: 'Exame endoscópico do intestino grosso',
    type: 'Procedimento Diagnóstico',
    bodyLocation: 'Intestino Grosso',
    preparation: ['Jejum de 12 horas', 'Preparo intestinal'],
    howPerformed: 'Inserção de endoscópio flexível',
    followup: 'Acompanhamento médico',
  }
  return <AdvancedMedicalSchema type='procedure' data={data} />
}

export function MedicalFAQSchema({ questions }: { questions: Array<{ question: string; answer: string }> }) {
  return <AdvancedMedicalSchema type='faq' data={{ questions }} />
}
