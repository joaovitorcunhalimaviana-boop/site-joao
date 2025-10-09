'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MigrationPanel from '@/components/migration-panel'
import BackgroundPattern from '@/components/ui/background-pattern'

export default function MigrationPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticação simples
    const userData = localStorage.getItem('currentUser')

    if (userData) {
      const user = JSON.parse(userData)
      // Permitir acesso para médicos e secretárias
      if (user.role === 'doctor' || user.role === 'secretary') {
        setIsAuthenticated(true)
      } else {
        router.push('/login')
      }
    } else {
      router.push('/login')
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative'>
      <BackgroundPattern />

      <div className='relative z-10 container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>
            🔧 Administração do Sistema
          </h1>
          <p className='text-gray-600 text-lg'>
            Ferramentas de migração e manutenção de dados
          </p>
        </div>

        {/* Navigation */}
        <div className='flex justify-center mb-8'>
          <div className='bg-white rounded-lg shadow-md p-2 flex space-x-2'>
            <button
              onClick={() => router.push('/area-secretaria')}
              className='px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
            >
              ← Voltar à Secretaria
            </button>
            <button
              onClick={() => router.push('/area-medica')}
              className='px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
            >
              🏥 Área Médica
            </button>
          </div>
        </div>

        {/* Migration Panel */}
        <div className='max-w-4xl mx-auto'>
          <MigrationPanel />
        </div>

        {/* Additional Info */}
        <div className='max-w-4xl mx-auto mt-8'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-bold text-gray-800 mb-4'>
              📚 Informações sobre a Migração
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='font-semibold text-gray-700 mb-2'>
                  🎯 Objetivo da Migração
                </h3>
                <p className='text-gray-600 text-sm'>
                  Transferir todos os dados do localStorage (armazenamento local
                  do navegador) e arquivos de backup para um banco de dados
                  persistente, garantindo que os dados não sejam perdidos entre
                  sessões ou atualizações do sistema.
                </p>
              </div>

              <div>
                <h3 className='font-semibold text-gray-700 mb-2'>
                  🔒 Segurança dos Dados
                </h3>
                <p className='text-gray-600 text-sm'>
                  Todos os dados são migrados com criptografia e seguindo as
                  normas da LGPD. Os dados originais são mantidos como backup
                  até a confirmação de que a migração foi bem-sucedida.
                </p>
              </div>

              <div>
                <h3 className='font-semibold text-gray-700 mb-2'>
                  ⚡ Performance
                </h3>
                <p className='text-gray-600 text-sm'>
                  Após a migração, o sistema terá melhor performance e
                  confiabilidade, pois os dados estarão em um banco de dados
                  otimizado em vez do localStorage do navegador.
                </p>
              </div>

              <div>
                <h3 className='font-semibold text-gray-700 mb-2'>
                  🔄 Backup Automático
                </h3>
                <p className='text-gray-600 text-sm'>
                  O sistema continuará fazendo backups automáticos dos dados,
                  mas agora tanto no banco de dados quanto em arquivos JSON para
                  redundância máxima.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
