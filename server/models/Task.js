import mongoose, { mongo } from "mongoose";
const taskSchema = new mongoose.Schema({
    // taskId: {type: String, required: true},
    name: {type: String, required: true},
    instructions: {type: String, required: true},
    deadline: {type: Date, required: true},
    category: {type: String, required: true},
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    status: { type: String, enum: ['pending', 'submitted', 'completed', 'due'], default: 'pending' },
    proofUrl: String, // for proof image
}, {timestamps: true})
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task;