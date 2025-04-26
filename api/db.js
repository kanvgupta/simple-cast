/**
 * Database connection and initialization
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Initialize database tables
 */
async function initDb() {
  const client = await pool.connect();
  try {
    // Create commands table
    await client.query(`
      CREATE TABLE IF NOT EXISTS commands (
        id VARCHAR(21) PRIMARY KEY,
        title VARCHAR(255),
        raw TEXT NOT NULL,
        rpc_url TEXT,
        parsed JSONB NOT NULL,
        collection_id VARCHAR(21) NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create collections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id VARCHAR(21) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

// Initialize the database on startup
initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
}; 