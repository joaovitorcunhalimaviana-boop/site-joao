'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-lg p-6'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-white mb-2'>
            Algo deu errado!
          </h2>
          <p className='text-gray-300 mb-4'>
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            onClick={reset}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors'
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  )
}
