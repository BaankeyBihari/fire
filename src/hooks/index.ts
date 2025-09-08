import { useState, useEffect, useCallback, useMemo } from 'react'
import { Investment, TimeWindow } from '../types'
import {
    calculatePortfolioSummary,
    calculateTagBreakdown,
    filterInvestmentsByTimeWindow,
    getRecentInvestments
} from '../utils/calculations'

/**
 * Hook for managing portfolio analytics and calculations
 */
export const usePortfolioAnalytics = (investments: Investment[]) => {
    const portfolioSummary = useMemo(() =>
        calculatePortfolioSummary(investments),
        [investments]
    )

    const tagBreakdown = useMemo(() =>
        calculateTagBreakdown(investments),
        [investments]
    )

    const recentInvestments = useMemo(() =>
        getRecentInvestments(investments, 10),
        [investments]
    )

    return {
        portfolioSummary,
        tagBreakdown,
        recentInvestments
    }
}

/**
 * Hook for managing time window filtering
 */
export const useTimeWindowFilter = (investments: Investment[], defaultWindow: TimeWindow = 365) => {
    const [timeWindow, setTimeWindow] = useState<TimeWindow>(defaultWindow)

    const filteredInvestments = useMemo(() =>
        filterInvestmentsByTimeWindow(investments, timeWindow),
        [investments, timeWindow]
    )

    return {
        timeWindow,
        setTimeWindow,
        filteredInvestments
    }
}

/**
 * Hook for managing selected tags/filters
 */
export const useTagSelection = (availableTags: string[]) => {
    const [selectedTags, setSelectedTags] = useState<string[]>(availableTags)
    const [selectAll, setSelectAll] = useState(true)

    const toggleTag = useCallback((tag: string) => {
        setSelectedTags(prev => {
            const isSelected = prev.includes(tag)
            const newSelection = isSelected
                ? prev.filter(t => t !== tag)
                : [...prev, tag]

            setSelectAll(newSelection.length === availableTags.length)
            return newSelection
        })
    }, [availableTags])

    const toggleSelectAll = useCallback(() => {
        if (selectAll) {
            setSelectedTags([])
            setSelectAll(false)
        } else {
            setSelectedTags(availableTags)
            setSelectAll(true)
        }
    }, [selectAll, availableTags])

    // Update selected tags when available tags change
    useEffect(() => {
        setSelectedTags(availableTags)
        setSelectAll(true)
    }, [availableTags])

    return {
        selectedTags,
        selectAll,
        toggleTag,
        toggleSelectAll
    }
}

/**
 * Hook for form validation
 */
export const useFormValidation = <T>(
    initialData: T,
    validationRules: (data: T) => string[]
) => {
    const [data, setData] = useState<T>(initialData)
    const [errors, setErrors] = useState<string[]>([])
    const [isValid, setIsValid] = useState(false)

    const validateForm = useCallback(() => {
        const validationErrors = validationRules(data)
        setErrors(validationErrors)
        setIsValid(validationErrors.length === 0)
        return validationErrors.length === 0
    }, [data, validationRules])

    const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setData(prev => ({ ...prev, [field]: value }))
    }, [])

    const resetForm = useCallback(() => {
        setData(initialData)
        setErrors([])
        setIsValid(false)
    }, [initialData])

    // Validate whenever data changes
    useEffect(() => {
        validateForm()
    }, [validateForm])

    return {
        data,
        errors,
        isValid,
        updateField,
        resetForm,
        validateForm
    }
}

/**
 * Hook for managing loading states
 */
export const useAsyncOperation = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await operation()
            return result
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    const clearError = useCallback(() => setError(null), [])

    return {
        isLoading,
        error,
        execute,
        clearError
    }
}

/**
 * Hook for managing data persistence
 */
export const useDataPersistence = (key: string) => {
    const saveData = useCallback((data: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(data))
            return true
        } catch (error) {
            console.error('Failed to save data:', error)
            return false
        }
    }, [key])

    const loadData = useCallback(() => {
        try {
            const stored = localStorage.getItem(key)
            return stored ? JSON.parse(stored) : null
        } catch (error) {
            console.error('Failed to load data:', error)
            return null
        }
    }, [key])

    const clearData = useCallback(() => {
        try {
            localStorage.removeItem(key)
            return true
        } catch (error) {
            console.error('Failed to clear data:', error)
            return false
        }
    }, [key])

    return {
        saveData,
        loadData,
        clearData
    }
}

/**
 * Hook for debouncing values (useful for search/filter inputs)
 */
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

// Additional form and data processing hooks
export { useFormikWithReset, useFormState } from './useForm'
export type { UseFormikWithResetReturn, UseFormStateReturn } from './useForm'

export { useDataProcessing, useDataFiltering } from './useDataProcessing'
export type { ProcessedData, UseDataProcessingReturn, UseDataFilteringReturn } from './useDataProcessing'

export { useFileOperations, useLocalStorage } from './useFileOperations'
export type { UseFileOperationsReturn, UseLocalStorageReturn } from './useFileOperations'
