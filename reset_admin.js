const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_kzeKvnIih09g@ep-noisy-violet-atbw89i0.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function resetAdmin() {
  try {
    const rawPassword = 'lnugs2026';
    const saltRounds = 10;
    const hash = await bcrypt.hash(rawPassword, saltRounds);
    
    // Check if admin exists
    const res = await pool.query('SELECT * FROM admins WHERE username = $1', ['admin']);
    
    if (res.rows.length > 0) {
      await pool.query('UPDATE admins SET password_hash = $1 WHERE username = $2', [hash, 'admin']);
      console.log('Admin password updated successfully.');
    } else {
      await pool.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', ['admin', hash]);
      console.log('Admin user created successfully.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

resetAdmin();
