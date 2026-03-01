import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

let isInitialized = false;

async function initDb(client: pg.PoolClient) {
  if (isInitialized) return;
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        article_id TEXT,
        action TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        details JSONB
      );
    `);
    isInitialized = true;
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await pool.connect();
    try {
      await initDb(client);

      if (req.method === 'GET') {
        const result = await client.query('SELECT data FROM articles');
        const articles = result.rows.map(row => row.data);
        res.status(200).json(articles);
      } else if (req.method === 'POST') {
        const articles = req.body;
        if (!Array.isArray(articles)) {
          res.status(400).json({ error: 'Body must be an array of articles' });
          return;
        }

        await client.query('BEGIN');
        try {
          for (const article of articles) {
            await client.query(
              `INSERT INTO articles (id, data, updated_at) 
               VALUES ($1, $2, CURRENT_TIMESTAMP)
               ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
              [article.id, article]
            );
            
            await client.query(
              'INSERT INTO audit_logs (article_id, action, details) VALUES ($1, $2, $3)',
              [article.id, 'SAVE', { title: article.title }]
            );
          }
          await client.query('COMMIT');
          res.status(200).json({ success: true });
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      } else {
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('API Error:', err);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: err.message,
      code: err.code 
    });
  }
}
