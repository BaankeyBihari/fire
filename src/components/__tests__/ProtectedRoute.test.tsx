import React from 'react'
import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import ProtectedRoute from '../ProtectedRoute'

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockPush = jest.fn()

describe('ProtectedRoute', () => {
  const mockUpdate = jest.fn()
  const TestChild = () => (
    <div data-testid="protected-content">Protected Content</div>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any)
  })

  it('shows loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: mockUpdate,
    })

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    )

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('shows authentication required when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    })

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    )

    expect(screen.getByText('Authentication Required')).toBeInTheDocument()
    expect(
      screen.getByText(/You need to sign in to access this page/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      expires: '2024-12-31',
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: mockUpdate,
    })

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    })

    const CustomFallback = () => (
      <div data-testid="custom-fallback">Custom Fallback</div>
    )

    render(
      <ProtectedRoute fallback={<CustomFallback />}>
        <TestChild />
      </ProtectedRoute>
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })
})
