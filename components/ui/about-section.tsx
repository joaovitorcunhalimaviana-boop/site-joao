'use client'

import Image from 'next/image'

interface PillarItem {
  title: string
  description: string
  icon: string
}

interface ModalityItem {
  title: string
  description: string
  icon: string
}

const pillars: PillarItem[] = [
  {
    title: 'Evidências Científicas Robustas',
    description:
      'Medicina baseada nas melhores evidências científicas atualizadas',
    icon: 'science',
  },
  {
    title: 'Uso de Tecnologias',
    description:
      'Utilização das mais avançadas tecnologias para diagnóstico, tratamento e acompanhamento',
    icon: 'technology',
  },
  {
    title: 'Respeito ao Paciente',
    description:
      'Atendimento respeitoso e com tratamento focado nas necessidades individuais',
    icon: 'respect',
  },
]

const modalities: ModalityItem[] = [
  {
    title: 'Presencial',
    description: 'Consultas no consultório com exame físico completo',
    icon: 'presencial',
  },
  {
    title: 'Teleconsulta',
    description: 'Atendimento por videoconferência com a mesma qualidade',
    icon: 'teleconsulta',
  },
  {
    title: 'Domiciliar',
    description: 'Visitas domiciliares para maior comodidade do paciente',
    icon: 'domiciliar',
  },
  {
    title: 'Urgência',
    description: 'Atendimento de urgência quando necessário',
    icon: 'urgencia',
  },
]

export default function AboutSection() {
  return (
    <section className='py-24 bg-black' id='sobre'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        {/* Header */}
        <div className='mx-auto max-w-2xl text-center mb-16'>
          <h2 className='text-3xl lg:text-4xl font-bold tracking-tight text-white'>
            Conheça minha biografia:
          </h2>
        </div>

        {/* Biography Section */}
        <div className='mb-20'>
          <div className='max-w-7xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'>
              {/* Texto da biografia */}
              <div
                className='text-base text-gray-300 leading-relaxed space-y-4 text-justify'
                style={{ fontSize: 'clamp(1rem, 2.2vw, 1.125rem) !important' }}
              >
                <p>
                  Formei-me em Medicina em 2019 e, logo em seguida, realizei
                  três anos de residência em Cirurgia Geral no Hospital
                  Universitário Onofre Lopes (HUOL), da Universidade Federal do
                  Rio Grande do Norte (UFRN). Nesse período, aprimorei minha
                  técnica cirúrgica e o raciocínio clínico para o diagnóstico e
                  o tratamento das principais patologias cirúrgicas, sempre
                  atento à segurança e à recuperação rápida do paciente.
                </p>
                <p>
                  Após concluir a residência de Cirurgia Geral, retornei a João
                  Pessoa e ingressei na residência de Coloproctologia do
                  Hospital Santa Isabel. Foi quando aprofundei minha atuação no
                  cuidado das doenças do trato digestivo baixo — cólon, reto e
                  ânus — incluindo desde condições benignas comuns até casos
                  mais complexos que exigem abordagem multidisciplinar. Minha
                  prática abrange desde o diagnóstico preciso e o tratamento
                  clínico até procedimentos cirúrgicos quando indicados, com
                  preferência por técnicas minimamente invasivas e protocolos de
                  recuperação acelerada, quando apropriado.
                </p>
                <p>
                  A atualização constante é parte do meu compromisso com a
                  qualidade assistencial. Atualmente, curso o Mestrado em
                  Ciência Cirúrgica Interdisciplinar na Universidade Federal de
                  São Paulo (UNIFESP) — Escola Paulista de Medicina, o que me
                  mantém em contato direto com pesquisa, inovação e análise
                  crítica de evidências. Paralelamente, realizo pós-graduação em
                  Ciências Políticas e Atuação Pública (FICV), porque entendo
                  que a boa medicina também depende de políticas de saúde
                  eficientes, acesso e equidade — fatores que impactam de forma
                  concreta a vida dos pacientes.
                </p>
                <p>
                  No consultório, priorizo acolhimento, privacidade e
                  comunicação transparente. Meu foco é aliviar sintomas,
                  recuperar função e preservar a qualidade de vida. Cada plano é
                  construído em conjunto, respeitando a história, os objetivos e
                  as preferências de quem confia em mim. Se você precisa de
                  avaliação ou acompanhamento, será um prazer ajudar. Agende sua
                  consulta e vamos conversar sobre o melhor caminho para o seu
                  cuidado.
                </p>
              </div>

              {/* Nova foto do Instagram */}
              <div className='relative flex justify-center lg:justify-end'>
                {/* Container da imagem */}
                <div
                  className='relative w-[36rem] h-[36rem] rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl group'
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(30, 58, 138, 0.05), rgba(30, 64, 175, 0.05))',
                    border: '2px solid transparent',
                    backgroundClip: 'padding-box',
                    boxShadow:
                      '0 0 0 2px rgba(30, 58, 138, 0.12), 0 0 0 4px rgba(30, 64, 175, 0.08), 0 20px 40px -10px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(30, 64, 175, 0.05)',
                  }}
                >
                  {/* Foto do Congresso */}
                  <Image
                    src='/congress-photo.jpeg'
                    alt='Dr. João Vítor Viana - 73º Congresso Brasileiro de Coloproctologia'
                    width={400}
                    height={300}
                    loading="lazy"
                    className='w-full h-full object-cover'
                    style={{
                      transform: 'scale(1.1)',
                      objectPosition: 'center 45%',
                    }}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Section */}
        <div className='mb-20'>
          <div className='max-w-4xl mx-auto text-center'>
            <div className='bg-gray-900/50 rounded-2xl p-8 border border-gray-700'>
              <div className='flex items-center justify-center mb-4'>
                <svg
                  className='w-8 h-8 text-blue-500 mr-3'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                </svg>
                <h3 className='text-2xl font-bold text-blue-500'>
                  Me acompanhe no Instagram!
                </h3>
              </div>
              <p
                className='text-lg text-gray-300 mb-6'
                style={{ fontSize: 'clamp(1rem, 2.2vw, 1.125rem) !important' }}
              >
                Me siga para dicas de saúde, conteúdo educativo e atualizações
                sobre coloproctologia
              </p>
              <a
                href='https://instagram.com/drjoaovitorviana'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105'
              >
                <svg
                  className='w-5 h-5 mr-2'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                </svg>
                Seguir @drjoaovitorviana
              </a>
            </div>
          </div>
        </div>

        {/* Three Pillars Section */}
        <div className='mb-20'>
          <div className='mx-auto max-w-2xl text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4'>
              Os Fundamentos do Meu Trabalho
            </h2>
            <p
              className='text-lg text-gray-300'
              style={{ fontSize: 'clamp(1rem, 2.2vw, 1.125rem) !important' }}
            >
              Como médico, eu me baseio em três pilares essenciais
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className='bg-gray-900/50 rounded-2xl p-8 border border-gray-700 text-center'
              >
                <div className='mb-6'>
                  {pillar.icon === 'science' && (
                    <svg
                      className='w-12 h-12 text-blue-400 mx-auto'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
                      />
                    </svg>
                  )}
                  {pillar.icon === 'technology' && (
                    <svg
                      className='w-12 h-12 text-blue-400 mx-auto'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  )}
                  {pillar.icon === 'respect' && (
                    <svg
                      className='w-12 h-12 text-blue-400 mx-auto'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                  )}
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>
                  {pillar.title}
                </h3>
                <p className='text-gray-300'>{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modalities Section */}
        <div className='mb-20'>
          <div className='mx-auto max-w-2xl text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4'>
              Modalidades de Atendimento
            </h2>
            <p
              className='text-lg text-gray-300'
              style={{ fontSize: 'clamp(1rem, 2.2vw, 1.125rem) !important' }}
            >
              Flexibilidade total para atender suas necessidades, onde e quando
              você precisar
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {modalities.map((modality, index) => (
              <div
                key={index}
                className='bg-gray-900/50 rounded-2xl p-6 border border-gray-700 text-center'
              >
                <div className='mb-4'>
                  {modality.icon === 'presencial' && (
                    <svg
                      className='w-10 h-10 text-blue-400 mx-auto'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3zM9 7h6m-6 4h6'
                      />
                    </svg>
                  )}
                  {modality.icon === 'teleconsulta' && (
                    <svg
                      className='w-10 h-10 text-blue-400 mx-auto'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                      />
                    </svg>
                  )}
                  {modality.icon === 'domiciliar' && (
                    <svg
                      className='w-10 h-10 text-blue-400 mx-auto'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                      />
                    </svg>
                  )}
                  {modality.icon === 'urgencia' && (
                    <svg
                      className='w-10 h-10 text-blue-400 mx-auto'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 10V3L4 14h7v7l9-11h-7z'
                      />
                    </svg>
                  )}
                </div>
                <h3 className='text-lg font-bold text-white mb-2'>
                  {modality.title}
                </h3>
                <p className='text-sm text-gray-300'>{modality.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className='mt-20 text-center'>
          <div className='bg-gray-900/50 rounded-2xl p-8'>
            <h3 className='text-2xl lg:text-3xl font-bold text-white mb-4'>
              Pronto para cuidar da sua saúde intestinal?
            </h3>
            <p className='text-lg text-blue-100 mb-6'>
              Agende sua consulta e descubra como podemos ajudar você a ter uma
              vida mais saudável
            </p>
            <a
              href='/agendamento'
              className='inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900/70 hover:bg-blue-900/80 transition-colors'
            >
              Agendar Consulta Agora
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
