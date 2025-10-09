import {
  formatDateToBrazilian,
  formatTimeToBrazilian,
  formatDateTimeToBrazilian,
  formatDateToISO,
  getTodayISO,
  brazilianDateToISO,
  brazilianDateToISOBrasilia,
  isoDateToBrazilian,
  isDateInFuture,
  calculateAge,
  getBrasiliaTimestamp,
  isoDateToBrazilianDisplay,
  formatDateForReport,
  getTimestampISO,
} from '@/lib/date-utils'

describe('Date Utils', () => {
  // Mock da data atual para testes consistentes
  const mockDate = new Date('2024-01-15T10:30:00-03:00') // 15/01/2024 10:30 (horário de Brasília)

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('formatDateToBrazilian', () => {
    it('should format date to Brazilian format (DD/MM/YYYY)', () => {
      const date = new Date('2024-01-15T10:30:00-03:00')
      const result = formatDateToBrazilian(date)
      expect(result).toBe('15/01/2024')
    })

    it('should handle string input', () => {
      const result = formatDateToBrazilian('2024-01-15T03:00:00.000Z')
      expect(result).toBe('15/01/2024')
    })
  })

  describe('formatTimeToBrazilian', () => {
    it('should format time to Brazilian format (HH:MM)', () => {
      const date = new Date('2024-01-15T10:30:00-03:00')
      const result = formatTimeToBrazilian(date)
      expect(result).toBe('10:30')
    })

    it('should handle string input', () => {
      const result = formatTimeToBrazilian('2024-01-15T14:45:00-03:00')
      expect(result).toBe('14:45')
    })
  })

  describe('formatDateTimeToBrazilian', () => {
    it('should format date and time to Brazilian format', () => {
      const date = new Date('2024-01-15T10:30:00-03:00')
      const result = formatDateTimeToBrazilian(date)
      expect(result).toBe('15/01/2024, 10:30')
    })
  })

  describe('formatDateToISO', () => {
    it('should format date to ISO format (YYYY-MM-DD)', () => {
      const date = new Date('2024-01-15T10:30:00-03:00')
      const result = formatDateToISO(date)
      expect(result).toBe('2024-01-15')
    })
  })

  describe('getTodayISO', () => {
    it('should return today date in ISO format', () => {
      const result = getTodayISO()
      expect(result).toBe('2024-01-15')
    })
  })

  describe('brazilianDateToISO', () => {
    it('should convert Brazilian date to ISO format', () => {
      const result = brazilianDateToISO('15/01/2024')
      expect(result).toBe('2024-01-15')
    })

    it('should handle single digit days and months', () => {
      const result = brazilianDateToISO('5/1/2024')
      expect(result).toBe('2024-01-05')
    })
  })

  describe('isoDateToBrazilian', () => {
    it('should convert ISO date to Brazilian format', () => {
      const result = isoDateToBrazilian('2024-01-15')
      expect(result).toBe('15/01/2024')
    })
  })

  describe('isDateInFuture', () => {
    it('should return true for future dates', () => {
      const futureDate = '2024-01-16' // Um dia no futuro
      const result = isDateInFuture(futureDate)
      expect(result).toBe(true)
    })

    it('should return false for past dates', () => {
      const pastDate = '2024-01-14' // Um dia no passado
      const result = isDateInFuture(pastDate)
      expect(result).toBe(false)
    })

    it('should return false for today', () => {
      const today = '2024-01-15' // Hoje
      const result = isDateInFuture(today)
      expect(result).toBe(false)
    })
  })

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = '15/01/1990' // 34 anos na data mockada
      const result = calculateAge(birthDate)
      expect(result).toBe(34)
    })

    it('should handle birthday not yet reached this year', () => {
      const birthDate = '16/01/1990' // Aniversário ainda não chegou
      const result = calculateAge(birthDate)
      expect(result).toBe(33)
    })
  })

  describe('getBrasiliaTimestamp', () => {
    it('should return timestamp in Brasília timezone', () => {
      const result = getBrasiliaTimestamp()
      expect(typeof result).toBe('string')
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('getTimestampISO', () => {
    it('should be an alias for getBrasiliaTimestamp', () => {
      const brasiliaResult = getBrasiliaTimestamp()
      const isoResult = getTimestampISO()
      expect(isoResult).toBe(brasiliaResult)
    })
  })

  describe('isoDateToBrazilianDisplay', () => {
    it('should convert ISO date to Brazilian display format', () => {
      const result = isoDateToBrazilianDisplay('2024-01-15')
      expect(result).toBe('15/01/2024')
    })
  })

  describe('formatDateForReport', () => {
    it('should format date for reports in long format', () => {
      const date = new Date('2024-01-15T10:30:00-03:00')
      const result = formatDateForReport(date)
      expect(result).toMatch(/segunda-feira.*15.*janeiro.*2024/)
    })
  })

  describe('Timezone consistency', () => {
    it('should use Brasília timezone consistently', () => {
      const date = new Date('2024-01-15T23:30:00Z') // UTC
      const brazilianDate = formatDateToBrazilian(date)
      const brazilianTime = formatTimeToBrazilian(date)

      // Em Brasília (UTC-3), seria 20:30 do mesmo dia
      expect(brazilianDate).toBe('15/01/2024')
      expect(brazilianTime).toBe('20:30')
    })

    it('should handle daylight saving time correctly', () => {
      // Teste com data durante horário de verão (se aplicável)
      const summerDate = new Date('2024-12-15T23:30:00Z') // UTC
      const brazilianDate = formatDateToBrazilian(summerDate)
      const brazilianTime = formatTimeToBrazilian(summerDate)

      // Em Brasília, seria 20:30 do mesmo dia (UTC-3)
      expect(brazilianDate).toBe('15/12/2024')
      expect(brazilianTime).toBe('20:30')
    })
  })
})
