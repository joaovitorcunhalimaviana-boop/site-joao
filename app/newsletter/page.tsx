'use client'

import Header from '@/components/ui/header'
import Footer from '@/components/ui/footer'
import BackgroundPattern from '@/components/ui/background-pattern'
import NewsletterSignup from '@/components/newsletter/newsletter-signup'
import { Mail, Heart, Calendar, Gift } from 'lucide-react'

export default function NewsletterPage() {
  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='newsletter' />

      <div className='relative isolate'>
        {/* Hero Section */}
        <div className='pt-32 pb-16'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='mx-auto max-w-2xl text-center'>
              <div className='flex justify-center mb-6'>
                <div className='p-4 bg-blue-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20'>
                  <Mail className='w-12 h-12 text-blue-400' />
                </div>
              </div>

              <h1 className='text-4xl font-bold tracking-tight text-white sm:text-6xl'>
                Newsletter da Clínica
              </h1>

              <p className='mt-6 text-lg leading-8 text-gray-300'>
                Mantenha-se informado sobre sua saúde com nossas dicas
                exclusivas, novidades sobre tratamentos e informações
                importantes sobre nossos serviços.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className='py-16'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='mx-auto max-w-2xl text-center mb-12'>
              <h2 className='text-3xl font-bold text-white mb-4'>
                O que você receberá
              </h2>
              <p className='text-gray-300'>
                Conteúdo exclusivo e personalizado para cuidar melhor da sua
                saúde
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
              <div className='text-center'>
                <div className='flex justify-center mb-4'>
                  <div className='p-3 bg-green-500/10 backdrop-blur-sm rounded-xl border border-green-500/20'>
                    <Heart className='w-8 h-8 text-green-400' />
                  </div>
                </div>
                <h3 className='text-xl font-semibold text-white mb-2'>
                  Dicas de Saúde
                </h3>
                <p className='text-gray-300'>
                  Conselhos práticos e atualizados sobre prevenção, alimentação
                  saudável e bem-estar geral.
                </p>
              </div>

              <div className='text-center'>
                <div className='flex justify-center mb-4'>
                  <div className='p-3 bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20'>
                    <Calendar className='w-8 h-8 text-blue-400' />
                  </div>
                </div>
                <h3 className='text-xl font-semibold text-white mb-2'>
                  Lembretes Importantes
                </h3>
                <p className='text-gray-300'>
                  Notificações sobre consultas, exames e acompanhamentos médicos
                  personalizados.
                </p>
              </div>

              <div className='text-center'>
                <div className='flex justify-center mb-4'>
                  <div className='p-3 bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20'>
                    <Gift className='w-8 h-8 text-purple-400' />
                  </div>
                </div>
                <h3 className='text-xl font-semibold text-white mb-2'>
                  Ofertas Exclusivas
                </h3>
                <p className='text-gray-300'>
                  Promoções especiais em tratamentos e descontos exclusivos para
                  assinantes.
                </p>
              </div>
            </div>

            {/* Newsletter Signup Form */}
            <div className='flex justify-center'>
              <div className='w-full max-w-md'>
                <NewsletterSignup
                  variant='default'
                  title='Inscreva-se Agora'
                  description='Junte-se a centenas de pacientes que já recebem nosso conteúdo exclusivo.'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className='py-16 border-t border-gray-800'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='mx-auto max-w-2xl text-center'>
              <h2 className='text-2xl font-bold text-white mb-4'>
                Sua privacidade é nossa prioridade
              </h2>
              <p className='text-gray-300 mb-8'>
                Seus dados estão seguros conosco. Não compartilhamos suas
                informações com terceiros e você pode cancelar sua inscrição a
                qualquer momento.
              </p>

              <div className='flex flex-wrap justify-center gap-4 text-sm text-gray-400'>
                <span className='flex items-center'>✓ Sem spam</span>
                <span className='flex items-center'>✓ Cancelamento fácil</span>
                <span className='flex items-center'>✓ Dados protegidos</span>
                <span className='flex items-center'>✓ Conteúdo relevante</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
