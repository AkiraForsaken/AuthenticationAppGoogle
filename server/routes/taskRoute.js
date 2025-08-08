import express from 'express'
import { addTask, getTasks, updateTaskStatus, uploadProof } from '../controller/taskController.js';
import authUser from '../middleware/authUser.js';
import multer from 'multer';
import path from 'path';

// Use memory storage instead of disk storage for serverless compatibility
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

const taskRouter = express.Router();

taskRouter.post('/add', authUser, addTask);
taskRouter.post('/upload-proof/:id', authUser, upload.single('proof'), uploadProof);
// taskRouter.get('/get-all', authUser, getUserTasks);
taskRouter.get('/get', authUser, getTasks);
taskRouter.patch('/update/:id', authUser, updateTaskStatus);

export default taskRouter;