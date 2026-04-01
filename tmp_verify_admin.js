const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client('postgresql://postgres:WellnessOS2024!@127.0.0.1:5432/wellness_os');

async function verify() {
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM users WHERE email = $1', ['admin@wellnessos.com']);
    
    if (res.rows.length === 0) {
      console.log('❌ ERROR: User admin@wellnessos.com NOT FOUND in database.');
      return;
    }

    const user = res.rows[0];
    console.log('✅ User Found:', user.email);
    console.log('✅ Role:', user.role);

    const isMatch = await bcrypt.compare('EliteAdmin2026!', user.password);
    if (isMatch) {
      console.log('✅ Password Comparison: SUCCESS (Match).');
    } else {
      console.log('❌ ERROR: Password Comparison: FAILED (No mismatch).');
    }

  } catch (err) {
    console.error('❌ Connection Error:', err);
  } finally {
    await client.end();
  }
}

verify();
