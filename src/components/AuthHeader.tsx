import React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  IconButton,
} from '@mui/material'
import { AccountCircle } from '@mui/icons-material'

export default function AuthHeader() {
  const { data: session, status } = useSession()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = () => {
    signOut()
    handleClose()
  }

  if (status === 'loading') {
    return (
      <AppBar position="static" color="transparent" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FIRE Calculator
          </Typography>
          <Button color="inherit" disabled>
            Loading...
          </Button>
        </Toolbar>
      </AppBar>
    )
  }

  return (
    <AppBar position="static" color="transparent" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FIRE Calculator
        </Typography>

        {session ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {session.user?.name?.split(' ')[0]}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {session.user?.image ? (
                <Avatar
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => signIn()}>
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}
