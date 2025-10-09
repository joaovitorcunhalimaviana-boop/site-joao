import {
  getAllMedicalPatients,
  getMedicalPatientById,
  createMedicalPatient,
  getAllCommunicationContacts,
  getCommunicationContactById,
  createOrUpdateCommunicationContact,
  getAllAppointments,
  createAppointment,
} from '../../lib/unified-patient-system'
import { validateCPF, formatCPF } from '../../lib/validation-schemas'
import { getBrasiliaTimestamp } from '../../lib/date-utils'

// Mock do sistema de arquivos
jest.mock('fs', () => ({
  existsSync: jest.fn(() => false), // Simular que os arquivos não existem inicialmente
  readFileSync: jest.fn(() => '[]'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}))

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}))

// Mock do process.cwd()
const mockCwd = jest.fn(() => '/mock/path')
Object.defineProperty(process, 'cwd', {
  value: mockCwd,
})

describe('Unified Patient System', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks()
  })

  describe('Communication Contacts', () => {
    test('should get all communication contacts', () => {
      const contacts = getAllCommunicationContacts()
      expect(Array.isArray(contacts)).toBe(true)
    })

    test('should create a new communication contact', () => {
      const contactData = {
        name: 'João Silva',
        email: 'joao@example.com',
        whatsapp: '11999999999',
        birthDate: '1990-01-01',
        source: 'public_appointment' as const,
      }

      const result = createOrUpdateCommunicationContact(contactData)
      expect(result.success).toBe(true)
      expect(result.contact.name).toBe('João Silva')
      expect(result.contact.email).toBe('joao@example.com')
    })
  })

  describe('Medical Patients', () => {
    test('should get all medical patients', () => {
      const patients = getAllMedicalPatients()
      expect(Array.isArray(patients)).toBe(true)
    })

    test('should create a medical patient', () => {
      // Primeiro criar um contato de comunicação
      const contactResult = createOrUpdateCommunicationContact({
        name: 'Maria Santos',
        email: 'maria@example.com',
        whatsapp: '11888888888',
        source: 'public_appointment' as const,
      })

      expect(contactResult.success).toBe(true)

      // Depois criar o paciente médico
      const patientData = {
        cpf: '12345678901',
        fullName: 'Maria Santos',
        communicationContactId: contactResult.contact.id,
      }

      const result = createMedicalPatient(patientData)

      // Log para debug
      if (!result.success) {
        console.log('Error creating medical patient:', result.message)
      }

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.patient.fullName).toBe('Maria Santos')
        expect(result.patient.cpf).toBe('12345678901')
      }
    })
  })

  describe('Appointments', () => {
    test('should get all appointments', () => {
      const appointments = getAllAppointments()
      expect(Array.isArray(appointments)).toBe(true)
    })

    test('should create an appointment', () => {
      // Primeiro criar um contato
      const contactResult = createOrUpdateCommunicationContact({
        name: 'Pedro Costa',
        email: 'pedro@example.com',
        whatsapp: '11777777777',
        source: 'public_appointment' as const,
      })

      expect(contactResult.success).toBe(true)

      // Criar agendamento
      const appointmentData = {
        communicationContactId: contactResult.contact.id,
        appointmentDate: '2024-02-15',
        appointmentTime: '14:00',
        appointmentType: 'consulta' as const,
        source: 'public_appointment' as const,
      }

      const result = createAppointment(appointmentData)

      // Log para debug
      if (!result.success) {
        console.log('Error creating appointment:', result.message)
      }

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.appointment.appointmentDate).toBe('2024-02-15')
        expect(result.appointment.appointmentTime).toBe('14:00')
      }
    })
  })

  describe('Utility Functions', () => {
    test('should validate CPF correctly', () => {
      expect(validateCPF('12345678901')).toBe(false) // CPF inválido
      expect(validateCPF('11111111111')).toBe(false) // CPF com todos os dígitos iguais
      expect(validateCPF('')).toBe(false) // CPF vazio
    })

    test('should format CPF correctly', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01')
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01')
      expect(formatCPF('')).toBe('')
    })

    test('should generate Brasilia timestamp', () => {
      const timestamp = getBrasiliaTimestamp()
      expect(typeof timestamp).toBe('string')
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })
})
