import { render, screen } from '@testing-library/react'
import { SessionProvider, useSession } from 'next-auth/react'
import AuthHeader from '../AuthHeader'

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('AuthHeader', () => {
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: mockUpdate,
    })

    render(
      <SessionProvider session={null}>
        <AuthHeader />
      </SessionProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders sign in button when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    })

    render(
      <SessionProvider session={null}>
        <AuthHeader />
      </SessionProvider>
    )

    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('renders user info when authenticated', () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      expires: '2024-12-31',
    }

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: mockUpdate,
    })

    render(
      <SessionProvider session={mockSession}>
        <AuthHeader />
      </SessionProvider>
    )

    expect(screen.getByText('Welcome, John')).toBeInTheDocument()
  })
})
