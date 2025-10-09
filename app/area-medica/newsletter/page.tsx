'use client'

import { useState, useEffect } from 'react'
import NewsletterEditor from '@/components/newsletter/newsletter-editor'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import { ArrowLeft, Mail, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

interface NewsletterData {
  subject: string
  content: string
  clinicNews: string
  htmlContent: string
}

export default function NewsletterPage() {
  const [savedDrafts, setSavedDrafts] = useState<NewsletterData[]>([])
  const [currentDraft, setCurrentDraft] = useState<NewsletterData | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSave = async (data: NewsletterData) => {
    if (!isClient) return

    try {
      // Salvar no localStorage como rascunho
      const drafts = JSON.parse(
        localStorage.getItem('newsletter-drafts') || '[]'
      )
      const newDraft = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }

      drafts.push(newDraft)
      localStorage.setItem('newsletter-drafts', JSON.stringify(drafts))
      setSavedDrafts(drafts)

      return Promise.resolve()
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
      return Promise.reject(error)
    }
  }

  const handleSend = async (data: NewsletterData) => {
    if (!isClient) return

    try {
      // Registrar envio no histórico
      const history = JSON.parse(
        localStorage.getItem('newsletter-history') || '[]'
      )
      const newEntry = {
        ...data,
        id: Date.now().toString(),
        sentAt: new Date().toISOString(),
      }

      history.push(newEntry)
      localStorage.setItem('newsletter-history', JSON.stringify(history))

      return Promise.resolve()
    } catch (error) {
      console.error('Erro ao registrar envio:', error)
      return Promise.reject(error)
    }
  }

  return (
    <div className='min-h-screen bg-black p-6 pt-24'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div>
                <h1 className='text-3xl font-bold text-white'>Newsletter</h1>
                <p className='text-gray-300 mt-1'>
                  Crie e envie newsletters personalizadas para seus pacientes
                </p>
              </div>
            </div>
            <MedicalAreaMenu currentPage='newsletter' />
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <Card className='bg-gray-900/50 border-gray-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-white'>
                Rascunhos Salvos
              </CardTitle>
              <Mail className='h-4 w-4 text-blue-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>
                {savedDrafts.length}
              </div>
              <p className='text-xs text-gray-400'>Newsletters em rascunho</p>
            </CardContent>
          </Card>

          <Card className='bg-gray-900/50 border-gray-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-white'>
                Últimos Envios
              </CardTitle>
              <Users className='h-4 w-4 text-blue-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>
                {isClient
                  ? JSON.parse(
                      localStorage.getItem('newsletter-history') || '[]'
                    ).length
                  : 0}
              </div>
              <p className='text-xs text-gray-400'>Newsletters enviadas</p>
            </CardContent>
          </Card>

          <Card className='bg-gray-900/50 border-gray-700'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-white'>
                Próximo Envio
              </CardTitle>
              <Calendar className='h-4 w-4 text-blue-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>Semanal</div>
              <p className='text-xs text-gray-400'>Frequência recomendada</p>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter Editor */}
        <div className='mb-8'>
          <NewsletterEditor
            onSave={handleSave}
            onSend={handleSend}
            initialData={currentDraft || undefined}
            className='w-full'
          />
        </div>

        {/* Saved Drafts */}
        {savedDrafts.length > 0 && (
          <Card className='bg-gray-900/50 border-gray-700'>
            <CardHeader>
              <CardTitle className='text-white'>Rascunhos Salvos</CardTitle>
              <CardDescription className='text-gray-400'>
                Newsletters salvas que podem ser editadas e enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {savedDrafts
                  .slice(-5)
                  .reverse()
                  .map((draft: any) => (
                    <div
                      key={draft.id}
                      className='flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-800/30'
                    >
                      <div>
                        <h3 className='font-medium text-white'>
                          {draft.subject}
                        </h3>
                        <p className='text-sm text-gray-400'>
                          Salvo em{' '}
                          {new Date(draft.createdAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                      </div>
                      <Button
                        onClick={() => setCurrentDraft(draft)}
                        variant='outline'
                        size='sm'
                        className='border-gray-600 text-white hover:bg-gray-700'
                      >
                        Editar
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className='mt-8 bg-gray-900/50 border-gray-700'>
          <CardHeader>
            <CardTitle className='text-white'>Como Usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6 text-sm'>
              <div className='flex items-start space-x-4'>
                <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>
                  1
                </div>
                <div>
                  <p className='font-medium text-white text-base mb-2'>
                    Edite o Conteúdo
                  </p>
                  <p className='text-gray-300 leading-relaxed'>
                    Personalize o assunto e adicione suas dicas de saúde da
                    semana na aba "Editar".
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>
                  2
                </div>
                <div>
                  <p className='font-medium text-white text-base mb-2'>
                    Visualize o Resultado
                  </p>
                  <p className='text-gray-300 leading-relaxed'>
                    Use a aba "Preview" para ver como a newsletter ficará para
                    os pacientes.
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>
                  3
                </div>
                <div>
                  <p className='font-medium text-white text-base mb-2'>
                    Selecione Destinatários
                  </p>
                  <p className='text-gray-300 leading-relaxed'>
                    Na aba "Destinatários", escolha quais pacientes receberão a
                    newsletter.
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-4'>
                <div className='w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'>
                  4
                </div>
                <div>
                  <p className='font-medium text-white text-base mb-2'>
                    Envie ou Salve
                  </p>
                  <p className='text-gray-300 leading-relaxed'>
                    Clique em "Enviar Newsletter" para enviar imediatamente ou
                    "Salvar Rascunho" para enviar depois.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
