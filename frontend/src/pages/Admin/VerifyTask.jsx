import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { Card, CardContent, Typography, Box, Button, List, ListItem, ListItemText, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent } from '@mui/material'
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast'

// Helper to get all tasks of all users. (result is object with userIds as keys and values are objects containing the user and tasksByDate objects which has dates as keys and values is an array of tasks objects)
/* function groupTasksByUserAndDate(tasks, userList) {
  // Returns { userId: { user, tasksByDate: {dateString: [tasks]} } }
  const result = {};
  // add each user into the result object
  userList.forEach(user => {
    result[user._id] = { user, tasksByDate: {} };
  });
  // Find the user for each task and add them into the tasksByDate object of the correct student
  tasks.forEach(task => {
    // Checks for user
    const userId = task.assignedTo?._id || task.assignedTo;
    if (!result[userId]) {
      return;
    }
    // Checks the date of the task
    const dateStr = new Date(task.deadline).toLocaleDateString();
    if (!result[userId].tasksByDate[dateStr]) {
      result[userId].tasksByDate[dateStr] = []; // creates new array if there isnt an array for tasks already.
    }
    result[userId].tasksByDate[dateStr].push(task);
  });
  return result;
} */

const VerifyTask = () => {
  const { userList, axios } = useAppContext();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleProofId, setVisibleProofId] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');

  const handleImageModalOpen = (url) => {
    setModalImageUrl(url);
    setImageModalOpen(true);
  };
  const handleImageModalClose = () => {
    setImageModalOpen(false);
    setModalImageUrl('');
  };

  const fetchUserTasks = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/users/${userId}/tasks`);
      if (res.data.success) {
        setUserTasks(res.data.tasks);
      } else {
        setUserTasks([]);
        toast.error(res.data.message);
      }
    } catch (error) {
      setUserTasks([]);
      toast.error(error.message);
    }
    setLoading(false);
  }

  // Fetch user's task when selecting a user (in the select element the value is set as the userId)
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    setUserTasks([]);
    if (userId) {
      fetchUserTasks(userId);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      const res = await axios.patch(`/api/tasks/update/${taskId}`, { status: newStatus });
      if (res.data.success) {
        toast.success('Task status updated!');
        // Optionally: refetch allTasks here
        fetchUserTasks(selectedUserId); // Refresh tasks
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
    setUpdatingTaskId(null);
  };

  // const grouped = groupTasksByUserAndDate(allTasks, userList);
  // const selectedUser = grouped[selectedUserId];

  // Group tasks by date for display: an hash map type object with dates as keys and tasks as values
  const tasksByDate = userTasks.reduce((acc, task) => {
    const dateStr = new Date(task.deadline).toLocaleDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(task);
    return acc;
  }, {});
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4}}>
      <Card sx={{p: 2, color: 'card.contrastText', bgcolor: 'card.main'}}>
        <CardContent>
          <Typography variant="h4" fontWeight={700} mb={2} sx={{textAlign: 'center' }}>
            Verify Student Tasks
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedUserId}
              label="Select Student"
              // onChange={e => setSelectedUserId(e.target.value)}
              onChange={handleUserChange}
            >
              {userList.map(user => (
                <MenuItem 
                  key={user._id} 
                  value={user._id}
                >
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {loading && <Typography>Loading tasks...</Typography>}
          {!loading && selectedUserId && Object.keys(tasksByDate).length === 0 && (
            <Typography>No tasks for this student.</Typography>
          )}
          {!loading && selectedUserId && Object.entries(tasksByDate).map(([date, tasks]) => (
            <div key={date} className='mt-2'>
              <Typography fontSize={20} fontWeight={600}>{date}</Typography>
              <List>
                {tasks.map(task => ( // mapping each tasks for a given date
                  <ListItem key={task._id} disableGutters
                    sx={{pt: 0}}
                    secondaryAction={ 
                      <Button
                        variant="contained"
                        color={task.status === 'completed' ? 'success' : 'primary'}
                        size="small"
                        disabled={task.status === 'completed' || updatingTaskId === task._id}
                        onClick={() => handleStatusChange(task._id, 'completed')}
                      >
                        {task.status === 'completed' ? 'Completed' : 'Mark as Completed'}
                      </Button>
                    }
                  >
                    <div>
                      <Typography>{task.name}</Typography>
                      <span>Status: {task.status}</span>
                      <br />
                      <span>Category: {task.category}</span>
                      <br />
                      <span>Instructions: {task.instructions}</span>
                      {/* Proof file view */}
                      {task.proofUrl && (
                        <>
                          <br />
                          <Button
                            variant='contained'
                            size="small"
                            sx={{ my: 1, p: 0.5 }}
                            onClick={() => setVisibleProofId(visibleProofId === task._id ? null : task._id)}
                          >
                            {visibleProofId === task._id ? 'Hide Proof' : 'Show Proof'}
                          </Button>
                          {visibleProofId === task._id && (
                            <img
                              // src={`${import.meta.env.VITE_BACKEND_URL}${task.proofUrl}`}
                              src={task.proofUrl}
                              alt="Proof"
                              // style={{ maxWidth: 200, marginTop: 8, borderRadius: 8 }}
                              style={{ cursor: 'pointer', maxWidth: 200, maxHeight: 200 }}
                              className='max-w-200 mt-8 rounded-md'
                              onClick={() => handleImageModalOpen(task.proofUrl)}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </ListItem>
                ))}
              </List>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* ----------------- Image preview dialog ------------------ */}
      <Dialog open={imageModalOpen} onClose={handleImageModalClose} maxWidth="md">
        <DialogTitle>
          Image Preview
          <IconButton
            aria-label="close"
            onClick={handleImageModalClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {modalImageUrl && (
            <img src={modalImageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default VerifyTask