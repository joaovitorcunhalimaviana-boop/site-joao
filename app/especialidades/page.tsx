import React from 'react'
import { Metadata } from 'next'
import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import BackgroundPattern from '../../components/ui/background-pattern'
import EspecialidadesFAQ from '../../components/ui/especialidades-faq'
import StructuredData from '../../components/seo/structured-data'
import AdvancedMedicalSchema, {
  MedicalFAQSchema,
} from '../../components/seo/advanced-medical-schema'

export const metadata: Metadata = {
  title:
    'O que Trata um Coloproctologista? Especialidades Dr. João Vitor Viana',
  description:
    'O que é coloproctologia? Quais doenças o coloproctologista trata? Dr. João Vitor Viana explica: hemorroidas, fissura anal, constipação, doença de Crohn, colonoscopia. Como funciona o tratamento? Técnicas modernas em João Pessoa.',
  keywords:
    'o que trata coloproctologista, o que é coloproctologia, tratamento hemorroidas joão pessoa, cirurgia fissura anal, colonoscopia joão pessoa, doença de crohn tratamento, constipação intestinal, especialidades médicas joão pessoa, proctologia paraíba',
  openGraph: {
    title: 'Quais Doenças o Coloproctologista Trata? Especialidades Médicas',
    description:
      'Descubra o que trata um coloproctologista. Dr. João Vitor Viana explica sobre hemorroidas, fissura anal, constipação e outras condições. Tratamentos modernos em João Pessoa.',
    url: 'https://drjoaovitorviana.com.br/especialidades',
    type: 'website',
  },
  alternates: {
    canonical: 'https://drjoaovitorviana.com.br/especialidades',
  },
}

export default function EspecialidadesPage() {
  const faqQuestions = [
    {
      question: 'O que exatamente trata um coloproctologista?',
      answer:
        'O coloproctologista é especialista em doenças do intestino grosso (cólon), reto, ânus e estruturas relacionadas. Trata hemorroidas, fissuras anais, fístulas, constipação, síndrome do intestino irritável, doença de Crohn, retocolite ulcerativa, pólipos intestinais e câncer colorretal.',
    },
    {
      question: 'Quais são os tratamentos modernos para hemorroidas?',
      answer:
        'Os tratamentos incluem medidas clínicas (mudanças na dieta, medicamentos), procedimentos ambulatoriais (ligadura elástica, escleroterapia, fotocoagulação infravermelha) e cirurgias minimamente invasivas quando necessário. A escolha depende do grau e sintomas.',
    },
    {
      question: 'O que é colonoscopia e quando é indicada?',
      answer:
        'A colonoscopia é um exame que permite visualizar todo o intestino grosso através de um aparelho flexível com câmera. É indicada para rastreamento de câncer colorretal, investigação de sangramento, dor abdominal, mudança do hábito intestinal e acompanhamento de doenças inflamatórias.',
    },
  ]

  return (
    <>
      <StructuredData type='faq' />
      <AdvancedMedicalSchema type='specialty' data={{}} />
      <MedicalFAQSchema questions={faqQuestions} />
      <div className='min-h-screen bg-black'>
        <BackgroundPattern />
        <Header currentPage='especialidades' />

        {/* Main Content */}
        <main className='container mx-auto px-6 lg:px-8 py-16 pt-24'>
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
                style={{ width: '56px !important', height: '56px !important' }}
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
              Especialidades
              <span
                className='block text-blue-400 mt-2'
                style={{
                  display: 'block !important',
                  marginTop: '0.5rem !important',
                  fontSize: 'inherit !important',
                }}
              >
                Médicas
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
              Conheça as áreas de atuação do doutor João Vitor Viana em
              <span className='text-blue-400 font-bold'>
                {' '}
                coloproctologia e cirurgia geral
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

          {/* Coloproctologia Section */}
          <section className='mb-24'>
            <div className='bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm rounded-3xl p-10 lg:p-12 border border-gray-700/50 shadow-2xl'>
              <div className='flex items-center mb-10'>
                <div className='w-16 h-16 rounded-2xl flex items-center justify-center mr-6 bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg'>
                  <svg
                    className='w-8 h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <div>
                  <h2 className='text-2xl lg:text-3xl font-bold text-white mb-2'>
                    Coloproctologia
                  </h2>
                  <p className='text-blue-300 text-base font-medium'>
                    Especialidade em doenças do intestino grosso, reto e ânus
                  </p>
                </div>
              </div>

              <div className='mb-12'>
                <h3 className='text-xl font-bold text-white mb-6'>
                  O que é a Coloproctologia?
                </h3>
                <div className='bg-gray-800/30 rounded-2xl p-5 border border-gray-700/30'>
                  <p className='text-gray-300 text-base leading-relaxed mb-5 text-justify'>
                    A Coloproctologia é a especialidade médica que se dedica ao
                    diagnóstico e tratamento das doenças que acometem o
                    intestino grosso (cólon), reto, ânus e estruturas
                    relacionadas. O coloproctologista é o especialista
                    capacitado para tratar desde condições benignas até
                    patologias complexas da região anorretal e do sistema
                    digestivo baixo.
                  </p>
                  <p className='text-gray-300 text-base leading-relaxed text-justify'>
                    Esta especialidade combina conhecimentos clínicos e
                    cirúrgicos avançados, permitindo um tratamento integral e
                    personalizado para cada paciente, sempre priorizando
                    técnicas minimamente invasivas e os mais modernos protocolos
                    de cuidado.
                  </p>
                </div>
              </div>

              <div className='grid lg:grid-cols-2 gap-10'>
                <div className='bg-gray-800/20 rounded-2xl p-6 border border-gray-700/30'>
                  <h4 className='text-base font-bold text-white mb-4 flex items-center'>
                    <svg
                      className='w-6 h-6 text-blue-400 mr-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    Principais Condições Tratadas
                  </h4>
                  <ul className='space-y-4'>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Hemorroidas:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Tratamento clínico e cirúrgico das varizes anorretais
                        </p>
                      </div>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Fissuras Anais:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Lesões dolorosas na mucosa anal
                        </p>
                      </div>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Fístulas Anorretais:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Comunicações anômalas entre o reto e a pele
                        </p>
                      </div>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Doença Pilonidal:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Cistos e abscessos na região sacrococcígea
                        </p>
                      </div>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Plicoma:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Pregas cutâneas anais hipertróficas
                        </p>
                      </div>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Condiloma:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Verrugas anogenitais (HPV)
                        </p>
                      </div>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Constipação Intestinal:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Distúrbios da evacuação
                        </p>
                      </div>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Incontinência Fecal:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Perda involuntária de fezes
                        </p>
                      </div>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Câncer Colorretal:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Diagnóstico e tratamento de tumores do cólon e reto
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className='bg-gray-800/20 rounded-2xl p-6 border border-gray-700/30'>
                  <h4 className='text-base font-bold text-white mb-4 flex items-center'>
                    <svg
                      className='w-6 h-6 text-blue-400 mr-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
                      />
                    </svg>
                    Técnicas e Procedimentos
                  </h4>
                  <ul className='space-y-4'>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Ligadura elástica para hemorroidas
                      </span>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Cirurgias com radiofrequência e laser para lesões
                        anorretais
                      </span>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Aplicação de toxina botulínica
                      </span>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Cirurgias minimamente invasivas
                      </span>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Tratamento de disfunções do assoalho pélvico
                      </span>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-blue-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Investigação de dores abdominais
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Cirurgia Geral Section */}
          <section className='mb-24'>
            <div className='bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm rounded-3xl p-10 lg:p-12 border border-gray-700/50 shadow-2xl'>
              <div className='flex items-center mb-10'>
                <div className='w-16 h-16 rounded-2xl flex items-center justify-center mr-6 bg-gradient-to-br from-green-600 to-green-800 shadow-lg'>
                  <svg
                    className='w-8 h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
                    />
                  </svg>
                </div>
                <div>
                  <h2 className='text-2xl lg:text-3xl font-bold text-white mb-2'>
                    Cirurgia Geral
                  </h2>
                  <p className='text-green-300 text-base font-medium'>
                    Procedimentos cirúrgicos diversos com técnicas modernas
                  </p>
                </div>
              </div>

              <div className='mb-12'>
                <h3 className='text-xl font-bold text-white mb-6'>
                  O que é a Cirurgia Geral?
                </h3>
                <div className='bg-gray-800/30 rounded-2xl p-5 border border-gray-700/30'>
                  <p className='text-gray-300 text-base leading-relaxed mb-5 text-justify'>
                    A Cirurgia Geral é uma especialidade médica ampla que
                    abrange o diagnóstico e tratamento cirúrgico de doenças que
                    acometem diversos órgãos e sistemas do corpo humano. O
                    cirurgião geral possui formação abrangente para realizar
                    procedimentos em diferentes regiões anatômicas, desde
                    cirurgias eletivas até situações de urgência e emergência.
                  </p>
                  <p className='text-gray-300 text-base leading-relaxed text-justify'>
                    Esta especialidade fundamental da medicina combina
                    conhecimento técnico avançado com habilidades cirúrgicas
                    precisas, permitindo o tratamento de uma vasta gama de
                    condições médicas que requerem intervenção cirúrgica, sempre
                    priorizando a segurança do paciente e os melhores
                    resultados.
                  </p>
                </div>
              </div>

              <div className='grid lg:grid-cols-2 gap-10'>
                <div className='bg-gray-800/20 rounded-2xl p-6 border border-gray-700/30'>
                  <h4 className='text-base font-bold text-white mb-4 flex items-center'>
                    <svg
                      className='w-6 h-6 text-green-400 mr-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    Principais Áreas de Atuação
                  </h4>
                  <ul className='space-y-4'>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-green-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Cirurgia da Vesícula:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Pedra na vesícula, pólipo de vesícula
                        </p>
                      </div>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-green-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Cirurgia da Parede Abdominal:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Hérnias inguinais, umbilicais e incisionais
                        </p>
                      </div>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-green-400 rounded-full mr-4 mt-3 flex-shrink-0'></span>
                      <div>
                        <strong className='text-white text-base'>
                          Cirurgia de Urgência:
                        </strong>
                        <p className='text-gray-300 mt-1 text-base'>
                          Apendicite, colecistite aguda, obstruções intestinais
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className='bg-gray-800/20 rounded-2xl p-6 border border-gray-700/30'>
                  <h4 className='text-base font-bold text-white mb-4 flex items-center'>
                    <svg
                      className='w-6 h-6 text-green-400 mr-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
                      />
                    </svg>
                    Procedimentos Realizados
                  </h4>
                  <ul className='space-y-4'>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-green-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Colecistectomia (remoção da vesícula biliar)
                      </span>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-green-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Herniorrafias (correção de hérnias)
                      </span>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-green-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Apendicectomia (remoção do apêndice)
                      </span>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-green-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Cirurgias laparoscópicas minimamente invasivas
                      </span>
                    </li>
                    <li className='text-gray-200 flex items-start p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors'>
                      <span className='w-2 h-2 bg-green-400 rounded-full mr-4 mt-2 flex-shrink-0'></span>
                      <span className='text-base'>
                        Drenagem de abscessos e coleções
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className='text-center py-16 bg-gray-800/20 rounded-2xl border border-gray-700/30'>
            <div className='max-w-4xl mx-auto px-6'>
              <div className='mb-8'>
                <h2 className='text-2xl sm:text-3xl font-bold text-white mb-4'>
                  Agende sua Consulta
                </h2>
                <div className='w-20 h-1 bg-blue-500 mx-auto rounded-full mb-6'></div>
              </div>
              <p className='text-gray-300 text-base leading-relaxed mb-8 max-w-3xl mx-auto'>
                Agende sua consulta e receba o melhor tratamento em
                Coloproctologia e Cirurgia Geral
              </p>
              <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto'>
                <a
                  href='/agendamento'
                  className='group bg-blue-900/40 hover:bg-blue-800/50 text-white px-8 py-8 rounded-xl font-medium text-base transition-all duration-300 border border-blue-700/30 hover:border-blue-600/50 hover:scale-105'
                >
                  <div className='text-center'>
                    <div className='mb-4'>
                      <svg
                        className='w-12 h-12 mx-auto text-blue-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                    <div className='text-sm opacity-90 mb-1'>Consulta</div>
                    <div className='font-semibold'>Presencial</div>
                  </div>
                </a>
                <a
                  href='/teleconsulta'
                  className='group bg-blue-900/40 hover:bg-blue-800/50 text-white px-8 py-8 rounded-xl font-medium text-base transition-all duration-300 border border-blue-700/30 hover:border-blue-600/50 hover:scale-105'
                >
                  <div className='text-center'>
                    <div className='mb-4'>
                      <svg
                        className='w-12 h-12 mx-auto text-blue-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                    <div className='text-sm opacity-90 mb-1'>Tele</div>
                    <div className='font-semibold'>Consulta</div>
                  </div>
                </a>
                <a
                  href='/urgencias'
                  className='group bg-blue-900/40 hover:bg-blue-800/50 text-white px-8 py-8 rounded-xl font-medium text-base transition-all duration-300 border border-blue-700/30 hover:border-blue-600/50 hover:scale-105'
                >
                  <div className='text-center'>
                    <div className='mb-4'>
                      <svg
                        className='w-12 h-12 mx-auto text-blue-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <div className='text-sm opacity-90 mb-1'>Consulta</div>
                    <div className='font-semibold'>Urgência</div>
                  </div>
                </a>
                <a
                  href='/visitas-domiciliares'
                  className='group bg-blue-900/40 hover:bg-blue-800/50 text-white px-8 py-8 rounded-xl font-medium text-base transition-all duration-300 border border-blue-700/30 hover:border-blue-600/50 hover:scale-105'
                >
                  <div className='text-center'>
                    <div className='mb-4'>
                      <svg
                        className='w-12 h-12 mx-auto text-blue-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                        />
                      </svg>
                    </div>
                    <div className='text-sm opacity-90 mb-1'>Visita</div>
                    <div className='font-semibold'>Domiciliar</div>
                  </div>
                </a>
              </div>
            </div>
          </section>

          <EspecialidadesFAQ />
        </main>

        <Footer />
      </div>
    </>
  )
}
