import express from 'express'
import { addTask, getTasks, updateTaskStatus, uploadProof, removeProof } from '../controller/taskController.js';
import authUser from '../middleware/authUser.js';
import { upload } from '../config/multer.js'

const taskRouter = express.Router();

taskRouter.post('/add', authUser, addTask);
taskRouter.post('/upload-proof/:id', authUser, upload.single('proof'), uploadProof);
taskRouter.post('/remove-proof/:id', authUser, removeProof);
// taskRouter.get('/get-all', authUser, getUserTasks);
taskRouter.get('/get', authUser, getTasks);
taskRouter.patch('/update/:id', authUser, updateTaskStatus);

export default taskRouter;