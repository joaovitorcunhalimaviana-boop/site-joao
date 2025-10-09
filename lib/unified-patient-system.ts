// Sistema Unificado de Pacientes e Comunicação
// DEPRECATED: This file has been replaced by unified-patient-system-prisma.ts
// All functionality has been migrated to use PostgreSQL with Prisma ORM

// ==================== MIGRATION NOTICE ====================
// This file has been deprecated in favor of unified-patient-system-prisma.ts
// All functionality has been migrated to use PostgreSQL with Prisma ORM
// Please use the Prisma version for all new development

console.warn('unified-patient-system.ts is deprecated. Use unified-patient-system-prisma.ts instead.')

// Export empty functions for compatibility
export function getDailyAgendaWithSurgeries(date: string): Promise<{
  appointments: any[]
  surgeries: any[]
  totalItems: number
}> {
  console.warn('unified-patient-system.ts is deprecated. Use unified-patient-system-prisma.ts instead.')
  return Promise.resolve({
    appointments: [],
    surgeries: [],
    totalItems: 0
  })
}

export function getAllCommunicationContacts(): any[] {
  console.warn('unified-patient-system.ts is deprecated. Use unified-patient-system-prisma.ts instead.')
  return []
}

export function getAllMedicalPatients(): any[] {
  console.warn('unified-patient-system.ts is deprecated. Use unified-patient-system-prisma.ts instead.')
  return []
}

export function getAllAppointments(): any[] {
  console.warn('unified-patient-system.ts is deprecated. Use unified-patient-system-prisma.ts instead.')
  return []
}

export function getAllSurgeries(): any[] {
  console.warn('unified-patient-system.ts is deprecated. Use unified-patient-system-prisma.ts instead.')
  return []
}

export function getAllMedicalRecords(): any[] {
  console.warn('unified-patient-system.ts is deprecated. Use unified-patient-system-prisma.ts instead.')
  return []
}

// Export stub functions for compatibility with existing code
export function getMedicalPatientById(id: string): any {
  console.warn('getMedicalPatientById: Use unified-patient-system-prisma.ts instead.')
  return null
}

export function createMedicalPatient(data: any): { success: boolean; patient?: any; message: string } {
  console.warn('createMedicalPatient: Use unified-patient-system-prisma.ts instead.')
  return { success: false, message: 'Deprecated function' }
}

export function getCommunicationContactById(id: string): any {
  console.warn('getCommunicationContactById: Use unified-patient-system-prisma.ts instead.')
  return null
}

export function createOrUpdateCommunicationContact(data: any): { success: boolean; contact?: any; message: string } {
  console.warn('createOrUpdateCommunicationContact: Use unified-patient-system-prisma.ts instead.')
  return { success: false, message: 'Deprecated function' }
}

export function createAppointment(data: any): { success: boolean; appointment?: any; message: string } {
  console.warn('createAppointment: Use unified-patient-system-prisma.ts instead.')
  return { success: false, message: 'Deprecated function' }
}

export function getCommunicationContactByEmail(email: string): any {
  console.warn('getCommunicationContactByEmail: Use unified-patient-system-prisma.ts instead.')
  return null
}

export function getMedicalPatientByCpf(cpf: string): any {
  console.warn('getMedicalPatientByCpf: Use unified-patient-system-prisma.ts instead.')
  return null
}

// All other functions have been removed - use unified-patient-system-prisma.ts instead



