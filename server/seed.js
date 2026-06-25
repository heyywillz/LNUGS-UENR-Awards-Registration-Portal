const bcrypt = require('bcrypt');
const pool = require('./db');

async function seedAdmin() {
  const client = await pool.connect();
  try {
    const username = 'admin';
    const password = 'lnugs2026';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await client.query(
      `INSERT INTO admins (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username)
       DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [username, passwordHash]
    );

    console.log('Admin user seeded successfully.');
    console.log('  Username: admin');
    console.log('  Password: lnugs2026');
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAdmin();
