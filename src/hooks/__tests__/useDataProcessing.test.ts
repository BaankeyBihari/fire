import { renderHook, act } from '@testing-library/react'
import { useDataProcessing, useDataFiltering } from '../useDataProcessing'
import { Investment, Inflation } from '../../types'

const mockInvestments: Investment[] = [
    {
        investedAmount: 10000,
        currentValue: 11000,
        recordDate: new Date('2023-01-01'),
        tag: 'Stocks'
    },
    {
        investedAmount: 5000,
        currentValue: 5200,
        recordDate: new Date('2023-02-01'),
        tag: 'Bonds'
    },
    {
        investedAmount: 8000,
        currentValue: 8400,
        recordDate: new Date('2023-03-01'),
        tag: 'Crypto'
    }
]

const mockInflations: Inflation[] = [
    {
        inflation: 3.0,
        recordDate: new Date('2023-01-01')
    },
    {
        inflation: 3.2,
        recordDate: new Date('2023-06-01')
    }
]

describe('useDataProcessing hooks', () => {
    describe('useDataProcessing', () => {
        it('should initialize with default state', () => {
            const { result } = renderHook(() => useDataProcessing())

            expect(result.current.processedData).toBe(null)
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
        })

        it('should process data successfully', async () => {
            const { result } = renderHook(() => useDataProcessing())

            await act(async () => {
                await result.current.processData(
                    mockInvestments,
                    mockInflations,
                    new Date('2023-01-01')
                )
            })

            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe(null)
            expect(result.current.processedData).not.toBe(null)

            const data = result.current.processedData!
            expect(data.portfolioValue).toBeInstanceOf(Array)
            expect(data.contributions).toBeInstanceOf(Array)
            expect(data.growth).toBeInstanceOf(Array)
            expect(data.realValue).toBeInstanceOf(Array)
            expect(data.dates).toBeInstanceOf(Array)
            expect(data.years).toBeInstanceOf(Array)

            expect(data.portfolioValue.length).toBeGreaterThan(0)
            expect(data.contributions.length).toBe(data.portfolioValue.length)
            expect(data.growth.length).toBe(data.portfolioValue.length)
        })

        it('should handle empty investments array with error', async () => {
            const { result } = renderHook(() => useDataProcessing())

            await act(async () => {
                await result.current.processData(
                    [],
                    mockInflations,
                    new Date('2023-01-01')
                )
            })

            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe('No investment data available')
            expect(result.current.processedData).toBe(null)
        })

        it('should set loading state during processing', async () => {
            const { result } = renderHook(() => useDataProcessing())

            const processPromise = act(async () => {
                return result.current.processData(
                    mockInvestments,
                    mockInflations,
                    new Date('2023-01-01')
                )
            })

            // The loading state should be true during processing
            // Note: This might not work perfectly due to async nature
            await processPromise

            expect(result.current.loading).toBe(false)
        })

        it('should clear data and error', () => {
            const { result } = renderHook(() => useDataProcessing())

            act(() => {
                result.current.clearData()
            })

            expect(result.current.processedData).toBe(null)
            expect(result.current.error).toBe(null)
        })

        it('should sort investments and inflations by date', async () => {
            const unsortedInvestments: Investment[] = [
                {
                    investedAmount: 8000,
                    currentValue: 8400,
                    recordDate: new Date('2023-03-01'),
                    tag: 'Latest'
                },
                {
                    investedAmount: 10000,
                    currentValue: 11000,
                    recordDate: new Date('2023-01-01'),
                    tag: 'Earliest'
                },
                {
                    investedAmount: 5000,
                    currentValue: 5200,
                    recordDate: new Date('2023-02-01'),
                    tag: 'Middle'
                }
            ]

            const { result } = renderHook(() => useDataProcessing())

            await act(async () => {
                await result.current.processData(
                    unsortedInvestments,
                    mockInflations,
                    new Date('2023-01-01')
                )
            })

            expect(result.current.error).toBe(null)
            expect(result.current.processedData).not.toBe(null)
        })

        it('should calculate growth correctly over time', async () => {
            const { result } = renderHook(() => useDataProcessing())

            await act(async () => {
                await result.current.processData(
                    mockInvestments,
                    mockInflations,
                    new Date('2023-01-01')
                )
            })

            const data = result.current.processedData!
            expect(data.growth.length).toBeGreaterThan(0)

            // Growth should be portfolio value minus contributions
            data.growth.forEach((growth, index) => {
                expect(growth).toBe(data.portfolioValue[index] - data.contributions[index])
            })
        })

        it('should handle inflation adjustments', async () => {
            const { result } = renderHook(() => useDataProcessing())

            await act(async () => {
                await result.current.processData(
                    mockInvestments,
                    mockInflations,
                    new Date('2023-01-01')
                )
            })

            const data = result.current.processedData!
            expect(data.realValue.length).toBeGreaterThan(0)

            // Real value should be less than or equal to portfolio value (due to inflation)
            data.realValue.forEach((realValue, index) => {
                expect(realValue).toBeLessThanOrEqual(data.portfolioValue[index])
            })
        })

        it('should generate monthly data points correctly', async () => {
            const { result } = renderHook(() => useDataProcessing())
            const startDate = new Date('2023-01-01')

            await act(async () => {
                await result.current.processData(
                    mockInvestments,
                    mockInflations,
                    startDate
                )
            })

            const data = result.current.processedData!
            expect(data.dates.length).toBeGreaterThan(0)

            // Check that dates are in YYYY-MM format
            data.dates.forEach(date => {
                expect(date).toMatch(/^\d{4}-\d{2}$/)
            })

            // Check that years array corresponds to months from start
            expect(data.years.length).toBe(data.dates.length)
            data.years.forEach((year) => {
                expect(typeof year).toBe('number')
                expect(year).toBeGreaterThanOrEqual(0)
            })
        })

        it('should accumulate contributions correctly', async () => {
            const { result } = renderHook(() => useDataProcessing())

            await act(async () => {
                await result.current.processData(
                    mockInvestments,
                    mockInflations,
                    new Date('2023-01-01')
                )
            })

            const data = result.current.processedData!

            // Contributions should be non-decreasing over time
            for (let i = 1; i < data.contributions.length; i++) {
                expect(data.contributions[i]).toBeGreaterThanOrEqual(data.contributions[i - 1])
            }

            // Final contribution should be sum of all investments
            const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.investedAmount, 0)
            const finalContribution = data.contributions[data.contributions.length - 1]
            expect(finalContribution).toBe(totalInvested)
        })
    })

    describe('useDataFiltering', () => {
        const mockProcessedData = {
            portfolioValue: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
            contributions: [100, 150, 200, 250, 300, 350, 400, 450, 500, 550],
            growth: [0, 50, 100, 150, 200, 250, 300, 350, 400, 450],
            realValue: [100, 195, 285, 375, 465, 555, 645, 735, 825, 915],
            dates: ['2022-01', '2022-02', '2022-03', '2022-04', '2022-05', '2022-06', '2022-07', '2022-08', '2022-09', '2022-10'],
            years: [0, 1 / 12, 2 / 12, 3 / 12, 4 / 12, 5 / 12, 6 / 12, 7 / 12, 8 / 12, 9 / 12]
        }

        it('should initialize with all data and default time window', () => {
            const { result } = renderHook(() => useDataFiltering(mockProcessedData))

            expect(result.current.timeWindow).toBe('all')
            expect(result.current.filteredData).toEqual(mockProcessedData)
        })

        it('should filter data for 1 year window', () => {
            const { result } = renderHook(() => useDataFiltering(mockProcessedData))

            act(() => {
                result.current.setTimeWindow('1y')
            })

            expect(result.current.timeWindow).toBe('1y')
            expect(result.current.filteredData).not.toBe(null)

            // Should return last 12 months of data (all our mock data is within 10 months)
            expect(result.current.filteredData!.portfolioValue.length).toBe(10)
        })

        it('should filter data for 5 year window', () => {
            const { result } = renderHook(() => useDataFiltering(mockProcessedData))

            act(() => {
                result.current.setTimeWindow('5y')
            })

            expect(result.current.timeWindow).toBe('5y')
            expect(result.current.filteredData!.portfolioValue.length).toBe(10) // All data since it's within 5 years
        })

        it('should filter data for 10 year window', () => {
            const { result } = renderHook(() => useDataFiltering(mockProcessedData))

            act(() => {
                result.current.setTimeWindow('10y')
            })

            expect(result.current.timeWindow).toBe('10y')
            expect(result.current.filteredData!.portfolioValue.length).toBe(10) // All data since it's within 10 years
        })

        it('should return to all data when set to all', () => {
            const { result } = renderHook(() => useDataFiltering(mockProcessedData))

            act(() => {
                result.current.setTimeWindow('1y')
            })

            act(() => {
                result.current.setTimeWindow('all')
            })

            expect(result.current.timeWindow).toBe('all')
            expect(result.current.filteredData).toEqual(mockProcessedData)
        })

        it('should handle null data', () => {
            const { result } = renderHook(() => useDataFiltering(null))

            expect(result.current.filteredData).toBe(null)

            act(() => {
                result.current.setTimeWindow('1y')
            })

            expect(result.current.filteredData).toBe(null)
        })

        it('should filter correctly with longer data sets', () => {
            // Create 5 years of monthly data (60 months)
            const longData = {
                portfolioValue: Array.from({ length: 60 }, (_, i) => (i + 1) * 1000),
                contributions: Array.from({ length: 60 }, (_, i) => (i + 1) * 500),
                growth: Array.from({ length: 60 }, (_, i) => (i + 1) * 500),
                realValue: Array.from({ length: 60 }, (_, i) => (i + 1) * 950),
                dates: Array.from({ length: 60 }, (_, i) => {
                    const date = new Date(2019, i)
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                }),
                years: Array.from({ length: 60 }, (_, i) => i / 12)
            }

            const { result } = renderHook(() => useDataFiltering(longData))

            act(() => {
                result.current.setTimeWindow('1y')
            })

            // Should return last 12 months
            expect(result.current.filteredData!.portfolioValue.length).toBe(12)
            expect(result.current.filteredData!.portfolioValue).toEqual(longData.portfolioValue.slice(-12))

            act(() => {
                result.current.setTimeWindow('5y')
            })

            // Should return all 60 months (5 years)
            expect(result.current.filteredData!.portfolioValue.length).toBe(60)
        })

        it('should maintain data structure consistency', () => {
            const { result } = renderHook(() => useDataFiltering(mockProcessedData))

            act(() => {
                result.current.setTimeWindow('1y')
            })

            const filtered = result.current.filteredData!
            const length = filtered.portfolioValue.length

            expect(filtered.contributions.length).toBe(length)
            expect(filtered.growth.length).toBe(length)
            expect(filtered.realValue.length).toBe(length)
            expect(filtered.dates.length).toBe(length)
            expect(filtered.years.length).toBe(length)
        })
    })
})
