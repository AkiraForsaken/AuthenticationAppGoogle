import User from '../models/User.js'
import cloudinary from '../config/cloudinary.js';
import fs from 'fs'
import { upload } from '../config/multer.js';


// Add new users (admin / students): /api/users/add
export const addUsers = async (req, res)=>{
    try {
        const {email, name, role, picture, phoneNumber, birthDate} = req.body;
        if (!name || !email || !role){
            return res.json({success:false, message: "Missing details"})
        }

        const existing = await User.findOne({email});
        if (existing){
            return res.json({success:false, message: "User already exists!"});
        }

        const userData = {
            name, 
            email, 
            role, 
            status: 'invited'
        };

        // Add optional fields if provided
        if (phoneNumber) userData.phoneNumber = phoneNumber;
        if (birthDate) userData.birthDate = new Date(birthDate);
        
        // Handle picture upload if file is provided
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'profile_pictures',
                public_id: `${email}_${Date.now()}`,
                overwrite: true,
                resource_type: 'image'
            });
            userData.picture = result.secure_url;
            fs.unlink(req.file.path, () => {});
        } else if (picture) {
            userData.picture = picture;
        }

        const user = await User.create(userData);

        return res.json({success: true, message: "User added successfully", user});
    } catch (error) {
        res.status(401).json({success: false, message: "Error in addUsers"});
        console.log(error.message)
    }
    
}

// Check auth: /api/users/is-auth
export const isAuth = async (req, res)=>{
    try {
        // req.userId is set by authUser middleware
        const user = await User.findById(req.userId);
        if (!user){
            return res.json({success: false, message: "User not found"});
        }
        return res.json({success: true, message: "Found user (isAuth)", user});
    } catch (error) {
        res.status(401).json({ success: false, message: "Error in isAuth" });
        console.log(error.message)
    }
}

// Logout: /api/users/logout
export const logout = async (req, res)=>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({success: true, message: 'Logged out successfully'});
    } catch (error){
        res.status(401).json({ success: false, message: "Error in logOut" });
        console.log(error.message)
    }
}

// Fetch user list (for assigning tasks): /api/users/list
export const getUserList = async(req, res)=>{
    try {
        const users = await User.find({role: 'student'}, '-googleId -__v'); 
        // Projections: get all users but not their google Id or __v
        res.json({success: true, users});
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in getUserList" });
        console.log(error.message)
    }
}

// Update user info: /api/users/update
export const updateUserInfo = async (req, res)=>{
    try {
        const { name, socialLinks, phoneNumber, birthDate } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({success: false, message: "No user found"});
        }
        if (name) {
            user.name = name;
        }
        if (socialLinks) {
            user.socialLinks = socialLinks;
        }
        if (phoneNumber !== undefined) {
            user.phoneNumber = phoneNumber;
        }
        if (birthDate) {
            user.birthDate = new Date(birthDate);
        }
        await user.save();
        res.json({success: true, user, message: "Update information successfully"})
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in updateUserInfo" });
        console.log(error.message)
    }
}

// Get tasks for a specific user (admin only): /api/users/:id/tasks
export const getTasksForUser = async (req, res) => {
    try {
        const admin = await User.findById(req.userId);
        if (!admin || admin.role !== 'admin'){
            return res.status(403).json({success: false, message: "Not authorized"});
        }
        const user = await User.findById(req.params.id).populate({
            path: 'tasks',
            select: 'name instructions deadline category status proofUrl',
        })
        if (!user){
            return res.status(404).json({success: false, message: "User not found"});
        }
        res.json({success: true, tasks: user.tasks})
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in getTasksForUser" });
        console.log(error.message)
    }
}

// Upload picture file: /api/users/upload-picture
export const uploadPicture = async (req, res)=>{
    try {
        const user = await User.findById(req.userId);
        if (!user){
            return res.status(404).json({ success: false, message: "User not found"})
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        // Implement uploading picture to cloudinary and saving the image to the user on mongoDB database here
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile_pictures',
            public_id: `${user._id}_${Date.now()}`,
            overwrite: true,
            resource_type: 'image'
        });
        user.picture = result.secure_url;
        fs.unlink(req.file.path, () => {});
        await user.save();
        res.json({success: true, user, url: user.picture})
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in uploadPicture" });
        console.log(error.message)
    }
}