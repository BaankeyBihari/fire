import React, { useState, useMemo } from 'react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import {
  Typography,
  TextField,
  Box,
  Button,
  Stack,
  Divider,
} from '@mui/material'
import {
  Done as DoneIcon,
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'

// Import new UI components
import { TableWithActions, TagAutocomplete, FormSection } from '../ui'

// Import types
import { Investment, Inflation } from '../../types'

interface TagOption {
  id: string
  label: string
  value: string
}

interface RecordTabProps {
  investments: Investment[]
  annualInflation: Inflation[]
  onUpdateInvestments: (investments: Investment[]) => void
  onUpdateInflation: (inflation: Inflation[]) => void
}

const RecordTab: React.FC<RecordTabProps> = ({
  investments,
  annualInflation,
  onUpdateInvestments,
  onUpdateInflation,
}) => {
  // Investment form state
  const [investmentDate, setInvestmentDate] = useState<Date>(new Date())
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([])
  const [investedValue, setInvestedValue] = useState<string>('')
  const [currentValue, setCurrentValue] = useState<string>('')

  // Inflation form state
  const [inflationDate, setInflationDate] = useState<Date>(new Date())
  const [inflationRate, setInflationRate] = useState<string>('')

  // Available tags from existing investments
  const availableTags = useMemo(() => {
    const tags = investments.map((inv) => inv.tag)
    const uniqueTags = Array.from(new Set(tags))
    return uniqueTags
      .filter(
        (tag) =>
          tag.toLowerCase() !== 'actual' && tag.toLowerCase() !== 'planned'
      )
      .map((tag) => ({ id: tag, label: tag, value: tag }))
  }, [investments])

  // Check if inflation date already exists
  const isInflationDateDisabled = (date: Date) => {
    return annualInflation.some(
      (inf) => new Date(inf.recordDate).toDateString() === date.toDateString()
    )
  }

  // Reset investment form
  const resetInvestmentForm = () => {
    setSelectedTags([])
    setInvestedValue('')
    setCurrentValue('')
    setInvestmentDate(new Date())
  }

  // Reset inflation form
  const resetInflationForm = () => {
    setInflationRate('')
    setInflationDate(new Date())
  }

  // Add new investment
  const addInvestment = () => {
    if (selectedTags.length === 0 || !investedValue || !currentValue) return

    const newInvestment: Investment = {
      recordDate: investmentDate,
      tag: selectedTags[0].value,
      investedAmount: parseFloat(investedValue),
      currentValue: parseFloat(currentValue),
    }

    onUpdateInvestments([...investments, newInvestment])
    resetInvestmentForm()
  }

  // Add new inflation record
  const addInflation = () => {
    if (!inflationRate || isInflationDateDisabled(inflationDate)) return

    const newInflation: Inflation = {
      recordDate: inflationDate,
      inflation: parseFloat(inflationRate),
    }

    onUpdateInflation([...annualInflation, newInflation])
    resetInflationForm()
  }

  // Delete investment
  const deleteInvestment = (index: number) => {
    const updatedInvestments = investments.filter((_, i) => i !== index)
    onUpdateInvestments(updatedInvestments)
  }

  // Delete inflation record
  const deleteInflationRecord = (index: number) => {
    const updatedInflation = annualInflation.filter((_, i) => i !== index)
    onUpdateInflation(updatedInflation)
  }

  // Handle tag selection change
  const handleTagSelectionChange = (
    selected: Array<{ id: string; label: string; value?: any }>
  ) => {
    const tagOptions: TagOption[] = selected.map((option) => ({
      id: option.id,
      label: option.label,
      value: option.value || option.label,
    }))
    setSelectedTags(tagOptions)
  }

  // Create tag option
  const createTagOption = (
    inputValue: string
  ): { id: string; label: string; value?: any } => ({
    id: inputValue.toLowerCase(),
    label: inputValue,
    value: inputValue,
  })

  // Investment table columns
  const investmentColumns = [
    {
      id: 'recordDate',
      label: 'Recorded On',
      format: (value: Date) => format(new Date(value), 'MMM dd, yyyy'),
    },
    { id: 'tag', label: 'Tag', align: 'right' as const },
    {
      id: 'investedAmount',
      label: 'Invested',
      align: 'right' as const,
      format: (value: number) =>
        value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
    },
    {
      id: 'currentValue',
      label: 'Current Value',
      align: 'right' as const,
      format: (value: number) =>
        value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
    },
  ]

  // Inflation table columns
  const inflationColumns = [
    {
      id: 'recordDate',
      label: 'Recorded On',
      format: (value: Date) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      id: 'inflation',
      label: 'Inflation Rate (%)',
      align: 'right' as const,
      format: (value: number) => `${value}%`,
    },
  ]

  // Form validation
  const isInvestmentFormValid =
    selectedTags.length > 0 && investedValue && currentValue
  const isInflationFormValid =
    inflationRate && !isInflationDateDisabled(inflationDate)

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', padding: 3 }}>
        {/* Investments Section */}
        <FormSection title="Investment Records" variant="outlined" spacing={3}>
          <TableWithActions
            columns={investmentColumns}
            data={investments}
            onDelete={deleteInvestment}
            maxHeight={400}
            emptyMessage="No investment records yet. Add your first investment below."
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Add New Investment
          </Typography>

          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DesktopDatePicker
                label="Record Date"
                format="MM/dd/yyyy"
                value={investmentDate}
                onChange={(date) => date && setInvestmentDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />

              <TagAutocomplete
                label="Investment Tag"
                options={availableTags}
                selectedOptions={selectedTags}
                onSelectionChange={handleTagSelectionChange}
                onCreateOption={createTagOption}
                multiple={false}
                placeholder="Select or create a tag"
                sx={{ minWidth: 200 }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Invested Amount"
                type="number"
                value={investedValue}
                onChange={(e) => setInvestedValue(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />

              <TextField
                fullWidth
                label="Current Value"
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<DoneIcon />}
                onClick={addInvestment}
                disabled={!isInvestmentFormValid}
              >
                Add Investment
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={resetInvestmentForm}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
        </FormSection>

        {/* Inflation Section */}
        <FormSection title="Inflation Records" variant="outlined" spacing={3}>
          <TableWithActions
            columns={inflationColumns}
            data={annualInflation}
            onDelete={deleteInflationRecord}
            maxHeight={300}
            emptyMessage="No inflation records yet. Add inflation data below."
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Add New Inflation Record
          </Typography>

          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DesktopDatePicker
                label="Record Date"
                format="MM/dd/yyyy"
                value={inflationDate}
                onChange={(date) => date && setInflationDate(date)}
                shouldDisableDate={isInflationDateDisabled}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: isInflationDateDisabled(inflationDate),
                    helperText: isInflationDateDisabled(inflationDate)
                      ? 'This date already has an inflation record'
                      : undefined,
                  },
                }}
              />

              <TextField
                fullWidth
                label="Inflation Rate"
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                InputProps={{
                  endAdornment: <span style={{ marginLeft: 8 }}>%</span>,
                }}
              />
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<DoneIcon />}
                onClick={addInflation}
                disabled={!isInflationFormValid}
              >
                Add Inflation Record
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={resetInflationForm}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
        </FormSection>
      </Box>
    </LocalizationProvider>
  )
}

export default RecordTab
