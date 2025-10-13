'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const HeroSection = () => {
  return (
    <>
      {/* Seção Hero Original */}
      <div className='bg-black'>
        <div className='relative isolate'>
          <div
            className='absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'
            aria-hidden='true'
          >
            <div
              className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-blue-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse'
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                animation: 'float 6s ease-in-out infinite, glow 4s ease-in-out infinite alternate',
              }}
            />
          </div>
          <div className='py-24 sm:py-32 lg:pb-40'>
            <div className='mx-auto max-w-7xl px-6 lg:px-8'>
              <div className='mx-auto text-center'>
                <h1 className='hero-title font-bold text-white mb-6 tracking-tight leading-none w-full'>
                  <span className='hero-doctor-name block w-full animate-gradient-pulse'>
                    Dr. João Vítor Viana
                  </span>
                </h1>
                <p className='text-xl sm:text-2xl md:text-3xl text-blue-400 mb-8 font-medium'>
                  Coloproctologista e Cirurgião Geral
                </p>
                <div className='max-w-4xl mx-auto mb-16'>
                  <p className='text-white text-base sm:text-lg leading-relaxed text-justify'>
                    Dr. João Vítor Viana é coloproctologista em João Pessoa/PB,
                    dedicando sua carreira ao tratamento especializado de
                    doenças do aparelho digestivo baixo. Com formação sólida,
                    oferece atendimento humanizado e tratamentos de ponta para
                    seus pacientes.
                  </p>
                </div>
              </div>

              {/* Services Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto'>
                <div className='bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm border border-blue-400/20 rounded-xl p-6 text-center hover:border-blue-400/40 transition-all duration-300 hover:transform hover:scale-105'>
                  <div className='w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center'>
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
                        d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    Consulta Presencial
                  </h3>
                  <p className='text-gray-300 text-sm mb-4'>
                    Atendimento completo no consultório
                  </p>
                  <a
                    href='/agendamento'
                    className='inline-block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
                  >
                    Agendar
                  </a>
                </div>

                <div className='bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm border border-blue-400/20 rounded-xl p-6 text-center hover:border-blue-400/40 transition-all duration-300 hover:transform hover:scale-105'>
                  <div className='w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center'>
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
                        d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    Teleconsulta
                  </h3>
                  <p className='text-gray-300 text-sm mb-4'>
                    Consulta online por videoconferência
                  </p>
                  <a
                    href='/teleconsulta'
                    className='inline-block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
                  >
                    Agendar
                  </a>
                </div>

                <div className='bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm border border-blue-400/20 rounded-xl p-6 text-center hover:border-blue-400/40 transition-all duration-300 hover:transform hover:scale-105'>
                  <div className='w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center'>
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
                        d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    Visita Domiciliar
                  </h3>
                  <p className='text-gray-300 text-sm mb-4'>
                    Atendimento no conforto de casa ou em hospital
                  </p>
                  <a
                    href='/visitas-domiciliares'
                    className='inline-block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
                  >
                    Solicitar
                  </a>
                </div>

                <div className='bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm border border-blue-400/20 rounded-xl p-6 text-center hover:border-blue-400/40 transition-all duration-300 hover:transform hover:scale-105'>
                  <div className='w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center'>
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
                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    Urgências
                  </h3>
                  <p className='text-gray-300 text-sm mb-4'>
                    Para casos que não podem esperar
                  </p>
                  <a
                    href='/urgencias'
                    className='inline-block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
                  >
                    Contatar
                  </a>
                </div>
              </div>

              <div className='mt-16 text-center'>
                <a
                  href='#sobre'
                  className='text-2xl font-semibold leading-6 text-white hover:text-blue-400 transition-colors'
                >
                  Saiba mais sobre mim <span aria-hidden='true'>→</span>
                </a>
              </div>
            </div>
          </div>
          <div
            className='absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]'
            aria-hidden='true'
          >
            <div
              className='relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-600 to-blue-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-pulse'
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                animation: 'float 8s ease-in-out infinite reverse, glow 5s ease-in-out infinite alternate-reverse',
              }}
            />
          </div>
        </div>
      </div>

      {/* Biography Section */}
      <section id='sobre' className='py-16 px-4 sm:px-6 lg:px-8 bg-black'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div className='space-y-6 lg:pl-8'>
              <div className='space-y-4'>
                <h2 className='text-3xl lg:text-4xl font-bold leading-tight'>
                  <span className='block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300'>
                    Prazer,
                  </span>
                  <span className='block text-white mt-2'>
                    <span className="block text-white font-bold">
                      Dr. João Vítor Viana
                    </span>
                  </span>
                </h2>
              </div>
              <p className='text-lg text-white leading-relaxed text-justify'>
                Sou doutor João Vitor Viana, coloproctologista e cirurgião geral
                com formação técnica sólida, fundamentada nas mais recentes
                evidências científicas. Utilizo tecnologias de ponta e técnicas
                cirúrgicas minimamente invasivas para garantir os melhores
                resultados clínicos.
              </p>
              <p className='text-lg text-white leading-relaxed text-justify'>
                Minha prática médica é baseada em protocolos rigorosamente
                validados pela literatura científica internacional, empregando
                equipamentos de última geração e metodologias comprovadamente
                eficazes para cada tipo de procedimento.
              </p>
              <div className='mt-8 pt-6 border-t border-gray-600'>
                <a
                  href='https://www.instagram.com/drjoaovitorviana'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors'
                >
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                  </svg>
                  Me acompanhe no Instagram!
                </a>
              </div>
            </div>

            <div className='relative lg:pl-12 flex justify-center'>
              {/* Sombra 3D atrás da imagem - expandida e mais transparente */}
              <div className='absolute inset-0 bg-gradient-to-br from-blue-900/8 to-blue-800/8 rounded-2xl transform translate-x-8 translate-y-8 blur-2xl scale-110'></div>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-800/6 to-blue-700/6 rounded-2xl transform translate-x-6 translate-y-6 blur-xl scale-105'></div>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-700/5 to-blue-600/5 rounded-2xl transform translate-x-4 translate-y-4 blur-lg'></div>

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
                {/* Efeito de brilho que passa pela imagem */}
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>

                <Image
                  src='/dr-joao-vitor.jpg'
                  alt='Dr. João Vítor - Cirurgião Coloproctologista'
                  width={400}
                  height={500}
                  priority
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
      </section>
    </>
  )
}

export default memo(HeroSection)
