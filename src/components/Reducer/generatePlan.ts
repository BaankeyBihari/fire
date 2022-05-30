import { addYears, differenceInCalendarDays } from 'date-fns'

import Investment from '@components/models/Investment'
import getFirstDayOfNextMonth from './getFirstDayOfNextMonth'
import { DummyTransactionHistory } from '@components/models/transactionHistory'

function generatePlan(
  startingSIP: number,
  startDate: Date,
  incomeAtMaturity: number,
  expectedInflation: number,
  expectedGrowthRate: number,
  sipGrowthRate: number
) {
  const limitDate = addYears(startDate, 50)
  let investmentPlan: Investment
  investmentPlan.name = 'Plan'
  investmentPlan.tag = 'Planned'
  investmentPlan.transactionType = 'amount'
  investmentPlan.updateSource = 'others'
  investmentPlan.transactionHistory = []
  const dailyInflation = expectedInflation / 36500
  const dailyGrowthRate = expectedGrowthRate / 36500
  const dailySIPRate = sipGrowthRate / 36500
  let currentSIP = startingSIP
  let currentInvestment = currentSIP
  let currentSIPDate = startDate
  let nextSIPDate = getFirstDayOfNextMonth(startDate)
  let currentTarget = incomeAtMaturity + startingSIP
  let currentAmount = currentSIP
  let periodInDays = differenceInCalendarDays(nextSIPDate, currentSIPDate)
  let interestGenerated = currentAmount * periodInDays * dailyGrowthRate
  while (interestGenerated < currentTarget && nextSIPDate < limitDate) {
    const currentInvestmentRecord = new DummyTransactionHistory()
    currentInvestmentRecord.currentHolding = currentAmount
    currentInvestmentRecord.transactionDate = currentSIPDate
    currentInvestmentRecord.investedAmount = currentInvestment
    investmentPlan.transactionHistory = [
      ...investmentPlan.transactionHistory,
      currentInvestmentRecord,
    ]
    currentAmount = interestGenerated + currentSIP + currentAmount
    currentAmount = parseFloat(currentAmount.toFixed(2))
    currentInvestment += currentSIP
    currentInvestment = parseFloat(currentInvestment.toFixed(2))
    currentSIP += startingSIP * periodInDays * dailySIPRate
    currentSIP = parseFloat(currentSIP.toFixed(2))
    currentTarget +=
      (incomeAtMaturity + currentSIP) * periodInDays * dailyInflation
    currentTarget = parseFloat(currentTarget.toFixed(2))
    currentSIPDate = nextSIPDate
    nextSIPDate = getFirstDayOfNextMonth(currentSIPDate)
    periodInDays = differenceInCalendarDays(nextSIPDate, currentSIPDate)
    interestGenerated = currentAmount * periodInDays * dailyGrowthRate
  }
  const currentInvestmentRecord = new DummyTransactionHistory()
  currentInvestmentRecord.currentHolding = currentAmount
  currentInvestmentRecord.transactionDate = currentSIPDate
  currentInvestmentRecord.investedAmount = currentInvestment
  investmentPlan.transactionHistory = [
    ...investmentPlan.transactionHistory,
    currentInvestmentRecord,
  ]
  console.log('Plan', investmentPlan)
  const retireDate = currentSIPDate
  console.log('Retire Date', retireDate)
  return { investmentPlan, retireDate }
}

export default generatePlan
