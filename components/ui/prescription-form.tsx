'use client'

import { useState } from 'react'
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline'
import {
  formatDateToBrazilian,
  formatDateTimeToBrazilian,
} from '@/lib/date-utils'

interface Medication {
  id: string
  name: string
  quantity: string
  instructions: string
}

interface PrescriptionFormProps {
  patientName: string
  patientAge: number
  doctorName?: string
  onSave?: (prescription: any) => void
  onPrint?: (prescription: any) => void
}

export default function PrescriptionForm({
  patientName,
  patientAge,
  doctorName = 'Dr. João Vítor Viana',
  onSave,
  onPrint,
}: PrescriptionFormProps) {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: '',
      quantity: '',
      instructions: '',
    },
  ])
  const [generalInstructions, setGeneralInstructions] = useState('')
  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
      instructions: '',
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
    field: keyof Medication,
    value: string
  ) => {
    setMedications(
      medications.map(med => (med.id === id ? { ...med, [field]: value } : med))
    )
  }

  const handleSave = () => {
    const prescription = {
      type: 'normal',
      patientName,
      patientAge,
      doctorName,
      medications: medications.filter(med => med.name.trim() !== ''),
      generalInstructions,
      date: new Date().toISOString(),
      createdAt: formatDateTimeToBrazilian(new Date()),
    }
    onSave?.(prescription)
    alert('Receituário salvo com sucesso!')
  }

  const handlePrint = () => {
    const prescription = {
      type: 'normal',
      patientName,
      patientAge,
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
        <title>Receituário Médico</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 15px; line-height: 1.4; font-size: 14px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
          .doctor-info { font-size: 16px; font-weight: bold; }
          .patient-info { margin: 15px 0; }
          .prescription-content { margin: 20px 0; }
          .medication { margin: 10px 0; padding: 8px; border-left: 3px solid #007bff; }
          .medication-name { font-weight: bold; font-size: 15px; }
          .medication-details { margin: 3px 0; }
          .instructions { margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; }
          .footer { margin-top: 30px; text-align: center; }
          .signature-line { border-top: 1px solid #000; width: 250px; margin: 30px auto 8px; }
          @media print { body { margin: 0; font-size: 12px; } .header { padding-bottom: 10px; margin-bottom: 15px; } .footer { margin-top: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="doctor-info">${prescription.doctorName}</div>
          <div>CRM: 12831-CRMPB</div>
          <div>Cirurgia Geral e Coloproctologia</div>
        </div>
        
        <div class="patient-info">
          <strong>Paciente:</strong> ${prescription.patientName}<br>
          <strong>Idade:</strong> ${prescription.patientAge} anos<br>
          <strong>Data:</strong> ${formatDateToBrazilian(new Date())}
        </div>
        
        <div class="prescription-content">
          <h3>RECEITUÁRIO MÉDICO</h3>
          ${prescription.medications
            .map(
              (med: Medication, index: number) => `
            <div class="medication">
              <div class="medication-name">${index + 1}. ${med.name}</div>
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
        </div>
      </body>
    `
  }

  return (
    <div>
      <div className='mb-6'>
        <h3 className='text-lg font-medium text-white flex items-center'>
          <DocumentTextIcon className='h-5 w-5 mr-2' />
          Receituário Normal
        </h3>
      </div>

      <div className='space-y-6'>
        {/* Informações do Paciente */}
        <div className='bg-gray-700 rounded-lg p-4'>
          <h4 className='text-white font-medium mb-2'>
            Informações do Paciente
          </h4>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-300'>Nome:</span>
              <span className='text-white ml-2'>{patientName}</span>
            </div>
            <div>
              <span className='text-gray-300'>Idade:</span>
              <span className='text-white ml-2'>{patientAge} anos</span>
            </div>
          </div>
        </div>

        {/* Medicamentos */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-white font-medium'>Medicamentos</h4>
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
              <div key={medication.id} className='bg-gray-700 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-white font-medium'>
                    Medicamento {index + 1}
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

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                      className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Ex: Dipirona 500mg'
                    />
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
                      className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Ex: 02 caixas'
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
                    className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                    placeholder='Ex: Tomar após as refeições'
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
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
            placeholder='Orientações adicionais para o paciente...'
          />
        </div>

        {/* Botões de Ação */}
        <div className='flex justify-end space-x-3'>
          <button
            onClick={handleSave}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
          >
            Salvar Receituário
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
