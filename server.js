import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import sequelize from './config/database.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database successfully!');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
