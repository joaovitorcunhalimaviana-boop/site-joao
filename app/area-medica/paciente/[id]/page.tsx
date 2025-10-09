'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Calendar,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  Edit,
} from 'lucide-react'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  birthDate: string
  address: string
  medicalHistory: string
  allergies: string
  medications: string
  emergencyContact: string
  emergencyPhone: string
  createdAt: string
}

interface MedicalRecord {
  id: string
  patientId: string
  date: string
  symptoms: string
  diagnosis: string
  treatment: string
  prescription: string
  observations: string
  doctorName: string
  status: 'pending' | 'completed'
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params['id']) {
      loadPatientData(params['id'] as string)
    }
  }, [params['id']])

  const loadPatientData = async (patientId: string) => {
    try {
      setLoading(true)

      // Simulated patient data
      const mockPatient: Patient = {
        id: patientId,
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-9999',
        birthDate: '1985-03-15',
        address: 'Rua das Flores, 123 - São Paulo, SP',
        medicalHistory: 'Histórico de hipertensão arterial',
        allergies: 'Penicilina',
        medications: 'Losartana 50mg - 1x ao dia',
        emergencyContact: 'Maria Silva',
        emergencyPhone: '(11) 88888-8888',
        createdAt: '2024-01-15T10:00:00Z',
      }

      const mockRecords: MedicalRecord[] = [
        {
          id: '1',
          patientId: patientId,
          date: '2024-01-20T14:30:00Z',
          symptoms: 'Dor de cabeça persistente',
          diagnosis: 'Cefaleia tensional',
          treatment: 'Repouso e analgésicos',
          prescription: 'Paracetamol 500mg - 8/8h por 3 dias',
          observations: 'Paciente relatou melhora após 2 dias',
          doctorName: 'Dr. Carlos Santos',
          status: 'completed',
        },
      ]

      setPatient(mockPatient)
      setEditedPatient(mockPatient)
      setMedicalRecords(mockRecords)
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editedPatient) return

    try {
      // Here you would save to your backend
      setPatient(editedPatient)
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao salvar paciente:', error)
    }
  }

  const handleCancel = () => {
    setEditedPatient(patient)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
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

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center'>
        <div className='text-white text-lg'>Carregando...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center'>
        <div className='text-white text-lg'>Paciente não encontrado</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.back()}
              className='text-white hover:bg-white/10'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Button>
            <h1 className='text-2xl font-bold text-white'>
              Detalhes do Paciente
            </h1>
          </div>

          <div className='flex gap-2'>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                <Edit className='h-4 w-4 mr-2' />
                Editar
              </Button>
            ) : (
              <div className='flex gap-2'>
                <Button
                  onClick={handleSave}
                  className='bg-green-600 hover:bg-green-700 text-white'
                >
                  <Save className='h-4 w-4 mr-2' />
                  Salvar
                </Button>
                <Button
                  onClick={handleCancel}
                  variant='outline'
                  className='border-white/20 text-white hover:bg-white/10'
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Patient Information */}
          <div className='lg:col-span-2'>
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-white/80'>Nome Completo</Label>
                    {isEditing ? (
                      <Input
                        value={editedPatient?.name || ''}
                        onChange={e =>
                          setEditedPatient(prev =>
                            prev ? { ...prev, name: e.target.value } : null
                          )
                        }
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/50'
                      />
                    ) : (
                      <p className='text-white font-medium'>{patient.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className='text-white/80'>Data de Nascimento</Label>
                    {isEditing ? (
                      <Input
                        type='date'
                        value={editedPatient?.birthDate || ''}
                        onChange={e =>
                          setEditedPatient(prev =>
                            prev ? { ...prev, birthDate: e.target.value } : null
                          )
                        }
                        className='bg-white/10 border-white/20 text-white'
                      />
                    ) : (
                      <p className='text-white font-medium'>
                        {formatDate(patient.birthDate)} (
                        {calculateAge(patient.birthDate)} anos)
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className='text-white/80'>Email</Label>
                    {isEditing ? (
                      <Input
                        type='email'
                        value={editedPatient?.email || ''}
                        onChange={e =>
                          setEditedPatient(prev =>
                            prev ? { ...prev, email: e.target.value } : null
                          )
                        }
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/50'
                      />
                    ) : (
                      <p className='text-white font-medium flex items-center gap-2'>
                        <Mail className='h-4 w-4' />
                        {patient.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className='text-white/80'>Telefone</Label>
                    {isEditing ? (
                      <Input
                        value={editedPatient?.phone || ''}
                        onChange={e =>
                          setEditedPatient(prev =>
                            prev ? { ...prev, phone: e.target.value } : null
                          )
                        }
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/50'
                      />
                    ) : (
                      <p className='text-white font-medium flex items-center gap-2'>
                        <Phone className='h-4 w-4' />
                        {patient.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className='text-white/80'>Endereço</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedPatient?.address || ''}
                      onChange={e =>
                        setEditedPatient(prev =>
                          prev ? { ...prev, address: e.target.value } : null
                        )
                      }
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/50'
                      rows={2}
                    />
                  ) : (
                    <p className='text-white font-medium flex items-start gap-2'>
                      <MapPin className='h-4 w-4 mt-1' />
                      {patient.address}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card className='bg-white/10 backdrop-blur-sm border-white/20 mt-6'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Histórico Médico
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label className='text-white/80'>Histórico Médico</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedPatient?.medicalHistory || ''}
                      onChange={e =>
                        setEditedPatient(prev =>
                          prev
                            ? { ...prev, medicalHistory: e.target.value }
                            : null
                        )
                      }
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/50'
                      rows={3}
                    />
                  ) : (
                    <p className='text-white font-medium'>
                      {patient.medicalHistory}
                    </p>
                  )}
                </div>

                <div>
                  <Label className='text-white/80'>Alergias</Label>
                  {isEditing ? (
                    <Input
                      value={editedPatient?.allergies || ''}
                      onChange={e =>
                        setEditedPatient(prev =>
                          prev ? { ...prev, allergies: e.target.value } : null
                        )
                      }
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/50'
                    />
                  ) : (
                    <p className='text-white font-medium'>
                      {patient.allergies}
                    </p>
                  )}
                </div>

                <div>
                  <Label className='text-white/80'>Medicações Atuais</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedPatient?.medications || ''}
                      onChange={e =>
                        setEditedPatient(prev =>
                          prev ? { ...prev, medications: e.target.value } : null
                        )
                      }
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/50'
                      rows={2}
                    />
                  ) : (
                    <p className='text-white font-medium'>
                      {patient.medications}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Emergency Contact */}
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white text-lg'>
                  Contato de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div>
                    <Label className='text-white/80 text-sm'>Nome</Label>
                    {isEditing ? (
                      <Input
                        value={editedPatient?.emergencyContact || ''}
                        onChange={e =>
                          setEditedPatient(prev =>
                            prev
                              ? { ...prev, emergencyContact: e.target.value }
                              : null
                          )
                        }
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/50'
                      />
                    ) : (
                      <p className='text-white font-medium'>
                        {patient.emergencyContact}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className='text-white/80 text-sm'>Telefone</Label>
                    {isEditing ? (
                      <Input
                        value={editedPatient?.emergencyPhone || ''}
                        onChange={e =>
                          setEditedPatient(prev =>
                            prev
                              ? { ...prev, emergencyPhone: e.target.value }
                              : null
                          )
                        }
                        className='bg-white/10 border-white/20 text-white placeholder:text-white/50'
                      />
                    ) : (
                      <p className='text-white font-medium'>
                        {patient.emergencyPhone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Stats */}
            <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
              <CardHeader>
                <CardTitle className='text-white text-lg'>
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-white/80 text-sm'>
                      Cadastrado em:
                    </span>
                    <span className='text-white font-medium text-sm'>
                      {formatDate(patient.createdAt)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-white/80 text-sm'>
                      Total de consultas:
                    </span>
                    <Badge className='bg-blue-600 text-white'>
                      {medicalRecords.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medical Records */}
        <Card className='bg-white/10 backdrop-blur-sm border-white/20 mt-6'>
          <CardHeader>
            <CardTitle className='text-white flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Histórico de Atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medicalRecords.length === 0 ? (
              <p className='text-white/60 text-center py-8'>
                Nenhum atendimento registrado
              </p>
            ) : (
              <div className='space-y-4'>
                {medicalRecords.map(record => (
                  <div
                    key={record.id}
                    className='bg-white/5 rounded-lg p-4 border border-white/10'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div>
                        <p className='text-white font-medium'>
                          {formatDateTime(record.date)}
                        </p>
                        <p className='text-white/60 text-sm'>
                          Dr. {record.doctorName}
                        </p>
                      </div>
                      <Badge
                        className={
                          record.status === 'completed'
                            ? 'bg-green-600 text-white'
                            : 'bg-yellow-600 text-white'
                        }
                      >
                        {record.status === 'completed'
                          ? 'Concluído'
                          : 'Pendente'}
                      </Badge>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                      {record.symptoms && (
                        <div>
                          <p className='text-white font-medium mb-1'>
                            Sintomas:
                          </p>
                          <p className='text-gray-300'>{record.symptoms}</p>
                        </div>
                      )}

                      {record.diagnosis && (
                        <div>
                          <p className='text-white font-medium mb-1'>
                            Diagnóstico:
                          </p>
                          <p className='text-gray-300'>{record.diagnosis}</p>
                        </div>
                      )}

                      {record.treatment && (
                        <div>
                          <p className='text-white font-medium mb-1'>
                            Tratamento:
                          </p>
                          <p className='text-gray-300'>{record.treatment}</p>
                        </div>
                      )}

                      {record.prescription && (
                        <div>
                          <p className='text-white font-medium mb-1'>
                            Prescrição:
                          </p>
                          <p className='text-gray-300 whitespace-pre-line'>
                            {record.prescription}
                          </p>
                        </div>
                      )}

                      {record.observations && (
                        <div className='md:col-span-2'>
                          <p className='text-white font-medium mb-1'>
                            Observações:
                          </p>
                          <p className='text-gray-300 whitespace-pre-line'>
                            {record.observations}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
