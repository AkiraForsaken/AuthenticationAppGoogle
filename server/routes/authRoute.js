// const express = require('express'); 
import express from 'express' // for "type": "module"
// import jwt from 'jsonwebtoken'
// const jwt = require('jsonwebtoken')
// import { OAuth2Client } from 'google-auth-library'
// const { OAuth2Client } = require('google-auth-library')
// import User from '../models/User.js'
import { googleLogin } from '../controller/authController.js'

const authRouter = express.Router()

authRouter.post('/google', googleLogin);

// module.exports = userRouter
export default authRouter;

