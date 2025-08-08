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
    const { user, navigate, axios } = useAppContext();
    
    // Temporary test function
    const testBackend = async () => {
      try {
        console.log('Testing backend connection...');
        const res = await axios.get('/api/health');
        console.log('Backend test successful:', res.data);
        
        // Also test CORS endpoint
        try {
          const corsRes = await axios.get('/api/cors-test');
          console.log('CORS test successful:', corsRes.data);
          alert('Backend connection successful!\nCORS is working properly.');
        } catch (corsError) {
          console.error('CORS test failed:', corsError);
          alert('Backend connection successful, but CORS might have issues.');
        }
      } catch (error) {
        console.error('Backend test failed:', error);
        alert('Backend connection failed: ' + error.message);
      }
    };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 900, py: 5, bgcolor: 'mainBg.main'}}>
      <Typography variant="h2" fontWeight={700} sx={{mb: 4, textAlign: 'center', color: 'mainBg.contrastText'}}>
        Welcome to the Task Planner Website
      </Typography>
      <Typography variant="h5" fontWeight={500} sx={{mb: 4, textAlign: 'center', maxWidth: 550, color: 'mainBg.contrastText'}}>
        Get your students on track to greatness! 
        Assign, monitor, and complete daily tasks with ease.
      </Typography>
      
      {/* Temporary test button */}
      <Button 
        variant="outlined" 
        onClick={testBackend}
        sx={{mb: 4}}
      >
        Test Backend Connection
      </Button>
      
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
        {user ? 'Go to Dashboard' : 'Login to Get Started'}
      </Button>
    </Box>
  )
}

export default Home