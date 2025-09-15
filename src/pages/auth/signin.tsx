import React from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { getProviders, signIn } from 'next-auth/react'
import { Container, Paper, Typography, Button, Box, Alert } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import { authOptions } from '../api/auth/[...nextauth]'

interface SignInPageProps {
  providers: any
  error?: string
}

export default function SignIn({ providers, error }: SignInPageProps) {
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
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error === 'OAuthSignin' &&
                'Error in constructing an authorization URL'}
              {error === 'OAuthCallback' &&
                'Error in handling the response from an OAuth provider'}
              {error === 'OAuthCreateAccount' &&
                'Could not create OAuth provider user in the database'}
              {error === 'EmailCreateAccount' &&
                'Could not create email provider user in the database'}
              {error === 'Callback' &&
                'Error in the OAuth callback handler route'}
              {error === 'OAuthAccountNotLinked' &&
                'Email on the account is already linked, but not with this OAuth account'}
              {error === 'EmailSignin' && 'Check your email address'}
              {error === 'CredentialsSignin' &&
                'Sign in failed. Check the details you provided are correct'}
              {error === 'SessionRequired' &&
                'Please sign in to access this page'}
              {![
                'OAuthSignin',
                'OAuthCallback',
                'OAuthCreateAccount',
                'EmailCreateAccount',
                'Callback',
                'OAuthAccountNotLinked',
                'EmailSignin',
                'CredentialsSignin',
                'SessionRequired',
              ].includes(error) && 'An error occurred during sign in'}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            {Object.values(providers).map((provider: any) => (
              <Button
                key={provider.name}
                variant="contained"
                fullWidth
                size="large"
                startIcon={<GoogleIcon />}
                onClick={() => signIn(provider.id)}
                sx={{
                  mt: 2,
                  backgroundColor: '#4285f4',
                  '&:hover': {
                    backgroundColor: '#357ae8',
                  },
                }}
              >
                Sign in with {provider.name}
              </Button>
            ))}
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 3 }}
          >
            Secure authentication powered by Google
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  // If the user is already logged in, redirect to home
  if (session) {
    return { redirect: { destination: '/', permanent: false } }
  }

  const providers = await getProviders()

  return {
    props: {
      providers: providers ?? {},
      error: context.query.error ?? null,
    },
  }
}
