'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Header from '../../../components/ui/header'
import Footer from '../../../components/ui/footer'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import { BrazilianDateInput } from '../../../components/ui/brazilian-date-input'
import { validateCPF } from '@/lib/validation-schemas'

interface PatientData {
  name: string
  cpf: string
  email: string
  birthDate: string
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
  }
  phone: string
  whatsapp: string
}

export default function NovoPackiente() {
  const router = useRouter()
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    cpf: '',
    email: '',
    birthDate: '',
    insurance: {
      type: 'particular',
      plan: '',
    },
    phone: '',
    whatsapp: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [cpfError, setCpfError] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Formatação automática para CPF (apenas números)
    if (name === 'cpf') {
      const formatted = value.replace(/\D/g, '').substring(0, 11)
      setFormData(prev => ({ ...prev, [name]: formatted }))
      
      // Validar CPF em tempo real
      if (formatted.length === 11) {
        if (!validateCPF(formatted)) {
          setCpfError('CPF inválido')
        } else {
          setCpfError('')
          // Verificar duplicatas
          checkForDuplicates(formatted)
        }
      } else {
        setCpfError('')
        setDuplicateWarning('')
      }
    }
    // Formatação automática para telefone e WhatsApp
    else if (name === 'phone' || name === 'whatsapp') {
      const formatted = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15)
      setFormData(prev => ({ ...prev, [name]: formatted }))
    } else if (name === 'insuranceType') {
      setFormData(prev => ({
        ...prev,
        insurance: {
          ...prev.insurance,
          type: value as 'particular' | 'unimed' | 'outro',
        },
      }))
    } else if (name === 'insurancePlan') {
      setFormData(prev => ({
        ...prev,
        insurance: { ...prev.insurance, plan: value },
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const checkForDuplicates = async (cpf: string) => {
    try {
      const response = await fetch(`/api/patients/duplicate-check?cpf=${cpf}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.result?.isDuplicate) {
          setDuplicateWarning(`Atenção: Já existe um paciente cadastrado com este CPF (${result.result.existingPatient?.name})`)
        } else {
          setDuplicateWarning('')
        }
      }
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações antes do envio
    if (!validateCPF(formData.cpf)) {
      alert('Por favor, insira um CPF válido')
      return
    }
    
    if (duplicateWarning) {
      const confirmDuplicate = confirm(`${duplicateWarning}\n\nDeseja continuar mesmo assim?`)
      if (!confirmDuplicate) {
        return
      }
    }
    
    setIsLoading(true)

    try {
      // Usar a API unificada que já cria o contato de comunicação e o paciente médico
      const response = await fetch('/api/unified-appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-patient',
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp || formData.phone,
          email: formData.email,
          birthDate: formData.birthDate,
          cpf: formData.cpf,
          insurance: formData.insurance,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.patient) {
          alert('Paciente cadastrado com sucesso!')
          router.push('/area-medica')
        } else {
          alert(result.message || 'Erro ao cadastrar paciente')
        }
      } else {
        const error = await response.json()
        alert(error.message || 'Erro ao cadastrar paciente')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao cadastrar paciente')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-black'>
      <Header currentPage='novo-paciente' />
      <main className='py-8 pt-24'>
        <div className='max-w-2xl mx-auto px-4'>
          <div className='mb-6 flex justify-between items-center'>
            <h1 className='text-2xl font-bold text-white'>Novo Paciente</h1>
            <MedicalAreaMenu currentPage='novo-paciente' />
          </div>

          <Card className='bg-gray-900 border-gray-700'>
            <CardHeader>
              <CardTitle className='text-white'>
                Cadastro de Novo Paciente
              </CardTitle>
              <CardDescription className='text-gray-300'>
                Preencha os dados do paciente para cadastro no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-gray-300'>
                    Nome Completo *
                  </Label>
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder='Digite o nome completo do paciente'
                    className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='cpf' className='text-gray-300'>
                    CPF *
                  </Label>
                  <Input
                    id='cpf'
                    name='cpf'
                    type='text'
                    value={formData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                    onChange={handleInputChange}
                    required
                    maxLength={14}
                    placeholder='000.000.000-00'
                    className={`bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 ${
                      cpfError ? 'border-red-500' : duplicateWarning ? 'border-yellow-500' : ''
                    }`}
                  />
                  {cpfError && (
                    <p className='text-red-400 text-sm'>{cpfError}</p>
                  )}
                  {duplicateWarning && (
                    <p className='text-yellow-400 text-sm'>{duplicateWarning}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email' className='text-gray-300'>
                    E-mail *
                  </Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder='exemplo@email.com'
                    className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='birthDate' className='text-gray-300'>
                    Data de Nascimento *
                  </Label>
                  <BrazilianDateInput
                    value={formData.birthDate}
                    onChange={value =>
                      setFormData(prev => ({ ...prev, birthDate: value }))
                    }
                    className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                    placeholder='dd/mm/aaaa'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='insuranceType' className='text-gray-300'>
                    Tipo de Plano
                  </Label>
                  <select
                    id='insuranceType'
                    name='insuranceType'
                    value={formData.insurance.type}
                    onChange={handleInputChange}
                    className='flex h-10 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value='particular'>Particular</option>
                    <option value='unimed'>Unimed</option>
                    <option value='outro'>Outro</option>
                  </select>
                </div>

                {formData.insurance.type === 'unimed' && (
                  <div className='space-y-2'>
                    <Label htmlFor='insurancePlan'>Nome do Plano</Label>
                    <Input
                      id='insurancePlan'
                      name='insurancePlan'
                      type='text'
                      value={formData.insurance.plan || ''}
                      onChange={handleInputChange}
                      placeholder='Nome do plano de saúde'
                    />
                  </div>
                )}

                <div className='space-y-2'>
                  <Label htmlFor='phone' className='text-gray-300'>
                    Telefone *
                  </Label>
                  <Input
                    id='phone'
                    name='phone'
                    type='text'
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder='(00) 00000-0000'
                    className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='whatsapp' className='text-gray-300'>
                    WhatsApp
                  </Label>
                  <Input
                    id='whatsapp'
                    name='whatsapp'
                    type='text'
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder='(00) 00000-0000'
                    className='bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div className='flex gap-4 pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => router.back()}
                    className='flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'
                  >
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='flex-1 bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    {isLoading ? 'Cadastrando...' : 'Cadastrar Paciente'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
