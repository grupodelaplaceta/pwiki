import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

console.log('Testing connection to:', connectionString ? 'URL Found' : 'URL MISSING');

if (!connectionString) {
  console.error('No connection string found in environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0].now);
    
    const tableRes = await client.query("SELECT to_regclass('public.articles')");
    console.log('Articles table exists:', tableRes.rows[0].to_regclass);

    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

testConnection();
