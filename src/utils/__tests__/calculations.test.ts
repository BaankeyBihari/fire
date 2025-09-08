import {
    calculatePortfolioSummary,
    calculateTagBreakdown,
    filterInvestmentsByTimeWindow,
    formatCurrency,
    validateInvestment,
    deepClone
} from '../calculations'
import { Investment, CurrencyConfig } from '../../types'

const mockCurrencyConfig: CurrencyConfig = {
    currency: 'USD',
    locale: 'en-US',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}

const mockInvestments: Investment[] = [
    {
        recordDate: new Date('2023-01-01'),
        tag: 'Stocks',
        investedAmount: 10000,
        currentValue: 12000
    },
    {
        recordDate: new Date('2023-06-01'),
        tag: 'Bonds',
        investedAmount: 5000,
        currentValue: 5500
    },
    {
        recordDate: new Date('2023-09-01'),
        tag: 'Stocks',
        investedAmount: 8000,
        currentValue: 7500
    },
    {
        recordDate: new Date('2023-12-01'),
        tag: 'Mutual Funds',
        investedAmount: 3000,
        currentValue: 3200
    }
]

describe('calculations utility functions', () => {
    describe('calculatePortfolioSummary', () => {
        it('should calculate portfolio summary correctly', () => {
            const summary = calculatePortfolioSummary(mockInvestments)

            expect(summary.totalInvested).toBe(26000)
            expect(summary.totalCurrent).toBe(28200)
            expect(summary.totalGains).toBe(2200)
            expect(summary.totalReturn).toBeCloseTo(8.46, 2)
        })

        it('should handle empty investment array', () => {
            const summary = calculatePortfolioSummary([])

            expect(summary.totalInvested).toBe(0)
            expect(summary.totalCurrent).toBe(0)
            expect(summary.totalGains).toBe(0)
            expect(summary.totalReturn).toBe(0)
        })
    })

    describe('calculateTagBreakdown', () => {
        it('should calculate tag breakdown correctly', () => {
            const breakdown = calculateTagBreakdown(mockInvestments)

            expect(breakdown).toHaveLength(3)

            const stocksBreakdown = breakdown.find(b => b.tag === 'Stocks')
            expect(stocksBreakdown).toEqual({
                tag: 'Stocks',
                invested: 18000,
                current: 19500,
                gain: 1500,
                returnPct: expect.closeTo(8.33, 2)
            })

            const bondsBreakdown = breakdown.find(b => b.tag === 'Bonds')
            expect(bondsBreakdown).toEqual({
                tag: 'Bonds',
                invested: 5000,
                current: 5500,
                gain: 500,
                returnPct: 10
            })
        })

        it('should handle empty investments array', () => {
            const breakdown = calculateTagBreakdown([])
            expect(breakdown).toHaveLength(0)
        })
    })

    describe('filterInvestmentsByTimeWindow', () => {
        it('should return all investments for timeWindow 0', () => {
            const filtered = filterInvestmentsByTimeWindow(mockInvestments, 0)
            expect(filtered).toHaveLength(4)
        })

        it('should filter investments by time window', () => {
            const referenceDate = new Date('2023-12-01')
            const filtered = filterInvestmentsByTimeWindow(mockInvestments, 180, referenceDate)

            // Should include investments from June onwards (180 days = ~6 months)
            // December 1st - 180 days = ~June 4th, so June 1st investment should be included
            const expectedInvestments = mockInvestments.filter(inv => {
                const daysDiff = (referenceDate.getTime() - inv.recordDate.getTime()) / (24 * 60 * 60 * 1000)
                return daysDiff <= 180
            })

            expect(filtered).toHaveLength(expectedInvestments.length)
            expect(filtered.every(inv =>
                (referenceDate.getTime() - inv.recordDate.getTime()) <= (180 * 24 * 60 * 60 * 1000)
            )).toBe(true)
        })

        it('should use current date as default reference', () => {
            const filtered = filterInvestmentsByTimeWindow(mockInvestments, 90)
            const now = new Date()

            expect(filtered.every(inv =>
                (now.getTime() - inv.recordDate.getTime()) <= (90 * 24 * 60 * 60 * 1000)
            )).toBe(true)
        })
    })

    describe('formatCurrency', () => {
        it('should format currency correctly', () => {
            expect(formatCurrency(1234.56, mockCurrencyConfig)).toBe('$1,234.56')
        })

        it('should handle zero amounts', () => {
            expect(formatCurrency(0, mockCurrencyConfig)).toBe('$0.00')
        })

        it('should handle negative amounts', () => {
            expect(formatCurrency(-1234.56, mockCurrencyConfig)).toBe('-$1,234.56')
        })
    })

    describe('validateInvestment', () => {
        it('should validate correct investment', () => {
            const investment = {
                recordDate: new Date(),
                tag: 'Stocks',
                investedAmount: 1000,
                currentValue: 1100
            }

            expect(validateInvestment(investment)).toBe(true)
        })

        it('should reject invalid investment data', () => {
            expect(validateInvestment({} as Investment)).toBe(false)
            expect(validateInvestment({
                recordDate: new Date(),
                tag: '',
                investedAmount: 1000,
                currentValue: 1100
            } as Investment)).toBe(false)
            expect(validateInvestment({
                recordDate: new Date(),
                tag: 'Stocks',
                investedAmount: -1000,
                currentValue: 1100
            } as Investment)).toBe(false)
        })
    })

    describe('deepClone', () => {
        it('should create deep clone of object', () => {
            const original = { a: 1, b: { c: 2, d: [3, 4] } }
            const cloned = deepClone(original)

            expect(cloned).toEqual(original)
            expect(cloned).not.toBe(original)
            expect(cloned.b).not.toBe(original.b)
            expect(cloned.b.d).not.toBe(original.b.d)
        })

        it('should handle arrays', () => {
            const original = [1, 2, { a: 3 }]
            const cloned = deepClone(original)

            expect(cloned).toEqual(original)
            expect(cloned).not.toBe(original)
            expect(cloned[2]).not.toBe(original[2])
        })

        it('should handle primitives', () => {
            expect(deepClone(42)).toBe(42)
            expect(deepClone('hello')).toBe('hello')
            expect(deepClone(null)).toBe(null)
        })
    })
})
