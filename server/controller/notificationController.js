import Notification from '../models/Notification.js'

// Get user's (student) notifications: /api/notifications/get
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
          .populate('relatedTask', 'name').sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in getNotifications' });
    console.log(error.message);
  }
}

// Mark one noti as read: /api/notifications/mark-read/:id
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in markAsRead' });
    console.log(error.message);
  }
};

// Mark all notis as read: /api/notifications/mark-all-read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in markAllAsRead' });
    console.log(error.message);
  }
};