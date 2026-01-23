import 'dotenv/config';
import sequelize from './config/database.js';

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
  console.log('Server is running...');
  process.stdin.resume();
}

startServer();