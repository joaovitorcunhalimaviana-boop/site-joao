'use client'

import { useState } from 'react'
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import {
  formatDateToBrazilian,
  formatDateTimeToBrazilian,
} from '@/lib/date-utils'

interface ControlledMedication {
  id: string
  name: string
  instructions: string
  quantity: string
  controlType:
    | 'A1'
    | 'A2'
    | 'A3'
    | 'B1'
    | 'B2'
    | 'C1'
    | 'C2'
    | 'C3'
    | 'C4'
    | 'C5'
}

interface SpecialPrescriptionFormProps {
  patientName: string
  patientAge: number
  patientAddress?: string
  doctorName?: string
  onSave?: (prescription: any) => void
  onPrint?: (prescription: any) => void
}

export default function SpecialPrescriptionForm({
  patientName,
  patientAge,
  patientAddress = 'Endereço não informado',
  doctorName = 'Dr. João Vítor Viana',
  onSave,
  onPrint,
}: SpecialPrescriptionFormProps) {
  const [medications, setMedications] = useState<ControlledMedication[]>([
    {
      id: '1',
      name: '',
      instructions: '',
      quantity: '',
      controlType: 'C1',
    },
  ])
  const [editablePatientAddress, setEditablePatientAddress] =
    useState(patientAddress)
  const [generalInstructions, setGeneralInstructions] = useState('')
  const controlTypes = [
    { value: 'C1', label: 'C1 - Outras substâncias' },
    { value: 'C2', label: 'C2 - Retinóides' },
    { value: 'C3', label: 'C3 - Imunossupressores' },
    { value: 'C4', label: 'C4 - Anti-retrovirais' },
    { value: 'C5', label: 'C5 - Anabolizantes' },
  ]

  const addMedication = () => {
    const newMedication: ControlledMedication = {
      id: Date.now().toString(),
      name: '',
      instructions: '',
      quantity: '',
      controlType: 'C1',
    }
    setMedications([...medications, newMedication])
  }

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id))
    }
  }

  const updateMedication = (
    id: string,
    field: keyof ControlledMedication,
    value: string
  ) => {
    setMedications(
      medications.map(med => (med.id === id ? { ...med, [field]: value } : med))
    )
  }

  const handleSave = () => {
    const prescription = {
      type: 'special',
      patientName,
      patientAge,
      patientAddress: editablePatientAddress,
      doctorName,
      medications: medications.filter(med => med.name.trim() !== ''),
      generalInstructions,
      date: new Date().toISOString(),
      createdAt: formatDateTimeToBrazilian(new Date()),
    }
    onSave?.(prescription)
    alert('Receituário especial salvo com sucesso!')
  }

  const handlePrint = () => {
    const prescription = {
      type: 'special',
      patientName,
      patientAge,
      patientAddress: editablePatientAddress,
      doctorName,
      medications: medications.filter(med => med.name.trim() !== ''),
      generalInstructions,
      date: new Date().toISOString(),
      createdAt: formatDateTimeToBrazilian(new Date()),
    }
    onPrint?.(prescription)

    // Criar conteúdo para impressão
    const printContent = generatePrintContent(prescription)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const generatePrintContent = (prescription: any) => {
    return `
      <!DOCTYPE html>
      <head>
        <title>Receituário de Controle Especial</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 15px; line-height: 1.4; font-size: 14px; }
          .header { text-align: center; border-bottom: 3px solid #dc2626; padding-bottom: 15px; margin-bottom: 20px; }
          .special-header { background-color: #dc2626; color: white; padding: 8px; text-align: center; font-weight: bold; margin-bottom: 15px; }
          .doctor-info { font-size: 16px; font-weight: bold; }
          .patient-info { margin: 15px 0; background-color: #f3f4f6; padding: 10px; border-radius: 5px; }
          .prescription-content { margin: 20px 0; }
          .medication { margin: 15px 0; padding: 10px; border: 2px solid #dc2626; border-radius: 5px; }
          .medication-name { font-weight: bold; font-size: 15px; color: #dc2626; }
          .medication-details { margin: 5px 0; }
          .control-type { background-color: #dc2626; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold; }
          .instructions { margin-top: 20px; padding: 10px; background-color: #fef3c7; border-left: 4px solid #f59e0b; }
          .footer { margin-top: 30px; text-align: center; }
          .signature-line { border-top: 2px solid #000; width: 250px; margin: 30px auto 8px; }
          .warning { background-color: #fee2e2; border: 1px solid #dc2626; padding: 8px; margin: 15px 0; border-radius: 5px; }
          @media print { body { margin: 0; font-size: 12px; } .header { padding-bottom: 10px; margin-bottom: 15px; } .footer { margin-top: 20px; } }
        </style>
      </head>
      <body>
        <div class="special-header">
          RECEITUÁRIO DE CONTROLE ESPECIAL
        </div>
        
        <div class="header">
          <div class="doctor-info">${prescription.doctorName}</div>
          <div>CRM: 12831-CRMPB</div>
          <div>Especialidade: Cirurgia Geral e Coloproctologia</div>
          <div>Endereço: Avenida Rui Barbosa, 484, Edifício Arcádia, Sala 101, Torre, João Pessoa, Paraíba</div>
        </div>
        
        <div class="patient-info">
          <strong>Paciente:</strong> ${prescription.patientName}<br>
          <strong>Idade:</strong> ${prescription.patientAge} anos<br>
          <strong>Endereço:</strong> ${prescription.patientAddress}<br>
          <strong>Data:</strong> ${formatDateToBrazilian(new Date())}
        </div>
        
        <div class="warning">
          <strong>⚠️ ATENÇÃO:</strong> Este receituário contém medicamentos de uso controlado. 
          Válido por 30 dias a partir da data de emissão.
        </div>
        
        <div class="prescription-content">
          ${prescription.medications
            .map(
              (med: ControlledMedication, index: number) => `
            <div class="medication">
              <div class="medication-name">
                ${index + 1}. ${med.name} 
                <span class="control-type">${med.controlType}</span>
              </div>
              <div class="medication-details">
                <strong>Quantidade:</strong> ${med.quantity}<br>
                ${med.instructions ? `<strong>Instruções:</strong> ${med.instructions}` : ''}
              </div>
            </div>
          `
            )
            .join('')}
          
          ${
            prescription.generalInstructions
              ? `
            <div class="instructions">
              <strong>Orientações Gerais:</strong><br>
              ${prescription.generalInstructions}
            </div>
          `
              : ''
          }
        </div>
        
        <div class="footer">
          <div class="signature-line"></div>
          <div>${prescription.doctorName}</div>
          <div>CRM: 12831-CRMPB</div>
          <div style="margin-top: 20px; font-size: 12px; color: #666;">
            Data de emissão: ${formatDateToBrazilian(new Date())}<br>
            Válido até: ${formatDateToBrazilian(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
          </div>
        </div>
      </body>
    `
  }

  return (
    <div>
      <div className='mb-6'>
        <h3 className='text-lg font-medium text-white flex items-center'>
          <DocumentTextIcon className='h-5 w-5 mr-2' />
          Receituário Especial (Controlados)
        </h3>
      </div>

      <div className='bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6'>
        <div className='flex items-center'>
          <ExclamationTriangleIcon className='h-5 w-5 text-red-400 mr-2' />
          <span className='text-red-300 text-sm'>
            Receituário para medicamentos controlados. Válido por 30 dias.
          </span>
        </div>
      </div>

      <div className='space-y-6'>
        {/* Informações do Paciente */}
        <div className='bg-gray-700 rounded-lg p-4'>
          <h4 className='text-white font-medium mb-3'>
            Informações do Paciente
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm text-gray-300 mb-1'>
                Nome do Paciente
              </label>
              <div className='px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white'>
                {patientName}
              </div>
            </div>
            <div>
              <label className='block text-sm text-gray-300 mb-1'>Idade</label>
              <div className='px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white'>
                {patientAge} anos
              </div>
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm text-gray-300 mb-1'>
                Endereço do Paciente *
              </label>
              <input
                type='text'
                value={editablePatientAddress}
                onChange={e => setEditablePatientAddress(e.target.value)}
                className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500'
                placeholder='Digite o endereço completo do paciente'
              />
            </div>
          </div>
        </div>

        {/* Medicamentos Controlados */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-white font-medium'>Medicamentos Controlados</h4>
            <button
              onClick={addMedication}
              className='flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors'
            >
              <PlusIcon className='h-4 w-4 mr-1' />
              Adicionar
            </button>
          </div>

          <div className='space-y-4'>
            {medications.map((medication, index) => (
              <div
                key={medication.id}
                className='bg-gray-700 rounded-lg p-4 border border-red-500/30'
              >
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-white font-medium'>
                    Medicamento Controlado {index + 1}
                  </span>
                  {medications.length > 1 && (
                    <button
                      onClick={() => removeMedication(medication.id)}
                      className='text-red-400 hover:text-red-300 transition-colors'
                    >
                      <TrashIcon className='h-4 w-4' />
                    </button>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm text-gray-300 mb-1'>
                      Nome do Medicamento
                    </label>
                    <input
                      type='text'
                      value={medication.name}
                      onChange={e =>
                        updateMedication(medication.id, 'name', e.target.value)
                      }
                      className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500'
                      placeholder='Ex: Clonazepam 2mg'
                    />
                  </div>

                  <div>
                    <label className='block text-sm text-gray-300 mb-1'>
                      Tipo de Controle
                    </label>
                    <select
                      value={medication.controlType}
                      onChange={e =>
                        updateMedication(
                          medication.id,
                          'controlType',
                          e.target.value
                        )
                      }
                      className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500'
                    >
                      {controlTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm text-gray-300 mb-1'>
                      Quantidade
                    </label>
                    <input
                      type='text'
                      value={medication.quantity}
                      onChange={e =>
                        updateMedication(
                          medication.id,
                          'quantity',
                          e.target.value
                        )
                      }
                      className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500'
                      placeholder='Ex: 60 comprimidos'
                    />
                  </div>
                </div>

                <div className='mt-3'>
                  <label className='block text-sm text-gray-300 mb-1'>
                    Instruções Específicas
                  </label>
                  <textarea
                    value={medication.instructions}
                    onChange={e =>
                      updateMedication(
                        medication.id,
                        'instructions',
                        e.target.value
                      )
                    }
                    rows={2}
                    className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none'
                    placeholder='Ex: Tomar antes de dormir'
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orientações Gerais */}
        <div>
          <label className='block text-sm text-gray-300 mb-2'>
            Orientações Gerais
          </label>
          <textarea
            value={generalInstructions}
            onChange={e => setGeneralInstructions(e.target.value)}
            rows={4}
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none'
            placeholder='Orientações adicionais para medicamentos controlados...'
          />
        </div>

        {/* Botões de Ação */}
        <div className='flex justify-end space-x-3'>
          <button
            onClick={handleSave}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
          >
            Salvar Receituário Especial
          </button>
          <button
            onClick={handlePrint}
            className='flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
          >
            <PrinterIcon className='h-4 w-4 mr-2' />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}
