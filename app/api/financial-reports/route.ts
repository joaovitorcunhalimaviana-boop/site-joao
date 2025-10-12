import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface MedicalRecord {
  id: string
  patientId: string
  date: string
  time: string
  complaint: string
  examination: string
  diagnosis: string
  treatment: string
  prescription: string
  observations: string
  doctorName: string
  createdAt: string
}

interface Patient {
  id: string
  name: string
  phone: string
  whatsapp: string
  birthDate: string
  cpf?: string
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
  }
}

interface DailyStats {
  date: string
  totalPatients: number
  particularPatients: number
  unimedPatients: number
  otherInsurancePatients: number
  patients: Array<{
    name: string
    patientId: string
    insurance: {
      type: 'particular' | 'unimed' | 'outro'
      plan?: string
    }
    consultation?: {
      time: string
    }
  }>
}

// Removido: preços de consulta não são mais calculados

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(
      searchParams.get('year') || new Date().getFullYear().toString()
    )
    const month = parseInt(
      searchParams.get('month') || (new Date().getMonth() + 1).toString()
    )

    // Carregar dados dos prontuários
    const medicalRecordsPath = path.join(
      process.cwd(),
      'data',
      'medical-records.json'
    )
    let medicalRecords: MedicalRecord[] = []

    if (fs.existsSync(medicalRecordsPath)) {
      const medicalRecordsData = fs.readFileSync(medicalRecordsPath, 'utf8')
      medicalRecords = JSON.parse(medicalRecordsData)
    }

    // Dados mockados dos pacientes (já que não temos arquivo patients.json)
    const patients: Patient[] = [
      {
        id: 'patient_1',
        name: 'Maria Silva',
        phone: '(11) 99999-9999',
        whatsapp: '(11) 99999-9999',
        birthDate: '1985-05-15',
        insurance: {
          type: 'particular',
        },
      },
      {
        id: 'patient_2',
        name: 'João Santos',
        phone: '(11) 88888-8888',
        whatsapp: '(11) 88888-8888',
        birthDate: '1990-08-20',
        insurance: {
          type: 'unimed',
          plan: 'UNIMED Básico',
        },
      },
      {
        id: 'patient_3',
        name: 'Ana Costa',
        phone: '(11) 77777-7777',
        whatsapp: '(11) 77777-7777',
        birthDate: '1978-12-10',
        insurance: {
          type: 'outro',
          plan: 'Bradesco Saúde',
        },
      },
    ]

    // Criar mapa de pacientes para acesso rápido
    const patientsMap = new Map<string, Patient>()
    patients.forEach(patient => {
      patientsMap.set(patient.id, patient)
    })

    // Filtrar prontuários do mês/ano especificado
    const monthlyRecords = medicalRecords.filter(record => {
      const recordDate = new Date(record.date)
      return (
        recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month
      )
    })

    // Agrupar por data e calcular estatísticas
    const dailyStats: { [key: string]: DailyStats } = {}

    monthlyRecords.forEach(record => {
      const dateKey = record.date
      const patient = patientsMap.get(record.patientId)

      if (!patient) return

      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          totalPatients: 0,
          particularPatients: 0,
          unimedPatients: 0,
          otherInsurancePatients: 0,
          patients: [],
        }
      }

      const stats = dailyStats[dateKey]

      // Verificar se o paciente já foi contado neste dia
      const existingPatient = stats.patients.find(
        p => p.patientId === patient.id
      )

      if (!existingPatient) {
        // Contar apenas se for um novo paciente
        stats.totalPatients++

        // Adicionar paciente à lista
        stats.patients.push({
          name: patient.name,
          patientId: patient.id,
          insurance: {
            type: patient.insurance.type,
            ...(patient.insurance.plan && { plan: patient.insurance.plan }),
          },
          consultation: {
            time: record.time,
          },
        })

        // Classificar por tipo de convênio
        switch (patient.insurance.type) {
          case 'particular':
            stats.particularPatients++
            break
          case 'unimed':
            stats.unimedPatients++
            break
          case 'outro':
            stats.otherInsurancePatients++
            break
        }
      }
    })

    // Calcular totais mensais
    const monthlyTotals = {
      totalPatients: 0,
      particularPatients: 0,
      unimedPatients: 0,
      otherInsurancePatients: 0,
    }

    Object.values(dailyStats).forEach(day => {
      monthlyTotals.totalPatients += day.totalPatients
      monthlyTotals.particularPatients += day.particularPatients
      monthlyTotals.unimedPatients += day.unimedPatients
      monthlyTotals.otherInsurancePatients += day.otherInsurancePatients
    })

    return NextResponse.json({
      success: true,
      monthlyData: dailyStats,
      monthlyTotals,
      year,
      month,
    })
  } catch (error) {
    console.error('Erro ao gerar relatório financeiro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
