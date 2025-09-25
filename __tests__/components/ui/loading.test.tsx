import { render, screen, waitFor } from '@testing-library/react'
import {
  Loading,
  ButtonLoading,
  CardLoading,
  TableLoading,
  ListLoading,
  FormLoading,
  MedicalPageLoading,
  CalculatorLoading,
  useLoading,
  LoadingWithTimeout,
} from '@/components/ui/loading'
import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Loading Components', () => {
  describe('Loading', () => {
    it('should render with default props', () => {
      render(<Loading />)

      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveAttribute('aria-label', 'Carregando')
    })

    it('should render with custom text', () => {
      render(<Loading text='Processando dados...' />)

      expect(screen.getByText('Processando dados...')).toBeInTheDocument()
    })

    it('should render with different sizes', () => {
      const { rerender } = render(<Loading size='sm' />)
      expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4')

      rerender(<Loading size='lg' />)
      expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8')

      rerender(<Loading size='xl' />)
      expect(screen.getByRole('status')).toHaveClass('w-12', 'h-12')
    })

    it('should render with different variants', () => {
      const { rerender } = render(<Loading variant='spinner' />)
      expect(screen.getByRole('status')).toBeInTheDocument()

      rerender(<Loading variant='pulse' />)
      expect(screen.getByRole('status')).toBeInTheDocument()

      rerender(<Loading variant='medical' />)
      expect(screen.getByRole('status')).toBeInTheDocument()

      rerender(<Loading variant='skeleton' />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Loading className='custom-class' />)

      expect(screen.getByRole('status').parentElement).toHaveClass(
        'custom-class'
      )
    })
  })

  describe('ButtonLoading', () => {
    it('should render button loading state', () => {
      render(<ButtonLoading />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      render(<ButtonLoading className='custom-button' />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-button')
    })

    it('should apply custom className to button', () => {
      render(<ButtonLoading className='custom-button' />)

      expect(screen.getByRole('button')).toHaveClass('custom-button')
    })
  })

  describe('CardLoading', () => {
    it('should render card loading skeleton', () => {
      render(<CardLoading />)

      const card = screen.getByTestId('card-loading')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('animate-pulse')
    })

    it('should render with custom className', () => {
      render(<CardLoading className='custom-class' />)

      expect(screen.getByTestId('card-loading')).toHaveClass('custom-class')
    })

    it('should render card loading skeleton', () => {
      render(<CardLoading />)

      expect(screen.getByTestId('card-loading')).toBeInTheDocument()
    })
  })

  describe('TableLoading', () => {
    it('should render table loading skeleton', () => {
      render(<TableLoading />)

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      // Verificar se tem linhas de skeleton
      const rows = screen.getAllByTestId('table-row-skeleton')
      expect(rows).toHaveLength(5) // Default rows
    })

    it('should render custom number of rows', () => {
      render(<TableLoading rows={3} />)

      const rows = screen.getAllByTestId('table-row-skeleton')
      expect(rows).toHaveLength(3)
    })

    it('should render custom number of columns', () => {
      render(<TableLoading columns={4} />)

      const firstRow = screen.getAllByTestId('table-row-skeleton')[0]
      const cells = firstRow.querySelectorAll('td')
      expect(cells).toHaveLength(4)
    })
  })

  describe('ListLoading', () => {
    it('should render list loading skeleton', () => {
      render(<ListLoading />)

      const list = screen.getByTestId('list-loading')
      expect(list).toBeInTheDocument()

      const items = screen.getAllByTestId('list-item-skeleton')
      expect(items).toHaveLength(3)
    })

    it('should render custom number of items', () => {
      render(<ListLoading items={5} />)

      const items = screen.getAllByTestId('list-item-skeleton')
      expect(items).toHaveLength(5)
    })
  })

  describe('FormLoading', () => {
    it('should render form loading skeleton', () => {
      render(<FormLoading />)

      const form = screen.getByTestId('form-loading')
      expect(form).toBeInTheDocument()

      const fields = screen.getAllByTestId('form-field-skeleton')
      expect(fields).toHaveLength(4) // Default fields
    })

    it('should render custom number of fields', () => {
      render(<FormLoading fields={6} />)

      const fields = screen.getAllByTestId('form-field-skeleton')
      expect(fields).toHaveLength(6)
    })
  })

  describe('MedicalPageLoading', () => {
    it('should render medical page loading layout', () => {
      render(<MedicalPageLoading />)

      expect(screen.getByTestId('medical-page-loading')).toBeInTheDocument()
      expect(screen.getByTestId('header-skeleton')).toBeInTheDocument()
      expect(screen.getByTestId('content-skeleton')).toBeInTheDocument()
    })
  })

  describe('CalculatorLoading', () => {
    it('should render medical calculator loading layout', () => {
      render(<CalculatorLoading />)

      expect(screen.getByTestId('calculator-loading')).toBeInTheDocument()
      expect(
        screen.getByTestId('calculator-header-skeleton')
      ).toBeInTheDocument()
      expect(screen.getByTestId('calculator-form-skeleton')).toBeInTheDocument()
    })

    it('should render calculator loading skeleton', () => {
      render(<CalculatorLoading />)

      expect(
        screen.getByTestId('calculator-result-skeleton')
      ).toBeInTheDocument()
    })
  })
})

describe('Loading Hooks', () => {
  describe('useLoading', () => {
    it('should initialize with false loading state', () => {
      const { result } = renderHook(() => useLoading())

      expect(result.current.isLoading).toBe(false)
    })

    it('should start and stop loading', () => {
      const { result } = renderHook(() => useLoading())

      act(() => {
        result.current.startLoading()
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.stopLoading()
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should toggle loading state', () => {
      const { result } = renderHook(() => useLoading())

      act(() => {
        result.current.toggleLoading()
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.toggleLoading()
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should set loading state directly', () => {
      const { result } = renderHook(() => useLoading())

      act(() => {
        result.current.setIsLoading(true)
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setIsLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should initialize with custom initial state', () => {
      const { result } = renderHook(() => useLoading(true))

      expect(result.current.isLoading).toBe(true)
    })
  })
})

describe('LoadingWithTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should render loading component', () => {
    render(<LoadingWithTimeout text='Loading...' />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should call onTimeout after timeout', async () => {
    const onTimeoutMock = jest.fn()

    render(
      <LoadingWithTimeout
        timeout={5000}
        onTimeout={onTimeoutMock}
        text='Loading...'
      />
    )

    // Avançar o tempo para depois do timeout
    act(() => {
      jest.advanceTimersByTime(6000)
    })

    expect(onTimeoutMock).toHaveBeenCalled()
  })

  it('should render with different variants', () => {
    render(<LoadingWithTimeout variant='medical' text='Medical Loading' />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Medical Loading')).toBeInTheDocument()
  })

  it('should render with different sizes', () => {
    render(<LoadingWithTimeout size='lg' text='Large Loading' />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Large Loading')).toBeInTheDocument()
  })

  it('should clear timeout when component unmounts', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    const { unmount } = render(
      <LoadingWithTimeout timeout={5000} text='Loading...' />
    )

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})

// Testes de acessibilidade
describe('Loading Components - Accessibility', () => {
  it('should have proper ARIA attributes', () => {
    render(<Loading />)

    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Carregando')
  })

  it('should have proper ARIA attributes for button loading', () => {
    render(<ButtonLoading />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should support custom aria-label', () => {
    render(<Loading aria-label='Processando dados' />)

    expect(screen.getByLabelText('Processando dados')).toBeInTheDocument()
  })
})

// Testes de performance
describe('Loading Components - Performance', () => {
  it('should not cause unnecessary re-renders', () => {
    const renderSpy = jest.fn()

    const TestComponent = () => {
      renderSpy()
      return <Loading />
    }

    const { rerender } = render(<TestComponent />)

    // Re-render com as mesmas props
    rerender(<TestComponent />)

    expect(renderSpy).toHaveBeenCalledTimes(2)
  })

  it('should handle rapid state changes in useLoading', () => {
    const { result } = renderHook(() => useLoading())

    // Múltiplas mudanças rápidas
    act(() => {
      result.current.startLoading()
      result.current.stopLoading()
      result.current.startLoading()
      result.current.stopLoading()
    })

    expect(result.current.isLoading).toBe(false)
  })
})
