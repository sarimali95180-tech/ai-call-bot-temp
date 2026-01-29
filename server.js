import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import sequelize from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import callsRoutes from './routes/callsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './utils/responseHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to the database successfully!');
  } catch (err) {
    console.error('✗ Database connection error:', err.message);
    process.exit(1);
  }
}

async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`✓ Server is running on http://localhost:${PORT}`);
  });
}

startServer();
