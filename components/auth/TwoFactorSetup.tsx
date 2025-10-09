'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  Smartphone,
  Key,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import QRCode from 'qrcode'

interface TwoFactorSetupProps {
  onComplete?: () => void
  onCancel?: () => void
}

interface SetupData {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
  manualEntryKey: string
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup' | 'complete'>(
    'setup'
  )
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    initializeSetup()
  }, [])

  const initializeSetup = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao inicializar configuração 2FA')
      }

      const data = await response.json()
      setSetupData(data)

      // Gerar QR Code
      const qrDataUrl = await QRCode.toDataURL(data.qrCodeUrl)
      setQrCodeDataUrl(qrDataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyAndActivate = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Digite um código de 6 dígitos válido')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          token: verificationCode,
          mode: 'setup',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha na verificação')
      }

      setStep('backup')
      toast({
        title: '2FA Ativado!',
        description: 'Autenticação de dois fatores configurada com sucesso.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na verificação')
    } finally {
      setIsLoading(false)
    }
  }

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'))
      setCopiedBackupCodes(true)
      toast({
        title: 'Códigos copiados!',
        description: 'Códigos de backup copiados para a área de transferência.',
      })
    }
  }

  const copyManualKey = () => {
    if (setupData?.manualEntryKey) {
      navigator.clipboard.writeText(setupData.manualEntryKey)
      toast({
        title: 'Chave copiada!',
        description: 'Chave manual copiada para a área de transferência.',
      })
    }
  }

  const finishSetup = () => {
    setStep('complete')
    setTimeout(() => {
      onComplete?.()
    }, 2000)
  }

  if (isLoading && !setupData) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Shield className='h-6 w-6 text-primary' />
          <CardTitle>Configurar Autenticação de Dois Fatores</CardTitle>
        </div>
        <CardDescription>
          Adicione uma camada extra de segurança à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {error && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'setup' && setupData && (
          <div className='space-y-6'>
            <div className='text-center space-y-4'>
              <h3 className='text-lg font-semibold'>1. Escaneie o QR Code</h3>
              <p className='text-sm text-muted-foreground'>
                Use um aplicativo autenticador como Google Authenticator, Authy
                ou Microsoft Authenticator
              </p>

              {qrCodeDataUrl && (
                <div className='flex justify-center'>
                  <img
                    src={qrCodeDataUrl}
                    alt='QR Code 2FA'
                    className='border rounded-lg'
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <Key className='h-5 w-5' />
                2. Ou digite manualmente
              </h3>
              <div className='bg-muted p-4 rounded-lg'>
                <p className='text-sm font-mono break-all'>
                  {setupData.manualEntryKey}
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-2'
                  onClick={copyManualKey}
                >
                  <Copy className='h-4 w-4 mr-2' />
                  Copiar chave
                </Button>
              </div>
            </div>

            <Separator />

            <div className='space-y-4'>
              <h3 className='text-lg font-semibold flex items-center gap-2'>
                <Smartphone className='h-5 w-5' />
                3. Digite o código do app
              </h3>
              <div className='flex gap-2'>
                <Input
                  placeholder='000000'
                  value={verificationCode}
                  onChange={e =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, '').slice(0, 6)
                    )
                  }
                  maxLength={6}
                  className='text-center text-lg font-mono'
                />
                <Button
                  onClick={verifyAndActivate}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? 'Verificando...' : 'Verificar'}
                </Button>
              </div>
            </div>

            <div className='flex gap-2 pt-4'>
              <Button variant='outline' onClick={onCancel} className='flex-1'>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && setupData && (
          <div className='space-y-6'>
            <div className='text-center space-y-2'>
              <Check className='h-12 w-12 text-green-500 mx-auto' />
              <h3 className='text-lg font-semibold'>
                2FA Ativado com Sucesso!
              </h3>
              <p className='text-sm text-muted-foreground'>
                Salve seus códigos de backup em local seguro
              </p>
            </div>

            <Alert>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                <strong>Importante:</strong> Guarde estes códigos em local
                seguro. Você pode usá-los para acessar sua conta se perder o
                acesso ao aplicativo autenticador.
              </AlertDescription>
            </Alert>

            <div className='space-y-4'>
              <h4 className='font-semibold'>Códigos de Backup:</h4>
              <div className='bg-muted p-4 rounded-lg'>
                <div className='grid grid-cols-2 gap-2 font-mono text-sm'>
                  {setupData.backupCodes.map((code, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <Badge variant='outline'>{index + 1}</Badge>
                      <span>{code}</span>
                    </div>
                  ))}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-4'
                  onClick={copyBackupCodes}
                >
                  {copiedBackupCodes ? (
                    <>
                      <Check className='h-4 w-4 mr-2' />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4 mr-2' />
                      Copiar códigos
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Button onClick={finishSetup} className='w-full'>
              Concluir Configuração
            </Button>
          </div>
        )}

        {step === 'complete' && (
          <div className='text-center space-y-4'>
            <Check className='h-16 w-16 text-green-500 mx-auto' />
            <h3 className='text-xl font-semibold'>Configuração Concluída!</h3>
            <p className='text-muted-foreground'>
              Sua conta agora está protegida com autenticação de dois fatores.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
