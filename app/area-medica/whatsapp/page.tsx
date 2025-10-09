'use client'

import { useState, useEffect } from 'react'
import Header from '../../../components/ui/header'
import BackgroundPattern from '../../../components/ui/background-pattern'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  UserIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  cpf: string
  medicalRecordNumber: number
  phone: string
  whatsapp: string
  email?: string
  birthDate?: string
  insuranceType: 'unimed' | 'particular' | 'outro'
  insurancePlan?: string
  createdAt: string
  updatedAt: string
  whatsappPreferences?: {
    appointments: boolean
    reminders: boolean
    promotions: boolean
    subscribed: boolean
    subscribedAt?: string
  }
}

export default function WhatsAppPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [ageFilter, setAgeFilter] = useState('')
  const [whatsappOnly, setWhatsappOnly] = useState(true)
  const [loading, setLoading] = useState(true)
  const [broadcastList, setBroadcastList] = useState('')

  // Carregar pacientes
  useEffect(() => {
    const loadPatients = async () => {
      try {
        console.log('🚀 Iniciando carregamento de todos os contatos para WhatsApp...')
        const response = await fetch('/api/unified-system/communication')
        console.log('📡 Response status:', response.status)
        
        const data = await response.json()
        console.log('🔍 WhatsApp Debug - Dados da API:', data)
        
        if (data.success && data.contacts) {
          console.log('📊 Total de contatos recebidos:', data.contacts.length)
          
          // Mostrar TODOS os contatos cadastrados no sistema
          // Não filtrar por WhatsApp - mostrar todos para que o usuário possa ver todos os contatos
          const allContacts = data.contacts.map((c: Patient) => ({
            ...c,
            // Se não tem WhatsApp, marcar como "Não informado" para exibição
            displayWhatsApp: c.whatsapp && c.whatsapp.trim() !== '' ? c.whatsapp : 'Não informado'
          }))
          
          console.log('✅ Todos os contatos carregados:', allContacts.length)
          console.log('📋 Lista completa de contatos:', allContacts)
          
          setPatients(allContacts)
          setFilteredPatients(allContacts)
        } else {
          console.error('❌ Erro na estrutura da resposta:', data)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar contatos:', error)
      } finally {
        console.log('🏁 Finalizando carregamento...')
        setLoading(false)
      }
    }

    loadPatients()
  }, [])

  // Filtrar pacientes
  useEffect(() => {
    let filtered = patients

    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (ageFilter) {
      filtered = filtered.filter(patient => {
        if (!patient.birthDate) return false
        
        const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
        
        switch (ageFilter) {
          case '0-40':
            return age >= 0 && age < 40
          case '40-45':
            return age >= 40 && age < 45
          case '45-60':
            return age >= 45 && age < 60
          case '60+':
            return age >= 60
          default:
            return true
        }
      })
    }

    if (whatsappOnly) {
      filtered = filtered.filter(patient => patient.whatsapp)
    }

    setFilteredPatients(filtered)
  }, [patients, searchTerm, ageFilter, whatsappOnly])

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    )
  }

  const selectAllPatients = () => {
    setSelectedPatients(filteredPatients.map(p => p.id))
  }

  const clearSelection = () => {
    setSelectedPatients([])
  }

  const generateBroadcastList = () => {
    const selectedPatientsData = patients.filter(p => selectedPatients.includes(p.id))
    const numbers = selectedPatientsData
      .map(p => p.whatsapp)
      .filter(whatsapp => whatsapp)
      .map(whatsapp => whatsapp.replace(/\D/g, ''))
      .map(whatsapp => whatsapp.startsWith('55') ? whatsapp : `55${whatsapp}`)
      .join('\n')
    
    setBroadcastList(numbers)
    return numbers
  }

  const copyBroadcastList = async () => {
    const list = generateBroadcastList()
    try {
      await navigator.clipboard.writeText(list)
      alert('Lista copiada para a área de transferência!')
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const openWhatsAppWeb = () => {
    window.open('https://web.whatsapp.com', '_blank')
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4'></div>
          <p className='text-gray-300'>Carregando pacientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <Header currentPage='area-medica' />

      <div className='relative isolate'>
        {/* Header */}
        <div className='pt-32 pb-8'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700'>
                  <ChatBubbleLeftRightIcon className='w-8 h-8 text-green-400' />
                </div>
                <div>
                  <h1 className='text-4xl font-bold text-white'>Sistema de WhatsApp</h1>
                  <p className='text-gray-300 text-lg mt-2'>
                    Gerencie listas de pacientes para broadcast no WhatsApp
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3 relative z-10'>
                <MedicalAreaMenu currentPage='whatsapp' />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='mx-auto max-w-7xl px-6 lg:px-8 pb-12'>
          <div className='space-y-6'>
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <UserIcon className="h-8 w-8 text-green-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">Total de Pacientes</p>
                      <p className="text-2xl font-bold text-white">{patients.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <PhoneIcon className="h-8 w-8 text-green-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">Com WhatsApp</p>
                      <p className="text-2xl font-bold text-white">
                        {patients.filter(p => p.whatsapp).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckIcon className="h-8 w-8 text-green-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">Selecionados</p>
                      <p className="text-2xl font-bold text-white">{selectedPatients.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ClipboardDocumentIcon className="h-8 w-8 text-green-400" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-300">Lista Broadcast</p>
                      <p className="text-2xl font-bold text-white">
                        {broadcastList.split('\n').filter(n => n.trim()).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="patients" className="space-y-4">
              <TabsList className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
                <TabsTrigger value="patients" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                  Pacientes
                </TabsTrigger>
                <TabsTrigger value="broadcast" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                  Lista de Broadcast
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patients" className="space-y-4">
                {/* Filtros */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Filtros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Buscar por nome
                        </label>
                        <Input
                          placeholder="Digite o nome do paciente..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                        />
                      </div>
                      <div>
                         <label className="text-sm font-medium text-gray-300 mb-2 block">
                           Filtrar por idade
                         </label>
                         <select
                           value={ageFilter}
                           onChange={(e) => setAgeFilter(e.target.value)}
                           className="age-filter w-full px-3 py-2 bg-blue-900/30 backdrop-blur-sm border border-blue-500/50 rounded-md text-white focus:bg-blue-900/40 focus:border-blue-400 transition-colors"
                         >
                           <option value="">Todas as idades</option>
                           <option value="0-40">0-40 anos</option>
                           <option value="40-45">40-45 anos</option>
                           <option value="45-60">45-60 anos</option>
                           <option value="60+">Mais de 60 anos</option>
                         </select>
                       </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Apenas com WhatsApp
                        </label>
                        <div className="flex items-center space-x-2 pt-2">
                          <input
                            type="checkbox"
                            id="whatsappOnly"
                            checked={whatsappOnly}
                            onChange={(e) => setWhatsappOnly(e.target.checked)}
                            className="rounded border-gray-600 bg-gray-800"
                          />
                          <label htmlFor="whatsappOnly" className="text-sm text-gray-300">
                            Mostrar apenas pacientes com WhatsApp
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={selectAllPatients}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Selecionar Todos ({filteredPatients.length})
                      </Button>
                      <Button
                        onClick={clearSelection}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Limpar Seleção
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Pacientes */}
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Pacientes ({filteredPatients.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredPatients.length === 0 ? (
                        <div className="text-center py-8">
                          <UserIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg">Nenhum paciente encontrado</p>
                          <p className="text-gray-500 text-sm mt-2">
                            Verifique se há pacientes cadastrados com WhatsApp ativo
                          </p>
                        </div>
                      ) : (
                        filteredPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedPatients.includes(patient.id)
                                ? 'bg-blue-900/30 border-blue-500'
                                : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                            }`}
                            onClick={() => togglePatientSelection(patient.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">{patient.name}</p>
                                  <p className="text-sm text-gray-400">
                                    {patient.birthDate ? `${new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} anos` : 'Idade não informada'} • {patient.email || 'Email não informado'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={patient.whatsapp && patient.whatsapp.trim() !== '' ? "secondary" : "outline"} 
                                  className={patient.whatsapp && patient.whatsapp.trim() !== '' 
                                    ? "bg-green-900/30 text-green-400 border-green-700" 
                                    : "bg-gray-900/30 text-gray-400 border-gray-600"
                                  }
                                >
                                  <PhoneIcon className="h-3 w-3 mr-1" />
                                  {patient.whatsapp && patient.whatsapp.trim() !== '' ? patient.whatsapp : 'Não informado'}
                                </Badge>
                                {selectedPatients.includes(patient.id) && (
                                  <CheckIcon className="h-5 w-5 text-blue-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="broadcast" className="space-y-4">
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Lista de Broadcast do WhatsApp</CardTitle>
                    <p className="text-gray-300 text-sm mt-2">
                      <strong>O que é uma Lista de Broadcast?</strong><br />
                      Uma lista de broadcast permite enviar a mesma mensagem para vários contatos de uma só vez, 
                      mas cada pessoa recebe a mensagem individualmente (como se fosse uma conversa privada). 
                      É ideal para enviar lembretes de consultas, comunicados importantes ou campanhas de saúde 
                      para grupos específicos de pacientes.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={generateBroadcastList}
                        disabled={selectedPatients.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                        Gerar Lista ({selectedPatients.length} pacientes)
                      </Button>
                      <Button
                        onClick={copyBroadcastList}
                        disabled={!broadcastList}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Copiar Lista
                      </Button>
                      <Button
                        onClick={openWhatsAppWeb}
                        disabled={selectedPatients.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Abrir WhatsApp Web
                      </Button>
                    </div>

                    {broadcastList && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Lista gerada ({broadcastList.split('\n').filter(n => n.trim()).length} números):
                        </label>
                        <textarea
                          value={broadcastList}
                          readOnly
                          className="w-full h-32 p-3 bg-gray-800/50 border border-gray-600 rounded-md text-white font-mono text-sm resize-none"
                          placeholder="A lista de números aparecerá aqui..."
                        />
                        <p className="text-xs text-gray-400">
                          💡 <strong>Como usar:</strong> Copie esta lista, abra o WhatsApp Web, 
                          vá em "Nova conversa" → "Nova lista de transmissão", cole os números e crie sua lista.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}