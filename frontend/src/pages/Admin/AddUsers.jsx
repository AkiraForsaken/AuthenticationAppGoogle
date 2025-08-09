import React, { useState } from 'react'
import {Card, CardContent, MenuItem, TextField, Typography, Box, Button, Avatar} from '@mui/material'
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import * as Yup from 'yup'

const roles = ['student', 'admin'];

const AddUsers = () => {
  const {axios} = useAppContext();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '',
    phoneNumber: '',
    birthDate: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .required('Name is required'),
    role: Yup.string()
      .oneOf(roles, 'Please select a valid role')
      .required('Role is required'),
    phoneNumber: Yup.string()
      .matches(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
      .nullable(),
    birthDate: Yup.date()
      .max(new Date(), 'Birth date cannot be in the future')
      .nullable()
  });

  const validateForm = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const newErrors = {};
      validationErrors.inner.forEach(error => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const isValid = await validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      let res;
      
      // If a file is selected, use the route with picture upload
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('picture', selectedFile);
        uploadFormData.append('email', formData.email);
        uploadFormData.append('name', formData.name);
        uploadFormData.append('role', formData.role);
        if (formData.phoneNumber) {
          uploadFormData.append('phoneNumber', formData.phoneNumber);
        }
        if (formData.birthDate) {
          uploadFormData.append('birthDate', formData.birthDate);
        }
        
        res = await axios.post('/api/users/add-with-picture', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // No picture, use regular route
        res = await axios.post('/api/users/add', formData);
      }
      if (res.data.success){
        toast.success(res.data.message);
        setFormData({
          email: '',
          name: '',
          role: '',
          phoneNumber: '',
          birthDate: ''
        });
        setSelectedFile(null);
        setPreviewUrl(res.data.user?.picture || '');
        setErrors({});
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user (error)") 
    }
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Card sx={{p: 2, color: 'card.contrastText', bgcolor: 'card.main'}}>
        <CardContent>
          <Typography variant="h4" fontWeight={700} mb={2} sx={{textAlign: 'center' }}>
            Add New User
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label='Email'
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              margin='normal'
              type='email'
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label='Name'
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              margin='normal'
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label='Phone Number'
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
            />
            <TextField
              label='Birth Date'
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              fullWidth
              margin='normal'
              type='date'
              slotProps={{
                inputLabel: {
                  shrink: true,
                }
              }}
              error={!!errors.birthDate}
              helperText={errors.birthDate}
            />
            
            {/* Picture Upload Section */}
            <Box 
            sx={{ my: 2, display: 'flex', flexDirection: 'row', alignItems: 'start', gap: 2 }}>
              {previewUrl && (
                <Avatar 
                  src={previewUrl} 
                  alt="Preview" 
                  sx={{ width: 100, height: 100, mb: 1 }}
                />
              )}
              <Box 
              sx={{ mt: 2, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Button
                component="label"
                variant="contained"
                fullWidth
                sx={{ p: 2, maxWidth: '50%', textAlign: 'center'}}
              >
                {selectedFile ? selectedFile.name : 'Upload Profile Picture'}
                <input 
                  type="file" 
                  accept="image/*" 
                  hidden 
                  onChange={handleFileChange}
                />
              </Button>
              {selectedFile && (
                <Button 
                  variant="text" 
                  color="error" 
                  size="small"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                >
                  Remove Picture
                </Button>
              )}
              </Box>
            </Box>

            <TextField
              label='Role'
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              required
              margin='normal'
              select
              error={!!errors.role}
              helperText={errors.role}
            >
              {roles.map(r => <MenuItem key={r} value={r}> {r.toUpperCase()} </MenuItem>)}
            </TextField>

            <Box mt={2}>
              <Button 
                type='submit' 
                variant='contained' 
                fullWidth 
                sx={{ p: 2 }}
                disabled={isSubmitting}
              >
                <span className='text-xl'> 
                  {isSubmitting ? 'Adding User...' : 'Add User'} 
                </span>
              </Button>
            </Box>         
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AddUsers