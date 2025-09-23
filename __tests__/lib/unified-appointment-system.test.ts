import {
  createOrUpdatePatient,
  getAllPatients,
  getNextMedicalRecordNumber,
  validateCPF,
  formatCPF,
} from '@/lib/unified-appointment-system'
import { getBrasiliaTimestamp } from '@/lib/date-utils'
import type { Patient } from '@/lib/unified-appointment-system'

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('Unified Appointment System - Patient Management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('[]')
  })

  describe('createOrUpdatePatient', () => {
    const validPatientData = {
      name: 'João Silva',
      cpf: '12345678901',
      phone: '11987654321',
      whatsapp: '11987654321',
      email: 'joao@email.com',
      birthDate: '1990-01-01',
      medicalRecordNumber: 1,
      address: {
        street: 'Rua das Flores, 123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
      },
      insurance: {
        type: 'unimed' as const,
        plan: 'Unimed Nacional',
        cardNumber: '123456789',
      },
      emergencyContact: {
        name: 'Maria Silva',
        relationship: 'Esposa',
        phone: '11987654322',
      },
    }

    it('should create a new patient successfully', async () => {
      const result = await createOrUpdatePatient(validPatientData)

      expect(result.success).toBe(true)
      expect(result.patient).toBeDefined()
      expect(result.patient?.name).toBe('João Silva')
      expect(result.patient?.cpf).toBe('12345678901')
      expect(result.patient?.medicalRecordNumber).toBe(1)
    })

    it('should update existing patient by CPF', async () => {
      // Simular paciente existente
      const existingPatients = [
        {
          id: 'pat_123',
          name: 'João Santos',
          cpf: '12345678901',
          phone: '11999999999',
          whatsapp: '11999999999',
          email: 'joao.old@email.com',
          medicalRecordNumber: 1,
          createdAt: '2024-01-01T10:00:00.000Z',
          updatedAt: '2024-01-01T10:00:00.000Z',
          address: validPatientData.address,
          insurance: validPatientData.insurance,
          emergencyContact: validPatientData.emergencyContact,
        },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingPatients))

      const result = await createOrUpdatePatient({
        ...validPatientData,
        name: 'João Silva Santos', // Nome atualizado
      })

      expect(result.success).toBe(true)
      expect(result.patient?.name).toBe('João Silva Santos')
      expect(result.patient?.medicalRecordNumber).toBe(1) // Mantém o número existente
      expect(result.patient?.id).toBe('pat_123') // Mantém o ID existente
    })

    it('should reject invalid CPF', async () => {
      const invalidPatientData = {
        ...validPatientData,
        cpf: '12345678900', // CPF inválido
      }

      const result = await createOrUpdatePatient(invalidPatientData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('CPF inválido')
    })

    it('should handle missing required fields', async () => {
      const incompletePatientData = {
        name: 'João Silva',
        cpf: '12345678901',
        // Faltando campos obrigatórios
      } as any

      const result = await createOrUpdatePatient(incompletePatientData)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getNextMedicalRecordNumber', () => {
    it('should return 1 for first patient', async () => {
      const nextNumber = await getNextMedicalRecordNumber()
      expect(nextNumber).toBe(1)
    })

    it('should return next sequential number', async () => {
      const existingPatients = [
        { medicalRecordNumber: 1 },
        { medicalRecordNumber: 3 },
        { medicalRecordNumber: 2 },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingPatients))

      const nextNumber = await getNextMedicalRecordNumber()
      expect(nextNumber).toBe(4)
    })

    it('should handle patients without medical record numbers', async () => {
      const existingPatients = [
        { medicalRecordNumber: 1 },
        { medicalRecordNumber: null },
        { medicalRecordNumber: 2 },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingPatients))

      const nextNumber = await getNextMedicalRecordNumber()
      expect(nextNumber).toBe(3)
    })
  })

  describe('getAllPatients', () => {
    it('should return empty array when no patients exist', async () => {
      const patients = await getAllPatients()
      expect(patients).toEqual([])
    })

    it('should return all patients from localStorage', async () => {
      const mockPatients = [
        { id: 'pat_1', name: 'João Silva', cpf: '12345678901' },
        { id: 'pat_2', name: 'Maria Santos', cpf: '98765432100' },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockPatients))

      const patients = await getAllPatients()
      expect(patients).toHaveLength(2)
      expect(patients[0].name).toBe('João Silva')
      expect(patients[1].name).toBe('Maria Santos')
    })

    it('should handle corrupted localStorage data', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const patients = await getAllPatients()
      expect(patients).toEqual([])
    })
  })
})

describe('Unified Appointment System - Validation Utils', () => {
  describe('validateCPF', () => {
    it('should validate correct CPF', () => {
      expect(validateCPF('11144477735')).toBe(true)
      expect(validateCPF('12345678909')).toBe(true)
    })

    it('should reject invalid CPF', () => {
      expect(validateCPF('12345678900')).toBe(false)
      expect(validateCPF('00000000000')).toBe(false)
      expect(validateCPF('11111111111')).toBe(false)
    })

    it('should reject CPF with wrong length', () => {
      expect(validateCPF('123456789')).toBe(false)
      expect(validateCPF('123456789012')).toBe(false)
    })

    it('should reject non-numeric CPF', () => {
      expect(validateCPF('abcdefghijk')).toBe(false)
      expect(validateCPF('123.456.789-00')).toBe(false)
    })

    it('should handle empty or null values', () => {
      expect(validateCPF('')).toBe(false)
      expect(validateCPF(null as any)).toBe(false)
      expect(validateCPF(undefined as any)).toBe(false)
    })
  })

  describe('formatCPF', () => {
    it('should format CPF correctly', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01')
      expect(formatCPF('11144477735')).toBe('111.444.777-35')
    })

    it('should handle already formatted CPF', () => {
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01')
    })

    it('should handle invalid input', () => {
      expect(formatCPF('123')).toBe('123')
      expect(formatCPF('')).toBe('')
    })
  })
})

describe('Unified Appointment System - Date Utils', () => {
  describe('getBrasiliaTimestamp', () => {
    it('should return a valid ISO timestamp', () => {
      const timestamp = getBrasiliaTimestamp()
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('should return current time', () => {
      const before = Date.now()
      const timestamp = getBrasiliaTimestamp()
      const after = Date.now()

      const timestampMs = new Date(timestamp).getTime()
      expect(timestampMs).toBeGreaterThanOrEqual(before)
      expect(timestampMs).toBeLessThanOrEqual(after)
    })
  })
})

// Testes de integração
describe('Unified Appointment System - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('[]')
  })

  it('should create multiple patients with sequential medical record numbers', async () => {
    const patient1Data = {
      name: 'João Silva',
      cpf: '12345678901',
      phone: '11987654321',
      whatsapp: '11987654321',
      email: 'joao@email.com',
      birthDate: '1990-01-01',
      medicalRecordNumber: 1,
      address: {
        street: 'Rua A, 123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
      },
      insurance: {
        type: 'unimed' as const,
        plan: 'Unimed Nacional',
      },
      emergencyContact: {
        name: 'Maria Silva',
        relationship: 'Esposa',
        phone: '11987654322',
      },
    }

    const patient2Data = {
      ...patient1Data,
      name: 'Maria Santos',
      cpf: '98765432100',
      email: 'maria@email.com',
      medicalRecordNumber: 2,
    }

    // Simular criação sequencial
    let storedPatients: Patient[] = []
    mockLocalStorage.setItem.mockImplementation((key, value) => {
      if (key === 'unified_patients') {
        storedPatients = JSON.parse(value)
      }
    })
    mockLocalStorage.getItem.mockImplementation(key => {
      if (key === 'unified_patients') {
        return JSON.stringify(storedPatients)
      }
      return '[]'
    })

    const result1 = await createOrUpdatePatient(patient1Data)
    const result2 = await createOrUpdatePatient(patient2Data)

    expect(result1.success).toBe(true)
    expect(result2.success).toBe(true)
    expect(result1.patient?.medicalRecordNumber).toBe(1)
    expect(result2.patient?.medicalRecordNumber).toBe(2)
  })

  it('should handle concurrent patient creation', async () => {
    const patientData = {
      name: 'João Silva',
      cpf: '12345678901',
      phone: '11987654321',
      whatsapp: '11987654321',
      email: 'joao@email.com',
      birthDate: '1990-01-01',
      medicalRecordNumber: 1,
      address: {
        street: 'Rua A, 123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
      },
      insurance: {
        type: 'unimed' as const,
        plan: 'Unimed Nacional',
      },
      emergencyContact: {
        name: 'Maria Silva',
        relationship: 'Esposa',
        phone: '11987654322',
      },
    }

    // Simular múltiplas tentativas de criação do mesmo paciente
    const promises = Array(3)
      .fill(null)
      .map(() => createOrUpdatePatient(patientData))
    const results = await Promise.all(promises)

    // Todos devem ser bem-sucedidos
    results.forEach(result => {
      expect(result.success).toBe(true)
    })

    // Todos devem referenciar o mesmo paciente (mesmo CPF)
    const cpfs = results.map(r => r.patient?.cpf)
    expect(new Set(cpfs).size).toBe(1)
  })
})
