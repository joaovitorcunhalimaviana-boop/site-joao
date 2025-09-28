import { Metadata } from 'next'
import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import ReviewsSection from '../../components/reviews/reviews-section'
import StructuredData from '../../components/seo/structured-data'

export const metadata: Metadata = {
  title:
    'Dr. João Vitor Viana é Bom Médico? Veja as Avaliações Reais dos Pacientes',
  description:
    'Dr. João Vitor Viana tem boas avaliações? O que os pacientes falam sobre o tratamento? Veja depoimentos reais sobre hemorroidas, fissura anal e atendimento. Vale a pena consultar? Compartilhe sua experiência.',
  keywords:
    'dr joão vitor viana é bom médico, avaliações pacientes coloproctologista joão pessoa, depoimentos tratamento hemorroidas, reviews dr joão vitor viana, experiência consulta coloproctologia, recomendação médico joão pessoa, feedback pacientes',
  openGraph: {
    title: 'O que os Pacientes Falam do Dr. João Vitor Viana? Avaliações Reais',
    description:
      'Pacientes recomendam Dr. João Vitor Viana? Veja avaliações reais sobre tratamento de hemorroidas, fissura anal e atendimento em João Pessoa. Experiências e depoimentos verdadeiros.',
    url: 'https://drjoaovitorviana.com.br/avaliacoes',
    type: 'website',
  },
  alternates: {
    canonical: 'https://drjoaovitorviana.com.br/avaliacoes',
  },
}

export default function AvaliacoesPage() {
  return (
    <>
      <StructuredData type='faq' />
      <div className='min-h-screen bg-black'>
        <Header currentPage='avaliacoes' />

        <main>
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
                          d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
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
                      Avaliações dos
                      <span
                        className='block text-blue-400 mt-2'
                        style={{
                          display: 'block !important',
                          marginTop: '0.5rem !important',
                          fontSize: 'inherit !important',
                        }}
                      >
                        Pacientes
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
                      Veja o que nossos pacientes dizem sobre o atendimento e os
                      <span className='text-blue-400 font-bold'>
                        {' '}
                        resultados obtidos
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

          {/* Review Form Section */}
          <section className='bg-black py-16'>
            <ReviewsSection />
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
