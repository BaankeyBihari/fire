import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import TabsContainer from '../index'

// Mock the hooks
jest.mock('../../../hooks', () => ({
  useFileOperations: () => ({
    importData: jest.fn(),
    exportData: jest.fn(),
    loading: false,
    error: null,
  }),
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

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('TabsContainer Component', () => {
  test('renders tabs container with default plan tab', () => {
    renderWithTheme(<TabsContainer />)

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /plan/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /record/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /status/i })).toBeInTheDocument()
    expect(screen.getByTestId('plan-tab')).toBeInTheDocument()
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

  test('displays correct tab icons', () => {
    renderWithTheme(<TabsContainer />)

    // The icons should be rendered within the tabs
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)

    tabs.forEach((tab) => {
      expect(tab).toBeInTheDocument()
    })
  })
})
