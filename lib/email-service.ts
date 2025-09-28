// Interface para dados do paciente
export interface PatientEmailData {
  name: string
  email: string
  birthDate?: string
}

// Interface para dados de notificação médica
export interface DoctorNotificationData {
  doctorEmail: string
  patientName: string
  appointmentDate: string
  appointmentTime: string
  notificationType: 'new_appointment' | 'appointment_change' | 'appointment_cancellation' | 'reminder'
  additionalInfo?: string
}

/**
 * Enviar email de boas-vindas (função cliente)
 */
export async function sendWelcomeEmail(patientData: PatientEmailData): Promise<boolean> {
  try {
    const response = await fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: patientData.name,
        email: patientData.email,
        source: 'website'
      })
    })

    const result = await response.json()
    return response.ok && result.success
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error)
    return false
  }
}

/**
 * Enviar notificação por email para médico (função cliente)
 */
export async function sendDoctorNotification(notificationData: DoctorNotificationData): Promise<boolean> {
  try {
    const response = await fetch('/api/send-notification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData)
    })

    const result = await response.json()
    return response.ok && result.success
  } catch (error) {
    console.error('Erro ao enviar notificação por email:', error)
    return false
  }
}

/**
 * Verificar se o serviço de email está configurado
 */
export function isEmailServiceConfigured(): boolean {
  // Esta verificação será feita no servidor via API
  return true
}

// Função para verificar aniversariantes do dia
export function getTodayBirthdays(patients: PatientEmailData[]): PatientEmailData[] {
  const today = new Date()
  const todayMonth = today.getMonth() + 1 // getMonth() retorna 0-11
  const todayDay = today.getDate()

  return patients.filter(patient => {
    if (!patient.birthDate) return false
    
    const birthDate = new Date(patient.birthDate)
    const birthMonth = birthDate.getMonth() + 1
    const birthDay = birthDate.getDate()
    
    return birthMonth === todayMonth && birthDay === todayDay
  })
}

// Função para enviar e-mails de aniversário automaticamente
export async function sendBirthdayEmails(patients: PatientEmailData[]): Promise<void> {
  const birthdayPatients = getTodayBirthdays(patients)
  
  if (birthdayPatients.length === 0) {
    console.log('📅 Nenhum aniversariante hoje')
    return
  }
  
  console.log(`🎉 ${birthdayPatients.length} aniversariante(s) hoje!`)
  
  for (const patient of birthdayPatients) {
    // Enviar via API
    await fetch('/api/send-birthday-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patient)
    })
    // Pequena pausa entre envios para evitar spam
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}
