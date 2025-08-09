import React, { useState } from 'react'
import { Box, Typography, Card, CardContent, TextField, Avatar, Button, Divider, List, ListItem, IconButton, Grid, Link as MuiLink } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast';

const Profile = () => {
  const { axios, user, setUser, userTasks } = useAppContext();
  const [editMode,setEditMode] = useState(false);
  const [name, setName]= useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ? user.birthDate.split('T')[0] : '');
  const [socialLinks, setSocialLinks] = useState(user?.socialLinks || []);
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    instagram: '',
    tiktok: '',
    twitter: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleSave = async ()=>{
    try {
      const res = await axios.patch('/api/users/update', {
        name, 
        phoneNumber, 
        birthDate, 
        socialLinks
      });
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
    const newLinks = [];
    
    // Add each non-empty social media link
    Object.entries(socialMediaLinks).forEach(([platform, url]) => {
      if (url.trim()) {
        newLinks.push({
          label: platform.charAt(0).toUpperCase() + platform.slice(1),
          url: url.trim()
        });
      }
    });
    
    if (newLinks.length > 0) {
      setSocialLinks([...socialLinks, ...newLinks]);
      setSocialMediaLinks({
        facebook: '',
        instagram: '',
        tiktok: '',
        twitter: ''
      });
    }
  }

  const handleRemoveLink = (idx) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== idx))
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  // Initialize social media links from existing data
  const initializeSocialMediaLinks = () => {
    const links = {
      facebook: '',
      instagram: '',
      tiktok: '',
      twitter: ''
    };
    
    socialLinks.forEach(link => {
      const platform = link.label.toLowerCase();
      if (links.hasOwnProperty(platform)) {
        links[platform] = link.url;
      }
    });
    
    setSocialMediaLinks(links);
  };

  return (
    <Box
      sx={{
        gap: { xs: 2, md: 10 },
        bgcolor: 'mainBg.main',
        minHeight: '100vh',
        pt: { xs: 2, md: 4 },
        pb: 20,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: {xs: 'column', md: 'row'}, 
        alignItems: 'start',
        gap: 4, mx: 'auto', 
        maxWidth: 1400, mt: 4 }}>

        {/* -------------------- Left: Profile info -------------------- */}
        <Card 
        sx={{ flex: 1, minWidth: 300, maxWidth: 400, minHeight: 600, bgcolor: 'card.main', color: 'card.contrastText'}}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar 
                // src={user.picture ? `${import.meta.env.VITE_BACKEND_URL}${user.picture}` : undefined} 
                src={user.picture ? user.picture : undefined}
                alt={user.name} 
                sx={{ width: 150, height: 150, mb: 2 }} 
              />
              <Button
                component="label"
                variant='contained'
                size="medium"
                disabled={uploading}
                sx={{ mb: 2 }}
              >
                Upload Picture
                <input type="file" accept='image/*' hidden onChange={handlePictureUpload} />
              </Button>

              {editMode ? (
                <>
                  <TextField 
                    label="Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    size="small" 
                    fullWidth
                  />
                  <TextField 
                    label="Phone Number" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value)} 
                    size="small" 
                    fullWidth
                  />
                  <TextField 
                    label="Birth Date" 
                    value={birthDate} 
                    onChange={e => setBirthDate(e.target.value)} 
                    size="small" 
                    fullWidth
                    type="date"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      }
                    }}
                    // InputLabelProps={{
                    //   shrink: true,
                    // }}
                  />
                </>
              ) : (
                <>
                  <Typography variant="h5" fontWeight={700}>{user.name}</Typography>
                  <Typography fontWeight={600}>{user.email}</Typography>
                  <Typography fontSize={18}>{user.role.toUpperCase()}</Typography>
                  {user.phoneNumber && (
                    <Typography fontSize={14}>📞 {user.phoneNumber}</Typography>
                  )}
                  {user.birthDate && (
                    <Typography fontSize={14}>🎂 {formatDate(user.birthDate)}</Typography>
                  )}
                </>
              )}
              
              <Divider sx={{ my: 2, width: '100%' }} />

              <Typography variant="body1" fontSize={24} fontWeight={700}>Social Links</Typography>
              <Box sx={{ width: '100%' }}>
                {!editMode && socialLinks.map((link, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1, px: 3 }}>
                    <MuiLink 
                    href={link.url} target="_blank" rel="noopener" underline="hover"
                    fontSize={20} sx={{color: 'card.contrastText'}}>
                      {link.label}
                    </MuiLink>
                    {editMode && (
                      <IconButton size="small" onClick={() => handleRemoveLink(idx)}>
                        <span>&times;</span>
                      </IconButton>
                    )}
                  </Box>
                ))}
                  {editMode && (
                    <Box sx={{ display: 'flex', flexDirection:"column", gap: 1, mt: 1 }}>
                      <TextField
                        label="Facebook"
                        value={socialMediaLinks.facebook}
                        onChange={e => setSocialMediaLinks({
                          ...socialMediaLinks,
                          facebook: e.target.value
                        })}
                        size="small"
                        placeholder="https://facebook.com/yourprofile"
                      />
                      <TextField
                        label="Instagram"
                        value={socialMediaLinks.instagram}
                        onChange={e => setSocialMediaLinks({
                          ...socialMediaLinks,
                          instagram: e.target.value
                        })}
                        size="small"
                        placeholder="https://instagram.com/yourprofile"
                      />
                      <TextField
                        label="TikTok"
                        value={socialMediaLinks.tiktok}
                        onChange={e => setSocialMediaLinks({
                          ...socialMediaLinks,
                          tiktok: e.target.value
                        })}
                        size="small"
                        placeholder="https://tiktok.com/@yourprofile"
                      />
                      <TextField
                        label="X (Twitter)"
                        value={socialMediaLinks.twitter}
                        onChange={e => setSocialMediaLinks({
                          ...socialMediaLinks,
                          twitter: e.target.value
                        })}
                        size="small"
                        placeholder="https://x.com/yourprofile"
                      />
                      <Button 
                       variant="contained" 
                       size="medium" 
                       sx={{p: 1, borderRadius: 10}}
                       onClick={handleAddLink}
                       startIcon={<AddIcon />}
                       disabled={!Object.values(socialMediaLinks).some(url => url.trim())}
                      >
                        Add Social Links
                      </Button>
                    </Box>
                 )}
              </Box>
              <Box sx={{ mt: 2 }}>
                {editMode ? (
                  <>
                    <Button 
                    onClick={handleSave} variant="contained" size="small" startIcon={<SaveIcon />} 
                    sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button onClick={() => setEditMode(false)} size="small"
                    sx={{ mr: 1 }}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => {
                      setEditMode(true);
                      initializeSocialMediaLinks();
                    }} 
                    variant="contained" 
                    size="small" 
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* -------------------- Right: Tasks -------------------- */}
        <Card sx={{flex: 2, minHeight:600, bgcolor: 'card.main', color: 'card.contrastText'}}>
          <CardContent>
            <Typography variant="h4" fontWeight={700} fontFamily={"Montserrat"} mb={4} sx={{textAlign: 'center'}}>
              Your Tasks
            </Typography>

            <Grid container spacing={10} sx={{ justifyContent: { xs: 'center', md: 'flex-start'}}}>
              {userTasks.length === 0 && <Typography>No tasks assigned.</Typography>}
              {userTasks.map(task => (
                <Grid key={task._id}
                size={{xs: 12, lg: 6}} 
                sx={{ display: 'flex', justifyContent: 'center' }}>
                  <div>
                    <span className='text-2xl font-bold block'>{task.name}</span>
                    <span className='text-md block'>Status: {task.status}</span>
                    <span className='text-md block'>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                    <span className='text-md block'>Category: {task.category}</span>
                  </div>
                </Grid>
              ))}
            </Grid>

            {/* <List>
              {userTasks.length === 0 && <Typography>No tasks assigned.</Typography>}
              {userTasks.map(task => (
                <ListItem key={task._id} disableGutters>
                  <Box>
                    <Typography fontSize={18} fontWeight={700}>{task.name}</Typography>
                    <span>Status: {task.status}</span>
                    <br />
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                    <br />
                    <span>Category: {task.category}</span>
                  </Box>
                </ListItem>
              ))}
            </List> */}
          </CardContent>
        </Card>
    </Box>
  </Box>
  )
}

export default Profile