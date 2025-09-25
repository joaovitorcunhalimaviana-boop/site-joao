'use client'

import React from 'react'
import UniversalFAQ from './universal-faq'
import { CardBase } from './card-base'
import { ButtonBase } from './button-base'
import { Section } from '../layout/page-layout'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { medicalConstants } from '@/lib/medical-utils'
import { useTheme } from '@/lib/theme'

// Dados das FAQs específicas para Dr. João Vitor Viana
const faqData = [
  {
    id: '1',
    question: 'Quem é o Dr. João Vitor Viana?',
    answer:
      'Dr. João Vitor Viana é um coloproctologista e cirurgião geral com formação sólida, especializado no tratamento de doenças do intestino, ânus e reto. Une as melhores tecnologias às melhores evidências científicas na coloproctologia, sempre se aperfeiçoando para oferecer excelência no atendimento em João Pessoa e região.',
    category: 'consulta',
    tags: ['médico', 'especialista', 'coloproctologia'],
  },
  {
    id: '2',
    question: 'Como agendar consulta com Dr. João Vitor Viana?',
    answer:
      'Você pode agendar sua consulta de várias formas: através do nosso sistema online 24h, por WhatsApp, telefone ou presencialmente. Oferecemos consultas presenciais, teleconsultas e visitas domiciliares para sua comodidade.',
    category: 'agendamento',
    tags: ['agendamento', 'consulta', 'online'],
  },
  {
    id: '3',
    question: 'Quais doenças o Dr. João Vitor Viana trata?',
    answer:
      'Dr. João Vitor Viana é especialista em hemorroidas, fissura anal, constipação intestinal, síndrome do intestino irritável, doença de Crohn, retocolite ulcerativa, pólipos intestinais, câncer colorretal, fístulas anais e outras doenças do trato digestivo baixo. Além disso, como cirurgião geral, também trata doenças da vesícula biliar, hérnias, e outras patologias cirúrgicas.',
    category: 'especialidades',
    tags: ['especialidades', 'doenças', 'tratamento'],
  },
  {
    id: '4',
    question: 'Como tratar hemorroidas em João Pessoa?',
    answer:
      'O tratamento de hemorroidas varia conforme o grau e sintomas. Dr. João Vitor Viana oferece desde tratamentos clínicos conservadores até procedimentos minimamente invasivos como ligadura elástica, e cirurgia quando necessário.',
    category: 'tratamento',
    tags: ['hemorroidas', 'tratamento', 'cirurgia'],
  },
  {
    id: '5',
    question: 'Dr. João Vitor Viana atende teleconsulta?',
    answer:
      'Sim! Oferecemos teleconsultas por videoconferência para consultas de retorno, orientações médicas, discussão de exames e acompanhamento de tratamentos. É uma opção prática e segura para quem não pode se deslocar ao consultório.',
    category: 'consulta',
    tags: ['teleconsulta', 'online', 'videoconferência'],
  },
  {
    id: '6',
    question: 'Onde fica o consultório do Dr. João Vitor Viana?',
    answer:
      'O consultório está localizado em João Pessoa, Paraíba. Também realizamos visitas domiciliares e hospitalares para pacientes que não podem se deslocar. Entre em contato para mais informações sobre localização e horários.',
    category: 'consulta',
    tags: ['localização', 'consultório', 'João Pessoa'],
  },
  {
    id: '7',
    question: 'Qual o melhor tratamento para fissura anal?',
    answer:
      'O tratamento da fissura anal pode ser clínico (pomadas, relaxantes musculares, mudanças na dieta) ou cirúrgico nos casos crônicos. Dr. João Vitor Viana avalia cada caso individualmente para definir a melhor abordagem terapêutica.',
    category: 'tratamento',
    tags: ['fissura anal', 'tratamento', 'clínico'],
  },
  {
    id: '8',
    question: 'Dr. João Vitor Viana faz colonoscopia?',
    answer:
      'Sim, Dr. João Vitor Viana realiza colonoscopias para diagnóstico e rastreamento de doenças intestinais. O exame é fundamental para detectar pólipos, câncer colorretal e outras alterações do intestino grosso.',
    category: 'tratamento',
    tags: ['colonoscopia', 'exame', 'diagnóstico'],
  },
  {
    id: '9',
    question: 'Como se preparar para a consulta?',
    answer:
      'Para a consulta, traga seus exames anteriores, lista de medicamentos em uso, histórico médico familiar e suas principais queixas anotadas. Isso ajuda o Dr. João Vitor Viana a fazer uma avaliação mais completa e precisa.',
    category: 'consulta',
    tags: ['preparação', 'consulta', 'exames'],
  },
  {
    id: '10',
    question: 'Qual o valor da consulta?',
    answer:
      'Os valores das consultas variam conforme o tipo de atendimento (presencial, teleconsulta, domiciliar). Entre em contato conosco para informações atualizadas sobre valores e formas de pagamento. Aceitamos diversos planos de saúde.',
    category: 'agendamento',
    tags: ['valor', 'pagamento', 'planos de saúde'],
  },
]

// Categorias das FAQs
const faqCategories: Record<string, string> = {
  todas: 'Todas as perguntas',
  consulta: 'Consultas',
  agendamento: 'Agendamento',
  tratamento: 'Tratamentos',
  especialidades: 'Especialidades',
}

interface FAQSectionRefactoredProps {
  className?: string
  showContactSection?: boolean
  maxItems?: number
  variant?: 'default' | 'compact' | 'detailed'
}

export function FAQSectionRefactored({
  className,
  showContactSection = true,
  maxItems,
  variant = 'default',
}: FAQSectionRefactoredProps) {
  const { medicalStyles } = useTheme()

  // Seção de contato personalizada
  const contactSection = showContactSection ? (
    <CardBase variant='interactive' className='text-center'>
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-white'>
          Não encontrou sua resposta?
        </h3>
        <p className={medicalStyles.text.secondary}>
          Entre em contato conosco para esclarecer suas dúvidas ou agendar sua
          consulta.
        </p>
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <ButtonBase
            variant='appointment'
            size='cta-sm'
            className='flex items-center gap-2'
          >
            <MessageCircle className='h-5 w-5' />
            Entrar em Contato
          </ButtonBase>
        </div>
      </div>
    </CardBase>
  ) : null

  return (
    <Section
      title='Perguntas Frequentes'
      subtitle='Encontre respostas para as dúvidas mais comuns sobre nossos serviços'
      variant='card'
      className={className}
    >
      <UniversalFAQ
        title='Dúvidas sobre Dr. João Vitor Viana'
        subtitle='Especialista em Coloproctologia e Cirurgia Geral'
        faqData={faqData.slice(0, maxItems)}
        categories={faqCategories}
        showContactSection={showContactSection}
        contactTitle='Não encontrou sua resposta?'
        contactDescription='Entre em contato conosco para esclarecer suas dúvidas ou agendar sua consulta.'
        contactButtons={[
          {
            text: 'Entrar em Contato',
            href: '/contato',
            variant: 'primary',
          },
        ]}
        className='space-y-6'
      />
    </Section>
  )
}

// Componente específico para página de especialidades
export function SpecialtyFAQ({ specialty }: { specialty: string }) {
  const specialtyFAQs = faqData.filter(faq =>
    faq.tags.some(tag => tag.toLowerCase().includes(specialty.toLowerCase()))
  )

  return (
    <FAQSectionRefactored
      showContactSection={false}
      variant='compact'
      className='mt-8'
    />
  )
}

// Componente para FAQ em modal ou sidebar
export function CompactFAQ({ maxItems = 5 }: { maxItems?: number }) {
  return (
    <div className='space-y-4'>
      <h3 className='text-base font-semibold text-white mb-4'>
        Perguntas Frequentes
      </h3>
      <UniversalFAQ
        faqData={faqData.slice(0, maxItems)}
        className='space-y-3'
      />
    </div>
  )
}

export default FAQSectionRefactored
