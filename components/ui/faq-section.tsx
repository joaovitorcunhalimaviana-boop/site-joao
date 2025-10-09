'use client'

/**
 * @deprecated Este componente está desatualizado.
 * Use @/components/ui/faq-section-refactored.tsx que oferece:
 * - Melhor estrutura de dados com IDs e tags
 * - Integração com UniversalFAQ
 * - Melhor acessibilidade
 * - Tema consistente
 */

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface FAQItem {
  question: string
  answer: string
  category: 'consulta' | 'tratamento' | 'agendamento' | 'especialidades'
}

const faqData: FAQItem[] = [
  {
    question: 'Quem é o Dr. João Vitor Viana?',
    answer:
      'Dr. João Vitor Viana é um coloproctologista e cirurgião geral com formação sólida, especializado no tratamento de doenças do intestino, ânus e reto. Une as melhores tecnologias às melhores evidências científicas na coloproctologia, sempre se aperfeiçoando para oferecer excelência no atendimento em João Pessoa e região.',
    category: 'consulta',
  },
  {
    question: 'Como agendar consulta com Dr. João Vitor Viana?',
    answer:
      'Você pode agendar sua consulta de várias formas: através do nosso sistema online 24h, por WhatsApp, telefone ou presencialmente. Oferecemos consultas presenciais, teleconsultas e visitas domiciliares para sua comodidade.',
    category: 'agendamento',
  },
  {
    question: 'Quais doenças o Dr. João Vitor Viana trata?',
    answer:
      'Dr. João Vitor Viana é especialista em hemorroidas, fissura anal, constipação intestinal, síndrome do intestino irritável, doença de Crohn, retocolite ulcerativa, pólipos intestinais, câncer colorretal, fístulas anais e outras doenças do trato digestivo baixo. Além disso, como cirurgião geral, também trata doenças da vesícula biliar, hérnias, e outras patologias cirúrgicas.',
    category: 'especialidades',
  },
  {
    question: 'Como tratar hemorroidas em João Pessoa?',
    answer:
      'O tratamento de hemorroidas varia conforme o grau e sintomas. Dr. João Vitor Viana oferece desde tratamentos clínicos conservadores até procedimentos minimamente invasivos como ligadura elástica, e cirurgia quando necessário.',
    category: 'tratamento',
  },
  {
    question: 'Dr. João Vitor Viana atende teleconsulta?',
    answer:
      'Sim! Oferecemos teleconsultas por videoconferência para consultas de retorno, orientações médicas, discussão de exames e acompanhamento de tratamentos. É uma opção prática e segura para quem não pode se deslocar ao consultório.',
    category: 'consulta',
  },
  {
    question: 'Onde fica o consultório do Dr. João Vitor Viana?',
    answer:
      'O consultório está localizado em João Pessoa, Paraíba. Também realizamos visitas domiciliares e hospitalares para pacientes que não podem se deslocar. Entre em contato para mais informações sobre localização e horários.',
    category: 'consulta',
  },
  {
    question: 'Dr. João Vitor Viana faz colonoscopia?',
    answer:
      'Sim, Dr. João Vitor Viana realiza colonoscopias para diagnóstico e rastreamento de doenças intestinais. O exame é fundamental para detectar pólipos, câncer colorretal e outras alterações do intestino grosso.',
    category: 'especialidades',
  },
  {
    question: 'Como funciona a consulta de urgência?',
    answer:
      'Para casos urgentes, oferecemos atendimento através da nossa Central de Urgências. Entre em contato via WhatsApp ou telefone para avaliarmos a necessidade de consulta imediata ou orientação médica.',
    category: 'agendamento',
  },
  {
    question: 'Quais são os valores das consultas?',
    answer:
      'Os valores variam conforme o tipo de consulta (presencial, teleconsulta ou domiciliar). Atendemos UNIMED e consultas particulares. Para pagamento particular, aceitamos dinheiro, PIX ou Bitcoin/USDT/USDC. Entre em contato para mais informações.',
    category: 'consulta',
  },
]

const categories = {
  consulta: 'Consultas',
  tratamento: 'Tratamentos',
  agendamento: 'Agendamento',
  especialidades: 'Especialidades',
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const filteredFAQ =
    selectedCategory === 'all'
      ? faqData
      : faqData.filter(item => item.category === selectedCategory)

  return (
    <section className='py-24 bg-black' id='faq'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16'>
          {/* Left Column - Title */}
          <div className='lg:col-span-4'>
            <div className='sticky top-8'>
              <div className='relative'>
                <div className='absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg blur opacity-10'></div>
                <div className='relative bg-blue-900/5 backdrop-blur-sm rounded-lg p-6 border border-blue-700/15'>
                  <h2 className='text-xl lg:text-2xl font-semibold text-white mb-2 tracking-tight'>
                    FAQ Perguntas Frequentes
                  </h2>
                  <div className='mt-4 h-1 w-16 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-full'></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ Items */}
          <div className='lg:col-span-8'>
            {/* FAQ Items */}
            <div className='space-y-4'>
              {faqData.map((item, index) => {
                const isOpen = openItems.includes(index)
                return (
                  <div
                    key={index}
                    className='bg-blue-900/5 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-blue-900/10 transition-all duration-300'
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      data-faq-button
                      className='w-full px-6 py-5 text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none active:outline-none'
                      style={{
                        outline: 'none !important',
                        boxShadow: 'none !important',
                      }}
                    >
                      <h3 className='text-base font-semibold text-white pr-4'>
                        {item.question}
                      </h3>
                      {isOpen ? (
                        <ChevronUpIcon className='h-5 w-5 text-gray-300 flex-shrink-0' />
                      ) : (
                        <ChevronDownIcon className='h-5 w-5 text-gray-300 flex-shrink-0' />
                      )}
                    </button>
                    {isOpen && (
                      <div className='px-6 pb-5'>
                        <p className='text-sm text-gray-200 leading-relaxed text-justify'>
                          {item.answer}
                        </p>
                        <div className='mt-3'>
                          <span className='inline-block px-3 py-1 text-xs font-medium bg-blue-900 text-blue-200 rounded-full'>
                            {categories[item.category]}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* CTA Button */}
            <div className='mt-12'>
              <a
                href='/agendamento'
                className='inline-flex items-center justify-center w-full lg:w-auto px-8 py-4 bg-transparent hover:bg-transparent text-white font-bold text-lg rounded-2xl transition-colors duration-300 shadow-lg hover:shadow-xl border border-white hover:border-gray-300'
              >
                AGENDAR CONSULTA
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
