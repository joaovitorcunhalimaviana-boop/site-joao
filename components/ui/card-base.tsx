/**
 * @deprecated Este arquivo contém variantes customizadas de cards.
 * Use @/components/ui/card.tsx (componente padrão shadcn/ui) para novos desenvolvimentos.
 *
 * CardBase deve ser usado apenas se precisar das variantes específicas de tema dark:
 * interactive, elevated, full
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

// Estilos padronizados para cards
export const cardStyles = {
  primary: 'bg-gray-900/50 backdrop-blur-sm border border-gray-700',
  hover: 'hover:border-blue-500 transition-all duration-300',
  rounded: 'rounded-xl',
  padding: 'p-6',
  shadow: 'shadow-xl',
}

// Variantes de cards
export const cardVariants = {
  default: `${cardStyles.primary} ${cardStyles.rounded} ${cardStyles.padding}`,
  interactive: `${cardStyles.primary} ${cardStyles.hover} ${cardStyles.rounded} ${cardStyles.padding}`,
  elevated: `${cardStyles.primary} ${cardStyles.shadow} ${cardStyles.rounded} ${cardStyles.padding}`,
  full: `${cardStyles.primary} ${cardStyles.hover} ${cardStyles.shadow} ${cardStyles.rounded} ${cardStyles.padding}`,
}

interface CardBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof cardVariants
  children: React.ReactNode
}

export function CardBase({
  variant = 'default',
  className,
  children,
  ...props
}: CardBaseProps) {
  return (
    <div className={cn(cardVariants[variant], className)} {...props}>
      {children}
    </div>
  )
}

// Hook para usar estilos de card
export function useCardStyles() {
  return {
    cardStyles,
    cardVariants,
    getCardClass: (
      variant: keyof typeof cardVariants = 'default',
      additionalClasses?: string
    ) => {
      return cn(cardVariants[variant], additionalClasses)
    },
  }
}

export default CardBase
