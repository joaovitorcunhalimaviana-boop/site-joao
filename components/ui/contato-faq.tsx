'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface FAQItem {
  question: string
  answer: string
  category: 'agendamento' | 'contato' | 'consulta' | 'pagamento'
}

const contatoFAQ: FAQItem[] = [
  {
    question: 'Como posso agendar uma consulta com Dr. João Vitor Viana?',
    answer:
      'Você pode agendar de várias formas: pelo WhatsApp (83) 9 9122-1599 (disponível 24h), telefone do consultório (83) 3225-1747 (seg-sex, 14h-18h), através do nosso sistema de agendamento online ou presencialmente no consultório.',
    category: 'agendamento',
  },
  {
    question: 'Qual o WhatsApp do Dr. João Vitor Viana?',
    answer:
      'O WhatsApp para contato é (83) 9 9122-1599. Este número é atendido pela nossa equipe de secretárias e está disponível 24 horas por dia para agendamentos, dúvidas e orientações.',
    category: 'contato',
  },
  {
    question: 'Onde fica o consultório do Dr. João Vitor Viana?',
    answer:
      'O consultório está localizado em João Pessoa, Paraíba. Para informações detalhadas sobre o endereço e como chegar, entre em contato conosco pelos canais disponíveis. Também realizamos visitas domiciliares quando necessário.',
    category: 'consulta',
  },
  {
    question: 'Qual o horário de funcionamento do consultório?',
    answer:
      'O consultório funciona de segunda a sexta-feira, das 14h às 18h. Para agendamentos e contato via WhatsApp, estamos disponíveis 24 horas. Também oferecemos atendimento de urgência conforme disponibilidade.',
    category: 'consulta',
  },
  {
    question: 'Dr. João Vitor Viana atende por teleconsulta?',
    answer:
      'Sim! Oferecemos teleconsultas por videoconferência para consultas de retorno, discussão de exames, orientações médicas e acompanhamento de tratamentos. Agende através dos nossos canais de contato.',
    category: 'consulta',
  },
  {
    question: 'Como funciona o agendamento online?',
    answer:
      'Nosso sistema de agendamento online está disponível 24h. Você pode escolher o tipo de consulta (presencial, teleconsulta ou domiciliar), data e horário de sua preferência. Após o agendamento, nossa equipe entrará em contato para confirmação.',
    category: 'agendamento',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer:
      'Aceitamos pagamento à vista através de dinheiro, PIX ou Bitcoin/USDT/USDC. Entre em contato para mais informações sobre valores.',
    category: 'pagamento',
  },
  {
    question: 'Dr. João Vitor Viana faz visitas domiciliares?',
    answer:
      'Sim, realizamos visitas domiciliares e hospitalares para pacientes que não podem se deslocar ao consultório. Este serviço deve ser agendado previamente através dos nossos canais de contato.',
    category: 'consulta',
  },
  {
    question: 'Como funciona o atendimento de urgência?',
    answer:
      'Para casos urgentes, entre em contato via WhatsApp (83) 9 9122-1599 ou telefone do consultório. Nossa equipe avaliará a situação e orientará sobre a melhor forma de atendimento, que pode incluir consulta imediata ou orientações médicas.',
    category: 'agendamento',
  },
  {
    question: 'Posso remarcar ou cancelar minha consulta?',
    answer:
      'Sim, você pode remarcar ou cancelar sua consulta entrando em contato conosco com antecedência mínima de 24 horas. Isso nos permite reorganizar a agenda e oferecer o horário para outros pacientes.',
    category: 'agendamento',
  },
  {
    question: 'Dr. João Vitor Viana atende quais planos de saúde?',
    answer: 'Atendemos UNIMED e consultas particulares.',
    category: 'pagamento',
  },
  {
    question: 'Como posso tirar dúvidas antes da consulta?',
    answer:
      'Você pode entrar em contato via WhatsApp ou telefone para esclarecer dúvidas sobre procedimentos, preparos para exames ou orientações gerais antes da sua consulta.',
    category: 'contato',
  },
]

const categories = {
  agendamento: 'Agendamento',
  contato: 'Contato',
  consulta: 'Consultas',
  pagamento: 'Pagamento',
}

export default function ContatoFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const filteredFAQ =
    selectedCategory === 'all'
      ? contatoFAQ
      : contatoFAQ.filter(item => item.category === selectedCategory)

  return (
    <section className='py-16 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 mt-16'>
      <div className='px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-xl font-bold tracking-tight text-white sm:text-2xl'>
            Perguntas Frequentes sobre Contato
          </h2>
          <p className='mt-4 text-lg text-gray-300'>
            Esclareça suas dúvidas sobre agendamento e formas de contato
          </p>
        </div>

        {/* Category Filter */}
        <div className='flex flex-wrap justify-center gap-3 mb-10'>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Todas
          </button>
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className='space-y-4'>
          {filteredFAQ.map((item, index) => {
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

        {/* Quick Contact CTA */}
        <div className='mt-12'>
          <div className='bg-gray-900 rounded-xl p-6 border border-gray-700'>
            <h3 className='text-lg font-bold text-white mb-4 text-center'>
              Pronto para agendar sua consulta?
            </h3>
            <p className='text-center text-gray-300 mb-6 text-lg'>
              João Vitor Viana é proctologista em João Pessoa
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <a
                href='https://wa.me/5583991221599'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors'
              >
                <svg
                  className='w-5 h-5 mr-2'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                </svg>
                WhatsApp
              </a>
              <a
                href='tel:+558332251747'
                className='flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
              >
                <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                  />
                </svg>
                Telefone
              </a>
              <a
                href='/agendamento'
                className='flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition-colors'
              >
                <svg
                  className='w-5 h-5 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2'
                  />
                </svg>
                Agendar Online
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
