/**
 * @deprecated Este arquivo contém variantes customizadas de botões.
 * Considere usar @/components/ui/button.tsx (componente padrão shadcn/ui) sempre que possível.
 *
 * Apenas use ButtonBase se precisar das variantes específicas:
 * appointment, teleconsult, emergency, admin, success, warning, ou tamanhos cta/cta-sm
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Variantes de botões otimizadas
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Botões principais do site médico
        primary:
          'bg-blue-800 text-white shadow hover:bg-blue-700 focus-visible:ring-blue-800',
        secondary:
          'bg-navy-800 text-white shadow hover:bg-navy-700 focus-visible:ring-navy-800',
        outline:
          'border border-gray-600 text-white hover:bg-white/10 focus-visible:ring-gray-600',
        ghost: 'text-gray-300 hover:bg-gray-800/50 hover:text-white',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-600',

        // Botões específicos para agendamento
        appointment:
          'bg-blue-800 text-white hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200',
        teleconsult:
          'bg-green-700 text-white hover:bg-green-600 shadow-lg transform hover:scale-105 transition-all duration-200',
        emergency:
          'bg-red-700 text-white hover:bg-red-600 shadow-lg transform hover:scale-105 transition-all duration-200',

        // Botões para área administrativa
        admin:
          'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-9 w-9',

        // Tamanhos específicos para CTAs
        cta: 'h-16 px-8 py-4 text-lg font-semibold rounded-lg',
        'cta-sm': 'h-12 px-6 py-3 text-base font-semibold rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className='animate-spin -ml-1 mr-2 h-4 w-4'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
        )}
        {!loading && leftIcon && <span className='mr-2'>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className='ml-2'>{rightIcon}</span>}
      </Comp>
    )
  }
)
ButtonBase.displayName = 'ButtonBase'

// Componentes de botão pré-configurados para casos comuns
export const AppointmentButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant' | 'size'>
>((props, ref) => (
  <ButtonBase ref={ref} variant='appointment' size='cta' {...props} />
))
AppointmentButton.displayName = 'AppointmentButton'

export const TeleconsultButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant' | 'size'>
>((props, ref) => (
  <ButtonBase ref={ref} variant='teleconsult' size='cta' {...props} />
))
TeleconsultButton.displayName = 'TeleconsultButton'

export const EmergencyButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'variant' | 'size'>
>((props, ref) => (
  <ButtonBase ref={ref} variant='emergency' size='cta' {...props} />
))
EmergencyButton.displayName = 'EmergencyButton'

// Hook para estilos de botão
export function useButtonStyles() {
  return {
    buttonVariants,
    getButtonClass: (
      variant?: ButtonProps['variant'],
      size?: ButtonProps['size'],
      additionalClasses?: string
    ) => {
      return cn(buttonVariants({ variant, size }), additionalClasses)
    },
  }
}

export { ButtonBase, buttonVariants }
export default ButtonBase
