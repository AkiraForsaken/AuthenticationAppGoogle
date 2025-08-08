import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controller/notificationController.js'
import authUser from '../middleware/authUser.js';

const notificationRouter = express.Router();

notificationRouter.get('/get', authUser, getNotifications);
notificationRouter.patch('/mark-read/:id', authUser, markAsRead);
notificationRouter.patch('/mark-all-read', authUser, markAllAsRead);

export default notificationRouter;