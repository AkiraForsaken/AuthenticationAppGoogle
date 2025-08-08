import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    googleId: {type: String, sparse: true, unique: true},
    email: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    phoneNumber: {type: String},
    birthDate: {type: Date},
    picture: {type: String},
    role: {type: String, enum:['student', 'admin'], default: 'student'},
    status: {type: String, enum:['invited', 'active', 'requesting'], default: 'requesting'},
    socialLinks: [{
        label: String,
        url: String
    }],
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;