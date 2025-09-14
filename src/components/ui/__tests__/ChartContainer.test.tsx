import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import ChartContainer, {
  generateChartColors,
  createLineChartConfig,
  createBarChartConfig,
  createPieChartConfig,
} from '../ChartContainer'

// Mock react-chartjs-2 components
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
  Pie: ({ data, options }: any) => (
    <div data-testid="pie-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
  Doughnut: ({ data, options }: any) => (
    <div data-testid="doughnut-chart">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  ),
}))

const theme = createTheme()

const mockLineData = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [10, 20, 30],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    },
  ],
}

const mockBarData = {
  labels: ['A', 'B', 'C'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [15, 25, 35],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
}

const mockPieData = {
  labels: ['Red', 'Blue', 'Yellow'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [300, 50, 100],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    },
  ],
}

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('ChartContainer', () => {
  it('should render line chart with title', () => {
    renderWithTheme(
      <ChartContainer title="Test Line Chart" type="line" data={mockLineData} />
    )

    expect(screen.getByText('Test Line Chart')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('should render bar chart', () => {
    renderWithTheme(<ChartContainer type="bar" data={mockBarData} />)

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('should render pie chart', () => {
    renderWithTheme(<ChartContainer type="pie" data={mockPieData} />)

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
  })

  it('should render doughnut chart', () => {
    renderWithTheme(<ChartContainer type="doughnut" data={mockPieData} />)

    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    renderWithTheme(
      <ChartContainer type="line" data={mockLineData} loading={true} />
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
  })

  it('should render error state', () => {
    renderWithTheme(
      <ChartContainer
        type="line"
        data={mockLineData}
        error="Failed to load chart"
      />
    )

    expect(screen.getByText('Failed to load chart')).toBeInTheDocument()
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
  })

  it('should render in plain variant without card wrapper', () => {
    renderWithTheme(
      <ChartContainer
        title="Plain Chart"
        type="line"
        data={mockLineData}
        variant="plain"
      />
    )

    expect(screen.getByText('Plain Chart')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    // Should not have card structure
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('should render in card variant with elevation', () => {
    renderWithTheme(
      <ChartContainer
        title="Card Chart"
        type="line"
        data={mockLineData}
        variant="card"
        elevation={3}
      />
    )

    expect(screen.getByText('Card Chart')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('should apply custom height and width', () => {
    renderWithTheme(
      <ChartContainer
        type="line"
        data={mockLineData}
        height={400}
        width={600}
      />
    )

    const container = screen.getByTestId('line-chart').parentElement
    expect(container).toHaveStyle('height: 400px')
    expect(container).toHaveStyle('width: 600px')
  })

  it('should merge custom options with default options', () => {
    const customOptions = {
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
      },
    }

    renderWithTheme(
      <ChartContainer type="line" data={mockLineData} options={customOptions} />
    )

    const optionsElement = screen.getByTestId('chart-options')
    const options = JSON.parse(optionsElement.textContent!)

    expect(options.plugins.legend.position).toBe('bottom')
    expect(options.responsive).toBe(true) // Default option should be preserved
  })

  it('should not include scales for pie and doughnut charts', () => {
    renderWithTheme(<ChartContainer type="pie" data={mockPieData} />)

    const optionsElement = screen.getByTestId('chart-options')
    const options = JSON.parse(optionsElement.textContent!)

    expect(options.scales).toBeUndefined()
  })

  it('should include scales for line and bar charts', () => {
    renderWithTheme(<ChartContainer type="bar" data={mockBarData} />)

    const optionsElement = screen.getByTestId('chart-options')
    const options = JSON.parse(optionsElement.textContent!)

    expect(options.scales).toBeDefined()
    expect(options.scales.x).toBeDefined()
    expect(options.scales.y).toBeDefined()
  })

  it('should set maintainAspectRatio to false when height is provided', () => {
    renderWithTheme(
      <ChartContainer type="line" data={mockLineData} height={300} />
    )

    const optionsElement = screen.getByTestId('chart-options')
    const options = JSON.parse(optionsElement.textContent!)

    expect(options.maintainAspectRatio).toBe(false)
  })

  it('should set maintainAspectRatio to true when height is not provided', () => {
    renderWithTheme(<ChartContainer type="line" data={mockLineData} />)

    const optionsElement = screen.getByTestId('chart-options')
    const options = JSON.parse(optionsElement.textContent!)

    expect(options.maintainAspectRatio).toBe(true)
  })
})

describe('Utility Functions', () => {
  describe('generateChartColors', () => {
    it('should generate correct number of colors', () => {
      const colors = generateChartColors(5)
      expect(colors).toHaveLength(5)
    })

    it('should cycle through colors when count exceeds available colors', () => {
      const colors = generateChartColors(10)
      expect(colors).toHaveLength(10)
      expect(colors[0]).toBe(colors[8]) // Should cycle back to first color
    })

    it('should return empty array for zero count', () => {
      const colors = generateChartColors(0)
      expect(colors).toHaveLength(0)
    })
  })

  describe('createLineChartConfig', () => {
    it('should create line chart configuration', () => {
      const labels = ['Jan', 'Feb', 'Mar']
      const datasets = [
        { label: 'Sales', data: [100, 200, 300] },
        { label: 'Profit', data: [50, 100, 150] },
      ]

      const config = createLineChartConfig(labels, datasets)

      expect(config.labels).toEqual(labels)
      expect(config.datasets).toHaveLength(2)
      expect(config.datasets[0].label).toBe('Sales')
      expect(config.datasets[0].data).toEqual([100, 200, 300])
      expect(config.datasets[0].borderWidth).toBe(2)
      expect(config.datasets[0].fill).toBe(false)
      expect(config.datasets[0].tension).toBe(0.1)
    })

    it('should use custom colors when provided', () => {
      const labels = ['A', 'B']
      const datasets = [
        {
          label: 'Test',
          data: [1, 2],
          color: '#ff0000',
          backgroundColor: '#00ff00',
        },
      ]

      const config = createLineChartConfig(labels, datasets)

      expect(config.datasets[0].borderColor).toBe('#ff0000')
      expect(config.datasets[0].backgroundColor).toBe('#00ff00')
    })
  })

  describe('createBarChartConfig', () => {
    it('should create bar chart configuration', () => {
      const labels = ['A', 'B', 'C']
      const datasets = [{ label: 'Values', data: [10, 20, 30] }]

      const config = createBarChartConfig(labels, datasets)

      expect(config.labels).toEqual(labels)
      expect(config.datasets).toHaveLength(1)
      expect(config.datasets[0].label).toBe('Values')
      expect(config.datasets[0].data).toEqual([10, 20, 30])
      expect(config.datasets[0].borderWidth).toBe(1)
    })

    it('should apply custom colors to bar chart', () => {
      const labels = ['A']
      const datasets = [
        {
          label: 'Test',
          data: [1],
          color: '#ff0000',
          backgroundColor: '#00ff00',
        },
      ]

      const config = createBarChartConfig(labels, datasets)

      expect(config.datasets[0].borderColor).toBe('#ff0000')
      expect(config.datasets[0].backgroundColor).toBe('#00ff00')
    })
  })

  describe('createPieChartConfig', () => {
    it('should create pie chart configuration', () => {
      const labels = ['Red', 'Blue', 'Green']
      const data = [300, 50, 100]

      const config = createPieChartConfig(labels, data)

      expect(config.labels).toEqual(labels)
      expect(config.datasets).toHaveLength(1)
      expect(config.datasets[0].data).toEqual(data)
      expect(config.datasets[0].borderWidth).toBe(2)
      expect(config.datasets[0].borderColor).toBe('#fff')
    })

    it('should use custom background colors when provided', () => {
      const labels = ['A', 'B']
      const data = [1, 2]
      const colors = ['#ff0000', '#00ff00']

      const config = createPieChartConfig(labels, data, colors)

      expect(config.datasets[0].backgroundColor).toEqual(colors)
    })

    it('should generate colors when not provided', () => {
      const labels = ['A', 'B']
      const data = [1, 2]

      const config = createPieChartConfig(labels, data)

      expect(config.datasets[0].backgroundColor).toHaveLength(2)
      expect(Array.isArray(config.datasets[0].backgroundColor)).toBe(true)
    })
  })
})
