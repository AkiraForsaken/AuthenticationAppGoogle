import express from 'express'
import {addUsers, isAuth, logout, getUserList, updateUserInfo, uploadPicture, getTasksForUser} from '../controller/userController.js'
import authUser from '../middleware/authUser.js'
// import multer from 'multer';
import { upload } from '../config/multer.js'

// const upload = multer({dest: 'uploads/'});  // configure to upload profile picture
const userRouter = express.Router();

userRouter.post('/add', addUsers);
userRouter.post('/add-with-picture', upload.single('picture'), addUsers); // same controller but if files are attached
userRouter.post('/upload-picture', authUser, upload.single('picture'), uploadPicture)
userRouter.get('/is-auth', authUser, isAuth);
userRouter.get('/logout', logout);
userRouter.get('/list', authUser, getUserList);
userRouter.get('/:id/tasks', authUser, getTasksForUser);
userRouter.patch('/update', authUser, updateUserInfo);

export default userRouter