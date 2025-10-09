import { Metadata } from 'next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import Header from '../../components/ui/header'
import BackgroundPattern from '../../components/ui/background-pattern'
import ContatoFAQ from '../../components/ui/contato-faq'
import StructuredData from '../../components/seo/structured-data'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title:
    'Como Entrar em Contato com Dr. João Vitor Viana? WhatsApp e Agendamento',
  description:
    'Como agendar consulta com Dr. João Vitor Viana? Qual o WhatsApp do coloproctologista? Onde fica o consultório em João Pessoa? Telefone, endereço e formas de contato. Agendamento online 24h disponível.',
  keywords:
    'whatsapp dr joão vitor viana, telefone coloproctologista joão pessoa, como agendar consulta, contato médico joão pessoa, endereço consultório, agendamento online coloproctologista, telefone dr joão vitor',
  openGraph: {
    title: 'Como Falar com Dr. João Vitor Viana? Contato e Agendamento',
    description:
      'Precisa falar com Dr. João Vitor Viana? Veja WhatsApp, telefone, endereço do consultório em João Pessoa e como agendar sua consulta online.',
    url: 'https://drjoaovitorviana.com.br/contato',
    type: 'website',
  },
  alternates: {
    canonical: 'https://drjoaovitorviana.com.br/contato',
  },
}

export default function ContatoPage() {
  return (
    <>
      <StructuredData type='faq' />
      <div className='min-h-screen bg-black'>
        <BackgroundPattern />
        <Header currentPage='contato' />
        <div className='pt-32 pb-12'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
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
                    d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
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
                Entre em
                <span
                  className='block text-blue-400 mt-2'
                  style={{
                    display: 'block !important',
                    marginTop: '0.5rem !important',
                    fontSize: 'inherit !important',
                  }}
                >
                  Contato
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
                Fale conosco através dos nossos canais de atendimento e
                <span className='text-blue-400 font-bold'>
                  {' '}
                  tire suas dúvidas
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

          {/* Contact Information */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {/* Email Card */}
              <Card className='bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors flex flex-col h-full'>
                <CardHeader className='text-center'>
                  <div
                    className='mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4'
                    style={{
                      background:
                        'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    }}
                  >
                    <Mail className='h-6 w-6 text-white' />
                  </div>
                  <CardTitle className='text-xl font-semibold text-white'>
                    E-mail
                  </CardTitle>
                  <CardDescription className='text-lg text-gray-300'>
                    Entre em contato por e-mail
                  </CardDescription>
                </CardHeader>
                <CardContent className='text-center flex-1 flex flex-col justify-between'>
                  <p className='text-lg text-gray-300 mb-4 break-all'>
                    joaovitorvianacoloprocto@gmail.com
                  </p>
                  <a
                    href='mailto:joaovitorvianacoloprocto@gmail.com'
                    className='w-full text-white mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2'
                    style={{
                      background:
                        'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                      border: '1px solid #475569',
                    }}
                  >
                    Enviar E-mail
                  </a>
                </CardContent>
              </Card>

              {/* WhatsApp Card */}
              <Card className='bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors flex flex-col h-full'>
                <CardHeader className='text-center'>
                  <div
                    className='mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4'
                    style={{
                      background:
                        'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    }}
                  >
                    <MessageCircle className='h-6 w-6 text-white' />
                  </div>
                  <CardTitle className='text-xl font-semibold text-white'>
                    WhatsApp
                  </CardTitle>
                  <CardDescription className='text-lg text-gray-300'>
                    Atendimento pela equipe - Responde a qualquer horário
                  </CardDescription>
                </CardHeader>
                <CardContent className='text-center flex-1 flex flex-col justify-between'>
                  <div>
                    <p className='text-lg text-gray-300 mb-2'>
                      (83) 9 9122-1599
                    </p>
                    <p className='text-lg text-gray-400 mb-4'>
                      Atendido pela secretária
                    </p>
                  </div>
                  <a
                    href='https://wa.me/5583991221599'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full text-white mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2'
                    style={{
                      background:
                        'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                      border: '1px solid #475569',
                    }}
                  >
                    Falar com a Equipe
                  </a>
                </CardContent>
              </Card>

              {/* Telefone Card */}
              <Card className='bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors flex flex-col h-full'>
                <CardHeader className='text-center'>
                  <div
                    className='mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4'
                    style={{
                      background:
                        'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    }}
                  >
                    <Phone className='h-6 w-6 text-white' />
                  </div>
                  <CardTitle className='text-xl font-semibold text-white'>
                    Telefone
                  </CardTitle>
                  <CardDescription className='text-lg text-gray-300'>
                    Fale com o consultório
                  </CardDescription>
                </CardHeader>
                <CardContent className='text-center flex-1 flex flex-col justify-between'>
                  <div>
                    <p className='text-lg text-gray-300 mb-2'>(83) 3225-1747</p>
                    <p className='text-lg text-gray-400 mb-4'>
                      Segunda a Sexta: 14h às 18h
                    </p>
                  </div>
                  <a
                    href='tel:+558332251747'
                    className='w-full text-white mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2'
                    style={{
                      background:
                        'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                      border: '1px solid #475569',
                    }}
                  >
                    Ligar Agora
                  </a>
                </CardContent>
              </Card>

              {/* Instagram Card */}
              <Card className='bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors flex flex-col h-full'>
                <CardHeader className='text-center'>
                  <div
                    className='mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4'
                    style={{
                      background:
                        'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    }}
                  >
                    <svg
                      className='h-6 w-6 text-white'
                      fill='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                    </svg>
                  </div>
                  <CardTitle className='text-xl font-semibold text-white'>
                    Instagram
                  </CardTitle>
                  <CardDescription className='text-lg text-gray-300'>
                    Siga para dicas de saúde
                  </CardDescription>
                </CardHeader>
                <CardContent className='text-center flex-1 flex flex-col justify-between'>
                  <div>
                    <p className='text-lg text-gray-300 mb-2'>
                      @drjoaovitorviana
                    </p>
                    <p className='text-lg text-gray-400 mb-4'>
                      Conteúdo educativo sobre coloproctologia
                    </p>
                  </div>
                  <a
                    href='https://instagram.com/drjoaovitorviana'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full text-white mt-auto inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2'
                    style={{
                      background:
                        'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                      border: '1px solid #475569',
                    }}
                  >
                    Seguir no Instagram
                  </a>
                </CardContent>
              </Card>
            </div>

            <ContatoFAQ />

            {/* Footer com Endereço */}
            <footer className='mt-16 pt-8 border-t border-gray-700'>
              <div className='text-center'>
                <div className='flex items-center justify-center mb-4'>
                  <MapPin className='h-6 w-6 text-blue-400 mr-2' />
                  <h3 className='text-xl font-semibold text-white'>
                    Localização do Consultório
                  </h3>
                </div>
                <div className='text-gray-300 space-y-1'>
                  <p className='text-lg'>Avenida Rui Barbosa, 484</p>
                  <p className='text-lg'>Edifício Arcádia, Sala 101 - Torre</p>
                  <p className='text-lg'>João Pessoa - PB</p>
                </div>
                <div className='mt-4'>
                  <a
                    href='https://maps.google.com/?q=Avenida+Rui+Barbosa,+484,+Edifício+Arcádia,+Sala+101,+Torre'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 py-2 text-white'
                    style={{
                      background:
                        'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                      border: '1px solid #475569',
                    }}
                  >
                    <MapPin className='h-4 w-4 mr-2' />
                    Ver no Google Maps
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  )
}
