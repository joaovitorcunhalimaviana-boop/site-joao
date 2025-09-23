// Sistema de tema centralizado para o site médico

// Paleta de cores principal
export const colors = {
  // Cores primárias do site médico
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Cores secundárias (navy/azul escuro)
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Cores de status médico
  medical: {
    success: '#10b981', // Verde para resultados positivos
    warning: '#f59e0b', // Amarelo para atenção
    danger: '#ef4444', // Vermelho para urgência
    info: '#3b82f6', // Azul para informações
    emergency: '#dc2626', // Vermelho intenso para emergências
  },

  // Tons de cinza otimizados
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
}

// Configurações de tema
export const theme = {
  colors,

  // Espaçamentos consistentes
  spacing: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem', // 96px
  },

  // Tipografia médica
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
  },

  // Sombras para elementos médicos
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    medical: '0 4px 20px rgb(59 130 246 / 0.15)', // Sombra azul médica
    emergency: '0 4px 20px rgb(239 68 68 / 0.15)', // Sombra vermelha de emergência
  },

  // Bordas arredondadas
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Transições suaves
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
}

// Classes CSS pré-definidas para componentes médicos
export const medicalStyles = {
  // Cards médicos
  card: {
    base: 'bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg',
    hover: 'hover:border-blue-500 transition-all duration-300',
    interactive:
      'hover:border-blue-500 hover:shadow-medical transition-all duration-300 cursor-pointer',
  },

  // Botões médicos
  button: {
    primary: 'bg-blue-800 text-white hover:bg-blue-700 focus:ring-blue-800',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-600',
    emergency: 'bg-red-700 text-white hover:bg-red-600 focus:ring-red-600',
    success: 'bg-green-700 text-white hover:bg-green-600 focus:ring-green-600',
  },

  // Inputs médicos
  input: {
    base: 'bg-gray-800 border-gray-600 text-white placeholder-gray-400',
    focus: 'focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  },

  // Textos médicos
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  },

  // Backgrounds médicos
  background: {
    primary: 'bg-gray-950',
    secondary: 'bg-gray-900',
    card: 'bg-gray-900/50',
    overlay: 'bg-black/50',
    gradient: 'bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950',
  },
}

// Utilitários para tema
export const themeUtils = {
  // Gerar classe CSS completa para card
  getCardClass: (
    variant: 'base' | 'hover' | 'interactive' = 'base',
    additionalClasses?: string
  ) => {
    const baseClass = medicalStyles.card.base
    const variantClass = medicalStyles.card[variant]
    return `${baseClass} ${variant !== 'base' ? variantClass : ''} ${additionalClasses || ''}`.trim()
  },

  // Gerar classe CSS para botão
  getButtonClass: (
    variant: keyof typeof medicalStyles.button,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return `${medicalStyles.button[variant]} ${sizeClasses[size]} rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900`
  },

  // Gerar classe CSS para input
  getInputClass: (hasError: boolean = false) => {
    const baseClass = `${medicalStyles.input.base} ${medicalStyles.input.focus}`
    return hasError ? `${baseClass} ${medicalStyles.input.error}` : baseClass
  },

  // Verificar se é tema escuro (sempre true para site médico)
  isDark: () => true,

  // Obter cor por nome
  getColor: (colorName: string, shade: number = 500) => {
    const colorPath = colorName.split('.')
    let color: any = colors

    for (const path of colorPath) {
      color = color[path]
      if (!color) return undefined
    }

    return typeof color === 'object' ? color[shade] : color
  },
}

// Hook para usar tema
export function useTheme() {
  return {
    theme,
    colors,
    medicalStyles,
    utils: themeUtils,
  }
}

export default theme
