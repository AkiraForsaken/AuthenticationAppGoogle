import React from 'react'
import { Button, Typography, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const WarningPage = ({ message, showHome = true }) => {
  const navigate = useNavigate()
  return (
    <Box sx={{ 
        minHeight: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', gap: 3 }}>
      <Typography variant="h3" color="error" fontWeight={700}>{message}</Typography>
      {showHome && (
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Go to Home
        </Button>
      )}
    </Box>
  )
}

export default WarningPage