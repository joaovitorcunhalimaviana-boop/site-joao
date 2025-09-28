'use client'

import { useState } from 'react'

interface MigrationResults {
  patients: { migrated: number; errors: number }
  appointments: { migrated: number; errors: number }
  total: { migrated: number; errors: number }
}

export default function MigrationPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<MigrationResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMigration = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log('🔄 Iniciando migração de dados...')
      
      const response = await fetch('/api/migrate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        console.log('✅ Migração concluída:', data.results)
      } else {
        setError(data.error || 'Erro desconhecido na migração')
        console.error('❌ Erro na migração:', data.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão'
      setError(errorMessage)
      console.error('❌ Erro na migração:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔄 Migração de Dados
        </h2>
        <p className="text-gray-600">
          Migre os dados do localStorage e arquivos de backup para o banco de dados persistente.
        </p>
      </div>

      {!results && !error && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              📋 O que será migrado:
            </h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Dados de pacientes (patients.json)</li>
              <li>• Agendamentos (unified-appointments.json)</li>
              <li>• Dados do localStorage do navegador</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-800 mb-2">
              ⚠️ Importante:
            </h3>
            <ul className="text-yellow-700 space-y-1">
              <li>• Esta operação não remove os dados existentes</li>
              <li>• Dados duplicados serão ignorados</li>
              <li>• O processo pode levar alguns minutos</li>
            </ul>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">❌ Erro na Migração</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {results && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-4">✅ Migração Concluída</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-2">👥 Pacientes</h4>
              <p className="text-green-600">✅ Migrados: {results.patients.migrated}</p>
              {results.patients.errors > 0 && (
                <p className="text-red-600">❌ Erros: {results.patients.errors}</p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-2">📅 Agendamentos</h4>
              <p className="text-green-600">✅ Migrados: {results.appointments.migrated}</p>
              {results.appointments.errors > 0 && (
                <p className="text-red-600">❌ Erros: {results.appointments.errors}</p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-2">📊 Total</h4>
              <p className="text-green-600">✅ Total: {results.total.migrated}</p>
              {results.total.errors > 0 && (
                <p className="text-red-600">❌ Erros: {results.total.errors}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleMigration}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Migrando dados...
            </span>
          ) : (
            '🚀 Iniciar Migração'
          )}
        </button>
      </div>

      {results && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setResults(null)
              setError(null)
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            🔄 Nova Migração
          </button>
        </div>
      )}
    </div>
  )
}