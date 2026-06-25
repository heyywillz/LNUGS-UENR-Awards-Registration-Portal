const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_kzeKvnIih09g@ep-noisy-violet-atbw89i0.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function initNeonDB() {
  try {
    // 1. Create Nominations Table
    await pool.query(`
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
    console.log('Nominations table created.');

    // 2. Create Admins Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id             SERIAL PRIMARY KEY,
        username       VARCHAR(100) UNIQUE NOT NULL,
        password_hash  TEXT NOT NULL
      );
    `);
    console.log('Admins table created.');

    // 3. Seed Admin User
    await pool.query(`
      INSERT INTO admins (username, password_hash)
      VALUES ('admin', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOexSmoMEPLbSKzC.BErBtKqZwVGtGFCy')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('Admin user seeded (admin / lnugs2026).');

  } catch (err) {
    console.error('Error initializing Neon DB:', err);
  } finally {
    await pool.end();
  }
}

initNeonDB();
