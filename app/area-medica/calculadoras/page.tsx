'use client'

import CalculatorTabs from '@/components/ui/calculator-tabs'
import BackgroundPattern from '@/components/ui/background-pattern'
import MedicalAreaMenu from '../../../components/ui/medical-area-menu'
import { Calculator } from 'lucide-react'

export default function CalculadorasPage() {
  return (
    <div className='min-h-screen bg-black'>
      <BackgroundPattern />
      <div className='relative isolate'>
        <div className='pt-20 pb-8'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='max-w-6xl mx-auto'>
              {/* Header */}
              <div className='flex items-center justify-between mb-8'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700'>
                    <Calculator className='w-8 h-8 text-blue-400' />
                  </div>
                  <div>
                    <h1 className='text-4xl font-bold text-white'>
                      Calculadoras Médicas
                    </h1>
                    <p className='text-gray-300 text-lg mt-2'>
                      Ferramentas para avaliação clínica em coloproctologia
                    </p>
                  </div>
                </div>
                <MedicalAreaMenu currentPage='calculadoras' />
              </div>

              <CalculatorTabs />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
