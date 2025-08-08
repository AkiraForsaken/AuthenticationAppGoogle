import React, { useState } from 'react'
import { Card, CardContent, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box } from '@mui/material'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const categories = ['Reading', 'Listening', 'Writing', 'Speaking', 'Other']

const ManageTasks = () => {
  // Form state
  const { axios, userList } = useAppContext();
  const [taskName, setTaskName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [category, setCategory] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // DUMMY: Handle submit  (Note: No longer dummy)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/tasks/add', {
        name: taskName, instructions, deadline, category, assignedTo
      })
      if (res.data.success){
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message)
    }
    setTaskName('')
    setInstructions('')
    setDeadline(new Date())
    setCategory('')
    setAssignedTo('')
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4}}>
    <Card sx={{ p: 2, color: 'card.contrastText', bgcolor: 'card.main'}}>
      <CardContent>
        <Typography variant="h4" fontWeight={700} mb={2} sx={{textAlign: 'center' }}>
          Create New Task
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Task Name"
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Instructions"
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            fullWidth
            required
            margin="normal"
            multiline
            minRows={3}
          />
          {/* MUI element to pick out a date */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DesktopDatePicker
              label="Deadline"
              inputFormat="MM/dd/yyyy"
              value={deadline}
              onChange={setDeadline}
              textField={(params) => <TextField {...params} fullWidth margin="normal" required />}
            />
          </LocalizationProvider>
          {/* Category */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>
          {/* Assign to User */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Assign to User</InputLabel>
            <Select
              value={assignedTo}
              label="Assign to User"
              onChange={e => setAssignedTo(e.target.value)}
            >
              {userList.map(user => 
                <MenuItem key={user._id} value={user._id}>{user.name}</MenuItem>
              )}
            </Select>
          </FormControl>
          <Box mt={2}>
            <Button type="submit" variant="contained" sx={{p: 1}} fullWidth>
              <span className='text-lg'>Create Task</span>
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
    </Box>
  )
}

export default ManageTasks