'use client'

import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import StructuredData from '../../components/seo/structured-data'
import { CTASection } from '../../components/ui/call-to-action'
import EnhancedSEO, {
  useMedicalStructuredData,
} from '../../components/seo/enhanced-seo'
import MedicalFAQ, { plicomaFAQs } from '../../components/ui/medical-faq'

export default function PlicomaPage() {
  const structuredData = useMedicalStructuredData({
    condition: 'Plicoma',
    treatment: 'Cirurgia de Remoção de Plicoma',
  })
  return (
    <>
      <EnhancedSEO
        title='Tratamento de Plicoma em João Pessoa'
        description='Dr. João Vítor Viana, especialista em tratamento de plicoma em João Pessoa/PB. Cirurgia de plicoma, remoção de pele extra anal, hemorroidectomia. Proctologista experiente.'
        keywords={[
          'plicoma João Pessoa',
          'tratamento plicoma João Pessoa',
          'cirurgia plicoma João Pessoa',
          'médico plicoma João Pessoa',
          'proctologista plicoma João Pessoa',
          'remoção plicoma João Pessoa',
          'pele extra anal João Pessoa',
          'hemorroida externa João Pessoa',
          'trombose hemorroidária João Pessoa',
          'cirurgia anal João Pessoa',
        ]}
        canonicalUrl='/plicoma'
        structuredData={structuredData}
      />
      <StructuredData type='medicalCondition' />
      <div className='min-h-screen bg-black'>
        <Header currentPage='plicoma' />

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
                        d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
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
                      Plicoma
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
                    Tratamento especializado para plicoma com
                    <span className='text-blue-400 font-bold'>
                      {' '}
                      técnicas modernas e cuidado personalizado
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
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                O que é Plicoma?
              </h2>
              <p className='text-gray-300 mb-6 text-justify'>
                O plicoma é um excesso de pele na região anal que geralmente
                resulta do processo de cicatrização após episódios de
                hemorroidas externas trombosadas, fissuras anais ou outros
                processos inflamatórios. Embora seja uma condição benigna, pode
                causar desconforto e dificuldades na higiene.
              </p>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Principais Causas
              </h3>
              <div className='grid md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Hemorroidas Trombosadas
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Após episódios de trombose hemorroidária externa, pode
                    restar pele redundante no local da cicatrização.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Fissuras Anais Crônicas
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    O processo de cicatrização de fissuras pode resultar em
                    formação de plicomas na margem anal.
                  </p>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Sintomas e Características
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Presença de pele extra ao redor do ânus</li>
                  <li>• Dificuldade na higiene anal adequada</li>
                  <li>• Sensação de "algo sobrando" na região</li>
                  <li>• Irritação da pele por acúmulo de umidade</li>
                  <li>• Coceira ocasional</li>
                  <li>• Desconforto estético</li>
                  <li>• Possível sangramento por trauma local</li>
                </ul>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Diagnóstico
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Exame físico da região perianal</li>
                  <li>• Avaliação da extensão e localização</li>
                  <li>
                    • Diferenciação de outras condições (hemorroidas,
                    condilomas)
                  </li>
                  <li>• Anuscopia para avaliar estruturas internas</li>
                  <li>• Investigação de condições associadas</li>
                </ul>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Tratamento Cirúrgico
              </h3>
              <div className='grid md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Excisão Simples
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Remoção cirúrgica da pele redundante para obter resultado
                    estético adequado.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Técnica Ambulatorial
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Procedimento realizado com anestesia local, permitindo alta
                    no mesmo dia com cuidados domiciliares.
                  </p>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Cirurgia com Radiofrequência ou Laser de CO2
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <p className='text-gray-300 text-justify leading-relaxed'>
                  A incisão com radiofrequência ou laser de CO2 dissipa menos
                  calor, gerando menos dor pós-operatória e também uma
                  cicatrização melhor, com menor chance de formação de novo
                  plicoma. Esta técnica é especialmente importante para
                  pacientes que buscam um melhor resultado estético, utilizando
                  novas energias para otimizar o tratamento.
                </p>
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
                    Especialista em cirurgias de plicoma com técnica refinada
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Foco no resultado estético e funcional
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Procedimentos ambulatoriais seguros
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Acompanhamento pós-operatório cuidadoso
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Orientação completa sobre cuidados e prevenção
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <CTASection />
          </div>
        </main>

        {/* FAQ Section */}
        <MedicalFAQ
          title='Perguntas Frequentes sobre Plicoma'
          faqs={plicomaFAQs}
          className='bg-black'
        />

        <Footer />
      </div>
    </>
  )
}
