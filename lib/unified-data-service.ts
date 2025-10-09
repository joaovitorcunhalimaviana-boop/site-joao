// Serviço Unificado de Dados
// DEPRECATED: Este arquivo foi migrado para Prisma. Use lib/unified-data-service-prisma.ts
// Mantido apenas para compatibilidade durante a transição

import * as fs from 'fs'
import * as path from 'path'
import { 
  getAllPatients as getAllPatientsFromPrisma,
  createOrUpdatePatient as createOrUpdatePatientInPrisma,
  getPatientById as getPatientByIdFromPrisma
} from './unified-data-service-prisma'

// Interfaces unificadas - DEPRECATED: Use as interfaces do Prisma
export interface UnifiedPatient {
  id: string
  name: string
  cpf?: string
  medicalRecordNumber?: number
  phone: string
  whatsapp: string
  email?: string
  birthDate?: string
  insurance: {
    type: 'unimed' | 'particular' | 'outro'
    plan?: string
  }
  registrationSources: string[]
  emailPreferences: {
    healthTips: boolean
    appointments: boolean
    promotions: boolean
    subscribed: boolean
    subscribedAt?: string
    newsletter?: boolean // Newsletter subscription preference
  }
  birthdayEmailLogs?: Array<{
    sentAt: string
    year: number
  }>
  createdAt: string
  updatedAt: string
}

export interface UnifiedAppointment {
  id: string
  patientId: string
  patientName: string
  patientCpf?: string
  patientMedicalRecordNumber?: number
  patientPhone: string
  patientWhatsapp: string
  patientEmail?: string
  patientBirthDate?: string
  insuranceType: 'unimed' | 'particular' | 'outro'
  insurancePlan?: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: 'consulta' | 'retorno' | 'urgencia' | 'teleconsulta' | 'visita_domiciliar'
  status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'reagendada'
  source: 'public_appointment' | 'doctor_area' | 'secretary_area'
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// Caminhos dos arquivos - removidos, sistema migrado para Prisma
// const DATA_DIR = path.join(process.cwd(), 'data')
// const UNIFIED_PATIENTS_FILE = path.join(DATA_DIR, 'unified-patients.json')
// const UNIFIED_APPOINTMENTS_FILE = path.join(DATA_DIR, 'unified-appointments.json')

// Funções auxiliares para leitura/escrita de arquivos - removidas, sistema migrado para Prisma
// function readJsonFile<T>(filePath: string, defaultValue: T): T {
//   try {
//     if (fs.existsSync(filePath)) {
//       const data = fs.readFileSync(filePath, 'utf8')
//       return JSON.parse(data)
//     }
//   } catch (error) {
//     console.error(`Erro ao ler arquivo ${filePath}:`, error)
//   }
//   return defaultValue
// }

// function writeJsonFile<T>(filePath: string, data: T): void {
//   try {
//     // Garantir que o diretório existe
//     const dir = path.dirname(filePath)
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true })
//     }
//     
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
//   } catch (error) {
//     console.error(`Erro ao escrever arquivo ${filePath}:`, error)
//     throw error
//   }
// }

// DEPRECATED: Funções para pacientes - Use as funções do Prisma
export async function getAllPatients(): Promise<UnifiedPatient[]> {
  console.warn('DEPRECATED: getAllPatients from unified-data-service.ts. Use getAllPatients from unified-data-service-prisma.ts')
  return await getAllPatientsFromPrisma()
}

export async function saveAllPatients(patients: UnifiedPatient[]): Promise<void> {
  console.warn('DEPRECATED: saveAllPatients from unified-data-service.ts. Use individual createOrUpdatePatient calls with Prisma')
  // Não implementado - use createOrUpdatePatient individualmente
  throw new Error('saveAllPatients is deprecated. Use createOrUpdatePatient for individual patients.')
}

export async function getPatientById(id: string): Promise<UnifiedPatient | null> {
  console.warn('DEPRECATED: getPatientById from unified-data-service.ts. Use getPatientById from unified-data-service-prisma.ts')
  return await getPatientByIdFromPrisma(id)
}

export async function createOrUpdatePatient(patientData: Partial<UnifiedPatient> & { 
  name: string
  phone: string
  whatsapp: string
}): Promise<UnifiedPatient> {
  console.warn('DEPRECATED: createOrUpdatePatient from unified-data-service.ts. Use createOrUpdatePatient from unified-data-service-prisma.ts')
  return await createOrUpdatePatientInPrisma(patientData)
}

// Funções para agendamentos - removidas, sistema migrado para Prisma
// export function getAllAppointments(): UnifiedAppointment[] {
//   return readJsonFile<UnifiedAppointment[]>(UNIFIED_APPOINTMENTS_FILE, [])
// }

// export function saveAllAppointments(appointments: UnifiedAppointment[]): void {
//   writeJsonFile(UNIFIED_APPOINTMENTS_FILE, appointments)
// }

// DEPRECATED: Funções para agendamentos - Use as funções do Prisma
export function getAppointmentById(id: string): UnifiedAppointment | null {
  console.warn('DEPRECATED: getAppointmentById from unified-data-service.ts. Use Prisma appointment functions')
  throw new Error('getAppointmentById is deprecated. Use Prisma appointment functions.')
}

export function createAppointment(appointmentData: Omit<UnifiedAppointment, 'id' | 'createdAt' | 'updatedAt'>): UnifiedAppointment {
  console.warn('DEPRECATED: createAppointment from unified-data-service.ts. Use Prisma appointment functions')
  throw new Error('createAppointment is deprecated. Use Prisma appointment functions.')
}

export function updateAppointment(id: string, updates: Partial<UnifiedAppointment>): UnifiedAppointment | null {
  console.warn('DEPRECATED: updateAppointment from unified-data-service.ts. Use Prisma appointment functions')
  throw new Error('updateAppointment is deprecated. Use Prisma appointment functions.')
}

// DEPRECATED: Função de migração - Use as funções do Prisma
export async function migrateOldData(): Promise<void> {
  console.warn('DEPRECATED: migrateOldData from unified-data-service.ts. Use migrateOldData from unified-data-service-prisma.ts')
  // Redirecionamento para a função Prisma seria implementado aqui
  throw new Error('migrateOldData is deprecated. Use migrateOldData from unified-data-service-prisma.ts')
}

// DEPRECATED: Função para limpar arquivos antigos após migração
export function cleanupOldFiles(): void {
  console.warn('DEPRECATED: cleanupOldFiles from unified-data-service.ts. Use cleanupOldFiles from unified-data-service-prisma.ts')
  // Redirecionamento para a função Prisma seria implementado aqui
  throw new Error('cleanupOldFiles is deprecated. Use cleanupOldFiles from unified-data-service-prisma.ts')
}

// Newsletter data management functions - removidas, sistema migrado para Prisma
// export function readNewslettersData(): any[] {
//   const newsletterPath = path.join(DATA_DIR, 'newsletters.json')
//   return readJsonFile<any[]>(newsletterPath, [])
// }

// export function saveNewslettersData(newsletters: any[]): void {
//   const newsletterPath = path.join(DATA_DIR, 'newsletters.json')
//   writeJsonFile(newsletterPath, newsletters)
// }