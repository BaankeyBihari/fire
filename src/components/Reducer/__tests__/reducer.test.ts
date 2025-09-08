import Reducer, {
    compareInvestment,
    DummyInvestment,
    DummyInflation
} from '../reducer'
import InitialState from '../initialState'
import ActionName from '../actions'

describe('Reducer Utility Functions', () => {
    describe('compareInvestment', () => {
        const baseDate = new Date('2023-01-01')
        const laterDate = new Date('2023-02-01')

        test('should sort by recordDate ascending', () => {
            const investment1 = new DummyInvestment()
            investment1.recordDate = laterDate
            investment1.tag = 'Actual'

            const investment2 = new DummyInvestment()
            investment2.recordDate = baseDate
            investment2.tag = 'Actual'

            expect(compareInvestment(investment1, investment2)).toBe(1)
            expect(compareInvestment(investment2, investment1)).toBe(-1)
        })

        test('should prioritize "Actual" over "Planned" when dates are same', () => {
            const investment1 = new DummyInvestment()
            investment1.recordDate = baseDate
            investment1.tag = 'Planned'

            const investment2 = new DummyInvestment()
            investment2.recordDate = baseDate
            investment2.tag = 'Actual'

            expect(compareInvestment(investment1, investment2)).toBe(1)
            expect(compareInvestment(investment2, investment1)).toBe(-1)
        })

        test('should sort by tag alphabetically when dates are same and neither is Planned', () => {
            const investment1 = new DummyInvestment()
            investment1.recordDate = baseDate
            investment1.tag = 'ZTag'

            const investment2 = new DummyInvestment()
            investment2.recordDate = baseDate
            investment2.tag = 'ATag'

            expect(compareInvestment(investment1, investment2)).toBe(1)
            expect(compareInvestment(investment2, investment1)).toBe(-1)
        })

        test('should return 0 for identical investments', () => {
            const investment1 = new DummyInvestment()
            investment1.recordDate = baseDate
            investment1.tag = 'Same'

            const investment2 = new DummyInvestment()
            investment2.recordDate = baseDate
            investment2.tag = 'Same'

            expect(compareInvestment(investment1, investment2)).toBe(0)
        })
    })

    describe('DummyInvestment', () => {
        test('should create investment with default values', () => {
            const investment = new DummyInvestment()

            expect(investment.investedAmount).toBe(0)
            expect(investment.currentValue).toBe(0)
            expect(investment.recordDate).toBeInstanceOf(Date)
            expect(investment.tag).toBe('')
        })
    })

    describe('DummyInflation', () => {
        test('should create inflation with default values', () => {
            const inflation = new DummyInflation()

            expect(inflation.inflation).toBe(0)
            expect(inflation.recordDate).toBeInstanceOf(Date)
        })
    })
})

describe('Reducer Function', () => {
    describe('RESET action', () => {
        test('should reset state to initial state', () => {
            const modifiedState = {
                ...InitialState,
                startingSIP: 5000,
                currency: 'USD',
                investments: [new DummyInvestment()]
            }

            const action = {
                actionType: ActionName.RESET,
                payload: {}
            }

            const result = Reducer(modifiedState, action)
            expect(result).toEqual(InitialState)
        })
    })

    describe('LOAD action', () => {
        test('should load payload data over initial state', () => {
            const payload = {
                startingSIP: 10000,
                currency: 'USD',
                expectedGrowthRate: 0.12
            }

            const action = {
                actionType: ActionName.LOAD,
                payload
            }

            const result = Reducer(InitialState, action)
            expect(result.startingSIP).toBe(10000)
            expect(result.currency).toBe('USD')
            expect(result.expectedGrowthRate).toBe(0.12)
            // Other properties should remain from initial state
            expect(result.startDate).toBe(InitialState.startDate)
        })
    })

    describe('UPDATE_INFLATION action', () => {
        test('should update and sort inflation data', () => {
            const date1 = new Date('2023-01-01')
            const date2 = new Date('2023-02-01')

            const inflationData = [
                { inflation: 5.5, recordDate: date2 },
                { inflation: 4.2, recordDate: date1 }
            ]

            const action = {
                actionType: ActionName.UPDATE_INFLATION,
                payload: {
                    annualInflation: inflationData
                }
            }

            const result = Reducer(InitialState, action)
            expect(result.annualInflation).toHaveLength(2)
            // Should be sorted by date ascending
            expect(result.annualInflation[0].recordDate).toEqual(new Date(date1.toDateString()))
            expect(result.annualInflation[1].recordDate).toEqual(new Date(date2.toDateString()))
        })
    })

    describe('UPDATE_INVESTMENTS action', () => {
        test('should update and sort investment data', () => {
            const date1 = new Date('2023-01-01')
            const date2 = new Date('2023-02-01')

            const investmentData = [
                {
                    investedAmount: 10000,
                    currentValue: 11000,
                    recordDate: date2,
                    tag: 'Actual'
                },
                {
                    investedAmount: 5000,
                    currentValue: 5200,
                    recordDate: date1,
                    tag: 'Actual'
                }
            ]

            const action = {
                actionType: ActionName.UPDATE_INVESTMENTS,
                payload: {
                    investments: investmentData
                }
            }

            const result = Reducer(InitialState, action)
            expect(result.investments).toHaveLength(2)
            // Should be sorted by date ascending
            expect(result.investments[0].recordDate).toEqual(new Date(date1.toDateString()))
            expect(result.investments[1].recordDate).toEqual(new Date(date2.toDateString()))
        })
    })

    describe('UPDATE_PLAN action', () => {
        test('should generate investment plan and update state', () => {
            const payload = {
                startDate: new Date('2023-01-01'),
                startingSIP: 5000,
                incomeAtMaturity: 50000,
                expectedAnnualInflation: 0.06,
                expectedGrowthRate: 0.12,
                sipGrowthRate: 0.10
            }

            const action = {
                actionType: ActionName.UPDATE_PLAN,
                payload
            }

            const result = Reducer(InitialState, action)

            // Should update basic fields
            expect(result.startDate).toEqual(payload.startDate)
            expect(result.startingSIP).toBe(payload.startingSIP)
            expect(result.incomeAtMaturity).toBe(payload.incomeAtMaturity)

            // Should generate investment plan
            expect(result.investmentPlan).toBeDefined()
            expect(Array.isArray(result.investmentPlan)).toBe(true)
            expect(result.retireDate).toBeDefined()

            // All plan items should have 'Planned' tag
            result.investmentPlan.forEach(investment => {
                expect(investment.tag).toBe('Planned')
            })
        })

        test('should handle plan generation with minimal SIP', () => {
            const payload = {
                startDate: new Date('2023-01-01'),
                startingSIP: 100,
                incomeAtMaturity: 1000,
                expectedAnnualInflation: 0.05,
                expectedGrowthRate: 0.15,
                sipGrowthRate: 0.05
            }

            const action = {
                actionType: ActionName.UPDATE_PLAN,
                payload
            }

            const result = Reducer(InitialState, action)
            expect(result.investmentPlan.length).toBeGreaterThan(0)
            expect(result.retireDate).toBeInstanceOf(Date)
        })
    })

    describe('Default case', () => {
        test('should return original state for unknown action', () => {
            const unknownAction = {
                actionType: 'UNKNOWN_ACTION',
                payload: { someData: 'test' }
            }

            const result = Reducer(InitialState, unknownAction)
            expect(result).toBe(InitialState)
        })
    })
})
