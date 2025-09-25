'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, Printer } from 'lucide-react'
import { formatDateToBrazilian } from '@/lib/date-utils'

interface AntimicrobialMedication {
  id: string
  name: string
  quantity: string
}

interface AntimicrobialPrescriptionFormProps {
  patientName: string
  patientId: string
  patientAddress?: string
  doctorName: string
  crm: string
  onSave: (data: any) => void
}

export default function AntimicrobialPrescriptionForm({
  patientName,
  patientId,
  patientAddress = 'Endereço não informado',
  doctorName,
  crm,
  onSave,
}: AntimicrobialPrescriptionFormProps) {
  const [medications, setMedications] = useState<AntimicrobialMedication[]>([
    { id: '1', name: '', quantity: '' },
  ])
  const [editablePatientAddress, setEditablePatientAddress] =
    useState(patientAddress)
  const [generalInstructions, setGeneralInstructions] = useState('')

  const addMedication = () => {
    const newMedication: AntimicrobialMedication = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
    }
    setMedications([...medications, newMedication])
  }

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id))
  }

  const updateMedication = (
    id: string,
    field: keyof AntimicrobialMedication,
    value: string
  ) => {
    setMedications(
      medications.map(med => (med.id === id ? { ...med, [field]: value } : med))
    )
  }

  const handleSave = () => {
    const prescriptionData = {
      type: 'antimicrobial',
      patientName,
      patientId,
      patientAddress: editablePatientAddress,
      doctorName,
      crm,
      medications,
      generalInstructions,
      date: formatDateToBrazilian(new Date()),
    }
    onSave(prescriptionData)
  }

  const handlePrint = () => {
    const printContent = generatePrintContent()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const generatePrintContent = () => {
    return `
      <!DOCTYPE html>
      <head>
        <title>Receituário de Antimicrobianos</title>
        <style>
          @page { 
            size: A4; 
            margin: 15mm;
          }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12px;
            line-height: 1.3;
            margin: 0;
            padding: 0;
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .title { 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 5px;
          }
          .subtitle { 
            font-size: 14px; 
            color: #666;
            margin-bottom: 10px;
          }
          .patient-info { 
            margin-bottom: 15px;
            padding: 8px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
          }
          .medications { 
            margin-bottom: 15px;
          }
          .medication-item { 
            margin-bottom: 8px;
            padding: 5px;
            border-left: 3px solid #007bff;
            background-color: #f8f9fa;
          }
          .instructions { 
            margin-bottom: 15px;
            padding: 8px;
            border: 1px solid #ddd;
            background-color: #fff;
          }
          .footer { 
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
          }
          .doctor-signature {
            margin-top: 30px;
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 5px;
            width: 300px;
            margin-left: auto;
            margin-right: auto;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">RECEITUÁRIO DE ANTIMICROBIANOS</div>
          <div class="subtitle">Prescrição de Antibióticos e Antimicrobianos</div>
        </div>
        
        <div class="patient-info">
          <strong>Paciente:</strong> ${patientName}<br>
          <strong>ID:</strong> ${patientId}<br>
          <strong>Endereço:</strong> ${editablePatientAddress}<br>
          <strong>Data:</strong> ${formatDateToBrazilian(new Date())}
        </div>
        
        <div class="medications">
          <h3>Medicamentos Prescritos:</h3>
          ${medications
            .map(
              (med, index) => `
            <div class="medication-item">
              <strong>${index + 1}.</strong> ${med.name}<br>
              <strong>Quantidade:</strong> ${med.quantity}
            </div>
          `
            )
            .join('')}
        </div>
        
        ${
          generalInstructions
            ? `
          <div class="instructions">
            <h3>Instruções Gerais:</h3>
            <p>${generalInstructions}</p>
          </div>
        `
            : ''
        }
        
        <div class="doctor-signature">
          <strong>Dr(a). ${doctorName}</strong><br>
          CRM: ${crm}
        </div>
        
        <div class="footer">
          <p>Este receituário é específico para antimicrobianos e antibióticos</p>
          <p>Válido por 10 dias a partir da data de emissão</p>
        </div>
      </body>
    `
  }

  return (
    <div>
      <div className='mb-6'>
        <h3 className='text-lg font-medium text-white flex items-center'>
          Receituário de Antimicrobianos
        </h3>
        <p className='text-sm text-gray-300 mt-1'>
          Prescrição específica para antibióticos e antimicrobianos
        </p>
      </div>

      <div className='bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-6'>
        <div className='text-blue-300 text-sm'>
          ⚠️ Receituário para antimicrobianos. Válido por 10 dias.
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
              <label className='block text-sm text-gray-300 mb-1'>
                ID do Paciente
              </label>
              <div className='px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white'>
                {patientId}
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
                className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Digite o endereço completo do paciente'
              />
            </div>
          </div>
        </div>

        {/* Medicamentos Antimicrobianos */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-white font-medium'>
              Medicamentos Antimicrobianos
            </h4>
            <button
              onClick={addMedication}
              className='flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors'
            >
              <Plus className='h-4 w-4 mr-1' />
              Adicionar
            </button>
          </div>

          <div className='space-y-4'>
            {medications.map((medication, index) => (
              <div
                key={medication.id}
                className='bg-gray-700 rounded-lg p-4 border border-blue-500/30'
              >
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-white font-medium'>
                    Antimicrobiano {index + 1}
                  </span>
                  {medications.length > 1 && (
                    <button
                      onClick={() => removeMedication(medication.id)}
                      className='text-red-400 hover:text-red-300 transition-colors'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm text-gray-300 mb-1'>
                      Nome do Antimicrobiano
                    </label>
                    <input
                      type='text'
                      value={medication.name}
                      onChange={e =>
                        updateMedication(medication.id, 'name', e.target.value)
                      }
                      className='w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Ex: Amoxicilina 500mg'
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
                      placeholder='Ex: 21 comprimidos'
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instruções Gerais */}
        <div>
          <label className='block text-sm text-gray-300 mb-2'>
            Instruções Gerais
          </label>
          <textarea
            value={generalInstructions}
            onChange={e => setGeneralInstructions(e.target.value)}
            rows={4}
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
            placeholder='Instruções de uso, posologia, duração do tratamento...'
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
            <Printer className='h-4 w-4 mr-2' />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}
