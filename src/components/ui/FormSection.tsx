import React from 'react'
import { Box, Card, CardContent, Typography, Divider } from '@mui/material'

interface FormSectionProps {
  title: string
  children: React.ReactNode
  variant?: 'card' | 'outlined'
  spacing?: number
  elevation?: number
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  variant = 'card',
  spacing = 2,
  elevation = 1,
}) => {
  if (variant === 'outlined') {
    return (
      <Box sx={{ mb: spacing * 2 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        <Divider sx={{ mb: spacing }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
          {children}
        </Box>
      </Box>
    )
  }

  return (
    <Card elevation={elevation} sx={{ mb: spacing }}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  )
}

export default FormSection
