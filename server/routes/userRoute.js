import express from 'express'
import {addUsers, isAuth, logout, getUserList, updateUserInfo, uploadPicture, getTasksForUser} from '../controller/userController.js'
import authUser from '../middleware/authUser.js'
import multer from 'multer';
import path from 'path';

// Use /tmp directory for Render's ephemeral filesystem
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/');
  },
  filename: (req, file, cb) => {
    // Get extension from original name
    const ext = path.extname(file.originalname);
    // Use random string + extension
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
  }
});

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