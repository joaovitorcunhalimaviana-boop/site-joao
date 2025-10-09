'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface FAQItem {
  question: string
  answer: string
  category: 'coloproctologia' | 'cirurgia' | 'procedimentos' | 'diagnostico'
}

const especialidadesFAQ: FAQItem[] = [
  {
    question: 'O que exatamente trata um coloproctologista?',
    answer:
      'O coloproctologista é especialista em doenças do intestino grosso (cólon), reto, ânus e estruturas relacionadas. Trata hemorroidas, fissuras anais, fístulas, constipação, síndrome do intestino irritável, doença de Crohn, retocolite ulcerativa, pólipos intestinais e câncer colorretal.',
    category: 'coloproctologia',
  },
  {
    question: 'Como é feito o diagnóstico das doenças coloproctológicas?',
    answer:
      'O diagnóstico combina história clínica detalhada, exame físico especializado e exames complementares quando necessários, como colonoscopia, retossigmoidoscopia, manometria anorretal, ultrassom endoanal e exames de imagem específicos.',
    category: 'diagnostico',
  },
  {
    question: 'Quais são os tratamentos modernos para hemorroidas?',
    answer:
      'Os tratamentos incluem medidas clínicas (mudanças na dieta, medicamentos), procedimentos ambulatoriais (ligadura elástica, escleroterapia, fotocoagulação infravermelha) e cirurgias minimamente invasivas quando necessário. A escolha depende do grau e sintomas.',
    category: 'procedimentos',
  },
  {
    question: 'Como funciona o tratamento da fissura anal?',
    answer:
      'O tratamento pode ser clínico (pomadas anestésicas, relaxantes musculares, mudanças na dieta) ou cirúrgico nos casos crônicos. Utilizamos também toxina botulínica para relaxar o esfíncter anal e promover a cicatrização.',
    category: 'procedimentos',
  },
  {
    question: 'O que é colonoscopia e quando é indicada?',
    answer:
      'A colonoscopia é um exame que permite visualizar todo o intestino grosso através de um aparelho flexível com câmera. É indicada para rastreamento de câncer colorretal, investigação de sangramento, dor abdominal, mudança do hábito intestinal e acompanhamento de doenças inflamatórias.',
    category: 'diagnostico',
  },
  {
    question: 'Quais cirurgias são realizadas em coloproctologia?',
    answer:
      'Realizamos hemorroidectomias, fissurectomias, tratamento de fístulas anorretais, ressecções intestinais, cirurgias para doença pilonidal, correção de prolapso retal e procedimentos para incontinência fecal, sempre priorizando técnicas minimamente invasivas.',
    category: 'cirurgia',
  },
  {
    question: 'Como é tratada a constipação intestinal crônica?',
    answer:
      'O tratamento é individualizado, incluindo orientações dietéticas, aumento da ingestão de fibras e líquidos, exercícios físicos, medicamentos específicos e, em casos selecionados, procedimentos como biofeedback ou cirurgias funcionais.',
    category: 'procedimentos',
  },
  {
    question: 'O que são doenças inflamatórias intestinais?',
    answer:
      'São doenças crônicas como doença de Crohn e retocolite ulcerativa, que causam inflamação no intestino. O tratamento envolve medicamentos anti-inflamatórios, imunossupressores, biológicos e, em alguns casos, cirurgia para complicações.',
    category: 'coloproctologia',
  },
  {
    question: 'Quando é necessária cirurgia em coloproctologia?',
    answer:
      'A cirurgia é indicada quando o tratamento clínico não é eficaz, em casos de complicações (como trombose hemorroidária, abscesso), doenças malignas, obstruções intestinais ou quando há comprometimento significativo da qualidade de vida.',
    category: 'cirurgia',
  },
  {
    question: 'Como prevenir doenças coloproctológicas?',
    answer:
      'A prevenção inclui dieta rica em fibras, hidratação adequada, exercícios regulares, evitar esforço evacuatório excessivo, não postergar a evacuação, manter peso adequado e realizar exames de rastreamento conforme orientação médica.',
    category: 'coloproctologia',
  },
]

const categories = {
  coloproctologia: 'Coloproctologia',
  cirurgia: 'Cirurgias',
  procedimentos: 'Procedimentos',
  diagnostico: 'Diagnóstico',
}

export default function EspecialidadesFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const filteredFAQ =
    selectedCategory === 'all'
      ? especialidadesFAQ
      : especialidadesFAQ.filter(item => item.category === selectedCategory)

  return (
    <section className='py-16 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 mt-16'>
      <div className='px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-xl lg:text-2xl font-bold tracking-tight text-white'>
            Perguntas Frequentes sobre Especialidades
          </h2>
          <p className='mt-4 text-lg text-gray-300'>
            Esclareça suas dúvidas sobre coloproctologia e cirurgia geral
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
                  className='w-full px-6 py-5 text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none active:outline-none [&:focus]:outline-none [&:focus-visible]:outline-none'
                  style={{
                    outline: 'none !important',
                    boxShadow: 'none !important',
                    border: 'none !important',
                  }}
                  onFocus={e => {
                    e.target.style.outline = 'none'
                    e.target.style.boxShadow = 'none'
                    e.target.style.border = 'none'
                  }}
                >
                  <h3 className='text-lg font-semibold text-white pr-4'>
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
                    <p className='text-gray-200 leading-relaxed text-justify'>
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

        {/* CTA Section */}
        <div className='mt-12 text-center'>
          <div className='bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-xl p-6 border border-blue-800/30'>
            <h3 className='text-lg font-bold text-white mb-3'>
              Precisa de mais informações?
            </h3>
            <p className='text-lg text-blue-100 mb-4'>
              Agende uma consulta para esclarecer suas dúvidas e receber
              orientação personalizada
            </p>
            <a
              href='/agendamento'
              className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-blue-900 bg-white hover:bg-gray-50 transition-colors'
            >
              Agendar Consulta
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
