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
    mainBg: {
      light: '#F8E7F6',
      white:'#F2F9FF',
      dark: '',
      whiteText:'#217527ff' ,
      contrastText: '#4B164C',
    },
    card: {
      main: '#FFFDEC',
      contrastText:'#71ac75ff',
      highlightText: '#8D0B41',
    },
    card2: '#f3d26d71',
    // primary: {
    //   light: '#757ce8',
    //   main: '#3f50b5',
    //   dark: '#002884',
    //   contrastText: '#fff',
    // },
    primary: {
      light: '#FFCCE1',
      main: '#DD88CF',
      dark: '#4B164C',
      contrastText: '#F2F9FF',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#10375C',
    },
    footer: {
      main: '#6a737b',
      dark: '#111',
      contrastText: '#fff',
    }
  },
  typography: {
    fontFamily: [
      'Montserrat', 
      'sans-serif',
    ].join(','),
    primary: '#fff'
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
