import { prisma } from './database'
import { LGPDEncryptionService } from './lgpd-encryption'

// ================================
// SISTEMA DE DETECÇÃO DE DUPLICATAS
// ================================

export interface DuplicatePatient {
  id: string
  name: string
  cpf: string
  email?: string
  phone: string
  whatsapp?: string
  createdAt: Date
  lastAppointment?: Date
  appointmentCount: number
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean
  existingPatient?: DuplicatePatient
  duplicatePatients?: DuplicatePatient[]
  confidence: number // 0-100%
  matchedBy: 'cpf' | 'exact_match' | 'similar_data'
  suggestions: string[]
}

export class DuplicateDetectionService {
  /**
   * Detecta se um paciente já existe baseado no CPF (método principal)
   */
  static async detectDuplicateByCPF(
    cpf: string
  ): Promise<DuplicateDetectionResult> {
    if (!cpf || cpf.trim() === '') {
      return {
        isDuplicate: false,
        confidence: 0,
        matchedBy: 'cpf',
        suggestions: ['CPF não fornecido'],
      }
    }

    // Normalizar CPF (remover pontos e traços)
    const normalizedCPF = cpf.replace(/[^\d]/g, '')

    if (normalizedCPF.length !== 11) {
      return {
        isDuplicate: false,
        confidence: 0,
        matchedBy: 'cpf',
        suggestions: ['CPF inválido - deve conter 11 dígitos'],
      }
    }

    try {
      // Buscar todos os pacientes médicos para verificar CPF criptografado
      const allPatients = await prisma.medicalPatient.findMany({
        select: {
          id: true,
          fullName: true,
          cpf: true,
          communicationContact: {
            select: {
              email: true,
              whatsapp: true,
            },
          },
          createdAt: true,
          appointments: {
            select: {
              date: true,
            },
            orderBy: {
              date: 'desc',
            },
            take: 1,
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
      })

      // Verificar cada paciente descriptografando o CPF
      for (const patient of allPatients) {
        if (patient.cpf) {
          try {
            // Descriptografar CPF do paciente existente
            const decryptedCPF = LGPDEncryptionService.decrypt(patient.cpf)
            const existingNormalizedCPF = decryptedCPF.replace(/[^\d]/g, '')

            if (existingNormalizedCPF === normalizedCPF) {
              // CPF encontrado - paciente duplicado!
              const duplicatePatient: DuplicatePatient = {
                id: patient.id,
                name: patient.fullName,
                cpf: this.formatCPF(normalizedCPF),
                email: patient.communicationContact.email || undefined,
                phone: patient.communicationContact.whatsapp || '',
                whatsapp: patient.communicationContact.whatsapp || undefined,
                createdAt: patient.createdAt,
                lastAppointment: patient.appointments[0]?.date,
                appointmentCount: patient._count.appointments,
              }

              return {
                isDuplicate: true,
                existingPatient: duplicatePatient,
                confidence: 100, // CPF é 100% confiável
                matchedBy: 'cpf',
                suggestions: [
                  `Paciente já cadastrado: ${duplicatePatient.name}`,
                  `Cadastrado em: ${duplicatePatient.createdAt.toLocaleDateString('pt-BR')}`,
                  `Total de consultas: ${duplicatePatient.appointmentCount}`,
                  duplicatePatient.lastAppointment
                    ? `Última consulta: ${duplicatePatient.lastAppointment.toLocaleDateString('pt-BR')}`
                    : 'Nenhuma consulta agendada ainda',
                ],
              }
            }
          } catch (error) {
            // Erro na descriptografia - continuar para próximo paciente
            console.warn(
              `Erro ao descriptografar CPF do paciente ${patient.id}:`,
              error
            )
            continue
          }
        }
      }

      // Nenhum CPF duplicado encontrado
      return {
        isDuplicate: false,
        confidence: 0,
        matchedBy: 'cpf',
        suggestions: ['CPF não encontrado no sistema - paciente novo'],
      }
    } catch (error) {
      console.error('Erro na detecção de duplicatas por CPF:', error)
      return {
        isDuplicate: false,
        confidence: 0,
        matchedBy: 'cpf',
        suggestions: ['Erro ao verificar duplicatas - tente novamente'],
      }
    }
  }

  /**
   * Detecta duplicatas por similaridade de dados (método secundário)
   */
  static async detectDuplicateBySimilarity(
    name: string,
    phone: string,
    email?: string
  ): Promise<DuplicateDetectionResult> {
    try {
      const allPatients = await prisma.medicalPatient.findMany({
        select: {
          id: true,
          fullName: true,
          cpf: true,
          communicationContact: {
            select: {
              email: true,
              whatsapp: true,
            },
          },
          createdAt: true,
          appointments: {
            select: {
              date: true,
            },
            orderBy: {
              date: 'desc',
            },
            take: 1,
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
      })

      const similarPatients: DuplicatePatient[] = []
      const normalizedName = this.normalizeName(name)
      const normalizedPhone = phone.replace(/[^\d]/g, '')
      const normalizedEmail = email?.toLowerCase().trim()
      let maxSimilarity = 0

      for (const patient of allPatients) {
        let similarity = 0
        let matchReasons: string[] = []

        // Verificar similaridade do nome (60% de peso)
        const patientNormalizedName = this.normalizeName(patient.fullName)
        const nameSimilarity = this.calculateStringSimilarity(
          normalizedName,
          patientNormalizedName
        )
        if (nameSimilarity > 0.8) {
          similarity += nameSimilarity * 0.6
          matchReasons.push(`Nome similar: ${patient.fullName}`)
        }

        // Verificar telefone (30% de peso)
        if (patient.communicationContact.whatsapp) {
          const patientNormalizedPhone = patient.communicationContact.whatsapp.replace(/[^\d]/g, '')
          if (normalizedPhone === patientNormalizedPhone) {
            similarity += 0.3
            matchReasons.push(`Telefone idêntico: ${patient.communicationContact.whatsapp}`)
          }
        }

        // Verificar email (10% de peso)
        if (email && patient.communicationContact.email) {
          if (normalizedEmail === patient.communicationContact.email.toLowerCase().trim()) {
            similarity += 0.1
            matchReasons.push(`Email idêntico: ${patient.communicationContact.email}`)
          }
        }

        // Atualizar a maior similaridade encontrada
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity
        }

        // Se similaridade > 70%, considerar como possível duplicata
        if (similarity > 0.7 && matchReasons.length > 0) {
          const duplicatePatient: DuplicatePatient = {
            id: patient.id,
            name: patient.fullName,
            cpf: patient.cpf
              ? this.formatCPF(LGPDEncryptionService.decrypt(patient.cpf))
              : 'N/A',
            email: patient.communicationContact.email || undefined,
            phone: patient.communicationContact.whatsapp || '',
            whatsapp: patient.communicationContact.whatsapp || undefined,
            createdAt: patient.createdAt,
            lastAppointment: patient.appointments[0]?.date,
            appointmentCount: patient._count.appointments,
          }

          similarPatients.push(duplicatePatient)
        }
      }

      if (similarPatients.length > 0) {
        // Ordenar por maior similaridade
        similarPatients.sort((a, b) => b.appointmentCount - a.appointmentCount)

        return {
          isDuplicate: true,
          duplicatePatients: similarPatients,
          confidence: Math.round(maxSimilarity * 100),
          matchedBy: 'similar_data',
          suggestions: [
            `${similarPatients.length} paciente(s) similar(es) encontrado(s)`,
            'Verifique se é o mesmo paciente antes de cadastrar',
            'Recomendamos confirmar o CPF para ter certeza',
          ],
        }
      }

      return {
        isDuplicate: false,
        confidence: 0,
        matchedBy: 'similar_data',
        suggestions: ['Nenhum paciente similar encontrado'],
      }
    } catch (error) {
      console.error('Erro na detecção de duplicatas por similaridade:', error)
      return {
        isDuplicate: false,
        confidence: 0,
        matchedBy: 'similar_data',
        suggestions: ['Erro ao verificar similaridades - tente novamente'],
      }
    }
  }

  /**
   * Método principal que combina detecção por CPF e similaridade
   */
  static async detectDuplicates(
    cpf: string,
    name: string,
    phone: string,
    email?: string
  ): Promise<DuplicateDetectionResult> {
    // Primeiro, verificar por CPF (mais confiável)
    const cpfResult = await this.detectDuplicateByCPF(cpf)

    if (cpfResult.isDuplicate) {
      return cpfResult
    }

    // Se não encontrou por CPF, verificar por similaridade
    const similarityResult = await this.detectDuplicateBySimilarity(
      name,
      phone,
      email
    )

    return similarityResult
  }

  /**
   * Mesclar dados de pacientes duplicados
   */
  static async mergeDuplicatePatients(
    keepPatientId: string,
    removePatientId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.$transaction(async tx => {
        // Transferir todas as consultas para o paciente que será mantido
        await tx.appointment.updateMany({
          where: { medicalPatientId: removePatientId },
          data: { medicalPatientId: keepPatientId },
        })

        // Transferir todos os registros médicos
        await tx.medicalRecord.updateMany({
          where: { medicalPatientId: removePatientId },
          data: { medicalPatientId: keepPatientId },
        })

        // Transferir todas as consultas
        await tx.consultation.updateMany({
          where: { medicalPatientId: removePatientId },
          data: { medicalPatientId: keepPatientId },
        })

        // Remover o paciente duplicado
        await tx.medicalPatient.delete({
          where: { id: removePatientId },
        })
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao mesclar pacientes duplicados:', error)
      return {
        success: false,
        error: 'Erro ao mesclar pacientes - tente novamente',
      }
    }
  }

  // ================================
  // UTILITÁRIOS PRIVADOS
  // ================================

  private static normalizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) {
      return 1.0
    }

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  private static formatCPF(cpf: string): string {
    const numbers = cpf.replace(/[^\d]/g, '')
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cpf
  }

  /**
   * Validar CPF
   */
  static validateCPF(cpf: string): boolean {
    const numbers = cpf.replace(/[^\d]/g, '')

    if (numbers.length !== 11) return false
    if (/^(\d)\1{10}$/.test(numbers)) return false // CPFs com todos os dígitos iguais

    // Validar dígitos verificadores
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i)
    }
    let digit1 = 11 - (sum % 11)
    if (digit1 > 9) digit1 = 0

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i)
    }
    let digit2 = 11 - (sum % 11)
    if (digit2 > 9) digit2 = 0

    return (
      digit1 === parseInt(numbers.charAt(9)) &&
      digit2 === parseInt(numbers.charAt(10))
    )
  }
}

export default DuplicateDetectionService
