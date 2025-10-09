import React from 'react'
import { UserIcon, PhoneIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  phone: string
  whatsapp: string
  insurance: {
    type: 'particular' | 'unimed' | 'outro'
    plan?: string
  }
  birthDate?: string
  consultation?: {
    id: string
    time: string
    type: string
    status: string
  }
}

interface PatientCardProps {
  patient: Patient
  onStartConsultation?: (patientId: string) => void
  onRemoveFromAgenda?: (patientId: string) => void
  onDeletePatient?: (patientId: string, patientName: string) => void
  onScheduleConsultation?: (patientId: string) => void
  formatTime: (time: string) => string
  getStatusColor: (status: string) => string
  getTypeColor: (type: string) => string
  activeTab: 'today' | 'all' | 'attended'
}

const PatientCard: React.FC<PatientCardProps> = React.memo(({
  patient,
  onStartConsultation,
  onRemoveFromAgenda,
  onDeletePatient,
  onScheduleConsultation,
  formatTime,
  getStatusColor,
  getTypeColor,
  activeTab
}) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {patient.name}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <PhoneIcon className="h-4 w-4 mr-1" />
              {patient.phone}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          patient.insurance.type === 'particular' 
            ? 'bg-green-100 text-green-800'
            : patient.insurance.type === 'unimed'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {patient.insurance.type === 'particular' ? 'Particular' : 
           patient.insurance.type === 'unimed' ? 'Unimed' : 'Outro'}
        </span>
      </td>

      {patient.consultation && (
        <>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center text-sm text-gray-900">
              <ClockIcon className="h-4 w-4 mr-1" />
              {formatTime(patient.consultation.time)}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(patient.consultation.type)}`}>
              {patient.consultation.type}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.consultation.status)}`}>
              {patient.consultation.status}
            </span>
          </td>
        </>
      )}

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {activeTab === 'today' && patient.consultation && (
          <>
            <button
              onClick={() => onStartConsultation?.(patient.id)}
              className="text-green-600 hover:text-green-900 mr-3 transition-colors duration-200"
            >
              Atender
            </button>
            <button
              onClick={() => onRemoveFromAgenda?.(patient.id)}
              className="text-red-600 hover:text-red-900 transition-colors duration-200"
            >
              Remover
            </button>
          </>
        )}
        {activeTab === 'attended' && (
          <span className="text-green-600 font-medium">Atendido</span>
        )}
        {activeTab === 'all' && (
          <>
            {!patient.consultation && (
              <button
                onClick={() => onScheduleConsultation?.(patient.id)}
                className="text-blue-400 hover:text-blue-300 mr-3 transition-colors duration-200"
              >
                Agendar
              </button>
            )}
            <button
              onClick={() => onDeletePatient?.(patient.id, patient.name)}
              className="text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              Excluir
            </button>
          </>
        )}
      </td>
    </tr>
  )
})

PatientCard.displayName = 'PatientCard'

export default PatientCard