'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md bg-gray-800/50 border-gray-700'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <AlertTriangle className='w-12 h-12 text-red-500' />
          </div>
          <CardTitle className='text-2xl font-bold text-white mb-2'>
            Algo deu errado!
          </CardTitle>
          <p className='text-gray-300'>
            Ocorreu um erro inesperado. Tente novamente.
          </p>
        </CardHeader>
        <CardContent>
          <Button onClick={reset} className='w-full'>
            <RefreshCw className='w-4 h-4 mr-2' />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
