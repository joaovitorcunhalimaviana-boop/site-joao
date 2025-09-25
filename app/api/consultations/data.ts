// Dados simulados de consultas
export interface Consultation {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

export let consultations: Consultation[] = []
