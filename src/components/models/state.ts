import InvestmentStep from './investmentStep'
import InflationStep from './inflationStep'
import Investment from './Investment'

export default interface State {
  startDate: Date
  retireDate: Date
  startingSIP: number
  incomeAtMaturity: number
  currency: string
  expectedAnnualInflation: number
  expectedGrowthRate: number
  sipGrowthRate: number
  investmentList: Investment[]
  inflationList: InflationStep[]
  investmentPlan: InvestmentStep[]
}
