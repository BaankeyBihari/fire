import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/auth/signin',
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      fallback || (
        <Container maxWidth="sm">
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: '60vh',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Checking authentication...
            </Typography>
          </Box>
        </Container>
      )
    )
  }

  // Show access denied if not authenticated
  if (!session) {
    return (
      fallback || (
        <Container maxWidth="sm">
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Paper
              elevation={3}
              sx={{ padding: 4, width: '100%', textAlign: 'center' }}
            >
              <LockOutlinedIcon
                sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}
              />
              <Typography component="h1" variant="h4" gutterBottom>
                Authentication Required
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You need to sign in to access this page. Please authenticate
                with your Google account to continue.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push(redirectTo)}
                sx={{ mt: 2 }}
              >
                Sign In
              </Button>
            </Paper>
          </Box>
        </Container>
      )
    )
  }

  // Render children if authenticated
  return <>{children}</>
}
