import User from "../models/User.js";
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID) // Client for google APIs

// Login with GoogleLogin: /api/auth/google
export const googleLogin = async (req, res) => {
    const {credential} = req.body;
    try {
        // Verify Google jwt
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload()

        let user = await User.findOne({ email: payload.email})
        // if (!user){
        //     user = await User.create({
        //         googleId: payload.sub,
        //         email: payload.email,
        //         name: payload.name,
        //         picture: payload.picture,
        //     })
        // }
        if (!user){
            return res.status(403).json({success:false, message: "Your email is not registered. Please contact your admin."});
        } else if (user.status !== "invited" && user.status !== 'active'){
            return res.status(403).json({success:false, message: "Your email is not active. Please contact your admin."});
        }

        user.googleId = payload.sub; // payload.sub is the unique-identifier for a user
        // user.name = payload.name;
        // if (payload.picture){
        //     user.picture = payload.picture;
        // }
        if (user.status !== 'active'){
            user.status = 'active';
        }
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            { 
                expiresIn: '7d'
            }
        )

        // res.json({success: true , token, user, message: "Login success"})
        // Set the token as a httpOnly cookie from the backend, which the isAuth call can read, verify and return for automatic login
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        res.json({success: true , user, message: "Login success"})

    } catch (error) {
        res.status(401).json({success: false, message: "Error auth controller"})
        console.log(error.message)
    }
}