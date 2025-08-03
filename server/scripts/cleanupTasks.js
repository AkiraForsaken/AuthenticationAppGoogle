import Task from '../models/Task.js';
import User from '../models/User.js';
import 'dotenv/config.js';
import connectDB from '../config/db.js';

async function cleanupTasks() {
    await connectDB();
    const now = new Date();

    // Set status to "due" for overdue, not completed tasks
    await Task.updateMany(
        { deadline: { $lt: now }, status: { $nin: ['completed', 'due'] } },
        { $set: { status: 'due' } }
    );

    // Find and delete completed tasks past deadline
    const completedTasks = await Task.find({ deadline: { $lt: now }, status: 'completed' });
    for (const task of completedTasks) {
        await User.updateOne({ _id: task.assignedTo }, { $pull: { tasks: task._id } });
        await Task.deleteOne({ _id: task._id });
    }

    console.log('Cleanup complete');
    process.exit(0);
}

cleanupTasks();