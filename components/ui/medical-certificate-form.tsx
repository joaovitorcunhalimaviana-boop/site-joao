'use client'

import { useState } from 'react'
import {
  DocumentCheckIcon,
  PrinterIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import {
  formatDateToBrazilian,
  formatDateTimeToBrazilian,
} from '@/lib/date-utils'

interface MedicalCertificateFormProps {
  patientName: string
  patientAge: number
  doctorName?: string
  onSave?: (certificate: any) => void
  onPrint?: (certificate: any) => void
}

export default function MedicalCertificateForm({
  patientName,
  patientAge,
  doctorName = 'Dr. João Vítor Viana',
  onSave,
  onPrint,
}: MedicalCertificateFormProps) {
  const [totalDays, setTotalDays] = useState('1')
  const [reason, setReason] = useState('')
  const [observations, setObservations] = useState('')
  const [cidCode, setCidCode] = useState('')
  const [cidDescription, setCidDescription] = useState('')
  const [patientAuthorization, setPatientAuthorization] = useState(false)
  const [patientSignature, setPatientSignature] = useState('')

  const handleSave = () => {
    const certificate = {
      type: 'medical_certificate',
      patientName,
      patientAge,
      doctorName,
      totalDays,
      reason,
      observations,
      cidCode: patientAuthorization ? cidCode : '',
      cidDescription: patientAuthorization ? cidDescription : '',
      patientAuthorization,
      patientSignature: patientAuthorization ? patientSignature : '',
      date: new Date().toISOString(),
      createdAt: formatDateTimeToBrazilian(new Date()),
    }
    onSave?.(certificate)
    alert('Atestado médico salvo com sucesso!')
  }

  const handlePrint = () => {
    const certificate = {
      type: 'medical_certificate',
      patientName,
      patientAge,
      doctorName,
      totalDays,
      reason,
      observations,
      cidCode: patientAuthorization ? cidCode : '',
      cidDescription: patientAuthorization ? cidDescription : '',
      patientAuthorization,
      patientSignature: patientAuthorization ? patientSignature : '',
      date: new Date().toISOString(),
      createdAt: formatDateTimeToBrazilian(new Date()),
    }
    onPrint?.(certificate)

    // Criar conteúdo para impressão
    const printContent = generatePrintContent(certificate)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const generatePrintContent = (certificate: any) => {
    return `
      <!DOCTYPE html>
      <head>
        <title>Atestado Médico</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 15px; line-height: 1.4; font-size: 14px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
          .doctor-info { font-size: 16px; font-weight: bold; }
          .certificate-title { font-size: 20px; font-weight: bold; text-align: center; margin: 25px 0; text-decoration: underline; }
          .certificate-content { margin: 25px 0; text-align: justify; font-size: 15px; }
          .patient-info { margin: 20px 0; }
          .dates-info { margin: 20px 0; background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
          .cid-section { margin: 25px 0; padding: 15px; border: 2px solid #007bff; border-radius: 5px; }
          .authorization-section { margin: 25px 0; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; }
          .signature-section { margin-top: 40px; }
          .signature-line { border-top: 1px solid #000; width: 250px; margin: 40px auto 8px; }
          .patient-signature-line { border-top: 1px solid #000; width: 250px; margin: 30px 0 8px 0; }
          .footer { text-align: center; margin-top: 30px; }
          @media print { body { margin: 0; font-size: 12px; } .header { padding-bottom: 10px; margin-bottom: 20px; } .certificate-title { margin: 20px 0; } .signature-section { margin-top: 30px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="doctor-info">${certificate.doctorName}</div>
          <div>CRM: 12831-CRMPB</div>
          <div>Especialidade: Cirurgia Geral e Coloproctologia</div>
          <div>Endereço: Avenida Rui Barbosa, 484, Edifício Arcádia, Sala 101, Torre, João Pessoa, Paraíba</div>
        </div>
        
        <div class="certificate-title">
          ATESTADO MÉDICO
        </div>
        
        <div class="certificate-content">
          <p>Atesto para os devidos fins que o(a) paciente <strong>${certificate.patientName}</strong>, 
          ${certificate.patientAge} anos, esteve sob meus cuidados médicos e necessita de afastamento 
          de suas atividades pelo período de <strong>${certificate.totalDays} dia(s)</strong>.</p>
          
          <div class="dates-info">
            <strong>Dias de Afastamento:</strong> ${certificate.totalDays} dia(s)
          </div>
          
          ${
            certificate.reason
              ? `
            <p><strong>Motivo:</strong> ${certificate.reason}</p>
          `
              : ''
          }
          
          ${
            certificate.observations
              ? `
            <p><strong>Observações:</strong> ${certificate.observations}</p>
          `
              : ''
          }
        </div>
        
        ${
          certificate.patientAuthorization && certificate.cidCode
            ? `
          <div class="cid-section">
            <h4>INFORMAÇÕES DIAGNÓSTICAS (CID-10)</h4>
            <p><strong>Código CID:</strong> ${certificate.cidCode}</p>
            <p><strong>Descrição:</strong> ${certificate.cidDescription}</p>
            
            <div class="authorization-section">
              <h5>AUTORIZAÇÃO DO PACIENTE</h5>
              <p>Eu, <strong>${certificate.patientName}</strong>, autorizo expressamente a divulgação 
              do código CID-10 e diagnóstico médico neste atestado, conforme minha necessidade e 
              em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
              
              <div class="patient-signature-line"></div>
              <div style="text-align: center;">
                <strong>Assinatura do Paciente</strong><br>
                ${certificate.patientSignature || certificate.patientName}
              </div>
            </div>
          </div>
        `
            : `
          <div class="cid-section">
            <p><em>Informações diagnósticas (CID-10) não divulgadas conforme escolha do paciente 
            ou por não serem necessárias para a finalidade deste atestado.</em></p>
          </div>
        `
        }
        
        <div class="footer">
          <p>Atestado emitido em ${formatDateToBrazilian(new Date())}.</p>
          
          <div class="signature-section">
            <div class="signature-line"></div>
            <div style="text-align: center;">
              <strong>${certificate.doctorName}</strong><br>
              CRM: 12831-CRMPB<br>
              Especialidade: Cirurgia Geral e Coloproctologia
            </div>
          </div>
        </div>
      </body>
    `
  }

  return (
    <div>
      <div className='mb-6'>
        <h3 className='text-lg font-medium text-white flex items-center'>
          <DocumentCheckIcon className='h-5 w-5 mr-2' />
          Atestado Médico
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

        {/* Modelo Padrão de Atestado */}
        <div className='bg-blue-900/20 border border-blue-500 rounded-lg p-4'>
          <h4 className='text-white font-medium mb-2'>
            Modelo de Atestado Médico
          </h4>
          <p className='text-gray-300 text-sm'>
            Este atestado seguirá o modelo padrão para fins gerais, podendo ser
            utilizado para justificativas de trabalho, estudos ou outras
            atividades conforme necessário.
          </p>
        </div>

        {/* Período de Afastamento */}
        <div>
          <label className='block text-sm text-gray-300 mb-2'>
            Dias de Afastamento
          </label>
          <input
            type='number'
            min='1'
            max='365'
            value={totalDays}
            onChange={e => setTotalDays(e.target.value)}
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Ex: 3'
          />
        </div>

        {/* Motivo */}
        <div>
          <label className='block text-sm text-gray-300 mb-2'>
            Motivo do Afastamento
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
            placeholder='Descreva o motivo do afastamento...'
          />
        </div>

        {/* Observações */}
        <div>
          <label className='block text-sm text-gray-300 mb-2'>
            Observações Adicionais
          </label>
          <textarea
            value={observations}
            onChange={e => setObservations(e.target.value)}
            rows={2}
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
            placeholder='Observações adicionais (opcional)...'
          />
        </div>

        {/* Seção CID e Autorização */}
        <div className='bg-blue-900/20 border border-blue-500 rounded-lg p-4'>
          <h4 className='text-white font-medium mb-4 flex items-center'>
            <UserIcon className='h-5 w-5 mr-2' />
            Informações Diagnósticas (CID-10)
          </h4>

          <div className='mb-4'>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={patientAuthorization}
                onChange={e => setPatientAuthorization(e.target.checked)}
                className='mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
              <span className='text-white text-sm'>
                O paciente autoriza a divulgação do código CID-10 neste atestado
              </span>
            </label>
          </div>

          {patientAuthorization && (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>
                    Código CID-10
                  </label>
                  <input
                    type='text'
                    value={cidCode}
                    onChange={e => setCidCode(e.target.value.toUpperCase())}
                    className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Ex: M54.5'
                  />
                </div>
                <div>
                  <label className='block text-sm text-gray-300 mb-2'>
                    Descrição do CID
                  </label>
                  <input
                    type='text'
                    value={cidDescription}
                    onChange={e => setCidDescription(e.target.value)}
                    className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Ex: Dor lombar baixa'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm text-gray-300 mb-2'>
                  Assinatura do Paciente (Nome Completo)
                </label>
                <input
                  type='text'
                  value={patientSignature}
                  onChange={e => setPatientSignature(e.target.value)}
                  className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Nome completo do paciente para autorização'
                />
              </div>

              <div className='bg-yellow-900/20 border border-yellow-500 rounded p-3'>
                <p className='text-yellow-300 text-sm'>
                  ⚠️ <strong>Importante:</strong> O paciente está autorizando
                  expressamente a divulgação das informações diagnósticas
                  (CID-10) neste atestado, conforme a LGPD.
                </p>
              </div>
            </div>
          )}

          {!patientAuthorization && (
            <div className='bg-gray-700 rounded p-3'>
              <p className='text-gray-300 text-sm'>
                ℹ️ As informações diagnósticas (CID-10) não serão incluídas no
                atestado conforme escolha do paciente.
              </p>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className='flex justify-end space-x-3'>
          <button
            onClick={handleSave}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
          >
            Salvar Atestado
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
