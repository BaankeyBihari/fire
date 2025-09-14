import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import FormSection from '../FormSection'
import { TextField } from '@mui/material'

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('FormSection', () => {
  it('should render with title and children in card variant', () => {
    renderWithTheme(
      <FormSection title="Test Section" variant="card">
        <TextField label="Test Field" />
      </FormSection>
    )

    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
  })

  it('should render with title and children in outlined variant', () => {
    renderWithTheme(
      <FormSection title="Outlined Section" variant="outlined">
        <TextField label="Test Field" />
      </FormSection>
    )

    expect(screen.getByText('Outlined Section')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
    // Should have a divider in outlined variant
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('should render with default card variant when variant is not specified', () => {
    renderWithTheme(
      <FormSection title="Default Section">
        <TextField label="Test Field" />
      </FormSection>
    )

    expect(screen.getByText('Default Section')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
  })

  it('should apply custom spacing', () => {
    renderWithTheme(
      <FormSection title="Custom Spacing" spacing={4}>
        <TextField label="Field 1" />
        <TextField label="Field 2" />
      </FormSection>
    )

    expect(screen.getByText('Custom Spacing')).toBeInTheDocument()
    expect(screen.getByLabelText('Field 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Field 2')).toBeInTheDocument()
  })

  it('should apply custom elevation in card variant', () => {
    renderWithTheme(
      <FormSection title="Elevated Section" variant="card" elevation={3}>
        <TextField label="Test Field" />
      </FormSection>
    )

    expect(screen.getByText('Elevated Section')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument()
  })

  it('should handle multiple children', () => {
    renderWithTheme(
      <FormSection title="Multiple Children">
        <TextField label="Field 1" />
        <TextField label="Field 2" />
        <TextField label="Field 3" />
      </FormSection>
    )

    expect(screen.getByLabelText('Field 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Field 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Field 3')).toBeInTheDocument()
  })

  it('should handle empty children', () => {
    renderWithTheme(<FormSection title="Empty Section">{null}</FormSection>)

    expect(screen.getByText('Empty Section')).toBeInTheDocument()
  })

  it('should render complex children components', () => {
    renderWithTheme(
      <FormSection title="Complex Section">
        <div data-testid="custom-component">
          <TextField label="Nested Field" />
          <button>Custom Button</button>
        </div>
      </FormSection>
    )

    expect(screen.getByText('Complex Section')).toBeInTheDocument()
    expect(screen.getByTestId('custom-component')).toBeInTheDocument()
    expect(screen.getByLabelText('Nested Field')).toBeInTheDocument()
    expect(screen.getByText('Custom Button')).toBeInTheDocument()
  })

  it('should display as h3 heading for accessibility', () => {
    renderWithTheme(
      <FormSection title="Accessibility Test">
        <TextField label="Test Field" />
      </FormSection>
    )

    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toHaveTextContent('Accessibility Test')
  })

  it('should maintain consistent styling between variants', () => {
    const { rerender } = renderWithTheme(
      <FormSection title="Card Test" variant="card">
        <TextField label="Test Field" />
      </FormSection>
    )

    expect(screen.getByText('Card Test')).toBeInTheDocument()

    rerender(
      <ThemeProvider theme={theme}>
        <FormSection title="Outlined Test" variant="outlined">
          <TextField label="Test Field" />
        </FormSection>
      </ThemeProvider>
    )

    expect(screen.getByText('Outlined Test')).toBeInTheDocument()
  })
})
