import React, { useState } from 'react'
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  createFilterOptions,
  AutocompleteRenderInputParams,
} from '@mui/material'
import { SxProps, Theme } from '@mui/material/styles'

export interface Option {
  id: string
  label: string
  value?: any
}

export interface TagAutocompleteProps {
  label: string
  options: Option[]
  selectedOptions: Option[]
  onSelectionChange: (selected: Option[]) => void
  onCreateOption?: (inputValue: string) => Option
  placeholder?: string
  helperText?: string
  error?: boolean
  errorText?: string
  disabled?: boolean
  freeSolo?: boolean
  multiple?: boolean
  maxTags?: number
  sx?: SxProps<Theme>
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: Option
  ) => React.ReactNode
  getOptionLabel?: (option: Option | string) => string
  isOptionEqualToValue?: (option: Option, value: Option) => boolean
}

const filter = createFilterOptions<Option>()

export const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
  label,
  options,
  selectedOptions,
  onSelectionChange,
  onCreateOption,
  placeholder,
  helperText,
  error = false,
  errorText,
  disabled = false,
  freeSolo = true,
  multiple = true,
  maxTags,
  sx,
  renderOption,
  getOptionLabel,
  isOptionEqualToValue,
}) => {
  const [inputValue, setInputValue] = useState('')

  const handleChange = (
    _: any,
    newValue: (Option | string)[] | Option | string | null
  ) => {
    const processedOptions: Option[] = []

    // Convert to array format for consistent processing
    const valueArray = Array.isArray(newValue)
      ? newValue
      : newValue
        ? [newValue]
        : []

    valueArray.forEach((item) => {
      if (typeof item === 'string') {
        // Handle string input for free solo mode
        if (onCreateOption && item.trim()) {
          processedOptions.push(onCreateOption(item.trim()))
        }
      } else if (item && typeof item === 'object') {
        // Handle regular option objects
        if ('inputValue' in item && item.inputValue && onCreateOption) {
          // Handle "Add new..." option
          processedOptions.push(onCreateOption(String(item.inputValue)))
        } else {
          // Handle existing options
          processedOptions.push(item as Option)
        }
      }
    })

    onSelectionChange(processedOptions)
  }

  const filterOptions = (options: Option[], params: any) => {
    const filtered = filter(options, params)

    const { inputValue } = params
    const isExisting = options.some(
      (option) => inputValue === option.label || inputValue === option.id
    )

    if (inputValue !== '' && !isExisting && onCreateOption) {
      filtered.push({
        id: `new-${inputValue}`,
        label: `Add "${inputValue}"`,
        inputValue,
      } as any)
    }

    return filtered
  }

  const defaultGetOptionLabel = (option: Option | string): string => {
    // Handle null, undefined, or empty array cases
    if (!option || Array.isArray(option)) {
      return ''
    }

    if (typeof option === 'string') {
      return option
    }

    if (typeof option === 'object' && 'inputValue' in option) {
      return (option as any).inputValue
    }

    // Ensure option has required properties before accessing
    if (typeof option === 'object' && option.label) {
      return getOptionLabel ? getOptionLabel(option) : option.label
    }

    return ''
  }

  const defaultIsOptionEqualToValue = (
    option: Option,
    value: Option
  ): boolean => {
    if (isOptionEqualToValue) {
      return isOptionEqualToValue(option, value)
    }
    return option.id === value.id
  }

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      label={label}
      placeholder={selectedOptions.length === 0 ? placeholder : undefined}
      helperText={error ? errorText : helperText}
      error={error}
      disabled={disabled}
      variant="outlined"
      InputProps={{
        ...params.InputProps,
        sx: {
          '& .MuiAutocomplete-tag': {
            maxWidth: '200px',
          },
        },
      }}
    />
  )

  return (
    <Box sx={sx}>
      <Autocomplete
        multiple={multiple}
        freeSolo={freeSolo}
        value={selectedOptions}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        options={options}
        filterOptions={filterOptions}
        getOptionLabel={defaultGetOptionLabel}
        isOptionEqualToValue={defaultIsOptionEqualToValue}
        renderInput={renderInput}
        renderOption={renderOption}
        renderTags={(tagValue, getTagProps) =>
          tagValue.slice(0, maxTags || tagValue.length).map((option, index) => {
            const safeOption = option as Option | string
            return (
              <Chip
                {...getTagProps({ index })}
                key={
                  typeof safeOption === 'string' ? safeOption : safeOption.id
                }
                label={
                  typeof safeOption === 'string' ? safeOption : safeOption.label
                }
                size="small"
                variant="outlined"
                sx={{
                  maxWidth: '200px',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            )
          })
        }
        disabled={disabled}
        disableCloseOnSelect={multiple}
        clearOnBlur={false}
        selectOnFocus
        handleHomeEndKeys
        sx={{
          '& .MuiAutocomplete-inputRoot': {
            flexWrap: 'wrap',
          },
        }}
      />
      {maxTags && selectedOptions.length > maxTags && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          Showing {maxTags} of {selectedOptions.length} selected items
        </Typography>
      )}
    </Box>
  )
}

export default TagAutocomplete
