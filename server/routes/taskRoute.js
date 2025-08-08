import express from 'express'
import { addTask, getTasks, updateTaskStatus, uploadProof } from '../controller/taskController.js';
import authUser from '../middleware/authUser.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Get extension from original name
    const ext = path.extname(file.originalname);
    // Use random string + extension
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});
// const upload = multer({dest: 'uploads/'})
// const upload = multer({ storage });
const upload = multer({
  storage,
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