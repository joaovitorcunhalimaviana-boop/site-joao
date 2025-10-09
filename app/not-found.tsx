'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md bg-gray-800/50 border-gray-700'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold text-white mb-2'>
            Página não encontrada
          </CardTitle>
          <p className='text-gray-300'>
            A página que você está procurando não existe.
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col gap-3'>
            <Button asChild className='w-full'>
              <Link href='/'>
                <Home className='w-4 h-4 mr-2' />
                Voltar ao início
              </Link>
            </Button>
            <Button variant='outline' asChild className='w-full'>
              <Link href='/contato'>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Entre em contato
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
