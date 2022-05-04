import InitialState, {
  State,
  Investment,
  Inflation,
} from '@components/Reducer/initialState'

import ActionName, { Action } from '@components/Reducer/actions'
import { addYears, differenceInCalendarDays } from 'date-fns'

export function compareInvestment(a: Investment, b: Investment) {
  if (a.recordDate < b.recordDate) {
    return -1
  }
  if (a.recordDate > b.recordDate) {
    return 1
  }
  if (a.tag === 'Planned') {
    return 1
  }
  if (b.tag === 'Planned') {
    return -1
  }
  if (a.tag < b.tag) {
    return -1
  }
  if (a.tag > b.tag) {
    return 1
  }
  return 0
}

function compareInflation(a: Inflation, b: Inflation) {
  if (a.recordDate < b.recordDate) {
    return -1
  }
  if (a.recordDate > b.recordDate) {
    return 1
  }
  return 0
}

export class DummyInvestment implements Investment {
  investedAmount = 0
  currentValue = 0
  recordDate = new Date()
  tag = ''
}

export class DummyInflation implements Inflation {
  inflation = 0
  recordDate = new Date()
}

function getFirstDayOfNextMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  return new Date(d.toDateString())
}

function generatePlan(
  startingSIP: number,
  startDate: Date,
  incomeAtMaturity: number,
  expectedAnnualInflation: number,
  expectedGrowthRate: number,
  sipGrowthRate: number
) {
  const limitDate = addYears(startDate, 50)
  let investmentPlan: Investment[] = []
  const dailyInflation = expectedAnnualInflation / 36500
  const dailyGrowthRate = expectedGrowthRate / 36500
  const dailySIPRate = sipGrowthRate / 36500
  let currentSIP = startingSIP
  let currentInvestment = currentSIP
  let currentSIPDate = startDate
  let nextSIPDate = getFirstDayOfNextMonth(startDate)
  let currentTarget = incomeAtMaturity + startingSIP
  let currentAmount = currentSIP
  let delta = differenceInCalendarDays(nextSIPDate, currentSIPDate)
  while (
    currentAmount * delta * dailyGrowthRate < currentTarget &&
    nextSIPDate < limitDate
  ) {
    const currentInvestmentRecord = new DummyInvestment()
    currentInvestmentRecord.currentValue = currentAmount
    currentInvestmentRecord.recordDate = currentSIPDate
    currentInvestmentRecord.investedAmount = currentInvestment
    currentInvestmentRecord.tag = 'Planned'
    investmentPlan = [...investmentPlan, currentInvestmentRecord]
    currentAmount =
      currentAmount * delta * dailyGrowthRate + currentSIP + currentAmount
    currentAmount = parseFloat(currentAmount.toFixed(2))
    currentInvestment += currentSIP
    currentInvestment = parseFloat(currentInvestment.toFixed(2))
    currentSIP += startingSIP * delta * dailySIPRate
    currentSIP = parseFloat(currentSIP.toFixed(2))
    currentTarget += (incomeAtMaturity + currentSIP) * delta * dailyInflation
    currentTarget = parseFloat(currentTarget.toFixed(2))
    currentSIPDate = nextSIPDate
    nextSIPDate = getFirstDayOfNextMonth(currentSIPDate)
    delta = differenceInCalendarDays(nextSIPDate, currentSIPDate)
  }
  const currentInvestmentRecord = new DummyInvestment()
  currentInvestmentRecord.currentValue = currentAmount
  currentInvestmentRecord.recordDate = currentSIPDate
  currentInvestmentRecord.investedAmount = currentInvestment
  currentInvestmentRecord.tag = 'Planned'
  investmentPlan = [...investmentPlan, currentInvestmentRecord]
  console.log('Plan', investmentPlan)
  const retireDate = currentSIPDate
  console.log('Retire Date', retireDate)
  return { investmentPlan, retireDate }
}

export default function Reducer(state: State, action: Action) {
  let newState = { ...state }
  switch (action.actionType) {
    case ActionName.RESET: {
      newState = { ...InitialState }
      break
    }
    case ActionName.LOAD: {
      newState = { ...InitialState, ...action.payload }
      break
    }
    case ActionName.UPDATE_INFLATION: {
      newState = { ...newState, ...action.payload }
      newState.annualInflation = newState.annualInflation.map((e) => {
        e.recordDate = new Date(e.recordDate.toDateString())
        return e
      })
      newState.annualInflation.sort(compareInflation)
      break
    }
    case ActionName.UPDATE_INVESTMENTS: {
      newState = { ...newState, ...action.payload }
      newState.investments = newState.investments.map((e) => {
        e.recordDate = new Date(e.recordDate.toDateString())
        return e
      })
      newState.investments.sort(compareInvestment)
      break
    }
    case ActionName.UPDATE_PLAN: {
      const {
        startDate,
        startingSIP,
        incomeAtMaturity,
        expectedAnnualInflation,
        expectedGrowthRate,
        sipGrowthRate,
      } = action.payload
      const plan = generatePlan(
        startingSIP,
        startDate,
        incomeAtMaturity,
        expectedAnnualInflation,
        expectedGrowthRate,
        sipGrowthRate
      )
      newState = { ...newState, ...action.payload, ...plan }
      break
    }
    default: {
      return state
    }
  }
  return newState
}
