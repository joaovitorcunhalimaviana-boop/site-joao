'use client'

import { useState, useEffect, useRef } from 'react'
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface ConsultationTimerProps {
  onTimeUpdate?: (timeInSeconds: number) => void
  onStart?: () => void
  onPause?: () => void
  onStop?: () => void
  autoStart?: boolean // Nova prop para iniciar automaticamente
}

export default function ConsultationTimer({
  onTimeUpdate,
  onStart,
  onPause,
  onStop,
  autoStart = false,
}: ConsultationTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const pausedTimeRef = useRef<number>(0)

  // Efeito para iniciar automaticamente se autoStart for true
  useEffect(() => {
    if (autoStart) {
      handleStart()
    }

    // Cleanup: parar o timer quando o componente for desmontado
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoStart])

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1
          // Chamar onTimeUpdate após o setState para evitar problemas de render
          setTimeout(() => onTimeUpdate?.(newSeconds), 0)
          return newSeconds
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, onTimeUpdate])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = new Date()
      setIsRunning(true)
      setIsPaused(false)
      onStart?.()
    } else if (isPaused) {
      setIsPaused(false)
    }
  }

  const handlePause = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true)
      pausedTimeRef.current = seconds
      onPause?.()
    }
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
    setSeconds(0)
    pausedTimeRef.current = 0
    startTimeRef.current = null
    onStop?.()
  }

  const getStatusColor = () => {
    if (!isRunning) return 'text-gray-400'
    if (isPaused) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusText = () => {
    if (!isRunning) return 'Parado'
    if (isPaused) return 'Pausado'
    return 'Em andamento'
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-3'>
        <div
          className={`w-2 h-2 rounded-full ${isRunning && !isPaused ? 'bg-green-400 animate-pulse' : isPaused ? 'bg-yellow-400' : 'bg-gray-400'}`}
        ></div>
        <div className='text-lg font-mono font-medium text-white'>
          {formatTime(seconds)}
        </div>
        {startTimeRef.current && (
          <div className='text-xs text-gray-400'>
            desde{' '}
            {startTimeRef.current.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>

      <div className='flex items-center space-x-1'>
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {!autoStart && (
          <div className='flex space-x-1 ml-2'>
            {!isRunning || isPaused ? (
              <button
                onClick={handleStart}
                className='p-1 text-gray-400 hover:text-blue-400 transition-colors'
                title={!isRunning ? 'Iniciar' : 'Retomar'}
              >
                <PlayIcon className='h-3 w-3' />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className='p-1 text-gray-400 hover:text-yellow-400 transition-colors'
                title='Pausar'
              >
                <PauseIcon className='h-3 w-3' />
              </button>
            )}

            <button
              onClick={handleStop}
              disabled={!isRunning && seconds === 0}
              className='p-1 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
              title='Parar'
            >
              <StopIcon className='h-3 w-3' />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
