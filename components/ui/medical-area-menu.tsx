'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import {
  Bars3Icon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EnvelopeIcon,
  CogIcon,
  ScissorsIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

interface Doctor {
  name: string
  email: string
  specialty: string
  crm: string
}

interface MedicalAreaMenuProps {
  currentPage?: string
}

export default function MedicalAreaMenu({ currentPage }: MedicalAreaMenuProps) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const doctorData = localStorage.getItem('doctor')
      if (doctorData) {
        setDoctor(JSON.parse(doctorData))
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && buttonRect) {
        const target = event.target as Element
        if (!target.closest('.dropdown-container')) {
          setShowDropdown(false)
        }
      }
    }

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showDropdown, buttonRect])

  const handleLogout = () => {
    localStorage.removeItem('doctor')
    router.push('/login-medico')
  }

  const handleNavigation = (href: string) => {
    console.log('Navegando para:', href)
    setShowDropdown(false)
    // Usar router.push do Next.js
    router.push(href)
  }

  const menuItems = [
    {
      href: '/area-medica',
      label: 'Dashboard',
      icon: ChartBarIcon,
    },
    {
      href: '/area-medica/pacientes',
      label: 'Lista de Pacientes',
      icon: UserGroupIcon,
    },
    {
      href: '/area-medica/agenda',
      label: 'Gestão de Agenda',
      icon: CalendarDaysIcon,
    },
    {
      href: '/area-medica/whatsapp',
      label: 'Sistema de WhatsApp',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      href: '/area-medica/cirurgias',
      label: 'Controle de Cirurgias',
      icon: ScissorsIcon,
    },
    {
      href: '/area-medica/relatorios',
      label: 'Relatórios de Atendimentos',
      icon: DocumentTextIcon,
    },
    {
      href: '/area-medica/newsletter',
      label: 'Newsletter',
      icon: EnvelopeIcon,
    },
    {
      href: '/area-medica/administracao',
      label: 'Administração',
      icon: CogIcon,
    },
    {
      href: '/area-medica/protecao-dados',
      label: 'Proteção de Dados',
      icon: CogIcon,
    },
  ]

  return (
    <div className='flex items-center gap-3 relative'>
      {/* Menu Dropdown */}
      <div className='relative dropdown-container'>
        <button
          onClick={e => {
            console.log('Menu button clicked!')
            const rect = e.currentTarget.getBoundingClientRect()
            setButtonRect(rect)
            setShowDropdown(!showDropdown)
          }}
          className='flex items-center px-4 py-2 text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-900/50 rounded-lg transition-all duration-200 border border-gray-700 backdrop-blur-sm'
        >
          <Bars3Icon className='h-4 w-4 mr-2' />
          Menu
          <ChevronDownIcon
            className={`h-4 w-4 ml-2 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>

        {showDropdown &&
          buttonRect &&
          typeof window !== 'undefined' &&
          createPortal(
            <div
              className='bg-gray-900/95 rounded-lg shadow-xl border border-gray-700 py-2'
              style={{
                position: 'fixed',
                top: buttonRect.bottom + 8,
                left: buttonRect.left, // Alinhado à esquerda do botão
                width: '16rem', // w-64
                zIndex: 999999999,
              }}
            >
              {menuItems.map((item, index) => {
                const Icon = item.icon

                return (
                  <button
                    key={index}
                    className='flex items-center w-full px-4 py-3 text-sm transition-all duration-200 text-left text-gray-300 hover:text-blue-400 hover:bg-gray-800/50'
                    onClick={() => handleNavigation(item.href)}
                  >
                    <Icon className='h-4 w-4 mr-3' />
                    {item.label}
                  </button>
                )
              })}

              <div className='border-t border-gray-700 my-2'></div>

              <button
                onClick={() => {
                  handleLogout()
                  setShowDropdown(false)
                }}
                className='flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-gray-800/50 transition-all duration-200'
              >
                <ArrowRightOnRectangleIcon className='h-4 w-4 mr-3' />
                Sair
              </button>
            </div>,
            document.body
          )}
      </div>


    </div>
  )
}
