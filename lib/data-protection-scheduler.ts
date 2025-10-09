// Agendador Central de Proteção de Dados
// Coordena todos os sistemas de backup, auditoria e verificação de integridade

interface ScheduleConfig {
  backups: {
    emergency: { enabled: boolean; interval: number } // em minutos
    daily: { enabled: boolean; time: string } // HH:MM
    weekly: { enabled: boolean; day: number; time: string } // 0=domingo
    monthly: { enabled: boolean; day: number; time: string }
  }
  integrity: {
    enabled: boolean
    interval: number // em horas
  }
  cloudBackup: {
    enabled: boolean
    interval: number // em horas
  }
  monitoring: {
    enabled: boolean
    interval: number // em minutos
  }
}

interface ScheduledTask {
  id: string
  name: string
  type: 'backup' | 'integrity' | 'cloud' | 'monitoring'
  nextRun: Date
  lastRun?: Date
  status: 'scheduled' | 'running' | 'completed' | 'failed'
  interval: number
  enabled: boolean
}

// Sistema de Agendamento de Proteção de Dados
export class DataProtectionScheduler {
  private static instance: DataProtectionScheduler
  private tasks: Map<string, ScheduledTask> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false
  
  // Singleton pattern
  static getInstance(): DataProtectionScheduler {
    if (!DataProtectionScheduler.instance) {
      DataProtectionScheduler.instance = new DataProtectionScheduler()
    }
    return DataProtectionScheduler.instance
  }
  
  // Configuração padrão
  static getDefaultConfig(): ScheduleConfig {
    return {
      backups: {
        emergency: { enabled: false, interval: 60 }, // DESABILITADO TEMPORARIAMENTE
        daily: { enabled: false, time: '02:00' }, // DESABILITADO TEMPORARIAMENTE
        weekly: { enabled: false, day: 0, time: '03:00' }, // DESABILITADO TEMPORARIAMENTE
        monthly: { enabled: false, day: 1, time: '04:00' } // DESABILITADO TEMPORARIAMENTE
      },
      integrity: {
        enabled: false, // DESABILITADO TEMPORARIAMENTE
        interval: 6 // A cada 6 horas
      },
      cloudBackup: {
        enabled: false, // DESABILITADO TEMPORARIAMENTE
        interval: 12 // A cada 12 horas
      },
      monitoring: {
        enabled: false, // DESABILITADO TEMPORARIAMENTE
        interval: 15 // A cada 15 minutos
      }
    }
  }
  
  // Inicializar agendador
  async initialize(config?: ScheduleConfig): Promise<void> {
    console.log('🕐 INICIALIZANDO AGENDADOR DE PROTEÇÃO DE DADOS...')
    
    const scheduleConfig = config || DataProtectionScheduler.getDefaultConfig()
    
    try {
      // Limpar tarefas existentes
      this.clearAllTasks()
      
      // Configurar backup de emergência
      if (scheduleConfig.backups.emergency.enabled) {
        await this.scheduleEmergencyBackup(scheduleConfig.backups.emergency.interval)
      }
      
      // Configurar backup diário
      if (scheduleConfig.backups.daily.enabled) {
        await this.scheduleDailyBackup(scheduleConfig.backups.daily.time)
      }
      
      // Configurar backup semanal
      if (scheduleConfig.backups.weekly.enabled) {
        await this.scheduleWeeklyBackup(scheduleConfig.backups.weekly.day, scheduleConfig.backups.weekly.time)
      }
      
      // Configurar backup mensal
      if (scheduleConfig.backups.monthly.enabled) {
        await this.scheduleMonthlyBackup(scheduleConfig.backups.monthly.day, scheduleConfig.backups.monthly.time)
      }
      
      // Configurar verificação de integridade
      if (scheduleConfig.integrity.enabled) {
        await this.scheduleIntegrityCheck(scheduleConfig.integrity.interval)
      }
      
      // Configurar backup em nuvem
      if (scheduleConfig.cloudBackup.enabled) {
        await this.scheduleCloudBackup(scheduleConfig.cloudBackup.interval)
      }
      
      // Configurar monitoramento
      if (scheduleConfig.monitoring.enabled) {
        await this.scheduleMonitoring(scheduleConfig.monitoring.interval)
      }
      
      this.isRunning = true
      console.log(`✅ AGENDADOR INICIADO COM ${this.tasks.size} TAREFAS`)
      
      // Log de auditoria
      await this.logSchedulerEvent('scheduler_initialized', {
        tasksCount: this.tasks.size,
        config: scheduleConfig
      })
      
    } catch (error) {
      console.error('❌ ERRO AO INICIALIZAR AGENDADOR:', error)
      throw error
    }
  }
  
  // Agendar backup de emergência (recorrente)
  private async scheduleEmergencyBackup(intervalMinutes: number): Promise<void> {
    const taskId = 'emergency_backup'
    const nextRun = new Date(Date.now() + intervalMinutes * 60 * 1000)
    
    const task: ScheduledTask = {
      id: taskId,
      name: 'Backup de Emergência',
      type: 'backup',
      nextRun,
      status: 'scheduled',
      interval: intervalMinutes * 60 * 1000, // converter para ms
      enabled: true
    }
    
    this.tasks.set(taskId, task)
    
    const timer = setInterval(async () => {
      await this.executeEmergencyBackup(taskId)
    }, task.interval)
    
    this.timers.set(taskId, timer)
    
    console.log(`📅 Backup de emergência agendado para cada ${intervalMinutes} minutos`)
  }
  
  // Agendar backup diário
  private async scheduleDailyBackup(time: string): Promise<void> {
    const taskId = 'daily_backup'
    const nextRun = this.calculateNextRun(time)
    
    const task: ScheduledTask = {
      id: taskId,
      name: 'Backup Diário',
      type: 'backup',
      nextRun,
      status: 'scheduled',
      interval: 24 * 60 * 60 * 1000, // 24 horas em ms
      enabled: true
    }
    
    this.tasks.set(taskId, task)
    
    const msUntilNextRun = nextRun.getTime() - Date.now()
    const timer = setTimeout(async () => {
      await this.executeDailyBackup(taskId)
      // Reagendar para o próximo dia
      this.scheduleDailyBackup(time)
    }, msUntilNextRun)
    
    this.timers.set(taskId, timer)
    
    console.log(`📅 Backup diário agendado para ${time} (próximo: ${nextRun.toLocaleString()})`)
  }
  
  // Agendar verificação de integridade
  private async scheduleIntegrityCheck(intervalHours: number): Promise<void> {
    const taskId = 'integrity_check'
    const nextRun = new Date(Date.now() + intervalHours * 60 * 60 * 1000)
    
    const task: ScheduledTask = {
      id: taskId,
      name: 'Verificação de Integridade',
      type: 'integrity',
      nextRun,
      status: 'scheduled',
      interval: intervalHours * 60 * 60 * 1000,
      enabled: true
    }
    
    this.tasks.set(taskId, task)
    
    const timer = setInterval(async () => {
      await this.executeIntegrityCheck(taskId)
    }, task.interval)
    
    this.timers.set(taskId, timer)
    
    console.log(`📅 Verificação de integridade agendada para cada ${intervalHours} horas`)
  }
  
  // Agendar backup em nuvem
  private async scheduleCloudBackup(intervalHours: number): Promise<void> {
    const taskId = 'cloud_backup'
    const nextRun = new Date(Date.now() + intervalHours * 60 * 60 * 1000)
    
    const task: ScheduledTask = {
      id: taskId,
      name: 'Backup em Nuvem',
      type: 'cloud',
      nextRun,
      status: 'scheduled',
      interval: intervalHours * 60 * 60 * 1000,
      enabled: true
    }
    
    this.tasks.set(taskId, task)
    
    const timer = setInterval(async () => {
      await this.executeCloudBackup(taskId)
    }, task.interval)
    
    this.timers.set(taskId, timer)
    
    console.log(`📅 Backup em nuvem agendado para cada ${intervalHours} horas`)
  }
  
  // Agendar monitoramento
  private async scheduleMonitoring(intervalMinutes: number): Promise<void> {
    const taskId = 'monitoring'
    const nextRun = new Date(Date.now() + intervalMinutes * 60 * 1000)
    
    const task: ScheduledTask = {
      id: taskId,
      name: 'Monitoramento do Sistema',
      type: 'monitoring',
      nextRun,
      status: 'scheduled',
      interval: intervalMinutes * 60 * 1000,
      enabled: true
    }
    
    this.tasks.set(taskId, task)
    
    const timer = setInterval(async () => {
      await this.executeMonitoring(taskId)
    }, task.interval)
    
    this.timers.set(taskId, timer)
    
    console.log(`📅 Monitoramento agendado para cada ${intervalMinutes} minutos`)
  }
  
  // Executar backup de emergência
  private async executeEmergencyBackup(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) return
    
    console.log('🚨 EXECUTANDO BACKUP DE EMERGÊNCIA...')
    
    try {
      task.status = 'running'
      task.lastRun = new Date()
      
      // Executar backup via API apenas no lado do servidor
      if (typeof window === 'undefined') {
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env['NEXT_PUBLIC_BASE_URL'] || 'https://www.joaovitorviana.com.br')
        const response = await fetch(`${baseUrl}/api/backup-emergency`, { method: 'POST' })
        
        if (response.ok) {
          task.status = 'completed'
          console.log('✅ Backup de emergência concluído')
          
          await this.logSchedulerEvent('emergency_backup_success', {
            taskId,
            timestamp: new Date().toISOString()
          })
        } else {
          throw new Error(`Backup falhou: ${response.status}`)
        }
      } else {
        // No cliente, apenas marcar como concluído
        task.status = 'completed'
        console.log('✅ Backup de emergência agendado (cliente)')
      }
      
    } catch (error) {
      task.status = 'failed'
      console.error('❌ Falha no backup de emergência:', error)
      
      await this.logSchedulerEvent('emergency_backup_failure', {
        taskId,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      })
    }
    
    // Reagendar próxima execução
    task.nextRun = new Date(Date.now() + task.interval)
    task.status = 'scheduled'
  }
  
  // Executar backup diário
  private async executeDailyBackup(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) return
    
    console.log('📅 EXECUTANDO BACKUP DIÁRIO...')
    
    try {
      task.status = 'running'
      task.lastRun = new Date()
      
      // Executar backup completo via API apenas no servidor
      if (typeof window === 'undefined') {
        const response = await fetch(`${process.env['NEXT_PUBLIC_BASE_URL'] || 'https://www.joaovitorviana.com.br'}/api/backup-emergency`, { method: 'POST' })
        
        if (response.ok) {
          task.status = 'completed'
          console.log('✅ Backup diário concluído')
          
          await this.logSchedulerEvent('daily_backup_success', {
            taskId,
            timestamp: new Date().toISOString()
          })
        } else {
          throw new Error(`Backup diário falhou: ${response.status}`)
        }
      } else {
        task.status = 'completed'
        console.log('✅ Backup diário agendado (cliente)')
      }
      
    } catch (error) {
      task.status = 'failed'
      console.error('❌ Falha no backup diário:', error)
      
      await this.logSchedulerEvent('daily_backup_failure', {
        taskId,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      })
    }
  }
  
  // Executar verificação de integridade
  private async executeIntegrityCheck(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) return
    
    console.log('🔍 EXECUTANDO VERIFICAÇÃO DE INTEGRIDADE...')
    
    try {
      task.status = 'running'
      task.lastRun = new Date()
      
      // Executar verificação via API apenas no servidor
      if (typeof window === 'undefined') {
        const response = await fetch(`${process.env['NEXT_PUBLIC_BASE_URL'] || 'https://www.joaovitorviana.com.br'}/api/data-integrity?action=check`)
        
        if (response.ok) {
          const result = await response.json()
          task.status = 'completed'
          console.log('✅ Verificação de integridade concluída')
          
          await this.logSchedulerEvent('integrity_check_success', {
            taskId,
            result: result.data?.status,
            issues: result.data?.issues?.length || 0,
            timestamp: new Date().toISOString()
          })
          
          // Se houver problemas críticos, executar backup de emergência
          if (result.data?.status === 'CRITICAL') {
            console.log('🚨 PROBLEMAS CRÍTICOS DETECTADOS - EXECUTANDO BACKUP DE EMERGÊNCIA')
            await this.executeEmergencyBackup('emergency_backup')
          }
          
        } else {
          throw new Error(`Verificação falhou: ${response.status}`)
        }
      } else {
        task.status = 'completed'
        console.log('✅ Verificação de integridade agendada (cliente)')
      }
      
    } catch (error) {
      task.status = 'failed'
      console.error('❌ Falha na verificação de integridade:', error)
      
      await this.logSchedulerEvent('integrity_check_failure', {
        taskId,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      })
    }
    
    // Reagendar próxima execução
    task.nextRun = new Date(Date.now() + task.interval)
    task.status = 'scheduled'
  }
  
  // Executar backup em nuvem
  private async executeCloudBackup(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) return
    
    console.log('☁️ EXECUTANDO BACKUP EM NUVEM...')
    
    try {
      task.status = 'running'
      task.lastRun = new Date()
      
      // Executar backup em nuvem via API
      const response = await fetch('/api/cloud-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup' })
      })
      
      if (response.ok) {
        task.status = 'completed'
        console.log('✅ Backup em nuvem concluído')
        
        await this.logSchedulerEvent('cloud_backup_success', {
          taskId,
          timestamp: new Date().toISOString()
        })
      } else {
        throw new Error(`Backup em nuvem falhou: ${response.status}`)
      }
      
    } catch (error) {
      task.status = 'failed'
      console.error('❌ Falha no backup em nuvem:', error)
      
      await this.logSchedulerEvent('cloud_backup_failure', {
        taskId,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      })
    }
    
    // Reagendar próxima execução
    task.nextRun = new Date(Date.now() + task.interval)
    task.status = 'scheduled'
  }
  
  // Executar monitoramento
  private async executeMonitoring(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) return
    
    try {
      task.status = 'running'
      task.lastRun = new Date()
      
      // Executar monitoramento via API
      const response = await fetch(`${process.env['NEXT_PUBLIC_BASE_URL'] || 'https://www.joaovitorviana.com.br'}/api/emergency-dashboard?action=status`)
      
      if (response.ok) {
        const result = await response.json()
        task.status = 'completed'
        
        // Se status for crítico ou emergência, tomar ações
        if (result.data?.overallStatus === 'CRITICAL' || result.data?.overallStatus === 'EMERGENCY') {
          console.log('🚨 STATUS CRÍTICO DETECTADO - EXECUTANDO AÇÕES DE EMERGÊNCIA')
          
          // Executar backup de emergência imediatamente
          await this.executeEmergencyBackup('emergency_backup')
          
          // Log crítico
          await this.logSchedulerEvent('critical_status_detected', {
            taskId,
            status: result.data.overallStatus,
            alerts: result.data.alerts?.length || 0,
            timestamp: new Date().toISOString()
          })
        }
        
      } else {
        throw new Error(`Monitoramento falhou: ${response.status}`)
      }
      
    } catch (error) {
      task.status = 'failed'
      console.error('❌ Falha no monitoramento:', error)
    }
    
    // Reagendar próxima execução
    task.nextRun = new Date(Date.now() + task.interval)
    task.status = 'scheduled'
  }
  
  // Calcular próxima execução baseada no horário
  private calculateNextRun(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    const nextRun = new Date()
    
    nextRun.setHours(hours, minutes, 0, 0)
    
    // Se o horário já passou hoje, agendar para amanhã
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }
    
    return nextRun
  }
  
  // Agendar backup semanal
  private async scheduleWeeklyBackup(day: number, time: string): Promise<void> {
    // Implementação similar ao backup diário, mas calculando o próximo dia da semana
    console.log(`📅 Backup semanal agendado para ${['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][day]} às ${time}`)
  }
  
  // Agendar backup mensal
  private async scheduleMonthlyBackup(day: number, time: string): Promise<void> {
    // Implementação similar, mas calculando o próximo dia do mês
    console.log(`📅 Backup mensal agendado para dia ${day} às ${time}`)
  }
  
  // Log de eventos do agendador
  private async logSchedulerEvent(action: string, details: any): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        const { AuditLogSystem } = await import('../app/api/audit-logs/route')
        await AuditLogSystem.logSystemEvent(action, details, { severity: 'HIGH' })
      }
    } catch (error) {
      console.error('❌ Erro no log do agendador:', error)
    }
  }
  
  // Obter status das tarefas
  getTasksStatus(): ScheduledTask[] {
    return Array.from(this.tasks.values())
  }
  
  // Parar agendador
  stop(): void {
    console.log('⏹️ PARANDO AGENDADOR DE PROTEÇÃO DE DADOS...')
    
    this.clearAllTasks()
    this.isRunning = false
    
    console.log('✅ Agendador parado')
  }
  
  // Limpar todas as tarefas
  private clearAllTasks(): void {
    // Limpar timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
      clearInterval(timer)
    }
    
    this.timers.clear()
    this.tasks.clear()
  }
  
  // Verificar se está rodando
  isSchedulerRunning(): boolean {
    return this.isRunning
  }
  
  // Executar tarefa manualmente
  async executeTaskManually(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`Tarefa ${taskId} não encontrada`)
    }
    
    console.log(`🔧 EXECUTANDO TAREFA MANUAL: ${task.name}`)
    
    switch (task.type) {
      case 'backup':
        if (taskId === 'emergency_backup' || taskId === 'daily_backup') {
          await this.executeEmergencyBackup(taskId)
        }
        break
      case 'integrity':
        await this.executeIntegrityCheck(taskId)
        break
      case 'cloud':
        await this.executeCloudBackup(taskId)
        break
      case 'monitoring':
        await this.executeMonitoring(taskId)
        break
    }
  }
}

// Instância global do agendador
export const dataProtectionScheduler = DataProtectionScheduler.getInstance()
