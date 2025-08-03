import React, { useState } from 'react'
import {Card, CardContent, MenuItem, TextField, Typography, Box, Button} from '@mui/material'
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
const roles = ['student', 'admin'];

const AddUsers = () => {
  const {axios} = useAppContext();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [picture, setPicture] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e)=>{
    e.preventDefault();
    try {
      const res = await axios.post('/api/users/add', {email, name, role, picture});
      if (res.data.success){
        toast.success(res.data.message);
        // console.log(res.data.user);
        setEmail('');
        setName('');
        setPicture('');
        setRole('');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user (error)") 
    }
  }
  return (
    <Card>
      <CardContent>
        <Typography variant='h6' fontWeight={700} mb={2}> Add New User</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label='Email' value={email} onChange={e => setEmail(e.target.value)}
            fullWidth required margin='normal' type='email'
          />
          <TextField
            label='Name' value={name} onChange={e => setName(e.target.value)}
            fullWidth required margin='normal'
          />
          <TextField
            label='Picture URL' value={picture} onChange={e => setPicture(e.target.value)}
            fullWidth margin='normal'
          />
          <TextField
            label='Role' value={role} onChange={e => setRole(e.target.value)}
            fullWidth required margin='normal' select
          >
            {roles.map(r => <MenuItem key={r} value={r}> {r.toUpperCase ()} </MenuItem>)}
          </TextField>

          <Box mt={2}>
            <Button type='submit' variant='contained' color='primary' fullWidth>Add User</Button>
          </Box>         
        </form>
      </CardContent>
    </Card>
  )
}

export default AddUsers