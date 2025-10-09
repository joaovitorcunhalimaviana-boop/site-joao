'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Smartphone, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TwoFactorVerificationProps {
  tempToken: string
  onSuccess: (tokens: { accessToken: string; user: any }) => void
  onBack: () => void
  userEmail?: string
}

export function TwoFactorVerification({
  tempToken,
  onSuccess,
  onBack,
  userEmail,
}: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const { toast } = useToast()

  const maxAttempts = 3

  const handleVerification = async () => {
    const code = useBackupCode ? backupCode : verificationCode

    if (!code || (useBackupCode ? code.length !== 8 : code.length !== 6)) {
      setError(
        useBackupCode
          ? 'Digite um código de backup válido (8 dígitos)'
          : 'Digite um código válido (6 dígitos)'
      )
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({
          token: code,
          mode: 'login',
          isBackupCode: useBackupCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAttempts(prev => prev + 1)

        if (attempts + 1 >= maxAttempts) {
          setError('Muitas tentativas falharam. Tente novamente mais tarde.')
          setTimeout(() => {
            onBack()
          }, 3000)
          return
        }

        throw new Error(data.error || 'Código inválido')
      }

      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta.',
      })

      onSuccess({
        accessToken: data.accessToken,
        user: data.user,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na verificação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerification()
    }
  }

  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode)
    setVerificationCode('')
    setBackupCode('')
    setError('')
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Shield className='h-6 w-6 text-primary' />
          <CardTitle>Verificação de Dois Fatores</CardTitle>
        </div>
        <CardDescription>
          {userEmail && (
            <span className='block mb-2'>
              Entrando como: <strong>{userEmail}</strong>
            </span>
          )}
          {useBackupCode
            ? 'Digite um dos seus códigos de backup'
            : 'Digite o código do seu aplicativo autenticador'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {error && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {attempts > 0 && attempts < maxAttempts && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Tentativa {attempts} de {maxAttempts}. {maxAttempts - attempts}{' '}
              tentativas restantes.
            </AlertDescription>
          </Alert>
        )}

        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Smartphone className='h-4 w-4' />
            <span>
              {useBackupCode ? 'Código de Backup' : 'Código do Aplicativo'}
            </span>
          </div>

          <Input
            placeholder={useBackupCode ? '12345678' : '000000'}
            value={useBackupCode ? backupCode : verificationCode}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '')
              if (useBackupCode) {
                setBackupCode(value.slice(0, 8))
              } else {
                setVerificationCode(value.slice(0, 6))
              }
            }}
            maxLength={useBackupCode ? 8 : 6}
            className='text-center text-lg font-mono'
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            autoFocus
          />

          <Button
            onClick={handleVerification}
            disabled={
              isLoading ||
              (useBackupCode
                ? backupCode.length !== 8
                : verificationCode.length !== 6)
            }
            className='w-full'
          >
            {isLoading ? 'Verificando...' : 'Verificar Código'}
          </Button>
        </div>

        <div className='space-y-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleBackupCode}
            className='w-full text-sm'
            disabled={isLoading}
          >
            {useBackupCode
              ? 'Usar código do aplicativo autenticador'
              : 'Usar código de backup'}
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={onBack}
            className='w-full'
            disabled={isLoading}
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar ao Login
          </Button>
        </div>

        <div className='text-xs text-muted-foreground text-center space-y-1'>
          <p>Não consegue acessar seu aplicativo autenticador?</p>
          <p>
            Use um dos códigos de backup que você salvou durante a configuração.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
