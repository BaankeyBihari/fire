import {addYears} from 'date-fns';

export interface Investment {
    investedAmount: number,
    currentValue: number,
    recordDate: Date,
    tag: string
}

export interface Inflation {
    inflation: number,
    recordDate: Date
}

export interface State {
    startDate: Date,
    retireDate: Date,
    startingSIP: number,
    incomeAtMaturity: number,
    currency: string,
    expectedAnnualInflation: number,
    expectedGrowthRate: number,
    sipGrowthRate: number,
    investments: Investment[],
    annualInflation: Inflation[],
    investmentPlan: Investment[],
}

const InitialState: State = {
  startDate: new Date(new Date().toDateString()),
  retireDate: addYears(new Date(new Date().toDateString()), 20),
  startingSIP: 0,
  incomeAtMaturity: 0.0,
  currency: 'INR',
  expectedAnnualInflation: 0.0,
  expectedGrowthRate: 0.0,
  sipGrowthRate: 0.0,
  investments: [],
  annualInflation: [],
  investmentPlan: [],
};

export default InitialState;
