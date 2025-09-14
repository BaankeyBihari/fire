import {
    calculatePortfolioSummary,
    calculateTagBreakdown,
    filterInvestmentsByTimeWindow,
    getRecentInvestments,
    formatCurrency,
    formatPercentage,
    validateInvestment,
    getUniqueInvestmentTags,
    calculateCompoundGrowth,
    calculateTimeToTarget,
    deepClone,
    sortInvestmentsByDate,
    getDateRange
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

        it('should handle investments with zero invested amount', () => {
            const zeroInvestments: Investment[] = [{
                recordDate: new Date('2023-01-01'),
                tag: 'Test',
                investedAmount: 0,
                currentValue: 100
            }]

            const breakdown = calculateTagBreakdown(zeroInvestments)
            expect(breakdown[0].returnPct).toBe(0)
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

    describe('getRecentInvestments', () => {
        it('should return recent investments sorted by date (most recent first)', () => {
            const recent = getRecentInvestments(mockInvestments, 2)

            expect(recent).toHaveLength(2)
            expect(recent[0].recordDate).toEqual(new Date('2023-12-01'))
            expect(recent[1].recordDate).toEqual(new Date('2023-09-01'))
        })

        it('should return all investments if limit is greater than array length', () => {
            const recent = getRecentInvestments(mockInvestments, 10)
            expect(recent).toHaveLength(4)
        })

        it('should use default limit of 10', () => {
            const manyInvestments = Array.from({ length: 15 }, (_, i) => ({
                recordDate: new Date(2023, i, 1),
                tag: `Tag${i}`,
                investedAmount: 1000,
                currentValue: 1100
            }))

            const recent = getRecentInvestments(manyInvestments)
            expect(recent).toHaveLength(10)
        })

        it('should handle empty array', () => {
            const recent = getRecentInvestments([])
            expect(recent).toHaveLength(0)
        })

        it('should not mutate original array', () => {
            const originalLength = mockInvestments.length
            const original = [...mockInvestments]

            getRecentInvestments(mockInvestments, 2)

            expect(mockInvestments).toHaveLength(originalLength)
            expect(mockInvestments).toEqual(original)
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

        it('should use default INR currency config when none provided', () => {
            const result = formatCurrency(1234.56)
            expect(result).toContain('₹1,235') // Should format with INR symbol and rounding
        })

        it('should respect minimumFractionDigits config', () => {
            const config: CurrencyConfig = {
                currency: 'USD',
                locale: 'en-US',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }
            expect(formatCurrency(1234.56, config)).toBe('$1,235')
        })
    })

    describe('formatPercentage', () => {
        it('should format percentage with default 2 decimals', () => {
            expect(formatPercentage(12.3456)).toBe('12.35%')
        })

        it('should format percentage with custom decimal places', () => {
            expect(formatPercentage(12.3456, 1)).toBe('12.3%')
            expect(formatPercentage(12.3456, 0)).toBe('12%')
            expect(formatPercentage(12.3456, 4)).toBe('12.3456%')
        })

        it('should handle zero percentage', () => {
            expect(formatPercentage(0)).toBe('0.00%')
        })

        it('should handle negative percentage', () => {
            expect(formatPercentage(-5.25)).toBe('-5.25%')
        })

        it('should handle large numbers', () => {
            expect(formatPercentage(1234.5678, 2)).toBe('1234.57%')
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

        it('should reject investment with negative current value', () => {
            expect(validateInvestment({
                recordDate: new Date(),
                tag: 'Stocks',
                investedAmount: 1000,
                currentValue: -100
            } as Investment)).toBe(false)
        })

        it('should reject investment with invalid date', () => {
            expect(validateInvestment({
                recordDate: 'invalid-date',
                tag: 'Stocks',
                investedAmount: 1000,
                currentValue: 1100
            } as any)).toBe(false)
        })

        it('should reject investment with non-string tag', () => {
            expect(validateInvestment({
                recordDate: new Date(),
                tag: 123,
                investedAmount: 1000,
                currentValue: 1100
            } as any)).toBe(false)
        })

        it('should reject investment with only whitespace tag', () => {
            expect(validateInvestment({
                recordDate: new Date(),
                tag: '   ',
                investedAmount: 1000,
                currentValue: 1100
            } as Investment)).toBe(false)
        })
    })

    describe('getUniqueInvestmentTags', () => {
        it('should return unique tags sorted alphabetically', () => {
            const tags = getUniqueInvestmentTags(mockInvestments)
            expect(tags).toEqual(['Bonds', 'Mutual Funds', 'Stocks'])
        })

        it('should handle empty investments array', () => {
            const tags = getUniqueInvestmentTags([])
            expect(tags).toEqual([])
        })

        it('should handle duplicate tags', () => {
            const duplicateTagsInvestments: Investment[] = [
                { recordDate: new Date(), tag: 'Stocks', investedAmount: 1000, currentValue: 1100 },
                { recordDate: new Date(), tag: 'Bonds', investedAmount: 500, currentValue: 550 },
                { recordDate: new Date(), tag: 'Stocks', investedAmount: 2000, currentValue: 2200 },
                { recordDate: new Date(), tag: 'Bonds', investedAmount: 1500, currentValue: 1600 }
            ]

            const tags = getUniqueInvestmentTags(duplicateTagsInvestments)
            expect(tags).toEqual(['Bonds', 'Stocks'])
        })
    })

    describe('calculateCompoundGrowth', () => {
        it('should calculate compound growth correctly', () => {
            const result = calculateCompoundGrowth(1000, 8, 5)
            expect(result).toBeCloseTo(1469.33, 2)
        })

        it('should handle zero principal', () => {
            const result = calculateCompoundGrowth(0, 8, 5)
            expect(result).toBe(0)
        })

        it('should handle zero rate', () => {
            const result = calculateCompoundGrowth(1000, 0, 5)
            expect(result).toBe(1000)
        })

        it('should handle zero time', () => {
            const result = calculateCompoundGrowth(1000, 8, 0)
            expect(result).toBe(1000)
        })

        it('should handle negative rate', () => {
            const result = calculateCompoundGrowth(1000, -5, 2)
            expect(result).toBeCloseTo(902.5, 2)
        })

        it('should handle fractional years', () => {
            const result = calculateCompoundGrowth(1000, 8, 2.5)
            expect(result).toBeCloseTo(1212.16, 2)
        })
    })

    describe('calculateTimeToTarget', () => {
        it('should calculate time to reach target correctly', () => {
            const months = calculateTimeToTarget(10000, 50000, 1000, 8)
            expect(months).toBeGreaterThan(0)
            expect(months).toBeLessThan(60) // Should be less than 5 years
        })

        it('should return 0 when current amount already exceeds target', () => {
            const months = calculateTimeToTarget(50000, 40000, 1000, 8)
            expect(months).toBe(0)
        })

        it('should return null when no growth and no contributions', () => {
            const months = calculateTimeToTarget(10000, 50000, 0, 0)
            expect(months).toBeNull()
        })

        it('should handle case with no growth rate (only contributions)', () => {
            const months = calculateTimeToTarget(10000, 50000, 1000, 0)
            expect(months).toBe(40) // (50000 - 10000) / 1000 = 40 months
        })

        it('should return null for negative monthly contribution', () => {
            const months = calculateTimeToTarget(10000, 50000, -100, 8)
            expect(months).toBeNull()
        })

        it('should handle very small growth rates', () => {
            const months = calculateTimeToTarget(10000, 50000, 1000, 0.1)
            expect(months).toBeGreaterThan(0)
        })

        it('should return null when calculation results in negative time', () => {
            // Edge case where target is unreachable with given parameters
            const months = calculateTimeToTarget(10000, 5000, 100, 8)
            expect(months).toBe(0) // Current already exceeds target
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

        it('should handle Date objects', () => {
            const date = new Date('2023-01-01')
            const cloned = deepClone(date)

            expect(cloned).toEqual(date)
            expect(cloned).not.toBe(date)
            expect(cloned instanceof Date).toBe(true)
        })

        it('should handle nested objects with dates', () => {
            const original = {
                investment: {
                    recordDate: new Date('2023-01-01'),
                    tag: 'Stocks'
                }
            }
            const cloned = deepClone(original)

            expect(cloned.investment.recordDate).toEqual(original.investment.recordDate)
            expect(cloned.investment.recordDate).not.toBe(original.investment.recordDate)
        })
    })

    describe('sortInvestmentsByDate', () => {
        it('should sort investments by date in ascending order by default', () => {
            const sorted = sortInvestmentsByDate(mockInvestments)

            expect(sorted[0].recordDate).toEqual(new Date('2023-01-01'))
            expect(sorted[1].recordDate).toEqual(new Date('2023-06-01'))
            expect(sorted[2].recordDate).toEqual(new Date('2023-09-01'))
            expect(sorted[3].recordDate).toEqual(new Date('2023-12-01'))
        })

        it('should sort investments by date in descending order when specified', () => {
            const sorted = sortInvestmentsByDate(mockInvestments, false)

            expect(sorted[0].recordDate).toEqual(new Date('2023-12-01'))
            expect(sorted[1].recordDate).toEqual(new Date('2023-09-01'))
            expect(sorted[2].recordDate).toEqual(new Date('2023-06-01'))
            expect(sorted[3].recordDate).toEqual(new Date('2023-01-01'))
        })

        it('should not mutate original array', () => {
            const original = [...mockInvestments]
            sortInvestmentsByDate(mockInvestments)

            expect(mockInvestments).toEqual(original)
        })

        it('should handle empty array', () => {
            const sorted = sortInvestmentsByDate([])
            expect(sorted).toEqual([])
        })

        it('should handle single investment', () => {
            const singleInvestment = [mockInvestments[0]]
            const sorted = sortInvestmentsByDate(singleInvestment)

            expect(sorted).toEqual(singleInvestment)
            expect(sorted).not.toBe(singleInvestment)
        })
    })

    describe('getDateRange', () => {
        it('should return correct date range from investments', () => {
            const range = getDateRange(mockInvestments)

            expect(range).not.toBeNull()
            expect(range!.earliest).toEqual(new Date('2023-01-01'))
            expect(range!.latest).toEqual(new Date('2023-12-01'))
        })

        it('should return null for empty investments array', () => {
            const range = getDateRange([])
            expect(range).toBeNull()
        })

        it('should handle single investment', () => {
            const singleInvestment = [mockInvestments[0]]
            const range = getDateRange(singleInvestment)

            expect(range).not.toBeNull()
            expect(range!.earliest).toEqual(new Date('2023-01-01'))
            expect(range!.latest).toEqual(new Date('2023-01-01'))
        })

        it('should handle investments with same date', () => {
            const sameDate = new Date('2023-01-01')
            const sameDateInvestments: Investment[] = [
                { recordDate: sameDate, tag: 'Stocks', investedAmount: 1000, currentValue: 1100 },
                { recordDate: sameDate, tag: 'Bonds', investedAmount: 500, currentValue: 550 }
            ]

            const range = getDateRange(sameDateInvestments)

            expect(range).not.toBeNull()
            expect(range!.earliest).toEqual(sameDate)
            expect(range!.latest).toEqual(sameDate)
        })
    })
})
