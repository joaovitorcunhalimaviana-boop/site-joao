'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  currentPage?: string
}

export default function Header({ currentPage }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className='bg-black/90 backdrop-blur-sm border-b border-gray-700 fixed top-0 left-0 right-0 z-50'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div>
              <h1 className='text-lg sm:text-xl font-bold text-white'>
                Dr. João Vítor Viana
              </h1>
              <p className='text-xs sm:text-sm text-blue-200'>Coloproctologista</p>
            </div>
          </div>

          {/* Menu Hambúrguer */}
          <button
            onClick={toggleMenu}
            className='flex flex-col space-y-1 p-2 hover:bg-gray-800 rounded transition-colors'
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
          >
            <div
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
            ></div>
          </button>
        </div>
      </div>

      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div className='absolute right-2 sm:right-4 top-full mt-2 w-72 sm:w-64 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700 z-50 max-h-[80vh] overflow-y-auto'>
          <div className='py-2'>
            <button
              onClick={() => {
                router.push('/')
                setIsMenuOpen(false)
              }}
              className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors'
            >
              Página Inicial
            </button>
            <button
              onClick={() => {
                router.push('/especialidades')
                setIsMenuOpen(false)
              }}
              className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors'
            >
              Especialidades
            </button>

            {/* Submenu de Condições Médicas */}
            <div className='px-4 py-2'>
              <p className='text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2'>
                Condições Tratadas
              </p>
              <button
                onClick={() => {
                  router.push('/hemorroidas')
                  setIsMenuOpen(false)
                }}
                className='w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded'
              >
                — Hemorroidas
              </button>
              <button
                onClick={() => {
                  router.push('/fistula-anal')
                  setIsMenuOpen(false)
                }}
                className='w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded'
              >
                — Fístula Anal
              </button>
              <button
                onClick={() => {
                  router.push('/fissura-anal')
                  setIsMenuOpen(false)
                }}
                className='w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded'
              >
                — Fissura Anal
              </button>
              <button
                onClick={() => {
                  router.push('/plicoma')
                  setIsMenuOpen(false)
                }}
                className='w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded'
              >
                — Plicoma
              </button>
              <button
                onClick={() => {
                  router.push('/cisto-pilonidal')
                  setIsMenuOpen(false)
                }}
                className='w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded'
              >
                — Cisto Pilonidal
              </button>
              <button
                onClick={() => {
                  router.push('/cancer-colorretal')
                  setIsMenuOpen(false)
                }}
                className='w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/30 transition-colors rounded'
              >
                — Câncer Colorretal
              </button>
            </div>
            <button
              onClick={() => {
                router.push('/agendamento')
                setIsMenuOpen(false)
              }}
              className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors'
            >
              Marque sua Consulta
            </button>

            <button
              onClick={() => {
                router.push('/teleconsulta')
                setIsMenuOpen(false)
              }}
              className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors'
            >
              Teleconsulta
            </button>
            <button
              onClick={() => {
                router.push('/urgencias')
                setIsMenuOpen(false)
              }}
              className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors'
            >
              Urgências
            </button>
            <button
              onClick={() => {
                router.push('/visitas-domiciliares')
                setIsMenuOpen(false)
              }}
              className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors'
            >
              Visitas Domiciliares
            </button>
            <button
              onClick={() => {
                router.push('/avaliacoes')
                setIsMenuOpen(false)
              }}
              className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors'
            >
              Avaliações
            </button>
            <button
              onClick={() => {
                router.push('/contato')
                setIsMenuOpen(false)
              }}
              className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors'
            >
              Contato
            </button>
            <div className='border-t border-gray-700 my-2'></div>
            <button
              onClick={() => {
                router.push('/login-medico')
                setIsMenuOpen(false)
              }}
              className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center gap-3'
            >
              🔐 Login Médico
            </button>
            <button
              onClick={() => {
                router.push('/login-secretaria')
                setIsMenuOpen(false)
              }}
              className='w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center gap-3'
            >
              🔐 Login Secretária
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
