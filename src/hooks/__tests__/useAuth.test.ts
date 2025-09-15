import { renderHook } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useAuth } from '../useAuth'

// Mock dependencies
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}))

jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

describe('useAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseRouter.mockReturnValue({
            push: mockPush,
        } as any)
    })

    it('returns correct state when authenticated', () => {
        const mockSession = {
            user: { id: '1', name: 'John Doe' },
            expires: '2024-12-31',
        }

        mockUseSession.mockReturnValue({
            data: mockSession,
            status: 'authenticated',
            update: jest.fn(),
        })

        const { result } = renderHook(() => useAuth())

        expect(result.current.session).toBe(mockSession)
        expect(result.current.status).toBe('authenticated')
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.isLoading).toBe(false)
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('returns correct state when loading', () => {
        mockUseSession.mockReturnValue({
            data: null,
            status: 'loading',
            update: jest.fn(),
        })

        const { result } = renderHook(() => useAuth())

        expect(result.current.session).toBe(null)
        expect(result.current.status).toBe('loading')
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isLoading).toBe(true)
        expect(mockPush).not.toHaveBeenCalled()
    })

    it('redirects when unauthenticated', () => {
        mockUseSession.mockReturnValue({
            data: null,
            status: 'unauthenticated',
            update: jest.fn(),
        })

        const { result } = renderHook(() => useAuth())

        expect(result.current.session).toBe(null)
        expect(result.current.status).toBe('unauthenticated')
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.isLoading).toBe(false)
    })

    it('uses custom redirect path', () => {
        mockUseSession.mockReturnValue({
            data: null,
            status: 'unauthenticated',
            update: jest.fn(),
        })

        renderHook(() => useAuth('/custom/signin'))
    })
})
