import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrazilianDatePicker } from '../../../components/ui/brazilian-date-picker'

describe('BrazilianDatePicker', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render with default props', () => {
    render(<BrazilianDatePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'DD/MM/AAAA')
  })

  it('should display initial value correctly', () => {
    const initialValue = '2024-01-15' // ISO format
    render(<BrazilianDatePicker value={initialValue} onChange={mockOnChange} />)
    
    const input = screen.getByDisplayValue('15/01/2024')
    expect(input).toBeInTheDocument()
  })

  it('should call onChange when date is entered', () => {
    render(<BrazilianDatePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '15012024' } })
    
    expect(mockOnChange).toHaveBeenCalledWith('2024-01-15')
  })

  it('should format date input as user types', () => {
    render(<BrazilianDatePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    
    // Test partial input formatting
    fireEvent.change(input, { target: { value: '15' } })
    expect(input).toHaveValue('15')
    
    fireEvent.change(input, { target: { value: '1501' } })
    expect(input).toHaveValue('15/01')
    
    fireEvent.change(input, { target: { value: '15012024' } })
    expect(input).toHaveValue('15/01/2024')
  })

  it('should handle partial input', () => {
    render(<BrazilianDatePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '15/01' } })
    
    expect(input).toHaveValue('15/01')
  })

  it('should apply custom className', () => {
    const customClass = 'custom-date-picker'
    render(<BrazilianDatePicker value="" className={customClass} onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass(customClass)
  })

  it('should be required when required prop is true', () => {
    render(<BrazilianDatePicker value="" required onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('should limit input to 8 digits', () => {
    render(<BrazilianDatePicker value="" onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '123456789' } })
    
    // Should be limited to 8 digits formatted as DD/MM/AAAA
    expect(input).toHaveValue('12/34/5678')
  })
})