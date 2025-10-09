import {
  medicalFormatters,
  medicalCalculators,
  medicalValidators,
  conversionUtils,
  medicalConstants,
} from '@/lib/medical-utils'

describe('Medical Utils - Formatters', () => {
  describe('medicalFormatters.bmi', () => {
    it('should calculate BMI correctly for normal weight', () => {
      const result = medicalFormatters.bmi(70, 175)
      expect(result.value).toBeCloseTo(22.9, 1)
      expect(result.category).toBe('Peso normal')
      expect(result.formatted).toBe('22.9 kg/m² (Peso normal)')
    })

    it('should categorize underweight correctly', () => {
      const result = medicalFormatters.bmi(45, 175)
      expect(result.value).toBeCloseTo(14.7, 1)
      expect(result.category).toBe('Abaixo do peso')
    })

    it('should categorize overweight correctly', () => {
      const result = medicalFormatters.bmi(85, 175)
      expect(result.value).toBeCloseTo(27.8, 1)
      expect(result.category).toBe('Sobrepeso')
    })

    it('should categorize obesity grade I correctly', () => {
      const result = medicalFormatters.bmi(95, 175)
      expect(result.value).toBeCloseTo(31.0, 1)
      expect(result.category).toBe('Obesidade grau I')
    })

    it('should categorize obesity grade II correctly', () => {
      const result = medicalFormatters.bmi(110, 175)
      expect(result.value).toBeCloseTo(35.9, 1)
      expect(result.category).toBe('Obesidade grau II')
    })

    it('should categorize obesity grade III correctly', () => {
      const result = medicalFormatters.bmi(125, 175)
      expect(result.value).toBeCloseTo(40.8, 1)
      expect(result.category).toBe('Obesidade grau III')
    })
  })

  describe('medicalFormatters.bloodPressure', () => {
    it('should categorize normal blood pressure', () => {
      const result = medicalFormatters.bloodPressure(110, 70)
      expect(result.formatted).toBe('110/70 mmHg')
      expect(result.category).toBe('Normal')
    })

    it('should categorize elevated blood pressure', () => {
      const result = medicalFormatters.bloodPressure(125, 75)
      expect(result.category).toBe('Elevada')
    })

    it('should categorize stage 1 hypertension', () => {
      const result = medicalFormatters.bloodPressure(135, 85)
      expect(result.category).toBe('Hipertensão estágio 1')
    })

    it('should categorize stage 2 hypertension', () => {
      const result = medicalFormatters.bloodPressure(150, 95)
      expect(result.category).toBe('Hipertensão estágio 2')
    })

    it('should categorize hypertensive crisis', () => {
      const result = medicalFormatters.bloodPressure(190, 125)
      expect(result.category).toBe('Crise hipertensiva')
    })
  })

  describe('medicalFormatters.temperature', () => {
    it('should categorize normal temperature', () => {
      const result = medicalFormatters.temperature(36.5)
      expect(result.formatted).toBe('36.5°C')
      expect(result.status).toBe('Normal')
    })

    it('should categorize hypothermia', () => {
      const result = medicalFormatters.temperature(35.0)
      expect(result.status).toBe('Hipotermia')
    })

    it('should categorize low fever', () => {
      const result = medicalFormatters.temperature(37.5)
      expect(result.status).toBe('Febre baixa')
    })

    it('should categorize fever', () => {
      const result = medicalFormatters.temperature(38.5)
      expect(result.status).toBe('Febre')
    })

    it('should categorize high fever', () => {
      const result = medicalFormatters.temperature(39.5)
      expect(result.status).toBe('Febre alta')
    })
  })
})

describe('Medical Utils - Calculators', () => {
  describe('medicalCalculators.doseByWeight', () => {
    it('should calculate dose correctly', () => {
      const dose = medicalCalculators.doseByWeight(70, 10)
      expect(dose).toBe(700)
    })

    it('should handle decimal weights', () => {
      const dose = medicalCalculators.doseByWeight(65.5, 5.5)
      expect(dose).toBeCloseTo(360.25, 2)
    })
  })

  describe('medicalCalculators.bodySurfaceArea', () => {
    it('should calculate BSA using Mosteller formula', () => {
      const bsa = medicalCalculators.bodySurfaceArea(70, 175)
      expect(bsa).toBeCloseTo(1.84, 2)
    })

    it('should handle different body sizes', () => {
      const bsa = medicalCalculators.bodySurfaceArea(50, 160)
      expect(bsa).toBeCloseTo(1.49, 2)
    })
  })

  describe('medicalCalculators.basalMetabolicRate', () => {
    it('should calculate BMR for male using Harris-Benedict', () => {
      const bmr = medicalCalculators.basalMetabolicRate(70, 175, 30, 'M')
      expect(bmr).toBeCloseTo(1695.7, 1)
    })

    it('should calculate BMR for female using Harris-Benedict', () => {
      const bmr = medicalCalculators.basalMetabolicRate(60, 165, 25, 'F')
      expect(bmr).toBeCloseTo(1405.3, 1)
    })
  })

  describe('medicalCalculators.creatinineClearance', () => {
    it('should calculate creatinine clearance for male', () => {
      const clearance = medicalCalculators.creatinineClearance(30, 70, 1.0, 'M')
      expect(clearance).toBeCloseTo(106.9, 1)
    })

    it('should calculate creatinine clearance for female', () => {
      const clearance = medicalCalculators.creatinineClearance(30, 60, 0.8, 'F')
      expect(clearance).toBeCloseTo(97.4, 1)
    })
  })
})

describe('Medical Utils - Validators', () => {
  describe('medicalValidators.isNormalBMI', () => {
    it('should return true for normal BMI', () => {
      expect(medicalValidators.isNormalBMI(70, 175)).toBe(true)
    })

    it('should return false for underweight', () => {
      expect(medicalValidators.isNormalBMI(45, 175)).toBe(false)
    })

    it('should return false for overweight', () => {
      expect(medicalValidators.isNormalBMI(85, 175)).toBe(false)
    })
  })

  describe('medicalValidators.isNormalBloodPressure', () => {
    it('should return true for normal blood pressure', () => {
      expect(medicalValidators.isNormalBloodPressure(110, 70)).toBe(true)
    })

    it('should return false for elevated blood pressure', () => {
      expect(medicalValidators.isNormalBloodPressure(125, 85)).toBe(false)
    })
  })

  describe('medicalValidators.isNormalTemperature', () => {
    it('should return true for normal temperature', () => {
      expect(medicalValidators.isNormalTemperature(36.5)).toBe(true)
    })

    it('should return false for fever', () => {
      expect(medicalValidators.isNormalTemperature(38.5)).toBe(false)
    })

    it('should return false for hypothermia', () => {
      expect(medicalValidators.isNormalTemperature(35.0)).toBe(false)
    })
  })
})

describe('Medical Utils - Conversion Utils', () => {
  describe('conversionUtils.celsiusToFahrenheit', () => {
    it('should convert Celsius to Fahrenheit correctly', () => {
      expect(conversionUtils.celsiusToFahrenheit(0)).toBe(32)
      expect(conversionUtils.celsiusToFahrenheit(37)).toBeCloseTo(98.6, 1)
      expect(conversionUtils.celsiusToFahrenheit(100)).toBe(212)
    })
  })

  describe('conversionUtils.fahrenheitToCelsius', () => {
    it('should convert Fahrenheit to Celsius correctly', () => {
      expect(conversionUtils.fahrenheitToCelsius(32)).toBe(0)
      expect(conversionUtils.fahrenheitToCelsius(98.6)).toBeCloseTo(37, 1)
      expect(conversionUtils.fahrenheitToCelsius(212)).toBe(100)
    })
  })

  describe('conversionUtils.kgToLbs', () => {
    it('should convert kg to lbs correctly', () => {
      expect(conversionUtils.kgToLbs(70)).toBeCloseTo(154.3, 1)
      expect(conversionUtils.kgToLbs(50)).toBeCloseTo(110.2, 1)
    })
  })

  describe('conversionUtils.lbsToKg', () => {
    it('should convert lbs to kg correctly', () => {
      expect(conversionUtils.lbsToKg(154.3)).toBeCloseTo(70, 1)
      expect(conversionUtils.lbsToKg(110.2)).toBeCloseTo(50, 1)
    })
  })

  describe('conversionUtils.cmToFeetInches', () => {
    it('should convert cm to feet and inches correctly', () => {
      const result = conversionUtils.cmToFeetInches(175)
      expect(result.feet).toBe(5)
      expect(result.inches).toBe(9)
      expect(result.formatted).toBe('5\'9"')
    })

    it('should handle different heights', () => {
      const result = conversionUtils.cmToFeetInches(160)
      expect(result.feet).toBe(5)
      expect(result.inches).toBe(3)
      expect(result.formatted).toBe('5\'3"')
    })
  })
})

describe('Medical Utils - Constants', () => {
  describe('medicalConstants.referenceValues', () => {
    it('should have correct BMI reference values', () => {
      expect(medicalConstants.referenceValues.bmi.normal.min).toBe(18.5)
      expect(medicalConstants.referenceValues.bmi.normal.max).toBe(24.9)
      expect(medicalConstants.referenceValues.bmi.overweight.min).toBe(25)
      expect(medicalConstants.referenceValues.bmi.overweight.max).toBe(29.9)
    })

    it('should have correct blood pressure reference values', () => {
      expect(
        medicalConstants.referenceValues.bloodPressure.normal.systolic.max
      ).toBe(119)
      expect(
        medicalConstants.referenceValues.bloodPressure.normal.diastolic.max
      ).toBe(79)
    })

    it('should have correct temperature reference values', () => {
      expect(medicalConstants.referenceValues.temperature.normal.min).toBe(36)
      expect(medicalConstants.referenceValues.temperature.normal.max).toBe(37.2)
    })
  })

  describe('medicalConstants.specialties', () => {
    it('should contain expected medical specialties', () => {
      expect(medicalConstants.specialties).toContain('Cardiologia')
      expect(medicalConstants.specialties).toContain('Endocrinologia')
      expect(medicalConstants.specialties).toContain('Gastroenterologia')
      expect(medicalConstants.specialties.length).toBeGreaterThan(10)
    })
  })

  describe('medicalConstants.consultationTypes', () => {
    it('should contain expected consultation types', () => {
      expect(medicalConstants.consultationTypes).toContain(
        'Consulta presencial'
      )
      expect(medicalConstants.consultationTypes).toContain('Teleconsulta')
      expect(medicalConstants.consultationTypes).toContain(
        'Consulta de urgência'
      )
    })
  })
})
