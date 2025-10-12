'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '../../../../components/ui/header'
import BackgroundPattern from '../../../../components/ui/background-pattern'
import ConsultationTimer from '../../../../components/ui/consultation-timer'
import PrescriptionForm from '../../../../components/ui/prescription-form'
import SpecialPrescriptionForm from '../../../../components/ui/special-prescription-form'
import AntimicrobialPrescriptionForm from '../../../../components/ui/antimicrobial-prescription-form'
import MedicalDeclarationForm from '../../../../components/ui/medical-declaration-form'
import MedicalCertificateForm from '../../../../components/ui/medical-certificate-form'
import MedicalCalculators from '../../../../components/ui/medical-calculators'
import MedicalImageUpload from '../../../../components/ui/medical-image-upload'
import { DiagnosticDropdown } from '../../../../components/ui/diagnostic-dropdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  whatsapp?: string
  birthDate: string
  cpf?: string
  medicalRecordNumber?: string
}

// Interface Appointment removida - não utilizamos mais dados de appointment

interface PreviousConsultation {
  id: string
  date: string
  anamnesis: string
  observations?: string
  calculatorResults?: any[]
  attachments?: any[]
  diagnosticHypotheses?: string[]
}

// Lista de doenças da proctologia e cirurgia geral
const MEDICAL_CONDITIONS = [
  // Proctologia
  'Doença Hemorroidária',
  'Fístula Anal',
  'Fissura Anal',
  'Doença Pilonidal',
  'Constipação',
  'Incontinência Fecal',
  'Câncer Colorretal',
  'Doença de Crohn',
  'Retocolite Ulcerativa',
  'Pólipos Colorretais',
  'Prolapso Retal',
  'Abscesso Anorretal',
  'Condiloma Acuminado',
  'Síndrome do Intestino Irritável',

  // Cirurgia Geral - Hérnias
  'Hérnia Inguinal',
  'Hérnia Umbilical',
  'Hérnia Incisional',
  'Hérnia Epigástrica',
  'Hérnia Femoral',
  'Outras Hérnias',

  // Cirurgia Geral - Outras
  'Colelitíase',
  'Colecistite',
  'Apendicite',
  'Lipoma',
  'Cisto Sebáceo',
  'Nódulo Tireoidiano',
  'Varizes',
  'Úlcera Péptica',
]

export default function AppointmentPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params['id'] as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [anamnesis, setAnamnesis] = useState('')
  const [diagnosticHypotheses, setDiagnosticHypotheses] = useState<string[]>([])
  const [previousConsultations, setPreviousConsultations] = useState<
    PreviousConsultation[]
  >([])
  const [expandedConsultation, setExpandedConsultation] = useState<
    string | null
  >(null)
  const [calculatorResults, setCalculatorResults] = useState<any[]>([])
  const [savedAttachments, setSavedAttachments] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timerTime, setTimerTime] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)

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

  const formatDate = (dateString: string) => {
    return dateString.split('-').reverse().join('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'em-andamento':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'concluido':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'cancelado':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'Agendado'
      case 'em-andamento':
        return 'Em Andamento'
      case 'concluido':
        return 'Concluído'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  const loadAppointmentData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔍 Carregando dados do atendimento ID:', appointmentId)

      // Primeiro, buscar o agendamento pelo ID
      const appointmentResponse = await fetch(
        `/api/unified-appointments?action=appointment-by-id&appointmentId=${appointmentId}`,
        { credentials: 'include' }
      )

      if (!appointmentResponse.ok) {
        console.error(
          '❌ Erro ao buscar agendamento:',
          appointmentResponse.status
        )
        setError('Atendimento não encontrado')
        return
      }

      const appointmentData = await appointmentResponse.json()
      console.log('📋 Dados do agendamento:', appointmentData)
      console.log('📋 Success:', appointmentData.success)
      console.log('📋 Appointment:', appointmentData.appointment)

      if (!appointmentData.success || !appointmentData.appointment) {
        setError('Atendimento não encontrado')
        console.error('❌ Dados inválidos do agendamento')
        return
      }

      const appointment = appointmentData.appointment

      // Agora buscar os dados completos do paciente usando o medicalPatientId
      const patientResponse = await fetch(
        `/api/unified-appointments?action=patient-by-id&patientId=${appointment.medicalPatientId}`,
        { credentials: 'include' }
      )

      if (patientResponse.ok) {
        const patientData = await patientResponse.json()
        console.log('👤 Dados do paciente:', patientData)

        if (patientData.patient) {
          const patient = patientData.patient
          const patientInfo = {
            id: patient.id,
            name: patient.name || appointment.patientName,
            phone: patient.phone || appointment.patientPhone,
            whatsapp: patient.whatsapp || appointment.patientWhatsapp,
            email: patient.email || appointment.patientEmail || '',
            birthDate: patient.birthDate || appointment.patientBirthDate || '',
            cpf: patient.cpf || appointment.patientCpf || '',
            medicalRecordNumber:
              patient.medicalRecordNumber ||
              appointment.patientMedicalRecordNumber ||
              '',
          }

          setPatient(patientInfo)
        } else {
          setError('Paciente não encontrado')
          return
        }
      } else {
        setError('Erro ao carregar dados do paciente')
        return
      }

      // Carregar histórico de consultas anteriores reais usando o medicalPatientId correto
      const medicalRecordsResponse = await fetch(
        `/api/medical-records?patientId=${appointment.medicalPatientId}`,
        { credentials: 'include' }
      )
      if (medicalRecordsResponse.ok) {
        const patientRecords = await medicalRecordsResponse.json()

        const consultasData = patientRecords
          .sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          ) // Ordenar por data decrescente
          .map((record: any) => ({
            id: record.id,
            date: record.date,
            anamnesis: record.anamnesis || 'Não informado',
            observations: record.observations || '',
            calculatorResults: record.calculatorResults || [],
            attachments: record.attachments || [],
            diagnosticHypotheses: record.diagnosticHypotheses || [],
          }))

        setPreviousConsultations(consultasData)

        // Carregar hipóteses diagnósticas da última consulta
        if (consultasData.length > 0) {
          const lastConsultation = consultasData[0] // Assumindo que estão ordenadas por data
          if (
            lastConsultation.diagnosticHypotheses &&
            lastConsultation.diagnosticHypotheses.length > 0
          ) {
            setDiagnosticHypotheses(lastConsultation.diagnosticHypotheses)
          }
        }
      }

      // Carregar anexos existentes da consulta
      try {
        const attachmentsResponse = await fetch(
          `/api/medical-attachments?consultationId=${appointmentId}`,
          { credentials: 'include' }
        )
        if (attachmentsResponse.ok) {
          const attachmentsData = await attachmentsResponse.json()
          if (attachmentsData.attachments && attachmentsData.attachments.length > 0) {
            console.log('📎 Anexos existentes carregados:', attachmentsData.attachments.length)
            setSavedAttachments(attachmentsData.attachments)
          }
        }
      } catch (attachmentError) {
        console.error('Erro ao carregar anexos existentes:', attachmentError)
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!patient || !anamnesis.trim()) {
      alert('Por favor, preencha a anamnese antes de salvar.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient.id,
          anamnesis: anamnesis,
          examination: '',
          diagnosis: '',
          treatment: '',
          prescription: '',
          observations: '',
          doctorName: 'Dr. João Vitor Viana',
          calculatorResults: [],
          diagnosticHypotheses: diagnosticHypotheses,
        }),
      })

      if (response.ok) {
        alert('Anamnese salva com sucesso!')
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar anamnese. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const formatCalculatorResults = (results: any[]) => {
    return results
      .map(calc => {
        const name = getCalculatorDisplayName(calc)
        const score = getCalculatorScore(calc.result)
        const interpretation = getCalculatorInterpretation(calc, calc.result)

        return `${name}: ${score} - ${interpretation}`
      })
      .join('\n')
  }

  const getCalculatorDisplayName = (calc: any) => {
    // Primeiro tenta pegar o nome da calculadora
    if (calc.calculatorName) {
      const nameMap: { [key: string]: string } = {
        'Score de Wexner': 'Escore de Wexner',
        'Escala de Bristol': 'Escala de Bristol',
        CDAI: 'CDAI',
        'PAC-SYM': 'PAC-SYM',
        'PAC-QOL': 'PAC-QOL',
      }
      return nameMap[calc.calculatorName] || calc.calculatorName
    }

    // Se não tem calculatorName, tenta identificar pelo tipo do resultado
    if (calc.result && typeof calc.result === 'object') {
      if (calc.result.type === 'CDAI') return 'CDAI'
      if (calc.result.type === 'st-marks')
        return "Escala de Incontinência de St. Mark's"
      if (calc.result.type && calc.result.description)
        return 'Escala de Bristol'
      if (calc.result.totalScore !== undefined) return 'Escore de Wexner'
    }

    return 'Calculadora Médica'
  }

  const getCalculatorScore = (result: any) => {
    if (typeof result === 'object') {
      if (result.type && result.description) {
        // Escala de Bristol
        return `Tipo ${result.type}`
      }
      return result.totalScore || result.score || result.value || '0'
    }
    return result
  }

  const getCalculatorInterpretation = (calc: any, result: any) => {
    if (typeof result === 'object' && result.interpretation) {
      return result.interpretation
    }

    // Identificar tipo de calculadora e interpretar
    const calculatorName = getCalculatorDisplayName(calc)
    const score = getCalculatorScore(result)

    switch (calculatorName) {
      case 'Escore de Wexner':
        const numScore = parseInt(score.toString())
        if (numScore <= 9) return 'Incontinência leve'
        if (numScore <= 14) return 'Incontinência moderada'
        return 'Incontinência grave'

      case 'Escala de Bristol':
        if (result.description) {
          return `${result.description} (${result.interpretation || 'Normal'})`
        }
        return 'Normal'

      case 'CDAI':
        const cdaiScore = parseInt(score.toString())
        if (cdaiScore < 150) return 'Remissão'
        if (cdaiScore < 220) return 'Doença leve'
        if (cdaiScore < 450) return 'Doença moderada'
        return 'Doença severa'

      case "Escala de Incontinência de St. Mark's":
        const stMarksScore = parseInt(score.toString())
        if (stMarksScore === 0) return 'Continência perfeita'
        if (stMarksScore <= 12) return 'Incontinência leve'
        if (stMarksScore <= 18) return 'Incontinência moderada'
        return 'Incontinência severa'

      default:
        return 'Resultado registrado'
    }
  }

  const handleSaveCalculatorResult = (calculatorName: string, result: any) => {
    console.log('🔍 Page - handleSaveCalculatorResult chamado com:', {
      calculatorName,
      result,
    })

    const calculatorResult = {
      calculatorName,
      result,
      timestamp: new Date().toISOString(),
    }

    console.log('🔍 Page - Objeto calculatorResult criado:', calculatorResult)

    setCalculatorResults(prev => {
      // Verificar se já existe uma calculadora com o mesmo nome E resultado
      const existingIndex = prev.findIndex(
        r =>
          r.calculatorName === calculatorName &&
          JSON.stringify(r.result) === JSON.stringify(result)
      )

      // Se já existe exatamente o mesmo resultado, não adicionar duplicata
      if (existingIndex !== -1) {
        console.log('🔍 Page - Resultado duplicado, não adicionando')
        return prev
      }

      console.log('🔍 Page - Adicionando resultado ao estado (não é duplicata)')
      // Caso contrário, adicionar o novo resultado (permite múltiplas calculadoras diferentes)
      return [...prev, calculatorResult]
    })

    console.log(
      '🔍 Page - Estado atual de calculatorResults:',
      calculatorResults
    )
  }

  const handleFinishConsultation = async () => {
    if (!patient) {
      alert('Erro: Dados do paciente não encontrados.')
      return
    }

    if (!anamnesis.trim()) {
      alert('Por favor, preencha a anamnese antes de finalizar o atendimento.')
      return
    }

    setSaving(true)
    try {
      // 1. Usar apenas os anexos adicionados durante esta consulta
      const currentConsultationAttachments = savedAttachments

      // 2. Salvar o prontuário médico com anexos da consulta atual
      const medicalRecordResponse = await fetch('/api/medical-records', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicalPatientId: patient.id, // Corrigido: usar medicalPatientId em vez de patientId
          anamnesis: anamnesis,
          physicalExamination: '', // Adicionado campo esperado pela API
          diagnosis: '',
          treatment: '',
          prescription: '',
          observations: '', // Removido formatCalculatorResults para evitar duplicação
          doctorName: 'Dr. João Vitor Viana',
          doctorCrm: '', // Adicionado campo esperado pela API
          calculatorResults: calculatorResults,
          attachments: currentConsultationAttachments,
          diagnosticHypotheses: diagnosticHypotheses,
        }),
      })

      if (!medicalRecordResponse.ok) {
        throw new Error('Erro ao salvar prontuário médico')
      }

      // 2. Atualizar status do agendamento para 'concluida'
      const updateStatusResponse = await fetch('/api/unified-appointments', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-appointment-status',
          appointmentId: appointmentId,
          status: 'concluida',
          notes: 'Atendimento finalizado com sucesso',
        }),
      })

      if (!updateStatusResponse.ok) {
        console.warn(
          'Aviso: Erro ao atualizar status do agendamento, mas prontuário foi salvo'
        )
      }

      alert('Atendimento finalizado e salvo com sucesso!')
      router.push('/area-medica')
    } catch (error) {
      console.error('Erro ao finalizar:', error)
      alert('Erro ao finalizar atendimento. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleTimerUpdate = (time: number) => {
    setTimerTime(time)
  }

  const handleTimerStart = () => {
    setTimerRunning(true)
    console.log('Cronômetro iniciado')
  }

  const handleTimerStop = () => {
    setTimerRunning(false)
    console.log('Cronômetro parado')
  }

  useEffect(() => {
    if (appointmentId) {
      loadAppointmentData()
    }
  }, [appointmentId])

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black'>
        <BackgroundPattern />
        <Header />
        <div className='flex items-center justify-center h-64'>
          <div className='text-white'>Carregando atendimento...</div>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className='min-h-screen bg-black'>
        <BackgroundPattern />
        <Header />
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='text-white text-xl mb-4'>
              Atendimento não encontrado
            </div>
            <p className='text-gray-400 mb-6'>{error}</p>
            <Button
              onClick={() => router.push('/area-medica')}
              className='bg-blue-600 hover:bg-blue-700'
            >
              Voltar para Área Médica
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='atendimento' />

      {/* Cabeçalho da página */}
      <div className='bg-gray-800/40 border-b border-gray-700 mt-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <button
                onClick={() => router.push('/area-medica')}
                className='mr-4 p-2 text-gray-400 hover:text-white transition-colors cursor-pointer relative z-50 bg-gray-700 hover:bg-gray-600 rounded-md'
                type='button'
                style={{ minWidth: '40px', minHeight: '40px' }}
              >
                <ArrowLeftIcon className='h-6 w-6' />
              </button>
              <div>
                <h1 className='text-2xl font-bold text-white'>Atendimento</h1>
                <p className='text-sm text-gray-300'>
                  {patient.name} - Prontuário #
                  {patient.medicalRecordNumber || '001'}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor('em-andamento')}>
              {getStatusLabel('em-andamento')}
            </Badge>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Coluna Esquerda - Informações do Paciente */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Informações do Paciente */}
            <div className='bg-gray-800/60 rounded-lg shadow border border-gray-700 p-6'>
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
                  <p className='text-white flex items-center'>
                    <PhoneIcon className='h-4 w-4 mr-2' />
                    {patient.phone || 'Não informado'}
                  </p>
                </div>

                <div>
                  <p className='text-sm text-gray-300'>WhatsApp</p>
                  <p className='text-white'>
                    {patient.whatsapp || patient.phone || 'Não informado'}
                  </p>
                </div>

                <div>
                  <p className='text-sm text-gray-300'>Email</p>
                  <p className='text-white flex items-center break-all'>
                    <EnvelopeIcon className='h-4 w-4 mr-2 flex-shrink-0' />
                    <span className='break-all'>
                      {patient.email || 'Não informado'}
                    </span>
                  </p>
                </div>

                <div>
                  <p className='text-sm text-gray-300'>Data de Nascimento</p>
                  <p className='text-white'>
                    {patient.birthDate
                      ? formatDate(patient.birthDate)
                      : 'Não informado'}
                  </p>
                </div>

                <div>
                  <p className='text-sm text-gray-300'>Idade</p>
                  <p className='text-white'>
                    {patient.birthDate
                      ? `${calculateAge(patient.birthDate)} anos`
                      : 'Não informado'}
                  </p>
                </div>

                {patient.cpf && (
                  <div>
                    <p className='text-sm text-gray-300'>CPF</p>
                    <p className='text-white'>{patient.cpf}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cronômetro */}
            <div className='bg-gray-800/60 rounded-lg shadow border border-gray-700 p-4'>
              <h3 className='text-sm font-medium text-white mb-3 flex items-center'>
                <ClockIcon className='h-4 w-4 mr-2' />
                Cronômetro da Consulta
              </h3>
              <ConsultationTimer
                autoStart={true}
                onTimeUpdate={handleTimerUpdate}
                onStart={handleTimerStart}
                onStop={handleTimerStop}
              />
            </div>

            {/* Consultas Anteriores */}
            {previousConsultations.length > 0 && (
              <div className='bg-gray-800/60 rounded-lg shadow border border-gray-700 p-6'>
                <h2 className='text-lg font-medium text-white mb-4 flex items-center'>
                  <DocumentTextIcon className='h-5 w-5 mr-2' />
                  Consultas Anteriores
                </h2>

                <div className='space-y-3'>
                  {previousConsultations.map(consultation => (
                    <div
                      key={consultation.id}
                      className='border border-gray-600 rounded-lg'
                    >
                      <div
                        className='flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700 transition-colors'
                        onClick={() =>
                          setExpandedConsultation(
                            expandedConsultation === consultation.id
                              ? null
                              : consultation.id
                          )
                        }
                      >
                        <div>
                          <span className='text-sm font-medium text-white'>
                            {formatDate(consultation.date)}
                          </span>
                          <p className='text-xs text-gray-400'>
                            Clique para expandir
                          </p>
                        </div>
                        {expandedConsultation === consultation.id ? (
                          <svg
                            className='h-4 w-4 text-gray-400'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 15l7-7 7 7'
                            />
                          </svg>
                        ) : (
                          <svg
                            className='h-4 w-4 text-gray-400'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 9l-7 7-7-7'
                            />
                          </svg>
                        )}
                      </div>

                      {expandedConsultation === consultation.id && (
                        <div className='px-3 pb-3 border-t border-gray-600'>
                          <div className='mt-3 space-y-4'>
                            <div>
                              <h4 className='text-sm font-medium text-white mb-2'>
                                Anamnese:
                              </h4>
                              <p className='text-sm text-gray-300'>
                                {consultation.anamnesis}
                              </p>
                            </div>

                            {consultation.observations && consultation.observations.trim() && (
                              <div>
                                <h4 className='text-sm font-medium text-white mb-2'>
                                  Observações:
                                </h4>
                                <p className='text-sm text-gray-300'>
                                  {consultation.observations}
                                </p>
                              </div>
                            )}

                            {consultation.calculatorResults &&
                              consultation.calculatorResults.length > 0 && (
                                <div>
                                  <h4 className='text-sm font-medium text-white mb-2'>
                                    Calculadoras Utilizadas:
                                  </h4>
                                  <div className='space-y-1'>
                                    {consultation.calculatorResults.map(
                                      (calc: any, index: number) => {
                                        const name =
                                          calc.calculatorName ||
                                          (calc.result?.type === 'st-marks'
                                            ? "Escala de St. Mark's"
                                            : 'Calculadora')
                                        const score =
                                          calc.result?.score ||
                                          calc.result?.type ||
                                          'N/A'
                                        const interpretation =
                                          calc.result?.interpretation ||
                                          calc.result?.description ||
                                          'N/A'

                                        return (
                                          <div
                                            key={index}
                                            className='text-sm text-gray-300'
                                          >
                                            <span className='font-medium text-white'>
                                              • {name}:
                                            </span>
                                            <span className='ml-2'>
                                              {score} - {interpretation}
                                            </span>
                                          </div>
                                        )
                                      }
                                    )}
                                  </div>
                                </div>
                              )}

                            {consultation.diagnosticHypotheses &&
                              consultation.diagnosticHypotheses.length > 0 && (
                                <div>
                                  <h4 className='text-sm font-medium text-white mb-2'>
                                    Hipóteses Diagnósticas:
                                  </h4>
                                  <div className='flex flex-wrap gap-2'>
                                    {consultation.diagnosticHypotheses.map(
                                      (hypothesis: string, index: number) => (
                                        <Badge
                                          key={index}
                                          variant='secondary'
                                          className='bg-blue-900/30 text-blue-300 border-blue-700'
                                        >
                                          {hypothesis}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {consultation.attachments &&
                              consultation.attachments.length > 0 && (
                                <div>
                                  <h4 className='text-sm font-medium text-white mb-2'>
                                    Anexos ({consultation.attachments.length}):
                                  </h4>
                                  <div className='space-y-1'>
                                    {consultation.attachments.map(
                                      (attachment: any, index: number) => (
                                        <div
                                          key={index}
                                          className='text-sm text-gray-300 flex items-center'
                                        >
                                          <svg
                                            className='h-4 w-4 mr-2 text-blue-400'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                          >
                                            <path
                                              strokeLinecap='round'
                                              strokeLinejoin='round'
                                              strokeWidth={2}
                                              d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
                                            />
                                          </svg>
                                          <button
                                            onClick={e => {
                                              const fileUrl = `/api/medical-attachments/${attachment.fileName}`
                                              window.open(fileUrl, '_blank')
                                            }}
                                            className='text-blue-400 hover:text-blue-300 underline cursor-pointer transition-colors'
                                          >
                                            {attachment.originalName}
                                          </button>
                                          {attachment.description && (
                                            <span className='ml-2 text-gray-400'>
                                              - {attachment.description}
                                            </span>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Central e Direita - Atendimento */}
          <div className='lg:col-span-2'>
            <div className='bg-gray-800/60 rounded-lg shadow border border-gray-700 p-6'>
              <h2 className='text-lg font-medium text-white mb-6'>
                Atendimento Atual
              </h2>

              {/* Anamnese */}
              <div className='mb-8'>
                <div className='mb-4'>
                  <Label className='text-base font-medium text-white'>
                    Anamnese
                  </Label>
                </div>
                <Textarea
                  value={anamnesis}
                  onChange={e => setAnamnesis(e.target.value)}
                  placeholder='Digite toda a anamnese do paciente...'
                  className='min-h-[200px] bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                  style={{
                    cursor: 'text',
                    pointerEvents: 'auto',
                    userSelect: 'text',
                    position: 'relative',
                    zIndex: 10,
                    width: '100%',
                    height: '200px',
                    padding: '12px',
                    boxSizing: 'border-box',
                    display: 'block',
                  }}
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    ;(e.target as HTMLTextAreaElement).focus()
                  }}
                />
              </div>

              {/* Hipóteses Diagnósticas */}
              <div className='mb-8'>
                <div className='mb-4'>
                  <Label className='text-base font-medium text-white'>
                    Hipóteses Diagnósticas
                  </Label>
                  <p className='text-sm text-gray-400 mt-1'>
                    Selecione as possíveis condições médicas
                  </p>
                </div>

                <DiagnosticDropdown
                  selectedDiagnoses={diagnosticHypotheses}
                  onSelectionChange={setDiagnosticHypotheses}
                  placeholder='Clique para selecionar as hipóteses diagnósticas...'
                />
              </div>

              {/* Resultados das Calculadoras */}
              {calculatorResults.length > 0 && (
                <div className='mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg'>
                  <h3 className='text-blue-400 font-medium mb-3'>
                    Calculadoras Utilizadas:
                  </h3>
                  <div className='space-y-2'>
                    {calculatorResults.map((calc, index) => {
                      const name = getCalculatorDisplayName(calc)
                      const score = getCalculatorScore(calc.result)
                      const interpretation = getCalculatorInterpretation(
                        calc,
                        calc.result
                      )

                      return (
                        <div key={index} className='text-sm text-gray-300'>
                          <span className='text-gray-300'>• {name}:</span>
                          <span className='ml-2'>
                            {score} - {interpretation}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Botão Finalizar Atendimento */}
              <div className='mt-8 pt-6 border-t border-gray-600'>
                <Button
                  onClick={handleFinishConsultation}
                  disabled={saving || !anamnesis.trim()}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 disabled:opacity-50'
                >
                  {saving ? 'Finalizando...' : 'Finalizar Atendimento'}
                </Button>
              </div>
            </div>

            {/* Seção de Calculadoras Médicas */}
            <div className='bg-gray-800/60 rounded-lg shadow border border-gray-700 p-6 mt-6'>
              <MedicalCalculators
                patientName={patient.name}
                onSaveToRecord={handleSaveCalculatorResult}
              />
            </div>
          </div>
        </div>

        {/* Seção Separada - Modelos de Documentos */}
        <div className='mt-8'>
          <div className='bg-gray-800/60 rounded-lg shadow border border-gray-700 p-6'>
            <h2 className='text-lg font-medium text-white mb-6'>
              Modelos de Documentos
            </h2>

            <Tabs defaultValue='receituario' className='w-full'>
              <TabsList className='grid w-full grid-cols-6 bg-gray-700'>
                <TabsTrigger
                  value='receituario'
                  className='text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                >
                  Receituário Simples
                </TabsTrigger>
                <TabsTrigger
                  value='especial'
                  className='text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                >
                  Receituário Especial
                </TabsTrigger>
                <TabsTrigger
                  value='antimicrobiano'
                  className='text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                >
                  Antimicrobiano
                </TabsTrigger>
                <TabsTrigger
                  value='declaracoes'
                  className='text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                >
                  Declarações
                </TabsTrigger>
                <TabsTrigger
                  value='atestado'
                  className='text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                >
                  Atestado
                </TabsTrigger>
                <TabsTrigger
                  value='anexos'
                  className='text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white'
                >
                  <PhotoIcon className='h-4 w-4 mr-2' />
                  Anexos
                </TabsTrigger>
              </TabsList>

              <TabsContent value='receituario' className='mt-6'>
                <PrescriptionForm
                  patientName={patient?.name || 'Nome não informado'}
                  patientAge={
                    patient?.birthDate ? calculateAge(patient.birthDate) : 0
                  }
                />
              </TabsContent>

              <TabsContent value='especial' className='mt-6'>
                <SpecialPrescriptionForm
                  patientName={patient?.name || 'Nome não informado'}
                  patientAge={
                    patient?.birthDate ? calculateAge(patient.birthDate) : 0
                  }
                  patientAddress='Endereço a ser preenchido'
                />
              </TabsContent>

              <TabsContent value='antimicrobiano' className='mt-6'>
                <AntimicrobialPrescriptionForm
                  patientName={patient?.name || 'Nome não informado'}
                  patientId={patient?.medicalRecordNumber || '1'}
                  patientAddress='Endereço a ser preenchido'
                  doctorName='Dr. João Vítor Viana'
                  crm='12831-CRMPB'
                  onSave={data =>
                    console.log('Receituário antimicrobiano salvo:', data)
                  }
                />
              </TabsContent>

              <TabsContent value='declaracoes' className='mt-6'>
                <MedicalDeclarationForm
                  patientName={patient?.name || 'Nome não informado'}
                  patientAge={
                    patient?.birthDate ? calculateAge(patient.birthDate) : 0
                  }
                  patientCpf={patient?.cpf}
                />
              </TabsContent>

              <TabsContent value='atestado' className='mt-6'>
                <MedicalCertificateForm
                  patientName={patient?.name || 'Nome não informado'}
                  patientAge={
                    patient?.birthDate ? calculateAge(patient.birthDate) : 0
                  }
                />
              </TabsContent>

              <TabsContent value='anexos' className='mt-6'>
                <div className='space-y-6'>
                  <MedicalImageUpload
                    consultationId={appointmentId}
                    patientName={patient?.name || 'Paciente'}
                    onSave={attachments => {
                      console.log('Anexos salvos:', attachments)
                      setSavedAttachments(prev => [...prev, ...attachments])
                    }}
                  />
                  
                  {savedAttachments.length > 0 && (
                    <div className='mt-6'>
                      <h3 className='text-lg font-semibold mb-4 text-green-600'>
                        📎 Anexos Salvos ({savedAttachments.length})
                      </h3>
                      <div className='grid gap-3'>
                        {savedAttachments.map((attachment, index) => (
                          <div key={attachment.id || index} className='flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg'>
                            <div className='flex items-center space-x-3'>
                              <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                                <span className='text-green-600 text-sm'>📄</span>
                              </div>
                              <div>
                                <p className='font-medium text-gray-900'>{attachment.originalName}</p>
                                <p className='text-sm text-gray-500'>
                                  {attachment.category} • {attachment.description}
                                </p>
                              </div>
                            </div>
                            <div className='text-sm text-green-600 font-medium'>
                              ✅ Salvo
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
