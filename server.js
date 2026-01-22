require('dotenv').config();
const { Client } = require('pg');
const url = require('url');

const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: {
    rejectUnauthorized: false,
  },
};

const client = new Client(config);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to the database successfully!');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

async function startServer() {
  await connectToDatabase();
  // Since no API, just log that server is running
  console.log('Server is running...');
  // Keep the process alive
  process.stdin.resume();
}

startServer();