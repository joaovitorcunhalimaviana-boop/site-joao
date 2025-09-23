'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '../../../components/ui/header'
import BackgroundPattern from '../../../components/ui/background-pattern'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  PhotoIcon,
  PaperClipIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  phone: string
  whatsapp: string
  birthDate: string
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
  }
  status: 'aguardando' | 'atendido' | 'cancelado'
  dataConsulta?: string
  horaConsulta?: string
  createdAt: string
  updatedAt: string
}

interface MedicalAttachment {
  id: string
  fileName: string
  originalName: string
  fileType: string
  fileSize: number
  category: 'exame' | 'foto' | 'documento' | 'outro'
  description: string
  uploadedAt: string
  filePath: string
}

interface MedicalRecord {
  id: string
  patientId: string
  date: string
  time: string
  anamnesis: string
  examination: string
  diagnosis: string
  treatment: string
  prescription: string
  observations: string
  doctorName: string
  attachments?: MedicalAttachment[]
  createdAt: string
}

export default function ProntuarioPage() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null
  )

  const params = useParams()
  const patientId = params['id'] as string

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--
    }

    return age
  }

  useEffect(() => {
    if (patientId) {
      loadPatientData()
      loadMedicalRecords()
    }
  }, [patientId])

  const loadPatientData = async () => {
    try {
      // Primeiro tenta buscar no sistema unificado
      const unifiedResponse = await fetch(
        `/api/unified-appointments?action=get-patient&patientId=${patientId}`
      )
      if (unifiedResponse.ok) {
        const unifiedData = await unifiedResponse.json()
        if (unifiedData.success && unifiedData.patient) {
          setPatient(unifiedData.patient)
          return
        }
      }

      // Fallback para API antiga
      const response = await fetch(`/api/patients/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setPatient(data.patient || data)
      } else {
        console.error('Paciente não encontrado')
      }
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error)
      setPatient(null)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMedicalRecords = async () => {
    try {
      const response = await fetch(`/api/medical-records/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setMedicalRecords(data.records || [])
      }
    } catch (error) {
      console.error('Erro ao carregar prontuários:', error)
      setMedicalRecords([])
    }
  }

  const formatDate = (dateString: string) => {
    return dateString.split('-').reverse().join('/')
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5)
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-900'>
        <Header />
        <div className='flex items-center justify-center h-64'>
          <div className='text-white'>Carregando...</div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className='min-h-screen bg-gray-900'>
        <Header />
        <div className='flex items-center justify-center h-64'>
          <div className='text-white'>Paciente não encontrado</div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='prontuario' />

      {/* Cabeçalho da página */}
      <div className='bg-gray-800 border-b border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <button
                onClick={() => {
                  window.location.href = '/area-medica'
                }}
                className='mr-4 p-2 text-gray-400 hover:text-white transition-colors cursor-pointer relative z-50 bg-gray-700 hover:bg-gray-600 rounded-md'
                type='button'
                style={{ minWidth: '40px', minHeight: '40px' }}
              >
                <ArrowLeftIcon className='h-6 w-6' />
              </button>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  Prontuário do Paciente
                </h1>
                <p className='text-sm text-gray-300'>{patient.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Informações do Paciente */}
          <div className='lg:col-span-1'>
            <div className='bg-gray-800 rounded-lg shadow border border-gray-700 p-6'>
              <h2 className='text-lg font-medium text-white mb-4 flex items-center'>
                <UserIcon className='h-5 w-5 mr-2' />
                Dados do Paciente
              </h2>

              <div className='space-y-4'>
                <div>
                  <p className='text-sm text-gray-300'>Nome Completo</p>
                  <p className='text-white font-medium'>{patient.name}</p>
                </div>

                <div>
                  <p className='text-sm text-gray-300'>Telefone</p>
                  <p className='text-white'>{patient.phone}</p>
                </div>

                <div>
                  <p className='text-sm text-gray-300'>WhatsApp</p>
                  <p className='text-white'>
                    {patient.whatsapp || 'Não informado'}
                  </p>
                </div>

                <div>
                  <p className='text-sm text-gray-300'>Data de Nascimento</p>
                  <p className='text-white'>{formatDate(patient.birthDate)}</p>
                </div>

                <div>
                  <p className='text-sm text-gray-300'>Idade</p>
                  <p className='text-white'>
                    {calculateAge(patient.birthDate)} anos
                  </p>
                </div>

                <div>
                  <p className='text-sm text-gray-300'>Convênio</p>
                  <p className='text-white'>
                    {patient.insurance?.type === 'particular'
                      ? 'Particular'
                      : patient.insurance?.type === 'unimed'
                        ? 'UNIMED'
                        : patient.insurance?.plan ||
                          patient.insurance?.type ||
                          'Não informado'}
                  </p>
                </div>

                <div>
                  <p className='text-sm text-gray-300'>Status</p>
                  <p
                    className={`text-white font-medium ${
                      patient.status === 'aguardando'
                        ? 'text-yellow-400'
                        : patient.status === 'atendido'
                          ? 'text-green-400'
                          : 'text-red-400'
                    }`}
                  >
                    {patient.status === 'aguardando'
                      ? 'Aguardando'
                      : patient.status === 'atendido'
                        ? 'Atendido'
                        : 'Cancelado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Prontuários */}
          <div className='lg:col-span-2'>
            <div className='bg-gray-800 rounded-lg shadow border border-gray-700 p-6'>
              <h2 className='text-lg font-medium text-white mb-6 flex items-center'>
                <DocumentTextIcon className='h-5 w-5 mr-2' />
                Histórico de Atendimentos
              </h2>

              {medicalRecords.length === 0 ? (
                <div className='text-center py-12'>
                  <DocumentTextIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-400 mb-4'>
                    Nenhum atendimento registrado
                  </p>
                  <p className='text-sm text-gray-500'>
                    Este paciente ainda não possui histórico de consultas
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {medicalRecords.map(record => (
                    <div
                      key={record.id}
                      className='border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer'
                      onClick={() =>
                        setSelectedRecord(
                          selectedRecord?.id === record.id ? null : record
                        )
                      }
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center space-x-4'>
                          <div className='flex items-center text-sm text-gray-300'>
                            <CalendarIcon className='h-4 w-4 mr-1' />
                            {formatDate(record.date)}
                          </div>
                          <div className='flex items-center text-sm text-gray-300'>
                            <ClockIcon className='h-4 w-4 mr-1' />
                            {formatTime(record.time)}
                          </div>
                        </div>
                        <span className='text-sm text-gray-400'>
                          {record.doctorName}
                        </span>
                      </div>

                      <div className='mb-2'>
                        <p className='text-white font-medium text-sm mb-1'>
                          Anamnese:
                        </p>
                        <p className='text-gray-300 text-sm'>
                          {record.anamnesis}
                        </p>
                      </div>

                      {selectedRecord?.id === record.id && (
                        <div className='mt-4 pt-4 border-t border-gray-600 space-y-3'>
                          {record.examination && (
                            <div>
                              <p className='text-white font-medium text-sm mb-1'>
                                Exame Físico:
                              </p>
                              <p className='text-gray-300 text-sm'>
                                {record.examination}
                              </p>
                            </div>
                          )}

                          {record.diagnosis && (
                            <div>
                              <p className='text-white font-medium text-sm mb-1'>
                                Diagnóstico:
                              </p>
                              <p className='text-gray-300 text-sm'>
                                {record.diagnosis}
                              </p>
                            </div>
                          )}

                          {record.treatment && (
                            <div>
                              <p className='text-white font-medium text-sm mb-1'>
                                Tratamento:
                              </p>
                              <p className='text-gray-300 text-sm'>
                                {record.treatment}
                              </p>
                            </div>
                          )}

                          {record.prescription && (
                            <div>
                              <p className='text-white font-medium text-sm mb-1'>
                                Prescrição:
                              </p>
                              <p className='text-gray-300 text-sm whitespace-pre-line'>
                                {record.prescription}
                              </p>
                            </div>
                          )}

                          {record.observations && (
                            <div>
                              <p className='text-white font-medium text-sm mb-1'>
                                Observações:
                              </p>
                              <p className='text-gray-300 text-sm whitespace-pre-line'>
                                {record.observations}
                              </p>
                            </div>
                          )}

                          {/* Anexos Médicos */}
                          {record.attachments &&
                            record.attachments.length > 0 && (
                              <div>
                                <p className='text-white font-medium text-sm mb-2 flex items-center'>
                                  <PaperClipIcon className='h-4 w-4 mr-1' />
                                  Anexos ({record.attachments.length})
                                </p>
                                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                                  {record.attachments.map(attachment => (
                                    <div
                                      key={attachment.id}
                                      className='bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer group'
                                      onClick={() =>
                                        window.open(
                                          `/api/medical-attachments/${attachment.fileName}`,
                                          '_blank'
                                        )
                                      }
                                    >
                                      <div className='flex items-center justify-between mb-2'>
                                        <div className='flex items-center'>
                                          {attachment.fileType.startsWith(
                                            'image/'
                                          ) ? (
                                            <PhotoIcon className='h-5 w-5 text-blue-400' />
                                          ) : (
                                            <PaperClipIcon className='h-5 w-5 text-gray-400' />
                                          )}
                                        </div>
                                        <EyeIcon className='h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors' />
                                      </div>

                                      <div className='space-y-1'>
                                        <p
                                          className='text-xs text-white font-medium truncate'
                                          title={attachment.originalName}
                                        >
                                          {attachment.originalName}
                                        </p>
                                        <p className='text-xs text-gray-400 capitalize'>
                                          {attachment.category}
                                        </p>
                                        <p className='text-xs text-gray-500'>
                                          {(attachment.fileSize / 1024).toFixed(
                                            1
                                          )}{' '}
                                          KB
                                        </p>
                                        {attachment.description && (
                                          <p
                                            className='text-xs text-gray-400 truncate'
                                            title={attachment.description}
                                          >
                                            {attachment.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
