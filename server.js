import express from 'express'; // Add this
import cors from 'cors';       // Add this
import 'dotenv/config';
import sequelize from './config/database.js';

const app = express();
if (!process.env.PORT) {
  console.error("Set the PORT in .env")
  process.exit(1);
}
const PORT = process.env.PORT; // Define your port

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database successfully!');

    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    app.get('/api', (req, res) => {
      res.send({ status: 'Backend is reachable!' });
    });
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

startServer();