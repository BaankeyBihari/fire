import { DummyInvestment, DummyInflation } from '../reducer'

describe('Utility Classes Tests', () => {
    describe('DummyInvestment', () => {
        test('should create instance with correct default values', () => {
            const investment = new DummyInvestment()

            expect(investment.investedAmount).toBe(0)
            expect(investment.currentValue).toBe(0)
            expect(investment.recordDate).toBeInstanceOf(Date)
            expect(investment.tag).toBe('')
            expect(typeof investment.investedAmount).toBe('number')
            expect(typeof investment.currentValue).toBe('number')
            expect(typeof investment.tag).toBe('string')
        })

        test('should allow property modification', () => {
            const investment = new DummyInvestment()
            const testDate = new Date('2023-01-01')

            investment.investedAmount = 10000
            investment.currentValue = 11000
            investment.recordDate = testDate
            investment.tag = 'TestTag'

            expect(investment.investedAmount).toBe(10000)
            expect(investment.currentValue).toBe(11000)
            expect(investment.recordDate).toBe(testDate)
            expect(investment.tag).toBe('TestTag')
        })
    })

    describe('DummyInflation', () => {
        test('should create instance with correct default values', () => {
            const inflation = new DummyInflation()

            expect(inflation.inflation).toBe(0)
            expect(inflation.recordDate).toBeInstanceOf(Date)
            expect(typeof inflation.inflation).toBe('number')
        })

        test('should allow property modification', () => {
            const inflation = new DummyInflation()
            const testDate = new Date('2023-01-01')

            inflation.inflation = 5.5
            inflation.recordDate = testDate

            expect(inflation.inflation).toBe(5.5)
            expect(inflation.recordDate).toBe(testDate)
        })
    })
})
