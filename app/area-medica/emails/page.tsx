'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/ui/header'
import BackgroundPattern from '../../../components/ui/background-pattern'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import { formatDateToBrazilian } from '@/lib/date-utils'
import {
  EnvelopeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  whatsapp: string
  birthDate?: string
  createdAt: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  type: 'welcome' | 'birthday'
  content: string
  createdAt: string
}

export default function EmailsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'patients' | 'templates' | 'send'>(
    'patients'
  )
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
    null
  )
  const router = useRouter()

  useEffect(() => {
    loadPatients()
    loadEmailTemplates()
  }, [])

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/patients')
      if (response.ok) {
        const data = await response.json()
        // A API retorna um objeto com a propriedade 'patients'
        const patientsList = data.patients || []
        // Filtrar apenas pacientes com email
        const patientsWithEmail = patientsList.filter(
          (patient: any) => patient.email && patient.email.trim() !== ''
        )
        setPatients(patientsWithEmail)
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    }
  }

  const loadEmailTemplates = () => {
    // Templates padrão
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'E-mail de Boas-vindas',
        subject: 'Bem-vindo(a) à Clínica Dr. João Vitor Viana!',
        type: 'welcome',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #000000;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo(a)!</h1>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #1e3a8a; margin-bottom: 20px;">Olá, {{PATIENT_NAME}}!</h2>
               
               <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">É com imenso carinho e satisfação que recebemos você em nossa clínica. Estamos aqui para cuidar da sua saúde com todo o acolhimento, dedicação e excelência que você merece.</p>
             
             <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">Sabemos que cuidar da saúde pode gerar ansiedades, e por isso queremos que você se sinta completamente à vontade e seguro(a) conosco. Nossa equipe está preparada para oferecer o melhor atendimento, sempre proporcionando as tecnologias mais novas e baseadas nas melhores evidências científicas, com humanização e respeito.</p>
             
             <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1e3a8a;">
               <h3 style="color: #1e3a8a; margin-top: 0;">Nossa clínica especializada em coloproctologia e cirurgia geral</h3>
               <p style="margin: 0; line-height: 1.6; color: #1f2937; text-align: justify;">Oferecemos atendimento completo e personalizado, sempre priorizando seu bem-estar e conforto em cada etapa do tratamento.</p>
             </div>
             
             <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">Estamos comprometidos em proporcionar a você uma experiência de cuidado excepcional, onde sua saúde e tranquilidade são nossas prioridades.</p>
              
              <div style="background-color: #1e3a8a; color: white; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <h3 style="margin-top: 0;">Entre em Contato</h3>
                <p style="margin-bottom: 20px;">Fale conosco através dos nossos canais de atendimento</p>
                
                <!-- Grid de contatos simétrico -->
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
                
                <!-- Endereço como rodapé -->
                <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 15px; margin-top: 15px;">
                  <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">📍 Localização do Consultório</p>
                  <p style="margin: 0; font-size: 13px; line-height: 1.4;">Avenida Rui Barbosa, 484<br>Edifício Arcádia, Sala 101 - Torre<br>João Pessoa - PB</p>
                </div>
              </div>
              
              <p style="text-align: center; color: #4b5563; font-size: 14px; margin-top: 30px;">Esperamos vê-lo em breve para iniciarmos juntos este cuidado com sua saúde.</p>
            </div>
          </div>
        `,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'birthday',
        name: 'E-mail de Aniversário',
        subject: 'Parabéns pelo seu aniversário!',
        type: 'birthday',
        content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #000000;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Parabéns! 🎉</h1>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #1e3a8a; margin-bottom: 20px;">Feliz Aniversário, {{PATIENT_NAME}}!</h2>
              
              <p style="line-height: 1.6; margin-bottom: 20px; color: #1f2937; text-align: justify;">É com muito carinho que desejamos um feliz aniversário! Que este novo ano de vida seja repleto de saúde, alegria e realizações.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1e3a8a;">
                <h3 style="color: #1e3a8a; margin-top: 0;">🎂 Nossos Votos</h3>
                <p style="margin: 0; line-height: 1.6; color: #1f2937; text-align: justify;">Que você tenha muita saúde, paz e momentos especiais ao lado de quem você ama. Continuamos aqui para cuidar do seu bem-estar sempre!</p>
              </div>
              
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
              
              <p style="text-align: center; color: #4b5563; font-size: 14px; margin-top: 30px;">Desejamos um dia muito especial para você!</p>
            </div>
          </div>
        `,
        createdAt: new Date().toISOString(),
      },
    ]

    setEmailTemplates(defaultTemplates)
  }

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([])
    } else {
      setSelectedPatients(patients.map(p => p.id))
    }
  }

  const handleSendEmails = async () => {
    if (selectedPatients.length === 0 || !selectedTemplate) {
      alert('Selecione pelo menos um paciente e um template de e-mail')
      return
    }

    setIsLoading(true)
    try {
      const template = emailTemplates.find(t => t.id === selectedTemplate)
      const selectedPatientsData = patients.filter(p =>
        selectedPatients.includes(p.id)
      )

      // Criar um conteúdo personalizado para cada paciente
      const emailPromises = selectedPatientsData.map(async patient => {
        // Substituir o nome do paciente no template
        let personalizedContent =
          template?.content.replace(/{{PATIENT_NAME}}/g, patient.name) || ''

        const subject =
          template?.id === 'welcome'
            ? 'Bem-vindo à nossa clínica!'
            : template?.id === 'newsletter'
              ? 'Novidades e Dicas da Semana'
              : 'Parabéns pelo seu aniversário!'

        return fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipients: [patient.email],
            subject,
            template: template?.id,
            customContent: personalizedContent,
          }),
        })
      })

      // Aguardar todos os envios
      const responses = await Promise.all(emailPromises)
      const results = await Promise.all(
        responses.map(async response => {
          if (!response.ok) {
            const errorText = await response.text()
            console.error(
              '❌ Resposta HTTP não OK:',
              response.status,
              errorText
            )
            throw new Error(`Erro HTTP ${response.status}: ${errorText}`)
          }

          const responseText = await response.text()
          console.log('📧 Texto bruto da resposta:', responseText)

          if (!responseText.trim()) {
            throw new Error('Resposta vazia da API')
          }

          return JSON.parse(responseText)
        })
      )

      console.log('📧 Respostas da API (parsed):', results)

      // Verificar se todos os envios foram bem-sucedidos
      const allSuccessful = results.every(result => result.success === true)

      if (allSuccessful) {
        alert(
          `E-mails enviados com sucesso para ${selectedPatientsData.length} paciente(s)!`
        )
        setSelectedPatients([])
        setSelectedTemplate('')
      } else {
        const failedCount = results.filter(
          result => result.success !== true
        ).length
        console.error('❌ Falha em alguns envios - results:', results)
        const failedEmails = results.filter(r => r.success !== true).map(r => r.email || "Unknown").join(", "); throw new Error(`Falha no envio de ${failedCount} e-mail(s): ${failedEmails}`)
      }
    } catch (error) {
      console.error('Erro ao enviar e-mails:', error)
      alert('Erro ao enviar e-mails. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  const renderPreview = () => {
    if (!previewTemplate) return null

    let content = previewTemplate.content
    content = content.replace(/{{PATIENT_NAME}}/g, 'João da Silva')
    content = content.replace(
      /{{HEALTH_TIP}}/g,
      'Beba pelo menos 2 litros de água por dia e inclua fibras na sua alimentação para manter o intestino saudável.'
    )
    content = content.replace(
      /{{CLINIC_NEWS}}/g,
      'Agora oferecemos teleconsulta! Agende sua consulta online através do nosso site.'
    )

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
        <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden'>
          <div className='flex items-center justify-between p-4 border-b'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Preview: {previewTemplate.name}
            </h3>
            <button
              onClick={() => setShowPreview(false)}
              className='text-gray-400 hover:text-gray-600'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>
          </div>
          <div className='p-4 overflow-y-auto max-h-[calc(90vh-120px)]'>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-black'>
      <Header currentPage='area-medica' />
      <BackgroundPattern />

      <div className='relative z-10 pt-32'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center space-x-4'>
              <div>
                <h1 className='text-3xl font-bold text-white flex items-center'>
                  <EnvelopeIcon className='h-8 w-8 mr-3 text-blue-400' />
                  Sistema de E-mails
                </h1>
                <p className='text-gray-400 mt-1'>
                  Gerencie e envie e-mails para seus pacientes
                </p>
              </div>
            </div>
            <MedicalAreaMenu currentPage='emails' />
          </div>

          {/* Tabs */}
          <div className='flex space-x-1 bg-gray-800 p-1 rounded-lg mb-8'>
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'patients'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <UserGroupIcon className='h-5 w-5 inline mr-2' />
              Pacientes ({patients.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <DocumentTextIcon className='h-5 w-5 inline mr-2' />
              Templates ({emailTemplates.length})
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'send'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <PaperAirplaneIcon className='h-5 w-5 inline mr-2' />
              Enviar E-mails
            </button>
          </div>

          {/* Content */}
          {activeTab === 'patients' && (
            <div className='bg-gray-800 rounded-lg p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-white'>
                  Lista de Pacientes com E-mail
                </h2>
                <div className='text-sm text-gray-400'>
                  {patients.length} paciente(s) com e-mail cadastrado
                </div>
              </div>

              {patients.length === 0 ? (
                <div className='text-center py-12'>
                  <UserGroupIcon className='h-12 w-12 text-gray-600 mx-auto mb-4' />
                  <p className='text-gray-400'>
                    Nenhum paciente com e-mail cadastrado encontrado
                  </p>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-700'>
                        <th className='text-left py-3 px-4 text-gray-300 font-medium'>
                          Nome
                        </th>
                        <th className='text-left py-3 px-4 text-gray-300 font-medium'>
                          E-mail
                        </th>
                        <th className='text-left py-3 px-4 text-gray-300 font-medium'>
                          Telefone
                        </th>
                        <th className='text-left py-3 px-4 text-gray-300 font-medium'>
                          Data de Nascimento
                        </th>
                        <th className='text-left py-3 px-4 text-gray-300 font-medium'>
                          Cadastrado em
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map(patient => (
                        <tr
                          key={patient.id}
                          className='border-b border-gray-700 hover:bg-gray-700'
                        >
                          <td className='py-3 px-4 text-white'>
                            {patient.name}
                          </td>
                          <td className='py-3 px-4 text-blue-400'>
                            {patient.email}
                          </td>
                          <td className='py-3 px-4 text-gray-300'>
                            {patient.phone}
                          </td>
                          <td className='py-3 px-4 text-gray-300'>
                            {patient.birthDate
                              ? formatDateToBrazilian(
                                  new Date(patient.birthDate + 'T12:00:00')
                                )
                              : 'Não informado'}
                          </td>
                          <td className='py-3 px-4 text-gray-300'>
                            {formatDateToBrazilian(new Date(patient.createdAt))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className='bg-gray-800 rounded-lg p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-white'>
                  Templates de E-mail
                </h2>
              </div>

              <div className='grid gap-6'>
                {emailTemplates.map(template => (
                  <div key={template.id} className='bg-gray-700 rounded-lg p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div>
                        <h3 className='text-lg font-semibold text-white'>
                          {template.name}
                        </h3>
                        <p className='text-gray-400 text-sm mt-1'>
                          {template.subject}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                            template.type === 'welcome'
                              ? 'bg-green-900 text-green-300'
                              : 'bg-blue-900 text-blue-300'
                          }`}
                        >
                          {template.type === 'welcome'
                            ? 'Boas-vindas'
                            : 'Newsletter'}
                        </span>
                      </div>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => handlePreviewTemplate(template)}
                          className='flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                        >
                          <EyeIcon className='h-4 w-4 mr-1' />
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'send' && (
            <div className='bg-gray-800 rounded-lg p-6'>
              <h2 className='text-xl font-semibold text-white mb-6'>
                Enviar E-mails
              </h2>

              <div className='grid lg:grid-cols-2 gap-8'>
                {/* Seleção de Pacientes */}
                <div>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-medium text-white'>
                      Selecionar Pacientes
                    </h3>
                    <button
                      onClick={handleSelectAll}
                      className='text-blue-400 hover:text-blue-300 text-sm'
                    >
                      {selectedPatients.length === patients.length
                        ? 'Desmarcar Todos'
                        : 'Selecionar Todos'}
                    </button>
                  </div>

                  <div className='bg-gray-700 rounded-lg max-h-96 overflow-y-auto'>
                    {patients.map(patient => (
                      <label
                        key={patient.id}
                        className='flex items-center p-4 hover:bg-gray-600 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={selectedPatients.includes(patient.id)}
                          onChange={() => handlePatientSelect(patient.id)}
                          className='mr-3 h-4 w-4 text-blue-600 rounded border-gray-300'
                        />
                        <div>
                          <div className='text-white font-medium'>
                            {patient.name}
                          </div>
                          <div className='text-gray-400 text-sm'>
                            {patient.email}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className='mt-4 text-sm text-gray-400'>
                    {selectedPatients.length} de {patients.length} paciente(s)
                    selecionado(s)
                  </div>
                </div>

                {/* Seleção de Template */}
                <div>
                  <h3 className='text-lg font-medium text-white mb-4'>
                    Selecionar Template
                  </h3>

                  <div className='space-y-3'>
                    {emailTemplates.map(template => (
                      <label
                        key={template.id}
                        className='flex items-start p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600'
                      >
                        <input
                          type='radio'
                          name='template'
                          value={template.id}
                          checked={selectedTemplate === template.id}
                          onChange={e => setSelectedTemplate(e.target.value)}
                          className='mr-3 mt-1 h-4 w-4 text-blue-600'
                        />
                        <div className='flex-1'>
                          <div className='text-white font-medium'>
                            {template.name}
                          </div>
                          <div className='text-gray-400 text-sm mt-1'>
                            {template.subject}
                          </div>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                              template.type === 'welcome'
                                ? 'bg-green-900 text-green-300'
                                : 'bg-blue-900 text-blue-300'
                            }`}
                          >
                            {template.type === 'welcome'
                              ? 'Boas-vindas'
                              : 'Newsletter'}
                          </span>
                        </div>
                        <button
                          onClick={e => {
                            e.preventDefault()
                            handlePreviewTemplate(template)
                          }}
                          className='ml-2 text-blue-400 hover:text-blue-300'
                        >
                          <EyeIcon className='h-4 w-4' />
                        </button>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleSendEmails}
                    disabled={
                      isLoading ||
                      selectedPatients.length === 0 ||
                      !selectedTemplate
                    }
                    className='w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center'
                  >
                    {isLoading ? (
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                    ) : (
                      <PaperAirplaneIcon className='h-5 w-5 mr-2' />
                    )}
                    {isLoading ? 'Enviando...' : 'Enviar E-mails'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPreview && renderPreview()}
    </div>
  )
}


