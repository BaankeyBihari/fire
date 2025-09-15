import React from 'react'
import { useRouter } from 'next/router'
import { Container, Paper, Typography, Button, Box, Alert } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

export default function AuthError() {
  const router = useRouter()
  const { error } = router.query

  const getErrorMessage = (error: string | string[] | undefined) => {
    if (typeof error !== 'string') return 'An unknown error occurred'

    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in'
      case 'Verification':
        return 'The verification token has expired or has already been used'
      default:
        return 'An error occurred during authentication'
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              Authentication Error
            </Typography>
          </Box>

          <Alert severity="error" sx={{ mb: 3 }}>
            {getErrorMessage(error)}
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => router.push('/auth/signin')}
            >
              Try Again
            </Button>
            <Button variant="outlined" onClick={() => router.push('/')}>
              Go Home
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
