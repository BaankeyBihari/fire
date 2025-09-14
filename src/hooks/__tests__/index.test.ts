import { renderHook, act } from '@testing-library/react'
import {
    usePortfolioAnalytics,
    useDebounce,
    useTimeWindowFilter,
    useTagSelection,
    useFormValidation,
    useAsyncOperation,
    useDataPersistence
} from '../index'

// Mock the calculations utilities
jest.mock('../../utils/calculations', () => ({
    calculatePortfolioSummary: jest.fn((investments) => ({
        totalInvested: investments.reduce((sum: number, inv: any) => sum + inv.investedAmount, 0),
        totalCurrent: investments.reduce((sum: number, inv: any) => sum + inv.currentValue, 0),
        totalGains: 100,
        totalReturn: 5.5
    })),
    calculateTagBreakdown: jest.fn(() => []),
    filterInvestmentsByTimeWindow: jest.fn((investments) => investments),
    getRecentInvestments: jest.fn((investments) => investments.slice(0, 5))
}))

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})

describe('Hook tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.getItem.mockClear()
        localStorageMock.setItem.mockClear()
        localStorageMock.removeItem.mockClear()
    })

    describe('usePortfolioAnalytics', () => {
        it('should calculate portfolio metrics', () => {
            const mockInvestments = [
                {
                    recordDate: new Date('2023-01-01'),
                    tag: 'Stocks',
                    investedAmount: 1000,
                    currentValue: 1100
                }
            ]

            const { result } = renderHook(() => usePortfolioAnalytics(mockInvestments))

            expect(result.current.portfolioSummary.totalInvested).toBe(1000)
            expect(result.current.portfolioSummary.totalCurrent).toBe(1100)
            expect(result.current.portfolioSummary.totalGains).toBe(100)
            expect(result.current.portfolioSummary.totalReturn).toBe(5.5)
            expect(result.current.tagBreakdown).toEqual([])
            expect(result.current.recentInvestments).toEqual(mockInvestments)
        })

        it('should handle empty investments array', () => {
            const { result } = renderHook(() => usePortfolioAnalytics([]))

            expect(result.current.portfolioSummary.totalInvested).toBe(0)
            expect(result.current.portfolioSummary.totalCurrent).toBe(0)
        })
    })

    describe('useTimeWindowFilter', () => {
        const mockInvestments = [
            { recordDate: new Date('2023-01-01'), tag: 'Stocks', investedAmount: 1000, currentValue: 1100 }
        ]

        it('should initialize with default time window', () => {
            const { result } = renderHook(() => useTimeWindowFilter(mockInvestments))

            expect(result.current.timeWindow).toBe(365)
            expect(result.current.filteredInvestments).toEqual(mockInvestments)
        })

        it('should initialize with custom default time window', () => {
            const { result } = renderHook(() => useTimeWindowFilter(mockInvestments, 90))

            expect(result.current.timeWindow).toBe(90)
        })

        it('should update time window', () => {
            const { result } = renderHook(() => useTimeWindowFilter(mockInvestments))

            act(() => {
                result.current.setTimeWindow(180)
            })

            expect(result.current.timeWindow).toBe(180)
        })
    })

    describe('useTagSelection', () => {
        const availableTags = ['Stocks', 'Bonds', 'Crypto']

        it('should initialize with all tags selected', () => {
            const { result } = renderHook(() => useTagSelection(availableTags))

            expect(result.current.selectedTags).toEqual(availableTags)
            expect(result.current.selectAll).toBe(true)
        })

        it('should toggle individual tags', () => {
            const { result } = renderHook(() => useTagSelection(availableTags))

            act(() => {
                result.current.toggleTag('Stocks')
            })

            expect(result.current.selectedTags).toEqual(['Bonds', 'Crypto'])
            expect(result.current.selectAll).toBe(false)
        })

        it('should toggle tag back on', () => {
            const { result } = renderHook(() => useTagSelection(availableTags))

            act(() => {
                result.current.toggleTag('Stocks')
            })

            expect(result.current.selectedTags).toEqual(['Bonds', 'Crypto'])
            expect(result.current.selectAll).toBe(false)

            act(() => {
                result.current.toggleTag('Stocks')
            })

            expect(result.current.selectedTags).toEqual(['Bonds', 'Crypto', 'Stocks'])
            expect(result.current.selectAll).toBe(true)
        })

        it('should toggle select all off', () => {
            const { result } = renderHook(() => useTagSelection(availableTags))

            act(() => {
                result.current.toggleSelectAll()
            })

            expect(result.current.selectedTags).toEqual([])
            expect(result.current.selectAll).toBe(false)
        })

        it('should toggle select all on', () => {
            const { result } = renderHook(() => useTagSelection(availableTags))

            act(() => {
                result.current.toggleSelectAll()
            })

            act(() => {
                result.current.toggleSelectAll()
            })

            expect(result.current.selectedTags).toEqual(availableTags)
            expect(result.current.selectAll).toBe(true)
        })

        it('should update when available tags change', () => {
            const { result, rerender } = renderHook(
                ({ tags }) => useTagSelection(tags),
                { initialProps: { tags: availableTags } }
            )

            const newTags = ['Stocks', 'Bonds', 'Real Estate']
            rerender({ tags: newTags })

            expect(result.current.selectedTags).toEqual(newTags)
            expect(result.current.selectAll).toBe(true)
        })
    })

    describe('useFormValidation', () => {
        const initialData = { name: '', email: '' }
        const validationRules = (data: typeof initialData) => {
            const errors = []
            if (!data.name) errors.push('Name is required')
            if (!data.email) errors.push('Email is required')
            if (data.email && !data.email.includes('@')) errors.push('Invalid email')
            return errors
        }

        it('should initialize form validation', () => {
            const { result } = renderHook(() => useFormValidation(initialData, validationRules))

            expect(result.current.data).toEqual(initialData)
            expect(result.current.errors).toEqual(['Name is required', 'Email is required'])
            expect(result.current.isValid).toBe(false)
        })

        it('should update field and validate', () => {
            const { result } = renderHook(() => useFormValidation(initialData, validationRules))

            act(() => {
                result.current.updateField('name', 'John Doe')
            })

            expect(result.current.data.name).toBe('John Doe')
            expect(result.current.errors).toEqual(['Email is required'])
        })

        it('should validate complete form', () => {
            const { result } = renderHook(() => useFormValidation(initialData, validationRules))

            act(() => {
                result.current.updateField('name', 'John Doe')
            })

            act(() => {
                result.current.updateField('email', 'john@example.com')
            })

            expect(result.current.errors).toEqual([])
            expect(result.current.isValid).toBe(true)
        })

        it('should validate email format', () => {
            const { result } = renderHook(() => useFormValidation(initialData, validationRules))

            act(() => {
                result.current.updateField('name', 'John Doe')
            })

            act(() => {
                result.current.updateField('email', 'invalid-email')
            })

            expect(result.current.errors).toEqual(['Invalid email'])
            expect(result.current.isValid).toBe(false)
        })

        it('should reset form', () => {
            const { result } = renderHook(() => useFormValidation(initialData, validationRules))

            act(() => {
                result.current.updateField('name', 'John Doe')
            })

            act(() => {
                result.current.resetForm()
            })

            expect(result.current.data).toEqual(initialData)
            expect(result.current.errors).toEqual(['Name is required', 'Email is required'])
            expect(result.current.isValid).toBe(false)
        })

        it('should manually validate form', () => {
            const { result } = renderHook(() => useFormValidation(initialData, validationRules))

            let isValid
            act(() => {
                isValid = result.current.validateForm()
            })

            expect(isValid).toBe(false)
        })
    })

    describe('useAsyncOperation', () => {
        it('should handle successful operation', async () => {
            const { result } = renderHook(() => useAsyncOperation())

            const mockOperation = jest.fn().mockResolvedValue('success')

            await act(async () => {
                const response = await result.current.execute(mockOperation)
                expect(response).toBe('success')
            })

            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe(null)
        })

        it('should handle failed operation', async () => {
            const { result } = renderHook(() => useAsyncOperation())

            const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'))

            await act(async () => {
                const response = await result.current.execute(mockOperation)
                expect(response).toBe(null)
            })

            expect(result.current.isLoading).toBe(false)
            expect(result.current.error).toBe('Operation failed')
        })

        it('should handle non-Error rejection', async () => {
            const { result } = renderHook(() => useAsyncOperation())

            const mockOperation = jest.fn().mockRejectedValue('String error')

            await act(async () => {
                const response = await result.current.execute(mockOperation)
                expect(response).toBe(null)
            })

            expect(result.current.error).toBe('An error occurred')
        })

        it('should clear error', () => {
            const { result } = renderHook(() => useAsyncOperation())

            act(() => {
                result.current.clearError()
            })

            expect(result.current.error).toBe(null)
        })

        it('should clear error', () => {
            const { result } = renderHook(() => useAsyncOperation())

            act(() => {
                result.current.clearError()
            })

            expect(result.current.error).toBe(null)
        })
    })

    describe('useDataPersistence', () => {
        const testKey = 'test-key'

        it('should save data to localStorage', () => {
            const { result } = renderHook(() => useDataPersistence(testKey))

            const testData = { name: 'John', age: 30 }
            const success = result.current.saveData(testData)

            expect(success).toBe(true)
            expect(localStorageMock.setItem).toHaveBeenCalledWith(testKey, JSON.stringify(testData))
        })

        it('should handle save error', () => {
            const { result } = renderHook(() => useDataPersistence(testKey))

            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage full')
            })

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            const success = result.current.saveData({ test: 'data' })

            expect(success).toBe(false)
            expect(consoleSpy).toHaveBeenCalledWith('Failed to save data:', expect.any(Error))

            consoleSpy.mockRestore()
        })

        it('should load data from localStorage', () => {
            const { result } = renderHook(() => useDataPersistence(testKey))

            const testData = { name: 'John', age: 30 }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(testData))

            const loadedData = result.current.loadData()

            expect(loadedData).toEqual(testData)
            expect(localStorageMock.getItem).toHaveBeenCalledWith(testKey)
        })

        it('should return null when no data exists', () => {
            const { result } = renderHook(() => useDataPersistence(testKey))

            localStorageMock.getItem.mockReturnValue(null)

            const loadedData = result.current.loadData()

            expect(loadedData).toBe(null)
        })

        it('should handle load error', () => {
            const { result } = renderHook(() => useDataPersistence(testKey))

            localStorageMock.getItem.mockImplementation(() => {
                throw new Error('Read error')
            })

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            const loadedData = result.current.loadData()

            expect(loadedData).toBe(null)
            expect(consoleSpy).toHaveBeenCalledWith('Failed to load data:', expect.any(Error))

            consoleSpy.mockRestore()
        })

        it('should handle invalid JSON', () => {
            const { result } = renderHook(() => useDataPersistence(testKey))

            localStorageMock.getItem.mockReturnValue('invalid json')

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            const loadedData = result.current.loadData()

            expect(loadedData).toBe(null)
            expect(consoleSpy).toHaveBeenCalled()

            consoleSpy.mockRestore()
        })

        it('should clear data from localStorage', () => {
            const { result } = renderHook(() => useDataPersistence(testKey))

            const success = result.current.clearData()

            expect(success).toBe(true)
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(testKey)
        })

        it('should handle clear error', () => {
            const { result } = renderHook(() => useDataPersistence(testKey))

            localStorageMock.removeItem.mockImplementation(() => {
                throw new Error('Clear error')
            })

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            const success = result.current.clearData()

            expect(success).toBe(false)
            expect(consoleSpy).toHaveBeenCalledWith('Failed to clear data:', expect.any(Error))

            consoleSpy.mockRestore()
        })
    })

    describe('useDebounce', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should debounce values', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'initial', delay: 500 }
                }
            )

            expect(result.current).toBe('initial')

            rerender({ value: 'updated', delay: 500 })

            // Value should still be initial before timeout
            expect(result.current).toBe('initial')

            // Fast forward time
            act(() => {
                jest.advanceTimersByTime(500)
            })

            // Now value should be updated
            expect(result.current).toBe('updated')
        })

        it('should handle rapid changes', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'first', delay: 300 }
                }
            )

            expect(result.current).toBe('first')

            // Quick succession of changes
            rerender({ value: 'second', delay: 300 })
            rerender({ value: 'third', delay: 300 })
            rerender({ value: 'final', delay: 300 })

            // Should still show initial value
            expect(result.current).toBe('first')

            act(() => {
                jest.advanceTimersByTime(300)
            })

            // Should show the final value
            expect(result.current).toBe('final')
        })

        it('should handle different delay values', () => {
            const { result, rerender } = renderHook(
                ({ value, delay }) => useDebounce(value, delay),
                {
                    initialProps: { value: 'start', delay: 100 }
                }
            )

            rerender({ value: 'change1', delay: 100 })

            act(() => {
                jest.advanceTimersByTime(50)
            })

            expect(result.current).toBe('start')

            act(() => {
                jest.advanceTimersByTime(50)
            })

            expect(result.current).toBe('change1')
        })
    })
})
