import React, { useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Divider, Button, List, ListItem, ListItemText 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const NotificationMenu = () => {
  const { notifications, unreadCount, axios, fetchNotifications} = useAppContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  }
  const handleClose = (e) => {
    setAnchorEl(null);
  }
  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await axios.patch(`/api/notifications/mark-read/${notificationId}`);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      toast.error('Failed to mark as read');
      console.log(error.message)
    }
  };
  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark all as read');
      console.log(error.message)
    }
  }
  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 400,
              width: 250,
              bgcolor: 'mainBg.white',
              color: 'mainBg.contrastText',
            }
          }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center'}}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant='h6' fontWeight={700}>
            Notifications
          </Typography>
          <Button size='medium' onClick={handleMarkAllAsRead} disabled={unreadCount===0}
          sx={{ mt: 1, color: 'mainBg.whiteText' }}>
            Mark all as read
          </Button>
        </Box>
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <MenuItem>
              <Typography>No notifications</Typography>
            </MenuItem>
          ) : (
            notifications.map((noti) => (
              <ListItem 
              key={noti._id}
              sx={{ 
                bgcolor: noti.isRead ? 'inherit' : 'action.hover',
                borderBottom: 1,
                borderColor: 'divider'
              }}>
                <div>
                  <Typography variant="body1">
                    {noti.title}
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {noti.message}
                  </Typography>
                  <Typography variant="caption" color="text.primary" 
                  sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    {new Date(noti.createdAt).toLocaleDateString()}
                    <Button size='small' 
                    onClick={()=> handleMarkAsRead(noti._id)} disabled={noti.isRead}
                    sx={{ color: 'mainBg.whiteText' }}>
                      Mark as read
                    </Button>
                  </Typography>
                </div>
              </ListItem>
            ))
          )}
        </List>
      </Menu>
    </>
  )
}

export default NotificationMenu