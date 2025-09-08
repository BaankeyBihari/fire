// Core domain types
export interface Investment {
    investedAmount: number
    currentValue: number
    recordDate: Date
    tag: string
}

export interface Inflation {
    inflation: number
    recordDate: Date
}

export interface PlanParameters {
    startDate: Date
    retireDate: Date
    startingSIP: number
    incomeAtMaturity: number
    currency: string
    expectedAnnualInflation: number
    expectedGrowthRate: number
    sipGrowthRate: number
}

export interface AppState extends PlanParameters {
    investments: Investment[]
    annualInflation: Inflation[]
    investmentPlan: Investment[]
}

// UI component props
export interface TabComponentProps {
    investments: Investment[]
    investmentPlan: Investment[]
    annualInflation: Inflation[]
    onUpdatePlan?: (params: PlanParameters) => void
    onUpdateInvestments?: (investments: Investment[]) => void
    onUpdateInflation?: (inflation: Inflation[]) => void
}

export interface PlanFormData {
    targetAmount: string
    currentAge: string
    retirementAge: string
    lifeExpectancy: string
    monthlyExpense: string
    // Additional form-specific properties for validation/display
    isValid?: boolean
    errors?: Record<string, string>
}

export interface InvestmentFormData {
    investedAmount: string
    currentValue: string
    recordDate: string
    tag: string
}

export interface InflationFormData {
    inflation: string
    recordDate: string
}

// Chart and visualization types
export interface ChartDataPoint {
    date: Date
    value: number
    tag: string
}

export interface PortfolioSummary {
    totalInvested: number
    totalCurrent: number
    totalGains: number
    totalReturn: number
}

export interface TagBreakdown {
    tag: string
    invested: number
    current: number
    gain: number
    returnPct: number
}

// Time window options for filters
export type TimeWindow = 90 | 180 | 365 | 730 | 1095 | 0 // 0 = all

// Action types for reducer
export enum ActionType {
    UPDATE_PLAN = 'UPDATE_PLAN',
    UPDATE_INVESTMENTS = 'UPDATE_INVESTMENTS',
    UPDATE_INFLATION = 'UPDATE_INFLATION',
    LOAD_STATE = 'LOAD_STATE',
    RESET_STATE = 'RESET_STATE'
}

export interface Action {
    actionType: ActionType
    payload?: any
}

// Validation types
export interface ValidationError {
    field: string
    message: string
}

export interface FormValidationResult {
    isValid: boolean
    errors: ValidationError[]
}

// File import/export types
export interface ImportedData {
    investments?: Investment[]
    annualInflation?: Inflation[]
    planParameters?: PlanParameters
}

export interface ExportData extends ImportedData {
    exportDate: Date
    version: string
}

// Currency formatting options
export interface CurrencyConfig {
    currency: string
    locale: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
}

// Constants
export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'] as const
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]

export const TIME_WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
    { value: 90, label: '3m' },
    { value: 180, label: '6m' },
    { value: 365, label: '1yr' },
    { value: 730, label: '2yr' },
    { value: 1095, label: '3yr' },
    { value: 0, label: 'All' }
]

// Theme and styling types
export interface ThemeColors {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    background: string
    surface: string
    text: string
    textSecondary: string
}

export const DEFAULT_THEME: ThemeColors = {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#333333',
    textSecondary: '#666666'
}
