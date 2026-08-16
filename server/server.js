import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routers
import authRouter from './routes/auth.js';
import childrenRouter from './routes/children.js';
import teachersRouter from './routes/teachers.js';
import activitiesRouter from './routes/activities.js';
import bookingsRouter from './routes/bookings.js';
import homeworkRouter from './routes/homework.js';
import paymentsRouter from './routes/payments.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// API Routes mounting
app.use('/api/auth', authRouter);
app.use('/api/children', childrenRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/homework', homeworkRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/notifications', notificationsRouter);

// Base path health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TutorConnect API is running',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Database and API health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: dbStatus
  });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tutorconnect';

console.log('Connecting to database...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connection established successfully.');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });
