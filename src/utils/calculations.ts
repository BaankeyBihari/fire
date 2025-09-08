import { Investment, PortfolioSummary, TagBreakdown, TimeWindow, CurrencyConfig } from '../types'

/**
 * Calculate portfolio summary metrics
 */
export const calculatePortfolioSummary = (investments: Investment[]): PortfolioSummary => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0)
    const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
    const totalGains = totalCurrent - totalInvested
    const totalReturn = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested * 100) : 0

    return {
        totalInvested,
        totalCurrent,
        totalGains,
        totalReturn
    }
}

/**
 * Calculate breakdown by investment tags
 */
export const calculateTagBreakdown = (investments: Investment[]): TagBreakdown[] => {
    const uniqueTags = Array.from(new Set(investments.map(inv => inv.tag)))

    return uniqueTags.map(tag => {
        const tagInvestments = investments.filter(inv => inv.tag === tag)
        const invested = tagInvestments.reduce((sum, inv) => sum + inv.investedAmount, 0)
        const current = tagInvestments.reduce((sum, inv) => sum + inv.currentValue, 0)
        const gain = current - invested
        const returnPct = invested > 0 ? ((current - invested) / invested * 100) : 0

        return { tag, invested, current, gain, returnPct }
    })
}

/**
 * Filter investments by time window
 */
export const filterInvestmentsByTimeWindow = (
    investments: Investment[],
    timeWindow: TimeWindow,
    referenceDate: Date = new Date()
): Investment[] => {
    if (timeWindow === 0) return investments

    const cutoffDate = new Date(referenceDate.getTime() - (timeWindow * 24 * 60 * 60 * 1000))
    return investments.filter(inv => inv.recordDate >= cutoffDate)
}

/**
 * Get recent investments (sorted by date, most recent first)
 */
export const getRecentInvestments = (investments: Investment[], limit: number = 10): Investment[] => {
    return [...investments]
        .sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
        .slice(0, limit)
}

/**
 * Format currency value
 */
export const formatCurrency = (
    value: number,
    config: CurrencyConfig = { currency: 'INR', locale: 'en-IN' }
): string => {
    return value.toLocaleString(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: config.minimumFractionDigits ?? 0,
        maximumFractionDigits: config.maximumFractionDigits ?? 0
    })
}

/**
 * Format percentage value
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`
}

/**
 * Validate investment data
 */
export const validateInvestment = (investment: Partial<Investment>): boolean => {
    return (
        typeof investment.investedAmount === 'number' &&
        investment.investedAmount >= 0 &&
        typeof investment.currentValue === 'number' &&
        investment.currentValue >= 0 &&
        investment.recordDate instanceof Date &&
        typeof investment.tag === 'string' &&
        investment.tag.trim().length > 0
    )
}

/**
 * Generate unique investment tags from a list of investments
 */
export const getUniqueInvestmentTags = (investments: Investment[]): string[] => {
    return Array.from(new Set(investments.map(inv => inv.tag))).sort()
}

/**
 * Calculate compound growth
 */
export const calculateCompoundGrowth = (
    principal: number,
    rate: number,
    timeInYears: number
): number => {
    return principal * Math.pow(1 + (rate / 100), timeInYears)
}

/**
 * Calculate the time needed to reach a target amount
 */
export const calculateTimeToTarget = (
    currentAmount: number,
    targetAmount: number,
    monthlyContribution: number,
    annualGrowthRate: number
): number | null => {
    if (currentAmount >= targetAmount) return 0
    if (monthlyContribution <= 0 && annualGrowthRate <= 0) return null

    const monthlyRate = annualGrowthRate / 100 / 12

    if (monthlyRate === 0) {
        // Simple case: no growth, just contributions
        return (targetAmount - currentAmount) / monthlyContribution
    }

    // Use the future value of annuity formula
    const months = Math.log(
        (targetAmount * monthlyRate / monthlyContribution) + 1
    ) / Math.log(1 + monthlyRate)

    return months > 0 ? months : null
}

/**
 * Deep clone an object (for immutable updates)
 */
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
    if (obj instanceof Array) return obj.map(deepClone) as unknown as T

    const cloned = {} as T
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key])
        }
    }
    return cloned
}

/**
 * Sort investments by date
 */
export const sortInvestmentsByDate = (investments: Investment[], ascending: boolean = true): Investment[] => {
    return [...investments].sort((a, b) => {
        const timeA = a.recordDate.getTime()
        const timeB = b.recordDate.getTime()
        return ascending ? timeA - timeB : timeB - timeA
    })
}

/**
 * Get date range from investments
 */
export const getDateRange = (investments: Investment[]): { earliest: Date; latest: Date } | null => {
    if (investments.length === 0) return null

    const dates = investments.map(inv => inv.recordDate.getTime())
    return {
        earliest: new Date(Math.min(...dates)),
        latest: new Date(Math.max(...dates))
    }
}
