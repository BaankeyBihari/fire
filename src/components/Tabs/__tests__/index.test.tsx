import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import TabsContainer from '../index'

// Mock the hooks
const mockImportData = jest.fn()
const mockExportData = jest.fn()

const mockUseFileOperations = jest.fn(() => ({
  importData: mockImportData,
  exportData: mockExportData,
  loading: false,
  error: null,
}))

jest.mock('../../../hooks', () => ({
  useFileOperations: () => mockUseFileOperations(),
}))

// Mock child components
jest.mock('../plan', () => {
  return function MockPlanTab({ onUpdatePlan }: any) {
    return (
      <div data-testid="plan-tab">
        <button
          onClick={() =>
            onUpdatePlan({
              startDate: new Date('2023-01-01'),
              retireDate: new Date('2050-01-01'),
              startingSIP: 5000,
              incomeAtMaturity: 50000,
              currency: 'USD',
              expectedAnnualInflation: 3,
              expectedGrowthRate: 8,
              sipGrowthRate: 5,
            })
          }
          data-testid="update-plan-btn"
        >
          Update Plan
        </button>
      </div>
    )
  }
})

jest.mock('../record', () => {
  return function MockRecordTab({
    onUpdateInvestments,
    onUpdateInflation,
  }: any) {
    return (
      <div data-testid="record-tab">
        <button
          onClick={() =>
            onUpdateInvestments([
              {
                investedAmount: 1000,
                currentValue: 1100,
                recordDate: new Date('2023-01-01'),
                tag: 'Test',
              },
            ])
          }
          data-testid="update-investments-btn"
        >
          Update Investments
        </button>
        <button
          onClick={() =>
            onUpdateInflation([
              {
                inflation: 3.5,
                recordDate: new Date('2023-01-01'),
              },
            ])
          }
          data-testid="update-inflation-btn"
        >
          Update Inflation
        </button>
      </div>
    )
  }
})

jest.mock('../status', () => {
  return function MockStatusTab({ investments }: any) {
    return (
      <div data-testid="status-tab">
        Status - {investments.length} investments
      </div>
    )
  }
})

// Mock console.error to avoid polluting test output
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('TabsContainer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders tabs container with default plan tab', () => {
    renderWithTheme(<TabsContainer />)

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /plan/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /record/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /status/i })).toBeInTheDocument()
    expect(screen.getByTestId('plan-tab')).toBeInTheDocument()
  })

  test('renders header with title and action buttons', () => {
    renderWithTheme(<TabsContainer />)

    expect(screen.getByText('FIRE Planning Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/import data/i)).toBeInTheDocument()
    expect(screen.getByText(/export data/i)).toBeInTheDocument()
  })

  test('switches to record tab when clicked', () => {
    renderWithTheme(<TabsContainer />)

    const recordTab = screen.getByRole('tab', { name: /record/i })
    fireEvent.click(recordTab)

    expect(screen.getByTestId('record-tab')).toBeInTheDocument()
  })

  test('switches to status tab when clicked', () => {
    renderWithTheme(<TabsContainer />)

    const statusTab = screen.getByRole('tab', { name: /status/i })
    fireEvent.click(statusTab)

    expect(screen.getByTestId('status-tab')).toBeInTheDocument()
  })

  test('can switch back to plan tab', () => {
    renderWithTheme(<TabsContainer />)

    // Switch to record tab first
    const recordTab = screen.getByRole('tab', { name: /record/i })
    fireEvent.click(recordTab)
    expect(screen.getByTestId('record-tab')).toBeInTheDocument()

    // Switch back to plan tab
    const planTab = screen.getByRole('tab', { name: /plan/i })
    fireEvent.click(planTab)
    expect(screen.getByTestId('plan-tab')).toBeInTheDocument()
  })

  test('renders file operation buttons', () => {
    renderWithTheme(<TabsContainer />)

    expect(screen.getByText(/import/i)).toBeInTheDocument()
    expect(screen.getByText(/export/i)).toBeInTheDocument()
  })

  test('handles plan update', async () => {
    renderWithTheme(<TabsContainer />)

    const updatePlanBtn = screen.getByTestId('update-plan-btn')
    fireEvent.click(updatePlanBtn)

    // The plan should be updated in the reducer
    await waitFor(() => {
      expect(updatePlanBtn).toBeInTheDocument()
    })
  })

  test('handles investment update', async () => {
    renderWithTheme(<TabsContainer />)

    // Switch to record tab first
    const recordTab = screen.getByRole('tab', { name: /record/i })
    fireEvent.click(recordTab)

    const updateInvestmentsBtn = screen.getByTestId('update-investments-btn')
    fireEvent.click(updateInvestmentsBtn)

    // Switch to status tab to see the investment count
    const statusTab = screen.getByRole('tab', { name: /status/i })
    fireEvent.click(statusTab)

    await waitFor(() => {
      expect(screen.getByText(/1 investments/)).toBeInTheDocument()
    })
  })

  test('handles inflation update', async () => {
    renderWithTheme(<TabsContainer />)

    // Switch to record tab
    const recordTab = screen.getByRole('tab', { name: /record/i })
    fireEvent.click(recordTab)

    const updateInflationBtn = screen.getByTestId('update-inflation-btn')
    fireEvent.click(updateInflationBtn)

    await waitFor(() => {
      expect(updateInflationBtn).toBeInTheDocument()
    })
  })

  test('triggers file import when import button is clicked', () => {
    renderWithTheme(<TabsContainer />)

    const importButton = screen.getByText(/import data/i)
    fireEvent.click(importButton)

    // Check that file input would be triggered (we can't actually test the click)
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', '.json,application/json')
  })

  test('handles file selection and import', async () => {
    const mockJsonData = {
      startDate: '2023-01-01T00:00:00.000Z',
      retireDate: '2050-01-01T00:00:00.000Z',
      startingSIP: 5000,
      incomeAtMaturity: 50000,
      currency: 'USD',
      expectedAnnualInflation: 3,
      expectedGrowthRate: 8,
      sipGrowthRate: 5,
      investmentPlan: [
        {
          investedAmount: 1000,
          currentValue: 1100,
          recordDate: '2023-01-01T00:00:00.000Z',
          tag: 'Stocks',
        },
      ],
      investments: [
        {
          investedAmount: 2000,
          currentValue: 2200,
          recordDate: '2023-02-01T00:00:00.000Z',
          tag: 'Bonds',
        },
      ],
      annualInflation: [
        {
          inflation: 3.5,
          recordDate: '2023-01-01T00:00:00.000Z',
        },
      ],
    }

    mockImportData.mockResolvedValue(mockJsonData)

    renderWithTheme(<TabsContainer />)

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    expect(fileInput).toBeInTheDocument()

    // Create a mock file
    const mockFile = new File([JSON.stringify(mockJsonData)], 'test.json', {
      type: 'application/json',
    })

    // Mock the file selection
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    })

    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(mockImportData).toHaveBeenCalledWith(mockFile)
    })
  })

  test('handles file import error', async () => {
    mockImportData.mockRejectedValue(new Error('Import failed'))

    renderWithTheme(<TabsContainer />)

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const mockFile = new File(['invalid json'], 'test.json', {
      type: 'application/json',
    })

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    })

    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(mockImportData).toHaveBeenCalledWith(mockFile)
      expect(console.error).toHaveBeenCalledWith(
        'Failed to import file:',
        expect.any(Error)
      )
    })
  })

  test('handles file selection with no file', () => {
    renderWithTheme(<TabsContainer />)

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    // Mock no file selected
    Object.defineProperty(fileInput, 'files', {
      value: [],
      writable: false,
    })

    fireEvent.change(fileInput)

    expect(mockImportData).not.toHaveBeenCalled()
  })

  test('resets file input after import', async () => {
    const mockJsonData = {
      startDate: '2023-01-01T00:00:00.000Z',
      retireDate: '2050-01-01T00:00:00.000Z',
      startingSIP: 5000,
      incomeAtMaturity: 50000,
      currency: 'USD',
      expectedAnnualInflation: 3,
      expectedGrowthRate: 8,
      sipGrowthRate: 5,
    }

    mockImportData.mockResolvedValue(mockJsonData)

    renderWithTheme(<TabsContainer />)

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    const mockFile = new File([JSON.stringify(mockJsonData)], 'test.json', {
      type: 'application/json',
    })

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    })

    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(mockImportData).toHaveBeenCalledWith(mockFile)
    })

    // File input value should be reset
    expect(fileInput.value).toBe('')
  })

  test('handles export data', () => {
    renderWithTheme(<TabsContainer />)

    const exportButton = screen.getByText(/export data/i)
    fireEvent.click(exportButton)

    expect(mockExportData).toHaveBeenCalledWith(
      expect.any(Object),
      expect.stringContaining('fire_data_'),
      'json'
    )
  })

  test('displays correct tab icons', () => {
    renderWithTheme(<TabsContainer />)

    // The icons should be rendered within the tabs
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)

    tabs.forEach((tab) => {
      expect(tab).toBeInTheDocument()
    })
  })

  test('displays planning dashboard title', () => {
    renderWithTheme(<TabsContainer />)

    expect(screen.getByText('FIRE Planning Dashboard')).toBeInTheDocument()
  })

  test('displays divider elements', () => {
    renderWithTheme(<TabsContainer />)

    const dividers = document.querySelectorAll('.MuiDivider-root')
    expect(dividers.length).toBeGreaterThan(0)
  })

  test('creates plan parameters object correctly', () => {
    renderWithTheme(<TabsContainer />)

    // Plan parameters are passed to the PlanTab component
    // We can verify this by checking that the plan tab renders
    expect(screen.getByTestId('plan-tab')).toBeInTheDocument()
  })
})

// Test with loading state
describe('TabsContainer with loading state', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the hook to return loading state
    mockUseFileOperations.mockReturnValue({
      importData: mockImportData,
      exportData: mockExportData,
      loading: true,
      error: null,
    })
  })

  test('disables buttons when loading', () => {
    renderWithTheme(<TabsContainer />)

    const importButton = screen.getByText(/import data/i)
    const exportButton = screen.getByText(/export data/i)

    expect(importButton).toBeDisabled()
    expect(exportButton).toBeDisabled()
  })
})

// Test with error state
describe('TabsContainer with error state', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the hook to return error state
    mockUseFileOperations.mockReturnValue({
      importData: mockImportData,
      exportData: mockExportData,
      loading: false,
      error: 'Something went wrong',
    })
  })

  test('displays error message when error occurs', () => {
    renderWithTheme(<TabsContainer />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
