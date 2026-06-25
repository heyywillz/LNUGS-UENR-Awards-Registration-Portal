const pool = require('./db');

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS nominations (
        id               SERIAL PRIMARY KEY,
        full_name        VARCHAR(255)  NOT NULL,
        category         VARCHAR(255)  NOT NULL,
        category_group   VARCHAR(255)  NOT NULL,
        bio              TEXT,
        mobile           VARCHAR(20)   NOT NULL,
        email            VARCHAR(255)  NOT NULL,
        photo_url        VARCHAR(500),
        submitted_at     TIMESTAMPTZ   DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id             SERIAL PRIMARY KEY,
        username       VARCHAR(100) UNIQUE NOT NULL,
        password_hash  TEXT NOT NULL
      );
    `);

    console.log('Database tables created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
