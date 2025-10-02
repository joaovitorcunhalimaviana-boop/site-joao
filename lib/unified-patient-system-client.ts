// Versão client-safe do sistema unificado de pacientes
// Funções que podem ser usadas em componentes sem importar fs

import { UnifiedAppointment, Surgery } from './unified-patient-system-types'

// ==================== FUNÇÕES CLIENT-SAFE ====================

/**
 * Busca agenda diária com cirurgias via API
 * Versão client-safe que faz chamada para API ao invés de acessar arquivos diretamente
 */
export async function getDailyAgendaWithSurgeries(date: string): Promise<{
  appointments: UnifiedAppointment[]
  surgeries: Surgery[]
}> {
  try {
    const response = await fetch(`/api/daily-agenda?date=${date}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar agenda: ${response.statusText}`)
    }
    
    const data = await response.json()
    return {
      appointments: data.appointments || [],
      surgeries: data.surgeries || []
    }
  } catch (error) {
    console.error('Erro ao buscar agenda diária:', error)
    return {
      appointments: [],
      surgeries: []
    }
  }
}

/**
 * Deleta um agendamento via API
 * Versão client-safe que faz chamada para API
 */
export async function deleteAppointment(appointmentId: string): Promise<{
  success: boolean
  message: string
  error?: string
}> {
  try {
    const response = await fetch(`/api/unified-appointments/${appointmentId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        message: 'Erro ao deletar agendamento',
        error: errorData.error || response.statusText
      }
    }
    
    const data = await response.json()
    return {
      success: true,
      message: data.message || 'Agendamento deletado com sucesso'
    }
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error)
    return {
      success: false,
      message: 'Erro ao deletar agendamento',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}