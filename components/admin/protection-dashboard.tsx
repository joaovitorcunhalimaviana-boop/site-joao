'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Mail,
  RefreshCw,
  Play,
  Zap
} from 'lucide-react'

interface ProtectionStatus {
  protection: {
    monitoring: boolean
    lastIntegrityCheck?: string
    lastBackup?: string
    criticalIssues: number
    totalBackups: number
  }
  integrity: {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
    lastCheck: string
    issuesCount: number
    criticalIssues: number
  }
  services: {
    backupMonitoring: boolean
    emailAutomation: boolean
  }
}

export default function ProtectionDashboard() {
  const [status, setStatus] = useState<ProtectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Carregar status inicial
  useEffect(() => {
    loadStatus()
    
    // Atualizar status a cada 30 segundos
    const interval = setInterval(loadStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/protection-status')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.data)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar status' })
    } finally {
      setLoading(false)
    }
  }

  const executeAction = async (action: string, actionName: string) => {
    setActionLoading(action)
    setMessage(null)
    
    try {
      const response = await fetch('/api/protection-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        await loadStatus() // Recarregar status
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Erro ao executar ${actionName}` })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600'
      case 'WARNING': return 'text-yellow-600'
      case 'CRITICAL': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'CRITICAL': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando status de proteção...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sistema de Proteção de Dados</h2>
          <p className="text-muted-foreground">
            Monitoramento e controle da segurança dos dados da clínica
          </p>
        </div>
        <Button 
          onClick={loadStatus} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {status && (
        <>
          {/* Status Geral */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status da Integridade</CardTitle>
                {getStatusIcon(status.integrity.status)}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(status.integrity.status)}`}>
                  {status.integrity.status}
                </div>
                <p className="text-xs text-muted-foreground">
                  {status.integrity.issuesCount} problemas encontrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monitoramento</CardTitle>
                <Shield className={`h-4 w-4 ${status.protection.monitoring ? 'text-green-600' : 'text-gray-400'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant={status.protection.monitoring ? 'default' : 'secondary'}>
                    {status.protection.monitoring ? 'ATIVO' : 'INATIVO'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sistema de monitoramento contínuo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
                <Database className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.protection.totalBackups}</div>
                <p className="text-xs text-muted-foreground">
                  Último: {formatDate(status.protection.lastBackup)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Problemas Críticos</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${status.protection.criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${status.protection.criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {status.protection.criticalIssues}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimas 24 horas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes da Integridade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verificação de Integridade
              </CardTitle>
              <CardDescription>
                Status detalhado da última verificação de integridade dos dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Status Atual</p>
                    <p className="text-sm text-muted-foreground">
                      Última verificação: {formatDate(status.integrity.lastCheck)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.integrity.status)}
                    <span className={`font-medium ${getStatusColor(status.integrity.status)}`}>
                      {status.integrity.status}
                    </span>
                  </div>
                </div>

                {status.integrity.issuesCount > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">
                        {status.integrity.issuesCount} problemas detectados
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      {status.integrity.criticalIssues} críticos, {status.integrity.issuesCount - status.integrity.criticalIssues} menores
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Serviços Ativos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Serviços Automáticos
              </CardTitle>
              <CardDescription>
                Status dos serviços automáticos da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Monitoramento de Backup</p>
                    <p className="text-sm text-muted-foreground">
                      Verificações automáticas de integridade
                    </p>
                  </div>
                  <Badge variant={status.services.backupMonitoring ? 'default' : 'secondary'}>
                    {status.services.backupMonitoring ? 'ATIVO' : 'INATIVO'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">E-mails Automáticos</p>
                    <p className="text-sm text-muted-foreground">
                      Boas-vindas e aniversários
                    </p>
                  </div>
                  <Badge variant={status.services.emailAutomation ? 'default' : 'secondary'}>
                    {status.services.emailAutomation ? 'ATIVO' : 'INATIVO'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Execute ações de manutenção e verificação do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  onClick={() => executeAction('start_monitoring', 'iniciar monitoramento')}
                  disabled={actionLoading === 'start_monitoring' || status.protection.monitoring}
                  className="w-full"
                >
                  {actionLoading === 'start_monitoring' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Iniciar Monitoramento
                </Button>

                <Button
                  onClick={() => executeAction('emergency_backup', 'backup de emergência')}
                  disabled={actionLoading === 'emergency_backup'}
                  variant="outline"
                  className="w-full"
                >
                  {actionLoading === 'emergency_backup' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Backup Emergência
                </Button>

                <Button
                  onClick={() => executeAction('integrity_check', 'verificação de integridade')}
                  disabled={actionLoading === 'integrity_check'}
                  variant="outline"
                  className="w-full"
                >
                  {actionLoading === 'integrity_check' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Verificar Integridade
                </Button>

                <Button
                  onClick={() => executeAction('check_birthdays', 'verificar aniversários')}
                  disabled={actionLoading === 'check_birthdays'}
                  variant="outline"
                  className="w-full"
                >
                  {actionLoading === 'check_birthdays' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Verificar Aniversários
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}