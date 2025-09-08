import Reducer, { compareInvestment } from '../reducer'
import InitialState from '../initialState'
import ActionName from '../actions'

describe('Reducer Edge Cases and Branch Coverage', () => {
    describe('compareInvestment edge cases', () => {
        test('should handle investments with different tag priorities', () => {
            const baseDate = new Date('2023-01-01')

            const investment1 = {
                investedAmount: 1000,
                currentValue: 1100,
                recordDate: baseDate,
                tag: 'ZLast'
            }

            const investment2 = {
                investedAmount: 1000,
                currentValue: 1100,
                recordDate: baseDate,
                tag: 'AFirst'
            }

            expect(compareInvestment(investment1, investment2)).toBe(1)
            expect(compareInvestment(investment2, investment1)).toBe(-1)
        })

        test('should handle one planned investment vs actual', () => {
            const baseDate = new Date('2023-01-01')

            const planned = {
                investedAmount: 1000,
                currentValue: 1100,
                recordDate: baseDate,
                tag: 'Planned'
            }

            const actual = {
                investedAmount: 1000,
                currentValue: 1100,
                recordDate: baseDate,
                tag: 'Actual'
            }

            expect(compareInvestment(planned, actual)).toBe(1)
            expect(compareInvestment(actual, planned)).toBe(-1)
        })

        test('should handle complex date and tag combinations', () => {
            const earlierDate = new Date('2023-01-01')
            const laterDate = new Date('2023-02-01')

            const investment1 = {
                investedAmount: 1000,
                currentValue: 1100,
                recordDate: laterDate,
                tag: 'Actual'
            }

            const investment2 = {
                investedAmount: 1000,
                currentValue: 1100,
                recordDate: earlierDate,
                tag: 'Planned'
            }

            // Date takes precedence over tag
            expect(compareInvestment(investment1, investment2)).toBe(1)
            expect(compareInvestment(investment2, investment1)).toBe(-1)
        })
    })

    describe('Reducer boundary conditions', () => {
        test('should handle UPDATE_PLAN with zero values', () => {
            const payload = {
                startDate: new Date('2023-01-01'),
                startingSIP: 0,
                incomeAtMaturity: 0,
                expectedAnnualInflation: 0,
                expectedGrowthRate: 0,
                sipGrowthRate: 0
            }

            const action = {
                actionType: ActionName.UPDATE_PLAN,
                payload
            }

            const result = Reducer(InitialState, action)
            expect(result.startingSIP).toBe(0)
            expect(result.incomeAtMaturity).toBe(0)
            expect(Array.isArray(result.investmentPlan)).toBe(true)
        })

        test('should handle UPDATE_PLAN with very high growth rates', () => {
            const payload = {
                startDate: new Date('2023-01-01'),
                startingSIP: 1000,
                incomeAtMaturity: 10000,
                expectedAnnualInflation: 0.50, // 50%
                expectedGrowthRate: 1.0, // 100%
                sipGrowthRate: 0.75 // 75%
            }

            const action = {
                actionType: ActionName.UPDATE_PLAN,
                payload
            }

            const result = Reducer(InitialState, action)
            expect(result.expectedGrowthRate).toBe(1.0)
            expect(result.investmentPlan).toBeDefined()
        })

        test('should handle LOAD with partial data', () => {
            const partialData = {
                startingSIP: 7500,
                currency: 'EUR'
                // Missing other fields
            }

            const action = {
                actionType: ActionName.LOAD,
                payload: partialData
            }

            const result = Reducer(InitialState, action)
            expect(result.startingSIP).toBe(7500)
            expect(result.currency).toBe('EUR')
            // Other fields should remain from initial state
            expect(result.expectedGrowthRate).toBe(InitialState.expectedGrowthRate)
        })

        test('should handle UPDATE_INVESTMENTS with mixed date formats', () => {
            const investments = [
                {
                    investedAmount: 1000,
                    currentValue: 1100,
                    recordDate: new Date('2023-01-15T10:30:00Z'), // With time
                    tag: 'WithTime'
                },
                {
                    investedAmount: 2000,
                    currentValue: 2200,
                    recordDate: new Date('2023-01-01'), // Without time
                    tag: 'WithoutTime'
                }
            ]

            const action = {
                actionType: ActionName.UPDATE_INVESTMENTS,
                payload: { investments }
            }

            const result = Reducer(InitialState, action)
            expect(result.investments).toHaveLength(2)
            // Check that dates are normalized to date strings
            result.investments.forEach(investment => {
                expect(investment.recordDate).toBeInstanceOf(Date)
            })
        })

        test('should handle UPDATE_INFLATION with unsorted dates', () => {
            const inflationData = [
                { inflation: 6.0, recordDate: new Date('2023-03-01') },
                { inflation: 5.5, recordDate: new Date('2023-01-01') },
                { inflation: 5.8, recordDate: new Date('2023-02-01') }
            ]

            const action = {
                actionType: ActionName.UPDATE_INFLATION,
                payload: { annualInflation: inflationData }
            }

            const result = Reducer(InitialState, action)
            expect(result.annualInflation).toHaveLength(3)
            // Should be sorted by date
            expect(result.annualInflation[0].inflation).toBe(5.5) // Jan
            expect(result.annualInflation[1].inflation).toBe(5.8) // Feb
            expect(result.annualInflation[2].inflation).toBe(6.0) // Mar
        })

        test('should handle state with existing data before RESET', () => {
            const modifiedState = {
                ...InitialState,
                startingSIP: 15000,
                investments: [
                    {
                        investedAmount: 5000,
                        currentValue: 5500,
                        recordDate: new Date(),
                        tag: 'Existing'
                    }
                ],
                investmentPlan: [
                    {
                        investedAmount: 1000,
                        currentValue: 1000,
                        recordDate: new Date(),
                        tag: 'Planned'
                    }
                ]
            }

            const resetAction = {
                actionType: ActionName.RESET,
                payload: {}
            }

            const result = Reducer(modifiedState, resetAction)
            expect(result).toEqual(InitialState)
            expect(result.investments).toHaveLength(0)
            expect(result.investmentPlan).toHaveLength(0)
            expect(result.startingSIP).toBe(InitialState.startingSIP)
        })

        test('should handle invalid action type', () => {
            const invalidAction = {
                actionType: 'INVALID_ACTION_TYPE',
                payload: { someData: 'test' }
            }

            const result = Reducer(InitialState, invalidAction)
            expect(result).toBe(InitialState) // Should return same reference
        })

        test('should handle null/undefined payload', () => {
            const actionWithNullPayload = {
                actionType: ActionName.LOAD,
                payload: null
            }

            const result = Reducer(InitialState, actionWithNullPayload)
            expect(result.startDate).toEqual(InitialState.startDate) // Should handle gracefully
        })

        test('should maintain immutability', () => {
            const originalState = { ...InitialState }
            const action = {
                actionType: ActionName.UPDATE_INVESTMENTS,
                payload: {
                    investments: [{
                        investedAmount: 1000,
                        currentValue: 1100,
                        recordDate: new Date(),
                        tag: 'Test'
                    }]
                }
            }

            const result = Reducer(InitialState, action)
            expect(result).not.toBe(InitialState) // Should be different reference
            expect(InitialState).toEqual(originalState) // Original should be unchanged
        })
    })

    describe('Plan generation edge cases', () => {
        test('should generate plan with minimal viable inputs', () => {
            const payload = {
                startDate: new Date('2023-01-01'),
                startingSIP: 1,
                incomeAtMaturity: 1,
                expectedAnnualInflation: 0.01,
                expectedGrowthRate: 0.02,
                sipGrowthRate: 0.01
            }

            const action = {
                actionType: ActionName.UPDATE_PLAN,
                payload
            }

            const result = Reducer(InitialState, action)
            expect(result.investmentPlan).toBeDefined()
            expect(Array.isArray(result.investmentPlan)).toBe(true)
            expect(result.retireDate).toBeInstanceOf(Date)
        })

        test('should handle plan generation with same growth and inflation rate', () => {
            const payload = {
                startDate: new Date('2023-01-01'),
                startingSIP: 1000,
                incomeAtMaturity: 10000,
                expectedAnnualInflation: 0.08,
                expectedGrowthRate: 0.08, // Same as inflation
                sipGrowthRate: 0.05
            }

            const action = {
                actionType: ActionName.UPDATE_PLAN,
                payload
            }

            const result = Reducer(InitialState, action)
            expect(result.investmentPlan).toBeDefined()
        })
    })
})
