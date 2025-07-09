import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import fineRoutes from './routes/fines.js';
import userRoutes from './routes/users.js';
import paymentRoutes from './routes/payments.js';
import disputeRoutes from './routes/disputes.js';
import vehicleRoutes from './routes/vehicles.js';
import stripeRoutes from './routes/stripe.js';
import violationRoutes from './routes/violations.js';
import emissionRoutes from './routes/emissions.js';
import notificationRoutes from './routes/notifications.js';
import pointsRoutes from './routes/points.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://trafficlk.vercel.app/',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('MONGODB_URI environment variable is not set');
      console.log('Please set up a MongoDB Atlas cluster and add the connection string to your .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoURI, {
    });
    
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Make sure your MongoDB Atlas cluster is running and the connection string is correct');
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/emissions', emissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/points', pointsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    database: dbStatus,
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server only after database connection is established
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Only start listening after successful database connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();