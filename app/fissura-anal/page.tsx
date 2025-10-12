import type { Metadata } from 'next'
import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import StructuredData from '../../components/seo/structured-data'
import MedicalFAQ, { fissuraAnalFAQs } from '../../components/ui/medical-faq'
import { CTASection } from '../../components/ui/call-to-action'

export const metadata: Metadata = {
  title: 'Tratamento de Fissura Anal em João Pessoa - Dr. João Vítor Viana',
  description:
    'Dr. João Vítor Viana, especialista em tratamento de fissura anal em João Pessoa/PB. Cirurgia de fissura, esfincterotomia lateral, tratamento conservador. Proctologista experiente.',
  keywords: [
    'fissura anal João Pessoa',
    'tratamento fissura anal João Pessoa',
    'cirurgia fissura anal João Pessoa',
    'médico fissura João Pessoa',
    'proctologista fissura João Pessoa',
    'esfincterotomia João Pessoa',
    'dor anal João Pessoa',
    'sangramento anal João Pessoa',
    'fissura crônica João Pessoa',
    'fissura aguda João Pessoa',
  ],
}

export default function FissuraAnalPage() {
  return (
    <>
      <StructuredData type='medicalCondition' />
      <div className='min-h-screen bg-black'>
        <Header currentPage='fissura-anal' />

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
                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
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
                      Fissura Anal
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
                    Tratamento especializado para fissura anal com
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
            {/* Container principal com todas as informações */}
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                O que é Fissura Anal?
              </h2>
              <p className='text-gray-300 mb-8 text-justify leading-relaxed'>
                A fissura anal é uma pequena ferida ou rachadura na mucosa que
                reveste o canal anal. É uma das causas mais comuns de dor anal
                intensa, especialmente durante e após a evacuação. Pode ser
                aguda (recente) ou crônica (persistente por mais de 6 semanas).
              </p>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Tipos de Fissura Anal
              </h3>
              <div className='grid md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Fissura Aguda
                  </h4>
                  <p className='text-gray-300 text-justify leading-relaxed'>
                    Ferida recente, com bordas regulares e fundo limpo.
                    Geralmente responde bem ao tratamento conservador.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Fissura Crônica
                  </h4>
                  <p className='text-gray-300 text-justify leading-relaxed'>
                    Ferida persistente com bordas fibróticas, presença de
                    plicoma e papila anal hipertrófica. Pode necessitar
                    cirurgia.
                  </p>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Sintomas Principais
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Dor anal intensa durante a evacuação</li>
                  <li>• Dor que persiste por horas após evacuar</li>
                  <li>
                    • Sangramento vermelho vivo nas fezes ou papel higiênico
                  </li>
                  <li>• Espasmo do músculo esfíncter anal</li>
                  <li>• Coceira e irritação anal</li>
                  <li>• Constipação por medo da dor</li>
                  <li>• Presença de plicoma (pele extra) na região</li>
                </ul>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Principais Causas
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Constipação intestinal e fezes endurecidas</li>
                  <li>• Diarreia frequente</li>
                  <li>• Doença de Crohn</li>
                  <li>• Trauma anal</li>
                  <li>• Hipertonia do esfíncter anal</li>
                  <li>• Infecções sexualmente transmissíveis</li>
                </ul>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Diagnóstico
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Inspeção da região anal</li>
                  <li>• Toque retal (quando tolerado e necessário)</li>
                  <li>• Avaliação da função esfincteriana</li>
                  <li>• Investigação de doenças associadas</li>
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
                  <p className='text-gray-300 text-justify leading-relaxed'>
                    Dieta rica em fibras, laxantes, banhos de assento, pomadas
                    anestésicas e relaxantes do esfíncter.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Toxina Botulínica
                  </h4>
                  <p className='text-gray-300 text-justify leading-relaxed'>
                    Injeção de toxina botulínica no esfíncter anal para reduzir
                    o espasmo e permitir a cicatrização da fissura.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Cirurgia (Esfincterotomia)
                  </h4>
                  <p className='text-gray-300 text-justify leading-relaxed'>
                    Cirurgia para dividir parcialmente o músculo esfíncter
                    interno, reduzindo a pressão e permitindo a cicatrização.
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
                    Especialista em tratamento de fissuras anais agudas e
                    crônicas
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Domínio de técnicas conservadoras e cirúrgicas
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Realização de toxina botulínica para fissuras
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Atendimento humanizado focado no alívio da dor
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

        <MedicalFAQ
          title='Perguntas Frequentes sobre Fissura Anal'
          faqs={fissuraAnalFAQs}
        />

        <CTASection
          title='Precisa tratar uma fissura anal?'
          subtitle='Agende sua consulta e receba o tratamento adequado com técnicas modernas'
        />

        <Footer />
      </div>
    </>
  )
}
