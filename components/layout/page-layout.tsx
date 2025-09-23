import React from 'react'
import { cn } from '@/lib/utils'
import { ButtonBase } from '@/components/ui/button-base'
import { ArrowLeft, Share2, Bookmark } from 'lucide-react'
import Link from 'next/link'

// Tipos para configuração de layout
export interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  description?: string
  showBackButton?: boolean
  backButtonHref?: string
  showShareButton?: boolean
  showBookmarkButton?: boolean
  headerActions?: React.ReactNode
  className?: string
  containerClassName?: string
  headerClassName?: string
  contentClassName?: string
  variant?: 'default' | 'centered' | 'wide' | 'narrow'
  background?: 'default' | 'gradient' | 'dark' | 'light'
}

// Variantes de layout
const layoutVariants = {
  default: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    content: 'space-y-8',
  },
  centered: {
    container: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
    content: 'space-y-8 text-center',
  },
  wide: {
    container: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',
    content: 'space-y-8',
  },
  narrow: {
    container: 'max-w-2xl mx-auto px-4 sm:px-6 lg:px-8',
    content: 'space-y-6',
  },
}

const backgroundVariants = {
  default: 'bg-gray-950 text-white',
  gradient:
    'bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white',
  dark: 'bg-gray-900 text-white',
  light: 'bg-gray-100 text-gray-900',
}

export function PageLayout({
  children,
  title,
  subtitle,
  description,
  showBackButton = false,
  backButtonHref = '/',
  showShareButton = false,
  showBookmarkButton = false,
  headerActions,
  className,
  containerClassName,
  headerClassName,
  contentClassName,
  variant = 'default',
  background = 'default',
}: PageLayoutProps) {
  const layoutConfig = layoutVariants[variant]
  const backgroundClass = backgroundVariants[background]

  const handleShare = async () => {
    if (navigator.share && title) {
      try {
        await navigator.share({
          title,
          text: description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href)
      // Aqui você poderia adicionar um toast de confirmação
    }
  }

  const handleBookmark = () => {
    // Implementar lógica de bookmark (localStorage, etc.)
    const bookmarks = JSON.parse(
      localStorage.getItem('medical_bookmarks') || '[]'
    )
    const newBookmark = {
      title,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }

    const exists = bookmarks.find((b: any) => b.url === newBookmark.url)
    if (!exists) {
      bookmarks.push(newBookmark)
      localStorage.setItem('medical_bookmarks', JSON.stringify(bookmarks))
      // Aqui você poderia adicionar um toast de confirmação
    }
  }

  return (
    <div className={cn(backgroundClass, 'min-h-screen', className)}>
      <div className={cn(layoutConfig.container, containerClassName)}>
        {/* Header da página */}
        {(title || showBackButton || headerActions) && (
          <header
            className={cn('py-8 border-b border-gray-800', headerClassName)}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                {showBackButton && (
                  <Link href={backButtonHref}>
                    <ButtonBase variant='ghost' size='icon'>
                      <ArrowLeft className='h-5 w-5' />
                    </ButtonBase>
                  </Link>
                )}

                <div>
                  {title && (
                    <h1 className='text-3xl font-bold text-white mb-2'>
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className='text-xl text-gray-300 mb-2'>{subtitle}</p>
                  )}
                  {description && (
                    <p className='text-gray-400 max-w-2xl'>{description}</p>
                  )}
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                {showShareButton && (
                  <ButtonBase
                    variant='ghost'
                    size='icon'
                    onClick={handleShare}
                    title='Compartilhar'
                  >
                    <Share2 className='h-5 w-5' />
                  </ButtonBase>
                )}

                {showBookmarkButton && (
                  <ButtonBase
                    variant='ghost'
                    size='icon'
                    onClick={handleBookmark}
                    title='Salvar'
                  >
                    <Bookmark className='h-5 w-5' />
                  </ButtonBase>
                )}

                {headerActions}
              </div>
            </div>
          </header>
        )}

        {/* Conteúdo principal */}
        <main className={cn(layoutConfig.content, 'py-8', contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  )
}

// Componente para seções dentro do layout
export interface SectionProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  headerClassName?: string
  contentClassName?: string
  variant?: 'default' | 'card' | 'highlight'
}

export function Section({
  children,
  title,
  subtitle,
  className,
  headerClassName,
  contentClassName,
  variant = 'default',
}: SectionProps) {
  const sectionVariants = {
    default: 'space-y-6',
    card: 'bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 space-y-6',
    highlight:
      'bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 space-y-6',
  }

  return (
    <section className={cn(sectionVariants[variant], className)}>
      {(title || subtitle) && (
        <header className={cn('space-y-2', headerClassName)}>
          {title && <h2 className='text-2xl font-bold text-white'>{title}</h2>}
          {subtitle && <p className='text-gray-300'>{subtitle}</p>}
        </header>
      )}

      <div className={cn(contentClassName)}>{children}</div>
    </section>
  )
}

// Hook para gerenciar estado de layout
export function usePageLayout() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const showError = React.useCallback((message: string) => {
    setError(message)
    setTimeout(() => setError(null), 5000)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    setIsLoading,
    error,
    showError,
    clearError,
  }
}

export default PageLayout
