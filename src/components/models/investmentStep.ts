export default interface InvestmentStep {
  investedAmount: number
  currentValue: number
  recordDate: Date
  tag: string
  name: string
}

export class DummyInvestmentStep implements InvestmentStep {
  investedAmount = 0
  currentValue = 0
  recordDate = new Date()
  tag = ''
  name = ''
}
