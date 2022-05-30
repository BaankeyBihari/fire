import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import InvestmentStep, {
  DummyInvestmentStep,
} from '@components/models/investmentStep'
import InflationStep, {
  DummyInflationStep,
} from '@components/models/inflationStep'
import * as React from 'react'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

import ClearIcon from '@mui/icons-material/Clear'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import DoneIcon from '@mui/icons-material/Done'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Box from '@mui/material/Box'

interface TagOptionType {
  inputValue?: string
  tag: string
}

const tagsFilter = createFilterOptions<TagOptionType>()

export default function Record(props: any) {
  const {
    investments,
    dispatchInvestment,
    annualInflation,
    dispatchAnnualInflation,
  } = props

  const [recordInvestmentDate, setRecordInvestmentDate] = React.useState(
    new Date()
  )

  const [recordInflationDate, setRecordInflationDate] = React.useState(
    new Date()
  )

  const [tagsAvailable, setTagsAvailable] = React.useState<
    TagOptionType[] | []
  >([])
  const [newTag, setNewTag] = React.useState<TagOptionType | null>(null)

  const [investedValue, setInvestedValue] = React.useState<string | number>(0)

  const [currentValue, setCurrentValue] = React.useState<string | number>(0)

  const [inflationRate, setInflationRate] = React.useState<string | number>(0)

  const resetInvestmentEntry = () => {
    setNewTag(null)
    setInvestedValue(0)
    setCurrentValue(0)
    setRecordInvestmentDate(new Date())
  }

  const disallowedDates = (records: { recordDate: Date }[]) => {
    const disallowedDatesList = records.map((e) => e.recordDate.toDateString())
    const _helper = (date: Date) => {
      return disallowedDatesList.includes(date.toDateString())
    }
    return _helper
  }

  const resetInflationEntry = () => {
    setInflationRate(0)
    setRecordInflationDate(new Date())
  }

  const addInflation = () => {
    const ifv = new DummyInflationStep()
    if (typeof inflationRate === 'number') {
      ifv.inflation = inflationRate
    }
    ifv.recordDate = recordInflationDate
    dispatchAnnualInflation([...annualInflation, ifv])
    resetInflationEntry()
  }

  const addInvestment = () => {
    const ivv = new DummyInvestmentStep()
    if (newTag?.tag) {
      ivv.tag = newTag?.tag
    }
    if (typeof investedValue === 'number') {
      ivv.investedAmount = investedValue
    }
    if (typeof currentValue === 'number') {
      ivv.currentValue = currentValue
    }
    ivv.recordDate = recordInvestmentDate
    dispatchInvestment([...investments, ivv])
    resetInvestmentEntry()
  }

  const deleteInvestmentRow = (index: number) => {
    const iv = [...investments]
    iv.splice(index, 1)
    dispatchInvestment(iv)
  }

  const deleteInflationRow = (index: number) => {
    const iv = [...annualInflation]
    iv.splice(index, 1)
    dispatchAnnualInflation(iv)
  }

  function onlyUnique(value: any, index: any, self: string | any[]) {
    return self.indexOf(value) === index
  }

  React.useEffect(() => {
    console.log('investments', investments, investments.length)
    const tags = investments
      .map((e: { tag: any }) => e.tag)
      .filter(onlyUnique)
      .map((e: any) => {
        return { tag: e }
      })
    setTagsAvailable(tags)
  }, [investments])

  React.useEffect(() => {
    console.log('tagsAvailable', tagsAvailable)
  }, [tagsAvailable])

  React.useEffect(() => {
    console.log('newTag', newTag)
  }, [newTag])

  React.useEffect(() => {
    console.log('investedValue', investedValue)
  }, [investedValue])

  React.useEffect(() => {
    console.log('currentValue', currentValue)
  }, [currentValue])

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', marginY: '5px' }}>
        <Typography variant="h4" component="h3" gutterBottom>
          Investments
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="investment table">
            <TableHead>
              <TableRow>
                <TableCell>Recorded On</TableCell>
                <TableCell align="right">Tag</TableCell>
                <TableCell align="right">Invested</TableCell>
                <TableCell align="right">Current Value</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {investments.map((row: InvestmentStep, index: number) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {row.recordDate.toDateString()}
                  </TableCell>
                  <TableCell align="right">{row.tag}</TableCell>
                  <TableCell align="right">{row.investedAmount}</TableCell>
                  <TableCell align="right">{row.currentValue}</TableCell>
                  <TableCell align="right">
                    <ClearIcon
                      sx={{ margin: '10px' }}
                      onClick={() => {
                        // console.log("Cliked", index);
                        deleteInvestmentRow(index)
                      }}
                      color="error"
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell component="th" scope="row">
                  <DesktopDatePicker
                    label="Record Date"
                    inputFormat="MM/dd/yyyy"
                    value={recordInvestmentDate}
                    onChange={(d) => {
                      d && setRecordInvestmentDate(new Date(d.toDateString()))
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </TableCell>
                <TableCell align="right">
                  <Autocomplete
                    value={newTag}
                    onChange={(event, newValue) => {
                      if (typeof newValue === 'string') {
                        setNewTag({
                          tag: newValue,
                        })
                      } else if (newValue && newValue.inputValue) {
                        // Create a new value from the user input
                        setNewTag({
                          tag: newValue.inputValue,
                        })
                      } else {
                        setNewTag(newValue)
                      }
                    }}
                    filterOptions={(options, params) => {
                      const filtered = tagsFilter(options, params)

                      const { inputValue } = params
                      // Suggest the creation of a new value
                      const isExisting = options.some(
                        (option) => inputValue === option.tag
                      )
                      if (
                        inputValue.trim() !== '' &&
                        !isExisting &&
                        inputValue.trim().toLowerCase() !== 'actual' &&
                        inputValue.trim().toLowerCase() !== 'planned'
                      ) {
                        filtered.push({
                          inputValue,
                          tag: `Create New: "${inputValue.trim()}"`,
                        })
                      }

                      return filtered
                    }}
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    id="free-solo-with-text-demo"
                    options={tagsAvailable}
                    getOptionLabel={(option) => {
                      // Value selected with enter, right from the input
                      if (typeof option === 'string') {
                        return option
                      }
                      // Add "xxx" option created dynamically
                      if (option.inputValue) {
                        return option.inputValue
                      }
                      // Regular option
                      return option.tag
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>{option.tag}</li>
                    )}
                    sx={{ width: '100%' }}
                    freeSolo
                    renderInput={(params) => (
                      <TextField {...params} label="Select Tag" />
                    )}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    sx={{ width: '100%' }}
                    type="number"
                    variant="outlined"
                    label="Invested Value"
                    inputProps={{ min: 0 }}
                    value={investedValue}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setInvestedValue(e.target.value)
                        return
                      }
                      const value = +e.target.value
                      if (value < 0) {
                        setInvestedValue(0)
                      } else {
                        setInvestedValue(value)
                      }
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    sx={{ width: '100%' }}
                    type="number"
                    variant="outlined"
                    label="Current Value"
                    inputProps={{ min: 0 }}
                    value={currentValue}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setCurrentValue(e.target.value)
                        return
                      }
                      const value = +e.target.value
                      if (value < 0) {
                        setCurrentValue(0)
                      } else {
                        setCurrentValue(value)
                      }
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <DoneIcon
                    sx={{ margin: '10px' }}
                    color={
                      newTag && investedValue !== '' && currentValue !== ''
                        ? 'primary'
                        : 'error'
                    }
                    onClick={() => {
                      if (
                        newTag &&
                        investedValue !== '' &&
                        currentValue !== ''
                      ) {
                        addInvestment()
                      }
                    }}
                  />
                  <RestartAltIcon
                    onClick={() => resetInvestmentEntry()}
                    sx={{ margin: '10px' }}
                    color="error"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ width: '100%', marginY: '5px' }}>
        <Typography variant="h4" component="h3" gutterBottom>
          Inflation Rate
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="investment table">
            <TableHead>
              <TableRow>
                <TableCell>Recorded On</TableCell>
                <TableCell align="right">Inflation Rate (%)</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {annualInflation.map((row: InflationStep, index: number) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {row.recordDate.toDateString()}
                  </TableCell>
                  <TableCell align="right">{row.inflation}</TableCell>
                  <TableCell align="right">
                    <ClearIcon
                      sx={{ margin: '10px' }}
                      onClick={() => {
                        // console.log("Cliked", index);
                        deleteInflationRow(index)
                      }}
                      color="error"
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell component="th" scope="row">
                  <DesktopDatePicker
                    label="Record Date"
                    inputFormat="MM/dd/yyyy"
                    value={recordInflationDate}
                    shouldDisableDate={disallowedDates(annualInflation)}
                    onChange={(d) => {
                      d && setRecordInflationDate(new Date(d.toDateString()))
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    sx={{ width: '100%' }}
                    type="number"
                    variant="outlined"
                    label="Inflation Rate (%)"
                    inputProps={{ min: 0 }}
                    value={inflationRate}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setInflationRate(e.target.value)
                        return
                      }
                      const value = +e.target.value
                      if (value < 0) {
                        setInflationRate(0)
                      } else {
                        setInflationRate(value)
                      }
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <DoneIcon
                    sx={{ margin: '10px' }}
                    color={
                      inflationRate !== '' &&
                      !disallowedDates(annualInflation)(recordInflationDate)
                        ? 'primary'
                        : 'error'
                    }
                    onClick={() => {
                      if (
                        inflationRate !== '' &&
                        !disallowedDates(annualInflation)(recordInflationDate)
                      ) {
                        addInflation()
                      }
                    }}
                  />
                  <RestartAltIcon
                    onClick={() => resetInflationEntry()}
                    sx={{ margin: '10px' }}
                    color="error"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </LocalizationProvider>
  )
}
