'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/ui/header'
import BackgroundPattern from '../../../components/ui/background-pattern'
import BrazilianDatePicker from '../../../components/ui/brazilian-date-picker'
import { TimePicker } from '../../../components/ui/time-picker'
import { InteractiveCalendar } from '../../../components/ui/interactive-calendar'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import SurgeryForm from './components/SurgeryForm'
import {
  ScissorsIcon,
  CalendarDaysIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  ClockIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

interface MedicalPatient {
  id: string
  fullName: string
  cpf: string
  recordNumber: number
  communicationContact?: {
    phone?: string
    whatsapp?: string
    email?: string
  }
}

interface TussProcedure {
  id: string
  tussCode: string
  cbhpmCode?: string
  description: string
  category: string
  value?: number
}

interface Surgery {
  id: string
  medicalPatient?: MedicalPatient
  patientName?: string
  surgeryType: string
  hospital: string
  surgeryDate: string
  surgeryTime: string
  paymentType: 'PARTICULAR' | 'INSURANCE'
  insurancePlan?: string
  totalAmount?: number
  hospitalAmount?: number
  anesthesiologistAmount?: number
  instrumentalistAmount?: number
  assistantAmount?: number
  surgeonAmount?: number
  surgeryCategory?: 'HEMORRHOIDECTOMY' | 'FISTULOTOMY' | 'FISSURECTOMY' | 'PROLAPSE_CORRECTION' | 'RECTOCELE_CORRECTION' | 'HERNIOPLASTY' | 'CHOLECYSTECTOMY' | 'PILONIDAL' | 'COLECTOMY' | 'OTHER'
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'
  notes?: string
  procedures?: Array<{
    tussCode: string
    description: string
    quantity: number
  }>
  createdAt: string
  updatedAt: string
}

export default function CirurgiasPage() {
  const router = useRouter()

  // Estados
  const [surgeries, setSurgeries] = useState<Surgery[]>([])
  const [patients, setPatients] = useState<MedicalPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [daySurgeries, setDaySurgeries] = useState<Surgery[]>([])
  const [showDayModal, setShowDayModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Surgery[]>([])
  const [filterDate, setFilterDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  useEffect(() => {
    loadSurgeries()
    loadPatients()
  }, [])

  useEffect(() => {
    loadDaySurgeries(selectedDate)
  }, [selectedDate, surgeries])

  const loadSurgeries = async () => {
    try {
      console.log('=== CARREGANDO CIRURGIAS ===')
      const response = await fetch('/api/surgeries')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Cirurgias carregadas:', data)
        setSurgeries(data) // A nova API retorna diretamente o array
      } else {
        console.error('Erro ao carregar cirurgias:', response.status)
        setSurgeries([])
      }
    } catch (error) {
      console.error('Erro ao carregar cirurgias:', error)
      setSurgeries([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/unified-system/medical-patients', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const patientsData = data.patients || []
        
        // Mapear dados dos pacientes para o formato esperado
        const mappedPatients = patientsData.map((patient: any) => ({
          id: patient.id,
          name: patient.fullName || patient.name || 'Nome não disponível',
          email: patient.email || '',
          phone: patient.phone || '',
          cpf: patient.cpf || '',
          birthDate: patient.birthDate || ''
        }))
        
        setPatients(mappedPatients)
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    }
  }

  const loadDaySurgeries = (date: Date) => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const filtered = surgeries.filter(surgery => {
      const surgeryDate = new Date(surgery.surgeryDate)
      return surgeryDate >= dayStart && surgeryDate <= dayEnd
    })
    setDaySurgeries(filtered)
  }

  const handleSurgerySubmit = async (surgeryData: any) => {
    console.log('=== RECEBENDO DADOS NO HANDLESUBMIT ===')
    console.log('Dados recebidos:', surgeryData)
    console.log('Tipo dos dados:', typeof surgeryData)
    console.log('É objeto vazio?', Object.keys(surgeryData).length === 0)
    
    try {
      const method = editingSurgery ? 'PUT' : 'POST'
      const url = editingSurgery
        ? `/api/surgeries`
        : '/api/surgeries'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          editingSurgery
            ? { ...surgeryData, id: editingSurgery.id }
            : surgeryData
        ),
      })

      if (response.ok) {
        console.log('Cirurgia salva com sucesso!')
        await loadSurgeries()
        setShowForm(false)
        setEditingSurgery(null)
      } else {
        const errorData = await response.text()
        console.error('Erro ao salvar cirurgia:', response.status, errorData)
        console.error('Dados que causaram o erro:', surgeryData)
      }
    } catch (error) {
      console.error('Erro ao salvar cirurgia:', error)
      console.error('Dados que causaram o erro:', surgeryData)
    }
  }

  const handleEdit = (surgery: Surgery) => {
    setEditingSurgery(surgery)
    setShowForm(true)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    const daySurgeries = surgeries.filter(surgery => 
      new Date(surgery.surgeryDate).toISOString().split('T')[0] === date
    )

    if (daySurgeries.length > 0) {
      setSelectedDayAppointments(daySurgeries)
      setShowModal(true)
    }
  }

  const handleReschedule = (surgery: Surgery) => {
    // Preenche o formulário com os dados da cirurgia para reagendamento
    setEditingSurgery({
      ...surgery,
      // Limpa a data e hora para permitir novo agendamento
      surgeryDate: '',
      surgeryTime: ''
    })
    setShowForm(true)
  }

  const handleDelete = async (surgeryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta cirurgia?')) {
      try {
        const response = await fetch(`/api/surgeries?id=${surgeryId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        if (response.ok) {
          await loadSurgeries()
          alert('Cirurgia excluída com sucesso!')
        } else {
          const errorText = await response.text()
          console.error('Erro ao excluir cirurgia:', response.status, errorText)
          alert(`Erro ao excluir cirurgia: ${response.status}`)
        }
      } catch (error) {
        console.error('Erro ao excluir cirurgia:', error)
        alert('Erro ao excluir cirurgia')
      }
    }
  }

  const filteredSurgeries = surgeries.filter(surgery => {
    const matchesDate = selectedDate ? 
      new Date(surgery.surgeryDate).toISOString().split('T')[0] === selectedDate : true
    const matchesSearch = searchTerm ? 
      (surgery.patientName || surgery.medicalPatient?.fullName || surgery.medicalPatient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      surgery.surgeryType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surgery.hospital.toLowerCase().includes(searchTerm.toLowerCase()) : true
    return matchesDate && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'POSTPONED':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Agendada'
      case 'CONFIRMED':
        return 'Confirmada'
      case 'IN_PROGRESS':
        return 'Em Andamento'
      case 'COMPLETED':
        return 'Concluída'
      case 'CANCELLED':
        return 'Cancelada'
      case 'POSTPONED':
        return 'Adiada'
      default:
        return status
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-white'>Carregando...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='area-medica' />

      <div className='relative isolate'>
        {/* Header da página */}
        <div className='pt-32 pb-8'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700'>
                  <ScissorsIcon className='w-8 h-8 text-blue-400' />
                </div>
                <div>
                  <h1 className='text-4xl font-bold text-white'>
                    Controle de Cirurgias
                  </h1>
                  <p className='text-gray-300 text-lg mt-2'>
                    Gerencie suas cirurgias e controle financeiro
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3 relative z-10'>
                <MedicalAreaMenu currentPage='cirurgias' />
              </div>
            </div>
          </div>
        </div>

        <div className='mx-auto max-w-7xl px-6 lg:px-8 pb-8'>
          {/* Filtros e ações */}
          <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700 mb-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='flex bg-gray-800/50 rounded-lg p-1'>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-blue-600/80 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Lista
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === 'calendar'
                        ? 'bg-blue-600/80 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Calendário
                  </button>
                </div>

                {viewMode === 'list' && (
                  <>
                    <div className='flex items-center space-x-2'>
                      <MagnifyingGlassIcon className='w-5 h-5 text-gray-400' />
                      <input
                        type='text'
                        placeholder='Buscar por paciente, cirurgia ou hospital...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm w-64'
                      />
                    </div>
                    <label className='text-sm font-medium text-gray-300'>
                      Filtrar por data:
                    </label>
                    <BrazilianDatePicker
                      value={selectedDate}
                      onChange={setSelectedDate}
                      className='px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                      placeholder='DD/MM/AAAA'
                    />
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate('')}
                        className='text-sm text-gray-400 hover:text-white'
                      >
                        Limpar filtro
                      </button>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setShowForm(true)
                }}
                className='bg-blue-600/80 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 border border-blue-500/50 backdrop-blur-sm flex items-center gap-2'
              >
                <PlusIcon className='w-5 h-5' />
                Nova Cirurgia
              </button>
            </div>
          </div>

          {/* Conteúdo principal */}
          {viewMode === 'list' ? (
            /* Lista de cirurgias */
            <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700'>
              <div className='p-6'>
                <h3 className='text-xl font-semibold text-white mb-6'>
                  Cirurgias{' '}
                  {selectedDate ? `do dia ${selectedDate}` : 'Cadastradas'}
                </h3>

                {filteredSurgeries.length === 0 ? (
                  <div className='text-center py-12'>
                    <ScissorsIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-400'>
                      {selectedDate
                        ? 'Nenhuma cirurgia encontrada para esta data'
                        : 'Nenhuma cirurgia cadastrada'}
                    </p>
                  </div>
                ) : (
                  <div className='overflow-x-auto rounded-xl border border-gray-700'>
                    <table className='min-w-full divide-y divide-gray-700'>
                      <thead className='bg-gray-800/50 backdrop-blur-sm'>
                        <tr>
                          <th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                            Paciente
                          </th>
                          <th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                            Cirurgia
                          </th>
                          <th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                            Data/Hora
                          </th>
                          <th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                            Tipo
                          </th>
                          <th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                            Valor/Plano
                          </th>
                          <th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                            Status
                          </th>
                          <th className='px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-gray-800/30 backdrop-blur-sm divide-y divide-gray-700'>
                        {filteredSurgeries.map(surgery => (
                          <tr
                            key={surgery.id}
                            className='hover:bg-gray-700/50 transition-colors duration-200'
                          >
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='flex items-center'>
                                <UserIcon className='h-5 w-5 text-gray-400 mr-2' />
                                <div>
                                  <div className='text-sm font-medium text-white'>
                                    {surgery.patientName || surgery.medicalPatient?.fullName || surgery.medicalPatient?.name || 'Nome não disponível'}
                                  </div>
                                  <div className='text-xs text-gray-400'>
                                    Prontuário: {surgery.medicalPatient?.recordNumber || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div>
                                <div className='text-sm font-medium text-white'>
                                  {surgery.surgeryType || 'Tipo não informado'}
                                </div>
                                <div className='text-xs text-gray-400'>
                                  {surgery.hospital || 'Hospital não informado'}
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                              <div>
                                <div>{new Date(surgery.surgeryDate + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</div>
                                <div className='text-xs text-gray-400'>
                                  {surgery.surgeryTime || 'Horário não informado'}
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300'>
                                {surgery.paymentType === 'PARTICULAR' ? 'Particular' : 'Plano'}
                              </span>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                              {surgery.paymentType === 'PARTICULAR' ? (
                                <div>
                                  <div className='text-green-400 font-medium'>
                                    Total: {formatCurrency(surgery.totalAmount || 0)}
                                  </div>
                                  <div className='text-xs text-gray-400'>
                                    Médico: {formatCurrency(surgery.doctorValue || (surgery.totalAmount || 0) - (surgery.hospitalAmount || 0) - (surgery.anesthesiologistAmount || 0) - (surgery.instrumentalistAmount || 0) - (surgery.assistantAmount || 0))}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className='text-blue-400 font-medium'>
                                    {surgery.insurancePlan || 'Plano de Saúde'}
                                  </div>
                                  <div className='text-xs text-gray-400'>
                                    {surgery.procedures && surgery.procedures.length > 0 
                                      ? `Códigos: ${surgery.procedures.map(p => p.tussProcedure?.tussCode || p.tussProcedure?.cbhpmCode).filter(Boolean).join(', ')}`
                                      : 'Códigos não informados'
                                    }
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  surgery.status
                                )}`}
                              >
                                {getStatusLabel(surgery.status)}
                              </span>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                              <div className='flex items-center space-x-2'>
                                <button
                                  onClick={() => handleEdit(surgery)}
                                  className='text-blue-400 hover:text-blue-300 transition-colors duration-200 p-1 rounded hover:bg-blue-400/10'
                                  title='Editar cirurgia'
                                >
                                  <PencilIcon className='h-4 w-4' />
                                </button>
                                <button
                                  onClick={() => handleDelete(surgery.id)}
                                  className='text-red-400 hover:text-red-300 transition-colors duration-200 p-1 rounded hover:bg-red-400/10'
                                  title='Excluir cirurgia'
                                >
                                  <TrashIcon className='h-4 w-4' />
                                </button>
                                <button
                                  onClick={() => handleReschedule(surgery)}
                                  className='text-yellow-400 hover:text-yellow-300 transition-colors duration-200 p-1 rounded hover:bg-yellow-400/10'
                                  title='Remarcar cirurgia'
                                >
                                  <CalendarDaysIcon className='h-4 w-4' />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Visualização em calendário */
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Calendário */}
              <div className='lg:col-span-2'>
                <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-6'>
                  <div className='mb-6'>
                    <h2 className='text-xl font-semibold text-white mb-3 flex items-center'>
                      <div className='p-2 bg-blue-900/20 rounded-lg mr-3'>
                        <CalendarDaysIcon className='h-5 w-5 text-blue-400' />
                      </div>
                      Calendário de Cirurgias
                    </h2>
                    <p className='text-sm text-gray-300'>
                      Clique em um dia com cirurgias para ver os detalhes
                    </p>
                  </div>
                  <InteractiveCalendar
                    onDateSelect={handleDateSelect}
                    selectedDate={selectedDate}
                    appointments={surgeries.map(surgery => ({
                      id: surgery.id,
                      date: new Date(surgery.surgeryDate).toISOString().split('T')[0],
                      patientName: surgery.patientName || surgery.medicalPatient?.fullName || surgery.medicalPatient?.name || 'Nome não disponível',
                      status: surgery.status,
                      time: surgery.surgeryTime,
                    }))}
                  />
                </div>
              </div>

              {/* Detalhes do dia selecionado */}
              <div className='lg:col-span-1'>
                <div className='bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-6'>
                  <h2 className='text-xl font-semibold text-white mb-6 flex items-center'>
                    <div className='p-2 bg-blue-900/20 rounded-lg mr-3'>
                      <ClockIcon className='h-5 w-5 text-blue-400' />
                    </div>
                    Cirurgias do Dia
                  </h2>

                  {selectedDayAppointments.length > 0 ? (
                    <div className='space-y-4'>
                      {selectedDayAppointments.map((surgery, index) => (
                        <div
                          key={index}
                          className='bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600 hover:bg-gray-700/50 transition-all duration-200'
                        >
                          <div className='flex items-start justify-between mb-3'>
                            <h3 className='font-medium text-white'>
                              {surgery.patientName || surgery.medicalPatient?.fullName || surgery.medicalPatient?.name || 'Nome não disponível'}
                            </h3>
                            <span
                              className={`text-xs px-3 py-1 rounded-full ${getStatusColor(surgery.status)}`}
                            >
                              {getStatusLabel(surgery.status)}
                            </span>
                          </div>
                          <div className='space-y-2 text-sm text-gray-300'>
                            <div className='flex items-center'>
                              <ClockIcon className='h-4 w-4 mr-2 text-blue-400' />
                              <span>{surgery.surgeryTime}</span>
                            </div>
                            <div className='flex items-center'>
                              <ScissorsIcon className='h-4 w-4 mr-2 text-blue-400' />
                              <span>{surgery.surgeryType}</span>
                            </div>
                            <div className='flex items-center'>
                              {surgery.paymentType === 'PARTICULAR' ? (
                                <CurrencyDollarIcon className='h-4 w-4 mr-2 text-green-400' />
                              ) : (
                                <BuildingOfficeIcon className='h-4 w-4 mr-2 text-blue-400' />
                              )}
                              <span className='capitalize'>
                                {surgery.paymentType === 'PARTICULAR' ? 'Particular' : 'Plano'}
                              </span>
                            </div>
                            {surgery.paymentType === 'PARTICULAR' ? (
                              <div className='text-xs text-gray-400'>
                                Total: {formatCurrency(surgery.totalAmount || 0)}
                              </div>
                            ) : (
                              <div className='text-xs text-gray-400'>
                                {surgery.insurancePlan || 'Plano de Saúde'}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center text-gray-400 py-8'>
                      <div className='p-4 bg-blue-900/10 rounded-xl mb-4'>
                        <ScissorsIcon className='h-12 w-12 mx-auto text-blue-400/50' />
                      </div>
                      <p>Nenhuma cirurgia neste dia</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalhes das cirurgias do dia */}
      {showModal && selectedDayAppointments.length > 0 && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden'>
            <div className='flex items-center justify-between p-6 border-b border-gray-700'>
              <div className='flex items-center'>
                <div className='p-2 bg-blue-900/20 rounded-lg mr-3'>
                  <CalendarDaysIcon className='h-6 w-6 text-blue-400' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-white'>
                    Cirurgias do dia {selectedDate}
                  </h2>
                  <p className='text-sm text-gray-400'>
                    {selectedDayAppointments.length} cirurgia
                    {selectedDayAppointments.length !== 1 ? 's' : ''} agendada
                    {selectedDayAppointments.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className='p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200'
              >
                <XMarkIcon className='h-6 w-6 text-gray-400' />
              </button>
            </div>

            <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
              <div className='space-y-6'>
                {selectedDayAppointments.map((surgery, index) => (
                  <div
                    key={index}
                    className='bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600'
                  >
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex items-center'>
                        <div className='p-2 bg-blue-900/20 rounded-lg mr-3'>
                          <UserIcon className='h-5 w-5 text-blue-400' />
                        </div>
                        <div>
                          <h3 className='text-lg font-semibold text-white'>
                            {surgery.patientName}
                          </h3>
                          <p className='text-sm text-gray-400'>
                            {surgery.surgeryType}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(surgery.status)}`}
                        >
                          {surgery.status}
                        </span>
                        <div className='flex items-center text-sm text-gray-300'>
                          <ClockIcon className='h-4 w-4 mr-1 text-blue-400' />
                          {surgery.time}
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      {/* Informações básicas */}
                      <div className='space-y-4'>
                        <div>
                          <h4 className='text-sm font-medium text-gray-300 mb-2'>
                            Informações da Cirurgia
                          </h4>
                          <div className='space-y-2'>
                            <div className='flex items-center text-sm'>
                              <ScissorsIcon className='h-4 w-4 mr-2 text-blue-400' />
                              <span className='text-gray-300'>
                                {surgery.surgeryType}
                              </span>
                            </div>
                            <div className='flex items-center text-sm'>
                              {surgery.paymentType === 'particular' ? (
                                <CurrencyDollarIcon className='h-4 w-4 mr-2 text-green-400' />
                              ) : (
                                <BuildingOfficeIcon className='h-4 w-4 mr-2 text-blue-400' />
                              )}
                              <span className='text-gray-300 capitalize'>
                                {surgery.paymentType === 'PARTICULAR' ? 'Particular' : 'Plano de Saúde'}
                              </span>
                            </div>
                            {surgery.hospital && (
                              <div className='flex items-center text-sm'>
                                <BuildingOffice2Icon className='h-4 w-4 mr-2 text-gray-400' />
                                <span className='text-gray-300'>
                                  {surgery.hospital}
                                </span>
                              </div>
                            )}
                            {surgery.surgeryTime && (
                              <div className='flex items-center text-sm'>
                                <ClockIcon className='h-4 w-4 mr-2 text-gray-400' />
                                <span className='text-gray-300'>
                                  {surgery.surgeryTime}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Informações financeiras */}
                      <div className='space-y-4'>
                        <div>
                          <h4 className='text-sm font-medium text-gray-300 mb-2'>
                            {surgery.paymentType === 'PARTICULAR'
                              ? 'Valores Particulares'
                              : 'Informações do Plano'}
                          </h4>
                          {surgery.paymentType === 'PARTICULAR' ? (
                            <div className='space-y-2 text-sm'>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>Total:</span>
                                <span className='text-white font-medium'>
                                  {formatCurrency(surgery.totalAmount || 0)}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>Hospital:</span>
                                <span className='text-white'>
                                  {formatCurrency(surgery.hospitalAmount || 0)}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>
                                  Anestesista:
                                </span>
                                <span className='text-white'>
                                  {formatCurrency(
                                    surgery.anesthesiologistAmount || 0
                                  )}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>
                                  Instrumentadora:
                                </span>
                                <span className='text-white'>
                                  {formatCurrency(
                                    surgery.instrumentalistAmount || 0
                                  )}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>Auxiliar:</span>
                                <span className='text-white'>
                                  {formatCurrency(surgery.assistantAmount || 0)}
                                </span>
                              </div>
                              <div className='flex justify-between border-t border-gray-600 pt-2'>
                                <span className='text-gray-400'>Cirurgião:</span>
                                <span className='text-green-400 font-medium'>
                                  {formatCurrency(surgery.surgeonAmount || 0)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className='space-y-2 text-sm'>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>Plano:</span>
                                <span className='text-white'>
                                  {surgery.insurancePlan || 'Não informado'}
                                </span>
                              </div>
                              <div>
                                <span className='text-gray-400 block mb-1'>
                                  Códigos TUSS:
                                </span>
                                {surgery.procedures && surgery.procedures.length > 0 ? (
                                  <div className='flex flex-wrap gap-1'>
                                    {surgery.procedures.map((procedure, idx) => (
                                      <span
                                        key={idx}
                                        className='px-2 py-1 bg-blue-900/20 text-blue-300 rounded text-xs'
                                        title={procedure.description}
                                      >
                                        {procedure.tussCode}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className='text-gray-500 text-xs'>
                                    Nenhum código TUSS informado
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {surgery.notes && (
                      <div className='mt-4 pt-4 border-t border-gray-600'>
                        <h4 className='text-sm font-medium text-gray-300 mb-2'>
                          Observações
                        </h4>
                        <p className='text-sm text-gray-400'>{surgery.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulário */}
      <SurgeryForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingSurgery(null)
        }}
        onSubmit={handleSurgerySubmit}
        editingSurgery={editingSurgery}
        patients={patients}
        key={editingSurgery?.id || 'new'} // Força re-render quando muda entre edição e novo
      />
    </div>
  )
}
