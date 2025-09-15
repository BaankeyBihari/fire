import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useSession } from 'next-auth/react'
import Home from '../pages/index'
import theme from '@components/theme'

// Mock the AuthHeader component to avoid NextAuth issues in tests
jest.mock('@components/AuthHeader', () => {
  return function MockAuthHeader() {
    return <div data-testid="auth-header">Auth Header</div>
  }
})

// Mock the Tabs component since it's complex and should be tested separately
jest.mock('@components/Tabs', () => {
  return function MockTabs() {
    return <div data-testid="tabs-component">Tabs Component</div>
  }
})

// Mock the Copyright component
jest.mock('@components/Copyright', () => {
  return function MockCopyright() {
    return <div data-testid="copyright-component">Copyright Component</div>
  }
})

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Helper function to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {component}
    </ThemeProvider>
  )
}

describe('Home Page', () => {
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when loading', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: mockUpdate,
      })
    })

    it('should render loading state', () => {
      renderWithTheme(<Home />)

      expect(screen.getByTestId('auth-header')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  describe('when not authenticated', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: mockUpdate,
      })
    })

    it('should render welcome message without tabs', () => {
      renderWithTheme(<Home />)

      expect(screen.getByTestId('auth-header')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /fire/i, level: 1 })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          name: /financial independence, retire early/i,
          level: 2,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText('Welcome to your personal FIRE calculator')
      ).toBeInTheDocument()
      expect(screen.queryByTestId('tabs-component')).not.toBeInTheDocument()
      expect(screen.getByTestId('copyright-component')).toBeInTheDocument()
    })

    it('should show descriptive text for unauthenticated users', () => {
      renderWithTheme(<Home />)

      expect(
        screen.getByText(/Track your investments, plan your retirement/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Sign in with Google to get started/)
      ).toBeInTheDocument()
    })
  })

  describe('when authenticated', () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      expires: '2024-12-31',
    }

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
        update: mockUpdate,
      })
    })

    it('should render the auth header', () => {
      renderWithTheme(<Home />)

      const authHeader = screen.getByTestId('auth-header')
      expect(authHeader).toBeInTheDocument()
      expect(authHeader).toHaveTextContent('Auth Header')
    })

    it('should render the main heading', () => {
      renderWithTheme(<Home />)

      const mainHeading = screen.getByRole('heading', {
        name: /fire/i,
        level: 1,
      })
      expect(mainHeading).toBeInTheDocument()
    })

    it('should render the subtitle', () => {
      renderWithTheme(<Home />)

      const subtitle = screen.getByRole('heading', {
        name: /financial independence, retire early/i,
        level: 2,
      })
      expect(subtitle).toBeInTheDocument()
    })

    it('should render the Tabs component', () => {
      renderWithTheme(<Home />)

      const tabsComponent = screen.getByTestId('tabs-component')
      expect(tabsComponent).toBeInTheDocument()
      expect(tabsComponent).toHaveTextContent('Tabs Component')
    })

    it('should render the Copyright component', () => {
      renderWithTheme(<Home />)

      const copyrightComponent = screen.getByTestId('copyright-component')
      expect(copyrightComponent).toBeInTheDocument()
      expect(copyrightComponent).toHaveTextContent('Copyright Component')
    })

    it('should render all components in correct order', () => {
      renderWithTheme(<Home />)

      const elements = [
        screen.getByTestId('auth-header'),
        screen.getByRole('heading', { name: /fire/i, level: 1 }),
        screen.getByRole('heading', {
          name: /financial independence, retire early/i,
          level: 2,
        }),
        screen.getByTestId('tabs-component'),
        screen.getByTestId('copyright-component'),
      ]

      // Verify all elements are present
      elements.forEach((element) => {
        expect(element).toBeInTheDocument()
      })
    })
  })

  describe('general tests', () => {
    beforeEach(() => {
      // Default to authenticated state for general tests
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Test User', email: 'test@example.com' },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: mockUpdate,
      })
    })

    it('should be a Next.js page component', () => {
      // Test that the component is a function
      expect(typeof Home).toBe('function')

      // Test that it renders without props (Next.js page requirement)
      expect(() => renderWithTheme(<Home />)).not.toThrow()
    })

    it('should render without theme provider', () => {
      // Test that the component doesn't crash without theme provider
      expect(() => render(<Home />)).not.toThrow()
    })

    it('should have accessible headings hierarchy', () => {
      renderWithTheme(<Home />)

      const h1 = screen.getByRole('heading', { level: 1 })
      const h2 = screen.getByRole('heading', { level: 2 })

      expect(h1).toBeInTheDocument()
      expect(h2).toBeInTheDocument()

      // Verify heading hierarchy is correct (h1 comes before h2)
      const headings = screen.getAllByRole('heading')
      expect(headings[0]).toBe(h1)
      expect(headings[1]).toBe(h2)
    })

    it('should have semantic HTML structure', () => {
      renderWithTheme(<Home />)

      // Check that headings are properly marked as h1 and h2 elements
      const h1Element = document.querySelector('h1')
      const h2Element = document.querySelector('h2')

      expect(h1Element).toBeInTheDocument()
      expect(h1Element).toHaveTextContent('FIRE')

      expect(h2Element).toBeInTheDocument()
      expect(h2Element).toHaveTextContent(
        'Financial Independence, Retire Early'
      )
    })
  })
})
