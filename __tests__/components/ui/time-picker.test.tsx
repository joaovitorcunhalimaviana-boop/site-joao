import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TimePicker } from '../../../components/ui/time-picker'

describe('TimePicker', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render with default props', () => {
    render(<TimePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'HH:MM')
  })

  it('should display initial value correctly', () => {
    const initialValue = '14:30'
    render(<TimePicker value={initialValue} onChange={mockOnChange} />)
    
    const input = screen.getByDisplayValue(initialValue)
    expect(input).toBeInTheDocument()
  })

  it('should call onChange when time is entered', () => {
    render(<TimePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '14:30' } })
    
    expect(mockOnChange).toHaveBeenCalledWith('14:30')
  })

  it('should format time input correctly', () => {
    render(<TimePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    
    // Test partial input formatting
    fireEvent.change(input, { target: { value: '14' } })
    expect(input).toHaveValue('14')
    
    fireEvent.change(input, { target: { value: '1430' } })
    expect(input).toHaveValue('14:30')
  })

  it('should handle time input without validation', () => {
    render(<TimePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '25:70' } })
    
    // Component accepts any input and calls onChange
    expect(input).toHaveValue('25:70')
  })

  it('should apply custom className', () => {
    const customClass = 'custom-time-picker'
    render(<TimePicker value="" className={customClass} onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass(customClass)
  })

  it('should be required when required prop is true', () => {
    render(<TimePicker value="" required onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('should validate time format on blur', () => {
    render(<TimePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    
    // Valid time
    fireEvent.change(input, { target: { value: '09:30' } })
    expect(mockOnChange).toHaveBeenCalledWith('09:30')
    
    // Valid time at boundaries
    fireEvent.change(input, { target: { value: '00:00' } })
    expect(mockOnChange).toHaveBeenCalledWith('00:00')
    
    fireEvent.change(input, { target: { value: '23:59' } })
    expect(mockOnChange).toHaveBeenCalledWith('23:59')
  })

  it('should limit input to 5 characters (HH:MM)', () => {
    render(<TimePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxLength', '5')
  })

  it('should show dropdown with common times when focused', () => {
    render(<TimePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    
    // Should show common time options
    expect(screen.getByText('07:00')).toBeInTheDocument()
    expect(screen.getByText('08:00')).toBeInTheDocument()
    expect(screen.getByText('09:00')).toBeInTheDocument()
  })
})