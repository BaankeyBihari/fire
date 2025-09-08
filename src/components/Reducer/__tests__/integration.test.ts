import Reducer from '../reducer'
import InitialState from '../initialState'
import ActionName from '../actions'

describe('Investment Plan Calculation Tests', () => {
    describe('Plan Generation Integration Tests', () => {
        test('should generate realistic investment plan for retirement', () => {
            const payload = {
                startDate: new Date('2023-01-01'),
                startingSIP: 10000, // 10K monthly
                incomeAtMaturity: 100000, // 1 lakh monthly income needed
                expectedAnnualInflation: 0.06, // 6% inflation
                expectedGrowthRate: 0.12, // 12% growth
                sipGrowthRate: 0.08 // 8% SIP growth annually
            }

            const action = {
                actionType: ActionName.UPDATE_PLAN,
                payload
            }

            const result = Reducer(InitialState, action)

            // Verify plan is generated
            expect(result.investmentPlan.length).toBeGreaterThan(0)
            expect(result.retireDate).toBeDefined()
            expect(result.retireDate).toBeInstanceOf(Date)

            // Check that investment amounts are increasing over time
            const firstInvestment = result.investmentPlan[0]
            const lastInvestment = result.investmentPlan[result.investmentPlan.length - 1]

            expect(firstInvestment.investedAmount).toBeLessThan(lastInvestment.investedAmount)
            expect(firstInvestment.currentValue).toBeLessThan(lastInvestment.currentValue)

            // All investments should be tagged as 'Planned'
            result.investmentPlan.forEach(investment => {
                expect(investment.tag).toBe('Planned')
                expect(investment.investedAmount).toBeGreaterThanOrEqual(0)
                expect(investment.currentValue).toBeGreaterThanOrEqual(0)
            })
        })

        test('should handle edge case with high income requirement', () => {
            const payload = {
                startDate: new Date('2023-01-01'),
                startingSIP: 1000,
                incomeAtMaturity: 500000, // Very high income requirement
                expectedAnnualInflation: 0.08,
                expectedGrowthRate: 0.15,
                sipGrowthRate: 0.12
            }

            const action = {
                actionType: ActionName.UPDATE_PLAN,
                payload
            }

            const result = Reducer(InitialState, action)

            // Should still generate a plan (might be very long)
            expect(result.investmentPlan.length).toBeGreaterThan(0)
            expect(result.retireDate).toBeDefined()
        })
    })

    describe('Investment Sorting and Management', () => {
        test('should correctly sort mixed actual and planned investments', () => {
            const baseDate = new Date('2023-01-01')
            const laterDate = new Date('2023-02-01')

            const investments = [
                {
                    investedAmount: 15000,
                    currentValue: 16000,
                    recordDate: laterDate,
                    tag: 'Planned'
                },
                {
                    investedAmount: 10000,
                    currentValue: 11000,
                    recordDate: baseDate,
                    tag: 'Actual'
                },
                {
                    investedAmount: 12000,
                    currentValue: 12500,
                    recordDate: baseDate,
                    tag: 'Planned'
                }
            ]

            const action = {
                actionType: ActionName.UPDATE_INVESTMENTS,
                payload: { investments }
            }

            const result = Reducer(InitialState, action)

            // Should be sorted by date first, then prioritize Actual over Planned
            expect(result.investments[0].tag).toBe('Actual')
            expect(result.investments[0].recordDate).toEqual(new Date(baseDate.toDateString()))
            expect(result.investments[1].tag).toBe('Planned')
            expect(result.investments[1].recordDate).toEqual(new Date(baseDate.toDateString()))
            expect(result.investments[2].recordDate).toEqual(new Date(laterDate.toDateString()))
        })
    })

    describe('State Management Edge Cases', () => {
        test('should handle multiple consecutive plan updates', () => {
            let currentState = InitialState

            // First plan update
            const firstUpdate = {
                actionType: ActionName.UPDATE_PLAN,
                payload: {
                    startDate: new Date('2023-01-01'),
                    startingSIP: 5000,
                    incomeAtMaturity: 50000,
                    expectedAnnualInflation: 0.06,
                    expectedGrowthRate: 0.12,
                    sipGrowthRate: 0.08
                }
            }

            currentState = Reducer(currentState, firstUpdate)
            // First plan created successfully

            // Second plan update with different parameters
            const secondUpdate = {
                actionType: ActionName.UPDATE_PLAN,
                payload: {
                    startDate: new Date('2023-01-01'),
                    startingSIP: 10000, // Double the SIP
                    incomeAtMaturity: 50000,
                    expectedAnnualInflation: 0.06,
                    expectedGrowthRate: 0.15, // Higher growth rate
                    sipGrowthRate: 0.08
                }
            }

            currentState = Reducer(currentState, secondUpdate)
            // Second plan created with different parameters

            // Second plan should be different from first (could be same length but different values)
            expect(currentState.startingSIP).toBe(10000)
            expect(currentState.expectedGrowthRate).toBe(0.15)
        })

        test('should handle RESET action correctly after modifications', () => {
            let currentState = InitialState

            // Make several modifications
            currentState = Reducer(currentState, {
                actionType: ActionName.UPDATE_PLAN,
                payload: {
                    startDate: new Date('2023-01-01'),
                    startingSIP: 15000,
                    incomeAtMaturity: 75000,
                    expectedAnnualInflation: 0.07,
                    expectedGrowthRate: 0.14,
                    sipGrowthRate: 0.09
                }
            })

            currentState = Reducer(currentState, {
                actionType: ActionName.UPDATE_INVESTMENTS,
                payload: {
                    investments: [
                        {
                            investedAmount: 25000,
                            currentValue: 27000,
                            recordDate: new Date(),
                            tag: 'Actual'
                        }
                    ]
                }
            })

            // Verify state has been modified
            expect(currentState.startingSIP).toBe(15000)
            expect(currentState.investments.length).toBe(1)
            expect(currentState.investmentPlan.length).toBeGreaterThan(0)

            // Reset state
            const resetState = Reducer(currentState, {
                actionType: ActionName.RESET,
                payload: {}
            })

            // Should be exactly like initial state
            expect(resetState).toEqual(InitialState)
        })
    })

    describe('Data Validation and Consistency', () => {
        test('should maintain date consistency across operations', () => {
            const testDate = new Date('2023-06-15T10:30:00Z')

            const action = {
                actionType: ActionName.UPDATE_INVESTMENTS,
                payload: {
                    investments: [{
                        investedAmount: 5000,
                        currentValue: 5200,
                        recordDate: testDate,
                        tag: 'Test'
                    }]
                }
            }

            const result = Reducer(InitialState, action)

            // Date should be normalized to date string format
            expect(result.investments[0].recordDate).toEqual(new Date(testDate.toDateString()))
        })

        test('should handle empty investment arrays', () => {
            const action = {
                actionType: ActionName.UPDATE_INVESTMENTS,
                payload: { investments: [] }
            }

            const result = Reducer(InitialState, action)
            expect(result.investments).toEqual([])
        })

        test('should handle empty inflation arrays', () => {
            const action = {
                actionType: ActionName.UPDATE_INFLATION,
                payload: { annualInflation: [] }
            }

            const result = Reducer(InitialState, action)
            expect(result.annualInflation).toEqual([])
        })
    })
})
