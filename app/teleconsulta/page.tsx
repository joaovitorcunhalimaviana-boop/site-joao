'use client'

import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import BackgroundPattern from '../../components/ui/background-pattern'
import {
  VideoCameraIcon,
  PhoneIcon,
  ClockIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const TeleconsultaPage = () => {
  const whatsappNumber = '5583991221599'
  const whatsappMessage =
    'Olá! Gostaria de agendar uma teleconsulta com o Dr. João Vítor Viana.'
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='teleconsulta' />

      <main className='pt-20'>
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
        <div className='py-24 sm:py-32 lg:pb-40'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            {/* Hero Section */}
            <div className='mx-auto max-w-2xl text-center'>
              <VideoCameraIcon className='mx-auto h-16 w-16 text-gray-400 mb-6' />
              <h1 className='text-4xl font-bold tracking-tight text-white sm:text-6xl'>
                Teleconsulta
              </h1>
              <p className='mt-6 text-lg leading-8 text-gray-300 text-justify'>
                Atendimento médico especializado no conforto da sua casa através
                de videochamadas, mantendo a mesma qualidade e cuidado do
                atendimento presencial.
              </p>
            </div>

            {/* O que é Teleconsulta */}
            <div className='mt-32'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-12 text-center'>
                O que é a Teleconsulta?
              </h2>
              <div className='grid md:grid-cols-2 gap-12 items-center'>
                <div>
                  <p className='text-gray-300 text-lg leading-relaxed mb-6 text-justify'>
                    A teleconsulta é uma modalidade de atendimento médico
                    realizada através de videochamadas, permitindo que você
                    receba cuidados especializados em Coloproctologia e Cirurgia
                    Geral sem sair de casa.
                  </p>
                  <p className='text-gray-300 text-lg leading-relaxed text-justify'>
                    Este formato oferece a mesma qualidade de atendimento
                    presencial, com a vantagem da comodidade e segurança do seu
                    lar, sendo ideal para consultas de acompanhamento,
                    orientações médicas e avaliações que não necessitem de exame
                    físico.
                  </p>
                </div>
                <div className='flex justify-center'>
                  <div className='bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-8 rounded-2xl'>
                    <VideoCameraIcon className='h-32 w-32 text-blue-400 mx-auto' />
                  </div>
                </div>
              </div>
            </div>

            {/* Vantagens */}
            <div className='mt-32'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-12 text-center'>
                Vantagens da Teleconsulta
              </h2>
              <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
                <div className='text-center bg-blue-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-700/30'>
                  <VideoCameraIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-white mb-2'>
                    Comodidade
                  </h3>
                  <p className='text-gray-300 text-lg'>
                    Atendimento no conforto da sua casa
                  </p>
                </div>
                <div className='text-center bg-blue-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-700/30'>
                  <ClockIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-white mb-2'>
                    Flexibilidade
                  </h3>
                  <p className='text-gray-300 text-lg'>
                    Horários adaptados à sua rotina
                  </p>
                </div>
                <div className='text-center bg-blue-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-700/30'>
                  <ShieldCheckIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-white mb-2'>
                    Segurança
                  </h3>
                  <p className='text-gray-300 text-lg'>
                    Evita deslocamentos desnecessários
                  </p>
                </div>
                <div className='text-center bg-blue-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-700/30'>
                  <PhoneIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-white mb-2'>
                    Acessibilidade
                  </h3>
                  <p className='text-gray-300 text-lg'>
                    Fácil acesso através de dispositivos móveis
                  </p>
                </div>
              </div>
            </div>

            {/* Como marcar uma teleconsulta */}
            <div className='mt-32'>
              <div className='max-w-2xl mx-auto'>
                <div className='bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50'>
                  <h3 className='text-xl font-bold text-white mb-6 text-center'>
                    Como faço para marcar uma teleconsulta?
                  </h3>
                  <div className='text-center'>
                    <p className='text-gray-300 text-lg mb-4'>
                      Quer marcar uma teleconsulta? Entre em contato com nossa equipe.
                    </p>
                    <p className='text-blue-400 text-lg font-semibold mb-6'>
                      Nossa equipe está pronta para atendê-lo e esclarecer todas as suas dúvidas.
                    </p>
                    
                    {/* Botão WhatsApp */}
                    <a
                      href={whatsappLink}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg mb-4'
                    >
                      <svg
                        className='w-5 h-5 mr-2'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                      </svg>
                      Entrar em Contato via WhatsApp
                    </a>
                  </div>

                  {/* Observação Importante */}
                  <div className='bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mt-6'>
                    <div className='text-center'>
                      <p className='text-yellow-200 text-sm font-medium mb-1 flex items-center justify-center'>
                        <svg
                          className='w-5 h-5 text-yellow-400 mr-2 flex-shrink-0'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                          />
                        </svg>
                        Observação Importante:
                      </p>
                      <p className='text-yellow-100 text-lg'>
                        Pacientes que necessitam de exame físico devem agendar
                        consulta presencial, pois a teleconsulta não permite
                        avaliação física adequada.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Como Funciona */}
            <div className='mt-32'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-12 text-center'>
                Como Funciona
              </h2>
              <div className='grid md:grid-cols-3 gap-8'>
                <div className='text-center bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50'>
                  <div className='bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4'>
                    <span className='text-white font-bold text-lg'>1</span>
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-3'>
                    Entre em Contato
                  </h3>
                  <p className='text-gray-300 text-lg text-justify'>
                    Clique no botão do WhatsApp abaixo para iniciar uma conversa
                    conosco
                  </p>
                </div>
                <div className='text-center bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50'>
                  <div className='bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4'>
                    <span className='text-white font-bold text-lg'>2</span>
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-3'>
                    Agende seu Horário
                  </h3>
                  <p className='text-gray-300 text-lg text-justify'>
                    Combinamos um horário que seja conveniente para você e para
                    o médico
                  </p>
                </div>
                <div className='text-center bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50'>
                  <div className='bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4'>
                    <span className='text-white font-bold text-lg'>3</span>
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-3'>
                    Realize a Consulta
                  </h3>
                  <p className='text-gray-300 text-lg text-justify'>
                    No horário marcado, você receberá o link da videochamada
                    para a consulta
                  </p>
                </div>
              </div>
            </div>



            {/* Call to Action */}
            <div className='mt-32 text-center'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-4'>
                Precisa de uma Teleconsulta?
              </h2>
              <p className='text-xl text-gray-300 mb-8 text-center'>
                Entre em contato conosco pelo WhatsApp para agendar sua
                teleconsulta em um horário conveniente
              </p>
              <a
                href={whatsappLink}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg'
              >
                <svg
                  className='w-6 h-6 mr-3'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                </svg>
                Agendar via WhatsApp
              </a>
              <p className='text-gray-400 mt-4 text-lg'>
                WhatsApp: (83) 9 9122-1599
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default TeleconsultaPage
