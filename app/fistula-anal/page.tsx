'use client'

import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import StructuredData from '../../components/seo/structured-data'
import { CTASection } from '../../components/ui/call-to-action'
import EnhancedSEO, {
  useMedicalStructuredData,
} from '../../components/seo/enhanced-seo'
import MedicalFAQ, { fistulaAnalFAQs } from '../../components/ui/medical-faq'

export default function FistulaAnalPage() {
  const structuredData = useMedicalStructuredData({
    condition: 'Fístula Anal',
    description:
      'Tratamento especializado de fístula anal em João Pessoa com Dr. João Vítor Viana',
    symptoms: [
      'drenagem de pus',
      'dor anal',
      'irritação da pele',
      'sangramento',
    ],
    treatments: [
      'fistulotomia',
      'fistulectomia',
      'técnica LIFT',
      'uso de setons',
    ],
  })

  return (
    <>
      <EnhancedSEO
        title='Tratamento de Fístula Anal em João Pessoa - Dr. João Vítor Viana'
        description='Dr. João Vítor Viana, especialista em tratamento de fístula anal em João Pessoa/PB. Cirurgia de fístula perianal, fistulotomia, fistulectomia. Proctologista experiente.'
        keywords={[
          'fístula anal João Pessoa',
          'tratamento fístula anal João Pessoa',
          'cirurgia fístula anal João Pessoa',
          'médico fístula João Pessoa',
          'proctologista fístula João Pessoa',
          'fistulotomia João Pessoa',
          'fistulectomia João Pessoa',
          'fístula perianal João Pessoa',
          'abscesso anal João Pessoa',
          'drenagem abscesso João Pessoa',
        ]}
        structuredData={structuredData}
      />
      <div className='min-h-screen bg-black'>
        <Header currentPage='fistula-anal' />

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
                        d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
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
                      Fístula Anal
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
                    Especialista em{' '}
                    <span className='text-blue-400 font-bold'>
                      tratamento de fístula anal
                    </span>{' '}
                    em João Pessoa com
                    <span className='text-blue-400 font-bold'>
                      {' '}
                      técnicas cirúrgicas avançadas
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
            {/* Caixa única com todas as informações */}
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                O que é Fístula Anal?
              </h2>
              <p className='text-gray-300 mb-6 text-justify leading-relaxed'>
                A fístula anal é um túnel anormal que se forma entre o canal
                anal ou reto e a pele ao redor do ânus. Geralmente resulta de
                uma infecção prévia de uma glândula anal (abscesso anorretal)
                que não cicatrizou adequadamente, criando uma comunicação
                persistente.
              </p>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Tipos de Fístula Anal
              </h3>
              <div className='grid md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Fístula Simples
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Trajeto único, superficial, que não envolve músculos do
                    esfíncter anal. Geralmente de tratamento mais simples.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Fístula Complexa
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Envolve músculos do esfíncter, pode ter múltiplos trajetos
                    ou estar associada a doenças inflamatórias intestinais.
                  </p>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Sintomas da Fístula Anal
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Drenagem de pus ou secreção pela abertura externa</li>
                  <li>• Dor anal, especialmente durante evacuação</li>
                  <li>• Sangramento anal intermitente</li>
                  <li>• Coceira e irritação na região perianal</li>
                  <li>• Febre (quando há infecção ativa)</li>
                  <li>• Inchaço e vermelhidão ao redor do ânus</li>
                </ul>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Diagnóstico
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Exame físico detalhado da região perianal</li>
                  <li>• Anuscopia para visualização do orifício interno</li>
                  <li>• Ressonância magnética para mapeamento do trajeto</li>
                  <li>
                    • Ultrassom endoanal para caracterizar o trajeto, quando
                    necessário
                  </li>
                </ul>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Tratamento Cirúrgico
              </h3>
              <div className='grid md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Fistulotomia/Fistulectomia
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Abertura ou remoção do trajeto fistuloso indicada para
                    fístulas simples que não comprometem o esfíncter anal.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Técnicas Avançadas
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    LIFT (Ligadura Interesfincteriana do Trajeto Fistuloso) ou
                    retalho mucoso. Para fístulas complexas que preservam a
                    continência anal.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Passagem de Sedenho
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Pequeno dreno colocado através do trajeto fistuloso, com
                    indicação para preparo para cirurgia definitiva.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Laser
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Tratamento pela técnica de FiLaC, com laser de diodo,
                    evitando grandes ressecções e promovendo uma recuperação
                    mais rápida.
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
                    Especialista em cirurgias de fístula anal complexas
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Utilização de técnicas modernas preservadoras do esfíncter
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Avaliação criteriosa para escolha da melhor técnica
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Acompanhamento pós-operatório especializado
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>Atendimento em João Pessoa</p>
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

        <MedicalFAQ
          title='Perguntas Frequentes sobre Fístula Anal'
          faqs={fistulaAnalFAQs}
        />

        <CTASection
          title='Precisa tratar uma fístula anal?'
          subtitle='Agende sua consulta e receba o tratamento adequado com técnicas modernas'
        />

        <Footer />
      </div>
    </>
  )
}
