import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle ESM/CJS interop for pg
const { Pool } = pg;

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('Starting server...');
  console.log('DATABASE_URL present:', !!(process.env.DATABASE_URL || process.env.POSTGRES_URL));

  // Database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Initialize database
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully');
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
    client.release();
  } catch (err) {
    console.error('Database initialization error:', err);
  }

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/articles', async (req, res) => {
    try {
      const result = await pool.query('SELECT data FROM articles');
      const articles = result.rows.map(row => row.data);
      console.log(`Fetched ${articles.length} articles from DB`);
      res.json(articles);
    } catch (err) {
      console.error('Error fetching articles:', err);
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  });

  app.post('/api/articles', async (req, res) => {
    const articles = req.body;
    if (!Array.isArray(articles)) {
      return res.status(400).json({ error: 'Body must be an array of articles' });
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const article of articles) {
          const result = await client.query(
            `INSERT INTO articles (id, data, updated_at) 
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP
             RETURNING id`,
            [article.id, article]
          );
          
          // Log the change
          await client.query(
            'INSERT INTO audit_logs (article_id, action, details) VALUES ($1, $2, $3)',
            [article.id, 'SAVE', { title: article.title }]
          );
        }
        await client.query('COMMIT');
        res.json({ success: true });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error saving articles:', err);
      res.status(500).json({ error: 'Failed to save articles' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
