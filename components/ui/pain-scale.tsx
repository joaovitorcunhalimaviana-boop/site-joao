'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PainScaleProps {
  onScaleChange: (restPain: number, movementPain: number) => void
  initialRestPain?: number
  initialMovementPain?: number
  disabled?: boolean
}

const painLevels = [
  { value: 0, label: 'Sem dor', color: 'bg-green-500', emoji: '😊' },
  { value: 1, label: 'Dor muito leve', color: 'bg-green-400', emoji: '🙂' },
  { value: 2, label: 'Dor leve', color: 'bg-lime-400', emoji: '😐' },
  { value: 3, label: 'Dor moderada', color: 'bg-yellow-400', emoji: '😕' },
  { value: 4, label: 'Dor moderada+', color: 'bg-yellow-500', emoji: '😟' },
  { value: 5, label: 'Dor intensa', color: 'bg-orange-400', emoji: '😣' },
  { value: 6, label: 'Dor intensa+', color: 'bg-orange-500', emoji: '😖' },
  { value: 7, label: 'Dor severa', color: 'bg-red-400', emoji: '😫' },
  { value: 8, label: 'Dor severa+', color: 'bg-red-500', emoji: '😩' },
  { value: 9, label: 'Dor insuportável', color: 'bg-red-600', emoji: '😭' },
  { value: 10, label: 'Pior dor possível', color: 'bg-red-700', emoji: '😱' },
]

export function PainScale({ 
  onScaleChange, 
  initialRestPain = 0, 
  initialMovementPain = 0,
  disabled = false 
}: PainScaleProps) {
  const [restPain, setRestPain] = useState(initialRestPain)
  const [movementPain, setMovementPain] = useState(initialMovementPain)

  const handleRestPainChange = (value: number) => {
    if (disabled) return
    setRestPain(value)
    onScaleChange(value, movementPain)
  }

  const handleMovementPainChange = (value: number) => {
    if (disabled) return
    setMovementPain(value)
    onScaleChange(restPain, value)
  }

  const PainScaleRow = ({ 
    title, 
    value, 
    onChange, 
    id 
  }: { 
    title: string
    value: number
    onChange: (value: number) => void
    id: string
  }) => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
      
      {/* Escala visual com emojis */}
      <div className="grid grid-cols-11 gap-1 mb-4">
        {painLevels.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            disabled={disabled}
            className={`
              relative p-2 rounded-lg border-2 transition-all duration-200
              ${value === level.value 
                ? 'border-blue-500 ring-2 ring-blue-200 scale-110' 
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              ${level.color}
            `}
            title={`${level.value} - ${level.label}`}
          >
            <div className="text-lg">{level.emoji}</div>
            <div className="text-xs font-bold text-white bg-black bg-opacity-50 rounded px-1">
              {level.value}
            </div>
          </button>
        ))}
      </div>

      {/* Escala numérica tradicional */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">0 - Sem dor</span>
        <div className="flex space-x-2">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              disabled={disabled}
              className={`
                w-8 h-8 rounded-full border-2 text-sm font-medium transition-all
                ${value === i 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
              `}
            >
              {i}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">10 - Pior dor possível</span>
      </div>

      {/* Descrição da dor selecionada */}
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">{painLevels[value].emoji}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {value}/10 - {painLevels[value].label}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Escala Visual Analógica de Dor
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Avalie sua dor em duas situações diferentes
        </p>
      </div>

      <PainScaleRow
        title="🛏️ Dor em repouso"
        value={restPain}
        onChange={handleRestPainChange}
        id="rest-pain"
      />

      <PainScaleRow
        title="🚶 Dor em movimento"
        value={movementPain}
        onChange={handleMovementPainChange}
        id="movement-pain"
      />

      {/* Resumo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Resumo da Avaliação
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300">Dor em repouso:</span>
            <span className="ml-2 font-medium">{restPain}/10</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">Dor em movimento:</span>
            <span className="ml-2 font-medium">{movementPain}/10</span>
          </div>
        </div>
      </div>

      {/* Orientações */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• Clique nos emojis ou números para selecionar o nível de dor</p>
        <p>• A dor em repouso é quando você está parado, sem se mover</p>
        <p>• A dor em movimento é quando você caminha ou se movimenta</p>
      </div>
    </div>
  )
}

// Componente simplificado para uso em formulários
export function SimplePainScale({ 
  label = "Nível de dor (0-10)", 
  value = 0, 
  onChange,
  disabled = false 
}: {
  label?: string
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div className="flex items-center space-x-2">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            disabled={disabled}
            className={`
              w-8 h-8 rounded-full border-2 text-sm font-medium transition-all
              ${value === i 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
            `}
          >
            {i}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Sem dor</span>
        <span>Pior dor possível</span>
      </div>
      
      {value > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Nível selecionado: <span className="font-medium">{value}/10 - {painLevels[value].label}</span>
        </div>
      )}
    </div>
  )
}