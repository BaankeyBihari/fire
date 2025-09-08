import React from 'react'
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js'
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export interface ChartContainerProps {
  title?: string
  type: 'line' | 'bar' | 'pie' | 'doughnut'
  data: ChartData<any>
  options?: ChartOptions<any>
  height?: number
  width?: number
  loading?: boolean
  error?: string
  variant?: 'card' | 'plain'
  elevation?: number
}

const ChartComponents = {
  line: Line,
  bar: Bar,
  pie: Pie,
  doughnut: Doughnut,
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  type,
  data,
  options = {},
  height,
  width,
  loading = false,
  error,
  variant = 'card',
  elevation = 1,
}) => {
  const ChartComponent = ChartComponents[type]

  const defaultOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: height ? false : true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales:
      type === 'line' || type === 'bar'
        ? {
            x: {
              display: true,
              grid: {
                display: false,
              },
            },
            y: {
              display: true,
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
          }
        : undefined,
    ...options,
  }

  const chartContent = (
    <Box
      sx={{
        position: 'relative',
        height: height ? `${height}px` : 'auto',
        width: width ? `${width}px` : '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading && <CircularProgress />}
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      {!loading && !error && (
        <ChartComponent
          data={data}
          options={defaultOptions}
          height={height}
          width={width}
        />
      )}
    </Box>
  )

  if (variant === 'plain') {
    return (
      <Box>
        {title && (
          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>
        )}
        {chartContent}
      </Box>
    )
  }

  return (
    <Card elevation={elevation} sx={{ mb: 2 }}>
      <CardContent>
        {title && (
          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>
        )}
        {chartContent}
      </CardContent>
    </Card>
  )
}

// Utility function to generate chart colors
export const generateChartColors = (count: number): string[] => {
  const colors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF',
  ]

  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }
  return result
}

// Utility function for common chart configurations
export const createLineChartConfig = (
  labels: string[],
  datasets: Array<{
    label: string
    data: number[]
    color?: string
    backgroundColor?: string
  }>
): ChartData<'line'> => {
  const colors = generateChartColors(datasets.length)

  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color || colors[index],
      backgroundColor: dataset.backgroundColor || colors[index] + '20',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
    })),
  }
}

export const createBarChartConfig = (
  labels: string[],
  datasets: Array<{
    label: string
    data: number[]
    color?: string
    backgroundColor?: string
  }>
): ChartData<'bar'> => {
  const colors = generateChartColors(datasets.length)

  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor || colors[index] + '80',
      borderColor: dataset.color || colors[index],
      borderWidth: 1,
    })),
  }
}

export const createPieChartConfig = (
  labels: string[],
  data: number[],
  backgroundColors?: string[]
): ChartData<'pie'> => {
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors || generateChartColors(data.length),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }
}

export default ChartContainer
