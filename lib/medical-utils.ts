// Utilitários para dados médicos
import {
  formatDateToBrazilian,
  formatDateTimeToBrazilian,
  formatTimeToBrazilian,
} from '@/lib/date-utils'

// Formatação de documentos brasileiros
export const documentFormatters = {
  // Formatar CPF
  cpf: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length !== 11) return value
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },

  // Formatar telefone
  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  },

  // Formatar CEP
  cep: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length !== 8) return value
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
  },

  // Formatar cartão SUS
  sus: (value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length !== 15) return value
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
  },

  // Formatar CRM
  crm: (value: string, state?: string): string => {
    const cleaned = value.replace(/\D/g, '')
    return state ? `${cleaned}/${state}` : cleaned
  },
}

// Formatação de dados médicos
export const medicalFormatters = {
  // Formatar peso
  weight: (value: number): string => {
    return `${value.toFixed(1)} kg`
  },

  // Formatar altura
  height: (value: number): string => {
    const meters = value / 100
    return `${value} cm (${meters.toFixed(2)} m)`
  },

  // Calcular e formatar IMC
  bmi: (
    weight: number,
    height: number
  ): { value: number; category: string; formatted: string } => {
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)

    let category = ''
    if (bmi < 18.5) category = 'Abaixo do peso'
    else if (bmi < 25) category = 'Peso normal'
    else if (bmi < 30) category = 'Sobrepeso'
    else if (bmi < 35) category = 'Obesidade grau I'
    else if (bmi < 40) category = 'Obesidade grau II'
    else category = 'Obesidade grau III'

    return {
      value: bmi,
      category,
      formatted: `${bmi.toFixed(1)} kg/m² (${category})`,
    }
  },

  // Formatar pressão arterial
  bloodPressure: (
    systolic: number,
    diastolic: number
  ): { formatted: string; category: string } => {
    let category = ''
    if (systolic < 120 && diastolic < 80) category = 'Normal'
    else if (systolic < 130 && diastolic < 80) category = 'Elevada'
    else if (systolic < 140 || diastolic < 90)
      category = 'Hipertensão estágio 1'
    else if (systolic < 180 || diastolic < 120)
      category = 'Hipertensão estágio 2'
    else category = 'Crise hipertensiva'

    return {
      formatted: `${systolic}/${diastolic} mmHg`,
      category,
    }
  },

  // Formatar temperatura
  temperature: (value: number): { formatted: string; status: string } => {
    let status = ''
    if (value < 36) status = 'Hipotermia'
    else if (value <= 37.2) status = 'Normal'
    else if (value <= 37.8) status = 'Febre baixa'
    else if (value <= 39) status = 'Febre'
    else status = 'Febre alta'

    return {
      formatted: `${value.toFixed(1)}°C`,
      status,
    }
  },

  // Calcular idade
  age: (
    birthDate: string
  ): { years: number; months: number; formatted: string } => {
    const [day, month, year] = birthDate.split('/').map(Number)
    const birth = new Date(year, month - 1, day)
    const today = new Date()

    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()

    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--
      months += 12
    }

    if (today.getDate() < birth.getDate()) {
      months--
    }

    const formatted =
      years > 0
        ? `${years} ano${years !== 1 ? 's' : ''}${months > 0 ? ` e ${months} mês${months !== 1 ? 'es' : ''}` : ''}`
        : `${months} mês${months !== 1 ? 'es' : ''}`

    return { years, months, formatted }
  },
}

// NOTA: Formatadores de data movidos para @/lib/date-utils para evitar duplicação
// Use as funções de @/lib/date-utils diretamente quando possível
// Este objeto mantém compatibilidade com código legado
export const dateFormatters = {
  brazilianDate: (date: Date): string => formatDateToBrazilian(date),
  brazilianDateTime: (date: Date): string => formatDateTimeToBrazilian(date),
  brazilianTime: (date: Date): string => formatTimeToBrazilian(date),

  // Calcular diferença de tempo
  timeDifference: (startDate: Date, endDate: Date): string => {
    const diff = endDate.getTime() - startDate.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
    }
    return `${minutes}min`
  },

  // Formatar data relativa (ex: "há 2 dias")
  relativeDate: (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) {
      return `há ${days} dia${days !== 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `há ${hours} hora${hours !== 1 ? 's' : ''}`
    } else if (minutes > 0) {
      return `há ${minutes} minuto${minutes !== 1 ? 's' : ''}`
    } else {
      return 'agora'
    }
  },
}

// Validadores médicos
export const medicalValidators = {
  // Validar se é maior de idade
  isAdult: (birthDate: string): boolean => {
    const age = medicalFormatters.age(birthDate)
    return age.years >= 18
  },

  // Validar se é idoso
  isElderly: (birthDate: string): boolean => {
    const age = medicalFormatters.age(birthDate)
    return age.years >= 65
  },

  // Validar se IMC está normal
  isNormalBMI: (weight: number, height: number): boolean => {
    const bmi = medicalFormatters.bmi(weight, height)
    return bmi.value >= 18.5 && bmi.value < 25
  },

  // Validar se pressão está normal
  isNormalBloodPressure: (systolic: number, diastolic: number): boolean => {
    return systolic < 120 && diastolic < 80
  },

  // Validar se temperatura está normal
  isNormalTemperature: (temperature: number): boolean => {
    return temperature >= 36 && temperature <= 37.2
  },
}

// Calculadoras médicas
export const medicalCalculators = {
  // Calcular dose por peso
  doseByWeight: (weight: number, dosePerKg: number): number => {
    return weight * dosePerKg
  },

  // Calcular superfície corporal (fórmula de Mosteller)
  bodySurfaceArea: (weight: number, height: number): number => {
    return Math.sqrt((weight * height) / 3600)
  },

  // Calcular taxa metabólica basal (fórmula de Harris-Benedict)
  basalMetabolicRate: (
    weight: number,
    height: number,
    age: number,
    gender: 'M' | 'F'
  ): number => {
    if (gender === 'M') {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    } else {
      return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
    }
  },

  // Calcular clearance de creatinina (fórmula de Cockcroft-Gault)
  creatinineClearance: (
    age: number,
    weight: number,
    creatinine: number,
    gender: 'M' | 'F'
  ): number => {
    const factor = gender === 'M' ? 1 : 0.85
    return ((140 - age) * weight * factor) / (72 * creatinine)
  },
}

// Constantes médicas
export const medicalConstants = {
  // Valores de referência
  referenceValues: {
    bmi: {
      underweight: { min: 0, max: 18.4 },
      normal: { min: 18.5, max: 24.9 },
      overweight: { min: 25, max: 29.9 },
      obese1: { min: 30, max: 34.9 },
      obese2: { min: 35, max: 39.9 },
      obese3: { min: 40, max: 100 },
    },
    bloodPressure: {
      normal: { systolic: { max: 119 }, diastolic: { max: 79 } },
      elevated: { systolic: { min: 120, max: 129 }, diastolic: { max: 79 } },
      stage1: {
        systolic: { min: 130, max: 139 },
        diastolic: { min: 80, max: 89 },
      },
      stage2: {
        systolic: { min: 140, max: 179 },
        diastolic: { min: 90, max: 119 },
      },
      crisis: { systolic: { min: 180 }, diastolic: { min: 120 } },
    },
    temperature: {
      hypothermia: { max: 35.9 },
      normal: { min: 36, max: 37.2 },
      lowFever: { min: 37.3, max: 37.8 },
      fever: { min: 37.9, max: 39 },
      highFever: { min: 39.1 },
    },
  },

  // Especialidades médicas
  specialties: [
    'Cardiologia',
    'Dermatologia',
    'Endocrinologia',
    'Gastroenterologia',
    'Ginecologia',
    'Neurologia',
    'Oftalmologia',
    'Ortopedia',
    'Otorrinolaringologia',
    'Pediatria',
    'Psiquiatria',
    'Urologia',
  ],

  // Tipos de consulta
  consultationTypes: [
    'Consulta presencial',
    'Teleconsulta',
    'Consulta de retorno',
    'Consulta de urgência',
    'Consulta preventiva',
  ],
}

// Utilitários de conversão
export const conversionUtils = {
  // Converter Celsius para Fahrenheit
  celsiusToFahrenheit: (celsius: number): number => {
    return (celsius * 9) / 5 + 32
  },

  // Converter Fahrenheit para Celsius
  fahrenheitToCelsius: (fahrenheit: number): number => {
    return ((fahrenheit - 32) * 5) / 9
  },

  // Converter kg para libras
  kgToLbs: (kg: number): number => {
    return kg * 2.20462
  },

  // Converter libras para kg
  lbsToKg: (lbs: number): number => {
    return lbs / 2.20462
  },

  // Converter cm para pés e polegadas
  cmToFeetInches: (
    cm: number
  ): { feet: number; inches: number; formatted: string } => {
    const totalInches = cm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)

    return {
      feet,
      inches,
      formatted: `${feet}'${inches}"`,
    }
  },
}

// REMOVIDO: Hook useMedicalUtils() não usado
// REMOVIDO: export default não usado
// Use os exports nomeados diretamente: documentFormatters, medicalFormatters, etc.
