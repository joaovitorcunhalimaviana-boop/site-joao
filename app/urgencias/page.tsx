import { Metadata } from 'next'
import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import BackgroundPattern from '../../components/ui/background-pattern'
import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title:
    'Tenho Hemorroida Inflamada, O que Fazer? Urgência Coloproctologia João Pessoa',
  description:
    'Estou com dor anal intensa, é urgência? Sangramento retal precisa de atendimento imediato? Dr. João Vitor Viana atende urgências de coloproctologia em João Pessoa. Como conseguir consulta urgente? Hemorroida trombosada, fissura anal dolorosa.',
  keywords:
    'urgência coloproctologia joão pessoa, hemorroida inflamada o que fazer, sangramento retal urgente, dor anal intensa, consulta urgência coloproctologista, dr joão vitor urgência, hemorroida trombosada, fissura anal dolorosa',
  openGraph: {
    title: 'Urgência em Coloproctologia - Dr. João Vitor Viana Atende',
    description:
      'Dor intensa ou sangramento retal? Dr. João Vitor Viana atende urgências de coloproctologia em João Pessoa. Hemorroidas inflamadas, fissuras anais e crises agudas.',
    url: 'https://drjoaovitorviana.com.br/urgencias',
    type: 'website',
  },
  alternates: {
    canonical: 'https://drjoaovitorviana.com.br/urgencias',
  },
}

export default function UrgenciasPage() {
  const whatsappNumber = '5583991221599'
  const whatsappMessage = encodeURIComponent(
    'Olá Dr. João Vítor! Preciso de uma consulta de urgência. Estou com dor/sangramento/crise e não posso esperar uma consulta normal.'
  )
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='urgencias' />
      <div className='py-12 pt-24'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='text-center mb-12'>
            <div className='flex items-center justify-center mb-4'>
              <ExclamationTriangleIcon className='h-12 w-12 text-red-500 mr-3' />
              <h1 className='text-4xl sm:text-6xl font-bold text-white'>
                Central de Urgências
              </h1>
            </div>
            <p className='text-lg text-gray-300 max-w-3xl mx-auto'>
              Dr. João Vítor Viana - Coloproctologista / Cirurgião Geral
            </p>
          </div>

          {/* Emergency Alert */}
          <div className='bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-12'>
            <div className='flex items-center mb-4'>
              <ExclamationTriangleIcon className='h-8 w-8 text-red-400 mr-3' />
              <h2 className='text-2xl lg:text-3xl font-bold text-red-400'>
                Atenção - Emergência Médica
              </h2>
            </div>
            <p className='text-gray-300 text-lg text-justify'>
              Em caso de emergência médica grave, ligue imediatamente para o{' '}
              <strong className='text-red-400'>SAMU (192)</strong> ou dirija-se
              ao pronto-socorro mais próximo.
            </p>
          </div>

          {/* Main Content */}
          <div className='max-w-4xl mx-auto'>
            {/* What is Urgent Consultation */}
            <div className='mb-16'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-8 text-center'>
                Consulta de Urgência
              </h2>
              <div className='grid md:grid-cols-2 gap-12 items-center'>
                <div>
                  <p className='text-gray-300 text-lg leading-relaxed mb-6 text-justify'>
                    A Consulta de Urgência é destinada para pacientes que não
                    podem esperar pelo agendamento regular e necessitam de
                    atendimento médico imediato devido a sintomas como dor
                    intensa, sangramento ou crises agudas.
                  </p>
                  <p className='text-gray-300 text-lg leading-relaxed text-justify'>
                    Este serviço permite que você seja atendido fora do horário
                    comercial normal, garantindo cuidado especializado quando
                    mais precisa.
                  </p>
                </div>
                <div className='flex justify-center'>
                  <div className='bg-gradient-to-br from-red-500/20 to-orange-500/20 p-8 rounded-2xl'>
                    <ClockIcon className='h-32 w-32 text-red-400 mx-auto' />
                  </div>
                </div>
              </div>
            </div>

            {/* When to Use */}
            <div className='mb-16'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-8 text-center'>
                Quando Procurar a Consulta de Urgência
              </h2>
              <div className='grid md:grid-cols-2 gap-8'>
                <div className='space-y-6'>
                  <div className='border border-gray-700 rounded-lg p-6'>
                    <h3 className='text-xl font-semibold text-white mb-3'>
                      Dor Intensa
                    </h3>
                    <p className='text-gray-300 text-lg text-justify'>
                      Fissuras anais muito dolorosas, dores abdominais intensas
                      ou qualquer dor que impeça suas atividades normais.
                    </p>
                  </div>
                  <div className='border border-gray-700 rounded-lg p-6'>
                    <h3 className='text-xl font-semibold text-white mb-3'>
                      Crises de Hemorroidas
                    </h3>
                    <p className='text-gray-300 text-lg text-justify'>
                      Trombose hemorroidária, hemorroidas inflamadas ou qualquer
                      complicação que cause desconforto severo.
                    </p>
                  </div>
                </div>
                <div className='space-y-6'>
                  <div className='border border-gray-700 rounded-lg p-6'>
                    <h3 className='text-xl font-semibold text-white mb-3'>
                      Sangramento
                    </h3>
                    <p className='text-gray-300 text-lg text-justify'>
                      Sangramento retal persistente, sangue nas fezes ou
                      qualquer sangramento que cause preocupação.
                    </p>
                  </div>
                  <div className='border border-gray-700 rounded-lg p-6'>
                    <h3 className='text-xl font-semibold text-white mb-3'>
                      Não Pode Esperar
                    </h3>
                    <p className='text-gray-300 text-lg text-justify'>
                      Situações onde aguardar uma consulta regular não é uma
                      opção viável.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing and Process */}
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
                    Envie uma mensagem pelo WhatsApp explicando sua situação de
                    urgência
                  </p>
                </div>
                <div className='text-center bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50'>
                  <div className='bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4'>
                    <span className='text-white font-bold text-lg'>2</span>
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-3'>
                    Agendamento Rápido
                  </h3>
                  <p className='text-gray-300 text-lg text-justify'>
                    Combinamos um horário fora da agenda normal para atendê-lo
                    no consultório
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
                    Receba o cuidado médico que precisa sem esperar pela agenda
                    regular
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className='text-center'>
              <h2 className='text-2xl lg:text-3xl font-bold text-white mb-4'>
                Precisa de uma Consulta de Urgência?
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
                Solicitar Consulta de Urgência
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
