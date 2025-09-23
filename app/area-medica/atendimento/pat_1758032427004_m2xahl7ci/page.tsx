'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectOldPatientId() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar automaticamente para o ID correto
    console.log('Redirecionando ID antigo para ID correto: 1')
    router.replace('/area-medica/atendimento/1')
  }, [])

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <h2 className='text-xl font-semibold mb-2'>Redirecionando...</h2>
        <p className='text-gray-600'>
          Você será redirecionado para a página correta do paciente.
        </p>
      </div>
    </div>
  )
}
