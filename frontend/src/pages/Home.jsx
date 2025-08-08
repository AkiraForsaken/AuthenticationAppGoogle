import React from 'react'
import { Card, CardContent, Typography, Button, Grid, Box } from '@mui/material'
import { useAppContext } from '../context/AppContext'

const features = [
  {
    title: 'Stay on Pace',
    description: 'Keep up with your course by following daily tasks and exercises.'
  },
  {
    title: 'Track Progress',
    description: 'Monitor your progress and see your achievements over time.'
  },
  {
    title: 'Clear Instructions',
    description: 'Receive clear instructions and feedback from your supervisor.'
  }
]

const Home = () => {
    const { user, navigate } = useAppContext();
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 900, py: 5, bgcolor: 'mainBg.main'}}>
      <Typography variant="h2" fontWeight={700} sx={{mb: 4, textAlign: 'center', color: 'mainBg.contrastText'}}>
        Welcome to the Task Planner Website
      </Typography>
      <Typography variant="h5" fontWeight={500} sx={{mb: 4, textAlign: 'center', maxWidth: 550, color: 'mainBg.contrastText'}}>
        Get your students on track to greatness! 
        Assign, monitor, and complete daily tasks with ease.
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{mb: 4, gap: 4}}>
        {features.map((feature, i) => (
          <Grid key={i}>
            <Card elevation={4} sx={{color: 'mainBg.whiteText', bgcolor: 'mainBg.white'}}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{mb: 1, textAlign: 'center'}}>
                  {feature.title}
                </Typography>
                <Typography variant="body1">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" color="primary" size="large" 
      disabled={!user} onClick={()=>navigate('dashboard')} sx={{p: 2, borderRadius: 5}}
      >
        Get Started
      </Button>
    </Box>
  )
}

export default Home