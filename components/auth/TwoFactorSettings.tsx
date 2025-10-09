'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Smartphone,
  AlertTriangle,
  Settings,
  Trash2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { TwoFactorSetup } from './TwoFactorSetup'

interface TwoFactorStatus {
  enabled: boolean
  setupAt?: string
  lastUsed?: string
  backupCodesCount?: number
}

export function TwoFactorSettings() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [isDisabling, setIsDisabling] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        setStatus({ enabled: false })
      }
    } catch (err) {
      console.error('Erro ao buscar status 2FA:', err)
      setStatus({ enabled: false })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetupComplete = () => {
    setShowSetup(false)
    fetchStatus()
    toast({
      title: '2FA Configurado!',
      description: 'Autenticação de dois fatores ativada com sucesso.',
    })
  }

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      setError('Digite sua senha para confirmar')
      return
    }

    try {
      setIsDisabling(true)
      setError('')

      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          password: disablePassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao desativar 2FA')
      }

      setShowDisableDialog(false)
      setDisablePassword('')
      fetchStatus()

      toast({
        title: '2FA Desativado',
        description: 'Autenticação de dois fatores foi desativada.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desativar 2FA')
    } finally {
      setIsDisabling(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showSetup) {
    return (
      <TwoFactorSetup
        onComplete={handleSetupComplete}
        onCancel={() => setShowSetup(false)}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Shield className='h-6 w-6' />
            <div>
              <CardTitle>Autenticação de Dois Fatores</CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança à sua conta
              </CardDescription>
            </div>
          </div>
          <Badge variant={status?.enabled ? 'default' : 'secondary'}>
            {status?.enabled ? (
              <>
                <ShieldCheck className='h-3 w-3 mr-1' />
                Ativo
              </>
            ) : (
              <>
                <ShieldX className='h-3 w-3 mr-1' />
                Inativo
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {status?.enabled ? (
          <div className='space-y-4'>
            <Alert>
              <ShieldCheck className='h-4 w-4' />
              <AlertDescription>
                Sua conta está protegida com autenticação de dois fatores.
              </AlertDescription>
            </Alert>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Configurado em:</Label>
                <p className='text-sm text-muted-foreground'>
                  {status.setupAt
                    ? new Date(status.setupAt).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </p>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Último uso:</Label>
                <p className='text-sm text-muted-foreground'>
                  {status.lastUsed
                    ? new Date(status.lastUsed).toLocaleDateString('pt-BR')
                    : 'Nunca usado'}
                </p>
              </div>
            </div>

            {status.backupCodesCount !== undefined && (
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Códigos de backup:
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {status.backupCodesCount} códigos disponíveis
                </p>
                {status.backupCodesCount <= 2 && (
                  <Alert>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertDescription>
                      Poucos códigos de backup restantes. Considere gerar novos
                      códigos.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className='flex gap-2'>
              <Dialog
                open={showDisableDialog}
                onOpenChange={setShowDisableDialog}
              >
                <DialogTrigger asChild>
                  <Button variant='destructive' size='sm'>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Desativar 2FA
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Desativar Autenticação de Dois Fatores
                    </DialogTitle>
                    <DialogDescription>
                      Isso removerá a proteção adicional da sua conta. Digite
                      sua senha para confirmar.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4'>
                    {error && (
                      <Alert variant='destructive'>
                        <AlertTriangle className='h-4 w-4' />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className='space-y-2'>
                      <Label htmlFor='disable-password'>Senha atual</Label>
                      <Input
                        id='disable-password'
                        type='password'
                        value={disablePassword}
                        onChange={e => setDisablePassword(e.target.value)}
                        placeholder='Digite sua senha'
                      />
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        onClick={() => {
                          setShowDisableDialog(false)
                          setDisablePassword('')
                          setError('')
                        }}
                        className='flex-1'
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant='destructive'
                        onClick={handleDisable2FA}
                        disabled={isDisabling || !disablePassword}
                        className='flex-1'
                      >
                        {isDisabling ? 'Desativando...' : 'Desativar'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <Alert>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                Sua conta não está protegida com autenticação de dois fatores.
              </AlertDescription>
            </Alert>

            <div className='space-y-3'>
              <h4 className='font-medium'>Benefícios do 2FA:</h4>
              <ul className='text-sm text-muted-foreground space-y-1'>
                <li className='flex items-center gap-2'>
                  <ShieldCheck className='h-4 w-4 text-green-500' />
                  Proteção contra acesso não autorizado
                </li>
                <li className='flex items-center gap-2'>
                  <Smartphone className='h-4 w-4 text-blue-500' />
                  Funciona com aplicativos populares como Google Authenticator
                </li>
                <li className='flex items-center gap-2'>
                  <Settings className='h-4 w-4 text-purple-500' />
                  Códigos de backup para situações de emergência
                </li>
              </ul>
            </div>

            <Button onClick={() => setShowSetup(true)} className='w-full'>
              <Shield className='h-4 w-4 mr-2' />
              Configurar 2FA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
