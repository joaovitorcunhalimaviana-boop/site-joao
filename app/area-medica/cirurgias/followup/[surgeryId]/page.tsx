'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PostOpFollowUpForm, PostOpFollowUpData } from '@/components/ui/postop-followup-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Calendar, Clock, User, Stethoscope, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface Surgery {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  type: string
  status: string
  notes?: string
  postOpFollowUps: PostOpFollowUp[]
}

interface PostOpFollowUp {
  id: string
  followUpDay: number
  scheduledDate: string
  completed: boolean
  completedAt?: string
  data?: PostOpFollowUpData
}

export default function SurgeryFollowUpPage() {
  const params = useParams()
  const router = useRouter()
  const surgeryId = params.surgeryId as string

  const [surgery, setSurgery] = useState<Surgery | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFollowUp, setActiveFollowUp] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSurgeryData()
  }, [surgeryId])

  const fetchSurgeryData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/surgeries/${surgeryId}`, {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Falha ao carregar dados da cirurgia')
      }
      const data = await response.json()
      setSurgery(data)
    } catch (error) {
      console.error('Erro ao carregar cirurgia:', error)
      toast.error('Erro ao carregar dados da cirurgia')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowUpSubmit = async (data: PostOpFollowUpData) => {
    try {
      setSubmitting(true)
      
      const response = await fetch(`/api/surgeries/${surgeryId}/followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Falha ao salvar follow-up')
      }

      toast.success('Follow-up salvo com sucesso!')
      setActiveFollowUp(null)
      await fetchSurgeryData() // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar follow-up:', error)
      toast.error('Erro ao salvar follow-up')
    } finally {
      setSubmitting(false)
    }
  }

  const sendFollowUpNotification = async (followUpDay: number) => {
    try {
      const response = await fetch('/api/surgery-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'postop_followup',
          surgeryId,
          followUpDay,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao enviar notificação')
      }

      toast.success(`Notificação de follow-up do ${followUpDay}º dia enviada!`)
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      toast.error('Erro ao enviar notificação')
    }
  }

  const getFollowUpStatus = (followUp: PostOpFollowUp) => {
    if (followUp.completed) {
      return { status: 'completed', label: 'Concluído', color: 'bg-green-500' }
    }
    
    const scheduledDate = new Date(followUp.scheduledDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    scheduledDate.setHours(0, 0, 0, 0)
    
    if (scheduledDate < today) {
      return { status: 'overdue', label: 'Atrasado', color: 'bg-red-500' }
    } else if (scheduledDate.getTime() === today.getTime()) {
      return { status: 'due', label: 'Hoje', color: 'bg-yellow-500' }
    } else {
      return { status: 'pending', label: 'Pendente', color: 'bg-blue-500' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!surgery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Cirurgia não encontrada
        </h1>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Follow-ups Pós-Operatórios
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Acompanhamento da recuperação pós-cirúrgica
            </p>
          </div>
        </div>
      </div>

      {/* Informações da Cirurgia */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5" />
            <span>Informações da Cirurgia</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Paciente</p>
                <p className="font-medium">{surgery.patientName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-medium">
                  {new Date(surgery.date + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Horário</p>
                <p className="font-medium">{surgery.time}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium">{surgery.type}</p>
              </div>
            </div>
          </div>
          {surgery.notes && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Observações:</strong> {surgery.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-ups */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="form">Preencher Follow-up</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {surgery.postOpFollowUps
              .sort((a, b) => a.followUpDay - b.followUpDay)
              .map((followUp) => {
                const status = getFollowUpStatus(followUp)
                return (
                  <Card key={followUp.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {followUp.followUpDay}º Dia
                        </CardTitle>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(followUp.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {followUp.completed ? (
                        <div className="space-y-2">
                          <p className="text-sm text-green-600 font-medium">
                            ✓ Concluído em{' '}
                            {followUp.completedAt &&
                              new Date(followUp.completedAt + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                          </p>
                          {followUp.data && (
                            <div className="text-xs space-y-1">
                              <p>Dor repouso: {followUp.data.painScaleRest}/10</p>
                              <p>Dor movimento: {followUp.data.painScaleMovement}/10</p>
                              {followUp.data.concerns && (
                                <p className="text-gray-600">
                                  Preocupações: {followUp.data.concerns.substring(0, 50)}...
                                </p>
                              )}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveFollowUp(followUp.followUpDay)}
                            className="w-full"
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            onClick={() => setActiveFollowUp(followUp.followUpDay)}
                            className="w-full"
                          >
                            Preencher
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendFollowUpNotification(followUp.followUpDay)}
                            className="w-full"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Notificar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="form">
          {activeFollowUp ? (
            <PostOpFollowUpForm
              surgeryId={surgery.id}
              followUpDay={activeFollowUp}
              patientName={surgery.patientName}
              surgeryType={surgery.type}
              surgeryDate={surgery.date}
              onSubmit={handleFollowUpSubmit}
              onCancel={() => setActiveFollowUp(null)}
              disabled={submitting}
              initialData={
                surgery.postOpFollowUps
                  .find(f => f.followUpDay === activeFollowUp)?.data
              }
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">
                  Selecione um follow-up para preencher
                </p>
                <div className="flex space-x-2">
                  {[1, 4, 7, 14].map((day) => (
                    <Button
                      key={day}
                      variant="outline"
                      onClick={() => setActiveFollowUp(day)}
                    >
                      {day}º Dia
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}