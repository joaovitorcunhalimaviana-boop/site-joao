'use client'

import React, { useState, memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, Save, FileText, RotateCcw } from 'lucide-react'

interface BaseCalculatorProps {
  title: string
  description?: string
  children: React.ReactNode
  result?: React.ReactNode
  onSaveResult?: ((result: any) => void) | undefined
  onReset?: () => void
  onPrint?: () => void
  darkMode?: boolean
  isComplete?: boolean
  calculatorData?: any
}

const BaseCalculator = memo(function BaseCalculator({
  title,
  description,
  children,
  result,
  onSaveResult,
  onReset,
  onPrint,
  darkMode = true,
  isComplete = false,
  calculatorData,
}: BaseCalculatorProps) {
  const handleSave = useCallback(() => {
    if (onSaveResult && calculatorData) {
      onSaveResult(calculatorData)
    }
  }, [onSaveResult, calculatorData])

  const handlePrint = useCallback(() => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }, [onPrint])

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset()
    }
  }, [onReset])

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700'>
            <Calculator className='h-6 w-6 text-blue-400' />
          </div>
          <div>
            <h2 className='text-xl font-bold text-white'>{title}</h2>
            {description && (
              <p className='text-gray-300 text-sm'>{description}</p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {onReset && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleReset}
              className='border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800'
            >
              <RotateCcw className='h-4 w-4 mr-1' />
              Limpar
            </Button>
          )}

          <Button
            variant='outline'
            size='sm'
            onClick={handlePrint}
            className='border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800'
          >
            <FileText className='h-4 w-4 mr-1' />
            Imprimir
          </Button>

          {isComplete && onSaveResult && (
            <Button
              size='sm'
              onClick={handleSave}
              className='bg-green-600 hover:bg-green-700 text-white'
            >
              <Save className='h-4 w-4 mr-1' />
              Salvar
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Calculator Form */}
        <div className='space-y-4'>{children}</div>

        {/* Results */}
        {result && (
          <div className='space-y-4'>
            <Card className='bg-gray-900/50 backdrop-blur-sm border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <Calculator className='h-5 w-5 text-green-400' />
                  Resultado
                </CardTitle>
              </CardHeader>
              <CardContent>{result}</CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
})

export default BaseCalculator

// Utility components for consistent styling
export const CalculatorCard = memo(function CalculatorCard({
  children,
  title,
  className = '',
}: {
  children: React.ReactNode
  title?: string
  className?: string
}) {
  return (
    <Card
      className={`bg-gray-900/50 backdrop-blur-sm border-gray-700 ${className}`}
    >
      {title && (
        <CardHeader>
          <CardTitle className='text-white'>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
})

export const CalculatorQuestion = memo(function CalculatorQuestion({
  question,
  children,
  required = false,
}: {
  question: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className='space-y-3'>
      <label className='block text-sm font-medium text-white'>
        {question}
        {required && <span className='text-red-400 ml-1'>*</span>}
      </label>
      {children}
    </div>
  )
})

export const CalculatorResult = memo(function CalculatorResult({
  label,
  value,
  interpretation,
  color = 'blue',
}: {
  label: string
  value: string | number
  interpretation?: string
  color?: 'blue' | 'green' | 'yellow' | 'red'
}) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-900/20 border-blue-700',
    green: 'text-green-400 bg-green-900/20 border-green-700',
    yellow: 'text-yellow-400 bg-yellow-900/20 border-yellow-700',
    red: 'text-red-400 bg-red-900/20 border-red-700',
  }

  // Verificar se a cor existe no objeto colorClasses
  const selectedColorClass = colorClasses[color] || colorClasses.blue
  const textColorClass = selectedColorClass.split(' ')[0] || 'text-blue-400'

  return (
    <div className={`p-4 rounded-lg border ${selectedColorClass}`}>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-white font-medium'>{label}</span>
        <span
          className={`text-2xl font-bold ${textColorClass}`}
        >
          {value}
        </span>
      </div>
      {interpretation && (
        <p className='text-gray-300 text-sm'>{interpretation}</p>
      )}
    </div>
  )
})
