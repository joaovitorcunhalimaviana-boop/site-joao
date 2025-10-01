'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/ui/header'
import BackgroundPattern from '../../../components/ui/background-pattern'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import ProtectionDashboard from '../../../components/admin/protection-dashboard'

interface Doctor {
  name: string
  email: string
  specialty: string
  crm: string
}

export default function ProtecaoDadosPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const doctorData = localStorage.getItem('doctor')
      if (doctorData) {
        setDoctor(JSON.parse(doctorData))
      } else {
        router.push('/login-medico')
        return
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!doctor) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <BackgroundPattern />
      <Header />
      
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Lateral */}
          <div className="lg:w-1/4">
            <MedicalAreaMenu currentPage="protecao-dados" />
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:w-3/4">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Proteção de Dados
                </h1>
                <p className="text-gray-400">
                  Sistema de monitoramento e proteção de dados da clínica - {doctor.name}
                </p>
              </div>

              {/* Dashboard de Proteção */}
              <ProtectionDashboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
