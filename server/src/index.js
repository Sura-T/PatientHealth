// 1. Import necessary modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js'; // Import the refactored database connection
import authRoutes from './routes/authRoutes.js'; // Import auth routes
import patientRoutes from './routes/patientRoutes.js'; // Import patient routes
import doctorRoutes from './routes/doctorRoutes.js'; // Import doctor routes
import messageRoutes from './routes/messageRoutes.js'; // Import message routes
import userRoutes from './routes/userRoutes.js'; // Import user routes
import notificationRoutes from './routes/notificationRoutes.js'; // Import notification routes
import appointmentRoutes from './routes/appointmentRoutes.js'; // Import appointment routes
import utilityRoutes from './routes/utilityRoutes.js'; // Import utility routes

// 2. Load environment variables
dotenv.config();

// 3. Create an Express application instance
const app = express();

// 4. Use cors middleware
app.use(cors());

// 5. Use express.json middleware
app.use(express.json());

// 6. Define PORT
const PORT = process.env.PORT || 5000;

// Call database connection function
connectDB();

// Mount auth routes
app.use('/api/v1/auth', authRoutes);

// Mount patient routes
app.use('/api/v1/patients', patientRoutes);

// Mount doctor routes
app.use('/api/v1/doctors', doctorRoutes);

// Mount message routes
app.use('/api/v1/messages', messageRoutes);

// Mount user profile routes
app.use('/api/v1/users', userRoutes);

// Mount notification routes
app.use('/api/v1/notifications', notificationRoutes);

// Mount appointment routes
app.use('/api/v1/appointments', appointmentRoutes);

// Mount utility routes
app.use('/api/v1/utility', utilityRoutes);

// 9. Add a simple default route
app.get('/', (req, res) => res.send('API Running'));

// Handle 404 Not Found
app.use((req, res, next) => {
  res.status(404).json({
    error: 'NotFound',
    message: `The requested URL ${req.originalUrl} was not found on this server.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler caught an error:', err); // Log error for server admin

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorType = 'ServerError';
  let details = err.details || undefined;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}. Expected a valid ObjectId.`;
    errorType = 'BadRequest';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'ValidationError';
    message = 'Validation failed. Please check your input.';
    details = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
  } else if (err.code === 11000) { // Mongoose duplicate key
    statusCode = 400;
    errorType = 'DuplicateKeyError';
    const field = Object.keys(err.keyValue)[0];
    message = `The value for '${field}' (${err.keyValue[field]}) already exists. Please use a different value.`;
  }

  // Customize for production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
      message = 'An unexpected error occurred on the server.';
      errorType = 'InternalServerError'; // Keep a generic type for 500s in prod
  }

  res.status(statusCode).json({
    error: errorType,
    message: message,
    details: details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});


// 10. Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
