import React, { useState } from 'react'
import { Grid, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, Button, List, ListItem, ListItemText, Box, IconButton, Collapse } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { dummyTasks } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Helper to get the start of the week (Monday)
function getStartOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - ((day === 0 ? 7 : day) - 1)
  return new Date(d.setDate(diff))
}

// Helper to get all dates in the week
function getWeekDates(baseDate) {
  const start = getStartOfWeek(baseDate)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

// Helper to get all days in a month (for calendar grid)
function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const matrix = []
  let week = []
  let dayOfWeek = firstDay.getDay() // 0 (Sun) - 6 (Sat)
  let day = 1
  // Fill first week
  for (let i = 0; i < 7; i++) {
    if (i >= dayOfWeek) week.push(new Date(year, month, day++))
  }
  matrix.push(week)
  // Fill rest
  while (day <= lastDay.getDate()) {
    week = []
    for (let i = 0; i < 7; i++) {
      if (day > lastDay.getDate()) week.push(null)
      else week.push(new Date(year, month, day++))
    }
    matrix.push(week)
  }
  return matrix
}

// Helper to group tasks
function groupTasksByWeek(tasks, weekDates) {
  // Returns an array of 7 arrays, one for each day in weekDates
  return weekDates.map(date => {
    return tasks.filter(task => {
      const d = new Date(task.deadline);
      return d.getFullYear() === date.getFullYear() &&
             d.getMonth() === date.getMonth() &&
             d.getDate() === date.getDate();
    });
  });
}

const Dashboard = () => {
  const { userTasks, axios } = useAppContext(); 
  // Week navigation state
  const [weekOffset, setWeekOffset] = useState(0)
  const today = new Date()
  // baseDate: details of today
  const baseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + weekOffset * 7)
  // weekDates: An array of all dates in a week
  const weekDates = getWeekDates(baseDate)

  // Dialog state for day card
  const [dayOpen, setDayOpen] = useState(false)
  const [selectedDayIdx, setSelectedDayIdx] = useState(null)

  // Proof dialog state
  const [proofOpen, setProofOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [proofFile, setProofFile] = useState(null)

  // Expand task to see intruction state
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  // DUMMY: For now, tasks are static per week (Updated)
  const tasks = dummyTasks;
  const tasksByDay = groupTasksByWeek(userTasks, weekDates);

  // Open dialog for day card
  const handleDayDialogOpen = (idx) => {
    setSelectedDayIdx(idx)
    setDayOpen(true)
  }
  const handleDayDialogClose = () => {
    setDayOpen(false)
    setSelectedDayIdx(null)
  }

  // Open proof dialog
  const handleProofOpen = (task) => {
    setSelectedTask(task)
    setProofOpen(true)
  }
  const handleProofClose = () => {
    setProofOpen(false)
    setSelectedTask(null)
    setProofFile(null)
  }

  // Handle proof upload (Updated)
  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile || !selectedTask){
      toast.error('No proof file or selected task');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('proof', proofFile);
      const res = await axios.post(`/api/tasks/upload-proof/${selectedTask._id}`, formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success){
        toast.success('Proof submitted success');
      } else {
        toast.error(res.data.message);
      }
      // Here you would send proofFile to backend
    } catch (error) {
      toast.error('Failed to upload proof');
    }
    handleProofClose();
  }

  // Week navigation
  const handlePrevWeek = () => setWeekOffset(weekOffset - 1)
  const handleNextWeek = () => setWeekOffset(weekOffset + 1)

  // Format date as 'Monday' (newline) '7/7/2025'
  const formatDay = (date, idx) => {
    const day = weekDays[idx]
    const d = date
    return <><span>{day}</span><br /><span>{d.getDate()}/{d.getMonth() + 1}/{d.getFullYear()}</span></>;
  }

  // Week range string
  const weekRange = `${weekDates[0].getDate()}/${weekDates[0].getMonth() + 1}/${weekDates[0].getFullYear()} - ${weekDates[6].getDate()}/${weekDates[6].getMonth() + 1}/${weekDates[6].getFullYear()}`

  // Calendar grid for current month
  const calendarYear = baseDate.getFullYear()
  const calendarMonth = baseDate.getMonth()
  const calendarMatrix = getMonthMatrix(calendarYear, calendarMonth)

  // Find current week in calendar
  const isSameDay = (d1, d2) => 
    {return d1 && d2 && 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()}
  const isInCurrentWeek = (date) => weekDates.some(wd => isSameDay(wd, date))
  const isToday = (date) => isSameDay(date, today)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 10 },
        bgcolor: '#e3f2fd', // light blue background
        minHeight: '100vh',
        py: { xs: 2, md: 8 },
        px: { xs: 1, md: 4 },
      }}
    >
      {/* ------------------- Week navigation (top on mobilem, right on pc) -------------------*/}
      <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 300 }, mb: { xs: 2, md: 0 }, order: { xs: 0, md: 1 } }}>
        <Card sx={{ p: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
              Week
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <IconButton onClick={handlePrevWeek}><ArrowBackIosNewIcon /></IconButton>
              <Typography variant="body1">{weekRange}</Typography>
              <IconButton onClick={handleNextWeek}><ArrowForwardIosIcon /></IconButton>
            </Box>
          </CardContent>
        </Card>
        {/* Mini Calendar */}
        <Card sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
            {baseDate.toLocaleString('default', { month: 'long' })} {calendarYear}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Typography key={i} variant="caption" align="center" sx={{ fontWeight: 600 }}>{d}</Typography>
            ))}
            {calendarMatrix.flat().map((date, i) => {
              const highlightWeek = isInCurrentWeek(date)
              const highlightDay = isToday(date)
              return (
                <Box
                  key={i}
                  sx={{
                    aspectRatio: '1/1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: highlightDay ? 'primary.main' : highlightWeek ? 'primary.light' : undefined,
                    color: highlightDay ? 'white' : highlightWeek ? 'primary.dark' : undefined,
                    border: highlightWeek ? '2px solid #1976d2' : undefined,
                    fontWeight: highlightDay ? 700 : 400,
                    m: 0.2,
                  }}
                >
                  {date ? date.getDate() : ''}
                </Box>
              )
            })}
          </Box>
        </Card>
      </Box>
      {/* ------------------ Left: Days (below on mobile, left on desktop) ---------------- */}
      <Box sx={{ flex: 3, width: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 6, textAlign: 'center' }}>
          Your Weekly Tasks
        </Typography>
        <Grid container spacing={3} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
          {weekDates.map((date, idx) => (
            <Grid key={idx} 
            size={{xs: 12, sm: 6, md: 12, lg: 4}}
            sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                sx={{
                  width: { xs: '100%', sm: '90%', md: '100%' },
                  minWidth: { xs: 250, md: 300 },
                  maxWidth: 400,
                  mb: 2,
                  background: isToday(date) ? '#e3f2fd' : undefined,
                  boxShadow: 3,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 8 },
                  border: isToday(date) ? '2px solid #1976d2' : undefined,
                }}
                onClick={() => handleDayDialogOpen(idx)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>{formatDay(date, idx)}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {(tasksByDay[idx] || []).length} task{(tasksByDay[idx] || []).length !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ------------------------- Dialog for day card: task list ------------------------- */}
      <Dialog open={dayOpen} onClose={handleDayDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle>{selectedDayIdx !== null ? formatDay(weekDates[selectedDayIdx], selectedDayIdx) : ''} - Tasks</DialogTitle>
        <DialogContent>
          <List>
            {(selectedDayIdx !== null && tasksByDay[selectedDayIdx]) 
            && tasksByDay[selectedDayIdx].length === 0 && 
              <Typography>No tasks for this day.</Typography>
            }

            {(selectedDayIdx !== null && tasksByDay[selectedDayIdx]) 
            && tasksByDay[selectedDayIdx].map(task => (
              <React.Fragment key={task._id}>
                <ListItem
                  className='cursor-pointer'
                  button
                  onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)} // this onclick turns the collapse element on or off depending on if its current state
                  disableGutters
                  secondaryAction={
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={e => {
                        e.stopPropagation(); // Prevent expanding when clicking button
                        handleProofOpen(task);
                      }}
                      disabled={task.status === 'completed' || !!task.proofUrl}
                    >
                      {task.status === 'completed' ? 'Completed' : 'Send Proof'}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={task.name}
                    secondary={
                      task.status === 'completed' ? 'Verified by admin' : task.status === 'pending' ? 'Awaiting proof' : ''}
                  />
                </ListItem>
                {/* Collapse component: the props "in" if true reveals the component */}
                <Collapse in={expandedTaskId === task._id} timeout="auto" unmountOnExit className='mt-4'>
                  <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {task.instructions}
                    </Typography>
                  </Box>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
          <Button onClick={handleDayDialogClose} variant="contained" color="primary" className="mt-4" fullWidth>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Proof Dialog */}
      <Dialog open={proofOpen} onClose={handleProofClose} maxWidth="xs" fullWidth>
        <DialogTitle>Send Proof for: {selectedTask?.text}</DialogTitle>
        <DialogContent>
          {/* DUMMY: No real upload, just a file input */}
          <form onSubmit={handleProofSubmit} className="flex flex-col gap-4 mt-2">
            <Button variant="contained" component="label">
              Upload Image
              <input type="file" accept="image/*" hidden onChange={e => setProofFile(e.target.files[0])} />
            </Button>
            {proofFile && <Typography>Selected: {proofFile.name}</Typography>}
            <Button type="submit" variant="contained" color="primary" disabled={!proofFile}>Submit Proof</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default Dashboard