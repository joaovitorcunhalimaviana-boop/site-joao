'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

// Lista reorganizada logicamente conforme solicitado
const DIAGNOSTIC_CONDITIONS = [
  // 1. DOENÇAS ORIFICIAIS
  'Doença Hemorroidária',
  'Fissura Anal',
  'Fístula Anal',
  'Abcesso Anorretal',
  'Condiloma Acuminado',
  'Outras ISTs',
  'Dermatite Perianal',
  'Doença Pilonidal',

  // 2. DOENÇAS DO CÓLON
  'Doença de Crohn',
  'Retocolite Ulcerativa',
  'Pólipos Colorretais',
  'Câncer Colorretal',
  'Doença Diverticular',
  'Colite Isquêmica',
  'Colite Actínica',
  'Colite Microscópica',
  'Melanose Coli',
  'Lipoma Colônico',
  'Angiodisplasia',
  'Megacólon',
  'Intussuscepção',
  'Oclusão Intestinal',
  'Perfuração Intestinal',
  'Sangramento Digestivo Baixo',

  // 3. DOENÇAS FUNCIONAIS
  'Constipação',
  'Incontinência',
  'Síndrome do Intestino Irritável',
  'Doença Celíaca',
  'Intolerância à Lactose',
  'Outras Intolerâncias Alimentares',
  'Prolapso Retal',
  'Coccidínia',
  'Síndrome do Levantador do Ânus',
  'Neuropatia do Pudendo',
  'Tenesmo',
  'Proctalgia Fugax',
  'Anismus',
  'Retocele',
  'Enterocele',
  'Sigmoidocele',

  // 4. HÉRNIAS
  'Hérnia Inguinal',
  'Hérnia Umbilical',
  'Hérnia Femoral',
  'Hérnia Incisional',
  'Hérnia Epigástrica',
  'Hérnia de Spiegel',
  'Hérnia Lombar',
  'Outras Hérnias',

  // 5. DOENÇAS DO FÍGADO E VIAS BILIARES
  'Colelitíase',
  'Colecistite',
  'Coledocolitíase',
  'Colangite',
  'Outras Doenças da Vesícula Biliar',
  'Doenças do Fígado e Vias Biliares',

  // 6. DOR ABDOMINAL E OUTROS DIAGNÓSTICOS
  'Dor Abdominal a Esclarecer',
  'Outro Diagnóstico',
]

interface DiagnosticDropdownProps {
  selectedDiagnoses: string[]
  onSelectionChange: (diagnoses: string[]) => void
  placeholder?: string
}

export function DiagnosticDropdown({
  selectedDiagnoses,
  onSelectionChange,
  placeholder = 'Selecione as hipóteses diagnósticas...',
}: DiagnosticDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filtrar condições baseado no termo de busca
  const filteredConditions = DIAGNOSTIC_CONDITIONS.filter(condition =>
    condition.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleCondition = (condition: string) => {
    if (selectedDiagnoses.includes(condition)) {
      onSelectionChange(selectedDiagnoses.filter(d => d !== condition))
    } else {
      onSelectionChange([...selectedDiagnoses, condition])
    }
  }

  const removeCondition = (condition: string) => {
    onSelectionChange(selectedDiagnoses.filter(d => d !== condition))
  }

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Campo principal do dropdown */}
      <div
        className='bg-gray-700 border border-gray-600 rounded-lg p-3 cursor-pointer hover:border-gray-500 transition-colors'
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            {selectedDiagnoses.length === 0 ? (
              <span className='text-gray-400'>{placeholder}</span>
            ) : (
              <span className='text-white'>
                {selectedDiagnoses.length} diagnóstico
                {selectedDiagnoses.length !== 1 ? 's' : ''} selecionado
                {selectedDiagnoses.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Tags dos diagnósticos selecionados */}
      {selectedDiagnoses.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-2'>
          {selectedDiagnoses.map(diagnosis => (
            <div
              key={diagnosis}
              className='bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2'
            >
              <span>{diagnosis}</span>
              <button
                onClick={e => {
                  e.stopPropagation()
                  removeCondition(diagnosis)
                }}
                className='hover:bg-blue-700 rounded-full p-0.5 transition-colors'
              >
                <X className='w-3 h-3' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lista dropdown */}
      {isOpen && (
        <div className='absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden'>
          {/* Campo de busca */}
          <div className='p-3 border-b border-gray-600'>
            <input
              type='text'
              placeholder='Buscar diagnóstico...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Lista de opções */}
          <div className='max-h-60 overflow-y-auto'>
            {filteredConditions.length === 0 ? (
              <div className='p-3 text-gray-400 text-center'>
                Nenhum diagnóstico encontrado
              </div>
            ) : (
              filteredConditions.map(condition => (
                <div
                  key={condition}
                  className={`p-3 cursor-pointer hover:bg-gray-600 transition-colors flex items-center gap-3 ${
                    selectedDiagnoses.includes(condition) ? 'bg-gray-600' : ''
                  }`}
                  onClick={() => toggleCondition(condition)}
                >
                  <input
                    type='checkbox'
                    checked={selectedDiagnoses.includes(condition)}
                    onChange={() => {}} // Controlado pelo onClick do div
                    className='w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500'
                  />
                  <span className='text-white text-sm'>{condition}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
