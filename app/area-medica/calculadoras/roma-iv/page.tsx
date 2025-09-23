'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RomaIVRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para a página principal das calculadoras com Roma IV selecionado
    router.replace('/area-medica/calculadoras?tab=roma-iv')
  }, [router])

  return (
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <div className='text-white text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
        <p>Redirecionando para Roma IV...</p>
      </div>
    </div>
  )
}
