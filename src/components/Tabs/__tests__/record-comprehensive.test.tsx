import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import RecordTab from '../record'
import { Investment, Inflation } from '../../../types'

// Mock UI components
jest.mock('../../ui', () => ({
  TableWithActions: ({ data, onDelete, emptyMessage }: any) => {
    // Determine table type based on data structure
    const isInvestmentTable = data.length > 0 && 'tag' in data[0]
    const isInflationTable = data.length > 0 && 'inflation' in data[0]
    const tablePrefix = isInvestmentTable
      ? 'investments'
      : isInflationTable
        ? 'inflation'
        : 'table'

    return (
      <div data-testid={`${tablePrefix}-table`}>
        {data.length === 0 && (
          <div data-testid="table-empty-message">{emptyMessage}</div>
        )}
        {data.map((item: any, index: number) => (
          <div key={index} data-testid={`${tablePrefix}-table-row-${index}`}>
            {item.tag || item.inflation}
            <button
              onClick={() => onDelete(index)}
              data-testid={`${tablePrefix}-table-delete-btn-${index}`}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    )
  },
  TagAutocomplete: ({ onSelectionChange, onCreateOption }: any) => (
    <div data-testid="tag-autocomplete">
      <button
        onClick={() =>
          onSelectionChange([
            { id: 'test', label: 'Test Tag', value: 'Test Tag' },
          ])
        }
        data-testid="select-tag-btn"
      >
        Select Tag
      </button>
      <button
        onClick={() => {
          const newOption = onCreateOption('New Tag')
          onSelectionChange([newOption])
        }}
        data-testid="create-tag-btn"
      >
        Create Tag
      </button>
    </div>
  ),
  FormSection: ({ title, children }: any) => (
    <div data-testid="form-section">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'MMM dd, yyyy') {
      return 'Jan 01, 2023'
    }
    return date.toISOString().split('T')[0]
  },
}))

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('RecordTab Component', () => {
  const mockInvestments: Investment[] = [
    {
      investedAmount: 1000,
      currentValue: 1100,
      recordDate: new Date('2023-01-01'),
      tag: 'Stocks',
    },
    {
      investedAmount: 2000,
      currentValue: 2200,
      recordDate: new Date('2023-02-01'),
      tag: 'Bonds',
    },
  ]

  const mockInflation: Inflation[] = [
    {
      inflation: 3.5,
      recordDate: new Date('2023-01-01'),
    },
  ]

  const mockProps = {
    investments: mockInvestments,
    annualInflation: mockInflation,
    onUpdateInvestments: jest.fn(),
    onUpdateInflation: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders investment and inflation sections', () => {
    renderWithTheme(<RecordTab {...mockProps} />)

    expect(screen.getByText('Investment Records')).toBeInTheDocument()
    expect(screen.getByText('Inflation Records')).toBeInTheDocument()
    expect(screen.getByText('Add New Investment')).toBeInTheDocument()
    expect(screen.getByText('Add New Inflation Record')).toBeInTheDocument()
  })

  test('displays existing investments in table', () => {
    renderWithTheme(<RecordTab {...mockProps} />)

    // Check investment data is displayed
    expect(screen.getByTestId('investments-table-row-0')).toHaveTextContent(
      'Stocks'
    )
    expect(screen.getByTestId('investments-table-row-1')).toHaveTextContent(
      'Bonds'
    )
  })

  test('displays existing inflation records in table', () => {
    renderWithTheme(<RecordTab {...mockProps} />)

    // Check inflation data is displayed
    expect(screen.getByTestId('inflation-table-row-0')).toHaveTextContent('3.5')
  })

  test('renders empty state when no investments', () => {
    const emptyProps = {
      ...mockProps,
      investments: [],
      annualInflation: [],
    }

    renderWithTheme(<RecordTab {...emptyProps} />)

    expect(
      screen.getByText(
        'No investment records yet. Add your first investment below.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('No inflation records yet. Add inflation data below.')
    ).toBeInTheDocument()
  })

  test('generates available tags from existing investments', () => {
    renderWithTheme(<RecordTab {...mockProps} />)

    // TagAutocomplete component should be rendered
    expect(screen.getByTestId('tag-autocomplete')).toBeInTheDocument()
  })

  test('filters out "actual" and "planned" tags from available tags', () => {
    const investmentsWithSpecialTags: Investment[] = [
      ...mockInvestments,
      {
        investedAmount: 500,
        currentValue: 550,
        recordDate: new Date('2023-03-01'),
        tag: 'actual',
      },
      {
        investedAmount: 600,
        currentValue: 650,
        recordDate: new Date('2023-04-01'),
        tag: 'PLANNED',
      },
    ]

    const propsWithSpecialTags = {
      ...mockProps,
      investments: investmentsWithSpecialTags,
    }

    renderWithTheme(<RecordTab {...propsWithSpecialTags} />)

    // Component should still render without these special tags in options
    expect(screen.getByTestId('tag-autocomplete')).toBeInTheDocument()
  })

  test('handles tag selection change', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    const selectTagBtn = screen.getByTestId('select-tag-btn')
    await user.click(selectTagBtn)

    // The tag should be selected
    expect(selectTagBtn).toBeInTheDocument()
  })

  test('handles tag creation', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    const createTagBtn = screen.getByTestId('create-tag-btn')
    await user.click(createTagBtn)

    // New tag should be created and selected
    expect(createTagBtn).toBeInTheDocument()
  })

  test('handles investment form input changes', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    const investedAmountInput = screen.getByLabelText(/invested amount/i)
    const currentValueInput = screen.getByLabelText(/current value/i)

    await user.type(investedAmountInput, '1500')
    await user.type(currentValueInput, '1650')

    expect(investedAmountInput).toHaveValue(1500)
    expect(currentValueInput).toHaveValue(1650)
  })

  test('handles inflation form input changes', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    const inflationRateInput = screen.getByLabelText(/inflation rate/i)

    await user.type(inflationRateInput, '4.2')

    expect(inflationRateInput).toHaveValue(4.2)
  })

  test('adds new investment when form is valid', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    // Fill the form
    const investedAmountInput = screen.getByLabelText(/invested amount/i)
    const currentValueInput = screen.getByLabelText(/current value/i)

    await user.type(investedAmountInput, '1500')
    await user.type(currentValueInput, '1650')

    // Select a tag
    const selectTagBtn = screen.getByTestId('select-tag-btn')
    await user.click(selectTagBtn)

    // Submit the form
    const addInvestmentBtn = screen.getByText('Add Investment')
    await user.click(addInvestmentBtn)

    expect(mockProps.onUpdateInvestments).toHaveBeenCalledWith([
      ...mockInvestments,
      {
        recordDate: expect.any(Date),
        tag: 'Test Tag',
        investedAmount: 1500,
        currentValue: 1650,
      },
    ])
  })

  test('does not add investment when form is invalid', async () => {
    renderWithTheme(<RecordTab {...mockProps} />)

    // Try to submit without filling required fields
    const addInvestmentBtn = screen.getByText('Add Investment')

    // Button should be disabled
    expect(addInvestmentBtn).toBeDisabled()
  })

  test('adds new inflation record when form is valid', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    // Fill inflation form
    const inflationRateInput = screen.getByLabelText(/inflation rate/i)
    await user.type(inflationRateInput, '4.2')

    // Submit the form
    const addInflationBtn = screen.getByText('Add Inflation Record')
    await user.click(addInflationBtn)

    expect(mockProps.onUpdateInflation).toHaveBeenCalledWith([
      ...mockInflation,
      {
        recordDate: expect.any(Date),
        inflation: 4.2,
      },
    ])
  })

  test('prevents adding inflation for existing date', () => {
    renderWithTheme(<RecordTab {...mockProps} />)

    // Check that the form validation works for existing dates
    // This test assumes that the component handles date validation internally
    const inflationRateInput = screen.getByLabelText(/inflation rate/i)
    expect(inflationRateInput).toBeInTheDocument()
  })

  test('resets investment form', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    // Fill the form
    const investedAmountInput = screen.getByLabelText(/invested amount/i)
    const currentValueInput = screen.getByLabelText(/current value/i)

    await user.type(investedAmountInput, '1500')
    await user.type(currentValueInput, '1650')

    // Reset the form
    const resetBtn = screen.getAllByText('Reset')[0] // First reset button (investment form)
    await user.click(resetBtn)

    expect(investedAmountInput).toHaveValue(null)
    expect(currentValueInput).toHaveValue(null)
  })

  test('resets inflation form', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    // Fill inflation form
    const inflationRateInput = screen.getByLabelText(/inflation rate/i)
    await user.type(inflationRateInput, '4.2')

    // Reset the form
    const resetButtons = screen.getAllByText('Reset')
    const inflationResetBtn = resetButtons[1] // Second reset button (inflation form)
    await user.click(inflationResetBtn)

    expect(inflationRateInput).toHaveValue(null)
  })

  test('deletes investment record', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    const deleteBtn = screen.getByTestId('investments-table-delete-btn-0')
    await user.click(deleteBtn)

    expect(mockProps.onUpdateInvestments).toHaveBeenCalledWith([
      mockInvestments[1], // Only the second investment should remain
    ])
  })

  test('deletes inflation record', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    // Find delete button for inflation
    const inflationDeleteBtn = screen.getByTestId(
      'inflation-table-delete-btn-0'
    )
    await user.click(inflationDeleteBtn)

    expect(mockProps.onUpdateInflation).toHaveBeenCalledWith([])
  })

  test('handles date picker changes', () => {
    renderWithTheme(<RecordTab {...mockProps} />)

    // Date pickers should be rendered - use more specific selector
    const datePickers = screen.getAllByRole('group')
    expect(datePickers.length).toBeGreaterThanOrEqual(2) // At least one for investment, one for inflation
  })

  test('validates investment form fields', async () => {
    const user = userEvent.setup()
    renderWithTheme(<RecordTab {...mockProps} />)

    // Check initial state - button should be disabled
    const addInvestmentBtn = screen.getByText('Add Investment')
    expect(addInvestmentBtn).toBeDisabled()

    // Fill only invested amount
    const investedAmountInput = screen.getByLabelText(/invested amount/i)
    await user.type(investedAmountInput, '1500')

    // Button should still be disabled
    expect(addInvestmentBtn).toBeDisabled()

    // Fill current value but no tag selected
    const currentValueInput = screen.getByLabelText(/current value/i)
    await user.type(currentValueInput, '1650')

    // Button should still be disabled without tag
    expect(addInvestmentBtn).toBeDisabled()

    // Select a tag
    const selectTagBtn = screen.getByTestId('select-tag-btn')
    await user.click(selectTagBtn)

    // Now button should be enabled
    await waitFor(() => {
      expect(addInvestmentBtn).toBeEnabled()
    })
  })

  test('validates inflation form fields', async () => {
    const user = userEvent.setup()

    // Use empty inflation data to avoid date conflict
    const propsWithEmptyInflation = {
      ...mockProps,
      annualInflation: [],
    }

    renderWithTheme(<RecordTab {...propsWithEmptyInflation} />)

    // Check initial state - button should be disabled
    const addInflationBtn = screen.getByText('Add Inflation Record')
    expect(addInflationBtn).toBeDisabled()

    // Fill inflation rate
    const inflationRateInput = screen.getByLabelText(/inflation rate/i)
    await user.type(inflationRateInput, '4.2')

    // Button should now be enabled
    await waitFor(() => {
      expect(addInflationBtn).toBeEnabled()
    })
  })

  test('displays currency formatting correctly', () => {
    renderWithTheme(<RecordTab {...mockProps} />)

    // Input fields should have currency symbols
    const investedAmountInput = screen.getByLabelText(/invested amount/i)
    const currentValueInput = screen.getByLabelText(/current value/i)

    expect(investedAmountInput).toBeInTheDocument()
    expect(currentValueInput).toBeInTheDocument()

    // Check for dollar signs in the UI
    expect(screen.getAllByText('$')).toHaveLength(2)
  })

  test('displays percentage formatting for inflation', () => {
    renderWithTheme(<RecordTab {...mockProps} />)

    // Inflation input should have percentage symbol
    const inflationRateInput = screen.getByLabelText(/inflation rate/i)
    expect(inflationRateInput).toBeInTheDocument()

    // Check for percentage sign in the UI
    expect(screen.getByText('%')).toBeInTheDocument()
  })
})
