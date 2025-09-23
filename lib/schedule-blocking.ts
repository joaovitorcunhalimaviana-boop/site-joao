import { prisma } from './database'

// ================================
// SISTEMA DE BLOQUEIO DE HORÁRIOS
// ================================

export interface ScheduleBlock {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  blockType: 'VACATION' | 'CONFERENCE' | 'EMERGENCY' | 'PERSONAL' | 'MAINTENANCE' | 'OTHER'
  isAllDay: boolean
  startTime?: string // HH:MM format
  endTime?: string   // HH:MM format
  isRecurring: boolean
  recurringPattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  recurringEndDate?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface ScheduleBlockInput {
  title: string
  description?: string
  startDate: Date
  endDate: Date
  blockType: 'VACATION' | 'CONFERENCE' | 'EMERGENCY' | 'PERSONAL' | 'MAINTENANCE' | 'OTHER'
  isAllDay: boolean
  startTime?: string
  endTime?: string
  isRecurring?: boolean
  recurringPattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  recurringEndDate?: Date
  createdBy: string
}

export interface TimeSlotCheck {
  isBlocked: boolean
  blockingReasons: string[]
  blockedBy: ScheduleBlock[]
  availableSlots?: { start: string; end: string }[]
}

export class ScheduleBlockingService {
  /**
   * Criar um novo bloqueio de horário
   */
  static async createScheduleBlock(input: ScheduleBlockInput): Promise<{ success: boolean; block?: ScheduleBlock; error?: string }> {
    try {
      // Validar dados de entrada
      const validation = this.validateScheduleBlock(input)
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      // Verificar conflitos com bloqueios existentes
      const conflicts = await this.checkBlockConflicts(input.startDate, input.endDate, input.startTime, input.endTime)
      if (conflicts.hasConflicts && input.blockType !== 'EMERGENCY') {
        return { 
          success: false, 
          error: `Conflito com bloqueio existente: ${conflicts.conflictingBlocks.map(b => b.title).join(', ')}` 
        }
      }

      const newBlock = await prisma.scheduleBlock.create({
        data: {
          title: input.title,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          blockType: input.blockType,
          isAllDay: input.isAllDay,
          startTime: input.startTime,
          endTime: input.endTime,
          isRecurring: input.isRecurring || false,
          recurringPattern: input.recurringPattern,
          recurringEndDate: input.recurringEndDate,
          createdBy: input.createdBy,
          isActive: true
        }
      })

      // Se for recorrente, criar as ocorrências
      if (input.isRecurring && input.recurringPattern && input.recurringEndDate) {
        await this.createRecurringBlocks(newBlock.id, input)
      }

      return { success: true, block: newBlock as ScheduleBlock }
    } catch (error) {
      console.error('Erro ao criar bloqueio de horário:', error)
      return { success: false, error: 'Erro interno - tente novamente' }
    }
  }

  /**
   * Listar todos os bloqueios ativos
   */
  static async getActiveScheduleBlocks(userId: string): Promise<ScheduleBlock[]> {
    try {
      const blocks = await prisma.scheduleBlock.findMany({
        where: {
          createdBy: userId,
          isActive: true,
          endDate: {
            gte: new Date() // Apenas bloqueios que ainda não expiraram
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      })

      return blocks as ScheduleBlock[]
    } catch (error) {
      console.error('Erro ao buscar bloqueios:', error)
      return []
    }
  }

  /**
   * Verificar se um horário específico está bloqueado
   */
  static async checkTimeSlotAvailability(
    date: Date,
    startTime: string,
    endTime: string,
    userId: string
  ): Promise<TimeSlotCheck> {
    try {
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      // Buscar todos os bloqueios que podem afetar este horário
      const blocks = await prisma.scheduleBlock.findMany({
        where: {
          createdBy: userId,
          isActive: true,
          OR: [
            {
              // Bloqueios que começam ou terminam neste dia
              startDate: { lte: dayEnd },
              endDate: { gte: dayStart }
            },
            {
              // Bloqueios recorrentes que podem afetar este dia
              isRecurring: true,
              startDate: { lte: date },
              recurringEndDate: { gte: date }
            }
          ]
        }
      })

      const blockingReasons: string[] = []
      const blockedBy: ScheduleBlock[] = []

      for (const block of blocks) {
        const isBlocking = this.isTimeSlotBlocked(date, startTime, endTime, block as ScheduleBlock)
        
        if (isBlocking) {
          blockingReasons.push(this.getBlockingReason(block as ScheduleBlock))
          blockedBy.push(block as ScheduleBlock)
        }
      }

      return {
        isBlocked: blockedBy.length > 0,
        blockingReasons,
        blockedBy
      }
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      return {
        isBlocked: true,
        blockingReasons: ['Erro ao verificar disponibilidade'],
        blockedBy: []
      }
    }
  }

  /**
   * Obter horários disponíveis em um dia específico
   */
  static async getAvailableTimeSlots(
    date: Date,
    userId: string,
    slotDuration: number = 60, // minutos
    workingHours: { start: string; end: string } = { start: '08:00', end: '18:00' }
  ): Promise<{ start: string; end: string }[]> {
    try {
      const availableSlots: { start: string; end: string }[] = []
      
      // Gerar todos os slots possíveis do dia
      const [startHour, startMinute] = workingHours.start.split(':').map(Number)
      const [endHour, endMinute] = workingHours.end.split(':').map(Number)
      
      let currentTime = startHour * 60 + startMinute // em minutos
      const endTime = endHour * 60 + endMinute
      
      while (currentTime + slotDuration <= endTime) {
        const slotStart = this.minutesToTimeString(currentTime)
        const slotEnd = this.minutesToTimeString(currentTime + slotDuration)
        
        // Verificar se este slot está disponível
        const availability = await this.checkTimeSlotAvailability(date, slotStart, slotEnd, userId)
        
        if (!availability.isBlocked) {
          availableSlots.push({ start: slotStart, end: slotEnd })
        }
        
        currentTime += slotDuration
      }
      
      return availableSlots
    } catch (error) {
      console.error('Erro ao obter slots disponíveis:', error)
      return []
    }
  }

  /**
   * Atualizar um bloqueio existente
   */
  static async updateScheduleBlock(
    blockId: string,
    updates: Partial<ScheduleBlockInput>,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar se o bloqueio pertence ao usuário
      const existingBlock = await prisma.scheduleBlock.findFirst({
        where: {
          id: blockId,
          createdBy: userId
        }
      })

      if (!existingBlock) {
        return { success: false, error: 'Bloqueio não encontrado' }
      }

      await prisma.scheduleBlock.update({
        where: { id: blockId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar bloqueio:', error)
      return { success: false, error: 'Erro interno - tente novamente' }
    }
  }

  /**
   * Remover um bloqueio
   */
  static async removeScheduleBlock(
    blockId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await prisma.scheduleBlock.updateMany({
        where: {
          id: blockId,
          createdBy: userId
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      })

      if (result.count === 0) {
        return { success: false, error: 'Bloqueio não encontrado' }
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao remover bloqueio:', error)
      return { success: false, error: 'Erro interno - tente novamente' }
    }
  }

  /**
   * Criar bloqueio de emergência (prioridade máxima)
   */
  static async createEmergencyBlock(
    title: string,
    startDate: Date,
    endDate: Date,
    userId: string,
    description?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Bloqueios de emergência podem sobrescrever outros bloqueios
      await prisma.scheduleBlock.create({
        data: {
          title: `🚨 EMERGÊNCIA: ${title}`,
          description: description || 'Bloqueio de emergência criado automaticamente',
          startDate,
          endDate,
          blockType: 'EMERGENCY',
          isAllDay: true,
          isRecurring: false,
          createdBy: userId,
          isActive: true
        }
      })

      // Cancelar consultas existentes no período (se necessário)
      // Nota: O modelo Appointment não tem campo doctorId, removendo esta funcionalidade
      // Em um sistema real, seria necessário ajustar o modelo ou usar outro campo

      return { success: true }
    } catch (error) {
      console.error('Erro ao criar bloqueio de emergência:', error)
      return { success: false, error: 'Erro interno - tente novamente' }
    }
  }

  // ================================
  // MÉTODOS PRIVADOS
  // ================================

  private static validateScheduleBlock(input: ScheduleBlockInput): { isValid: boolean; error?: string } {
    if (!input.title || input.title.trim() === '') {
      return { isValid: false, error: 'Título é obrigatório' }
    }

    if (input.startDate >= input.endDate) {
      return { isValid: false, error: 'Data de início deve ser anterior à data de fim' }
    }

    if (!input.isAllDay && (!input.startTime || !input.endTime)) {
      return { isValid: false, error: 'Horários são obrigatórios quando não é dia inteiro' }
    }

    if (!input.isAllDay && input.startTime && input.endTime) {
      const start = this.timeStringToMinutes(input.startTime)
      const end = this.timeStringToMinutes(input.endTime)
      
      if (start >= end) {
        return { isValid: false, error: 'Horário de início deve ser anterior ao horário de fim' }
      }
    }

    if (input.isRecurring && !input.recurringPattern) {
      return { isValid: false, error: 'Padrão de recorrência é obrigatório para bloqueios recorrentes' }
    }

    if (input.isRecurring && !input.recurringEndDate) {
      return { isValid: false, error: 'Data de fim da recorrência é obrigatória' }
    }

    return { isValid: true }
  }

  private static async checkBlockConflicts(
    startDate: Date,
    endDate: Date,
    startTime?: string,
    endTime?: string
  ): Promise<{ hasConflicts: boolean; conflictingBlocks: ScheduleBlock[] }> {
    try {
      const conflicts = await prisma.scheduleBlock.findMany({
        where: {
          isActive: true,
          startDate: { lte: endDate },
          endDate: { gte: startDate }
        }
      })

      const conflictingBlocks: ScheduleBlock[] = []

      for (const block of conflicts) {
        // Se ambos são dia inteiro, há conflito
        if (block.isAllDay || (!startTime || !endTime)) {
          conflictingBlocks.push(block as ScheduleBlock)
          continue
        }

        // Verificar conflito de horários
        if (block.startTime && block.endTime && startTime && endTime) {
          const blockStart = this.timeStringToMinutes(block.startTime)
          const blockEnd = this.timeStringToMinutes(block.endTime)
          const newStart = this.timeStringToMinutes(startTime)
          const newEnd = this.timeStringToMinutes(endTime)

          if (!(newEnd <= blockStart || newStart >= blockEnd)) {
            conflictingBlocks.push(block as ScheduleBlock)
          }
        }
      }

      return {
        hasConflicts: conflictingBlocks.length > 0,
        conflictingBlocks
      }
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error)
      return { hasConflicts: false, conflictingBlocks: [] }
    }
  }

  private static async createRecurringBlocks(parentId: string, input: ScheduleBlockInput): Promise<void> {
    if (!input.recurringPattern || !input.recurringEndDate) return

    const occurrences: Date[] = []
    let currentDate = new Date(input.startDate)
    const endDate = new Date(input.recurringEndDate)

    while (currentDate <= endDate) {
      occurrences.push(new Date(currentDate))
      
      switch (input.recurringPattern) {
        case 'DAILY':
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
        case 'YEARLY':
          currentDate.setFullYear(currentDate.getFullYear() + 1)
          break
      }
    }

    // Criar as ocorrências (exceto a primeira que já foi criada)
    for (let i = 1; i < occurrences.length; i++) {
      const occurrenceStart = occurrences[i]
      const occurrenceEnd = new Date(occurrenceStart)
      occurrenceEnd.setDate(occurrenceEnd.getDate() + 
        Math.ceil((input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24))
      )

      await prisma.scheduleBlock.create({
        data: {
          title: `${input.title} (Recorrente)`,
          description: input.description,
          startDate: occurrenceStart,
          endDate: occurrenceEnd,
          blockType: input.blockType,
          isAllDay: input.isAllDay,
          startTime: input.startTime,
          endTime: input.endTime,
          isRecurring: false, // As ocorrências não são recorrentes
          createdBy: input.createdBy,
          isActive: true,
          parentBlockId: parentId
        }
      })
    }
  }

  private static isTimeSlotBlocked(date: Date, startTime: string, endTime: string, block: ScheduleBlock): boolean {
    // Verificar se a data está no período do bloqueio
    const blockStart = new Date(block.startDate)
    const blockEnd = new Date(block.endDate)
    
    blockStart.setHours(0, 0, 0, 0)
    blockEnd.setHours(23, 59, 59, 999)
    
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    if (checkDate < blockStart || checkDate > blockEnd) {
      return false
    }

    // Se é bloqueio de dia inteiro, bloqueia qualquer horário
    if (block.isAllDay) {
      return true
    }

    // Verificar conflito de horários
    if (block.startTime && block.endTime) {
      const blockStartMinutes = this.timeStringToMinutes(block.startTime)
      const blockEndMinutes = this.timeStringToMinutes(block.endTime)
      const slotStartMinutes = this.timeStringToMinutes(startTime)
      const slotEndMinutes = this.timeStringToMinutes(endTime)

      // Há conflito se os horários se sobrepõem
      return !(slotEndMinutes <= blockStartMinutes || slotStartMinutes >= blockEndMinutes)
    }

    return false
  }

  private static getBlockingReason(block: ScheduleBlock): string {
    const typeMap = {
      vacation: '🏖️ Férias',
      conference: '🎓 Congresso',
      emergency: '🚨 Emergência',
      personal: '👤 Pessoal',
      maintenance: '🔧 Manutenção',
      other: '📅 Bloqueio'
    }

    return `${typeMap[block.blockType]}: ${block.title}`
  }

  private static timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  private static minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  /**
   * Cancela consultas em um período específico
   * Nota: Funcionalidade removida pois o modelo Appointment não possui campo doctorId
   */
  private static async cancelAppointmentsInPeriod(
    startDate: Date,
    endDate: Date,
    userId: string,
    reason: string
  ): Promise<void> {
    // Funcionalidade removida - modelo Appointment não possui campo doctorId
    console.log('Cancelamento de consultas não implementado - campo doctorId não existe no modelo')
  }
}

export default ScheduleBlockingService