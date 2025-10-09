import type { Metadata } from 'next'
import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import StructuredData from '../../components/seo/structured-data'
import MedicalFAQ, {
  cancerColorretalFAQs,
} from '../../components/ui/medical-faq'

export const metadata: Metadata = {
  title:
    'Tratamento de Câncer Colorretal em João Pessoa - Dr. João Vítor Viana',
  description:
    'Dr. João Vítor Viana, especialista em tratamento de câncer colorretal em João Pessoa/PB. Cirurgia oncológica por videolaparoscopia, ressecção de tumores colorretais. Proctologista experiente.',
  keywords: [
    'câncer colorretal João Pessoa',
    'tratamento câncer colorretal João Pessoa',
    'cirurgia câncer colorretal João Pessoa',
    'oncologia colorretal João Pessoa',
    'proctologista câncer João Pessoa',
    'videolaparoscopia câncer colorretal João Pessoa',
    'ressecção colorretal João Pessoa',
    'tumor colorretal João Pessoa',
    'câncer intestino João Pessoa',
    'cirurgia oncológica João Pessoa',
  ],
}

export default function CancerColorretalPage() {
  return (
    <>
      <StructuredData type='medicalCondition' />
      <div className='min-h-screen bg-black'>
        <Header currentPage='cancer-colorretal' />

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
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
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
                    Prevenção e Tratamento
                    <span
                      className='block text-blue-400 mt-2'
                      style={{
                        display: 'block !important',
                        marginTop: '0.5rem !important',
                        fontSize: 'inherit !important',
                      }}
                    >
                      Câncer Colorretal
                    </span>
                  </h1>
                  <p
                    className='text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'
                    style={{
                      fontSize: '1.25rem !important',
                      lineHeight: '1.75 !important',
                      maxWidth: '48rem !important',
                    }}
                  >
                    Tratamento especializado para câncer colorretal com
                    <span className='text-blue-400 font-bold'>
                      {' '}
                      abordagem multidisciplinar e cuidado humanizado
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
                O que é Câncer Colorretal?
              </h2>
              <p className='text-gray-300 mb-6 text-justify'>
                O câncer colorretal é uma neoplasia maligna que se desenvolve no
                intestino grosso (cólon) ou no reto. É o terceiro tipo de câncer
                mais comum no Brasil e uma das principais causas de morte por
                câncer no mundo. O diagnóstico precoce e o tratamento adequado
                são fundamentais para o sucesso terapêutico.
              </p>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Tipos de Câncer Colorretal
              </h3>
              <div className='grid md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Câncer de Cólon
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Tumor maligno que se desenvolve no intestino grosso, podendo
                    afetar diferentes segmentos como cólon ascendente,
                    transverso, descendente ou sigmoide.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Câncer de Reto
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Neoplasia maligna localizada nos últimos 15 cm do intestino
                    grosso, requerendo abordagem cirúrgica especializada e
                    técnicas específicas.
                  </p>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Sintomas do Câncer Colorretal
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Sangramento nas fezes ou sangue vivo nas evacuações</li>
                  <li>
                    • Mudança no hábito intestinal (diarreia ou constipação
                    persistente)
                  </li>
                  <li>• Dor abdominal ou cólicas frequentes</li>
                  <li>• Sensação de evacuação incompleta</li>
                  <li>• Perda de peso inexplicada</li>
                  <li>• Fadiga e fraqueza</li>
                  <li>• Anemia ferropriva</li>
                  <li>• Massa palpável no abdome</li>
                </ul>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Diagnóstico
              </h3>
              <div className='bg-gray-900 p-6 rounded-lg mb-8'>
                <ul className='text-gray-300 space-y-2'>
                  <li>• Colonoscopia com biópsia</li>
                  <li>• Tomografia computadorizada de abdome e pelve</li>
                  <li>
                    • Ressonância magnética de pelve (para tumores retais)
                  </li>
                  <li>• Avaliação multidisciplinar</li>
                </ul>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                Tratamento Cirúrgico
              </h3>
              <div className='grid md:grid-cols-2 gap-6 mb-8'>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Videolaparoscopia
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Técnica minimamente invasiva que permite ressecção
                    oncológica adequada com menor trauma cirúrgico, recuperação
                    mais rápida e excelentes resultados estéticos.
                  </p>
                </div>
                <div className='bg-gray-900 p-6 rounded-lg'>
                  <h4 className='text-xl font-semibold text-blue-400 mb-3'>
                    Ressecção Oncológica
                  </h4>
                  <p className='text-gray-300 text-justify'>
                    Remoção completa do tumor com margens de segurança adequadas
                    e linfadenectomia regional, seguindo os princípios da
                    cirurgia oncológica.
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
                    Especialista em cirurgia oncológica colorretal
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Experiência em videolaparoscopia oncológica
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Abordagem multidisciplinar no tratamento do câncer
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Técnicas minimamente invasivas
                  </p>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-gray-300'>
                    Acompanhamento oncológico completo
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

        {/* FAQ Section */}
        <MedicalFAQ
          title='Perguntas Frequentes sobre Câncer Colorretal'
          faqs={cancerColorretalFAQs}
        />

        <Footer />
      </div>
    </>
  )
}
