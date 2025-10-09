import { z } from 'zod'

// Schema para validação de pacientes
export const PatientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  phone: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Formato de Telefone inválido'),
  whatsapp: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Formato de WhatsApp inválido'),
  email: z.string().email('Email inválido').optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional(),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
    .optional(),
  insurance: z.object({
    type: z
      .enum(['unimed', 'particular', 'outro'])
      .refine(val => ['unimed', 'particular', 'outro'].includes(val), {
        message: 'Tipo de convênio inválido',
      }),
    plan: z.string().optional(),
  }),
  medicalRecord: z
    .object({
      allergies: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      conditions: z.array(z.string()).optional(),
      notes: z.string().optional(),
    })
    .optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

// Schema para validação de agendamentos
export const AppointmentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid('ID do paciente inválido'),
  patientName: z.string().min(2, 'Nome do paciente obrigatório'),
  patientPhone: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido'),
  patientWhatsapp: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'WhatsApp inválido'),
  patientEmail: z.string().email('Email inválido').optional(),
  patientBirthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento inválida')
    .optional(),
  insuranceType: z
    .enum(['unimed', 'particular', 'outro'])
    .refine(val => ['unimed', 'particular', 'outro'].includes(val), {
      message: 'Tipo de convênio inválido',
    }),
  insurancePlan: z.string().optional(),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data do agendamento inválida'),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Horário inválido (formato HH:MM)'),
  appointmentType: z
    .enum([
      'consultation',
      'retorno',
      'urgencia',
      'teleconsulta',
      'visita_domiciliar',
    ])
    .refine(
      val =>
        [
          'consultation',
          'retorno',
          'urgencia',
          'teleconsulta',
          'visita_domiciliar',
        ].includes(val),
      { message: 'Tipo de consulta inválido' }
    ),
  status: z
    .enum([
      'agendada',
      'confirmada',
      'em_andamento',
      'concluida',
      'cancelada',
      'reagendada',
    ])
    .refine(
      val =>
        [
          'agendada',
          'confirmada',
          'em_andamento',
          'concluida',
          'cancelada',
          'reagendada',
        ].includes(val),
      { message: 'Status inválido' }
    ),
  source: z
    .enum(['public_form', 'doctor_area', 'secretary_area'])
    .refine(
      val => ['public_form', 'doctor_area', 'secretary_area'].includes(val),
      { message: 'Origem do agendamento inválida' }
    ),
  notes: z.string().max(1000, 'Observações muito longas').optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  createdBy: z.string().uuid().optional(),
})

// Schema para validação de usuários (médicos/secretárias)
export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(50, 'Username muito longo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  role: z
    .enum(['doctor', 'secretary', 'admin'])
    .refine(val => ['doctor', 'secretary', 'admin'].includes(val), {
      message: 'Tipo de usuário inválido',
    }),
  name: z.string().min(2, 'Nome obrigatório'),
  crm: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

// Schema para login
export const LoginSchema = z.object({
  email: z.string().min(1, 'Email ou username obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
  rememberMe: z.boolean().optional(),
})

// Schema para registro de usuários
export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome muito longo'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirmação de senha obrigatória'),
    role: z
      .enum(['DOCTOR', 'SECRETARY', 'ADMIN'])
      .refine(val => ['DOCTOR', 'SECRETARY', 'ADMIN'].includes(val), {
        message: 'Tipo de usuário inválido',
      }),
    crm: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    phone: z
      .string()
      .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Formato de Telefone inválido')
      .optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

// Schema para newsletter
export const NewsletterSubscriberSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome obrigatório'),
  subscribed: z.boolean().default(true),
  subscribedAt: z.string().datetime().optional(),
  preferences: z.object({
    healthTips: z.boolean().default(true),
    appointments: z.boolean().default(true),
    promotions: z.boolean().default(false),
  }),
})

// Schema para calculadoras médicas
export const MedicalCalculatorSchema = z.object({
  calculatorType: z
    .enum([
      'cdai',
      'mayo',
      'wexner',
      'bristol',
      'pac-scores',
      'ibdq',
      'constipacao',
      'st-marks',
    ])
    .refine(
      val =>
        [
          'cdai',
          'mayo',
          'wexner',
          'bristol',
          'pac-scores',
          'ibdq',
          'constipacao',
          'st-marks',
        ].includes(val),
      { message: 'Tipo de calculadora inválido' }
    ),
  patientId: z.string().uuid().optional(),
  results: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  calculatedAt: z.string().datetime().optional(),
  notes: z.string().max(500, 'Observações muito longas').optional(),
})

// Schema para notificações
export const NotificationSchema = z.object({
  type: z
    .enum(['email', 'whatsapp', 'telegram'])
    .refine(val => ['email', 'whatsapp', 'telegram'].includes(val), {
      message: 'Tipo de notificação inválido',
    }),
  recipient: z.string().min(1, 'Destinatário obrigatório'),
  subject: z.string().min(1, 'Assunto obrigatório').optional(),
  message: z.string().min(1, 'Mensagem obrigatória'),
  appointmentId: z.string().uuid().optional(),
  scheduledFor: z.string().datetime().optional(),
})

// Tipos TypeScript derivados dos schemas
export type Patient = z.infer<typeof PatientSchema>
export type Appointment = z.infer<typeof AppointmentSchema>
export type User = z.infer<typeof UserSchema>
export type Login = z.infer<typeof LoginSchema>
export type NewsletterSubscriber = z.infer<typeof NewsletterSubscriberSchema>
export type MedicalCalculator = z.infer<typeof MedicalCalculatorSchema>
export type Notification = z.infer<typeof NotificationSchema>

// Função utilitária para validação
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    console.error('Validation error:', error)
    if (error instanceof z.ZodError) {
      try {
        const errors = error.issues.map(
          err => `${err.path.join('.')}: ${err.message}`
        ) || ['Erro de validação']
        return { success: false, errors }
      } catch (mapError) {
        console.error('Error mapping validation errors:', mapError)
        return { success: false, errors: ['Erro ao processar validação'] }
      }
    }
    return { success: false, errors: ['Erro de validação desconhecido'] }
  }
}

// Função para sanitização de strings
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>"'&]/g, match => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
    }
    return entities[match] || match
  })
}

// Função para validação de CPF
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/[^\d]/g, '')

  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }

  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0

  return remainder === parseInt(cleanCPF.charAt(10))
}

// Função para validação de telefone brasileiro
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, '')
  return /^\d{10,11}$/.test(cleanPhone)
}

// Função para formatação de telefone
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '')

  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`
  } else if (cleanPhone.length === 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`
  }

  return phone
}

// Função para formatação de CPF
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/[^\d]/g, '')

  if (cleanCPF.length === 11) {
    return `${cleanCPF.slice(0, 3)}.${cleanCPF.slice(3, 6)}.${cleanCPF.slice(6, 9)}-${cleanCPF.slice(9)}`
  }

  return cpf
}

