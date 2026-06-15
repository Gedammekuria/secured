import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ WARNING: DATABASE_URL is not set. Database operations will fail until you provide a connection string in the .env file.');
}

// Neon Postgres requires SSL connections.
// In Node.js, we must specify ssl: { rejectUnauthorized: false } or ssl: true
const isNeon = connectionString && connectionString.includes('neon.tech');

const pool = new Pool({
  connectionString,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export default pool;
