import React, { useState, useMemo } from 'react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers'
import {
  Typography,
  Box,
  Chip,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import { format } from 'date-fns'

// Import new UI components
import { ChartContainer, createLineChartConfig, TableWithActions } from '../ui'

// Import hooks and types
import { useTagSelection } from '../../hooks'
import { Investment } from '../../types'

interface StatusTabProps {
  investments: Investment[]
}

const StatusTab: React.FC<StatusTabProps> = ({ investments }) => {
  const [graphTimeWindow, setGraphTimeWindow] = useState<
    '3m' | '6m' | '1y' | '2y' | '3y'
  >('3m')
  const [tableTimeWindow, setTableTimeWindow] = useState<
    '3m' | '6m' | '1y' | '2y' | '3y' | 'all'
  >('3m')

  // Get unique tags from investments
  const availableTags = useMemo(() => {
    const tags = investments.map((inv) => inv.tag)
    const uniqueTags = Array.from(new Set(tags))
    return uniqueTags
  }, [investments])

  // Use custom hooks for tag selection
  const {
    selectedTags: selectedTagsGraph,
    selectAll: selectAllGraph,
    toggleTag: toggleTagGraph,
    toggleSelectAll: toggleSelectAllGraph,
  } = useTagSelection(availableTags)

  const {
    selectedTags: selectedTagsTable,
    selectAll: selectAllTable,
    toggleTag: toggleTagTable,
    toggleSelectAll: toggleSelectAllTable,
  } = useTagSelection(availableTags)

  // Process chart data
  const chartData = useMemo(() => {
    const timeWindowDays = {
      '3m': 90,
      '6m': 180,
      '1y': 365,
      '2y': 730,
      '3y': 1095,
    }

    const filteredInvestments = investments.filter((inv) => {
      const daysDiff =
        Math.abs(Date.now() - new Date(inv.recordDate).getTime()) /
        (1000 * 60 * 60 * 24)
      return daysDiff <= timeWindowDays[graphTimeWindow]
    })

    // Group by date and tag
    const dataByDate = new Map<
      string,
      Map<string, { invested: number; current: number }>
    >()

    filteredInvestments.forEach((inv) => {
      const dateKey = format(new Date(inv.recordDate), 'yyyy-MM-dd')
      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, new Map())
      }
      const dateData = dataByDate.get(dateKey)!
      if (!dateData.has(inv.tag)) {
        dateData.set(inv.tag, { invested: 0, current: 0 })
      }
      const tagData = dateData.get(inv.tag)!
      tagData.invested += inv.investedAmount
      tagData.current += inv.currentValue
    })

    // Create datasets for selected tags
    const labels = Array.from(dataByDate.keys()).sort()
    const datasets: Array<{ label: string; data: number[]; color?: string }> =
      []

    selectedTagsGraph.forEach((tag) => {
      const investedData = labels.map((date) => {
        const dateData = dataByDate.get(date)
        return dateData?.get(tag)?.invested || 0
      })

      const currentData = labels.map((date) => {
        const dateData = dataByDate.get(date)
        return dateData?.get(tag)?.current || 0
      })

      datasets.push(
        {
          label: `${tag}: Invested`,
          data: investedData,
        },
        {
          label: `${tag}: Current`,
          data: currentData,
        }
      )
    })

    return createLineChartConfig(labels, datasets)
  }, [investments, graphTimeWindow, selectedTagsGraph])

  // Process table data
  const tableData = useMemo(() => {
    const timeWindowDays = {
      '3m': 90,
      '6m': 180,
      '1y': 365,
      '2y': 730,
      '3y': 1095,
      all: Infinity,
    }

    return investments
      .filter((inv) => selectedTagsTable.includes(inv.tag))
      .filter((inv) => {
        if (tableTimeWindow === 'all') return true
        const daysDiff =
          Math.abs(Date.now() - new Date(inv.recordDate).getTime()) /
          (1000 * 60 * 60 * 24)
        return daysDiff <= timeWindowDays[tableTimeWindow]
      })
      .map((inv) => ({
        recordDate: format(new Date(inv.recordDate), 'MMM dd, yyyy'),
        tag: inv.tag,
        investedAmount: inv.investedAmount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
        currentValue: inv.currentValue.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
        valueToPrice:
          inv.investedAmount > 0
            ? (inv.currentValue / inv.investedAmount).toFixed(2)
            : '0',
      }))
  }, [investments, tableTimeWindow, selectedTagsTable])

  const tableColumns = [
    { id: 'recordDate', label: 'Recorded On', align: 'left' as const },
    { id: 'tag', label: 'Tag', align: 'right' as const },
    { id: 'investedAmount', label: 'Invested', align: 'right' as const },
    { id: 'currentValue', label: 'Current Value', align: 'right' as const },
    { id: 'valueToPrice', label: 'V/P Ratio', align: 'right' as const },
  ]

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', marginY: 2 }}>
        {investments.length === 0 ? (
          <Typography variant="h4" component="h3" gutterBottom>
            No investments data available. Please add some investments first!
          </Typography>
        ) : (
          <>
            {/* Chart Section */}
            <Box sx={{ width: '100%', mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Portfolio Performance Chart
              </Typography>

              {/* Time Window Controls for Chart */}
              <Box sx={{ mb: 2 }}>
                <ToggleButtonGroup
                  value={graphTimeWindow}
                  exclusive
                  onChange={(_, value) => value && setGraphTimeWindow(value)}
                  aria-label="chart time window"
                >
                  <ToggleButton value="3m">3m</ToggleButton>
                  <ToggleButton value="6m">6m</ToggleButton>
                  <ToggleButton value="1y">1yr</ToggleButton>
                  <ToggleButton value="2y">2yr</ToggleButton>
                  <ToggleButton value="3y">3yr</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Tag Selection for Chart */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="column" spacing={2} alignItems="center">
                  <Chip
                    label="Select All"
                    variant={selectAllGraph ? 'filled' : 'outlined'}
                    onClick={toggleSelectAllGraph}
                    color="primary"
                  />
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ justifyContent: 'center' }}
                  >
                    {availableTags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        variant={
                          selectedTagsGraph.includes(tag)
                            ? 'filled'
                            : 'outlined'
                        }
                        onClick={() => toggleTagGraph(tag)}
                        color="secondary"
                      />
                    ))}
                  </Stack>
                </Stack>
              </Box>

              {/* Chart */}
              <ChartContainer
                title="Investment Growth Over Time"
                type="line"
                data={chartData}
                height={400}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Portfolio Performance',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(value as number)
                        },
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* Table Section */}
            <Box sx={{ width: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Investment Details
              </Typography>

              {/* Time Window Controls for Table */}
              <Box sx={{ mb: 2 }}>
                <ToggleButtonGroup
                  value={tableTimeWindow}
                  exclusive
                  onChange={(_, value) => value && setTableTimeWindow(value)}
                  aria-label="table time window"
                >
                  <ToggleButton value="3m">3m</ToggleButton>
                  <ToggleButton value="6m">6m</ToggleButton>
                  <ToggleButton value="1y">1yr</ToggleButton>
                  <ToggleButton value="2y">2yr</ToggleButton>
                  <ToggleButton value="3y">3yr</ToggleButton>
                  <ToggleButton value="all">All</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Tag Selection for Table */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="column" spacing={2} alignItems="center">
                  <Chip
                    label="Select All"
                    variant={selectAllTable ? 'filled' : 'outlined'}
                    onClick={toggleSelectAllTable}
                    color="primary"
                  />
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ justifyContent: 'center' }}
                  >
                    {availableTags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        variant={
                          selectedTagsTable.includes(tag)
                            ? 'filled'
                            : 'outlined'
                        }
                        onClick={() => toggleTagTable(tag)}
                        color="secondary"
                      />
                    ))}
                  </Stack>
                </Stack>
              </Box>

              {/* Table */}
              <TableWithActions
                title="Investment Records"
                columns={tableColumns}
                data={tableData}
                maxHeight={600}
                emptyMessage="No investments match the selected filters"
              />
            </Box>
          </>
        )}
      </Box>
    </LocalizationProvider>
  )
}

export default StatusTab
