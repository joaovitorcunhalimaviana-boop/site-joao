'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/ui/header'
import BackgroundPattern from '../../../components/ui/background-pattern'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Edit2, Save, X, Phone, Mail, User, Calendar, Shield, Users } from 'lucide-react'

interface Patient {
  id: string
  name: string
  email?: string
  phone: string
  whatsapp: string
  birthDate: string
  cpf?: string
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
  }
  status?: 'aguardando' | 'atendido' | 'cancelado'
  createdAt: string
  updatedAt: string
}

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPatient, setEditingPatient] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Patient>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (searchTerm) {
        const filtered = patients.filter(patient =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm) ||
          (patient.cpf && patient.cpf.includes(searchTerm)) ||
          (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        setFilteredPatients(filtered)
      } else {
        setFilteredPatients(patients)
      }
  }, [searchTerm, patients])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/unified-system/medical-patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients || [])
        setFilteredPatients(data.patients || [])
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (patient: Patient) => {
    setEditingPatient(patient.id)
    setEditForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      whatsapp: patient.whatsapp,
      insurance: patient.insurance,
    })
  }

  const cancelEditing = () => {
    setEditingPatient(null)
    setEditForm({})
  }

  const savePatient = async (patientId: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/unified-system/medical-patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        await fetchPatients()
        setEditingPatient(null)
        setEditForm({})
      } else {
        alert('Erro ao salvar alterações')
      }
    } catch (error) {
      console.error('Erro ao salvar paciente:', error)
      alert('Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header currentPage='area-medica' />
        <BackgroundPattern />
        <div className="relative z-10 pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Carregando pacientes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header currentPage='area-medica' />
      <BackgroundPattern />

      <div className="relative z-10 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <Users className="h-8 w-8 mr-3 text-blue-400" />
                  Lista de Pacientes
                </h1>
                <p className="text-gray-400 mt-1">
                  Gerencie e edite as informações dos seus pacientes
                </p>
              </div>
            </div>
            <MedicalAreaMenu currentPage='pacientes' />
          </div>

        {/* Search */}
        <Card className="mb-6 bg-gray-900/50 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por nome, CPF, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-900/20 rounded-xl">
                  <User className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total de Pacientes</p>
                  <p className="text-3xl font-bold text-white">{patients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-900/20 rounded-xl">
                  <Shield className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Particular</p>
                  <p className="text-2xl font-bold text-white">
                    {patients.filter(p => p.insurance.type === 'particular').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-900/20 rounded-xl">
                  <Calendar className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Com Convênio</p>
                  <p className="text-2xl font-bold text-white">
                    {patients.filter(p => p.insurance.type !== 'particular').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{patient.name}</CardTitle>
                      <p className="text-gray-300">Telefone: {formatPhone(patient.phone)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={patient.insurance.type === 'particular' ? 'secondary' : 'default'}>
                      {patient.insurance.type === 'particular' ? 'Particular' : patient.insurance.plan || patient.insurance.type}
                    </Badge>
                    {editingPatient === patient.id ? (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => savePatient(patient.id)}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditing}
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => startEditing(patient)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingPatient === patient.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-blue-200">Nome</Label>
                      <Input
                        id="name"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-white/20 border-white/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-blue-200">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="bg-white/20 border-white/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-blue-200">Telefone</Label>
                      <Input
                        id="phone"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="bg-white/20 border-white/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp" className="text-blue-200">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={editForm.whatsapp || ''}
                        onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                        className="bg-white/20 border-white/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="insurancePlan" className="text-blue-200">Plano de Saúde</Label>
                      <Input
                        id="insurancePlan"
                        value={editForm.insurance?.plan || ''}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          insurance: { 
                            type: editForm.insurance?.type || 'particular',
                            plan: e.target.value 
                          } 
                        })}
                        className="bg-white/20 border-white/30 text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">{patient.email || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-green-400" />
                      <span className="text-white text-sm">{formatPhone(patient.phone)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-green-400" />
                      <span className="text-white text-sm">WhatsApp: {formatPhone(patient.whatsapp)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <span className="text-white text-sm">{formatDate(patient.birthDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">{patient.insurance.plan || patient.insurance.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">
                        Cadastrado em {formatDate(patient.createdAt)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700">
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum paciente encontrado
              </h3>
              <p className="text-gray-300">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca ou limpar o filtro.'
                  : 'Ainda não há pacientes cadastrados no sistema.'
                }
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  )
}
