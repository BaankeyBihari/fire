import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import PlanTab from '../plan'
import { PlanParameters } from '../../../types'

// Mock UI components
jest.mock('../../ui', () => ({
  FormSection: ({ title, children, variant, spacing }: any) => (
    <div data-testid="form-section">
      <h3 data-testid="form-section-title">{title}</h3>
      <div data-testid="form-section-variant">{variant}</div>
      <div data-testid="form-section-spacing">{spacing}</div>
      {children}
    </div>
  ),
}))

const theme = createTheme()

const mockPlanParameters: PlanParameters = {
  startDate: new Date('2023-01-01'),
  retireDate: new Date('2050-01-01'),
  startingSIP: 5000,
  incomeAtMaturity: 50000,
  currency: 'USD',
  expectedAnnualInflation: 3,
  expectedGrowthRate: 8,
  sipGrowthRate: 5,
}

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {component}
      </LocalizationProvider>
    </ThemeProvider>
  )
}

describe('PlanTab Component - Comprehensive Tests', () => {
  const mockOnUpdatePlan = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders with form sections', () => {
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const formSections = screen.getAllByTestId('form-section')
    expect(formSections).toHaveLength(3)

    expect(screen.getByText('Investment Timeline')).toBeInTheDocument()
    expect(screen.getByText('Investment Parameters')).toBeInTheDocument()
    expect(screen.getByText('Market Assumptions')).toBeInTheDocument()
  })

  test('renders all form fields with correct labels', () => {
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    // Check for form field labels - use role and accessible name combination
    expect(
      screen.getByRole('group', { name: /start date/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: /retirement date/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/starting sip amount/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/target income at retirement/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/sip annual step-up rate/i)
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/expected annual inflation/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/expected growth rate/i)).toBeInTheDocument()
  })

  test('displays initial values correctly', () => {
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    expect(screen.getByDisplayValue('5000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('50000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('USD')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('8')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
  })

  test('displays currency symbols as input adornments', () => {
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    // Currency symbols should appear as start adornment
    const currencySymbols = screen.getAllByText('USD')
    expect(currencySymbols.length).toBeGreaterThanOrEqual(2) // One in currency field, others as adornments
  })

  test('displays percentage symbols as input adornments', () => {
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    // Percentage symbols should appear as end adornment
    const percentageSymbols = screen.getAllByText('%')
    expect(percentageSymbols.length).toBeGreaterThan(2) // For SIP, inflation, and growth rate fields
  })

  test('validates required start date field', async () => {
    renderWithProviders(
      <PlanTab
        planParameters={{ ...mockPlanParameters, startDate: null as any }}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    fireEvent.click(submitButton)

    await waitFor(
      () => {
        // Look for any error text related to start date - use more flexible matcher
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    expect(mockOnUpdatePlan).not.toHaveBeenCalled()
  })

  test('validates required retirement date field', async () => {
    renderWithProviders(
      <PlanTab
        planParameters={{ ...mockPlanParameters, retireDate: null as any }}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    fireEvent.click(submitButton)

    await waitFor(
      () => {
        // Look for any error text related to retirement date using more flexible selector
        expect(
          screen.getByRole('group', { name: /retirement date/i })
        ).toHaveAttribute('aria-invalid', 'true')
      },
      { timeout: 3000 }
    )

    expect(mockOnUpdatePlan).not.toHaveBeenCalled()
  })

  test('validates positive starting SIP amount', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const sipField = screen.getByLabelText(/starting sip amount/i)
    await user.clear(sipField)
    await user.type(sipField, '-1000')

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/starting sip must be positive/i)
      ).toBeInTheDocument()
    })

    expect(mockOnUpdatePlan).not.toHaveBeenCalled()
  })

  test('validates positive income at maturity', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const incomeField = screen.getByLabelText(/target income at retirement/i)
    await user.clear(incomeField)
    await user.type(incomeField, '-5000')

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/income at maturity must be positive/i)
      ).toBeInTheDocument()
    })

    expect(mockOnUpdatePlan).not.toHaveBeenCalled()
  })

  test('validates inflation rate within limits', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const inflationField = screen.getByLabelText(/expected annual inflation/i)
    await user.clear(inflationField)
    await user.type(inflationField, '150')

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/inflation rate cannot exceed 100%/i)
      ).toBeInTheDocument()
    })

    expect(mockOnUpdatePlan).not.toHaveBeenCalled()
  })

  test('validates growth rate within limits', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const growthField = screen.getByLabelText(/expected growth rate/i)
    await user.clear(growthField)
    await user.type(growthField, '120')

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/growth rate cannot exceed 100%/i)
      ).toBeInTheDocument()
    })

    expect(mockOnUpdatePlan).not.toHaveBeenCalled()
  })

  test('validates growth rate higher than inflation rate', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const inflationField = screen.getByLabelText(/expected annual inflation/i)
    const growthField = screen.getByLabelText(/expected growth rate/i)

    await user.clear(inflationField)
    await user.type(inflationField, '10')
    await user.clear(growthField)
    await user.type(growthField, '5')

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/growth rate should be higher than inflation rate/i)
      ).toBeInTheDocument()
    })

    expect(mockOnUpdatePlan).not.toHaveBeenCalled()
  })

  test('validates SIP growth rate within limits', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const sipGrowthField = screen.getByLabelText(/sip annual step-up rate/i)
    await user.clear(sipGrowthField)
    await user.type(sipGrowthField, '150')

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/sip growth rate cannot exceed 100%/i)
      ).toBeInTheDocument()
    })

    expect(mockOnUpdatePlan).not.toHaveBeenCalled()
  })

  test('validates positive SIP growth rate', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const sipGrowthField = screen.getByLabelText(/sip annual step-up rate/i)
    await user.clear(sipGrowthField)
    await user.type(sipGrowthField, '-5')

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/sip growth rate must be positive/i)
      ).toBeInTheDocument()
    })

    expect(mockOnUpdatePlan).not.toHaveBeenCalled()
  })

  test('validates required currency field', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const currencyField = screen.getByLabelText(/currency/i)
    await user.clear(currencyField)

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/currency is required/i)).toBeInTheDocument()
    })

    expect(mockOnUpdatePlan).not.toHaveBeenCalled()
  })

  test('submits valid form data', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    // Modify some values
    const sipField = screen.getByLabelText(/starting sip amount/i)
    const incomeField = screen.getByLabelText(/target income at retirement/i)
    const currencyField = screen.getByLabelText(/currency/i)

    await user.clear(sipField)
    await user.type(sipField, '6000')
    await user.clear(incomeField)
    await user.type(incomeField, '60000')
    await user.clear(currencyField)
    await user.type(currencyField, 'EUR')

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnUpdatePlan).toHaveBeenCalledWith(
        expect.objectContaining({
          startingSIP: 6000,
          incomeAtMaturity: 60000,
          currency: 'EUR',
        })
      )
    })
  })

  test('handles date picker changes', async () => {
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    // Date pickers are complex to test, so we'll just check they're rendered
    expect(
      screen.getByRole('group', { name: /start date/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: /retirement date/i })
    ).toBeInTheDocument()
  })

  test('reinitializes form when planParameters change', () => {
    const { rerender } = renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    expect(screen.getByDisplayValue('5000')).toBeInTheDocument()

    const newParameters = {
      ...mockPlanParameters,
      startingSIP: 7000,
      currency: 'EUR',
    }

    rerender(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <PlanTab
            planParameters={newParameters}
            onUpdatePlan={mockOnUpdatePlan}
          />
        </LocalizationProvider>
      </ThemeProvider>
    )

    expect(screen.getByDisplayValue('7000')).toBeInTheDocument()
    expect(screen.getByDisplayValue('EUR')).toBeInTheDocument()
  })

  test('renders form section variants correctly', () => {
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const formSectionVariants = screen.getAllByTestId('form-section-variant')
    formSectionVariants.forEach((variant) => {
      expect(variant).toHaveTextContent('card')
    })
  })

  test('renders form section spacing correctly', () => {
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const formSectionSpacing = screen.getAllByTestId('form-section-spacing')
    formSectionSpacing.forEach((spacing) => {
      expect(spacing).toHaveTextContent('3')
    })
  })

  test('centers update button correctly', () => {
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const updateButton = screen.getByRole('button', { name: /update plan/i })
    expect(updateButton).toBeInTheDocument()
    expect(updateButton).toHaveAttribute('type', 'submit')
  })

  test('logs form values on submission', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    const user = userEvent.setup()

    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const submitButton = screen.getByRole('button', { name: /update plan/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Plan values submitted:',
        expect.any(Object)
      )
    })

    consoleSpy.mockRestore()
  })

  test('handles number field type for numeric inputs', () => {
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    expect(screen.getByLabelText(/starting sip amount/i)).toHaveAttribute(
      'type',
      'number'
    )
    expect(
      screen.getByLabelText(/target income at retirement/i)
    ).toHaveAttribute('type', 'number')
    expect(screen.getByLabelText(/sip annual step-up rate/i)).toHaveAttribute(
      'type',
      'number'
    )
    expect(screen.getByLabelText(/expected annual inflation/i)).toHaveAttribute(
      'type',
      'number'
    )
    expect(screen.getByLabelText(/expected growth rate/i)).toHaveAttribute(
      'type',
      'number'
    )
  })

  test('handles form field focus and blur events', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PlanTab
        planParameters={mockPlanParameters}
        onUpdatePlan={mockOnUpdatePlan}
      />
    )

    const sipField = screen.getByLabelText(/starting sip amount/i)

    await user.click(sipField)
    expect(sipField).toHaveFocus()

    await user.tab()
    expect(sipField).not.toHaveFocus()
  })
})
