import React, { useState } from 'react'
import { Box, Typography, Card, CardContent, TextField, Avatar, Button, Divider, List, ListItem, ListItemText, IconButton, Container } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast';

const Profile = () => {
  const { axios, user, setUser, userTasks } = useAppContext();
  const [editMode,setEditMode] = useState(false);
  const [name, setName]= useState(user?.name || '');
  const [socialLinks, setSocialLinks] = useState(user?.socialLinks || []);
  const [newLink, setNewLink] = useState({label: '', url: ''});
  const [picture, setPicture] = useState(user?.picture || '');
  const [uploading, setUploading] = useState(false);

  const handleSave = async ()=>{
    try {
      const res = await axios.patch('/api/users/update', {name, socialLinks});
      if (res.data.success){
        setUser(res.data.user);
        setEditMode(false);
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  }

  // Handle picture upload
  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('picture', file);
    try {
      const res = await axios.post('/api/users/upload-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success('Profile picture updated!');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error('Failed to upload picture');
    }
    setUploading(false);
  }

  // handle add / remove new link to social links
  const handleAddLink = () => {
    if (newLink.label && newLink.url) {
      setSocialLinks([...socialLinks, newLink]);
      setNewLink({label: '', url: ''});
    }
  }

  const handleRemoveLink = (idx) => {
    setSocialLinks(socialLinks.filter((_, i) => {i !== idx}))
  }

  return (
    <Box
      sx={{
        gap: { xs: 2, md: 10 },
        bgcolor: '#e3f2fd', // light blue background
        minHeight: '100vh',
        py: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: {xs: 'column', md: 'row'}, 
        alignItems: 'center',
        gap: 4, mx: 'auto', 
        maxWidth: 1400, mt: 4 }}>

        {/* -------------------- Left: Profile info -------------------- */}
        <Card sx={{ flex: 1, minWidth: 300, maxWidth: 400, minHeight: 600}}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar src={user.picture} alt={user.name} sx={{ width: 150, height: 150, mb: 2 }} />
              <Button
                component="label"
                variant="outlined"
                size="small"
                disabled={uploading}
                sx={{ mb: 2 }}
              >
                Upload Picture
                <input type="file" accept='image/*' hidden onChange={handlePictureUpload} />
              </Button>

              {editMode ? (
                <TextField label="Name" value={name} onChange={e => setName(e.target.value)} size="small" />
              ) : (
                <Typography variant="h5" fontWeight={700}>{user.name}</Typography>
              )}

              <Typography color="text.primary">{user.email}</Typography>
              <Typography color="text.primary" fontSize={14}>{user.role.toUpperCase()}</Typography>
              
              <Divider sx={{ my: 2, width: '100%' }} />

              <Typography variant="subtitle1" fontWeight={700}>Social Links</Typography>
              <Box sx={{ width: '100%' }}>
                {socialLinks.map((link, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MuiLink href={link.url} target="_blank" rel="noopener" underline="hover">{link.label}</MuiLink>
                    {editMode && (
                      <IconButton size="small" onClick={() => handleRemoveLink(idx)}><span>&times;</span></IconButton>
                    )}
                  </Box>
                ))}
                {editMode && (
                  <Box sx={{ display: 'flex', flexDirection:"column", gap: 1, mt: 1 }}>
                    <TextField
                      label="Facebook"
                      value={newLink.label}
                      onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                      size="small"
                    />
                    <TextField
                      label="Instagram"
                      value={newLink.url}
                      onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                      size="small"
                    />
                    <IconButton color="primary" onClick={handleAddLink}><AddIcon /></IconButton>
                  </Box>
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                {editMode ? (
                  <>
                    <Button onClick={handleSave} variant="contained" size="small" startIcon={<SaveIcon />} sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button onClick={() => setEditMode(false)} size="small">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditMode(true)} variant="outlined" size="small" startIcon={<EditIcon />}>Edit</Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* -------------------- Right: Tasks -------------------- */}
        <Card sx={{flex: 2, minHeight:600}}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} fontFamily={"Montserrat"} mb={2} sx={{textAlign: 'center'}}>
              Your Tasks
            </Typography>
            <List>
              {userTasks.length === 0 && <Typography>No tasks assigned.</Typography>}
              {userTasks.map(task => (
                <ListItem key={task._id} disableGutters>
                  <ListItemText
                  primary={task.name}
                  secondary={
                    <>
                      <span>Status: {task.status}</span>
                      <br />
                      <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                      <br />
                      <span>Category: {task.category}</span>
                    </>  
                  }/>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
    </Box>
  </Box>
  )
}

export default Profile