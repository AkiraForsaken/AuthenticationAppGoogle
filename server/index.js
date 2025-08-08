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

const allowedOrigins = [
  'http://localhost:5173'
];

app.use(express.json());
app.use(cookieParser());
// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
// }));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1){
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.get('/', (req, res) => res.send('API is working'));

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