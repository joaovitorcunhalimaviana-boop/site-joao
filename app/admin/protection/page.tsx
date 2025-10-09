'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProtectionDashboard from '../../../components/admin/protection-dashboard'

interface User {
  name: string
  email: string
  role: string
}

export default function AdminProtectionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      // Verificar se há usuário logado (admin ou médico)
      const adminData = localStorage.getItem('admin')
      const doctorData = localStorage.getItem('doctor')

      if (adminData) {
        setUser(JSON.parse(adminData))
      } else if (doctorData) {
        const doctor = JSON.parse(doctorData)
        setUser({
          name: doctor.name,
          email: doctor.email,
          role: 'doctor',
        })
      } else {
        router.push('/login')
        return
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-white mb-4'>
            Proteção de Dados
          </h1>
          <p className='text-gray-400 text-lg'>
            Sistema de monitoramento e proteção de dados da clínica - Dr. João
            Vitor Viana
          </p>
          <div className='mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700'>
            <p className='text-sm text-gray-300'>
              <span className='font-semibold'>Usuário:</span> {user.name} (
              {user.email})
            </p>
          </div>
        </div>

        {/* Dashboard de Proteção */}
        <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700'>
          <ProtectionDashboard />
        </div>
      </div>
    </div>
  )
}
