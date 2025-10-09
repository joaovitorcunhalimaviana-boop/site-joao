'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatDateToBrazilian } from '@/lib/date-utils'
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  ArrowLeft,
} from 'lucide-react'
import BrazilianDatePicker from '@/components/ui/brazilian-date-picker'
import { isoDateToBrazilian } from '@/lib/date-utils'

interface AgendaItem {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  type: 'appointment' | 'manual'
  notes?: string
  createdAt: string
  updatedAt?: string
}

interface Patient {
  id: string
  name: string
  phone: string
  whatsapp: string
  email: string
  insurance: {
    type: string
    plan?: string
  }
}

export default function AgendaPage() {
  const router = useRouter()
  const [agenda, setAgenda] = useState<AgendaItem[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedDate, setSelectedDate] = useState(
    formatDateToBrazilian(new Date())
  )
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedTime, setSelectedTime] = useState('08:00')
  const [notes, setNotes] = useState('')

  // Carregar agenda e pacientes
  useEffect(() => {
    loadAgenda()
    loadPatients()
  }, [selectedDate])

  const loadAgenda = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/agenda?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setAgenda(data)
      }
    } catch (error) {
      console.error('Erro ao carregar agenda:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/unified-system/medical-patients')
      if (response.ok) {
        const data = await response.json()
        // A API retorna {patients: [...], total: number}
        setPatients(data.patients || [])
      } else {
        setPatients([])
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
      setPatients([])
    }
  }

  const addToAgenda = async () => {
    if (!selectedPatientId) {
      alert('Selecione um paciente')
      return
    }

    try {
      const response = await fetch('/api/agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatientId,
          date: selectedDate,
          time: selectedTime,
          type: 'manual',
          notes,
        }),
      })

      if (response.ok) {
        setShowAddForm(false)
        setSelectedPatientId('')
        setSelectedTime('08:00')
        setNotes('')
        loadAgenda()
        alert('Paciente adicionado à agenda com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao adicionar paciente à agenda')
      }
    } catch (error) {
      console.error('Erro ao adicionar à agenda:', error)
      alert('Erro ao adicionar paciente à agenda')
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/agenda', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      })

      if (response.ok) {
        loadAgenda()
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const removeFromAgenda = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este agendamento?')) {
      return
    }

    try {
      const response = await fetch(`/api/agenda?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadAgenda()
        alert('Agendamento removido com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao remover agendamento:', error)
      alert('Erro ao remover agendamento')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'accepted':
        return 'Aceito'
      case 'rejected':
        return 'Rejeitado'
      case 'completed':
        return 'Concluído'
      default:
        return status
    }
  }

  // Filtrar pacientes que não estão na agenda de hoje
  const availablePatients = (patients || []).filter(
    patient => !agenda.some(item => item.patientId === patient.id)
  )

  return (
    <div className='min-h-screen bg-black'>
      {/* Gradiente de fundo azul igual à página inicial */}
      <div className='relative isolate'>
        <div
          className='absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80'
          aria-hidden='true'
        >
          <div
            className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-blue-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className='container mx-auto p-6 pt-32'>
          <div className='flex justify-between items-center mb-8'>
            <div className='flex items-center gap-4'>
              <Button
                onClick={() => router.push('/')}
                className='bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-gray-500 backdrop-blur-sm transition-all duration-200 px-4 py-2 rounded-lg'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Voltar
              </Button>
              <div>
                <h1 className='text-4xl sm:text-6xl font-bold text-white'>
                  Agenda Médica
                </h1>
                <p className='text-lg text-gray-400 mt-1'>
                  Gerencie os agendamentos do dia
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className='flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl'
            >
              <Plus className='h-4 w-4' />
              Adicionar Paciente
            </Button>
          </div>

          {/* Seletor de Data */}
          <Card className='mb-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-600/50 shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 text-white'>
                <div className='p-2 bg-blue-600/20 rounded-lg'>
                  <Calendar className='h-5 w-5 text-blue-400' />
                </div>
                Selecionar Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BrazilianDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                className='w-48 bg-gray-800/50 border-gray-600/50 text-white focus:border-blue-500 focus:ring-blue-500/20 rounded-lg'
                placeholder='DD/MM/AAAA'
              />
            </CardContent>
          </Card>

          {/* Formulário para Adicionar Paciente */}
          {showAddForm && (
            <Card className='mb-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-600/50 shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-3 text-white'>
                  <div className='p-2 bg-blue-600/20 rounded-lg'>
                    <Plus className='h-5 w-5 text-blue-400' />
                  </div>
                  Adicionar Paciente à Agenda
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='patient' className='text-gray-300'>
                    Paciente
                  </Label>
                  <select
                    id='patient'
                    value={selectedPatientId}
                    onChange={e => setSelectedPatientId(e.target.value)}
                    className='w-full p-2 border rounded-md bg-gray-800 border-gray-600 text-white'
                  >
                    <option value=''>Selecione um paciente</option>
                    {availablePatients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor='time' className='text-gray-300'>
                    Horário
                  </Label>
                  <Input
                    id='time'
                    type='time'
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    className='bg-gray-800 border-gray-600 text-white'
                    style={{ colorScheme: 'dark' }}
                    lang='pt-BR'
                  />
                </div>
                <div>
                  <Label htmlFor='notes' className='text-gray-300'>
                    Observações
                  </Label>
                  <Input
                    id='notes'
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder='Observações opcionais'
                    className='bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  />
                </div>
                <div className='flex gap-3'>
                  <Button
                    onClick={addToAgenda}
                    disabled={!selectedPatientId}
                    className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-2 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Adicionar à Agenda
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    className='bg-gray-600/50 hover:bg-gray-700/50 text-gray-300 hover:text-white font-medium px-6 py-2 rounded-lg border border-gray-500/30 hover:border-gray-400 transition-all duration-200'
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista da Agenda */}
          <Card className='bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-600/50 shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 text-white'>
                <div className='p-2 bg-purple-600/20 rounded-lg'>
                  <Clock className='h-5 w-5 text-purple-400' />
                </div>
                <div>
                  <h2 className='text-2xl lg:text-3xl font-bold'>
                    Agenda do Dia
                  </h2>
                  <p className='text-lg text-gray-300 font-normal'>
                    {formatDateToBrazilian(selectedDate)}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className='text-lg text-gray-300'>Carregando agenda...</p>
              ) : agenda.length === 0 ? (
                <p className='text-lg text-gray-400'>
                  Nenhum agendamento para esta data.
                </p>
              ) : (
                <div className='space-y-4'>
                  {agenda.map(item => (
                    <div
                      key={item.id}
                      className='bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-600/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-500/30'
                    >
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3 mb-3'>
                            <div className='p-2 bg-blue-600/20 rounded-lg'>
                              <User className='h-5 w-5 text-blue-400' />
                            </div>
                            <div className='flex-1'>
                              <h3 className='font-semibold text-white text-lg'>
                                {item.patientName}
                              </h3>
                              <div className='flex items-center gap-2 mt-1'>
                                <Badge
                                  className={`${getStatusColor(item.status)} font-medium px-3 py-1`}
                                >
                                  {getStatusText(item.status)}
                                </Badge>
                                {item.type === 'appointment' && (
                                  <Badge className='bg-purple-600/20 text-purple-300 border-purple-500/30 font-medium px-3 py-1'>
                                    Agendamento Online
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center gap-4 text-sm text-gray-300 mb-3'>
                            <div className='flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg'>
                              <Clock className='h-4 w-4 text-blue-400' />
                              <span className='font-medium'>{item.time}</span>
                            </div>
                            {item.notes && (
                              <div className='flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg flex-1'>
                                <span className='text-gray-400'>Obs:</span>
                                <span className='text-white'>{item.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='flex gap-3 pt-4 border-t border-gray-600/30'>
                          {item.status === 'pending' && (
                            <>
                              <Button
                                size='sm'
                                onClick={() =>
                                  updateStatus(item.id, 'accepted')
                                }
                                className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2'
                              >
                                <CheckCircle className='h-4 w-4' />
                                Aceitar
                              </Button>
                              <Button
                                size='sm'
                                onClick={() =>
                                  updateStatus(item.id, 'rejected')
                                }
                                className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2'
                              >
                                <XCircle className='h-4 w-4' />
                                Rejeitar
                              </Button>
                            </>
                          )}
                          {item.status === 'accepted' && (
                            <Button
                              size='sm'
                              onClick={() => updateStatus(item.id, 'completed')}
                              className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2'
                            >
                              <CheckCircle className='h-4 w-4' />
                              Concluir
                            </Button>
                          )}
                          <Button
                            size='sm'
                            onClick={() => removeFromAgenda(item.id)}
                            className='bg-gray-600/50 hover:bg-blue-600 text-gray-300 hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-gray-500/30 hover:border-blue-500'
                          >
                            <Trash2 className='h-4 w-4' />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
