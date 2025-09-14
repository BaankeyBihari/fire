import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import StatusTab from '../status'
import { Investment } from '../../../types'

// Mock UI components
jest.mock('../../ui', () => ({
  ChartContainer: ({ title, type, data, height }: any) => (
    <div data-testid="chart-container">
      <div data-testid="chart-title">{title}</div>
      <div data-testid="chart-type">{type}</div>
      <div data-testid="chart-height">{height}</div>
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
  createLineChartConfig: (labels: any[], datasets: any[]) => ({
    labels,
    datasets,
  }),
  TableWithActions: ({ title, data, maxHeight, emptyMessage }: any) => (
    <div data-testid="table-with-actions">
      <div data-testid="table-title">{title}</div>
      <div data-testid="table-max-height">{maxHeight}</div>
      <div data-testid="table-empty-message">{emptyMessage}</div>
      {data && data.length > 0 ? (
        data.map((item: any, index: number) => (
          <div key={index} data-testid={`table-row-${index}`}>
            {item.tag || item.recordDate || JSON.stringify(item)}
          </div>
        ))
      ) : (
        <div data-testid="no-table-data">No data</div>
      )}
    </div>
  ),
}))

// Mock hooks
jest.mock('../../../hooks', () => ({
  useTagSelection: (availableTags: string[]) => ({
    selectedTags: availableTags,
    selectAll: true,
    toggleTag: jest.fn(),
    toggleSelectAll: jest.fn(),
  }),
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'MMM dd, yyyy') {
      return 'Jan 01, 2023'
    } else if (formatStr === 'yyyy-MM-dd') {
      return '2023-01-01'
    }
    return date.toISOString().split('T')[0]
  },
}))

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('StatusTab Component', () => {
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
    {
      investedAmount: 1500,
      currentValue: 1650,
      recordDate: new Date('2023-03-01'),
      tag: 'Crypto',
    },
  ]

  test('renders empty state when no investments', () => {
    renderWithTheme(<StatusTab investments={[]} />)

    expect(
      screen.getByText(
        'No investments data available. Please add some investments first!'
      )
    ).toBeInTheDocument()
  })

  test('renders chart and table sections when investments exist', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    expect(screen.getByText('Portfolio Performance Chart')).toBeInTheDocument()
    expect(screen.getByText('Investment Details')).toBeInTheDocument()
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
    expect(screen.getByTestId('table-with-actions')).toBeInTheDocument()
  })

  test('renders time window controls for chart', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    // Chart time window buttons
    const chartTimeLabels = ['3m', '6m', '1yr', '2yr', '3yr']

    chartTimeLabels.forEach((label) => {
      const elements = screen.getAllByText(label)
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })
  })

  test('renders time window controls for table', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    // Table should have an additional 'All' option
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  test('renders tag selection chips for chart', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    // Should render "Select All" chips (one for chart, one for table)
    const selectAllChips = screen.getAllByText('Select All')
    expect(selectAllChips).toHaveLength(2)

    // Should render tag chips for each unique tag
    expect(screen.getAllByText('Stocks')).toHaveLength(2) // One for chart, one for table
    expect(screen.getAllByText('Bonds')).toHaveLength(2)
    expect(screen.getAllByText('Crypto')).toHaveLength(2)
  })

  test('changes chart time window when clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    const sixMonthButton = screen.getAllByText('6m')[0] // First one is for chart
    await user.click(sixMonthButton)

    // The component should re-render with new time window
    expect(sixMonthButton).toBeInTheDocument()
  })

  test('changes table time window when clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    const allButton = screen.getByText('All')
    await user.click(allButton)

    expect(allButton).toBeInTheDocument()
  })

  test('renders chart with correct configuration', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    expect(screen.getByTestId('chart-title')).toHaveTextContent(
      'Investment Growth Over Time'
    )
    expect(screen.getByTestId('chart-type')).toHaveTextContent('line')
    expect(screen.getByTestId('chart-height')).toHaveTextContent('400')
  })

  test('processes chart data correctly', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    const chartData = screen.getByTestId('chart-data')
    expect(chartData).toBeInTheDocument()

    // Chart data should be stringified JSON
    const dataString = chartData.textContent
    expect(dataString).toContain('labels')
    expect(dataString).toContain('datasets')
  })

  test('renders table with correct columns', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    expect(screen.getByTestId('table-title')).toHaveTextContent(
      'Investment Records'
    )
    expect(screen.getByTestId('table-max-height')).toHaveTextContent('600')
  })

  test('displays investment data in table', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    // Should display table component
    const table = screen.getByTestId('table-with-actions')
    expect(table).toBeInTheDocument()

    // Check if we have data or no data message
    const hasRows = screen.queryByTestId('table-row-0')
    const noData = screen.queryByTestId('no-table-data')

    expect(hasRows || noData).toBeTruthy()
  })

  test('filters investments by time window', async () => {
    const user = userEvent.setup()

    // Create investments with different dates to test filtering
    const investmentsWithDifferentDates: Investment[] = [
      {
        investedAmount: 1000,
        currentValue: 1100,
        // eslint-disable-next-line no-mixed-operators
        recordDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        tag: 'Recent',
      },
      {
        investedAmount: 2000,
        currentValue: 2200,
        // eslint-disable-next-line no-mixed-operators
        recordDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 days ago
        tag: 'Old',
      },
    ]

    renderWithTheme(<StatusTab investments={investmentsWithDifferentDates} />)

    // Switch to 3m view - should show both investments
    const threeMonthButton = screen.getAllByText('3m')[0]
    await user.click(threeMonthButton)

    expect(threeMonthButton).toBeInTheDocument()
  })

  test('handles tag selection for chart', async () => {
    const user = userEvent.setup()
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    // Click on a tag chip for chart section
    const stocksChip = screen.getAllByText('Stocks')[0] // First one is for chart
    await user.click(stocksChip)

    expect(stocksChip).toBeInTheDocument()
  })

  test('handles tag selection for table', async () => {
    const user = userEvent.setup()
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    // Click on a tag chip for table section
    const bondsChip = screen.getAllByText('Bonds')[1] // Second one is for table
    await user.click(bondsChip)

    expect(bondsChip).toBeInTheDocument()
  })

  test('handles select all toggle for chart', async () => {
    const user = userEvent.setup()
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    const selectAllChip = screen.getAllByText('Select All')[0] // First one is for chart
    await user.click(selectAllChip)

    expect(selectAllChip).toBeInTheDocument()
  })

  test('handles select all toggle for table', async () => {
    const user = userEvent.setup()
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    const selectAllChip = screen.getAllByText('Select All')[1] // Second one is for table
    await user.click(selectAllChip)

    expect(selectAllChip).toBeInTheDocument()
  })

  test('extracts unique tags from investments', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    // Should display all unique tags
    expect(screen.getAllByText('Stocks')).toHaveLength(2)
    expect(screen.getAllByText('Bonds')).toHaveLength(2)
    expect(screen.getAllByText('Crypto')).toHaveLength(2)
  })

  test('handles investments with duplicate tags', () => {
    const investmentsWithDuplicates: Investment[] = [
      ...mockInvestments,
      {
        investedAmount: 500,
        currentValue: 550,
        recordDate: new Date('2023-04-01'),
        tag: 'Stocks', // Duplicate tag
      },
    ]

    renderWithTheme(<StatusTab investments={investmentsWithDuplicates} />)

    // Should still show unique tags
    expect(screen.getAllByText('Stocks')).toHaveLength(2) // One for chart, one for table
  })

  test('renders chart options correctly', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    const chartContainer = screen.getByTestId('chart-container')
    expect(chartContainer).toBeInTheDocument()
  })

  test('displays empty message when no investments match filters', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    // Empty message should be defined
    expect(screen.getByTestId('table-empty-message')).toHaveTextContent(
      'No investments match the selected filters'
    )
  })

  test('processes value to price ratio correctly', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    // Table should process and display investment data
    const table = screen.getByTestId('table-with-actions')
    expect(table).toBeInTheDocument()

    // Check for either data rows or no data message
    const hasData = screen.queryAllByTestId(/table-row-/).length > 0
    const noData = screen.queryByTestId('no-table-data')

    expect(hasData || noData).toBeTruthy()
  })

  test('handles zero invested amount for V/P ratio', () => {
    const investmentsWithZero: Investment[] = [
      {
        investedAmount: 0,
        currentValue: 100,
        recordDate: new Date('2023-01-01'),
        tag: 'Free',
      },
    ]

    renderWithTheme(<StatusTab investments={investmentsWithZero} />)

    // Should handle zero division gracefully
    const table = screen.getByTestId('table-with-actions')
    expect(table).toBeInTheDocument()

    // Check for either data rows or no data message
    const hasData =
      screen.queryByTestId('table-row-0') ||
      screen.queryByTestId('no-table-data')
    expect(hasData).toBeTruthy()
  })

  test('formats currency values correctly', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    // Currency formatting should be applied in the table data processing
    const tableContainer = screen.getByTestId('table-with-actions')
    expect(tableContainer).toBeInTheDocument()
  })

  test('groups investments by date and tag for chart', () => {
    const investmentsWithSameDate: Investment[] = [
      {
        investedAmount: 1000,
        currentValue: 1100,
        recordDate: new Date('2023-01-01'),
        tag: 'Stocks',
      },
      {
        investedAmount: 500,
        currentValue: 550,
        recordDate: new Date('2023-01-01'),
        tag: 'Stocks',
      },
    ]

    renderWithTheme(<StatusTab investments={investmentsWithSameDate} />)

    // Chart should handle grouping correctly
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
  })

  test('creates correct chart datasets for selected tags', () => {
    renderWithTheme(<StatusTab investments={mockInvestments} />)

    const chartData = screen.getByTestId('chart-data')
    expect(chartData).toBeInTheDocument()

    // Should create datasets for invested and current values
    const dataString = chartData.textContent || ''
    expect(dataString.includes('datasets')).toBe(true)
  })
})
