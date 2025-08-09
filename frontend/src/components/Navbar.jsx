import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import { AppBar, Toolbar, Box, Avatar, Menu, MenuItem, IconButton, Typography, Button } from '@mui/material'
// import { Brightness4Icon, Brightness7Icon } from '@mui/icons-material'
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { GoogleLogin } from '@react-oauth/google'
import profileIcon from '../assets/profile_icon.png'
import toast from 'react-hot-toast'
import NotificationMenu from './NotificationMenu.jsx';

const Navbar = () => {
  const { axios, user, setUser, isAdmin, setIsAdmin, darkMode, setDarkMode } = useAppContext();
  const navigate = useNavigate();
  // Dummy user for demonstration
  // const user = { name: 'John Doe', email: 'john@example.com', picture: profileIcon };

  // Dropdown menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };
  const handleDashboard = () => {
    navigate('/dashboard');
    handleClose();
  };
  const handleLogout = async () => {
    try {
      const res = await axios.get('/api/users/logout');
      if (res.data.success){
        toast.success(res.data.message);
        setUser(null);
        setIsAdmin(false);
        // localStorage.removeItem('token');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <AppBar position="sticky" elevation={1} 
    sx={{ bgcolor: 'mainBg.white', fontFamily: 'Montserrat, sans-serif', color: 'mainBg.contrastText' }}>
      <Toolbar sx={{ justifyContent: 'space-between', maxHeight: 64}}>
        <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' , gap: 2, p: 4}}>
          <NavLink to='/' style={{ textDecoration: 'none' }}>
            <Typography variant='h4' fontWeight={700}
            sx={{textAlign: 'center' }}>
              Home
            </Typography>
          </NavLink>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}> 
          {/* <Button href="https://study4.com" variant='text' 
          sx={{ p: 1, maxWidth: 150, textAlign: 'center', fontWeight: 500, textTransform: 'none', color: 'mainBg.contrastText'}}> 
            <span className='text-lg'>Do exercises here</span> 
          </Button> */}
          {user && !isAdmin && <NotificationMenu />}
          {/* Dark mode button */}
          <IconButton sx={{ ml: 1 }} onClick={()=>setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {/* Google login button or user profile */}
          {!user ? (
            <Box sx={{ ml: 1 }}>
            <GoogleLogin
              locale='en'
              theme="outline"
              size="large"
              shape="pill"
              text="signin_with"
              logo_alignment="left"
              ux_mode="popup"
              onSuccess={async credentialResponse => {
                try {
                  const res = await axios.post('/api/auth/google', {
                    credential: credentialResponse.credential
                  });
                  if (res.data.success){
                    setUser(res.data.user);
                    setIsAdmin(res.data.user.role === 'admin');
                    // localStorage.setItem('token', res.data.token);
                    if (res.data.user.role === 'admin'){
                      navigate('/admin');
                    } else {
                      navigate('/dashboard');
                    }
                    toast.success(res.data.message);
                  } else {
                    toast.error(res.data.message);
                  }
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Login failed')
                }
                // setUser({ name: 'John Doe', email: 'john@example.com', picture: profileIcon });
              }}
              onError={() => {toast.error('Google login failed')
              }}
            />
            </Box>
          ) : (
            <>
              <IconButton onClick={handleMenu} size="medium" sx={{ ml: 1 }}>
                <Avatar 
                  // src={user.picture ? `${import.meta.env.VITE_BACKEND_URL}${user.picture}` : profileIcon} 
                  src={user.picture ? user.picture : profileIcon}
                  alt={user.name} 
                  sx={{ width: 36, height: 36, mr: 2 }} 
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      mt: 1.5,
                      minWidth: 160,
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                    },
                  }
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleProfile}>My Profile</MenuItem>
                <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar