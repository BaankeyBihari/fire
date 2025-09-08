import { renderHook, act } from '@testing-library/react'
import { usePortfolioAnalytics, useDebounce } from '../index'

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

describe('Hook tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
    })
})
