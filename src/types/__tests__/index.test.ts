import {
    Investment,
    Inflation,
    PlanParameters,
    PlanFormData,
    InvestmentFormData,
    InflationFormData,
    PortfolioSummary,
    TagBreakdown,
    TimeWindow,
    ActionType,
    Action,
    ValidationError,
    FormValidationResult,
    ImportedData,
    ExportData,
    CurrencyConfig,
    SUPPORTED_CURRENCIES,
    SupportedCurrency,
    TIME_WINDOW_OPTIONS,
    ThemeColors,
    DEFAULT_THEME
} from '../index'

describe('Types and Constants', () => {
    describe('ActionType enum', () => {
        it('should have all required action types', () => {
            expect(ActionType.UPDATE_PLAN).toBe('UPDATE_PLAN')
            expect(ActionType.UPDATE_INVESTMENTS).toBe('UPDATE_INVESTMENTS')
            expect(ActionType.UPDATE_INFLATION).toBe('UPDATE_INFLATION')
            expect(ActionType.LOAD_STATE).toBe('LOAD_STATE')
            expect(ActionType.RESET_STATE).toBe('RESET_STATE')
        })

        it('should have exactly 5 action types', () => {
            const actionTypeKeys = Object.keys(ActionType)
            expect(actionTypeKeys).toHaveLength(5)
        })

        it('should have string values for all action types', () => {
            Object.values(ActionType).forEach(value => {
                expect(typeof value).toBe('string')
            })
        })
    })

    describe('SUPPORTED_CURRENCIES constant', () => {
        it('should contain expected currencies', () => {
            expect(SUPPORTED_CURRENCIES).toEqual(['INR', 'USD', 'EUR', 'GBP'])
        })

        it('should be readonly array', () => {
            expect(Array.isArray(SUPPORTED_CURRENCIES)).toBe(true)
            expect(SUPPORTED_CURRENCIES).toHaveLength(4)
        })

        it('should contain only string values', () => {
            SUPPORTED_CURRENCIES.forEach(currency => {
                expect(typeof currency).toBe('string')
                expect(currency).toHaveLength(3) // All currency codes are 3 characters
            })
        })

        it('should be in expected order', () => {
            expect(SUPPORTED_CURRENCIES[0]).toBe('INR')
            expect(SUPPORTED_CURRENCIES[1]).toBe('USD')
            expect(SUPPORTED_CURRENCIES[2]).toBe('EUR')
            expect(SUPPORTED_CURRENCIES[3]).toBe('GBP')
        })
    })

    describe('TIME_WINDOW_OPTIONS constant', () => {
        it('should contain all expected time window options', () => {
            expect(TIME_WINDOW_OPTIONS).toHaveLength(6)

            const expectedOptions = [
                { value: 90, label: '3m' },
                { value: 180, label: '6m' },
                { value: 365, label: '1yr' },
                { value: 730, label: '2yr' },
                { value: 1095, label: '3yr' },
                { value: 0, label: 'All' }
            ]

            expect(TIME_WINDOW_OPTIONS).toEqual(expectedOptions)
        })

        it('should have proper structure for each option', () => {
            TIME_WINDOW_OPTIONS.forEach(option => {
                expect(option).toHaveProperty('value')
                expect(option).toHaveProperty('label')
                expect(typeof option.value).toBe('number')
                expect(typeof option.label).toBe('string')
            })
        })

        it('should have valid time window values', () => {
            const validTimeWindows: TimeWindow[] = [90, 180, 365, 730, 1095, 0]
            TIME_WINDOW_OPTIONS.forEach(option => {
                expect(validTimeWindows).toContain(option.value as TimeWindow)
            })
        })

        it('should be sorted by value (ascending, with 0 at end)', () => {
            const values = TIME_WINDOW_OPTIONS.map(option => option.value)
            const nonZeroValues = values.filter(v => v !== 0)
            const sortedNonZero = [...nonZeroValues].sort((a, b) => a - b)

            expect(nonZeroValues).toEqual(sortedNonZero)
            expect(values[values.length - 1]).toBe(0) // 'All' should be last
        })
    })

    describe('DEFAULT_THEME constant', () => {
        it('should have all required theme color properties', () => {
            const requiredProperties = [
                'primary', 'secondary', 'success', 'warning', 'error',
                'background', 'surface', 'text', 'textSecondary'
            ]

            requiredProperties.forEach(property => {
                expect(DEFAULT_THEME).toHaveProperty(property)
                expect(typeof DEFAULT_THEME[property as keyof ThemeColors]).toBe('string')
            })
        })

        it('should have valid hex color values', () => {
            const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

            Object.values(DEFAULT_THEME).forEach(color => {
                expect(color).toMatch(hexColorRegex)
            })
        })

        it('should have expected default colors', () => {
            expect(DEFAULT_THEME.primary).toBe('#1976d2')
            expect(DEFAULT_THEME.secondary).toBe('#dc004e')
            expect(DEFAULT_THEME.success).toBe('#2e7d32')
            expect(DEFAULT_THEME.warning).toBe('#ed6c02')
            expect(DEFAULT_THEME.error).toBe('#d32f2f')
            expect(DEFAULT_THEME.background).toBe('#ffffff')
            expect(DEFAULT_THEME.surface).toBe('#f5f5f5')
            expect(DEFAULT_THEME.text).toBe('#333333')
            expect(DEFAULT_THEME.textSecondary).toBe('#666666')
        })

        it('should have exactly 9 color properties', () => {
            const colorKeys = Object.keys(DEFAULT_THEME)
            expect(colorKeys).toHaveLength(9)
        })
    })

    describe('Type compatibility and structure', () => {
        it('should create valid Investment objects', () => {
            const investment: Investment = {
                investedAmount: 1000,
                currentValue: 1100,
                recordDate: new Date('2023-01-01'),
                tag: 'Stocks'
            }

            expect(investment.investedAmount).toBe(1000)
            expect(investment.currentValue).toBe(1100)
            expect(investment.recordDate).toBeInstanceOf(Date)
            expect(investment.tag).toBe('Stocks')
        })

        it('should create valid Inflation objects', () => {
            const inflation: Inflation = {
                inflation: 3.5,
                recordDate: new Date('2023-01-01')
            }

            expect(inflation.inflation).toBe(3.5)
            expect(inflation.recordDate).toBeInstanceOf(Date)
        })

        it('should create valid PlanParameters objects', () => {
            const planParams: PlanParameters = {
                startDate: new Date('2023-01-01'),
                retireDate: new Date('2050-01-01'),
                startingSIP: 5000,
                incomeAtMaturity: 60000,
                currency: 'USD',
                expectedAnnualInflation: 3,
                expectedGrowthRate: 8,
                sipGrowthRate: 5
            }

            expect(planParams.startDate).toBeInstanceOf(Date)
            expect(planParams.retireDate).toBeInstanceOf(Date)
            expect(planParams.startingSIP).toBe(5000)
            expect(planParams.incomeAtMaturity).toBe(60000)
            expect(planParams.currency).toBe('USD')
            expect(planParams.expectedAnnualInflation).toBe(3)
            expect(planParams.expectedGrowthRate).toBe(8)
            expect(planParams.sipGrowthRate).toBe(5)
        })

        it('should create valid PortfolioSummary objects', () => {
            const summary: PortfolioSummary = {
                totalInvested: 10000,
                totalCurrent: 11000,
                totalGains: 1000,
                totalReturn: 10
            }

            expect(summary.totalInvested).toBe(10000)
            expect(summary.totalCurrent).toBe(11000)
            expect(summary.totalGains).toBe(1000)
            expect(summary.totalReturn).toBe(10)
        })

        it('should create valid TagBreakdown objects', () => {
            const breakdown: TagBreakdown = {
                tag: 'Stocks',
                invested: 5000,
                current: 5500,
                gain: 500,
                returnPct: 10
            }

            expect(breakdown.tag).toBe('Stocks')
            expect(breakdown.invested).toBe(5000)
            expect(breakdown.current).toBe(5500)
            expect(breakdown.gain).toBe(500)
            expect(breakdown.returnPct).toBe(10)
        })

        it('should create valid Action objects', () => {
            const action1: Action = {
                actionType: ActionType.UPDATE_PLAN,
                payload: { startingSIP: 5000 }
            }

            const action2: Action = {
                actionType: ActionType.RESET_STATE
            }

            expect(action1.actionType).toBe(ActionType.UPDATE_PLAN)
            expect(action1.payload).toEqual({ startingSIP: 5000 })

            expect(action2.actionType).toBe(ActionType.RESET_STATE)
            expect(action2.payload).toBeUndefined()
        })

        it('should create valid ValidationError objects', () => {
            const error: ValidationError = {
                field: 'email',
                message: 'Email is required'
            }

            expect(error.field).toBe('email')
            expect(error.message).toBe('Email is required')
        })

        it('should create valid FormValidationResult objects', () => {
            const result: FormValidationResult = {
                isValid: false,
                errors: [
                    { field: 'email', message: 'Email is required' },
                    { field: 'name', message: 'Name is required' }
                ]
            }

            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(2)
            expect(result.errors[0].field).toBe('email')
            expect(result.errors[1].field).toBe('name')
        })

        it('should create valid CurrencyConfig objects', () => {
            const config1: CurrencyConfig = {
                currency: 'USD',
                locale: 'en-US'
            }

            const config2: CurrencyConfig = {
                currency: 'EUR',
                locale: 'de-DE',
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
            }

            expect(config1.currency).toBe('USD')
            expect(config1.locale).toBe('en-US')
            expect(config1.minimumFractionDigits).toBeUndefined()
            expect(config1.maximumFractionDigits).toBeUndefined()

            expect(config2.currency).toBe('EUR')
            expect(config2.locale).toBe('de-DE')
            expect(config2.minimumFractionDigits).toBe(2)
            expect(config2.maximumFractionDigits).toBe(4)
        })
    })

    describe('SupportedCurrency type compatibility', () => {
        it('should accept valid currency strings', () => {
            const currency1: SupportedCurrency = 'USD'
            const currency2: SupportedCurrency = 'EUR'
            const currency3: SupportedCurrency = 'GBP'
            const currency4: SupportedCurrency = 'INR'

            expect(currency1).toBe('USD')
            expect(currency2).toBe('EUR')
            expect(currency3).toBe('GBP')
            expect(currency4).toBe('INR')
        })

        it('should be compatible with SUPPORTED_CURRENCIES array', () => {
            SUPPORTED_CURRENCIES.forEach(currency => {
                const typedCurrency: SupportedCurrency = currency
                expect(typedCurrency).toBe(currency)
            })
        })
    })

    describe('TimeWindow type compatibility', () => {
        it('should accept valid time window values', () => {
            const timeWindow1: TimeWindow = 90
            const timeWindow2: TimeWindow = 180
            const timeWindow3: TimeWindow = 365
            const timeWindow4: TimeWindow = 730
            const timeWindow5: TimeWindow = 1095
            const timeWindow6: TimeWindow = 0

            expect(timeWindow1).toBe(90)
            expect(timeWindow2).toBe(180)
            expect(timeWindow3).toBe(365)
            expect(timeWindow4).toBe(730)
            expect(timeWindow5).toBe(1095)
            expect(timeWindow6).toBe(0)
        })

        it('should be compatible with TIME_WINDOW_OPTIONS array', () => {
            TIME_WINDOW_OPTIONS.forEach(option => {
                const typedValue: TimeWindow = option.value
                expect(typedValue).toBe(option.value)
            })
        })
    })

    describe('Form data types', () => {
        it('should create valid PlanFormData objects', () => {
            const formData: PlanFormData = {
                targetAmount: '1000000',
                currentAge: '30',
                retirementAge: '60',
                lifeExpectancy: '80',
                monthlyExpense: '5000',
                isValid: true,
                errors: {}
            }

            expect(formData.targetAmount).toBe('1000000')
            expect(formData.currentAge).toBe('30')
            expect(formData.retirementAge).toBe('60')
            expect(formData.lifeExpectancy).toBe('80')
            expect(formData.monthlyExpense).toBe('5000')
            expect(formData.isValid).toBe(true)
            expect(formData.errors).toEqual({})
        })

        it('should create valid InvestmentFormData objects', () => {
            const formData: InvestmentFormData = {
                investedAmount: '1000',
                currentValue: '1100',
                recordDate: '2023-01-01',
                tag: 'Stocks'
            }

            expect(formData.investedAmount).toBe('1000')
            expect(formData.currentValue).toBe('1100')
            expect(formData.recordDate).toBe('2023-01-01')
            expect(formData.tag).toBe('Stocks')
        })

        it('should create valid InflationFormData objects', () => {
            const formData: InflationFormData = {
                inflation: '3.5',
                recordDate: '2023-01-01'
            }

            expect(formData.inflation).toBe('3.5')
            expect(formData.recordDate).toBe('2023-01-01')
        })
    })

    describe('Data import/export types', () => {
        it('should create valid ImportedData objects', () => {
            const importedData: ImportedData = {
                investments: [
                    {
                        investedAmount: 1000,
                        currentValue: 1100,
                        recordDate: new Date('2023-01-01'),
                        tag: 'Stocks'
                    }
                ],
                annualInflation: [
                    {
                        inflation: 3.5,
                        recordDate: new Date('2023-01-01')
                    }
                ]
            }

            expect(importedData.investments).toHaveLength(1)
            expect(importedData.annualInflation).toHaveLength(1)
            expect(importedData.planParameters).toBeUndefined()
        })

        it('should create valid ExportData objects', () => {
            const exportData: ExportData = {
                investments: [],
                annualInflation: [],
                exportDate: new Date('2023-01-01'),
                version: '1.0.0'
            }

            expect(exportData.investments).toEqual([])
            expect(exportData.annualInflation).toEqual([])
            expect(exportData.exportDate).toBeInstanceOf(Date)
            expect(exportData.version).toBe('1.0.0')
        })
    })
})
