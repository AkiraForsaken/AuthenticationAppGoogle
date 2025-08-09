import Task from '../models/Task.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import multer from 'multer'
import cloudinary from '../config/cloudinary.js'
import fs from 'fs'
// import path from 'path'
// import process from 'process'

// Helper to extract public_id from a Cloudinary URL
function getCloudinaryPublicId(url) {
    // Example: https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/task_proofs/abc123.jpg
    // We want: task_proofs/abc123
    try {
        const parts = url.split('/');
        const folderIndex = parts.findIndex(p => p === 'upload') + 1;
        // Remove extension
        const fileWithExt = parts.slice(folderIndex).join('/');
        const file = fileWithExt.replace(/\.[^/.]+$/, "");
        return file;
    } catch {
        return null;
    }
}

const upload = multer({dest: 'uploads/'});

// Add tasks for students: /api/tasks/add
export const addTask = async (req, res)=>{
    try {
        const user = await User.findById(req.userId); 
        // Checking if the current user exists and is an admin
        if (!user || user.role !== 'admin'){
            return res.status(403).json({ success: false, message: "Not authorized (addTask)"});
        }
        const { name, instructions, deadline, category, assignedTo } = req.body;
        if (!name || !instructions || !deadline || !category || !assignedTo){
            return res.status(403).json({ success: false, message: "Missing information (addTask)"});
        }
        const task = await Task.create(
            {name, instructions, deadline, category, assignedTo, status: 'pending'}
        );
        await User.findByIdAndUpdate(assignedTo, { $push: {tasks: task._id}}); // update the user's tasks array for fetching
        await Notification.create({
            userId: assignedTo,
            title: 'New Task Assigned',
            message: `You have been assigned to a new task: ${name}`,
            type: 'task_assigned',
            relatedTask: task._id
        })
        
        res.json({ success: true, message: 'Task created', task});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Error in addTask (taskController)'});
    }
}

// Get user tasks list (on log in): /api/tasks/get
export const getTasks = async (req, res) => {
    try {
        // populate('tasks'): tells mongoose to replace each ObjectId in the tasks array with the actual Task document it references
        const user = await User.findById(req.userId).populate({
            path: 'tasks',
            select: 'name instructions deadline category status proofUrl'
        });
        if (!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // const tasks = await Task.find({assignedTo: req.userId}).sort({ deadline: 1});
        res.json({success: true, message: 'Tasks fetched successfully', tasks: user.tasks});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false, message: 'Error in getTasks (taskController)'});
    }
}

// Get all tasks: /api/tasks/get-all (Deprecated)
/* export const getUserTasks = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }
        const tasks = await Task.find({}).populate('assignedTo', 'name email');
        res.json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
} */

// Update tasks status (patch call): /api/tasks/update
export const updateTaskStatus = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }
        const { status } = req.body;
        const task = await Task.findByIdAndUpdate(req.params.id, {status}, {new: true});
        res.json({success: true, task});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error in updateTaskStatus'})
        console.log(error.message)
    }
}

// Uploading proof for tasks: /api/tasks/upload-proof/:id
export const uploadProof = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user){
            return res.status(404).json({ success: false, message: "User not found" })
        }
        const task = await Task.findById(req.params.id); // params is the /:id part
        if (!task){
            return res.status(404).json({ success: false, message: "Task not found" })
        }
        // Remove old proof from Cloudinary if exists
        if (task.proofUrl && task.proofUrl.startsWith('http')) {
            // Optionally: extract public_id and delete from Cloudinary
            const publicId = getCloudinaryPublicId(task.proofUrl);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
                } catch (err) {
                    console.log('Cloudinary destroy error:', err.message);
                }
            }
        }
        /* if (task.proofUrl){
            const oldPath = path.join(process.cwd(), task.proofUrl);
            fs.unlink(oldPath, err => {
                // Ignore error if file doesn't exist
            });
        } */
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        // Upload new proof to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'task_proofs',
            public_id: `${task._id}_${Date.now()}`,
            overwrite: true,
            resource_type: 'image'
        });
        // Remove local file
        fs.unlink(req.file.path, () => {});
        // Save Cloudinary URL
        task.proofUrl = result.secure_url;
        task.status = 'submitted';
        await task.save();
        res.json({ success: true, message: "Proof uploaded", task });
    } catch (error) {
        res.status(500).json({success: false, message: 'Error in uploadProof'})
        console.log(error.message)
    }
}

// Remove proof image: /api/tasks/remove-proof/:id
export const removeProof = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user){
            return res.status(404).json({ success: false, message: "User not found" })
        }
        const task = await Task.findById(req.params.id); // params is the /:id part
        if (!task){
            return res.status(404).json({ success: false, message: "Task not found" })
        }
        if (task.proofUrl && task.proofUrl.includes('cloudinary.com')) {
            // const oldPath = path.join(process.cwd(), task.proofUrl);
            // fs.unlink(oldPath, err => {});
            const publicId = getCloudinaryPublicId(task.proofUrl);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
                } catch (err) {
                    console.log('Cloudinary destroy error:', err.message);
                }
            }
        }
        task.proofUrl = undefined;
        task.status = 'pending';
        await task.save();
        res.json({ success: true, message: "Proof removed", task });
    } catch (error) {
        res.status(500).json({success: false, message: 'Error in removeProof'})
        console.log(error.message)
    }
}