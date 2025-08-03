import React from 'react'
import { Card, CardContent, Typography, Button, Grid } from '@mui/material'
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
    <div className='flex flex-col items-center justify-center min-h-[80vh] py-10 bg-blue-100'>
      <Typography variant="h2" fontWeight={700} sx={{mb: 4, textAlign: 'center'}}>
        Welcome to the Task Planner Website
      </Typography>
      <Typography variant="h5" fontWeight={500} sx={{mb: 4, textAlign: 'center', maxWidth: 550}}>
        Get your students on track to greatness! 
        Assign, monitor, and complete daily tasks with ease.
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{mb: 4, gap: 4}}>
        {features.map((feature, i) => (
          <Grid key={i}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{mb: 1, textAlign: 'center'}}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" color="primary" size="large" 
      disabled={!user} onClick={()=>navigate('dashboard')}
      >
        Get Started
      </Button>
    </div>
  )
}

export default Home