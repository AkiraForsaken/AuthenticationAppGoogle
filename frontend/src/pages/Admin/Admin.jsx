import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppContext'
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Button, Divider } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import GroupIcon from '@mui/icons-material/Group'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout'

const sidebarLinks = [
  { name: 'Manage Tasks', path: '/admin', icon: <AssignmentIcon /> },
  { name: 'Verify Tasks', path: '/admin/verify', icon: <CheckCircleIcon /> },
  { name: 'User Management', path: '/admin/add-users', icon: <GroupIcon /> }, // Placeholder
]

const drawerWidth = 220

const Admin = () => {
  const { axios, user, setUser, setIsAdmin,darkMode, setDarkMode } = useAppContext()
  const navigate = useNavigate()

  const logout = async () => {
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
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'mainBg.main' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'mainBg.white'},
        }}
      >
        <Toolbar sx={{ minHeight: 64, bgcolor: 'mainBg.white' }} />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          {/* Sidebar Links */}
          <List>
            {sidebarLinks.map((item) => (
              <ListItem
                key={item.name}
                component={NavLink}
                to={item.path}
                end={item.path === '/admin'}
                sx={({ isActive }) => ({
                  // bgcolor: isActive ? 'primary.light' : 'inherit',
                  // color: isActive ? 'primary.main' : 'inherit',
                  borderRight: isActive ? '4px solid #1976d2' : '4px solid #fff',
                  '&:hover': { bgcolor: ` ${darkMode ? '#213f77ff' : '#a9bfd1ff'}` },
                })}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Top bar */}
        <AppBar position="static" color="inherit" elevation={1} sx={{ zIndex: 1201, bgcolor: 'mainBg.white'}}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h3" fontWeight={700} color="mainBg.whiteText">
              Admin Panel
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography fontSize={20} color="mainBg.whiteText"> 
                Hello Admin {user ? user.name : null}
              </Typography>
              {/* Dark mode button */}
              <IconButton sx={{ ml: 1 }} onClick={()=>setDarkMode(!darkMode)} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <Button variant="contained" color="primary" startIcon={<LogoutIcon />} onClick={logout}>
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default Admin