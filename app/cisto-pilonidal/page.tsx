import type { Metadata } from 'next'
import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import StructuredData from '../../components/seo/structured-data'
import MedicalFAQ, { cistoPilonidalFAQs } from '../../components/ui/medical-faq'

export const metadata: Metadata = {
  title: 'Tratamento de Cisto Pilonidal em João Pessoa - Dr. João Vítor Viana',
  description:
    'Dr. João Vítor Viana, especialista em tratamento de cisto pilonidal em João Pessoa/PB. Cirurgia de cisto sacrococcígeo, drenagem de abscesso pilonidal. Proctologista experiente.',
  keywords: [
    'cisto pilonidal João Pessoa',
    'tratamento cisto pilonidal João Pessoa',
    'cirurgia cisto pilonidal João Pessoa',
    'médico cisto pilonidal João Pessoa',
    'proctologista cisto pilonidal João Pessoa',
    'cisto sacrococcígeo João Pessoa',
    'abscesso pilonidal João Pessoa',
    'drenagem cisto pilonidal João Pessoa',
    'doença pilonidal João Pessoa',
    'sinus pilonidal João Pessoa',
  ],
}

export default function CistoPilonidalPage() {
  return (
    <>
      <StructuredData type='medicalCondition' />
      <div className='min-h-screen bg-black'>
        <Header currentPage='cisto-pilonidal' />

        {/* Hero Section */}
        <div className='bg-black pt-32'>
          <div className='relative isolate'>
            <div
              className='absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'
              aria-hidden='true'
            >
              <div
                className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-blue-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'
                style={{
                  clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
              />
            </div>
            <section className='py-8 text-white'>
              <div className='max-w-4xl mx-auto px-4 text-center'>
                {/* Page Title */}
                <div className='text-center mb-8'>
                  <div
                    className='inline-block p-3 bg-blue-900/20 rounded-2xl mb-6'
                    style={{ padding: '12px !important' }}
                  >
                    <svg
                      className='w-10 h-10 text-blue-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                      style={{
                        width: '56px !important',
                        height: '56px !important',
                      }}
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                  </div>
                  <h1
                    className='text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight'
                    style={{
                      fontSize: 'clamp(3.5rem, 8vw, 6rem) !important',
                      fontWeight: 'bold !important',
                      marginBottom: '1.5rem !important',
                    }}
                  >
                    Tratamento de
                    <span
                      className='block text-blue-400 mt-2'
                      style={{
                        display: 'block !important',
                        marginTop: '0.5rem !important',
                        fontSize: 'inherit !important',
                      }}
                    >
                      Cisto Pilonidal
                    </span>
                  </h1>
                  <p
                    className='text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed'
                    style={{
                      fontSize: '1.25rem !important',
                      lineHeight: '1.75 !important',
                      maxWidth: '48rem !important',
                    }}
                  >
                    Tratamento especializado para cisto pilonidal com
                    <span className='text-blue-400 font-bold'>
                      {' '}
                      técnicas modernas e recuperação rápida
                    </span>
                  </p>
                  <div
                    className='mt-6 h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mx-auto'
                    style={{
                      marginTop: '1.5rem !important',
                      height: '4px !important',
                      width: '5rem !important',
                    }}
                  ></div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <main className='max-w-4xl mx-auto px-4 py-12'>
          <div className='space-y-12'>
            {/* Informações Principais */}
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                O que é Cisto Pilonidal?
              </h2>
              <p className='text-gray-300 mb-6 text-justify leading-relaxed'>
                O cisto pilonidal é uma cavidade anormal que se forma na região
                sacrococcígea (parte inferior das costas, próximo ao cóccix).
                Geralmente contém pelos e detritos, podendo se infectar e formar
                abscessos. É mais comum em homens jovens, especialmente aqueles
                com pelos grossos e abundantes na região.
              </p>

              <h3 className='text-2xl font-bold text-white mb-6'>
                Tipos de Doença Pilonidal
              </h3>
              <div className='grid md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Cisto Pilonidal Simples
                  </h4>
                  <p className='text-gray-300 text-justify leading-relaxed'>
                    Cavidade pequena, sem infecção ativa, que pode ser
                    assintomática ou causar desconforto leve.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Abscesso Pilonidal
                  </h4>
                  <p className='text-gray-300 text-justify leading-relaxed'>
                    Infecção do cisto com formação de pus, causando dor intensa,
                    inchaço e vermelhidão na região.
                  </p>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-white mb-6'>
                Sintomas Principais
              </h3>
              <ul className='text-gray-300 space-y-3 mb-8'>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Dor na região do cóccix, especialmente ao sentar</span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <span>
                    Inchaço e vermelhidão na parte inferior das costas
                  </span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Drenagem de pus ou secreção com odor desagradável</span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Presença de pelos saindo da lesão</span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Febre (em casos de infecção)</span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Desconforto ao usar roupas apertadas</span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <span>
                    Dificuldade para permanecer sentado por longos períodos
                  </span>
                </li>
              </ul>

              <h3 className='text-2xl font-bold text-white mb-6'>
                Diagnóstico
              </h3>
              <ul className='text-gray-300 space-y-3 mb-8'>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Exame físico da região sacrococcígea</span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <span>Avaliação dos sintomas e histórico clínico</span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <span>
                    Ultrassom ou ressonância magnética (quando necessário)
                  </span>
                </li>
              </ul>

              <h3 className='text-2xl font-bold text-white mb-6'>
                Tratamentos Disponíveis
              </h3>
              <div className='grid md:grid-cols-2 gap-6'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Drenagem de Abscesso
                  </h4>
                  <p className='text-gray-300 text-justify leading-relaxed'>
                    Procedimento para drenar o pus em casos de infecção aguda,
                    proporcionando alívio imediato dos sintomas.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Excisão Simples com Retalho
                  </h4>
                  <p className='text-gray-300 text-justify leading-relaxed'>
                    Remoção cirúrgica do cisto e dos tecidos afetados, com
                    retalho para fechamento da pele.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Tratamento a Laser
                  </h4>
                  <p className='text-gray-300 text-justify leading-relaxed'>
                    Técnica minimamente invasiva que utiliza laser para destruir
                    o tecido do cisto, com menor tempo de recuperação.
                  </p>
                </div>
              </div>
            </div>

            {/* Por que escolher Dr. João Vítor Viana */}
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                Por que escolher Dr. João Vítor Viana?
              </h2>
              <div className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Especialista em cirurgia de cisto pilonidal
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Técnicas modernas e minimamente invasivas
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Acompanhamento pós-operatório completo
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Atendimento humanizado em João Pessoa
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className='text-center'>
              <a
                href='/agendamento'
                className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              >
                Agendar Consulta
                <svg
                  className='ml-2 w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                  />
                </svg>
              </a>
            </div>
          </div>
        </main>

        {/* FAQ Section */}
        <MedicalFAQ
          title='Perguntas Frequentes sobre Cisto Pilonidal'
          faqs={cistoPilonidalFAQs}
          className='bg-black'
        />

        <Footer />
      </div>
    </>
  )
}
