import React from 'react'
import { Box, Typography, Paper, Stack } from '@mui/material'
import {
  ChartContainer,
  createPieChartConfig,
  createBarChartConfig,
  createLineChartConfig,
} from './ChartContainer'
import { Investment } from '../../types'

interface EnhancedChartsProps {
  investments: Investment[]
}

const EnhancedCharts: React.FC<EnhancedChartsProps> = ({ investments }) => {
  // Process data for different chart types
  const processDataForCharts = () => {
    // Group by tags
    const tagData = investments.reduce(
      (acc, inv) => {
        if (!acc[inv.tag]) {
          acc[inv.tag] = {
            invested: 0,
            current: 0,
            count: 0,
          }
        }
        acc[inv.tag].invested += inv.investedAmount
        acc[inv.tag].current += inv.currentValue
        acc[inv.tag].count += 1
        return acc
      },
      {} as Record<string, { invested: number; current: number; count: number }>
    )

    return tagData
  }

  const tagData = processDataForCharts()
  const tags = Object.keys(tagData)

  // Pie chart data - Portfolio allocation
  const pieData = createPieChartConfig(
    tags,
    tags.map((tag) => tagData[tag].current)
  )

  // Bar chart data - Invested vs Current by tag
  const barData = createBarChartConfig(tags, [
    {
      label: 'Invested Amount',
      data: tags.map((tag) => tagData[tag].invested),
    },
    {
      label: 'Current Value',
      data: tags.map((tag) => tagData[tag].current),
    },
  ])

  // Line chart data - Performance over time
  const timeSeriesData = React.useMemo(() => {
    const sortedInvestments = [...investments].sort(
      (a, b) =>
        new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
    )

    const dates = Array.from(
      new Set(
        sortedInvestments.map((inv) => new Date(inv.recordDate).toDateString())
      )
    ).sort()

    const cumulativeInvested: number[] = []
    const cumulativeValue: number[] = []

    dates.forEach((date) => {
      const investmentsUpToDate = sortedInvestments.filter(
        (inv) => new Date(inv.recordDate).toDateString() <= date
      )

      const totalInvested = investmentsUpToDate.reduce(
        (sum, inv) => sum + inv.investedAmount,
        0
      )
      const totalValue = investmentsUpToDate.reduce(
        (sum, inv) => sum + inv.currentValue,
        0
      )

      cumulativeInvested.push(totalInvested)
      cumulativeValue.push(totalValue)
    })

    return createLineChartConfig(dates, [
      {
        label: 'Cumulative Invested',
        data: cumulativeInvested,
      },
      {
        label: 'Cumulative Value',
        data: cumulativeValue,
      },
    ])
  }, [investments])

  // Doughnut chart data - Returns by category
  const returnsData = React.useMemo(() => {
    const returns = tags.map((tag) => {
      const invested = tagData[tag].invested
      const current = tagData[tag].current
      return invested > 0 ? ((current - invested) / invested) * 100 : 0
    })

    return {
      labels: tags,
      datasets: [
        {
          data: returns,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF',
          ].slice(0, tags.length),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    }
  }, [tags, tagData])

  if (investments.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No investment data available for charts
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Enhanced Portfolio Analytics
      </Typography>

      <Stack spacing={3}>
        {/* Top row - Pie and Doughnut charts */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Paper elevation={3} sx={{ p: 2, flex: 1, minHeight: 450 }}>
            <ChartContainer
              title="Portfolio Allocation"
              type="pie"
              data={pieData}
              height={350}
              variant="plain"
            />
          </Paper>

          <Paper elevation={3} sx={{ p: 2, flex: 1, minHeight: 450 }}>
            <ChartContainer
              title="Returns by Category (%)"
              type="doughnut"
              data={returnsData}
              height={350}
              variant="plain"
            />
          </Paper>
        </Stack>

        {/* Bar Chart */}
        <Paper elevation={3} sx={{ p: 2, minHeight: 450 }}>
          <ChartContainer
            title="Invested vs Current Value by Category"
            type="bar"
            data={barData}
            height={350}
            variant="plain"
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                tooltip: {
                  callbacks: {
                    label: (context: any) => {
                      return `${context.dataset.label}: ${new Intl.NumberFormat(
                        'en-US',
                        {
                          style: 'currency',
                          currency: 'USD',
                        }
                      ).format(context.raw)}`
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (value: any) {
                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(value)
                    },
                  },
                },
              },
            }}
          />
        </Paper>

        {/* Line Chart */}
        <Paper elevation={3} sx={{ p: 2, minHeight: 450 }}>
          <ChartContainer
            title="Cumulative Investment Performance Over Time"
            type="line"
            data={timeSeriesData}
            height={350}
            variant="plain"
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  callbacks: {
                    label: (context: any) => {
                      return `${context.dataset.label}: ${new Intl.NumberFormat(
                        'en-US',
                        {
                          style: 'currency',
                          currency: 'USD',
                        }
                      ).format(context.raw)}`
                    },
                  },
                },
              },
              scales: {
                x: {
                  display: true,
                  title: {
                    display: true,
                    text: 'Date',
                  },
                },
                y: {
                  display: true,
                  title: {
                    display: true,
                    text: 'Amount ($)',
                  },
                  beginAtZero: true,
                  ticks: {
                    callback: function (value: any) {
                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(value)
                    },
                  },
                },
              },
              interaction: {
                mode: 'index' as const,
                intersect: false,
              },
            }}
          />
        </Paper>
      </Stack>
    </Box>
  )
}

export default EnhancedCharts
