'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/ui/header'
import BackgroundPattern from '../../../components/ui/background-pattern'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import { formatDateToBrazilian } from '@/lib/date-utils'
import {
  ArrowLeftIcon,
  UserGroupIcon,
  KeyIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface User {
  id: string
  username: string
  area: 'secretaria' | 'medica'
  createdAt: string
}

interface Doctor {
  name: string
  email: string
  specialty: string
  crm: string
}

export default function AdministracaoPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estados para adicionar usuário
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    area: 'secretaria' as 'secretaria' | 'medica',
  })

  // Estados para alterar senha
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [message, setMessage] = useState({ type: '', text: '' })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadUsers()
  }, [])

  const checkAuth = async () => {
    // Sistema simplificado - verificar apenas se há dados do usuário
    const userData = localStorage.getItem('currentUser')

    if (userData) {
      const user = JSON.parse(userData)
      setDoctor({
        name: user.name || 'João Vitor Viana',
        email: user.email || 'joao.viana@clinica.com',
        specialty: 'Coloproctologista e Cirurgião Geral',
        crm: 'CRMPB 12831',
      })
    } else {
      // Definir dados padrão se não houver usuário logado
      setDoctor({
        name: 'João Vitor Viana',
        email: 'joao.viana@clinica.com',
        specialty: 'Coloproctologista e Cirurgião Geral',
        crm: 'CRMPB 12831',
      })
    }
  }

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsers(data.users || [])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newUser.password.length < 6) {
      setMessage({
        type: 'error',
        text: 'A senha deve ter pelo menos 6 caracteres',
      })
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Usuário criado com sucesso!' })
        setNewUser({ username: '', password: '', area: 'secretaria' })
        setShowAddUserModal(false)
        loadUsers()
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erro ao criar usuário',
        })
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      setMessage({ type: 'error', text: 'Erro interno do servidor' })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Usuário excluído com sucesso!' })
        loadUsers()
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erro ao excluir usuário',
        })
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      setMessage({ type: 'error', text: 'Erro interno do servidor' })
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' })
      return
    }

    if (passwordChange.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'A nova senha deve ter pelo menos 6 caracteres',
      })
      return
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
        setPasswordChange({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setShowChangePasswordModal(false)
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erro ao alterar senha',
        })
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      setMessage({ type: 'error', text: 'Erro interno do servidor' })
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black text-white relative overflow-hidden'>
      <BackgroundPattern />

      <div className='relative z-10'>
        <Header />

        <div className='container mx-auto px-4 py-8 pt-24'>
          {/* Cabeçalho */}
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center space-x-4'>
              <div>
                <h1 className='text-3xl font-bold text-white'>Administração</h1>
                <p className='text-gray-400'>
                  Gerenciar usuários e configurações
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              {doctor && (
                <div className='text-right'>
                  <p className='text-sm text-gray-400'>Logado como:</p>
                  <p className='font-semibold'>{doctor.name}</p>
                </div>
              )}
              <MedicalAreaMenu currentPage='administracao' />
            </div>
          </div>

          {/* Mensagens */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-900/50 border border-green-500'
                  : 'bg-red-900/50 border border-red-500'
              }`}
            >
              <p
                className={
                  message.type === 'success' ? 'text-green-400' : 'text-red-400'
                }
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Ações principais */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            <button
              onClick={() => setShowAddUserModal(true)}
              className='p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-all group'
            >
              <div className='flex items-center space-x-4'>
                <div className='p-3 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors'>
                  <PlusIcon className='h-6 w-6' />
                </div>
                <div className='text-left'>
                  <h3 className='text-lg font-semibold'>Adicionar Usuário</h3>
                  <p className='text-gray-400'>
                    Criar novo acesso para secretária ou área médica
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowChangePasswordModal(true)}
              className='p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-all group'
            >
              <div className='flex items-center space-x-4'>
                <div className='p-3 bg-green-600 rounded-lg group-hover:bg-green-500 transition-colors'>
                  <KeyIcon className='h-6 w-6' />
                </div>
                <div className='text-left'>
                  <h3 className='text-lg font-semibold'>Alterar Senha</h3>
                  <p className='text-gray-400'>Modificar sua senha de acesso</p>
                </div>
              </div>
            </button>
          </div>

          {/* Lista de usuários */}
          <div className='bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6'>
            <div className='flex items-center space-x-3 mb-6'>
              <UserGroupIcon className='h-6 w-6 text-blue-400' />
              <h2 className='text-xl font-semibold'>Usuários Cadastrados</h2>
            </div>

            {users.length === 0 ? (
              <p className='text-gray-400 text-center py-8'>
                Nenhum usuário cadastrado
              </p>
            ) : (
              <div className='space-y-4'>
                {users.map(user => (
                  <div
                    key={user.id}
                    className='flex items-center justify-between p-4 bg-gray-800/50 rounded-lg'
                  >
                    <div>
                      <h3 className='font-semibold'>{user.username}</h3>
                      <p className='text-sm text-gray-400'>
                        Área:{' '}
                        {user.area === 'secretaria' ? 'Secretária' : 'Médica'}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Criado em:{' '}
                        {formatDateToBrazilian(new Date(user.createdAt))}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className='p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors'
                      title='Excluir usuário'
                    >
                      <TrashIcon className='h-5 w-5' />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Adicionar Usuário */}
      {showAddUserModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold'>Adicionar Usuário</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className='p-1 hover:bg-gray-800 rounded'
              >
                <XMarkIcon className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleAddUser} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Nome de usuário
                </label>
                <input
                  type='text'
                  value={newUser.username}
                  onChange={e =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className='w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>Senha</label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={e =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className='w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none pr-10'
                    required
                    minLength={6}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
                  >
                    {showPassword ? (
                      <EyeSlashIcon className='h-5 w-5' />
                    ) : (
                      <EyeIcon className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>
                  Área de acesso
                </label>
                <select
                  value={newUser.area}
                  onChange={e =>
                    setNewUser({
                      ...newUser,
                      area: e.target.value as 'secretaria' | 'medica',
                    })
                  }
                  className='w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none'
                >
                  <option value='secretaria'>Secretária</option>
                  <option value='medica'>Área Médica</option>
                </select>
              </div>

              <div className='flex space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowAddUserModal(false)}
                  className='flex-1 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='flex-1 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors'
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alterar Senha */}
      {showChangePasswordModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold'>Alterar Senha</h3>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className='p-1 hover:bg-gray-800 rounded'
              >
                <XMarkIcon className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Senha atual
                </label>
                <input
                  type='password'
                  value={passwordChange.currentPassword}
                  onChange={e =>
                    setPasswordChange({
                      ...passwordChange,
                      currentPassword: e.target.value,
                    })
                  }
                  className='w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>
                  Nova senha
                </label>
                <div className='relative'>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordChange.newPassword}
                    onChange={e =>
                      setPasswordChange({
                        ...passwordChange,
                        newPassword: e.target.value,
                      })
                    }
                    className='w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none pr-10'
                    required
                    minLength={6}
                  />
                  <button
                    type='button'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className='h-5 w-5' />
                    ) : (
                      <EyeIcon className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>
                  Confirmar nova senha
                </label>
                <div className='relative'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordChange.confirmPassword}
                    onChange={e =>
                      setPasswordChange({
                        ...passwordChange,
                        confirmPassword: e.target.value,
                      })
                    }
                    className='w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none pr-10'
                    required
                    minLength={6}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className='h-5 w-5' />
                    ) : (
                      <EyeIcon className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>

              <div className='flex space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowChangePasswordModal(false)}
                  className='flex-1 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='flex-1 p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors'
                >
                  Alterar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
