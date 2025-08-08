import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import {GoogleOAuthProvider} from '@react-oauth/google'
import { AppContextProvider } from './context/AppContext.jsx'
import { ThemeProvider } from '@mui/material'
import './index.css'
import App from './App.jsx'

const CLIENT_ID = "34728994026-f2e2jcqgttu2m6qau1b0c4pqir1g05kh.apps.googleusercontent.com" 

import { useAppContext } from './context/AppContext.jsx'
import getTheme from './theme.js'
function MainApp(){
  const {darkMode} = useAppContext();
  const theme = getTheme(darkMode ? 'dark' : 'light');
  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  ) 
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <AppContextProvider>
          <MainApp />
        </AppContextProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
