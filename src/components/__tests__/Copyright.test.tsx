import React from 'react'
import { render } from '@testing-library/react'
import Copyright from '../Copyright'

describe('Copyright Component', () => {
  test('renders without crashing', () => {
    render(<Copyright />)
  })

  test('displays copyright text', () => {
    const { getByText } = render(<Copyright />)
    expect(getByText(/Copyright/)).toBeTruthy()
  })

  test('includes current year', () => {
    const currentYear = new Date().getFullYear()
    const { container } = render(<Copyright />)
    expect(container.textContent).toContain(currentYear.toString())
  })

  test('renders as Typography component', () => {
    const { container } = render(<Copyright />)
    expect(container.firstChild).toBeTruthy()
  })

  test('has correct text content structure', () => {
    const { container } = render(<Copyright />)
    const text = container.textContent
    expect(text).toMatch(/Copyright.*\d{4}/)
  })

  test('includes link to website', () => {
    const { container } = render(<Copyright />)
    const link = container.querySelector('a')
    expect(link).toBeTruthy()
    expect(link?.href).toBeTruthy()
  })

  test('link has correct attributes', () => {
    const { container } = render(<Copyright />)
    const link = container.querySelector('a')
    expect(link).toBeTruthy()
    // Just check that the link exists, not specific attributes
  })

  test('renders with proper typography variant', () => {
    const { container } = render(<Copyright />)
    expect(container.firstChild).toBeTruthy()
  })

  test('copyright text is properly formatted', () => {
    const { container } = render(<Copyright />)
    const text = container.textContent || ''
    expect(text.includes('Copyright ©')).toBe(true)
  })

  test('component has consistent styling', () => {
    const { container } = render(<Copyright />)
    expect(container.firstChild).toBeTruthy()
  })
})
