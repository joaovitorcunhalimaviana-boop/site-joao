'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Mail, Eye, Send, Save, RefreshCw } from 'lucide-react'

interface NewsletterEditorProps {
  onSend?: (data: {
    subject: string
    content: string
    clinicNews: string
    htmlContent: string
  }) => void
  onSave?: (data: {
    subject: string
    content: string
    clinicNews: string
    htmlContent: string
  }) => void
  initialData?: {
    subject: string
    content: string
    clinicNews: string
    htmlContent: string
  }
  className?: string
}

interface Patient {
  id: string
  name: string
  email: string
}

export default function NewsletterEditor({
  onSend,
  onSave,
  initialData,
  className = '',
}: NewsletterEditorProps) {
  const [formData, setFormData] = useState({
    subject: initialData?.subject || 'Newsletter - Dicas de Saúde da Semana',
    content: initialData?.content || '',
    clinicNews: initialData?.clinicNews || '',
    htmlContent: initialData?.htmlContent || '',
  })

  const [sectionEnabled, setSectionEnabled] = useState({
    healthTips: true,
    clinicNews: false,
  })

  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState('edit')
  const [previewContent, setPreviewContent] = useState('')

  // Template padrão para newsletter
  const defaultTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #000000;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📧 Newsletter Semanal</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #1e3a8a; margin-bottom: 20px;">Olá, {{PATIENT_NAME}}!</h2>
        
        <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">Esperamos que você esteja bem! Esta semana preparamos algumas dicas importantes para sua saúde e bem-estar.</p>
        
        {{HEALTH_TIP_SECTION}}
        
        {{CLINIC_NEWS_SECTION}}
        
        <div style="background-color: #1e3a8a; color: white; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
          <h3 style="margin-top: 0;">Entre em Contato</h3>
          <p style="margin-bottom: 20px;">Fale conosco através dos nossos canais de atendimento</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="text-align: center;">
              <p style="margin: 5px 0; font-weight: bold;">📞 Telefone</p>
              <p style="margin: 0; font-size: 14px;">(83) 3225-1747</p>
            </div>
            <div style="text-align: center;">
              <p style="margin: 5px 0; font-weight: bold;">💬 WhatsApp</p>
              <p style="margin: 0; font-size: 14px;">(83) 9 9122-1599</p>
            </div>
            <div style="text-align: center;">
              <p style="margin: 5px 0; font-weight: bold;">✉️ E-mail</p>
              <p style="margin: 0; font-size: 12px;">joaovitorvianacoloprocto@gmail.com</p>
            </div>
            <div style="text-align: center;">
              <p style="margin: 5px 0; font-weight: bold;">📱 Instagram</p>
              <p style="margin: 0; font-size: 14px;">@drjoaovitorviana</p>
            </div>
          </div>
          
          <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 15px; margin-top: 15px;">
            <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">📍 Localização do Consultório</p>
            <p style="margin: 0; font-size: 13px; line-height: 1.4;">Avenida Rui Barbosa, 484<br>Edifício Arcádia, Sala 101 - Torre<br>João Pessoa - PB</p>
          </div>
        </div>
        
        <p style="text-align: center; color: #4b5563; font-size: 14px; margin-top: 30px;">Obrigado por acompanhar nossas novidades!</p>
      </div>
    </div>
  `

  useEffect(() => {
    loadPatients()
    if (!formData.htmlContent) {
      setFormData(prev => ({ ...prev, htmlContent: defaultTemplate }))
    }
  }, [])

  const loadPatients = async () => {
    try {
      console.log('🚀 Iniciando carregamento de todos os contatos para Newsletter...')
      const response = await fetch('/api/unified-system/communication')
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Newsletter Debug - Dados da API:', data)
        
        // A API retorna um objeto com {contacts: array, total: number}
        const contactsList = data.contacts || data // Fallback para compatibilidade
        
        console.log('📊 Total de contatos recebidos:', contactsList.length)
        
        // Mostrar TODOS os contatos cadastrados no sistema
        // Não filtrar por email - mostrar todos para que o usuário possa ver todos os contatos
        const allContacts = contactsList.map((contact: any) => ({
          ...contact,
          // Se não tem email, marcar como "Não informado" para exibição
          displayEmail: contact.email && contact.email.trim() !== '' ? contact.email : 'Não informado'
        }))
        
        console.log('✅ Todos os contatos carregados:', allContacts.length)
        console.log('📋 Lista completa de contatos:', allContacts)
        
        setPatients(allContacts)
        // Selecionar todos os contatos por padrão
        setSelectedPatients(allContacts.map((c: any) => c.id))
      } else {
        console.error('❌ Erro na resposta da API:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar contatos:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setMessage(null)
  }

  const generatePreview = () => {
    let content = formData.htmlContent
    content = content.replace(
      /{{PATIENT_NAME}}/g,
      '[Nome do Paciente - Exemplo]'
    )

    // Construir seção de dicas de saúde condicionalmente
    const healthTipSection = sectionEnabled.healthTips
      ? `
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1e3a8a;">
        <h3 style="color: #1e3a8a; margin-top: 0;">💡 Dica da Semana</h3>
        <div style="margin: 0; line-height: 1.6; color: #1f2937; text-align: justify;">
          ${formData.content || 'Adicione suas dicas de saúde aqui...'}
        </div>
      </div>
    `
      : ''

    // Construir seção de novidades da clínica condicionalmente
    const clinicNewsSection = sectionEnabled.clinicNews
      ? `
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #3b82f6;">
        <h3 style="color: #1e3a8a; margin-top: 0;">🆕 Novidades da Clínica</h3>
        <div style="margin: 0; line-height: 1.6; color: #1f2937; text-align: justify;">
          ${formData.clinicNews || 'Adicione as novidades da clínica aqui...'}
        </div>
      </div>
    `
      : ''

    content = content.replace(/{{HEALTH_TIP_SECTION}}/g, healthTipSection)
    content = content.replace(/{{CLINIC_NEWS_SECTION}}/g, clinicNewsSection)

    setPreviewContent(content)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      if (onSave) {
        await onSave(formData)
        setMessage({ type: 'success', text: 'Newsletter salva com sucesso!' })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao salvar newsletter. Tente novamente.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Validar campos obrigatórios
      if (!formData.subject.trim()) {
        throw new Error('Assunto é obrigatório')
      }

      if (selectedPatients.length === 0) {
        throw new Error('Selecione pelo menos um paciente')
      }

      // Construir o template HTML
      let htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; margin: 0; font-size: 28px;">Dr. João Vitor Viana</h1>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 16px;">Coloproctologista e Cirurgião Geral</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Olá, {{PATIENT_NAME}}!</h2>
            <p style="color: #475569; line-height: 1.6; margin: 0;">
              Esperamos que você esteja bem! Temos algumas informações importantes para compartilhar com você.
            </p>
          </div>
          
          {{HEALTH_TIP_SECTION}}
          {{CLINIC_NEWS_SECTION}}
          
          <div style="background-color: #1e3a8a; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h3 style="margin-top: 0; color: white;">📞 Precisa agendar uma consulta?</h3>
            <p style="margin: 10px 0; color: #e2e8f0;">Entre em contato conosco:</p>
            <div style="margin: 15px 0;">
              <a href="https://wa.me/5583998663089" style="background-color: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; margin: 5px;">
                💬 WhatsApp
              </a>
              <a href="https://www.joaovitorviana.com.br/agendamento" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; margin: 5px;">
                🗓️ Agendar Online
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Dr. João Vitor Viana - Coloproctologista</p>
            <p>📍 João Pessoa/PB | 📞 (83) 99122-1599</p>
            <p>🌐 <a href="https://www.joaovitorviana.com.br" style="color: #3b82f6;">www.joaovitorviana.com.br</a></p>
          </div>
        </div>
      `

      const healthTipSection = sectionEnabled.healthTips
        ? `
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #10b981;">
          <h3 style="color: #065f46; margin-top: 0;">💡 Dica de Saúde</h3>
          <div style="margin: 0; line-height: 1.6; color: #1f2937; text-align: justify;">
            ${formData.content}
          </div>
        </div>
      `
        : ''

      const clinicNewsSection = sectionEnabled.clinicNews
        ? `
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #3b82f6;">
          <h3 style="color: #1e3a8a; margin-top: 0;">🆕 Novidades da Clínica</h3>
          <div style="margin: 0; line-height: 1.6; color: #1f2937; text-align: justify;">
            ${formData.clinicNews}
          </div>
        </div>
      `
        : ''

      htmlContent = htmlContent.replace(
        /{{HEALTH_TIP_SECTION}}/g,
        healthTipSection
      )
      htmlContent = htmlContent.replace(
        /{{CLINIC_NEWS_SECTION}}/g,
        clinicNewsSection
      )

      // Obter dados dos pacientes selecionados
      const selectedPatientsData = patients.filter(p =>
        selectedPatients.includes(p.id)
      )
      
      // Criar lista de emails para o Gmail
      const recipients = selectedPatientsData.map(p => p.email).join(',')
      
      // Criar conteúdo personalizado (usando o primeiro paciente como exemplo)
      let emailContent = htmlContent.replace(
        /{{PATIENT_NAME}}/g,
        'Paciente'
      )
      
      // Converter HTML para texto simples para o corpo do email
      const textContent = emailContent
        .replace(/<[^>]*>/g, '') // Remove tags HTML
        .replace(/\s+/g, ' ') // Remove espaços extras
        .trim()
      
      // Criar URL do Gmail com parâmetros
      const gmailUrl = new URL('https://mail.google.com/mail/')
      gmailUrl.searchParams.set('view', 'cm')
      gmailUrl.searchParams.set('fs', '1')
      gmailUrl.searchParams.set('to', recipients)
      gmailUrl.searchParams.set('su', formData.subject)
      gmailUrl.searchParams.set('body', textContent)
      
      // Abrir Gmail em nova aba
      window.open(gmailUrl.toString(), '_blank')
      
      setMessage({
        type: 'success',
        text: `Gmail aberto com newsletter pré-formatada para ${selectedPatientsData.length} paciente(s)! Complete o envio no Gmail.`,
      })
      
      if (onSend) {
        await onSend({ ...formData, htmlContent })
      }
      
    } catch (error) {
      console.error('Erro ao preparar newsletter:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao preparar newsletter. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePatientToggle = (patientId: string) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    )
  }

  const handleSelectAll = () => {
    setSelectedPatients(patients.map(p => p.id))
  }

  const handleDeselectAll = () => {
    setSelectedPatients([])
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <Card className='bg-gray-900/50 border-gray-700'>
        <CardHeader>
          <CardTitle className='flex items-center text-white'>
            <Mail className='h-5 w-5 mr-2 text-blue-400' />
            Editor de Newsletter
          </CardTitle>
          <CardDescription className='text-gray-400'>
            Crie e personalize sua newsletter semanal antes de enviar para os
            pacientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full grid-cols-3 bg-gray-800 border-gray-600'>
              <TabsTrigger
                value='edit'
                className='data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300'
              >
                Editar
              </TabsTrigger>
              <TabsTrigger
                value='preview'
                onClick={generatePreview}
                className='data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300'
              >
                Preview
              </TabsTrigger>
              <TabsTrigger
                value='recipients'
                className='data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300'
              >
                Destinatários
              </TabsTrigger>
            </TabsList>

            <TabsContent value='edit' className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='subject' className='text-white'>
                  Assunto do E-mail
                </Label>
                <Input
                  id='subject'
                  value={formData.subject}
                  onChange={e => handleInputChange('subject', e.target.value)}
                  placeholder='Digite o assunto da newsletter'
                  className='bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                />
              </div>

              <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='healthTips'
                    checked={sectionEnabled.healthTips}
                    onCheckedChange={checked =>
                      setSectionEnabled(prev => ({
                        ...prev,
                        healthTips: !!checked,
                      }))
                    }
                    className='border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                  />
                  <Label
                    htmlFor='healthTips'
                    className='text-white cursor-pointer'
                  >
                    Incluir Dicas de Saúde da Semana
                  </Label>
                </div>

                {sectionEnabled.healthTips && (
                  <div className='space-y-2 ml-6'>
                    <Textarea
                      id='content'
                      value={formData.content}
                      onChange={e =>
                        handleInputChange('content', e.target.value)
                      }
                      placeholder='Digite as dicas de saúde e novidades da semana...'
                      rows={6}
                      className='min-h-[150px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                    />
                    <p className='text-sm text-gray-400'>
                      Este conteúdo será inserido na seção "Dica da Semana" do
                      template.
                    </p>
                  </div>
                )}
              </div>

              <div className='space-y-4'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='clinicNews'
                    checked={sectionEnabled.clinicNews}
                    onCheckedChange={checked =>
                      setSectionEnabled(prev => ({
                        ...prev,
                        clinicNews: !!checked,
                      }))
                    }
                    className='border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                  />
                  <Label
                    htmlFor='clinicNews'
                    className='text-white cursor-pointer'
                  >
                    Incluir Novidades da Clínica
                  </Label>
                </div>

                {sectionEnabled.clinicNews && (
                  <div className='space-y-2 ml-6'>
                    <Textarea
                      id='clinicNewsContent'
                      value={formData.clinicNews}
                      onChange={e =>
                        handleInputChange('clinicNews', e.target.value)
                      }
                      placeholder='Digite as novidades e informações da clínica...'
                      rows={6}
                      className='min-h-[150px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                    />
                    <p className='text-sm text-gray-400'>
                      Este conteúdo será inserido na seção "Novidades da
                      Clínica" do template.
                    </p>
                  </div>
                )}
              </div>

              <div className='flex gap-2'>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  variant='outline'
                  className='border-gray-600 text-white hover:bg-gray-700'
                >
                  {isSaving ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Save className='mr-2 h-4 w-4' />
                  )}
                  Salvar Rascunho
                </Button>

                <Button
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      htmlContent: defaultTemplate,
                    }))
                    setMessage({
                      type: 'success',
                      text: 'Template restaurado!',
                    })
                  }}
                  variant='outline'
                  className='border-gray-600 text-white hover:bg-gray-700'
                >
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Restaurar Template
                </Button>
              </div>
            </TabsContent>

            <TabsContent value='preview'>
              <div className='border border-gray-600 rounded-lg p-4 bg-gray-800 max-h-96 overflow-y-auto'>
                <div dangerouslySetInnerHTML={{ __html: previewContent }} />
              </div>
            </TabsContent>

            <TabsContent value='recipients' className='space-y-4'>
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-semibold text-white'>
                  Selecionar Destinatários
                </h3>
                <div className='space-x-2'>
                  <Button
                    onClick={handleSelectAll}
                    variant='outline'
                    size='sm'
                    className='border-gray-600 text-white hover:bg-gray-700'
                  >
                    Selecionar Todos
                  </Button>
                  <Button
                    onClick={handleDeselectAll}
                    variant='outline'
                    size='sm'
                    className='border-gray-600 text-white hover:bg-gray-700'
                  >
                    Desmarcar Todos
                  </Button>
                </div>
              </div>

              <div className='text-sm text-gray-400 mb-4'>
                {selectedPatients.length} de {patients.length} pacientes
                selecionados
              </div>

              <div className='max-h-64 overflow-y-auto border border-gray-600 rounded-lg p-4 space-y-2 bg-gray-800'>
                {patients.map(patient => (
                  <label
                    key={patient.id}
                    className='flex items-center space-x-3 cursor-pointer hover:bg-gray-700 p-2 rounded'
                  >
                    <input
                      type='checkbox'
                      checked={selectedPatients.includes(patient.id)}
                      onChange={() => handlePatientToggle(patient.id)}
                      className='rounded bg-gray-700 border-gray-600 text-blue-500'
                    />
                    <div>
                      <div className='font-medium text-white'>
                        {patient.name}
                      </div>
                      <div className='text-sm text-gray-400'>
                        {patient.email && patient.email.trim() !== '' ? patient.email : 'Não informado'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {message && (
            <Alert
              className={`mt-4 ${message.type === 'success' ? 'border-green-600 bg-green-900/20' : 'border-red-600 bg-red-900/20'}`}
            >
              <AlertDescription
                className={
                  message.type === 'success' ? 'text-green-400' : 'text-red-400'
                }
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className='flex justify-end space-x-2 mt-6'>
            <Button
              onClick={(e) => handleSend(e)}
              disabled={isLoading || selectedPatients.length === 0}
              className='bg-blue-600 hover:bg-blue-700 text-white'
            >
              {isLoading ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Send className='mr-2 h-4 w-4' />
              )}
              Abrir no Gmail ({selectedPatients.length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
