'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/ui/header'
import Footer from '../../components/ui/footer'
import BackgroundPattern from '../../components/ui/background-pattern'
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'

interface LoginForm {
  username: string
  password: string
}

export default function LoginMedicoPage() {
  const [formData, setFormData] = useState<LoginForm>({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('') // Limpar erro ao digitar
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('🔐 [Cliente] Iniciando login...', {
      username: formData.username
    })

    try {
      // Enviar username como email (backend aceita ambos)
      const loginData = {
        email: formData.username,
        password: formData.password
      }

      console.log('📤 [Cliente] Enviando requisição...')

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      console.log('📥 [Cliente] Resposta recebida:', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      })

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ [Cliente] Resposta não é JSON!')
        const text = await response.text()
        console.error('Resposta recebida:', text.substring(0, 200))
        throw new Error('Servidor retornou resposta inválida (não JSON)')
      }

      const data = await response.json()
      console.log('✅ [Cliente] JSON parseado:', data)

      if (response.ok && data.success) {
        console.log('🎉 [Cliente] Login bem-sucedido!')

        // Verificar se o usuário pode acessar a área médica
        if (data.user && data.user.areas && data.user.areas.includes('medica')) {
          console.log('✅ [Cliente] Acesso à área médica permitido')

          // Salvar dados do usuário no formato esperado pelos componentes
          localStorage.setItem('currentUser', JSON.stringify(data.user))

          // Salvar dados do médico no formato esperado pela área médica
          const doctorData = {
            name: data.user.name,
            email: data.user.email || 'joao.viana@clinica.com',
            specialty: 'Coloproctologista e Cirurgião Geral',
            crm: 'CRMPB 12831'
          }
          localStorage.setItem('doctor', JSON.stringify(doctorData))

          console.log('🚀 [Cliente] Redirecionando para /area-medica')
          router.push('/area-medica')
        } else {
          console.warn('⚠️ [Cliente] Sem permissão para área médica')
          setError('Você não tem permissão para acessar a área médica')
        }
      } else {
        console.error('❌ [Cliente] Login falhou:', data)
        setError(data.error || data.message || 'Erro no login')
      }
    } catch (error) {
      console.error('💥 [Cliente] Erro capturado:', error)

      if (error instanceof Error) {
        console.error('Mensagem:', error.message)
        console.error('Stack:', error.stack)
        setError(`Erro: ${error.message}`)
      } else {
        setError('Erro de conexão. Verifique se o servidor está rodando.')
      }
    } finally {
      setIsLoading(false)
      console.log('🏁 [Cliente] Processo de login finalizado')
    }
  }

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
                Área Médica
              </h2>
              <p className='mt-2 text-sm text-gray-300'>
                Acesso exclusivo para Dr. João Vítor Viana
              </p>
            </div>

            {/* Formulário */}
            <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
              <div className='space-y-4'>
                {/* Username */}
                <div>
                  <label
                    htmlFor='username'
                    className='block text-sm font-medium text-gray-300 mb-2'
                  >
                    Usuário
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <UserIcon className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      id='username'
                      name='username'
                      type='text'
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className='block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Seu nome de usuário'
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-300 mb-2'
                  >
                    Senha
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <LockClosedIcon className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      id='password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className='block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Sua senha'
                    />
                    <button
                      type='button'
                      className='absolute inset-y-0 right-0 pr-3 flex items-center'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className='h-5 w-5 text-gray-400 hover:text-gray-300' />
                      ) : (
                        <EyeIcon className='h-5 w-5 text-gray-400 hover:text-gray-300' />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className='bg-red-900/20 border border-red-500/50 rounded-lg p-3'>
                  <p className='text-red-400 text-sm text-center'>{error}</p>
                </div>
              )}

              {/* Botão de Login */}
              <div>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                >
                  {isLoading ? (
                    <div className='flex items-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Entrando...
                    </div>
                  ) : (
                    'Entrar na Área Médica'
                  )}
                </button>
              </div>

              {/* Informações de Segurança */}
              <div className='mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700'>
                <h3 className='text-sm font-medium text-gray-300 mb-2'>
                  🔒 Segurança
                </h3>
                <ul className='text-xs text-gray-400 space-y-1'>
                  <li>• Acesso exclusivo para médicos autorizados</li>
                  <li>• Dados protegidos por criptografia</li>
                  <li>• Sessão expira automaticamente em 24h</li>
                  <li>• Conforme LGPD e CFM</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
