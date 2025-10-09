import { Metadata } from 'next'
import Header from '../../../components/ui/header'
import Footer from '../../../components/ui/footer'
import BackgroundPattern from '../../../components/ui/background-pattern'
import { HemorroidsSchema } from '../../../components/seo/advanced-medical-schema'

export const metadata: Metadata = {
  title: 'Hemorroidas: Sintomas, Tratamento e Cirurgia - Dr. João Vitor Viana',
  description:
    'Hemorroidas causam dor e sangramento? Dr. João Vitor Viana explica sintomas, tratamentos clínicos e cirúrgicos para hemorroidas em João Pessoa. Quando operar? Como tratar sem cirurgia?',
  keywords:
    'hemorroidas tratamento joão pessoa, cirurgia hemorroidas, sintomas hemorroidas, hemorroida externa interna, coloproctologista hemorroidas paraíba',
  openGraph: {
    title: 'Tratamento de Hemorroidas - Dr. João Vitor Viana',
    description:
      'Especialista em hemorroidas em João Pessoa. Tratamentos modernos, procedimentos minimamente invasivos e cirurgia quando necessário.',
    url: 'https://drjoaovitorviana.com.br/especialidades/hemorroidas',
    type: 'website',
  },
  alternates: {
    canonical: 'https://drjoaovitorviana.com.br/especialidades/hemorroidas',
  },
}

export default function HemorroidasPage() {
  return (
    <>
      <HemorroidsSchema />
      <div className='min-h-screen bg-black'>
        <BackgroundPattern />
        <Header currentPage='especialidades' />

        <main className='container mx-auto px-4 py-12'>
          {/* Page Title */}
          <div className='text-center mb-16'>
            <h1 className='text-4xl md:text-5xl font-bold text-white mb-6'>
              Hemorroidas
            </h1>
            <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
              Tratamento especializado para hemorroidas com técnicas modernas e
              minimamente invasivas
            </p>
          </div>

          {/* What are Hemorrhoids */}
          <section className='mb-16'>
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                O que são Hemorroidas?
              </h2>
              <p className='text-gray-300 text-lg leading-relaxed mb-4 text-justify'>
                Hemorroidas são veias dilatadas e inflamadas localizadas na
                região anal e retal. Elas podem ser internas (dentro do canal
                anal) ou externas (ao redor do ânus). É uma condição muito comum
                que afeta milhões de pessoas.
              </p>
              <p className='text-gray-300 text-lg leading-relaxed text-justify'>
                Segundo a Classificação Internacional de Doenças (CID-10), as
                hemorroidas são codificadas como K64, sendo uma das principais
                causas de consulta em coloproctologia.
              </p>
            </div>
          </section>

          {/* Symptoms */}
          <section className='mb-16'>
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                Sintomas das Hemorroidas
              </h2>
              <div className='grid md:grid-cols-2 gap-8'>
                <div>
                  <h3 className='text-xl font-semibold text-gray-400 mb-4'>
                    Hemorroidas Internas:
                  </h3>
                  <ul className='space-y-3'>
                    <li className='text-gray-300 flex items-start'>
                      <span className='text-red-400 mr-2 mt-1'>•</span>
                      <span>Sangramento vermelho vivo durante evacuação</span>
                    </li>
                    <li className='text-gray-300 flex items-start'>
                      <span className='text-red-400 mr-2 mt-1'>•</span>
                      <span>Prolapso (saída das hemorroidas pelo ânus)</span>
                    </li>
                    <li className='text-gray-300 flex items-start'>
                      <span className='text-red-400 mr-2 mt-1'>•</span>
                      <span>Sensação de evacuação incompleta</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-gray-400 mb-4'>
                    Hemorroidas Externas:
                  </h3>
                  <ul className='space-y-3'>
                    <li className='text-gray-300 flex items-start'>
                      <span className='text-red-400 mr-2 mt-1'>•</span>
                      <span>Dor intensa, especialmente ao sentar</span>
                    </li>
                    <li className='text-gray-300 flex items-start'>
                      <span className='text-red-400 mr-2 mt-1'>•</span>
                      <span>Coceira e irritação anal</span>
                    </li>
                    <li className='text-gray-300 flex items-start'>
                      <span className='text-red-400 mr-2 mt-1'>•</span>
                      <span>Inchaço e nódulos ao redor do ânus</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Risk Factors */}
          <section className='mb-16'>
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                Fatores de Risco
              </h2>
              <div className='grid md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <span className='text-2xl'>🚶</span>
                  </div>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    Sedentarismo
                  </h3>
                  <p className='text-gray-400 text-sm'>
                    Falta de atividade física regular
                  </p>
                </div>
                <div className='text-center'>
                  <div className='w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <span className='text-2xl'>🤰</span>
                  </div>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    Gravidez
                  </h3>
                  <p className='text-gray-400 text-sm'>
                    Pressão aumentada na região pélvica
                  </p>
                </div>
                <div className='text-center'>
                  <div className='w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <span className='text-2xl'>⚖️</span>
                  </div>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    Obesidade
                  </h3>
                  <p className='text-gray-400 text-sm'>
                    Excesso de peso corporal
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Treatment Options */}
          <section className='mb-16'>
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                Opções de Tratamento
              </h2>
              <div className='space-y-8'>
                <div>
                  <h3 className='text-xl font-semibold text-blue-400 mb-4'>
                    Tratamento Clínico Conservador
                  </h3>
                  <ul className='space-y-2 text-gray-300'>
                    <li>• Mudanças na dieta (aumento de fibras)</li>
                    <li>• Medicamentos anti-inflamatórios e analgésicos</li>
                    <li>• Pomadas e supositórios específicos</li>
                    <li>• Banhos de assento com água morna</li>
                  </ul>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-blue-400 mb-4'>
                    Procedimentos Minimamente Invasivos
                  </h3>
                  <ul className='space-y-2 text-gray-300'>
                    <li>• Ligadura elástica</li>
                    <li>• Escleroterapia</li>
                    <li>• Fotocoagulação infravermelha</li>
                    <li>• Crioterapia</li>
                  </ul>
                </div>
                <div>
                  <h3 className='text-xl font-semibold text-blue-400 mb-4'>
                    Cirurgia
                  </h3>
                  <p className='text-gray-300 mb-2'>
                    Reservada para casos mais graves ou quando outros
                    tratamentos não foram eficazes:
                  </p>
                  <ul className='space-y-2 text-gray-300'>
                    <li>• Hemorroidectomia convencional</li>
                    <li>• Hemorroidopexia (PPH)</li>
                    <li>• Técnicas com radiofrequência</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section className='text-center'>
            <div className='bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8'>
              <h2 className='text-3xl font-bold text-white mb-4'>
                Precisa de Tratamento para Hemorroidas?
              </h2>
              <p className='text-blue-100 mb-6 text-lg'>
                Dr. João Vitor Viana oferece avaliação especializada e
                tratamentos modernos
              </p>
              <a
                href='/agendamento'
                className='inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors'
              >
                Agendar Consulta
              </a>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
