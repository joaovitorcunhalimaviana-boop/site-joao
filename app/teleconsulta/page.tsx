import { Metadata } from 'next'
import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import BackgroundPattern from '../../components/ui/background-pattern'
import { VideoCameraIcon, ClockIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Teleconsulta com Coloproctologista - Dr. João Vítor Viana',
  description:
    'Consulta online com coloproctologista em João Pessoa. Dr. João Vítor Viana oferece teleconsulta para avaliação, orientação e acompanhamento de doenças do aparelho digestivo baixo.',
  keywords:
    'teleconsulta coloproctologista, consulta online joão pessoa, telemedicina coloproctologia, dr joão vítor viana online, consulta virtual proctologista',
  openGraph: {
    title: 'Teleconsulta - Dr. João Vítor Viana Coloproctologista',
    description:
      'Consulta online com especialista em coloproctologia. Atendimento por videoconferência com a mesma qualidade da consulta presencial.',
    url: 'https://drjoaovitorviana.com.br/teleconsulta',
    type: 'website',
  },
  alternates: {
    canonical: 'https://drjoaovitorviana.com.br/teleconsulta',
  },
}

export default function TeleconsultaPage() {
  const whatsappNumber = '5583991221599'
  const whatsappMessage = encodeURIComponent(
    'Olá Dr. João Vítor! Gostaria de agendar uma teleconsulta. Poderia me informar sobre disponibilidade e como funciona?'
  )
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='teleconsulta' />
      <div className='pt-32 pb-12'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='text-center mb-12'>
            <div className='flex items-center justify-center mb-4'>
              <VideoCameraIcon className='h-12 w-12 text-blue-500 mr-3' />
              <h1 className='text-4xl sm:text-6xl font-bold text-white'>
                Teleconsulta
              </h1>
            </div>
            <p className='text-lg text-gray-300 max-w-3xl mx-auto'>
              Dr. João Vítor Viana - Coloproctologista / Cirurgião Geral
            </p>
          </div>

          {/* Main Content */}
          <div className='max-w-4xl mx-auto'>
            {/* What is Teleconsulta */}
            <div className='mb-16'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-8 text-center'>
                O que é a Teleconsulta?
              </h2>
              <div className='grid md:grid-cols-2 gap-12 items-center'>
                <div>
                  <p className='text-gray-300 text-lg leading-relaxed mb-6 text-justify'>
                    A teleconsulta é uma modalidade de atendimento médico realizada por videoconferência, 
                    permitindo consultas à distância com a mesma qualidade e cuidado de uma consulta presencial.
                  </p>
                  <p className='text-gray-300 text-lg leading-relaxed text-justify'>
                    Ideal para orientações, acompanhamentos, discussão de exames e situações que não 
                    requerem exame físico direto.
                  </p>
                </div>
                <div className='flex justify-center'>
                  <div className='bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-8 rounded-2xl'>
                    <VideoCameraIcon className='h-32 w-32 text-blue-400 mx-auto' />
                  </div>
                </div>
              </div>
            </div>

            {/* Vantagens da Teleconsulta */}
            <div className='mb-16'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-8 text-center'>
                Vantagens da Teleconsulta
              </h2>
              <div className='grid md:grid-cols-2 gap-8'>
                <div className='space-y-6'>
                  <div className='border border-gray-700 rounded-lg p-6'>
                    <div className='flex items-center mb-3'>
                      <ClockIcon className='h-6 w-6 text-blue-400 mr-3' />
                      <h3 className='text-xl font-semibold text-white'>
                        Comodidade
                      </h3>
                    </div>
                    <p className='text-gray-300 text-lg text-justify'>
                      Atendimento no conforto da sua casa, sem necessidade de deslocamento 
                      ou tempo de espera em consultório.
                    </p>
                  </div>
                  <div className='border border-gray-700 rounded-lg p-6'>
                    <div className='flex items-center mb-3'>
                      <ShieldCheckIcon className='h-6 w-6 text-blue-400 mr-3' />
                      <h3 className='text-xl font-semibold text-white'>
                        Segurança
                      </h3>
                    </div>
                    <p className='text-gray-300 text-lg text-justify'>
                      Plataforma segura e privada, garantindo a confidencialidade 
                      das informações médicas.
                    </p>
                  </div>
                </div>
                <div className='space-y-6'>
                  <div className='border border-gray-700 rounded-lg p-6'>
                    <div className='flex items-center mb-3'>
                      <ClockIcon className='h-6 w-6 text-blue-400 mr-3' />
                      <h3 className='text-xl font-semibold text-white'>
                        Flexibilidade
                      </h3>
                    </div>
                    <p className='text-gray-300 text-lg text-justify'>
                      Horários mais flexíveis, incluindo possibilidade de atendimento 
                      em horários alternativos.
                    </p>
                  </div>
                  <div className='border border-gray-700 rounded-lg p-6'>
                    <div className='flex items-center mb-3'>
                      <UserGroupIcon className='h-6 w-6 text-blue-400 mr-3' />
                      <h3 className='text-xl font-semibold text-white'>
                        Humanização
                      </h3>
                    </div>
                    <p className='text-gray-300 text-lg text-justify'>
                      Atendimento personalizado e humanizado, mantendo a qualidade 
                      do cuidado médico especializado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Como marcar */}
            <div className='mb-16'>
              <div className='bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50'>
                <h2 className='text-2xl lg:text-3xl font-bold text-white mb-6 text-center'>
                  Como faço para marcar uma teleconsulta?
                </h2>
                <p className='text-gray-300 text-lg leading-relaxed mb-8 text-center'>
                  Quer marcar uma teleconsulta? Entre em contato com nossa equipe.
                </p>
                <div className='text-center'>
                  <a
                    href={whatsappLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg'
                  >
                    <svg
                      className='w-6 h-6 mr-3'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                    </svg>
                    Agendar Teleconsulta
                  </a>
                </div>
                <div className='mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30'>
                  <p className='text-blue-300 text-sm text-center'>
                    <strong>Observação Importante:</strong> A teleconsulta não substitui completamente 
                    a consulta presencial em casos que necessitem exame físico detalhado.
                  </p>
                </div>
              </div>
            </div>

            {/* Como Funciona */}
            <div className='mb-16'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-8 text-center'>
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
                    Envie uma mensagem pelo WhatsApp solicitando uma teleconsulta
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
                    Combinamos um horário conveniente e enviamos o link da videoconferência
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
                    Participe da consulta online com a mesma qualidade do atendimento presencial
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className='text-center'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-4'>
                Precisa de uma Teleconsulta?
              </h2>
              <p className='text-xl text-gray-300 mb-8 text-justify'>
                Entre em contato pelo WhatsApp e explique sua situação. Vamos
                encontrar um horário para atendê-lo o mais rápido possível.
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
                Solicitar Teleconsulta
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
