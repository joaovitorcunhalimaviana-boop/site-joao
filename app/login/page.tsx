'use client'

import Link from 'next/link'
import { UserIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { BackgroundPattern } from '@/components/ui/background-pattern'
import Header from '@/components/ui/header'

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='login' />

      <main className='pt-32'>
        <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-md w-full space-y-8'>
            {/* Header */}
            <div className='text-center'>
              <UserIcon className='mx-auto h-16 w-16 text-blue-400' />
              <h2 className='mt-6 text-3xl font-bold text-white'>
                Área de Login
              </h2>
              <p className='mt-2 text-sm text-gray-300'>
                Selecione o tipo de acesso
              </p>
            </div>

            {/* Opções de Login */}
            <div className='mt-8 space-y-4'>
              <Link
                href='/login-medico'
                className='group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
              >
                <span className='absolute left-0 inset-y-0 flex items-center pl-3'>
                  <UserIcon className='h-5 w-5 text-blue-300 group-hover:text-blue-200' />
                </span>
                Área Médica
              </Link>

              <Link
                href='/login-secretaria'
                className='group relative w-full flex justify-center py-4 px-4 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200'
              >
                <span className='absolute left-0 inset-y-0 flex items-center pl-3'>
                  <UserGroupIcon className='h-5 w-5 text-gray-400 group-hover:text-gray-300' />
                </span>
                Área da Secretaria
              </Link>
            </div>

            {/* Link para voltar */}
            <div className='text-center'>
              <Link
                href='/'
                className='text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200'
              >
                ← Voltar para o site
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
