'use client'

import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import BackgroundPattern from '../../components/ui/background-pattern'
import { MapPinIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function VisitasDomiciliaresPage() {
  const whatsappNumber = '5583991221599'
  const whatsappMessage = encodeURIComponent(
    'Olá Dr. João Vítor! Gostaria de agendar uma visita domiciliar. Preciso de atendimento em casa.'
  )
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='visitas-domiciliares' />
      <div className='py-12'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='text-center mb-12'>
            <div className='flex items-center justify-center mb-4'>
              <HomeIcon className='h-12 w-12 text-gray-400 mr-3' />
              <h1 className='text-4xl sm:text-6xl font-bold text-white'>
                Visitas Domiciliares
              </h1>
            </div>
            <p className='text-lg text-gray-300 max-w-3xl mx-auto'>
              Dr. João Vítor Viana - Coloproctologista / Cirurgião Geral
            </p>
          </div>

          {/* Main Content */}
          <div className='max-w-4xl mx-auto'>
            {/* What is Home Visit */}
            <div className='mb-16'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-8 text-center'>
                O que é a Visita Domiciliar?
              </h2>
              <div className='grid md:grid-cols-2 gap-12 items-center'>
                <div>
                  <p className='text-gray-300 text-lg leading-relaxed mb-6 text-justify'>
                    A Visita Domiciliar é um atendimento médico especializado
                    realizado no conforto e segurança da sua casa ou ambiente
                    hospitalar, oferecendo cuidados personalizados em
                    Coloproctologia e Cirurgia Geral.
                  </p>
                  <p className='text-gray-300 text-lg leading-relaxed text-justify'>
                    Este serviço é ideal para pacientes com dificuldade de
                    locomoção, pós-operatório, ou que necessitam de
                    acompanhamento médico especializado em ambiente familiar.
                  </p>
                </div>
                <div className='flex justify-center'>
                  <div className='bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-8 rounded-2xl'>
                    <HomeIcon className='h-32 w-32 text-blue-400 mx-auto' />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Services */}
            <div className='mb-16'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-8 text-center'>
                Serviços Disponíveis
              </h2>
              <div className='grid md:grid-cols-2 gap-8'>
                <div className='border border-gray-700 rounded-lg p-6'>
                  <h3 className='text-xl font-semibold text-white mb-3'>
                    Consulta Domiciliar
                  </h3>
                  <p className='text-gray-300 text-lg text-justify'>
                    Atendimento médico completo no conforto da sua casa,
                    incluindo avaliação clínica, orientações e prescrições
                    médicas especializadas.
                  </p>
                </div>
                <div className='border border-gray-700 rounded-lg p-6'>
                  <h3 className='text-xl font-semibold text-white mb-3'>
                    Consulta Hospitalar
                  </h3>
                  <p className='text-gray-300 text-lg text-justify'>
                    Atendimento especializado em ambiente hospitalar para
                    pacientes internados que necessitam de avaliação
                    coloproctológica ou cirúrgica.
                  </p>
                </div>
              </div>
            </div>

            {/* Coverage Areas */}
            <div className='mb-16'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-8 text-center'>
                Área de Atendimento
              </h2>
              <div className='flex justify-center'>
                <div className='border border-gray-700 rounded-lg p-6 text-center max-w-md'>
                  <MapPinIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-white mb-3'>
                    João Pessoa - Capital
                  </h3>
                  <p className='text-gray-300 text-lg text-justify'>
                    Atendimento disponível em toda a capital paraibana.
                    Agendamento flexível conforme disponibilidade da agenda.
                  </p>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className='mb-16'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-8 text-center'>
                Como Funciona
              </h2>
              <div className='grid md:grid-cols-3 gap-8 mb-8'>
                <div className='text-center bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50'>
                  <div className='bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4'>
                    <span className='text-white font-bold text-lg'>1</span>
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-3'>
                    Entre em Contato
                  </h3>
                  <p className='text-gray-300 text-lg text-justify'>
                    Envie uma mensagem pelo WhatsApp informando a necessidade de
                    visita domiciliar
                  </p>
                </div>
                <div className='text-center bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50'>
                  <div className='bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4'>
                    <span className='text-white font-bold text-lg'>2</span>
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-3'>
                    Confirme Horário e Endereço
                  </h3>
                  <p className='text-gray-300 text-lg text-justify'>
                    Combinamos data, horário e confirmamos o endereço para o
                    atendimento
                  </p>
                </div>
                <div className='text-center bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50'>
                  <div className='bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4'>
                    <span className='text-white font-bold text-lg'>3</span>
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-3'>
                    Atendimento Especializado
                  </h3>
                  <p className='text-gray-300 text-lg text-justify'>
                    Receba o cuidado médico personalizado no local combinado
                  </p>
                </div>
              </div>

              <div className='bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700 rounded-lg p-8'>
                <div className='text-center'>
                  <h3 className='text-xl font-bold text-white mb-4'>
                    Investimento
                  </h3>
                  <div className='text-center'>
                    <p className='text-3xl font-bold text-white mb-2'>R$ 800</p>
                    <p className='text-gray-400 text-lg'>
                      Valor único por visita
                    </p>
                  </div>
                  <p className='text-gray-400 text-lg mt-4 text-center'>
                    O tempo de atendimento varia conforme a complexidade do
                    caso, priorizando sempre a qualidade do cuidado
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className='text-center'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-4'>
                Precisa de uma Visita Domiciliar?
              </h2>
              <p className='text-xl text-gray-300 mb-8 text-center'>
                Entre em contato pelo WhatsApp e informe sua necessidade. Vamos
                agendar o melhor horário para atendê-lo.
              </p>
              <a
                href={whatsappLink}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg'
              >
                <svg
                  className='w-6 h-6 mr-3'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                </svg>
                Solicitar Visita Domiciliar
              </a>
              <p className='text-gray-400 text-lg mt-4'>
                WhatsApp: (83) 9 9122-1599
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
