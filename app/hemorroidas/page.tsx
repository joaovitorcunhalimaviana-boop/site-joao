'use client'

import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import StructuredData from '../../components/seo/structured-data'
import { CTASection } from '../../components/ui/call-to-action'
import EnhancedSEO, {
  useMedicalStructuredData,
} from '../../components/seo/enhanced-seo'
import MedicalFAQ, { hemorroidasFAQs } from '../../components/ui/medical-faq'

export default function HemorroidasPage() {
  const structuredData = useMedicalStructuredData({
    condition: 'Hemorroidas',
    treatment: 'Cirurgia Minimamente Invasiva',
  })

  return (
    <>
      <EnhancedSEO
        title='Tratamento de Hemorroidas em João Pessoa'
        description='Dr. João Vítor Viana, especialista em tratamento de hemorroidas em João Pessoa/PB. Cirurgia minimamente invasiva, ligadura elástica, escleroterapia. Agendamento online.'
        keywords={[
          'hemorroidas João Pessoa',
          'tratamento hemorroidas João Pessoa',
          'cirurgia hemorroidas João Pessoa',
          'médico hemorróida João Pessoa',
          'proctologista hemorroidas João Pessoa',
        ]}
        canonicalUrl='/hemorroidas'
        structuredData={structuredData}
      />
      <StructuredData type='medicalCondition' />
      <div className='min-h-screen bg-black'>
        <Header currentPage='hemorroidas' />

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
                        d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
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
                      Hemorroidas
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
                    Tratamento especializado e humanizado para hemorroidas com
                    as
                    <span className='text-blue-400 font-bold'>
                      {' '}
                      técnicas mais modernas e eficazes
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

        {/* Content Section */}
        <main className='container mx-auto px-6 lg:px-8 py-16'>
          <div className='max-w-4xl mx-auto space-y-12'>
            {/* Caixa principal com todas as informações */}
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                O que são Hemorroidas?
              </h2>
              <p className='text-gray-300 mb-6 text-justify text-base leading-relaxed'>
                As hemorroidas são estruturas vasculares normais do canal anal
                que se tornam patológicas quando inflamadas, trombosadas ou
                prolapsadas. Podem ser internas (acima da linha pectínea) ou
                externas (abaixo da linha pectínea), causando desconforto, dor e
                sangramento.
              </p>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Tipos de Hemorroidas
              </h3>
              <div className='grid md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Hemorroidas Internas
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Localizadas acima da linha pectínea, geralmente indolores,
                    mas podem causar sangramento e prolapso durante evacuação.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Hemorroidas Externas
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Situadas abaixo da linha pectínea, cobertas por pele
                    sensível, podem causar dor intensa quando trombosadas.
                  </p>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Sintomas das Hemorroidas
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Sangramento vermelho vivo durante ou após evacuação</li>
                  <li>• Dor e desconforto na região anal</li>
                  <li>• Coceira e irritação anal (prurido)</li>
                  <li>• Sensação de massa ou protuberância anal</li>
                  <li>• Prolapso (saída das hemorroidas durante evacuação)</li>
                  <li>• Secreção mucosa</li>
                  <li>• Dificuldade na higiene anal</li>
                </ul>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Diagnóstico
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Exame físico e inspeção da região anal</li>
                  <li>• Toque retal para avaliação</li>
                  <li>• Anuscopia para visualização interna</li>
                  <li>• Colonoscopia quando indicada</li>
                </ul>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Tratamentos Disponíveis
              </h3>
              <div className='grid md:grid-cols-2 gap-6'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Tratamento Conservador
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Mudanças na dieta, aumento da ingestão de fibras,
                    medicamentos tópicos e banhos de assento para alívio dos
                    sintomas.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Ligadura Elástica
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Procedimento ambulatorial que consiste na colocação de
                    bandas elásticas na base das hemorroidas internas.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Hemorroidectomia
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Cirurgia para remoção das hemorroidas em casos mais
                    avançados, realizada com técnicas modernas para menor dor
                    pós-operatória.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Radiofrequência ou Laser de CO2
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    O uso da radiofrequência ou do laser de CO₂ gera uma menor
                    dissipação de calor, com menos dor pós-operatória.
                  </p>
                </div>
              </div>
            </div>

            {/* Médico */}
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h3 className='text-2xl font-bold text-white mb-6'>
                Por que escolher o Dr. João Vítor Viana?
              </h3>
              <ul className='text-gray-300 space-y-3'>
                <li className='flex items-start'>
                  <span className='text-blue-400 mr-3'>•</span>
                  <span>
                    Especialista em Coloproctologia com vasta experiência em
                    hemorroidas
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='text-blue-400 mr-3'>•</span>
                  <span>
                    Utilização de técnicas modernas e minimamente invasivas
                  </span>
                </li>
                <li className='flex items-start'>
                  <span className='text-blue-400 mr-3'>•</span>
                  <span>Atendimento humanizado e personalizado</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-blue-400 mr-3'>•</span>
                  <span>Acompanhamento completo do pré ao pós-operatório</span>
                </li>
              </ul>
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

        <MedicalFAQ
          title='Perguntas Frequentes sobre Hemorroidas'
          faqs={hemorroidasFAQs}
        />

        <CTASection
          title='Sofre com hemorroidas?'
          subtitle='Agende sua consulta e descubra o melhor tratamento para seu caso'
        />

        <Footer />
      </div>
    </>
  )
}
