import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['task_assigned', 'task_completed', 'proof_verified'], default: 'task_assigned' },
  isRead: { type: Boolean, default: false },
  relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;