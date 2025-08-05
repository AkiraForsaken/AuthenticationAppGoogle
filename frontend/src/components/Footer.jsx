import { Box, Typography } from '@mui/material'
import React from 'react'

const Footer = () => {
  return (
    <Box>
      <Box sx={{ bgcolor: 'footer.main' , minHeight: 250, px: 10, py:7}} className='text-white'>
        <Typography variant='h5' fontWeight={700} sx={{ mb: 2}}>
          Creator: Akira Seiji
        </Typography>
        <span className='text-md'>Email address: akiraseiji123@gmail.com</span>
        <br />
        <span className='text-md'>Telephone: 0936507421</span>
        <br />
        <span className='text-md'>Facebook: https://www.facebook.com/akiraseji/</span>
        <Typography variant='h5' fontWeight={700} sx={{ mt: 2}}>
          If you want to register as an admin or a student, send me a request email. 
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', bgcolor: 'footer.dark', minHeight: 100, justifyContent: 'center', alignItems: 'center'}} className='text-white'>
        <Typography variant='h6' fontWeight={600}>
          Copyright ??? 2025-2025
        </Typography>
      </Box>
    </Box>
  )
}

export default Footer