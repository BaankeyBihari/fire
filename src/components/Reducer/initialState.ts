import { addYears } from 'date-fns'

import State from '@components/models/state'

const InitialState: State = {
  startDate: new Date(new Date().toDateString()),
  retireDate: addYears(new Date(new Date().toDateString()), 20),
  startingSIP: 0,
  incomeAtMaturity: 0.0,
  currency: 'INR',
  expectedAnnualInflation: 0.0,
  expectedGrowthRate: 0.0,
  sipGrowthRate: 0.0,
  investmentList: [],
  inflationList: [],
  investmentPlan: [],
}

export default InitialState
