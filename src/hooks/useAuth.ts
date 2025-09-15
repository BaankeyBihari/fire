import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const useAuth = (redirectTo = '/auth/signin') => {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return // Still loading

        if (!session) {
            router.push(redirectTo)
        }
    }, [session, status, router, redirectTo])

    return {
        session,
        status,
        isAuthenticated: !!session,
        isLoading: status === 'loading',
    }
}

export const useRequireAuth = (redirectTo = '/auth/signin') => {
    const auth = useAuth(redirectTo)

    return auth
}
