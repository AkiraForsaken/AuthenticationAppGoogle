import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import {GoogleOAuthProvider} from '@react-oauth/google'
import { AppContextProvider } from './context/AppContext.jsx'
import { createTheme, ThemeProvider } from '@mui/material'
import './index.css'
import App from './App.jsx'

const theme = createTheme({
  palette: {
    primary: {
      main: "#e31ec8ff"
    },
    secondary: {
      main: "#FEFBC7"
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
})

const CLIENT_ID = "34728994026-f2e2jcqgttu2m6qau1b0c4pqir1g05kh.apps.googleusercontent.com" 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <AppContextProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </AppContextProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
