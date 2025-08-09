import React, { useEffect, useState } from 'react'
import { Grid, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, Button, List, ListItem, ListItemText, Box, IconButton, Collapse } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import DialogActions from '@mui/material/DialogActions'
import CloseIcon from '@mui/icons-material/Close'
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
  const { userTasks, axios, darkMode, fetchTasks } = useAppContext(); 
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
  const [proofChanged, setProofChanged] = useState(false);

  // Expand task to see intruction state
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  // Proof image preview state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);

  // DUMMY: For now, tasks are static per week (Updated)
  // const tasks = dummyTasks;
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

  // Handle file selection and preview
  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    setProofFile(file);
    if (file) {
      setProofPreviewUrl(URL.createObjectURL(file));
    } else {
      setProofPreviewUrl(null);
    }
  };

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
        setProofChanged(true);
      } else {
        toast.error(res.data.message);
      }
      // Here you would send proofFile to backend
    } catch (error) {
      toast.error('Failed to upload proof');
    }
    handleProofClose();
  }

  const handleRemoveProof = async () => {
    if (!selectedTask) return;
    try {
      const res = await axios.post(`/api/tasks/remove-proof/${selectedTask._id}`);
      if (res.data.success) {
        toast.success('Proof removed');
        setProofChanged(true); // trigger refresh
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error('Failed to remove proof');
    }
    handleProofClose();
  };

  // Open image modal
  const handleImageModalOpen = (url) => {
    setModalImageUrl(url);
    setImageModalOpen(true);
  };
  const handleImageModalClose = () => {
    setImageModalOpen(false);
    setModalImageUrl('');
  };

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

  useEffect(()=>{
    if (proofChanged){
      fetchTasks();
      setProofChanged(false);
    }
  }, [proofChanged, fetchTasks])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 10 },
        bgcolor: 'mainBg.main', 
        minHeight: '100vh',
        py: { xs: 2, md: 8 },
        px: { xs: 1, md: 4 },
      }}
    >
      {/* ------------------- Week navigation (top on mobilem, right on pc) -------------------*/}
      <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 300 }, mb: { xs: 2, md: 0 }, order: { xs: 0, md: 1 }}}>
        <Card 
        sx={{ p: 2, mb: 2, bgcolor: 'card.main' }}
        >
          <CardContent 
          sx={{color: 'card.contrastText'}}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center'}}>
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
        <Card 
        sx={{ p: 2, bgcolor: 'card.main', color: 'card.contrastText'}}
        >
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3, textAlign: 'center' }}>
            {baseDate.toLocaleString('default', { month: 'long' })} {calendarYear}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Typography key={i} variant="body1" align="center" sx={{ fontWeight: 600 }}>{d}</Typography>
            ))}
            {calendarMatrix.flat().map((date, i) => {
              const highlightWeek = isInCurrentWeek(date);
              const highlightDay = isToday(date);
              return (
                <Box
                  key={i}
                  sx={{
                    aspectRatio: '1/1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: 
                      highlightDay ? 'primary.dark' : 
                      highlightWeek ? 'primary.light' : undefined,
                    color: 
                      highlightDay ? 'white' : 
                      highlightWeek ? 'card.highlightText' : undefined,
                    border: 
                      highlightDay ? `2px solid ${darkMode ? '#ffbbd7ff' : '#c69afeff'}`: 
                      highlightWeek ? `2px solid ${darkMode ? '#0c6d85ff' : '#ffaef3ff'}`: undefined,
                    fontWeight: highlightDay ? 700 : 500,
                    m: 0.4,
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
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 6, textAlign: 'center', color: 'mainBg.contrastText' }}>
          Your Weekly Tasks
        </Typography>
        <Grid container spacing={3} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
          {weekDates.map((date, idx) => (
            <Grid key={idx} 
            size={{xs: 12, md: 6, lg: 4}}
            sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                sx={{
                  width: { xs: '100%', sm: '90%', md: '100%' },
                  minWidth: { xs: 250, md: 300 },
                  maxWidth: 400,
                  mb: 2,
                  boxShadow: 3,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 8 },
                  color: !isToday(date) ? 'card.contrastText' : 'card.highlightText',
                  bgcolor: !isToday(date) ? 'card.main' : 'card.secondary',
                  border: isToday(date) ? `2px solid ${darkMode ? '#fff' : '#000000ff'}` : 'none',
                }}
                onClick={() => handleDayDialogOpen(idx)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>{formatDay(date, idx)}</Typography>
                  <Typography fontSize={22} fontWeight={500} color={(tasksByDay[idx] || []).length >= 1 ? 'card.highlightText' : 'text.secondary'} sx={{ textAlign: 'center' }}>
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
                  sx={{p: 2}}
                  onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)} // this onclick turns the collapse element on or off depending on if its current state
                  disableGutters
                  secondaryAction={
                    task.status === 'completed' ? (
                      <Button
                        variant="contained"
                        size="small"
                        disabled
                        sx={{ mr: 2 }}
                      >
                        Completed
                      </Button>
                    ) : task.proofUrl ? (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setProofOpen(true); // Open proof dialog to show/remove proof
                        }}
                        sx={{ mr: 2 }}
                      >
                        Remove Proof
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          handleProofOpen(task);
                        }}
                        sx={{ mr: 2 }}
                      >
                        Send Proof
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={task.name}
                    secondary={
                      task.status === 'completed' ? 'Verified by admin' : task.status === 'pending' ? 'Awaiting proof' : ''}
                  />
                </ListItem>
                {/* Collapse component: the props "in" if true reveals the component */}
                <Collapse in={expandedTaskId === task._id} timeout="auto" unmountOnExit sx={{mt: 2}}>
                  <div className='pl-4 pr-2 pb-2'>
                    <Typography variant="body2" color="text.secondary">
                      {task.instructions}
                    </Typography>
                  </div>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
          <Button onClick={handleDayDialogClose} variant="contained" color="primary" sx={{mt: 2, p: 2}} fullWidth>Close</Button>
        </DialogContent>
      </Dialog>

      {/* ---------------------------------- Proof Dialog ---------------------------------- */}
      <Dialog open={proofOpen} onClose={handleProofClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          {selectedTask?.proofUrl ? 'Proof for: ' : 'Send Proof for: '} {selectedTask?.name}
        </DialogTitle>
        {selectedTask?.proofUrl ? (
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={selectedTask.proofUrl}
              alt="Proof"
              style={{ maxWidth: '100%', maxHeight: 300, cursor: 'pointer', borderRadius: 8 }}
              onClick={() => handleImageModalOpen(selectedTask.proofUrl)}
            />
            <Button
              variant="contained"
              color="error"
              sx={{ mt: 2 }}
              onClick={handleRemoveProof}
              fullWidth
            >
              Remove Proof
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleProofSubmit} className="flex flex-col gap-4 mt-2">
            <Button variant="contained" component="label">
              Upload Image
              <input type="file" accept="image/*" hidden onChange={handleProofFileChange} />
            </Button>
            {proofPreviewUrl && (
              <img
                src={proofPreviewUrl}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, marginTop: 8, cursor: 'pointer' }}
                onClick={() => handleImageModalOpen(proofPreviewUrl)}
              />
            )}
            {proofFile && <Typography>Selected: {proofFile.name}</Typography>}
            <Button type="submit" variant="contained" color="primary" disabled={!proofFile}>Submit Proof</Button>
          </form>
        )}
      </Dialog>
      {/* Image Modal */}
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
          <img src={modalImageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default Dashboard