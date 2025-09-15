import * as React from 'react'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Copyright from '@components/Copyright'
import Tabs from '@components/Tabs'
import AuthHeader from '@components/AuthHeader'

const Home: NextPage = () => {
  const { data: session, status } = useSession()

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <>
        <AuthHeader />
        <Container maxWidth="lg">
          <Box
            sx={{
              my: 8,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading...
            </Typography>
          </Box>
        </Container>
      </>
    )
  }

  // Show welcome message if not authenticated
  if (!session) {
    return (
      <>
        <AuthHeader />
        <Container maxWidth="lg">
          <Box
            sx={{
              my: 8,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
              textAlign: 'center',
            }}
          >
            <Typography variant="h1" component="h1" gutterBottom>
              FIRE
            </Typography>
            <Typography variant="h2" component="h2" gutterBottom>
              Financial Independence, Retire Early
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mt: 4, mb: 2 }}
            >
              Welcome to your personal FIRE calculator
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: '600px' }}
            >
              Track your investments, plan your retirement, and achieve
              financial independence. Sign in with Google to get started and
              save your financial data securely.
            </Typography>
            <Copyright />
          </Box>
        </Container>
      </>
    )
  }

  // Show full app if authenticated
  return (
    <>
      <AuthHeader />
      <Container maxWidth="lg">
        <Box
          sx={{
            my: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h1" component="h1" gutterBottom>
            FIRE
          </Typography>
          <Typography variant="h2" component="h2" gutterBottom>
            Financial Independence, Retire Early
          </Typography>
          <Tabs />
          <Copyright />
        </Box>
      </Container>
    </>
  )
}

export default Home
