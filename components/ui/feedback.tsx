'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

// Tipos de feedback
type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface FeedbackProps {
  type: FeedbackType
  title?: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

// Configurações de estilo por tipo
const feedbackStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600',
  },
  loading: {
    container: 'bg-gray-50 border-gray-200 text-gray-800',
    icon: Loader2,
    iconColor: 'text-gray-600 animate-spin',
  },
}

// Componente principal de feedback
export function Feedback({
  type,
  title,
  message,
  action,
  className,
  onClose,
  autoClose = false,
  duration = 5000,
}: FeedbackProps) {
  const [isVisible, setIsVisible] = React.useState(true)
  const style = feedbackStyles[type]
  const Icon = style.icon

  React.useEffect(() => {
    if (autoClose && type !== 'loading') {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
    return () => {} // Retorna uma função vazia para satisfazer o TypeScript
  }, [autoClose, duration, onClose, type])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        style.container,
        className
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', style.iconColor)} />

      <div className='flex-1 min-w-0'>
        {title && <h4 className='font-semibold text-sm mb-1'>{title}</h4>}
        <p className='text-sm'>{message}</p>

        {action && (
          <div className='mt-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={action.onClick}
              className='text-xs'
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>

      {onClose && type !== 'loading' && (
        <button
          onClick={() => {
            setIsVisible(false)
            onClose()
          }}
          className='text-gray-400 hover:text-gray-600 transition-colors'
          aria-label='Fechar'
        >
          <XCircle className='w-4 h-4' />
        </button>
      )}
    </div>
  )
}

// Componente de feedback inline para formulários
export function InlineFeedback({
  type,
  message,
  className,
}: {
  type: FeedbackType
  message: string
  className?: string
}) {
  const style = feedbackStyles[type]
  const Icon = style.icon

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm mt-1',
        type === 'success' && 'text-green-600',
        type === 'error' && 'text-red-600',
        type === 'warning' && 'text-yellow-600',
        type === 'info' && 'text-blue-600',
        type === 'loading' && 'text-gray-600',
        className
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 flex-shrink-0',
          type === 'loading' && 'animate-spin'
        )}
      />
      <span>{message}</span>
    </div>
  )
}

// Componente de status para ações
export function ActionStatus({
  status,
  successMessage = 'Ação realizada com sucesso!',
  errorMessage = 'Ocorreu um erro. Tente novamente.',
  loadingMessage = 'Processando...',
  onRetry,
  className,
}: {
  status: 'idle' | 'loading' | 'success' | 'error'
  successMessage?: string
  errorMessage?: string
  loadingMessage?: string
  onRetry?: () => void
  className?: string
}) {
  if (status === 'idle') return null

  return (
    <div className={cn('mt-4', className)}>
      {status === 'loading' && (
        <InlineFeedback type='loading' message={loadingMessage} />
      )}

      {status === 'success' && (
        <InlineFeedback type='success' message={successMessage} />
      )}

      {status === 'error' && (
        <div className='space-y-2'>
          <InlineFeedback type='error' message={errorMessage} />
          {onRetry && (
            <Button
              variant='outline'
              size='sm'
              onClick={onRetry}
              className='text-xs'
            >
              Tentar novamente
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Hook para gerenciar feedback com toast
export function useFeedback() {
  const { toast } = useToast()

  const showSuccess = React.useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'Sucesso',
        description: message,
        variant: 'default',
      })
    },
    [toast]
  )

  const showError = React.useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'Erro',
        description: message,
        variant: 'destructive',
      })
    },
    [toast]
  )

  const showWarning = React.useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'Atenção',
        description: message,
        variant: 'default',
      })
    },
    [toast]
  )

  const showInfo = React.useCallback(
    (message: string, title?: string) => {
      toast({
        title: title || 'Informação',
        description: message,
        variant: 'default',
      })
    },
    [toast]
  )

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}

// Hook para gerenciar estado de ação com feedback
export function useActionState<T = any>({
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
} = {}) {
  const [status, setStatus] = React.useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [data, setData] = React.useState<T | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const { showSuccess, showError } = useFeedback()

  const execute = React.useCallback(
    async (action: () => Promise<T>) => {
      try {
        setStatus('loading')
        setError(null)

        const result = await action()

        setData(result)
        setStatus('success')

        if (successMessage) {
          showSuccess(successMessage)
        }

        onSuccess?.(result)

        return result
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Erro desconhecido')
        setError(error)
        setStatus('error')

        if (errorMessage) {
          showError(errorMessage)
        }

        onError?.(error)
        throw error
      }
    },
    [onSuccess, onError, successMessage, errorMessage, showSuccess, showError]
  )

  const reset = React.useCallback(() => {
    setStatus('idle')
    setData(null)
    setError(null)
  }, [])

  return {
    status,
    data,
    error,
    execute,
    reset,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle',
  }
}

// Componente de feedback para formulários médicos
export function MedicalFormFeedback({
  type,
  message,
  details,
  className,
}: {
  type: FeedbackType
  message: string
  details?: string[]
  className?: string
}) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border-l-4',
        type === 'success' && 'bg-green-50 border-green-400 text-green-800',
        type === 'error' && 'bg-red-50 border-red-400 text-red-800',
        type === 'warning' && 'bg-yellow-50 border-yellow-400 text-yellow-800',
        type === 'info' && 'bg-blue-50 border-blue-400 text-blue-800',
        className
      )}
    >
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0'>
          {type === 'success' && (
            <CheckCircle className='w-5 h-5 text-green-600' />
          )}
          {type === 'error' && <XCircle className='w-5 h-5 text-red-600' />}
          {type === 'warning' && (
            <AlertCircle className='w-5 h-5 text-yellow-600' />
          )}
          {type === 'info' && <Info className='w-5 h-5 text-blue-600' />}
        </div>

        <div className='flex-1'>
          <p className='font-medium text-sm mb-1'>{message}</p>

          {details && details.length > 0 && (
            <ul className='text-sm space-y-1 mt-2'>
              {details.map((detail, index) => (
                <li key={index} className='flex items-start gap-2'>
                  <span className='w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0' />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente de progresso com feedback
export function ProgressFeedback({
  steps,
  currentStep,
  className,
}: {
  steps: { label: string; description?: string }[]
  currentStep: number
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isPending = index > currentStep

        return (
          <div key={index} className='flex items-start gap-3'>
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                isCompleted && 'bg-green-600 text-white',
                isCurrent && 'bg-blue-600 text-white',
                isPending && 'bg-gray-200 text-gray-600'
              )}
            >
              {isCompleted ? <CheckCircle className='w-4 h-4' /> : index + 1}
            </div>

            <div className='flex-1'>
              <p
                className={cn(
                  'font-medium text-sm',
                  isCompleted && 'text-green-800',
                  isCurrent && 'text-blue-800',
                  isPending && 'text-gray-600'
                )}
              >
                {step.label}
              </p>

              {step.description && (
                <p
                  className={cn(
                    'text-xs mt-1',
                    isCompleted && 'text-green-600',
                    isCurrent && 'text-blue-600',
                    isPending && 'text-gray-500'
                  )}
                >
                  {step.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
