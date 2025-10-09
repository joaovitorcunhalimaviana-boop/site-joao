/**
 * Utilitários para padronização de data e horário no fuso horário de Brasília
 */

// Configuração do fuso horário de Brasília
const BRASILIA_TIMEZONE = 'America/Sao_Paulo'
const LOCALE_PT_BR = 'pt-BR'

/**
 * Obtém a data atual no fuso horário de Brasília
 */
export function getBrasiliaDate(): Date {
  const now = new Date()
  return new Date(now.toLocaleString('en-US', { timeZone: BRASILIA_TIMEZONE }))
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 */
export function formatDateToBrazilian(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(LOCALE_PT_BR, {
    timeZone: BRASILIA_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formata um horário para o formato brasileiro (HH:MM)
 */
export function formatTimeToBrazilian(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString(LOCALE_PT_BR, {
    timeZone: BRASILIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Formata data e horário completos para o formato brasileiro
 */
export function formatDateTimeToBrazilian(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString(LOCALE_PT_BR, {
    timeZone: BRASILIA_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Converte uma data para o formato ISO (YYYY-MM-DD) no fuso horário de Brasília
 */
export function formatDateToISO(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const brasiliaDate = new Date(
    dateObj.toLocaleString('en-US', { timeZone: BRASILIA_TIMEZONE })
  )
  return brasiliaDate.toISOString().split('T')[0]
}

/**
 * Obtém a data atual no formato ISO (YYYY-MM-DD) no fuso horário de Brasília
 */
export function getTodayISO(): string {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: BRASILIA_TIMEZONE,
  })
  return formatter.format(now)
}

/**
 * Converte data brasileira (DD/MM/YYYY) para formato ISO (YYYY-MM-DD)
 */
export function brazilianDateToISO(brazilianDate: string): string {
  const [day, month, year] = brazilianDate.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

/**
 * Converte data brasileira (DD/MM/YYYY) para formato ISO considerando fuso horário de Brasília
 * Esta função garante que a data seja interpretada corretamente no fuso horário local
 */
export function brazilianDateToISOBrasilia(brazilianDate: string): string {
  const [day, month, year] = brazilianDate.split('/')

  // Retornar diretamente no formato ISO sem conversão de fuso horário
  // Isso garante que 22/09/2025 sempre resulte em 2025-09-22
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

/**
 * Converte data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
 */
export function isoDateToBrazilian(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Verifica se uma data está no futuro (considerando fuso horário de Brasília)
 */
export function isDateInFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = getBrasiliaDate()
  return dateObj > now
}

/**
 * Calcula a idade baseada na data de nascimento (considerando fuso horário de Brasília)
 */
export function calculateAge(birthDate: Date | string): number {
  let birth: Date
  
  if (typeof birthDate === 'string') {
    // Se for string no formato brasileiro (DD/MM/YYYY), converte para Date
    if (birthDate.includes('/')) {
      const [day, month, year] = birthDate.split('/')
      birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    } else {
      birth = new Date(birthDate)
    }
  } else {
    birth = birthDate
  }
  
  const today = getBrasiliaDate()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Obtém o timestamp atual no fuso horário de Brasília
 */
export function getBrasiliaTimestamp(): string {
  return getBrasiliaDate().toISOString()
}

/**
 * Obtém o timestamp atual no formato ISO
 * Alias para getBrasiliaTimestamp para compatibilidade
 */
export function getTimestampISO(): string {
  return getBrasiliaTimestamp()
}

/**
 * Converte data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
 * Evita problemas de fuso horário ao não usar o construtor Date
 */
export function isoDateToBrazilianDisplay(isoDate: string): string {
  if (!isoDate || typeof isoDate !== 'string') return ''
  return isoDate.split('-').reverse().join('/')
}

/**
 * Formata uma data para exibição em relatórios (formato longo)
 */
export function formatDateForReport(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(LOCALE_PT_BR, {
    timeZone: BRASILIA_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
