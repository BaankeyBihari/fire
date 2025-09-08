import { createTheme } from '@mui/material/styles'
import theme from '../theme'

describe('Theme Configuration', () => {
    test('theme is properly configured', () => {
        expect(theme).toBeTruthy()
        expect(theme.palette).toBeTruthy()
        expect(theme.typography).toBeTruthy()
    })

    test('theme has primary color configured', () => {
        expect(theme.palette.primary).toBeTruthy()
        expect(theme.palette.primary.main).toBeTruthy()
    })

    test('theme has secondary color configured', () => {
        expect(theme.palette.secondary).toBeTruthy()
        expect(theme.palette.secondary.main).toBeTruthy()
    })

    test('theme typography is configured', () => {
        expect(theme.typography.fontFamily).toBeTruthy()
    })

    test('theme can be used to create MUI theme', () => {
        const muiTheme = createTheme(theme)
        expect(muiTheme).toBeTruthy()
        expect(muiTheme.palette.primary).toBeTruthy()
    })

    test('theme has consistent color palette', () => {
        expect(theme.palette.primary.main).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })

    test('theme breakpoints are properly configured', () => {
        expect(theme.breakpoints).toBeTruthy()
    })

    test('theme spacing is configured', () => {
        expect(theme.spacing).toBeTruthy()
    })
})
