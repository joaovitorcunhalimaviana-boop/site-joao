'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

function AgendamentoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-gray-800 rounded-lg shadow-lg'>
          <div className='p-6 border-b border-gray-700'>
            <div className='flex items-center justify-between'>
              <h1 className='text-2xl font-bold'>Agendamento</h1>
              <MedicalAreaMenu currentPage='agendamento' />
            </div>
          </div>

          <div className='p-6'>
            <div className='text-center py-12'>
              <h2 className='text-xl text-gray-300 mb-4'>
                Página de Agendamento
              </h2>
              <p className='text-gray-400'>
                {patientId
                  ? `Agendamento para paciente: ${patientId}`
                  : 'Selecione um paciente para agendar'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgendamentoPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-900 text-white flex items-center justify-center'>
          Carregando...
        </div>
      }
    >
      <AgendamentoContent />
    </Suspense>
  )
}
