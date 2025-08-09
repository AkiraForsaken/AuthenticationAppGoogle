import connectDB from './config/db.js'
import express from 'express'
import cors from 'cors'
import path from 'path'
import process from 'process'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import authRouter from './routes/authRoute.js'
import userRouter from './routes/userRoute.js'
import taskRouter from './routes/taskRoute.js'
import notificationRouter from './routes/notificationRoute.js'
// const authRouter = require('./routes/authRoute.js'); if use module.exports

const app = express();
const port = process.env.PORT || 5000;

await connectDB();

// More flexible CORS configuration - allow all Vercel domains
const allowedOrigins = [
  'http://localhost:5173',
  'https://authentication-app-google.vercel.app',
  'https://authentication-app-google.vercel.app/',
  'https://authentication-app-google-7k0p28xef-akirasejis-projects.vercel.app',
  'https://authentication-app-google-7k0p28xef-akirasejis-projects.vercel.app/',
  'https://authentication-app-google-qgzjbf0ed-akirasejis-projects.vercel.app',
  'https://authentication-app-google-qgzjbf0ed-akirasejis-projects.vercel.app/' 
];

app.use(express.json());
app.use(cookieParser());

// Updated CORS configuration - allow all Vercel subdomains
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Health check endpoint
/* app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}); */

// CORS test endpoint
/* app.get('/api/cors-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
}); */

// Auth test endpoint
/* app.get('/api/auth-test', (req, res) => {
  const token = req.cookies.token;
  res.json({ 
    success: true, 
    message: 'Auth test endpoint',
    hasToken: !!token,
    cookies: req.cookies,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
}); */

// Test endpoint for Render deployment
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running on Render',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/notifications', notificationRouter);

//  ---------------------------- Deployment -------------------------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname1, '/frontend/build')));

  app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  })
} else {
  app.get('/', (req, res)=>{
    res.send("API is running successfully")
  })
}

//  ---------------------------- Deployment -------------------------------

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

app.listen(port, ()=>{
  console.log(`Server is runnning on localhost:${port}`)
});

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => app.listen(5000, () => console.log('Server running')))
//   .catch(err => console.error(err));