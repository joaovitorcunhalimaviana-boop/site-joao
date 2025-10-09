'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='min-h-screen flex items-center justify-center p-4'>
          <Card className='w-full max-w-md'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
                <AlertTriangle className='h-6 w-6 text-red-600' />
              </div>
              <CardTitle className='text-xl font-semibold text-gray-900'>
                Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className='text-center space-y-4'>
              <p className='text-gray-600'>
                Ocorreu um erro inesperado. Por favor, tente novamente.
              </p>
              {process.env['NODE_ENV'] === 'development' && this.state.error && (
                <div className='text-left'>
                  <details className='mt-4'>
                    <summary className='cursor-pointer text-sm font-medium text-gray-700'>
                      Detalhes do erro (desenvolvimento)
                    </summary>
                    <pre className='mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto'>
                      {this.state.error.message}
                      {this.state.error.stack}
                    </pre>
                  </details>
                </div>
              )}
              <Button
                onClick={this.handleReset}
                className='w-full'
                variant='default'
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

