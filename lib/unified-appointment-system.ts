// Sistema Unificado de Agendamentos
// Integra agendamentos de pacientes, médicos e secretárias em uma agenda única
// Versão compatível com browser usando localStorage

import { getTodayISO, getBrasiliaTimestamp } from './date-utils'
import {
  sendTelegramAppointmentNotification,
  type AppointmentNotificationData,
} from './telegram-notifications'

// Interfaces principais
export interface UnifiedAppointment {
  id: string
  patientId: string
  patientName: string
  patientCpf: string
  patientMedicalRecordNumber: number
  patientPhone: string
  patientWhatsapp: string
  patientEmail?: string
  patientBirthDate?: string
  insuranceType: 'unimed' | 'particular' | 'outro'
  insurancePlan?: string
  appointmentDate: string // YYYY-MM-DD
  appointmentTime: string // HH:MM
  appointmentType:
    | 'consulta'
    | 'retorno'
    | 'urgencia'
    | 'teleconsulta'
    | 'visita_domiciliar'
  status:
    | 'agendada'
    | 'confirmada'
    | 'em_andamento'
    | 'concluida'
    | 'cancelada'
    | 'reagendada'
  source: 'public_appointment' | 'doctor_area' | 'secretary_area' // Origem do agendamento
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy?: string // ID do usuário que criou (médico/secretária)
}

export interface Patient {
  id: string
  name: string
  cpf: string
  medicalRecordNumber: number
  phone: string
  whatsapp: string
  email?: string
  birthDate?: string
  insurance: {
    type: 'unimed' | 'particular' | 'outro'
    plan?: string
  }
  medicalRecord?: {
    allergies?: string[]
    medications?: string[]
    conditions?: string[]
    notes?: string
  }
  createdAt: string
  updatedAt: string
}

export interface DailyAgenda {
  date: string // YYYY-MM-DD
  appointments: UnifiedAppointment[]
  totalPatients: number
  confirmedAppointments: number
  pendingAppointments: number
  completedAppointments: number
}

// Chaves do localStorage
const APPOINTMENTS_KEY = 'unified-appointments'
const PATIENTS_KEY = 'unified-patients'

// Função para validar CPF
export function validateCPF(cpf: string): boolean {
  // Verifica se o CPF é válido antes de processar
  if (!cpf || typeof cpf !== 'string') return false
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '')

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

// Função para formatar CPF
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '')
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Função para ler dados do arquivo (servidor) ou localStorage (cliente)
async function loadFromStorage<T>(key: string): Promise<T[]> {
  // Se estiver no servidor, usar a API de backup para ler do arquivo
  if (typeof window === 'undefined') {
    console.log(`📱 Servidor: carregando dados do arquivo para [${key}]`)
    try {
      const fs = await import('fs/promises')
      const path = await import('path')

      const dataDir = path.join(process.cwd(), 'data')
      let fileName: string

      if (key === PATIENTS_KEY) {
        fileName = 'patients.json'
      } else if (key === APPOINTMENTS_KEY) {
        fileName = 'unified-appointments.json'
      } else {
        fileName = `${key}.json`
      }

      const filePath = path.join(dataDir, fileName)

      // Verificar se o arquivo existe
      try {
        await fs.access(filePath)
      } catch {
        console.log(`📭 Arquivo não encontrado [${key}]: ${fileName}`)
        return []
      }

      // Ler dados do arquivo
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(fileContent)
      console.log(
        `✅ Dados carregados do arquivo [${key}]: ${Array.isArray(data) ? data.length : 'objeto'} itens`
      )
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error(`❌ Erro ao carregar do arquivo [${key}]:`, error)
      return []
    }
  }

  // Se estiver no cliente, usar localStorage
  try {
    console.log(`📖 Cliente: lendo dados do localStorage [${key}]`)
    const item = localStorage.getItem(key)
    if (!item) {
      console.log(
        `📭 Nenhum dado encontrado no localStorage [${key}], tentando recuperar do backup`
      )

      // Se for a chave de pacientes e não houver dados, tentar recuperar do backup
      if (key === PATIENTS_KEY) {
        const patients = await loadPatientBackup()
        if (patients.length > 0) {
          console.log(
            `🔄 Backup de pacientes carregado: ${patients.length} pacientes`
          )
          await saveToStorage(PATIENTS_KEY, patients)
          return patients as T[]
        }
      }

      return []
    }

    const parsed = JSON.parse(item)
    console.log(
      `✅ Dados carregados do localStorage [${key}]:`,
      Array.isArray(parsed) ? `${parsed.length} itens` : 'objeto'
    )
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error(`❌ Erro ao ler ${key} do localStorage:`, error)
    return []
  }
}

// Funções de utilidade para localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue

  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.log(
        `📱 localStorage não disponível (servidor) - retornando valor padrão para [${key}]`
      )
      return defaultValue
    }

    console.log(`📖 Lendo dados do localStorage [${key}]`)
    const item = localStorage.getItem(key)
    if (!item) {
      console.log(
        `📭 Nenhum dado encontrado no localStorage [${key}], tentando recuperar do backup`
      )

      // Se for a chave de pacientes e não houver dados, tentar recuperar do backup
      if (key === PATIENTS_KEY) {
        loadPatientBackup()
          .then(async patients => {
            if (patients.length > 0) {
              console.log(
                `🔄 Recuperando ${patients.length} pacientes do backup`
              )
              await saveToStorage(key, patients as T)
            }
          })
          .catch(backupError => {
            console.error('❌ Erro ao carregar backup:', backupError)
          })
      }

      return defaultValue
    }
    const parsed = JSON.parse(item)
    console.log(
      `✅ Dados carregados do localStorage [${key}]:`,
      Array.isArray(parsed) ? `${parsed.length} itens` : 'objeto'
    )
    return parsed
  } catch (error) {
    console.error(`❌ Erro ao ler ${key} do localStorage:`, error)
    return defaultValue
  }
}

// Função para carregar backup de pacientes
async function loadPatientBackup(): Promise<Patient[]> {
  try {
    // Se estiver no servidor, ler diretamente do arquivo
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises')
      const path = await import('path')

      const PATIENTS_FILE = path.join(process.cwd(), 'data', 'patients.json')

      try {
        const data = await fs.readFile(PATIENTS_FILE, 'utf-8')
        const patients = JSON.parse(data)
        console.log(
          '✅ Backup de pacientes carregado do arquivo:',
          patients.length,
          'pacientes'
        )
        return patients
      } catch (fileError) {
        console.log(
          '📁 Arquivo de backup não encontrado, retornando array vazio'
        )
        return []
      }
    } else {
      // Se estiver no cliente, usar fetch
      const response = await fetch('/api/backup-patients')

      if (response.ok) {
        const data = await response.json()
        console.log(
          '✅ Backup de pacientes carregado via API:',
          data.count,
          'pacientes'
        )
        return data.patients || []
      } else {
        console.warn('⚠️ Falha ao carregar backup via API')
        return []
      }
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar backup:', error)
    return []
  }
}

async function saveToStorage<T>(key: string, data: T): Promise<void> {
  // Se estiver no servidor, salvar diretamente no arquivo
  if (typeof window === 'undefined') {
    console.log('📁 Servidor: salvando dados no arquivo')
    if (Array.isArray(data)) {
      try {
        const fs = await import('fs/promises')
        const path = await import('path')

        const dataDir = path.join(process.cwd(), 'data')
        let fileName: string

        if (key === PATIENTS_KEY) {
          fileName = 'patients.json'
        } else if (key === APPOINTMENTS_KEY) {
          fileName = 'unified-appointments.json'
        } else {
          fileName = `${key}.json`
        }

        const filePath = path.join(dataDir, fileName)

        // Criar diretório se não existir
        try {
          await fs.mkdir(dataDir, { recursive: true })
        } catch (mkdirError) {
          // Diretório já existe
        }

        // Salvar dados no arquivo
        await fs.writeFile(filePath, JSON.stringify(data, null, 2))
        console.log(
          `✅ Dados salvos no arquivo [${key}]: ${(data as any[]).length} itens`
        )
      } catch (error) {
        console.error(`❌ Erro ao salvar no arquivo [${key}]:`, error)
      }
    }
    return
  }

  // Se estiver no cliente, salvar no localStorage

  try {
    console.log(
      `🔄 Iniciando salvamento no localStorage [${key}]:`,
      Array.isArray(data) ? `${(data as any[]).length} itens` : 'objeto'
    )
    const jsonData = JSON.stringify(data)
    console.log(`📝 JSON gerado (${jsonData.length} caracteres)`)

    localStorage.setItem(key, jsonData)
    console.log(`✅ Dados salvos no localStorage [${key}]`)

    // Verificar se foi salvo corretamente (apenas no browser)
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(key)
      if (!saved) {
        console.error(
          `❌ Falha ao verificar dados salvos no localStorage [${key}]`
        )
      } else {
        const parsedSaved = JSON.parse(saved)
        console.log(
          `✅ Verificação confirmada: ${Array.isArray(parsedSaved) ? parsedSaved.length : 'objeto'} no localStorage [${key}]`
        )

        // Para pacientes, verificar se o último adicionado está lá
        if (
          key === PATIENTS_KEY &&
          Array.isArray(data) &&
          Array.isArray(parsedSaved)
        ) {
          const originalCount = (data as any[]).length
          const savedCount = parsedSaved.length
          console.log(
            `📊 Contagem: Original=${originalCount}, Salvo=${savedCount}`
          )

          if (originalCount > 0) {
            const lastOriginal = (data as any[])[originalCount - 1]
            const lastSaved = parsedSaved.find(
              (p: any) => p.id === lastOriginal.id
            )
            if (lastSaved) {
              console.log(
                `✅ Último paciente confirmado no localStorage: ${lastSaved.id}`
              )
            } else {
              console.error(
                `❌ Último paciente NÃO encontrado no localStorage: ${lastOriginal.id}`
              )
            }
          }
        }
      }
    }

    // Backup adicional: salvar também via API para persistência
    if (key === PATIENTS_KEY) {
      savePatientBackup(data as Patient[])
    }
  } catch (error) {
    console.error(`❌ Erro ao salvar ${key} no localStorage:`, error)
  }
}

// Função para backup de pacientes via API
async function savePatientBackup(patients: Patient[]): Promise<void> {
  try {
    const response = await fetch('/api/backup-patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patients }),
    })

    if (response.ok) {
      console.log('✅ Backup de pacientes salvo via API')
    } else {
      console.warn('⚠️ Falha ao salvar backup via API')
    }
  } catch (error) {
    console.warn('⚠️ Erro ao salvar backup via API:', error)
  }
}

// Funções de utilidade para IDs
export function generateAppointmentId(): string {
  return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generatePatientId(): string {
  return `pat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// === FUNÇÕES DE AGENDAMENTO ===

// Criar novo agendamento
export async function createAppointment(
  appointmentData: Omit<UnifiedAppointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{
  success: boolean
  appointment?: UnifiedAppointment
  error?: string
}> {
  try {
    // Verificar se já existe agendamento para o mesmo paciente na mesma data/hora
    const existingAppointments = await getAllAppointments()
    const conflictingAppointment = existingAppointments.find(
      apt =>
        apt.patientId === appointmentData.patientId &&
        apt.appointmentDate === appointmentData.appointmentDate &&
        apt.appointmentTime === appointmentData.appointmentTime &&
        apt.status !== 'cancelada'
    )

    if (conflictingAppointment) {
      return {
        success: false,
        error:
          'Já existe um agendamento para este paciente nesta data e horário',
      }
    }

    const newAppointment: UnifiedAppointment = {
      ...appointmentData,
      id: generateAppointmentId(),
      createdAt: getBrasiliaTimestamp(),
      updatedAt: getBrasiliaTimestamp(),
    }

    // Salvar agendamento
    const appointments = await getAllAppointments()
    appointments.push(newAppointment)

    await saveToStorage(APPOINTMENTS_KEY, appointments)

    console.log(
      `✅ Agendamento criado: ${newAppointment.patientName} - ${newAppointment.appointmentDate} ${newAppointment.appointmentTime}`
    )

    // Enviar notificação via Telegram
    try {
      const notificationData: AppointmentNotificationData = {
        patientName: newAppointment.patientName,
        patientEmail: newAppointment.patientEmail,
        patientPhone: newAppointment.patientPhone,
        patientWhatsapp:
          newAppointment.patientWhatsapp || newAppointment.patientPhone,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        insuranceType: newAppointment.insuranceType as
          | 'unimed'
          | 'particular'
          | 'outro',
        appointmentType: newAppointment.appointmentType,
        source: newAppointment.source,
        notes: newAppointment.notes,
      }

      await sendTelegramAppointmentNotification(notificationData)
      console.log('✅ Notificação Telegram enviada com sucesso')
    } catch (telegramError) {
      console.warn('⚠️ Erro ao enviar notificação Telegram:', telegramError)
      // Não falhar o agendamento por causa da notificação
    }

    return { success: true, appointment: newAppointment }
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Obter todos os agendamentos
export async function getAllAppointments(): Promise<UnifiedAppointment[]> {
  try {
    return await loadFromStorage<UnifiedAppointment>(APPOINTMENTS_KEY)
  } catch (error) {
    console.error('❌ Erro ao obter agendamentos:', error)
    return []
  }
}

// Obter agendamentos por data
export async function getAppointmentsByDate(
  date: string
): Promise<UnifiedAppointment[]> {
  const allAppointments = await getAllAppointments()
  return allAppointments
    .filter(apt => apt.appointmentDate === date)
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
}

// Obter agenda diária
export async function getDailyAgenda(date: string): Promise<DailyAgenda> {
  const appointments = await getAppointmentsByDate(date)

  return {
    date,
    appointments,
    totalPatients: appointments.length,
    confirmedAppointments: appointments.filter(
      apt => apt.status === 'confirmada'
    ).length,
    pendingAppointments: appointments.filter(apt => apt.status === 'agendada')
      .length,
    completedAppointments: appointments.filter(
      apt => apt.status === 'concluida'
    ).length,
  }
}

// Atualizar status do agendamento
export async function updateAppointmentStatus(
  appointmentId: string,
  status: UnifiedAppointment['status'],
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const appointments = await getAllAppointments()
    const appointmentIndex = appointments.findIndex(
      apt => apt.id === appointmentId
    )

    if (appointmentIndex === -1) {
      return { success: false, error: 'Agendamento não encontrado' }
    }

    appointments[appointmentIndex].status = status
    appointments[appointmentIndex].updatedAt = getBrasiliaTimestamp()

    if (notes) {
      appointments[appointmentIndex].notes = notes
    }

    await saveToStorage(APPOINTMENTS_KEY, appointments)

    console.log(`✅ Status atualizado: ${appointmentId} -> ${status}`)

    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Atualizar dados do agendamento
export async function updateAppointment(
  appointmentId: string,
  updateData: {
    date: string
    time: string
    type:
      | 'consulta'
      | 'retorno'
      | 'urgencia'
      | 'teleconsulta'
      | 'visita_domiciliar'
    notes?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const appointments = await getAllAppointments()
    const appointmentIndex = appointments.findIndex(
      apt => apt.id === appointmentId
    )

    if (appointmentIndex === -1) {
      return { success: false, error: 'Agendamento não encontrado' }
    }

    // Atualizar os dados do agendamento
    appointments[appointmentIndex].appointmentDate = updateData.date
    appointments[appointmentIndex].appointmentTime = updateData.time
    appointments[appointmentIndex].appointmentType = updateData.type
    appointments[appointmentIndex].updatedAt = getBrasiliaTimestamp()

    if (updateData.notes !== undefined) {
      appointments[appointmentIndex].notes = updateData.notes
    }

    await saveToStorage(APPOINTMENTS_KEY, appointments)

    console.log(`✅ Agendamento atualizado: ${appointmentId}`)

    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// === FUNÇÕES DE PACIENTES ===

// Função para gerar próximo número de prontuário
export async function getNextMedicalRecordNumber(): Promise<number> {
  const patients = await getAllPatients()
  if (patients.length === 0) {
    return 1
  }

  // Encontrar o maior número de prontuário existente
  const maxRecordNumber = Math.max(
    ...patients.map(p => p.medicalRecordNumber || 0)
  )
  return maxRecordNumber + 1
}

// Criar ou atualizar paciente
export async function createOrUpdatePatient(
  patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; patient?: Patient; error?: string }> {
  try {
    console.log('🔄 Iniciando criação/atualização de paciente:', patientData)
    const patients = await getAllPatients()
    console.log('📋 Pacientes existentes:', patients.length)

    // Validar formato do CPF
    if (!validateCPF(patientData.cpf)) {
      console.log('❌ CPF inválido:', patientData.cpf)
      return {
        success: false,
        error: 'CPF inválido. Verifique o número digitado.',
      }
    }

    // LÓGICA PRINCIPAL: Buscar paciente existente pelo CPF (identificador único)
    const existingPatientByCpf = patients.find(p => p.cpf === patientData.cpf)

    if (existingPatientByCpf) {
      console.log(
        '🔄 Paciente encontrado pelo CPF, atualizando dados:',
        existingPatientByCpf.id
      )
      // Atualizar paciente existente (mantém o número do prontuário e ID)
      const updatedPatient: Patient = {
        ...existingPatientByCpf,
        ...patientData,
        id: existingPatientByCpf.id, // Manter ID existente
        medicalRecordNumber: existingPatientByCpf.medicalRecordNumber, // Manter número existente
        createdAt: existingPatientByCpf.createdAt, // Manter data de criação
        updatedAt: getBrasiliaTimestamp(),
      }

      const patientIndex = patients.findIndex(
        p => p.id === existingPatientByCpf.id
      )
      patients[patientIndex] = updatedPatient

      await saveToStorage(PATIENTS_KEY, patients)
      console.log(
        '✅ Paciente atualizado com sucesso pelo CPF:',
        updatedPatient.id,
        'Prontuário:',
        updatedPatient.medicalRecordNumber
      )

      return { success: true, patient: updatedPatient }
    } else {
      console.log('➕ CPF não encontrado, criando novo paciente')

      // Gerar próximo número de prontuário
      const medicalRecordNumber = await getNextMedicalRecordNumber()
      console.log('📋 Número do prontuário:', medicalRecordNumber)

      // Criar novo paciente
      const newPatient: Patient = {
        ...patientData,
        id: generatePatientId(),
        medicalRecordNumber,
        createdAt: getBrasiliaTimestamp(),
        updatedAt: getBrasiliaTimestamp(),
      }

      patients.push(newPatient)
      await saveToStorage(PATIENTS_KEY, patients)
      console.log(
        '✅ Novo paciente criado com sucesso:',
        newPatient.id,
        'Prontuário:',
        medicalRecordNumber
      )

      // Verificar se foi salvo corretamente no array local
      const savedPatient = patients.find(p => p.id === newPatient.id)
      if (!savedPatient) {
        console.error('❌ Paciente não foi encontrado no array após salvar!')
        return { success: false, error: 'Falha ao salvar paciente no array' }
      }

      // Enviar e-mail de boas-vindas automaticamente se o paciente tiver e-mail
      if (newPatient.email) {
        try {
          console.log(
            '📧 Enviando e-mail de boas-vindas para:',
            newPatient.email
          )

          // Usar a função direta do email-service no servidor
          if (typeof window === 'undefined') {
            // Executando no servidor - usar função direta
            const { sendWelcomeEmail } = await import('./email-service')
            const emailSent = await sendWelcomeEmail({
              name: newPatient.name,
              email: newPatient.email,
              birthDate: newPatient.birthDate,
            })

            if (emailSent) {
              console.log(
                '✅ E-mail de boas-vindas enviado com sucesso (servidor)'
              )
            } else {
              console.warn(
                '⚠️ Falha ao enviar e-mail de boas-vindas (servidor)'
              )
            }
          } else {
            // Executando no cliente - usar API
            const emailResponse = await fetch('/api/email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'welcome',
                patientData: {
                  name: newPatient.name,
                  email: newPatient.email,
                },
              }),
            })

            if (emailResponse.ok) {
              const emailResult = await emailResponse.json()
              if (emailResult.success) {
                console.log(
                  '✅ E-mail de boas-vindas enviado com sucesso (cliente)'
                )
              } else {
                console.warn(
                  '⚠️ Falha ao enviar e-mail de boas-vindas:',
                  emailResult.message
                )
              }
            } else {
              console.warn('⚠️ Erro na API de e-mail:', emailResponse.status)
            }
          }
        } catch (emailError) {
          console.warn('⚠️ Erro ao enviar e-mail de boas-vindas:', emailError)
          // Não falhar o cadastro por causa do e-mail
        }
      }

      // Aguardar um momento para garantir que o localStorage foi atualizado
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          const localStorageData = localStorage.getItem('unified-patients')
          if (localStorageData) {
            const parsedData = JSON.parse(localStorageData)
            const localStoragePatient = parsedData.find(
              (p: Patient) => p.id === newPatient.id
            )
            if (localStoragePatient) {
              console.log(
                '✅ Paciente verificado no localStorage:',
                localStoragePatient.name
              )
            } else {
              console.log('❌ Paciente não encontrado no localStorage')
            }
          }
        } else {
          console.log('📱 localStorage não disponível (servidor)')
        }
      }, 100)

      return { success: true, patient: newPatient }
    }
  } catch (error) {
    console.error('❌ Erro ao criar/atualizar paciente:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Obter todos os pacientes
export async function getAllPatients(): Promise<Patient[]> {
  try {
    // Carregar pacientes do arquivo/localStorage
    let patients: Patient[] = []
    if (typeof window === 'undefined') {
      patients = await loadFromStorage<Patient>(PATIENTS_KEY)
    } else {
      patients = getFromStorage<Patient[]>(PATIENTS_KEY, [])
    }

    // Carregar agendamentos para extrair pacientes únicos
    const appointments = await getAllAppointments()

    // Extrair pacientes únicos dos agendamentos que não estão na lista de pacientes
    const appointmentPatients: Patient[] = []
    const existingPatientIds = new Set(patients.map(p => p.id))
    const processedPatientIds = new Set<string>()

    for (const apt of appointments) {
      // Verificar se o appointment tem dados válidos
      if (!apt || !apt.patientId) {
        console.warn('⚠️ Appointment inválido encontrado:', apt)
        continue
      }

      // Evitar duplicatas e pacientes já existentes
      if (
        !existingPatientIds.has(apt.patientId) &&
        !processedPatientIds.has(apt.patientId)
      ) {
        processedPatientIds.add(apt.patientId)

        const appointmentPatient: Patient = {
          id: apt.patientId,
          name: apt.patientName,
          cpf: apt.patientCpf,
          medicalRecordNumber: apt.patientMedicalRecordNumber,
          phone: apt.patientPhone,
          whatsapp: apt.patientWhatsapp,
          email: apt.patientEmail || '',
          birthDate: apt.patientBirthDate || '',
          insurance: {
            type: apt.insuranceType,
            plan: apt.insurancePlan,
          },
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt,
        }

        appointmentPatients.push(appointmentPatient)
      }
    }

    // Combinar pacientes do arquivo com pacientes dos agendamentos
    const allPatients = [...patients, ...appointmentPatients]

    console.log(
      `📋 Total de pacientes encontrados: ${allPatients.length} (${patients.length} do arquivo + ${appointmentPatients.length} dos agendamentos)`
    )

    return allPatients
  } catch (error) {
    console.error('❌ Erro ao obter pacientes:', error)
    return []
  }
}

// Buscar paciente por ID
export async function getPatientById(
  patientId: string
): Promise<Patient | null> {
  const patients = await getAllPatients()
  return patients.find(p => p.id === patientId) || null
}

// === FUNÇÕES DE INTEGRAÇÃO ===

// Criar agendamento a partir do formulário público
export async function createPublicAppointment(formData: {
  fullName: string
  cpf: string
  email: string
  phone: string
  whatsapp: string
  birthDate: string
  insuranceType: 'unimed' | 'particular'
  selectedDate: Date
  selectedTime: string
}): Promise<{
  success: boolean
  appointment?: UnifiedAppointment
  patient?: Patient
  error?: string
  existingAppointment?: UnifiedAppointment
}> {
  try {
    console.log('🚀 INICIANDO createPublicAppointment:', {
      fullName: formData.fullName,
      date: formData.selectedDate.toISOString().split('T')[0],
      time: formData.selectedTime,
    })

    // Verificar se o paciente já tem consulta agendada (por nome, celular ou email)
    const existingAppointments = await getAllAppointments()
    console.log('📋 Agendamentos existentes:', existingAppointments.length)

    // Obter data atual do Brasil usando timezone correto
    const today = getTodayISO()

    // Verificar se já existe uma consulta no MESMO DIA E HORÁRIO
    const appointmentDate = formData.selectedDate.toISOString().split('T')[0]
    console.log(
      '🔍 Verificando conflitos para:',
      appointmentDate,
      formData.selectedTime
    )

    const existingAppointment = existingAppointments.find(
      apt =>
        apt.status !== 'cancelada' &&
        apt.appointmentDate === appointmentDate &&
        apt.appointmentTime === formData.selectedTime &&
        ((apt.patientCpf && formData.cpf && apt.patientCpf === formData.cpf) ||
          apt.patientName.toLowerCase() === formData.fullName.toLowerCase() ||
          apt.patientPhone === formData.phone ||
          apt.patientWhatsapp === formData.whatsapp ||
          (apt.patientEmail &&
            formData.email &&
            apt.patientEmail.toLowerCase() === formData.email.toLowerCase()))
    )

    if (existingAppointment) {
      console.log('❌ Conflito encontrado:', existingAppointment)
      return {
        success: false,
        error: 'existing_appointment',
        existingAppointment: existingAppointment,
      }
    }

    console.log('✅ Nenhum conflito encontrado, prosseguindo...')

    // Primeiro, criar ou atualizar o paciente
    console.log('👤 Criando/atualizando paciente...')
    const patientResult = await createOrUpdatePatient({
      name: formData.fullName,
      cpf: formData.cpf,
      medicalRecordNumber: 0, // Será gerado automaticamente se for novo paciente
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      birthDate: formData.birthDate,
      insurance: {
        type: formData.insuranceType,
      },
    })

    console.log(
      '👤 Resultado do paciente:',
      patientResult.success ? 'SUCESSO' : 'FALHA',
      patientResult.error
    )

    if (!patientResult.success || !patientResult.patient) {
      console.log('❌ Falha ao criar paciente:', patientResult.error)
      return { success: false, error: patientResult.error }
    }

    // Depois, criar o agendamento
    console.log('📅 Criando agendamento...')
    const appointmentResult = await createAppointment({
      patientId: patientResult.patient.id,
      patientName: formData.fullName,
      patientCpf: formData.cpf,
      patientMedicalRecordNumber: patientResult.patient.medicalRecordNumber,
      patientPhone: formData.phone,
      patientWhatsapp: formData.whatsapp,
      patientEmail: formData.email,
      patientBirthDate: formData.birthDate,
      insuranceType: formData.insuranceType,
      appointmentDate: formData.selectedDate.toISOString().split('T')[0],
      appointmentTime: formData.selectedTime,
      appointmentType: 'consulta',
      status: 'agendada',
      source: 'public_appointment',
    })

    console.log(
      '📅 Resultado do agendamento:',
      appointmentResult.success ? 'SUCESSO' : 'FALHA',
      appointmentResult.error
    )

    return {
      success: appointmentResult.success,
      appointment: appointmentResult.appointment,
      patient: patientResult.patient,
      error: appointmentResult.error,
    }
  } catch (error) {
    console.error('❌ Erro ao criar agendamento público:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Obter estatísticas do sistema
export async function cancelAppointment(
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const appointments = await getAllAppointments()
    const appointmentIndex = appointments.findIndex(
      apt => apt.id === appointmentId
    )

    if (appointmentIndex === -1) {
      return { success: false, error: 'Agendamento não encontrado' }
    }

    appointments[appointmentIndex].status = 'cancelada'
    appointments[appointmentIndex].updatedAt = getBrasiliaTimestamp()

    await saveToStorage(APPOINTMENTS_KEY, appointments)

    console.log(
      `✅ Agendamento cancelado: ${appointments[appointmentIndex].patientName}`
    )

    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao cancelar agendamento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

export async function getSystemStats(): Promise<{
  totalAppointments: number
  totalPatients: number
  todayAppointments: number
  pendingAppointments: number
  completedAppointments: number
}> {
  const appointments = await getAllAppointments()
  const patients = await getAllPatients()

  // Usar função do date-utils para obter a data correta no fuso horário do Brasil
  const today = getTodayISO()

  console.log('Data atual (Brasil):', today)
  console.log(
    'Agendamentos encontrados:',
    appointments.map(apt => ({
      date: apt.appointmentDate,
      patient: apt.patientName,
    }))
  )

  // Filtrar apenas agendamentos do dia atual
  const todayAppointments = appointments.filter(
    apt => apt.appointmentDate === today
  )

  return {
    totalAppointments: appointments.length,
    totalPatients: patients.length,
    todayAppointments: todayAppointments.length,
    pendingAppointments: todayAppointments.filter(
      apt => apt.status === 'agendada'
    ).length,
    completedAppointments: todayAppointments.filter(
      apt => apt.status === 'concluida'
    ).length,
  }
}

// Inicializar sistema de cron job diário (apenas no servidor)
if (typeof window === 'undefined') {
  console.log('🚀 Inicializando sistema de agendamento automático...')

  // Importação dinâmica para evitar dependência circular
  import('./daily-cron-scheduler').then(module => {
    module.startDailyCronScheduler()
  })

  // Inicializar sistema de aniversários
  import('./birthday-cron-scheduler').then(module => {
    console.log('🎂 Sistema de aniversários automático inicializado')
  })
}

// === FUNÇÕES DE CIRURGIAS ===

interface Surgery {
  id: string
  patientName: string
  surgeryType: string
  date: string // DD/MM/YYYY
  time: string // HH:MM
  hospital: string
  paymentType: 'particular' | 'plano'
  status: 'agendada' | 'confirmada' | 'concluida' | 'cancelada'
  notes?: string
  insurancePlan?: string
}

// Buscar cirurgias por data
export async function getSurgeriesByDate(date: string): Promise<Surgery[]> {
  try {
    console.log(`🔍 Buscando cirurgias para a data: ${date}`)

    // Converter formato de data de YYYY-MM-DD para DD/MM/YYYY para a API de cirurgias
    const [year, month, day] = date.split('-')
    const surgeryDateFormat = `${day}/${month}/${year}`

    // Usar URL absoluta no servidor
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const url = `${baseUrl}/api/surgeries?date=${encodeURIComponent(surgeryDateFormat)}`

    console.log(`📡 Fazendo requisição para: ${url}`)

    const response = await fetch(url)
    if (!response.ok) {
      console.error('Erro ao buscar cirurgias:', response.status)
      return []
    }

    const data = await response.json()
    console.log(`🏥 Cirurgias encontradas: ${data.surgeries?.length || 0}`)

    return data.surgeries || []
  } catch (error) {
    console.error('Erro ao buscar cirurgias por data:', error)
    return []
  }
}

// Obter agenda diária incluindo consultas e cirurgias
export async function getDailyAgendaWithSurgeries(
  date: string
): Promise<DailyAgenda & { surgeries: Surgery[] }> {
  const appointments = await getAppointmentsByDate(date)
  const surgeries = await getSurgeriesByDate(date)

  return {
    date,
    appointments,
    surgeries,
    totalPatients: appointments.length,
    confirmedAppointments: appointments.filter(
      apt => apt.status === 'confirmada'
    ).length,
    pendingAppointments: appointments.filter(apt => apt.status === 'agendada')
      .length,
    completedAppointments: appointments.filter(
      apt => apt.status === 'concluida'
    ).length,
  }
}
