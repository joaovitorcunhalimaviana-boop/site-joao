'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface TussProcedure {
  id: string
  tussCode: string
  description: string
  category?: string | null
  value?: number | string | null
  createdAt: Date
  updatedAt: Date
}

interface SurgeryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editingSurgery?: any
  patients: any[]
}

export default function SurgeryForm({
  isOpen,
  onClose,
  onSubmit,
  editingSurgery
}: SurgeryFormProps) {
  const [selectedProcedures, setSelectedProcedures] = useState<Array<{
    tussCode: string
    description: string
    quantity: number
  }>>([])

  const [formData, setFormData] = useState({
    patientName: '',
    surgeryType: '',
    hospital: '',
    surgeryDate: '',
    surgeryTime: '',
    paymentType: 'PARTICULAR' as 'PARTICULAR' | 'INSURANCE',
    insurancePlan: '',
    totalAmount: '',
    hospitalAmount: '',
    anesthesiologistAmount: '',
    instrumentalistAmount: '',
    assistantAmount: '',
    surgeonAmount: '', // Novo campo para valor do cirurgião
    notes: '',
  })

  // Log para monitorar mudanças no formData
  useEffect(() => {
    console.log('=== FORMDATA ATUALIZADO ===')
    console.log('FormData atual:', formData)
  }, [formData])

  const resetForm = () => {
    setFormData({
      patientName: '',
      surgeryType: '',
      hospital: '',
      surgeryDate: '',
      surgeryTime: '',
      paymentType: 'PARTICULAR',
      insurancePlan: '',
      totalAmount: '',
      hospitalAmount: '',
      anesthesiologistAmount: '',
      instrumentalistAmount: '',
      assistantAmount: '',
      surgeonAmount: '',
      notes: '',
    })
    setSelectedProcedures([])
  }

  // Função para converter data do formato ISO para DD/MM/YYYY
  const formatDateToBrazilian = (isoDate: string) => {
    if (!isoDate) return ''
    const date = new Date(isoDate)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Função para converter data do formato DD/MM/YYYY para ISO
  const formatDateToISO = (brazilianDate: string) => {
    if (!brazilianDate) return ''
    const [day, month, year] = brazilianDate.split('/')
    if (!day || !month || !year) return ''
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  useEffect(() => {
    if (editingSurgery) {
      setFormData({
        patientName: editingSurgery.medicalPatient?.fullName || editingSurgery.patientName || '',
        surgeryType: editingSurgery.surgeryType,
        hospital: editingSurgery.hospital,
        surgeryDate: formatDateToBrazilian(editingSurgery.surgeryDate),
        surgeryTime: editingSurgery.surgeryTime,
        paymentType: editingSurgery.paymentType,
        insurancePlan: editingSurgery.insurancePlan || '',
        totalAmount: editingSurgery.totalAmount?.toString() || '',
        hospitalAmount: editingSurgery.hospitalAmount?.toString() || '',
        anesthesiologistAmount: editingSurgery.anesthesiologistAmount?.toString() || '',
        instrumentalistAmount: editingSurgery.instrumentalistAmount?.toString() || '',
        assistantAmount: editingSurgery.assistantAmount?.toString() || '',
        surgeonAmount: editingSurgery.surgeonAmount?.toString() || '',
        notes: editingSurgery.notes || '',
      })
      
      // Carregar procedimentos se existirem
      if (editingSurgery.procedures) {
        setSelectedProcedures(editingSurgery.procedures.map(p => ({
          tussCode: p.tussProcedure?.tussCode || p.tussCode || '',
          description: p.tussProcedure?.description || p.description || '',
          quantity: p.quantity || 1
        })))
      }
    }
  }, [editingSurgery])

  const addTussProcedure = () => {
    setSelectedProcedures(prev => [...prev, {
      tussCode: '',
      description: '',
      quantity: 1
    }])
  }

  const removeTussProcedure = (index: number) => {
    setSelectedProcedures(prev => prev.filter((_, i) => i !== index))
  }

  const updateTussProcedure = (index: number, field: string, value: any) => {
    setSelectedProcedures(prev => prev.map((proc, i) => 
      i === index ? { ...proc, [field]: value } : proc
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log('=== INÍCIO DO HANDLESUBMIT ===')
    console.log('FormData COMPLETO:', formData)
    console.log('SelectedProcedures:', selectedProcedures)

    // Verificar se os campos obrigatórios estão preenchidos
    if (!formData.patientName || !formData.surgeryType || !formData.hospital || !formData.surgeryDate || !formData.surgeryTime) {
      alert('Por favor, preencha todos os campos obrigatórios')
      console.log('Campos obrigatórios faltando:', {
        patientName: formData.patientName,
        surgeryType: formData.surgeryType,
        hospital: formData.hospital,
        surgeryDate: formData.surgeryDate,
        surgeryTime: formData.surgeryTime
      })
      return
    }

    const surgeryData = {
      patientName: formData.patientName,
      surgeryType: formData.surgeryType,
      hospital: formData.hospital,
      surgeryDate: formatDateToISO(formData.surgeryDate), // Converter para ISO antes de enviar
      surgeryTime: formData.surgeryTime,
      paymentType: formData.paymentType,
      insurancePlan: formData.insurancePlan,
      notes: formData.notes,
      totalAmount: formData.totalAmount && formData.totalAmount.trim() !== '' ? parseFloat(formData.totalAmount) : undefined,
      hospitalAmount: formData.hospitalAmount && formData.hospitalAmount.trim() !== '' ? parseFloat(formData.hospitalAmount) : undefined,
      anesthesiologistAmount: formData.anesthesiologistAmount && formData.anesthesiologistAmount.trim() !== '' ? parseFloat(formData.anesthesiologistAmount) : undefined,
      instrumentalistAmount: formData.instrumentalistAmount && formData.instrumentalistAmount.trim() !== '' ? parseFloat(formData.instrumentalistAmount) : undefined,
      assistantAmount: formData.assistantAmount && formData.assistantAmount.trim() !== '' ? parseFloat(formData.assistantAmount) : undefined,
      surgeonAmount: formData.surgeonAmount && formData.surgeonAmount.trim() !== '' ? parseFloat(formData.surgeonAmount) : undefined,
      procedures: selectedProcedures.length > 0 ? selectedProcedures.filter(p => p.tussCode && p.description) : undefined
    }

    if (editingSurgery) {
      surgeryData.id = editingSurgery.id
    }

    console.log('=== DADOS FINAIS PARA ENVIO ===')
    console.log('SurgeryData:', surgeryData)
    console.log('JSON.stringify(surgeryData):', JSON.stringify(surgeryData, null, 2))
    console.log('Chamando onSubmit com:', surgeryData)

    onSubmit(surgeryData)
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-4xl mx-4 border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-xl font-semibold text-white'>
            {editingSurgery ? 'Editar Cirurgia' : 'Nova Cirurgia'}
          </h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors duration-200'
          >
            <XMarkIcon className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Nome do Paciente */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Nome do Paciente *
            </label>
            <input
              type='text'
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Digite o nome do paciente'
              required
            />
          </div>

          {/* Tipo de Cirurgia e Hospital */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Tipo de Cirurgia *
              </label>
              <input
                type='text'
                value={formData.surgeryType}
                onChange={(e) => setFormData(prev => ({ ...prev, surgeryType: e.target.value }))}
                className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Ex: Hemorroidectomia'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Hospital *
              </label>
              <input
                type='text'
                value={formData.hospital}
                onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
                className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Nome do hospital'
                required
              />
            </div>
          </div>

          {/* Data e Horário */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Data da Cirurgia *
              </label>
              <input
                type='text'
                value={formData.surgeryDate}
                onChange={(e) => {
                  // Permitir apenas números e barras
                  const value = e.target.value.replace(/[^\d/]/g, '')
                  
                  // Formatação automática DD/MM/YYYY
                  let formatted = value
                  if (value.length >= 2 && value.indexOf('/') === -1) {
                    formatted = value.slice(0, 2) + '/' + value.slice(2)
                  }
                  if (value.length >= 5 && value.split('/').length === 2) {
                    const parts = value.split('/')
                    formatted = parts[0] + '/' + parts[1].slice(0, 2) + '/' + parts[1].slice(2)
                  }
                  
                  // Limitar a 10 caracteres (DD/MM/YYYY)
                  if (formatted.length <= 10) {
                    setFormData(prev => ({ ...prev, surgeryDate: formatted }))
                  }
                }}
                className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='DD/MM/YYYY'
                maxLength={10}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Horário *
              </label>
              <input
                type='text'
                value={formData.surgeryTime}
                onChange={(e) => {
                  // Permitir apenas números e dois pontos
                  const value = e.target.value.replace(/[^\d:]/g, '')
                  
                  // Formatação automática HH:MM
                  let formatted = value
                  if (value.length >= 2 && value.indexOf(':') === -1) {
                    formatted = value.slice(0, 2) + ':' + value.slice(2)
                  }
                  
                  // Limitar a 5 caracteres (HH:MM)
                  if (formatted.length <= 5) {
                    // Validar horas (00-23) e minutos (00-59)
                    const parts = formatted.split(':')
                    if (parts[0] && parseInt(parts[0]) > 23) {
                      formatted = '23:' + (parts[1] || '')
                    }
                    if (parts[1] && parseInt(parts[1]) > 59) {
                      formatted = parts[0] + ':59'
                    }
                    
                    setFormData(prev => ({ ...prev, surgeryTime: formatted }))
                  }
                }}
                className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='00:00 - 23:59'
                maxLength={5}
                required
              />
            </div>
          </div>

          {/* Tipo de Pagamento */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Tipo de Pagamento
            </label>
            <select
              value={formData.paymentType}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as 'PARTICULAR' | 'INSURANCE' }))}
              className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='PARTICULAR'>Particular</option>
              <option value='INSURANCE'>Plano de Saúde</option>
            </select>
          </div>

          {/* Campos específicos para cada tipo de pagamento */}
          {formData.paymentType === 'PARTICULAR' && (
            <div className='space-y-4'>
              <h4 className='text-lg font-medium text-white'>Valores Particulares</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Valor Total
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='0.00'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Valor do Hospital
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.hospitalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, hospitalAmount: e.target.value }))}
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='0.00'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Valor do Anestesista
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.anesthesiologistAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, anesthesiologistAmount: e.target.value }))}
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='0.00'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Valor do Instrumentador
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.instrumentalistAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, instrumentalistAmount: e.target.value }))}
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='0.00'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Valor do Assistente
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.assistantAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, assistantAmount: e.target.value }))}
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='0.00'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Valor do Cirurgião
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.surgeonAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, surgeonAmount: e.target.value }))}
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='0.00'
                  />
                </div>
              </div>
            </div>
          )}

          {formData.paymentType === 'INSURANCE' && (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Nome do Plano de Saúde
                </label>
                <input
                  type='text'
                  value={formData.insurancePlan}
                  onChange={(e) => setFormData(prev => ({ ...prev, insurancePlan: e.target.value }))}
                  className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Nome do plano de saúde'
                />
              </div>

              <div>
                <div className='flex justify-between items-center mb-4'>
                  <h4 className='text-lg font-medium text-white'>Procedimentos TUSS</h4>
                  <button
                    type='button'
                    onClick={addTussProcedure}
                    className='flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200'
                  >
                    <PlusIcon className='w-4 h-4' />
                    Adicionar Procedimento
                  </button>
                </div>

                {selectedProcedures.map((procedure, index) => (
                  <div key={index} className='bg-gray-800/30 p-4 rounded-lg mb-4'>
                    <div className='flex justify-between items-start mb-3'>
                      <h5 className='text-white font-medium'>Procedimento {index + 1}</h5>
                      <button
                        type='button'
                        onClick={() => removeTussProcedure(index)}
                        className='text-red-400 hover:text-red-300 transition-colors duration-200'
                      >
                        <TrashIcon className='w-5 h-5' />
                      </button>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-300 mb-2'>
                          Código TUSS
                        </label>
                        <input
                          type='text'
                          value={procedure.tussCode}
                          onChange={(e) => updateTussProcedure(index, 'tussCode', e.target.value)}
                          className='w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='Ex: 31101012'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-300 mb-2'>
                          Descrição do Procedimento
                        </label>
                        <input
                          type='text'
                          value={procedure.description}
                          onChange={(e) => updateTussProcedure(index, 'description', e.target.value)}
                          className='w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='Nome do procedimento'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-300 mb-2'>
                          Quantidade
                        </label>
                        <input
                          type='number'
                          min='1'
                          value={procedure.quantity}
                          onChange={(e) => updateTussProcedure(index, 'quantity', parseInt(e.target.value) || 1)}
                          className='w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              placeholder='Observações adicionais sobre a cirurgia...'
            />
          </div>

          {/* Botões */}
          <div className='flex justify-end gap-4 pt-6'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200'
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200'
            >
              {editingSurgery ? 'Atualizar' : 'Cadastrar'} Cirurgia
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}