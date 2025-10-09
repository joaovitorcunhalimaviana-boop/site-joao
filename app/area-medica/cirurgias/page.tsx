'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/ui/header'
import BackgroundPattern from '../../../components/ui/background-pattern'
import BrazilianDatePicker from '../../../components/ui/brazilian-date-picker'
import { TimePicker } from '../../../components/ui/time-picker'
import { InteractiveCalendar } from '../../../components/ui/interactive-calendar'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
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
} from '@heroicons/react/24/outline'

interface Surgery {
  id: string
  patientName: string
  surgeryType: string
  date: string
  time: string
  hospital: string
  paymentType: 'particular' | 'plano'
  // Campos para particulares
  totalValue?: number
  hospitalValue?: number
  anesthesiologistValue?: number
  instrumentalistValue?: number
  auxiliaryValue?: number
  doctorValue?: number
  // Campos para planos
  procedureCodes?: string
  insurancePlan?: string
  status: 'agendada' | 'confirmada' | 'concluida' | 'cancelada'
  notes?: string
}

export default function CirurgiasPage() {
  const [surgeries, setSurgeries] = useState<Surgery[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<
    Surgery[]
  >([])
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const router = useRouter()

  // Estados do formulário
  const [formData, setFormData] = useState({
    patientName: '',
    surgeryType: '',
    date: '',
    time: '',
    hospital: '',
    paymentType: 'particular' as 'particular' | 'plano',
    totalValue: '',
    hospitalValue: '',
    anesthesiologistValue: '',
    instrumentalistValue: '',
    auxiliaryValue: '',
    doctorValue: '',
    insurancePlan: '',
    procedureCodes: '',
    notes: '',
  })

  useEffect(() => {
    loadSurgeries()
  }, [])

  useEffect(() => {
    loadDaySurgeries(selectedDate)
  }, [selectedDate, surgeries])

  const loadSurgeries = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/surgeries')
      if (response.ok) {
        const data = await response.json()
        setSurgeries(data.surgeries || [])
      }
    } catch (error) {
      console.error('Erro ao carregar cirurgias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDaySurgeries = (date: string) => {
    if (!date) {
      setSelectedDayAppointments([])
      return
    }

    const daySurgeries = surgeries.filter(surgery => surgery.date === date)
    setSelectedDayAppointments(daySurgeries)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    const daySurgeries = surgeries.filter(surgery => surgery.date === date)

    if (daySurgeries.length > 0) {
      setShowModal(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const surgeryData: Omit<Surgery, 'id'> = {
        patientName: formData.patientName,
        surgeryType: formData.surgeryType,
        date: formData.date,
        time: formData.time,
        hospital: formData.hospital || '',
        paymentType: formData.paymentType,
        status: 'agendada',
        notes: formData.notes,
      }

      if (formData.paymentType === 'particular') {
        surgeryData.totalValue = parseFloat(formData.totalValue) || 0
        surgeryData.hospitalValue = parseFloat(formData.hospitalValue) || 0
        surgeryData.anesthesiologistValue =
          parseFloat(formData.anesthesiologistValue) || 0
        surgeryData.instrumentalistValue =
          parseFloat(formData.instrumentalistValue) || 0
        surgeryData.auxiliaryValue = parseFloat(formData.auxiliaryValue) || 0
        surgeryData.doctorValue = parseFloat(formData.doctorValue) || 0
      } else {
        surgeryData.insurancePlan = formData.insurancePlan
        surgeryData.procedureCodes = formData.procedureCodes
      }

      const method = editingSurgery ? 'PUT' : 'POST'
      const url = editingSurgery
        ? `/api/surgeries/${editingSurgery.id}`
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
        await loadSurgeries()
        resetForm()
        setShowForm(false)
      } else {
        console.error('Erro ao salvar cirurgia')
      }
    } catch (error) {
      console.error('Erro ao salvar cirurgia:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      patientName: '',
      surgeryType: '',
      date: '',
      time: '',
      hospital: '',
      paymentType: 'particular',
      totalValue: '',
      hospitalValue: '',
      anesthesiologistValue: '',
      instrumentalistValue: '',
      auxiliaryValue: '',
      doctorValue: '',
      insurancePlan: '',
      procedureCodes: '',
      notes: '',
    })
    setEditingSurgery(null)
  }

  const handleEdit = (surgery: Surgery) => {
    setEditingSurgery(surgery)
    setFormData({
      patientName: surgery.patientName,
      surgeryType: surgery.surgeryType,
      date: surgery.date,
      time: surgery.time,
      hospital: surgery.hospital,
      paymentType: surgery.paymentType,
      totalValue: surgery.totalValue?.toString() || '',
      hospitalValue: surgery.hospitalValue?.toString() || '',
      anesthesiologistValue: surgery.anesthesiologistValue?.toString() || '',
      instrumentalistValue: surgery.instrumentalistValue?.toString() || '',
      auxiliaryValue: surgery.auxiliaryValue?.toString() || '',
      doctorValue: surgery.doctorValue?.toString() || '',
      insurancePlan: surgery.insurancePlan || '',
      procedureCodes: surgery.procedureCodes || '',
      notes: surgery.notes || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (surgeryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta cirurgia?')) {
      try {
        const response = await fetch(`/api/surgeries/${surgeryId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await loadSurgeries()
        }
      } catch (error) {
        console.error('Erro ao excluir cirurgia:', error)
      }
    }
  }

  const filteredSurgeries = selectedDate
    ? surgeries.filter(surgery => surgery.date === selectedDate)
    : surgeries

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800'
      case 'confirmada':
        return 'bg-yellow-100 text-yellow-800'
      case 'concluida':
        return 'bg-green-100 text-green-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
                  resetForm()
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
                                <div className='text-sm font-medium text-white'>
                                  {surgery.patientName}
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                              {surgery.surgeryType}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                              <div>
                                <div>{surgery.date}</div>
                                <div className='text-xs text-gray-400'>
                                  {surgery.time}
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='flex items-center'>
                                {surgery.paymentType === 'particular' ? (
                                  <CurrencyDollarIcon className='h-4 w-4 text-green-400 mr-1' />
                                ) : (
                                  <BuildingOfficeIcon className='h-4 w-4 text-blue-400 mr-1' />
                                )}
                                <span className='text-sm text-gray-300 capitalize'>
                                  {surgery.paymentType}
                                </span>
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                              {surgery.paymentType === 'particular' ? (
                                <div>
                                  <div className='font-medium'>
                                    {formatCurrency(surgery.totalValue || 0)}
                                  </div>
                                  <div className='text-xs text-gray-400'>
                                    Dr:{' '}
                                    {formatCurrency(surgery.doctorValue || 0)}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className='font-medium'>
                                    {surgery.insurancePlan}
                                  </div>
                                  <div className='text-xs text-gray-400'>
                                    Códigos: {surgery.procedureCodes}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(surgery.status)}`}
                              >
                                {surgery.status}
                              </span>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                              <div className='flex items-center space-x-2'>
                                <button
                                  onClick={() => handleEdit(surgery)}
                                  className='text-blue-400 hover:text-blue-300 transition-colors duration-200'
                                >
                                  <PencilIcon className='h-4 w-4' />
                                </button>
                                <button
                                  onClick={() => handleDelete(surgery.id)}
                                  className='text-red-400 hover:text-red-300 transition-colors duration-200'
                                >
                                  <TrashIcon className='h-4 w-4' />
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
                      date: surgery.date,
                      patientName: surgery.patientName,
                      status: surgery.status,
                      time: surgery.time,
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
                              {surgery.patientName}
                            </h3>
                            <span
                              className={`text-xs px-3 py-1 rounded-full ${getStatusColor(surgery.status)}`}
                            >
                              {surgery.status}
                            </span>
                          </div>
                          <div className='space-y-2 text-sm text-gray-300'>
                            <div className='flex items-center'>
                              <ClockIcon className='h-4 w-4 mr-2 text-blue-400' />
                              <span>{surgery.time}</span>
                            </div>
                            <div className='flex items-center'>
                              <ScissorsIcon className='h-4 w-4 mr-2 text-blue-400' />
                              <span>{surgery.surgeryType}</span>
                            </div>
                            <div className='flex items-center'>
                              {surgery.paymentType === 'particular' ? (
                                <CurrencyDollarIcon className='h-4 w-4 mr-2 text-green-400' />
                              ) : (
                                <BuildingOfficeIcon className='h-4 w-4 mr-2 text-blue-400' />
                              )}
                              <span className='capitalize'>
                                {surgery.paymentType}
                              </span>
                            </div>
                            {surgery.paymentType === 'particular' ? (
                              <div className='text-xs text-gray-400'>
                                Total: {formatCurrency(surgery.totalValue || 0)}
                              </div>
                            ) : (
                              <div className='text-xs text-gray-400'>
                                {surgery.insurancePlan} - Códigos:{' '}
                                {surgery.procedureCodes || 'N/A'}
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
                                {surgery.paymentType}
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
                          </div>
                        </div>
                      </div>

                      {/* Informações financeiras */}
                      <div className='space-y-4'>
                        <div>
                          <h4 className='text-sm font-medium text-gray-300 mb-2'>
                            {surgery.paymentType === 'particular'
                              ? 'Valores Particulares'
                              : 'Informações do Plano'}
                          </h4>
                          {surgery.paymentType === 'particular' ? (
                            <div className='space-y-2 text-sm'>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>Total:</span>
                                <span className='text-white font-medium'>
                                  {formatCurrency(surgery.totalValue || 0)}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>Hospital:</span>
                                <span className='text-white'>
                                  {formatCurrency(surgery.hospitalValue || 0)}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>
                                  Anestesista:
                                </span>
                                <span className='text-white'>
                                  {formatCurrency(
                                    surgery.anesthesiologistValue || 0
                                  )}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>
                                  Instrumentadora:
                                </span>
                                <span className='text-white'>
                                  {formatCurrency(
                                    surgery.instrumentalistValue || 0
                                  )}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>Auxiliar:</span>
                                <span className='text-white'>
                                  {formatCurrency(surgery.auxiliaryValue || 0)}
                                </span>
                              </div>
                              <div className='flex justify-between border-t border-gray-600 pt-2'>
                                <span className='text-gray-400'>Médico:</span>
                                <span className='text-green-400 font-medium'>
                                  {formatCurrency(surgery.doctorValue || 0)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className='space-y-2 text-sm'>
                              <div className='flex justify-between'>
                                <span className='text-gray-400'>Plano:</span>
                                <span className='text-white'>
                                  {surgery.insurancePlan}
                                </span>
                              </div>
                              {surgery.procedureCodes && (
                                <div>
                                  <span className='text-gray-400 block mb-1'>
                                    Códigos:
                                  </span>
                                  <div className='flex flex-wrap gap-1'>
                                    {surgery.procedureCodes
                                      .split(',')
                                      .map((code, idx) => (
                                        <span
                                          key={idx}
                                          className='px-2 py-1 bg-blue-900/20 text-blue-300 rounded text-xs'
                                        >
                                          {code.trim()}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
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
      {showForm && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl mx-4 border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-semibold text-white'>
                {editingSurgery ? 'Editar Cirurgia' : 'Nova Cirurgia'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className='text-gray-400 hover:text-white transition-colors duration-200'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Informações básicas */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Nome do Paciente *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.patientName}
                    onChange={e =>
                      setFormData({ ...formData, patientName: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                    placeholder='Nome completo do paciente'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Tipo de Cirurgia *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.surgeryType}
                    onChange={e =>
                      setFormData({ ...formData, surgeryType: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                    placeholder='Ex: Hemorroidectomia, Fistulotomia...'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Hospital *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.hospital}
                    onChange={e =>
                      setFormData({ ...formData, hospital: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                    placeholder='Nome do hospital onde será realizada a cirurgia'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Data *
                  </label>
                  <BrazilianDatePicker
                    value={formData.date}
                    onChange={value =>
                      setFormData({ ...formData, date: value })
                    }
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                    placeholder='DD/MM/AAAA'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Horário *
                  </label>
                  <TimePicker
                    value={formData.time}
                    onChange={value =>
                      setFormData({ ...formData, time: value })
                    }
                    className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                    placeholder='HH:MM'
                  />
                </div>
              </div>

              {/* Tipo de pagamento */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Tipo de Pagamento *
                </label>
                <div className='flex space-x-4'>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      value='particular'
                      checked={formData.paymentType === 'particular'}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          paymentType: e.target.value as 'particular' | 'plano',
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-gray-300'>Particular</span>
                  </label>
                  <label className='flex items-center'>
                    <input
                      type='radio'
                      value='plano'
                      checked={formData.paymentType === 'plano'}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          paymentType: e.target.value as 'particular' | 'plano',
                        })
                      }
                      className='mr-2'
                    />
                    <span className='text-gray-300'>Plano de Saúde</span>
                  </label>
                </div>
              </div>

              {/* Campos específicos para particular */}
              {formData.paymentType === 'particular' && (
                <div className='space-y-4'>
                  <h4 className='text-lg font-medium text-white'>
                    Divisão Financeira
                  </h4>

                  {/* Valor Total - Campo separado */}
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                      Valor Total Pago
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      value={formData.totalValue}
                      onChange={e =>
                        setFormData({ ...formData, totalValue: e.target.value })
                      }
                      className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                      placeholder='0,00'
                    />
                  </div>

                  {/* Grid simétrico 2x3 para os 5 campos restantes */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Primeira linha - 2 campos */}
                    <div>
                      <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Valor para o Hospital
                      </label>
                      <input
                        type='number'
                        step='0.01'
                        value={formData.hospitalValue}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            hospitalValue: e.target.value,
                          })
                        }
                        className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                        placeholder='0,00'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Valor para o Anestesista
                      </label>
                      <input
                        type='number'
                        step='0.01'
                        value={formData.anesthesiologistValue}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            anesthesiologistValue: e.target.value,
                          })
                        }
                        className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                        placeholder='0,00'
                      />
                    </div>

                    {/* Segunda linha - 2 campos */}
                    <div>
                      <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Valor para a Instrumentadora
                      </label>
                      <input
                        type='number'
                        step='0.01'
                        value={formData.instrumentalistValue}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            instrumentalistValue: e.target.value,
                          })
                        }
                        className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                        placeholder='0,00'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Valor para o Auxiliar
                      </label>
                      <input
                        type='number'
                        step='0.01'
                        value={formData.auxiliaryValue}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            auxiliaryValue: e.target.value,
                          })
                        }
                        className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                        placeholder='0,00'
                      />
                    </div>

                    {/* Terceira linha - 1 campo centralizado */}
                    <div className='md:col-span-2 flex justify-center'>
                      <div className='w-full md:w-1/2'>
                        <label className='block text-sm font-medium text-gray-300 mb-2'>
                          Valor para o Médico
                        </label>
                        <input
                          type='number'
                          step='0.01'
                          value={formData.doctorValue}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              doctorValue: e.target.value,
                            })
                          }
                          className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                          placeholder='0,00'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Campos específicos para plano */}
              {formData.paymentType === 'plano' && (
                <div className='space-y-4'>
                  <h4 className='text-lg font-medium text-white'>
                    Informações do Plano
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Plano de Saúde
                      </label>
                      <select
                        value={formData.insurancePlan}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            insurancePlan: e.target.value,
                          })
                        }
                        className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm appearance-none'
                      >
                        <option value=''>Selecione o plano</option>
                        <option value='UNIMED'>UNIMED</option>
                        <option value='Bradesco Saúde'>Bradesco Saúde</option>
                        <option value='SulAmérica'>SulAmérica</option>
                        <option value='Amil'>Amil</option>
                        <option value='Outro'>Outro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-2'>
                      Códigos dos Procedimentos
                    </label>
                    <input
                      type='text'
                      value={formData.procedureCodes}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          procedureCodes: e.target.value,
                        })
                      }
                      className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                      placeholder='Ex: 31101012, 31101020 (separados por vírgula)'
                    />
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
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className='w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm'
                  placeholder='Observações adicionais sobre a cirurgia...'
                />
              </div>

              {/* Botões */}
              <div className='flex justify-end space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className='px-6 py-3 text-gray-300 hover:text-white transition-colors duration-200'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-6 py-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 backdrop-blur-sm'
                >
                  {editingSurgery ? 'Atualizar' : 'Salvar'} Cirurgia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
