'use client'

// Provedor de Proteção de Dados
// Inicializa automaticamente todos os sistemas de backup e proteção

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface DataProtectionContextType {
  isProtectionActive: boolean
  protectionStatus: 'initializing' | 'active' | 'error' | 'inactive'
  lastBackup?: string
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN'
  initializeProtection: () => Promise<void>
  executeEmergencyBackup: () => Promise<void>
  getProtectionStatus: () => Promise<any>
}

const DataProtectionContext = createContext<DataProtectionContextType | undefined>(undefined)

interface DataProtectionProviderProps {
  children: ReactNode
}

export function DataProtectionProvider({ children }: DataProtectionProviderProps) {
  const [isProtectionActive, setIsProtectionActive] = useState(false)
  const [protectionStatus, setProtectionStatus] = useState<'initializing' | 'active' | 'error' | 'inactive'>('inactive')
  const [lastBackup, setLastBackup] = useState<string | undefined>()
  const [systemHealth, setSystemHealth] = useState<'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN'>('UNKNOWN')

  // Inicializar proteção automaticamente
  useEffect(() => {
    initializeProtectionSystems()
    
    // Verificar status periodicamente (a cada 5 minutos)
    const statusInterval = setInterval(() => {
      checkProtectionStatus()
    }, 5 * 60 * 1000)
    
    return () => {
      clearInterval(statusInterval)
    }
  }, [])

  // Inicializar todos os sistemas de proteção
  const initializeProtectionSystems = async () => {
    console.log('🚀 INICIALIZANDO SISTEMAS DE PROTEÇÃO DE DADOS...')
    setProtectionStatus('initializing')
    
    try {
      // Aguardar mais tempo para garantir que a aplicação carregou completamente
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Inicializar sistemas via API
      const response = await fetch('/api/protection-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'initialize_protection'
        }),
        // Adicionar timeout e configurações de fetch
        signal: AbortSignal.timeout(30000) // 30 segundos de timeout
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ SISTEMAS DE PROTEÇÃO INICIALIZADOS:', result.data)
        
        setIsProtectionActive(true)
        setProtectionStatus('active')
        
        // Verificar status inicial
        try {
          await checkProtectionStatus()
        } catch (statusError) {
          console.warn('⚠️ Não foi possível verificar status inicial:', statusError)
        }
        
        // Executar backup inicial se necessário
        if (result.data?.results?.emergencyBackup) {
          console.log('✅ Backup inicial executado com sucesso')
        } else {
          console.log('⚠️ Executando backup inicial...')
          try {
            await executeEmergencyBackup()
          } catch (backupError) {
            console.warn('⚠️ Backup inicial falhou, mas sistema continuará funcionando:', backupError)
          }
        }
        
      } else {
        throw new Error(`Falha na inicialização: ${response.status}`)
      }
      
    } catch (error) {
      console.error('❌ ERRO NA INICIALIZAÇÃO DOS SISTEMAS DE PROTEÇÃO:', error)
      setProtectionStatus('error')
      
      // Tentar novamente em 30 segundos
      setTimeout(() => {
        console.log('🔄 TENTANDO REINICIALIZAR SISTEMAS DE PROTEÇÃO...')
        initializeProtectionSystems()
      }, 30000)
    }
  }

  // Verificar status dos sistemas
  const checkProtectionStatus = async () => {
    try {
      const response = await fetch('/api/protection-manager?action=status')
      
      if (response.ok) {
        const result = await response.json()
        const data = result.data
        
        // Atualizar estado baseado no status
        setIsProtectionActive(data.scheduler?.running || false)
        
        // Atualizar último backup
        if (data.lastBackup?.emergency) {
          setLastBackup(data.lastBackup.emergency)
        }
        
        // Atualizar saúde do sistema
        if (data.monitoring?.overallStatus) {
          setSystemHealth(data.monitoring.overallStatus)
        }
        
        // Verificar se precisa de ação
        if (data.monitoring?.overallStatus === 'CRITICAL' || data.monitoring?.overallStatus === 'EMERGENCY') {
          console.log('🚨 STATUS CRÍTICO DETECTADO - EXECUTANDO BACKUP DE EMERGÊNCIA')
          try {
            await executeEmergencyBackup()
          } catch (emergencyError) {
            console.error('❌ Falha no backup de emergência:', emergencyError)
          }
        }
        
        // Atualizar status geral
        if (data.scheduler?.running && data.monitoring?.overallStatus !== 'CRITICAL') {
          setProtectionStatus('active')
        } else if (data.monitoring?.overallStatus === 'CRITICAL') {
          setProtectionStatus('error')
        }
        
      } else {
        console.warn('⚠️ Não foi possível verificar status de proteção')
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error)
    }
  }

  // Inicializar proteção manualmente
  const initializeProtection = async () => {
    await initializeProtectionSystems()
  }

  // Executar backup de emergência
  const executeEmergencyBackup = async () => {
    try {
      console.log('🚨 EXECUTANDO BACKUP DE EMERGÊNCIA...')
      
      const response = await fetch('/api/protection-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'emergency_backup'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ BACKUP DE EMERGÊNCIA CONCLUÍDO:', result.data)
        setLastBackup(new Date().toISOString())
      } else {
        throw new Error(`Backup falhou: ${response.status}`)
      }
      
    } catch (error) {
      console.error('❌ ERRO NO BACKUP DE EMERGÊNCIA:', error)
      throw error
    }
  }

  // Obter status completo
  const getProtectionStatus = async () => {
    try {
      const response = await fetch('/api/protection-manager?action=status')
      if (response.ok) {
        return await response.json()
      }
      throw new Error(`Erro ao obter status: ${response.status}`)
    } catch (error) {
      console.error('❌ Erro ao obter status:', error)
      throw error
    }
  }

  const contextValue: DataProtectionContextType = {
    isProtectionActive,
    protectionStatus,
    lastBackup,
    systemHealth,
    initializeProtection,
    executeEmergencyBackup,
    getProtectionStatus
  }

  return (
    <DataProtectionContext.Provider value={contextValue}>
      {children}
      
      {/* Indicador visual do status de proteção - apenas em desenvolvimento */}
      {process.env['NODE_ENV'] === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`
            px-3 py-2 rounded-lg text-xs font-medium shadow-lg transition-all duration-300
            ${protectionStatus === 'active' ? 'bg-green-500 text-white' : ''}
            ${protectionStatus === 'initializing' ? 'bg-yellow-500 text-white animate-pulse' : ''}
            ${protectionStatus === 'error' ? 'bg-red-500 text-white' : ''}
            ${protectionStatus === 'inactive' ? 'bg-gray-500 text-white' : ''}
          `}>
            {protectionStatus === 'active' && '🛡️ Proteção Ativa'}
            {protectionStatus === 'initializing' && '⏳ Inicializando...'}
            {protectionStatus === 'error' && '⚠️ Erro na Proteção'}
            {protectionStatus === 'inactive' && '❌ Proteção Inativa'}
          </div>
          
          {systemHealth !== 'UNKNOWN' && (
            <div className={`
              mt-1 px-2 py-1 rounded text-xs
              ${systemHealth === 'HEALTHY' ? 'bg-green-100 text-green-800' : ''}
              ${systemHealth === 'WARNING' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${systemHealth === 'CRITICAL' ? 'bg-red-100 text-red-800' : ''}
            `}>
              Sistema: {systemHealth}
            </div>
          )}
          
          {lastBackup && (
            <div className="mt-1 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
              Último backup: {new Date(lastBackup).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </DataProtectionContext.Provider>
  )
}

// Hook para usar o contexto
export function useDataProtection() {
  const context = useContext(DataProtectionContext)
  if (context === undefined) {
    throw new Error('useDataProtection deve ser usado dentro de DataProtectionProvider')
  }
  return context
}

// Componente para exibir status detalhado (opcional)
export function DataProtectionStatus() {
  const { 
    isProtectionActive, 
    protectionStatus, 
    lastBackup, 
    systemHealth,
    getProtectionStatus 
  } = useDataProtection()
  
  const [detailedStatus, setDetailedStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadDetailedStatus = async () => {
    setIsLoading(true)
    try {
      const status = await getProtectionStatus()
      setDetailedStatus(status.data)
    } catch (error) {
      console.error('Erro ao carregar status detalhado:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDetailedStatus()
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Status de Proteção de Dados</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-sm text-gray-600">Status:</span>
          <div className={`font-medium ${
            protectionStatus === 'active' ? 'text-green-600' : 
            protectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {protectionStatus === 'active' ? '✅ Ativo' : 
             protectionStatus === 'error' ? '❌ Erro' : 
             protectionStatus === 'initializing' ? '⏳ Inicializando' : '❌ Inativo'}
          </div>
        </div>
        
        <div>
          <span className="text-sm text-gray-600">Saúde do Sistema:</span>
          <div className={`font-medium ${
            systemHealth === 'HEALTHY' ? 'text-green-600' : 
            systemHealth === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {systemHealth}
          </div>
        </div>
      </div>
      
      {lastBackup && (
        <div className="mb-4">
          <span className="text-sm text-gray-600">Último Backup:</span>
          <div className="font-medium text-blue-600">
            {new Date(lastBackup).toLocaleString()}
          </div>
        </div>
      )}
      
      {detailedStatus && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">Detalhes:</h4>
          <div className="text-sm space-y-1">
            <div>Agendador: {detailedStatus.scheduler?.running ? '✅ Ativo' : '❌ Inativo'}</div>
            <div>Tarefas: {detailedStatus.scheduler?.tasksCount || 0}</div>
            <div>Integridade: {detailedStatus.integrity?.status || 'UNKNOWN'}</div>
            <div>Alertas: {detailedStatus.monitoring?.alerts || 0}</div>
          </div>
        </div>
      )}
      
      <button
        onClick={loadDetailedStatus}
        disabled={isLoading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Carregando...' : 'Atualizar Status'}
      </button>
    </div>
  )
}
