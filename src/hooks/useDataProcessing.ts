import { useState, useMemo, useCallback } from 'react';
import { Investment, Inflation } from '../types';

export interface ProcessedData {
    portfolioValue: number[];
    contributions: number[];
    growth: number[];
    realValue: number[];
    dates: string[];
    years: number[];
}

export interface UseDataProcessingReturn {
    processedData: ProcessedData | null;
    loading: boolean;
    error: string | null;
    processData: (investments: Investment[], inflations: Inflation[], startDate: Date) => void;
    clearData: () => void;
}

export function useDataProcessing(): UseDataProcessingReturn {
    const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processData = useCallback(async (
        investments: Investment[],
        inflations: Inflation[],
        startDate: Date
        // targetAmount parameter removed as it's not used
    ) => {
        setLoading(true);
        setError(null);

        try {
            // Sort data by date
            const sortedInvestments = [...investments].sort(
                (a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
            );
            const sortedInflations = [...inflations].sort(
                (a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime()
            );

            if (sortedInvestments.length === 0) {
                throw new Error('No investment data available');
            }

            // Calculate monthly data points
            const monthlyData: ProcessedData = {
                portfolioValue: [],
                contributions: [],
                growth: [],
                realValue: [],
                dates: [],
                years: [],
            };

            const firstDate = new Date(startDate);
            const currentDate = new Date();
            let portfolioValue = 0;
            let totalContributions = 0;

            // Process data month by month
            const currentMonth = new Date(firstDate);
            let investmentIndex = 0;
            let inflationIndex = 0;

            while (currentMonth <= currentDate) {
                const monthStr = currentMonth.toISOString().substring(0, 7); // YYYY-MM format

                // Find investments for this month
                while (
                    investmentIndex < sortedInvestments.length &&
                    new Date(sortedInvestments[investmentIndex].recordDate).toISOString().substring(0, 7) <= monthStr
                ) {
                    const investment = sortedInvestments[investmentIndex];
                    totalContributions += investment.investedAmount;
                    portfolioValue += investment.investedAmount;
                    investmentIndex++;
                }

                // Apply monthly growth (approximate from annual rate)
                if (monthlyData.portfolioValue.length > 0 && portfolioValue > 0) {
                    const lastMonthValue = portfolioValue;
                    const monthlyGrowthRate = Math.pow(1 + 0.07, 1 / 12) - 1; // Assume 7% annual growth
                    portfolioValue = lastMonthValue * (1 + monthlyGrowthRate);
                }

                // Calculate inflation adjustment
                let inflationRate = 0.03; // Default 3% annual inflation
                if (inflationIndex < sortedInflations.length) {
                    const currentInflation = sortedInflations[inflationIndex];
                    if (new Date(currentInflation.recordDate).toISOString().substring(0, 7) <= monthStr) {
                        inflationRate = currentInflation.inflation / 100;
                        if (inflationIndex < sortedInflations.length - 1) {
                            inflationIndex++;
                        }
                    }
                }

                const monthsFromStart =
                    ((currentMonth.getFullYear() - firstDate.getFullYear()) * 12) +
                    (currentMonth.getMonth() - firstDate.getMonth());

                const cumulativeInflation = Math.pow(1 + inflationRate, monthsFromStart / 12);
                const realValue = portfolioValue / cumulativeInflation;

                // Store data
                monthlyData.portfolioValue.push(portfolioValue);
                monthlyData.contributions.push(totalContributions);
                monthlyData.growth.push(portfolioValue - totalContributions);
                monthlyData.realValue.push(realValue);
                monthlyData.dates.push(currentMonth.toISOString().substring(0, 7));
                monthlyData.years.push(monthsFromStart / 12);

                // Move to next month
                currentMonth.setMonth(currentMonth.getMonth() + 1);
            }

            setProcessedData(monthlyData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while processing data');
        } finally {
            setLoading(false);
        }
    }, []);

    const clearData = useCallback(() => {
        setProcessedData(null);
        setError(null);
    }, []);

    return {
        processedData,
        loading,
        error,
        processData,
        clearData,
    };
}

export interface UseDataFilteringReturn {
    filteredData: ProcessedData | null;
    timeWindow: 'all' | '1y' | '5y' | '10y';
    setTimeWindow: (window: 'all' | '1y' | '5y' | '10y') => void;
}

export function useDataFiltering(data: ProcessedData | null): UseDataFilteringReturn {
    const [timeWindow, setTimeWindow] = useState<'all' | '1y' | '5y' | '10y'>('all');

    const filteredData = useMemo(() => {
        if (!data) return null;

        if (timeWindow === 'all') return data;

        const windowYears = timeWindow === '1y' ? 1 : timeWindow === '5y' ? 5 : 10;
        const cutoffIndex = Math.max(0, data.years.length - (windowYears * 12));

        return {
            portfolioValue: data.portfolioValue.slice(cutoffIndex),
            contributions: data.contributions.slice(cutoffIndex),
            growth: data.growth.slice(cutoffIndex),
            realValue: data.realValue.slice(cutoffIndex),
            dates: data.dates.slice(cutoffIndex),
            years: data.years.slice(cutoffIndex),
        };
    }, [data, timeWindow]);

    return {
        filteredData,
        timeWindow,
        setTimeWindow,
    };
}
